import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limit contact form: 5 per minute per IP
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60_000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

interface ContactNotificationRequest {
  company: string;
  contactPerson: string;
  email: string;
  phone?: string;
  workplaceType?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit by IP
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { company, contactPerson, email, phone, workplaceType, message }: ContactNotificationRequest = await req.json();

    if (!company || !contactPerson || !email) {
      throw new Error("Missing required fields: company, contactPerson, email");
    }

    // Input validation
    if (company.length > 200 || contactPerson.length > 200 || email.length > 255) {
      return new Response(JSON.stringify({ error: "Input too long" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (message && message.length > 2000) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailHtml = `
      <h1>Ny kontaktförfrågan</h1>
      <p>En ny intresseanmälan har inkommit via WorkBuddy-webbplatsen.</p>
      
      <h2>Kontaktuppgifter</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Företag:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(company)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Kontaktperson:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(contactPerson)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">E-post:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(email)}</td>
        </tr>
        ${phone ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Telefon:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(phone)}</td>
        </tr>
        ` : ''}
        ${workplaceType ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Typ av arbetsplats:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(workplaceType)}</td>
        </tr>
        ` : ''}
      </table>
      
      ${message ? `
      <h2>Meddelande</h2>
      <p style="background: #f5f5f5; padding: 16px; border-radius: 8px;">${escapeHtml(message)}</p>
      ` : ''}
      
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="color: #666; font-size: 12px;">Detta meddelande skickades automatiskt från WorkBuddy kontaktformulär.</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "WorkBuddy <onboarding@resend.dev>",
        to: ["websales.wb@gmail.com"],
        subject: `Ny kontaktförfrågan från ${company.substring(0, 100)}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
