import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, AlertTriangle, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { AddIncidentDialog } from "../incidents/AddIncidentDialog";
import { IncidentDetailView } from "../incidents/IncidentDetailView";
import { toast } from "sonner";
import type { MockIncident, MockCertWarning, MockScheduleEntry, MockNotification } from "@/components/presentation/PresentationMockData";

interface Incident {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  category: string;
  reported_by_name: string | null;
  assigned_to_name: string | null;
  status: string;
  created_at: string;
}

interface MockData {
  incidents: MockIncident[];
  certWarnings: MockCertWarning[];
  schedule: MockScheduleEntry[];
  notifications: MockNotification[];
  liveKPIs: { activeToday: number; openIncidents: number; expiringCerts: number; weekHours: number };
}

const SEVERITY_COLORS: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  critical: "destructive",
  medium: "secondary",
  low: "default",
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: "Kritisk",
  medium: "Medium",
  low: "Låg",
};

const CATEGORY_LABELS: Record<string, string> = {
  safety: "Säkerhet",
  quality: "Kvalitet",
  environment: "Miljö",
  delay: "Försening",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Öppen",
  investigating: "Utreds",
  resolved: "Löst",
  closed: "Stängd",
};

interface IncidentsViewProps {
  isPresentation?: boolean;
  mockData?: MockData;
}

export function IncidentsView({ isPresentation, mockData }: IncidentsViewProps) {
  const { activeWorkplace } = useWorkplace();
  const { isWorkplaceAdmin } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    if (!activeWorkplace) return;
    setLoading(true);
    const { data } = await supabase
      .from("incidents")
      .select("*")
      .eq("workplace_id", activeWorkplace.id)
      .order("created_at", { ascending: false });
    setIncidents((data as Incident[]) || []);
    setLoading(false);
  }, [activeWorkplace]);

  useEffect(() => { if (!isPresentation) fetchIncidents(); }, [fetchIncidents, isPresentation]);

  // Use mock data in presentation mode
  const displayData = isPresentation && mockData
    ? mockData.incidents.map(mi => ({ ...mi, assigned_to_name: null } as Incident & { isNew?: boolean }))
    : incidents.map(i => ({ ...i, isNew: false }));

  const filtered = displayData.filter((i) => {
    if (filterCategory !== "all" && i.category !== filterCategory) return false;
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    return true;
  });

  if (selectedIncidentId) {
    return (
      <IncidentDetailView
        incidentId={selectedIncidentId}
        onBack={() => { setSelectedIncidentId(null); fetchIncidents(); }}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Avvikelser</h1>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Rapportera
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-36"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla kategorier</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {(isPresentation ? displayData.length === 0 : loading) ? (
        <p className="text-muted-foreground text-sm">Laddar...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">Inga avvikelser hittade.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((inc: any) => (
            <Card
              key={inc.id}
              className={`cursor-pointer hover:border-primary/50 transition-all duration-500 ${inc.isNew ? "animate-fade-in border-destructive/50 shadow-md" : ""}`}
              onClick={() => !isPresentation && setSelectedIncidentId(inc.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-foreground">{inc.title}</span>
                      <Badge variant={SEVERITY_COLORS[inc.severity]}>{SEVERITY_LABELS[inc.severity]}</Badge>
                      <Badge variant="outline">{CATEGORY_LABELS[inc.category]}</Badge>
                      <Badge variant={inc.status === "closed" ? "default" : "secondary"} className="text-[10px]">
                        {STATUS_LABELS[inc.status]}
                      </Badge>
                    </div>
                    {inc.description && <p className="text-sm text-muted-foreground mb-1 line-clamp-1">{inc.description}</p>}
                    <p className="text-xs text-muted-foreground">
                      {inc.reported_by_name} • {new Date(inc.created_at).toLocaleDateString("sv-SE")}
                      {inc.assigned_to_name && ` • Tilldelad: ${inc.assigned_to_name}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddIncidentDialog open={addOpen} onOpenChange={setAddOpen} onAdded={fetchIncidents} />
    </div>
  );
}
