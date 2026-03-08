import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Camera, Clock, Download, FileText, ImageIcon,
  Shield, User, AlertTriangle, CheckCircle2, Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Incident {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  category: string;
  status: string;
  reported_by: string | null;
  reported_by_name: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  closed_by: string | null;
  closed_by_name: string | null;
  closed_at: string | null;
  action_comment: string | null;
  created_at: string;
  resolved_at: string | null;
  image_url: string | null;
  workplace_id: string;
}

interface Evidence {
  id: string;
  evidence_type: string;
  image_url: string;
  description: string | null;
  uploaded_by_name: string | null;
  server_timestamp: string;
}

interface AuditLog {
  id: string;
  action: string;
  changed_fields: string[] | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  user_id: string | null;
  server_timestamp: string;
}

interface Employee {
  id: string;
  full_name: string | null;
  email: string;
}

const SEVERITY_LABELS: Record<string, string> = {
  critical: "Kritisk", medium: "Medium", low: "Låg",
};
const CATEGORY_LABELS: Record<string, string> = {
  safety: "Säkerhet", quality: "Kvalitet", environment: "Miljö", delay: "Försening",
};
const STATUS_LABELS: Record<string, string> = {
  open: "Öppen", investigating: "Utreds", resolved: "Löst", closed: "Stängd",
};
const SEVERITY_COLORS: Record<string, "destructive" | "secondary" | "default"> = {
  critical: "destructive", medium: "secondary", low: "default",
};

const FIELD_LABELS: Record<string, string> = {
  status: "Status", severity: "Allvarlighetsgrad", category: "Kategori",
  title: "Rubrik", description: "Beskrivning", assigned_to_name: "Tilldelad",
  action_comment: "Åtgärdskommentar", resolved_at: "Löst datum", closed_at: "Stängt datum",
  closed_by_name: "Stängd av",
};

interface Props {
  incidentId: string;
  onBack: () => void;
}

