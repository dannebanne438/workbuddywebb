import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function fmt(n: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(n);
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);

    const isAdmin = roles?.some(r => r.role === "super_admin" || r.role === "workplace_admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { companyName, month, income, expenses, totals } = await req.json();

    const timestamp = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
  h1 { color: #1a1a1a; border-bottom: 2px solid #333; padding-bottom: 10px; }
  h2 { color: #555; margin-top: 30px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f5f5f5; }
  .positive { color: #16a34a; }
  .negative { color: #dc2626; }
  .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
</style></head>
<body>
  <h1>Ekonomirapport — ${escapeHtml(companyName || "Företag")}</h1>
  <p><strong>Period:</strong> ${escapeHtml(month)}</p>
  <p><strong>Genererad:</strong> ${escapeHtml(timestamp)}</p>

  <h2>Sammanställning</h2>
  <table>
    <tr><th>Post</th><th>Belopp</th></tr>
    <tr><td>Inkomster (exkl moms)</td><td>${fmt(totals.totalIncomeExclVat)} kr</td></tr>
    <tr><td>Utgående moms</td><td>${fmt(totals.totalIncomeVat)} kr</td></tr>
    <tr><td>Kostnader (exkl moms)</td><td>${fmt(totals.totalExpensesExclVat)} kr</td></tr>
    <tr><td>Ingående moms</td><td>${fmt(totals.totalExpensesVat)} kr</td></tr>
    <tr><td><strong>Resultat</strong></td><td class="${totals.result >= 0 ? 'positive' : 'negative'}"><strong>${fmt(totals.result)} kr</strong></td></tr>
    <tr><td><strong>Moms att betala</strong></td><td><strong>${fmt(totals.vatToPay)} kr</strong></td></tr>
  </table>

  <h2>Inkomster (${(income || []).length} st)</h2>
  <table>
    <tr><th>Datum</th><th>Kund</th><th>Faktura #</th><th>Exkl moms</th><th>Moms</th><th>Inkl moms</th><th>Betald</th></tr>
    ${(income || []).map((i: any) => `
    <tr>
      <td>${escapeHtml(i.invoice_date)}</td>
      <td>${escapeHtml(i.customer_name)}</td>
      <td>${escapeHtml(i.invoice_number || '–')}</td>
      <td>${fmt(Number(i.amount_excl_vat))}</td>
      <td>${fmt(Number(i.vat_amount))}</td>
      <td>${fmt(Number(i.amount_incl_vat))}</td>
      <td>${i.is_paid ? 'Ja' : 'Nej'}</td>
    </tr>`).join('')}
  </table>

  <h2>Utgifter (${(expenses || []).length} st)</h2>
  <table>
    <tr><th>Datum</th><th>Leverantör</th><th>Kategori</th><th>Exkl moms</th><th>Moms</th><th>Inkl moms</th><th>Eget uttag</th></tr>
    ${(expenses || []).map((e: any) => `
    <tr>
      <td>${escapeHtml(e.expense_date)}</td>
      <td>${escapeHtml(e.supplier_name)}</td>
      <td>${escapeHtml(e.category || '–')}</td>
      <td>${fmt(Number(e.amount_excl_vat))}</td>
      <td>${fmt(Number(e.vat_amount))}</td>
      <td>${fmt(Number(e.amount_incl_vat))}</td>
      <td>${e.is_personal_withdrawal ? 'Ja' : 'Nej'}</td>
    </tr>`).join('')}
  </table>

  <h2>Momsöversikt</h2>
  <table>
    <tr><td>Rekommenderat att avsätta</td><td>${fmt(totals.recommendedVatDeposit)} kr</td></tr>
    <tr><td>Redan inlagt på momskonto</td><td>${fmt(totals.totalVatDeposited)} kr</td></tr>
  </table>

  <div class="footer">
    <p>Genererad av WorkBuddy — ${escapeHtml(timestamp)}</p>
  </div>
</body>
</html>`;

    return new Response(JSON.stringify({ html, timestamp }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-finance-pdf error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
