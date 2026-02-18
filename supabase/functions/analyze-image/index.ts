import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Du är en AI-assistent för byggarbetsplatser. Analysera bilden och föreslå om den bör publiceras som en NYHET (announcement) eller rapporteras som en AVVIKELSE (incident).

Svara ALLTID med ett JSON-objekt med denna struktur:
{
  "suggested_type": "announcement" eller "incident",
  "title": "Kort rubrik som beskriver bilden",
  "description": "Beskrivning av vad som syns i bilden, 1-3 meningar",
  "severity": "low", "medium" eller "critical" (bara för incidents),
  "category": "safety", "quality", "environment" eller "delay" (bara för incidents),
  "confidence": "high", "medium" eller "low"
}

Regler:
- Om bilden visar risker, skador, farliga situationer, brister → AVVIKELSE
- Om bilden visar framsteg, milstolpar, positiva händelser, information → NYHET
- Skriv på svenska
- Var konkret och beskrivande`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analysera denna bild från byggarbetsplatsen:" },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_construction_image",
              description: "Analyze a construction site image and suggest classification",
              parameters: {
                type: "object",
                properties: {
                  suggested_type: { type: "string", enum: ["announcement", "incident"] },
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string", enum: ["low", "medium", "critical"] },
                  category: { type: "string", enum: ["safety", "quality", "environment", "delay"] },
                  confidence: { type: "string", enum: ["high", "medium", "low"] }
                },
                required: ["suggested_type", "title", "description", "confidence"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_construction_image" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "För många förfrågningar. Försök igen om en stund." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Krediter slut. Kontakta administratör." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    
    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse from content
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Could not parse AI response");
  } catch (e) {
    console.error("analyze-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
