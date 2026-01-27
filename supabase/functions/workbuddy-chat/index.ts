import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.user.id;

    // Get user's workplace
    const { data: profile } = await supabase
      .from("profiles")
      .select("workplace_id")
      .eq("id", userId)
      .single();

    if (!profile?.workplace_id) {
      return new Response(JSON.stringify({ error: "No workplace assigned" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const workplaceId = profile.workplace_id;

    // Get workplace data for context
    const { data: workplace } = await supabase
      .from("workplaces")
      .select("*")
      .eq("id", workplaceId)
      .single();

    const { data: routines } = await supabase
      .from("routines")
      .select("title, content, category")
      .eq("workplace_id", workplaceId);

    const { data: importantTimes } = await supabase
      .from("important_times")
      .select("time_value, description")
      .eq("workplace_id", workplaceId)
      .order("sort_order");

    const { data: contacts } = await supabase
      .from("contacts")
      .select("name, role, phone, email, is_emergency")
      .eq("workplace_id", workplaceId);

    const { data: schedules } = await supabase
      .from("schedules")
      .select("*")
      .eq("workplace_id", workplaceId)
      .gte("shift_date", new Date().toISOString().split("T")[0]);

    // Build system prompt with workplace context
    const systemPrompt = `Du är WorkBuddy, en hjälpsam digital kollega för arbetsplatsen "${workplace?.name}" (${workplace?.company_name}).

ARBETSPLATSINFO:
- Typ: ${workplace?.workplace_type || "Okänd"}
- Bransch: ${workplace?.industry || "Okänd"}
${workplace?.settings ? `- Inställningar: Timlön ${workplace.settings.hourly_rate} kr, OB-tillägg ${workplace.settings.ob_rate} kr/h, Max ${workplace.settings.max_hours_per_week}h/vecka, Vila ${workplace.settings.min_rest_hours}h mellan pass` : ""}

RUTINER:
${routines?.map(r => `### ${r.title}\n${r.content}`).join("\n\n") || "Inga rutiner registrerade."}

VIKTIGA TIDER:
${importantTimes?.map(t => `- ${t.time_value}: ${t.description}`).join("\n") || "Inga tider registrerade."}

KONTAKTER:
${contacts?.map(c => `- ${c.name} (${c.role}): ${c.phone || c.email}${c.is_emergency ? " [AKUT]" : ""}`).join("\n") || "Inga kontakter registrerade."}

KOMMANDE SCHEMALAGDA PASS:
${schedules?.slice(0, 10).map(s => `- ${s.shift_date}: ${s.user_name || "Okänd"} ${s.start_time}-${s.end_time} (${s.role || "Vakt"})`).join("\n") || "Inga kommande pass."}

INSTRUKTIONER:
- Svara alltid på svenska
- Var koncis och hjälpsam
- Hänvisa till rutiner och kontakter när relevant
- Vid lönefrågor: använd timlön ${workplace?.settings?.hourly_rate || 165} kr och OB-tillägg ${workplace?.settings?.ob_rate || 45} kr/h
- Vid schemafrågor: kontrollera mot max arbetstid och vilotidsregler
- Om användaren vill skapa en checklista, returnera den i strukturerat format
- Om du inte vet svaret, säg det och hänvisa till chef eller relevant kontakt`;

    const { messages } = await req.json();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: unknown) {
    console.error("Chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