export function IncidentDetailView({ incidentId, onBack }: Props) {
  const { activeWorkplace } = useWorkplace();
  const { user, profile, isWorkplaceAdmin } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionComment, setActionComment] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!incidentId) return;
    setLoading(true);

    const [incRes, evRes, logRes] = await Promise.all([
      supabase.from("incidents").select("*").eq("id", incidentId).single(),
      supabase.from("incident_evidence").select("*").eq("incident_id", incidentId).order("server_timestamp"),
      supabase.from("audit_logs").select("*").eq("table_name", "incidents").eq("record_id", incidentId).order("server_timestamp"),
    ]);

    if (incRes.data) setIncident(incRes.data as unknown as Incident);
    if (evRes.data) setEvidence(evRes.data as unknown as Evidence[]);
    if (logRes.data) setAuditLogs(logRes.data as unknown as AuditLog[]);
    setLoading(false);
  }, [incidentId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (activeWorkplace?.id && isWorkplaceAdmin) {
      supabase.from("profiles").select("id, full_name, email")
        .eq("workplace_id", activeWorkplace.id)
        .then(({ data }) => { if (data) setEmployees(data); });
    }
  }, [activeWorkplace?.id, isWorkplaceAdmin]);

  const handleUploadEvidence = async (type: "before" | "after", file: File) => {
    if (!incident || !activeWorkplace || !user) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${activeWorkplace.id}/incidents/${incident.id}/${type}_${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("photos").upload(path, file);
    if (uploadErr) { toast.error("Uppladdning misslyckades"); setUploading(false); return; }

    const { data: signedData } = await supabase.storage.from("photos").createSignedUrl(path, 365 * 24 * 3600);
    const { error: insertErr } = await supabase.from("incident_evidence").insert({
      incident_id: incident.id,
      workplace_id: activeWorkplace.id,
      evidence_type: type,
      image_url: signedData?.signedUrl || path,
      uploaded_by: user.id,
      uploaded_by_name: profile?.full_name || profile?.email || "Okänd",
    });

    if (insertErr) toast.error("Kunde inte spara bevis");
    else { toast.success(`${type === "before" ? "Före" : "Efter"}-bild uppladdad`); fetchAll(); }
    setUploading(false);
  };

  const handleAssign = async (employeeId: string) => {
    if (!incident) return;
    const emp = employees.find((e) => e.id === employeeId);
    const { error } = await supabase.from("incidents").update({
      assigned_to: employeeId,
      assigned_to_name: emp?.full_name || emp?.email || "Okänd",
      status: incident.status === "open" ? "investigating" : incident.status,
    }).eq("id", incident.id);
    if (error) toast.error("Kunde inte tilldela");
    else fetchAll();
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!incident || !user) return;

    const beforeEvidence = evidence.filter((e) => e.evidence_type === "before");
    const afterEvidence = evidence.filter((e) => e.evidence_type === "after");

    if (newStatus === "closed") {
      if (beforeEvidence.length === 0) { toast.error("Minst en före-bild krävs för att stänga"); return; }
      if (afterEvidence.length === 0) { toast.error("Minst en efter-bild krävs för att stänga"); return; }
      if (!actionComment.trim() && !incident.action_comment) { toast.error("Åtgärdskommentar krävs för att stänga"); return; }
    }

    const update: Record<string, unknown> = { status: newStatus };
    if (newStatus === "resolved" || newStatus === "closed") {
      update.resolved_at = new Date().toISOString();
    }
    if (newStatus === "closed") {
      update.closed_by = user.id;
      update.closed_by_name = profile?.full_name || profile?.email || "Okänd";
      update.closed_at = new Date().toISOString();
      if (actionComment.trim()) update.action_comment = actionComment.trim();
    }
    if (actionComment.trim() && newStatus !== "closed") {
      update.action_comment = actionComment.trim();
    }

    const { error } = await supabase.from("incidents").update(update).eq("id", incident.id);
    if (error) toast.error("Kunde inte uppdatera status");
    else { toast.success("Status uppdaterad"); setActionComment(""); fetchAll(); }
  };

  const handleExportPdf = async () => {
    if (!incident || !activeWorkplace) return;
    setExporting(true);

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-evidence-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ incident_id: incident.id }),
        }
      );

      if (!res.ok) throw new Error("PDF-generering misslyckades");
      const html = await res.text();

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      }
    } catch (err) {
      toast.error("Kunde inte generera rapport");
    } finally {
      setExporting(false);
    }
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "medium" });
  };

  const getChangeDescription = (log: AuditLog): string => {
    if (log.action === "INSERT") return "Avvikelse rapporterad";
    if (log.action === "DELETE") return "Avvikelse borttagen";
    if (!log.changed_fields || log.changed_fields.length === 0) return "Uppdaterad";

    const parts = log.changed_fields
      .filter((f) => !["updated_at", "resolved_at", "closed_at"].includes(f))
      .map((field) => {
        const label = FIELD_LABELS[field] || field;
        const oldVal = log.old_data?.[field];
        const newVal = log.new_data?.[field];

        if (field === "status") {
          return `${label}: ${STATUS_LABELS[String(oldVal)] || oldVal} → ${STATUS_LABELS[String(newVal)] || newVal}`;
        }
        if (oldVal && newVal) return `${label} ändrad`;
        if (newVal) return `${label} satt`;
        return `${label} ändrad`;
      });

    return parts.join(", ") || "Uppdaterad";
  };

  if (loading) return <div className="p-6 text-muted-foreground">Laddar...</div>;
  if (!incident) return <div className="p-6 text-destructive">Avvikelse hittades inte</div>;

  const beforeEvidence = evidence.filter((e) => e.evidence_type === "before");
  const afterEvidence = evidence.filter((e) => e.evidence_type === "after");

  return (
    <div className="p-4 md:p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">{incident.title}</h1>
            <Badge variant={SEVERITY_COLORS[incident.severity]}>{SEVERITY_LABELS[incident.severity]}</Badge>
            <Badge variant="outline">{CATEGORY_LABELS[incident.category]}</Badge>
            <Badge variant={incident.status === "closed" ? "default" : "secondary"}>
              {STATUS_LABELS[incident.status]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ID: {incident.id.slice(0, 8)} • Skapad: {formatTimestamp(incident.created_at)}
          </p>
        </div>
        <Button onClick={handleExportPdf} disabled={exporting} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" />
          {exporting ? "Genererar..." : "Bevisrapport PDF"}
        </Button>
      </div>

      {/* Info + Assignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Detaljer</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {incident.description && <p className="text-muted-foreground">{incident.description}</p>}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Rapportör:</span><br />{incident.reported_by_name || "Okänd"}</div>
              <div><span className="text-muted-foreground">Tilldelad:</span><br />{incident.assigned_to_name || "Ej tilldelad"}</div>
              {incident.closed_by_name && <div><span className="text-muted-foreground">Stängd av:</span><br />{incident.closed_by_name}</div>}
              {incident.closed_at && <div><span className="text-muted-foreground">Stängd:</span><br />{formatTimestamp(incident.closed_at)}</div>}
            </div>
            {incident.action_comment && (
              <div className="bg-secondary/50 rounded-lg p-3 mt-2">
                <span className="text-xs font-medium text-muted-foreground">Åtgärdskommentar:</span>
                <p className="text-sm mt-1">{incident.action_comment}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {isWorkplaceAdmin && incident.status !== "closed" && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Hantera</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Tilldela ansvarig</Label>
                <Select value={incident.assigned_to || ""} onValueChange={handleAssign}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Välj person" /></SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name || e.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Åtgärdskommentar</Label>
                <Textarea value={actionComment} onChange={(e) => setActionComment(e.target.value)} className="text-xs" rows={2} placeholder="Beskriv vidtagna åtgärder..." />
              </div>
              <div>
                <Label className="text-xs">Ändra status</Label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {Object.entries(STATUS_LABELS).filter(([k]) => k !== incident.status).map(([k, v]) => (
                    <Button key={k} size="sm" variant={k === "closed" ? "default" : "outline"} className="text-xs h-7" onClick={() => handleStatusChange(k)}>{v}</Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Evidence: Before & After */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="h-4 w-4" /> Före-bilder ({beforeEvidence.length})
              {beforeEvidence.length === 0 && <Badge variant="destructive" className="text-[10px]">Krävs</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {beforeEvidence.map((ev) => (
                <div key={ev.id} className="relative group">
                  <img src={ev.image_url} alt="Före" className="rounded-lg w-full h-24 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] p-1 rounded-b-lg">
                    {ev.uploaded_by_name} • {formatTimestamp(ev.server_timestamp)}
                  </div>
                </div>
              ))}
            </div>
            {incident.status !== "closed" && (
              <label className="flex items-center gap-2 cursor-pointer text-xs text-primary hover:underline">
                <Upload className="h-3 w-3" />
                {uploading ? "Laddar upp..." : "Ladda upp före-bild"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading}
                  onChange={(e) => { if (e.target.files?.[0]) handleUploadEvidence("before", e.target.files[0]); }} />
              </label>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Efter-bilder ({afterEvidence.length})
              {afterEvidence.length === 0 && <Badge variant="destructive" className="text-[10px]">Krävs</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {afterEvidence.map((ev) => (
                <div key={ev.id} className="relative group">
                  <img src={ev.image_url} alt="Efter" className="rounded-lg w-full h-24 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] p-1 rounded-b-lg">
                    {ev.uploaded_by_name} • {formatTimestamp(ev.server_timestamp)}
                  </div>
                </div>
              ))}
            </div>
            {incident.status !== "closed" && (
              <label className="flex items-center gap-2 cursor-pointer text-xs text-primary hover:underline">
                <Upload className="h-3 w-3" />
                {uploading ? "Laddar upp..." : "Ladda upp efter-bild"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading}
                  onChange={(e) => { if (e.target.files?.[0]) handleUploadEvidence("after", e.target.files[0]); }} />
              </label>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" /> Ändringslogg (Audit Trail)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-muted-foreground">Ingen logg tillgänglig</p>
          ) : (
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="relative pl-8">
                    <div className={`absolute left-1.5 top-1 h-3 w-3 rounded-full border-2 border-background ${
                      log.action === "INSERT" ? "bg-green-500" : log.action === "DELETE" ? "bg-destructive" : "bg-primary"
                    }`} />
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">{getChangeDescription(log)}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatTimestamp(log.server_timestamp)}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Logg-ID: {log.id.slice(0, 8)} • Server-tid: {log.server_timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
