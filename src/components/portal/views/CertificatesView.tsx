import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Award, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { AddCertificateDialog } from "../certificates/AddCertificateDialog";
import { DeleteCertificateDialog } from "../certificates/DeleteCertificateDialog";

interface Certificate {
  id: string;
  user_name: string;
  certificate_type: string;
  issued_date: string | null;
  expiry_date: string | null;
  issuer: string | null;
  certificate_number: string | null;
  status: string;
  notes: string | null;
}

export function CertificatesView() {
  const { activeWorkplace } = useWorkplace();
  const { isWorkplaceAdmin } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchCertificates = useCallback(async () => {
    if (!activeWorkplace) return;
    setLoading(true);
    let query = supabase
      .from("certificates")
      .select("*")
      .eq("workplace_id", activeWorkplace.id)
      .order("expiry_date", { ascending: true });

    const { data } = await query;
    setCertificates((data as Certificate[]) || []);
    setLoading(false);
  }, [activeWorkplace]);

  useEffect(() => { fetchCertificates(); }, [fetchCertificates]);

  const statusColor = (s: string) => {
    if (s === "expired") return "destructive";
    if (s === "expiring_soon") return "secondary";
    return "default";
  };

  const statusLabel = (s: string) => {
    if (s === "expired") return "Utgånget";
    if (s === "expiring_soon") return "Går ut snart";
    return "Giltigt";
  };

  const filtered = certificates.filter((c) => {
    if (filterType !== "all" && c.certificate_type !== filterType) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    return true;
  });

  const types = [...new Set(certificates.map((c) => c.certificate_type))];

  return (
    <div className="p-4 md:p-6 space-y-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Certifikat</h1>
        </div>
        {isWorkplaceAdmin && (
          <Button onClick={() => setAddOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Lägg till
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Typ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla typer</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla</SelectItem>
            <SelectItem value="valid">Giltigt</SelectItem>
            <SelectItem value="expiring_soon">Går ut snart</SelectItem>
            <SelectItem value="expired">Utgånget</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Laddar...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">Inga certifikat hittade.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((cert) => (
            <Card key={cert.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{cert.user_name}</span>
                    <Badge variant={statusColor(cert.status)}>{statusLabel(cert.status)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{cert.certificate_type}{cert.issuer ? ` • ${cert.issuer}` : ""}</p>
                  {cert.expiry_date && (
                    <p className="text-xs text-muted-foreground">Utgår: {new Date(cert.expiry_date).toLocaleDateString("sv-SE")}</p>
                  )}
                </div>
                {isWorkplaceAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(cert.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddCertificateDialog open={addOpen} onOpenChange={setAddOpen} onAdded={fetchCertificates} />
      <DeleteCertificateDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} certificateId={deleteId} onDeleted={fetchCertificates} />
    </div>
  );
}
