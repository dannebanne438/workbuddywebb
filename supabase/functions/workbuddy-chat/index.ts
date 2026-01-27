import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const scheduleTools = [
  {
    type: "function",
    function: {
      name: "create_schedule",
      description: "Create one or more work schedule shifts. Use this when the user wants to schedule shifts, add people to the schedule, or create a work roster.",
      parameters: {
        type: "object",
        properties: {
          shifts: {
            type: "array",
            description: "Array of shifts to create",
            items: {
              type: "object",
              properties: {
                shift_date: {
                  type: "string",
                  description: "Date of the shift in YYYY-MM-DD format"
                },
                start_time: {
                  type: "string",
                  description: "Start time in HH:MM format (24h)"
                },
                end_time: {
                  type: "string",
                  description: "End time in HH:MM format (24h)"
                },
                user_name: {
                  type: "string",
                  description: "Name of the person working this shift"
                },
                role: {
                  type: "string",
                  description: "Role/position for this shift (e.g. 'Vakt', 'Receptionist', 'Chef')"
                },
                notes: {
                  type: "string",
                  description: "Optional notes for the shift"
                }
              },
              required: ["shift_date", "start_time", "end_time", "user_name"]
            }
          }
        },
        required: ["shifts"]
      }
    }
  }
];

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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service role client for inserting schedules (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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

    let workplaceId = profile?.workplace_id;

    // If no workplace assigned, check if super_admin and use first available workplace
    if (!workplaceId) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "super_admin")
        .maybeSingle();

      if (roleData) {
        const { data: firstWorkplace } = await supabase
          .from("workplaces")
          .select("id")
          .limit(1)
          .single();
        
        if (firstWorkplace) {
          workplaceId = firstWorkplace.id;
        }
      }
    }

    if (!workplaceId) {
      return new Response(JSON.stringify({ error: "No workplace assigned" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const { data: employees } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("workplace_id", workplaceId);

    const today = new Date().toISOString().split("T")[0];

    // Build system prompt with workplace context
    const systemPrompt = `Du är WorkBuddy, en hjälpsam digital kollega för arbetsplatsen "${workplace?.name}" (${workplace?.company_name}).

DAGENS DATUM: ${today}

ARBETSPLATSINFO:
- Typ: ${workplace?.workplace_type || "Okänd"}
- Bransch: ${workplace?.industry || "Okänd"}
${workplace?.settings ? `- Inställningar: Timlön ${workplace.settings.hourly_rate} kr, OB-tillägg ${workplace.settings.ob_rate} kr/h, Max ${workplace.settings.max_hours_per_week}h/vecka, Vila ${workplace.settings.min_rest_hours}h mellan pass` : ""}

ANSTÄLLDA:
${employees?.map(e => `- ${e.full_name || e.email}`).join("\n") || "Inga anställda registrerade."}

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
- Om du inte vet svaret, säg det och hänvisa till chef eller relevant kontakt

SCHEMALÄGGNING:
- När användaren vill schemalägga personal, ANVÄND ALLTID create_schedule-funktionen
- Bekräfta vilka pass som skapats efter att du använt funktionen
- Om användaren säger "schemalägg X imorgon 14-22" ska du tolka det och anropa create_schedule
- Använd dagens datum (${today}) som referens för relativa datum som "imorgon", "på fredag", etc.`;

    const { messages } = await req.json();

    // First call with tools
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
        tools: scheduleTools,
        tool_choice: "auto",
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

    const aiResponse = await response.json();
    const choice = aiResponse.choices?.[0];

    // Check if the AI wants to call a tool
    if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      
      if (toolCall.function.name === "create_schedule") {
        const args = JSON.parse(toolCall.function.arguments);
        const shifts = args.shifts;

        // Insert shifts into database
        const shiftsToInsert = shifts.map((shift: any) => ({
          workplace_id: workplaceId,
          shift_date: shift.shift_date,
          start_time: shift.start_time,
          end_time: shift.end_time,
          user_name: shift.user_name,
          role: shift.role || "Vakt",
          notes: shift.notes || null,
          created_by: userId,
          is_approved: false,
        }));

        const { data: insertedShifts, error: insertError } = await supabaseAdmin
          .from("schedules")
          .insert(shiftsToInsert)
          .select();

        if (insertError) {
          console.error("Insert error:", insertError);
          return new Response(JSON.stringify({ 
            response: `Kunde inte skapa schemat: ${insertError.message}`,
            tool_result: { success: false, error: insertError.message }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Build confirmation message
        const shiftsSummary = insertedShifts?.map((s: any) => 
          `✅ ${s.shift_date}: ${s.user_name} ${s.start_time}-${s.end_time} (${s.role})`
        ).join("\n") || "";

        // Get follow-up response from AI with tool result
        const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              choice.message,
              {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  success: true,
                  created_shifts: insertedShifts?.length || 0,
                  shifts: insertedShifts
                })
              }
            ],
          }),
        });

        if (followUpResponse.ok) {
          const followUp = await followUpResponse.json();
          const content = followUp.choices?.[0]?.message?.content || 
            `Jag har schemalagt följande pass:\n\n${shiftsSummary}\n\nPassen syns nu i schemat och väntar på godkännande.`;
          
          return new Response(JSON.stringify({ 
            response: content,
            tool_result: { 
              success: true, 
              action: "create_schedule",
              created_shifts: insertedShifts 
            }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ 
          response: `Jag har schemalagt följande pass:\n\n${shiftsSummary}\n\nPassen syns nu i schemat och väntar på godkännande.`,
          tool_result: { 
            success: true, 
            action: "create_schedule",
            created_shifts: insertedShifts 
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // No tool call, return the text response
    const content = choice?.message?.content || "Jag kunde inte generera ett svar.";
    
    return new Response(JSON.stringify({ response: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
