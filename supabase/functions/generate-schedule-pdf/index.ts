import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Shift {
  shift_date: string;
  start_time: string;
  end_time: string;
  user_name: string | null;
  role: string | null;
}

function calculateHours(start: string, end: string): number {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  
  let hours = endH - startH + (endM - startM) / 60;
  if (hours < 0) hours += 24; // Handle overnight shifts
  return hours;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function generatePdfHtml(
  workplaceName: string,
  startDate: string,
  endDate: string,
  shifts: Shift[]
): string {
  // Calculate hours per person
  const hoursByPerson: Record<string, number> = {};
  shifts.forEach((shift) => {
    const name = shift.user_name || "Ej tilldelad";
    const hours = calculateHours(shift.start_time, shift.end_time);
    hoursByPerson[name] = (hoursByPerson[name] || 0) + hours;
  });

  const totalHours = Object.values(hoursByPerson).reduce((a, b) => a + b, 0);
  const generatedDate = new Date().toLocaleDateString("sv-SE");

  // Sort shifts by date and time
  const sortedShifts = [...shifts].sort((a, b) => {
    const dateCompare = a.shift_date.localeCompare(b.shift_date);
    if (dateCompare !== 0) return dateCompare;
    return a.start_time.localeCompare(b.start_time);
  });

  const shiftRows = sortedShifts
    .map((shift) => {
      const hours = calculateHours(shift.start_time, shift.end_time);
      return `
        <tr>
          <td>${escapeHtml(shift.shift_date)}</td>
          <td>${escapeHtml(shift.user_name || "Ej tilldelad")}</td>
          <td>${escapeHtml(shift.start_time.slice(0, 5))} - ${escapeHtml(shift.end_time.slice(0, 5))}</td>
          <td>${escapeHtml(shift.role || "-")}</td>
          <td style="text-align: right">${hours.toFixed(1)} h</td>
        </tr>
      `;
    })
    .join("");

  const summaryRows = Object.entries(hoursByPerson)
    .sort(([, a], [, b]) => b - a)
    .map(
      ([name, hours]) => `
        <tr>
          <td>${escapeHtml(name)}</td>
          <td style="text-align: right">${hours.toFixed(1)} h</td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 20mm; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      color: #333;
      line-height: 1.4;
    }
    h1 { 
      font-size: 18px; 
      margin-bottom: 4px;
      color: #111;
    }
    .subtitle { 
      color: #666; 
      margin-bottom: 20px;
      font-size: 12px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 24px;
    }
    th, td { 
      padding: 8px 10px; 
      text-align: left; 
      border-bottom: 1px solid #e5e5e5;
    }
    th { 
      background: #f5f5f5; 
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    tr:hover { background: #fafafa; }
    .summary-section { margin-top: 30px; }
    .summary-section h2 { 
      font-size: 14px; 
      margin-bottom: 10px;
      color: #111;
    }
    .summary-table { width: auto; min-width: 250px; }
    .total-row { 
      font-weight: 600; 
      background: #f5f5f5;
      border-top: 2px solid #333;
    }
    .footer { 
      margin-top: 40px; 
      padding-top: 10px;
      border-top: 1px solid #e5e5e5;
      color: #888;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <h1>Arbetsrapport - ${escapeHtml(workplaceName)}</h1>
  <p class="subtitle">Period: ${escapeHtml(startDate)} till ${escapeHtml(endDate)}</p>
  
  <table>
    <thead>
      <tr>
        <th>Datum</th>
        <th>Person</th>
        <th>Tid</th>
        <th>Roll</th>
        <th style="text-align: right">Timmar</th>
      </tr>
    </thead>
    <tbody>
      ${shiftRows}
    </tbody>
  </table>

  <div class="summary-section">
    <h2>Summering per person</h2>
    <table class="summary-table">
      <thead>
        <tr>
          <th>Person</th>
          <th style="text-align: right">Totalt</th>
        </tr>
      </thead>
      <tbody>
        ${summaryRows}
        <tr class="total-row">
          <td>Totalt</td>
          <td style="text-align: right">${totalHours.toFixed(1)} h</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Genererad: ${generatedDate} | Antal pass: ${shifts.length}</p>
  </div>
</body>
</html>
  `;
}

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

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Verify admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, workplace_id")
      .eq("user_id", userId);

    const isSuperAdmin = roles?.some(r => r.role === "super_admin");
    const adminWorkplaceIds = roles?.filter(r => r.role === "workplace_admin").map(r => r.workplace_id) || [];

    const { workplace_id, start_date, end_date } = await req.json();

    if (!workplace_id || !start_date || !end_date) {
      return new Response(
        JSON.stringify({ error: "workplace_id, start_date, and end_date are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get workplace info
    const { data: workplace, error: workplaceError } = await supabase
      .from("workplaces")
      .select("name")
      .eq("id", workplace_id)
      .single();

    if (workplaceError || !workplace) {
      return new Response(JSON.stringify({ error: "Workplace not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from("schedules")
      .select("shift_date, start_time, end_time, user_name, role")
      .eq("workplace_id", workplace_id)
      .gte("shift_date", start_date)
      .lte("shift_date", end_date)
      .order("shift_date")
      .order("start_time");

    if (schedulesError) {
      return new Response(JSON.stringify({ error: "Failed to fetch schedules" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = generatePdfHtml(workplace.name, start_date, end_date, schedules || []);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
