import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const { company, contactPerson, email, phone, workplaceType, message }: ContactNotificationRequest = await req.json();

    if (!company || !contactPerson || !email) {
      throw new Error("Missing required fields: company, contactPerson, email");
    }

    const emailHtml = `
      <h1>Ny kontaktförfrågan</h1>
      <p>En ny intresseanmälan har inkommit via workbuddy.se</p>
      
      <h2>Kontaktuppgifter</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Företag:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${company}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Kontaktperson:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${contactPerson}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">E-post:</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        ${phone ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Telefon:</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><a href="tel:${phone}">${phone}</a></td>
        </tr>
        ` : ''}
        ${workplaceType ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Typ av arbetsplats:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${workplaceType}</td>
        </tr>
        ` : ''}
      </table>
      
      ${message ? `
      <h2>Meddelande</h2>
      <p style="background: #f5f5f5; padding: 16px; border-radius: 8px;">${message}</p>
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
        subject: `Ny kontaktförfrågan från ${company}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const emailResponse = await res.json();
    console.log("Contact notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
