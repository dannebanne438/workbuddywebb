import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const SEVERITY_LABELS: Record<string, string> = { critical: "Kritisk", medium: "Medium", low: "Låg" };
const CATEGORY_LABELS: Record<string, string> = { safety: "Säkerhet", quality: "Kvalitet", environment: "Miljö", delay: "Försening" };
const STATUS_LABELS: Record<string, string> = { open: "Öppen", investigating: "Utreds", resolved: "Löst", closed: "Stängd" };
const FIELD_LABELS: Record<string, string> = {
  status: "Status", severity: "Allvarlighetsgrad", category: "Kategori",
  title: "Rubrik", description: "Beskrivning", assigned_to_name: "Tilldelad",
  action_comment: "Åtgärdskommentar", closed_by_name: "Stängd av",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { incident_id } = await req.json();
    if (!incident_id) {
      return new Response(JSON.stringify({ error: "incident_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to fetch all data
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    const [incRes, evRes, logRes] = await Promise.all([
      admin.from("incidents").select("*").eq("id", incident_id).single(),
      admin.from("incident_evidence").select("*").eq("incident_id", incident_id).order("server_timestamp"),
      admin.from("audit_logs").select("*").eq("table_name", "incidents").eq("record_id", incident_id).order("server_timestamp"),
    ]);

    if (!incRes.data) {
      return new Response(JSON.stringify({ error: "Incident not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const incident = incRes.data;
    const evidence = evRes.data || [];
    const logs = logRes.data || [];

    // Check user has access to this workplace
    const { data: profile } = await admin.from("profiles").select("workplace_id").eq("id", userData.user.id).single();
    const { data: roleCheck } = await admin.rpc("is_super_admin", { _user_id: userData.user.id });
    if (!roleCheck && profile?.workplace_id !== incident.workplace_id) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get workplace name
    const { data: workplace } = await admin.from("workplaces").select("name, company_name").eq("id", incident.workplace_id).single();

    const formatTs = (ts: string) => new Date(ts).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "medium" });
    const generatedAt = new Date().toISOString();

    const beforeEvidence = evidence.filter((e: any) => e.evidence_type === "before");
    const afterEvidence = evidence.filter((e: any) => e.evidence_type === "after");

    const auditRows = logs.map((log: any) => {
      const action = log.action === "INSERT" ? "Skapad" : log.action === "DELETE" ? "Borttagen" : "Uppdaterad";
      const fields = (log.changed_fields || [])
        .filter((f: string) => !["updated_at", "resolved_at", "closed_at"].includes(f))
        .map((f: string) => FIELD_LABELS[f] || f).join(", ");
      return `<tr>
        <td style="font-family:monospace;font-size:9px">${escapeHtml(log.id.slice(0, 8))}</td>
        <td>${escapeHtml(formatTs(log.server_timestamp))}</td>
        <td>${escapeHtml(action)}</td>
        <td>${escapeHtml(fields || "-")}</td>
      </tr>`;
    }).join("");

    const evidenceSection = (title: string, items: any[]) => {
      if (items.length === 0) return `<p style="color:#999;font-style:italic">Inga ${title.toLowerCase()} uppladdade</p>`;
      return items.map((e: any) => `
        <div style="display:inline-block;margin:4px;vertical-align:top">
          <img src="${escapeHtml(e.image_url)}" style="width:200px;height:150px;object-fit:cover;border:1px solid #ddd;border-radius:4px" />
          <p style="font-size:9px;color:#666;margin:2px 0">${escapeHtml(e.uploaded_by_name || "Okänd")} • ${escapeHtml(formatTs(e.server_timestamp))}</p>
        </div>
      `).join("");
    };

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  @page { size: A4; margin: 15mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; color: #333; }
  h1 { font-size: 16px; margin-bottom: 2px; }
  h2 { font-size: 13px; margin: 20px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  .meta { color: #666; font-size: 10px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #e5e5e5; font-size: 10px; }
  th { background: #f5f5f5; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-size: 9px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
  .badge-red { background: #fee; color: #c00; }
  .badge-yellow { background: #ffc; color: #880; }
  .badge-green { background: #efe; color: #080; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  .info-item { font-size: 10px; }
  .info-label { color: #888; font-size: 9px; }
  .watermark { position: fixed; bottom: 10mm; right: 10mm; color: #ccc; font-size: 8px; }
  .footer { margin-top: 30px; border-top: 2px solid #333; padding-top: 8px; font-size: 9px; color: #666; }
</style>
</head><body>
  <h1>🔒 Bevisrapport – Avvikelse</h1>
  <p class="meta">
    ${escapeHtml(workplace?.company_name || "")} / ${escapeHtml(workplace?.name || "")} |
    Genererad: ${escapeHtml(formatTs(generatedAt))} |
    Dokument-version: 1.0
  </p>

  <div class="info-grid">
    <div class="info-item"><span class="info-label">Ärende-ID</span><br/><strong style="font-family:monospace">${escapeHtml(incident.id)}</strong></div>
    <div class="info-item"><span class="info-label">Status</span><br/><span class="badge ${incident.status === "closed" ? "badge-green" : incident.severity === "critical" ? "badge-red" : "badge-yellow"}">${escapeHtml(STATUS_LABELS[incident.status] || incident.status)}</span></div>
    <div class="info-item"><span class="info-label">Rubrik</span><br/>${escapeHtml(incident.title)}</div>
    <div class="info-item"><span class="info-label">Allvarlighetsgrad</span><br/>${escapeHtml(SEVERITY_LABELS[incident.severity] || incident.severity)}</div>
    <div class="info-item"><span class="info-label">Kategori</span><br/>${escapeHtml(CATEGORY_LABELS[incident.category] || incident.category)}</div>
    <div class="info-item"><span class="info-label">Skapad</span><br/>${escapeHtml(formatTs(incident.created_at))}</div>
    <div class="info-item"><span class="info-label">Rapportör</span><br/>${escapeHtml(incident.reported_by_name || "Okänd")}</div>
    <div class="info-item"><span class="info-label">Tilldelad ansvarig</span><br/>${escapeHtml(incident.assigned_to_name || "Ej tilldelad")}</div>
    ${incident.closed_by_name ? `<div class="info-item"><span class="info-label">Stängd av</span><br/>${escapeHtml(incident.closed_by_name)}</div>` : ""}
    ${incident.closed_at ? `<div class="info-item"><span class="info-label">Stängd</span><br/>${escapeHtml(formatTs(incident.closed_at))}</div>` : ""}
  </div>

  ${incident.description ? `<p style="background:#f9f9f9;padding:8px;border-radius:4px;font-size:11px">${escapeHtml(incident.description)}</p>` : ""}
  ${incident.action_comment ? `<div style="background:#e8f5e9;padding:8px;border-radius:4px;margin-top:8px"><strong style="font-size:10px">Åtgärdskommentar:</strong><br/>${escapeHtml(incident.action_comment)}</div>` : ""}

  <h2>📸 Före-bilder (${beforeEvidence.length})</h2>
  ${evidenceSection("Före-bilder", beforeEvidence)}

  <h2>✅ Efter-bilder (${afterEvidence.length})</h2>
  ${evidenceSection("Efter-bilder", afterEvidence)}

  <h2>📋 Ändringslogg (Audit Trail)</h2>
  <table>
    <thead><tr><th>Logg-ID</th><th>Server-tid</th><th>Åtgärd</th><th>Ändrade fält</th></tr></thead>
    <tbody>${auditRows || '<tr><td colspan="4" style="color:#999">Ingen logg</td></tr>'}</tbody>
  </table>

  <div class="footer">
    <p><strong>Juridiskt meddelande:</strong> Denna rapport är automatiskt genererad från WorkBuddys oändringsbara loggdatabas.
    Alla tidsstämplar är serverbaserade (UTC). Loggar kan inte redigeras eller raderas. Varje ändring i systemet
    registreras automatiskt med före- och eftervärden.</p>
    <p>Rapport genererad: ${escapeHtml(generatedAt)} | Antal loggposter: ${logs.length} | Antal bevisbilder: ${evidence.length}</p>
  </div>

  <div class="watermark">WorkBuddy Bevisrapport v1.0 – ${escapeHtml(incident.id.slice(0, 8))}</div>
</body></html>`;

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Evidence PDF error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
