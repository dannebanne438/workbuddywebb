import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SearchRequest {
  city: string;
  coordinates: { lat: number; lng: number };
  radiusKm: number;
  industries: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT - required for Lovable Cloud ES256 tokens
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate the user's JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error("JWT Validation Error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid JWT" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is super admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Super admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { city, coordinates, radiusKm, industries }: SearchRequest = await req.json();
    
    if (!city || !coordinates || !radiusKm || !industries?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: city, coordinates, radiusKm, industries" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const industryList = industries.join(", ");
    
    const systemPrompt = `Du är en affärsanalytiker som hjälper WorkBuddy att identifiera potentiella företagskunder.

VIKTIGA REGLER:
1. Identifiera ENDAST verkliga, verifierbara företag som du känner till
2. Om du inte är säker på ett företag - inkludera det INTE
3. Returnera ALLTID null för fält du inte har tillförlitlig information om
4. Kvalitet före kvantitet - 3 bra leads är bättre än 10 osäkra
5. Fokusera på företag som passar WorkBuddy:
   - Skiftarbete eller distribuerad personal
   - Flera arbetsplatser/avdelningar
   - 10+ anställda
   - Behov av schemaläggning och kommunikation

PRIORITERADE BRANSCHER (i ordning):
1. Säkerhet (väktarbolag, bevakning)
2. Event (cateringföretag, eventbolag)
3. Bemanning (bemanningsföretag, rekrytering)
4. Hotell/Restaurang (hotell, restauranger, caféer)
5. Gym/Fitness (träningsanläggningar)

KONTAKTROLLER att identifiera (i prioriterad ordning):
- VD, CEO
- COO, Driftchef
- HR-chef, Personalansvarig
- Platschef, Områdeschef

Du MÅSTE använda funktionen return_prospect_leads för att returnera resultaten.`;

    const userPrompt = `Identifiera företag inom ${radiusKm} km från ${city} (koordinater: ${coordinates.lat}, ${coordinates.lng}) inom följande branscher: ${industryList}.

Returnera endast företag du är säker på existerar. För varje företag, inkludera:
- Företagsnamn (obligatoriskt)
- Bransch
- Adress (om känd)
- Uppskattat antal anställda
- Kontaktpersoner (namn, roll, kontaktuppgifter om tillgängliga)
- En kort notering om varför de är relevanta för WorkBuddy
- Lead-poäng 0-100 baserat på relevans

VIKTIGT: Returnera null för fält du inte är säker på. Fabricera ALDRIG data.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_prospect_leads",
              description: "Return identified prospect leads for WorkBuddy sales",
              parameters: {
                type: "object",
                properties: {
                  prospects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        company_name: { type: "string", description: "Company name (required)" },
                        industry: { type: ["string", "null"], description: "Industry/branch" },
                        address: { type: ["string", "null"], description: "Street address if known" },
                        city: { type: ["string", "null"], description: "City" },
                        estimated_employees: { type: ["integer", "null"], description: "Estimated number of employees" },
                        contacts: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: ["string", "null"], description: "Contact person name" },
                              role: { type: ["string", "null"], description: "Role/title" },
                              email: { type: ["string", "null"], description: "Email address" },
                              phone: { type: ["string", "null"], description: "Phone number" },
                              linkedin: { type: ["string", "null"], description: "LinkedIn profile URL" }
                            },
                            additionalProperties: false
                          }
                        },
                        relevance_notes: { type: "string", description: "Why this company is relevant for WorkBuddy" },
                        lead_score: { type: "integer", description: "Lead score 0-100 based on relevance" }
                      },
                      required: ["company_name", "relevance_notes", "lead_score"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["prospects"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_prospect_leads" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("AI Response:", JSON.stringify(aiResponse, null, 2));

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "return_prospect_leads") {
      return new Response(
        JSON.stringify({ prospects: [], message: "No prospects found for the specified area." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    return new Response(
      JSON.stringify({
        prospects: result.prospects || [],
        searchParams: { city, coordinates, radiusKm, industries }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("prospect-search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
