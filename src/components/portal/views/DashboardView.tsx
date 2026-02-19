import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, Award, Clock, Plus, ClipboardList, CalendarPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { sv } from "date-fns/locale";
import { AddIncidentDialog } from "../incidents/AddIncidentDialog";

type PortalView = "camera" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin" | "workplace-detail" | "team-chat" | "dashboard" | "certificates" | "incidents" | "documents" | "photos" | "features";

interface DashboardViewProps {
  onNavigate?: (view: PortalView) => void;
  isPresentation?: boolean;
}

export function DashboardView({ onNavigate, isPresentation }: DashboardViewProps) {
  const { activeWorkplace } = useWorkplace();
  const [activeToday, setActiveToday] = useState(0);
  const [openIncidents, setOpenIncidents] = useState(0);
  const [expiringCerts, setExpiringCerts] = useState(0);
  const [weekHours, setWeekHours] = useState(0);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [riskWarnings, setRiskWarnings] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [addIncidentOpen, setAddIncidentOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!activeWorkplace) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const thirtyDays = format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");

    // Parallel fetches
    const [schedToday, schedWeek, incidents, certs] = await Promise.all([
      supabase.from("schedules").select("*").eq("workplace_id", activeWorkplace.id).eq("shift_date", today),
      supabase.from("schedules").select("*").eq("workplace_id", activeWorkplace.id).gte("shift_date", weekStart).lte("shift_date", weekEnd),
      supabase.from("incidents").select("*").eq("workplace_id", activeWorkplace.id).order("created_at", { ascending: false }),
      supabase.from("certificates").select("*").eq("workplace_id", activeWorkplace.id),
    ]);

    // Active today
    const todayData = schedToday.data || [];
    setActiveToday(new Set(todayData.map((s: any) => s.user_name || s.user_id)).size);
    setTodaySchedule(todayData.slice(0, 8));

    // Week hours
    const totalMinutes = (schedWeek.data || []).reduce((sum: number, s: any) => {
      const [sh, sm] = (s.start_time || "0:0").split(":").map(Number);
      const [eh, em] = (s.end_time || "0:0").split(":").map(Number);
      return sum + (eh * 60 + em) - (sh * 60 + sm);
    }, 0);
    setWeekHours(Math.round(totalMinutes / 60));

    // Incidents
    const allIncidents = incidents.data || [];
    setOpenIncidents(allIncidents.filter((i: any) => i.status !== "resolved" && i.status !== "closed").length);
    setRecentIncidents(allIncidents.slice(0, 5));

    // Certificates
    const allCerts = certs.data || [];
    const expiring = allCerts.filter((c: any) => {
      if (!c.expiry_date) return false;
      return c.expiry_date <= thirtyDays;
    });
    setExpiringCerts(expiring.length);

    // Risk warnings
    const warnings: any[] = [];
    expiring.forEach((c: any) => {
      const isExpired = c.expiry_date < today;
      warnings.push({
        text: `${c.user_name}: ${c.certificate_type} ${isExpired ? "utgånget" : "går ut " + new Date(c.expiry_date).toLocaleDateString("sv-SE")}`,
        level: isExpired ? "critical" : "warning",
      });
    });
    const openInc = allIncidents.filter((i: any) => i.status === "open");
    if (openInc.length > 0) {
      warnings.push({ text: `${openInc.length} öppna avvikelser`, level: "warning" });
    }
    setRiskWarnings(warnings.slice(0, 6));
  }, [activeWorkplace]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const SEVERITY_COLORS: Record<string, string> = {
    critical: "text-red-500",
    high: "text-red-400",
    medium: "text-yellow-500",
    low: "text-muted-foreground",
  };

  return (
    <div className="p-4 md:p-6 space-y-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <Button size="sm" onClick={() => setAddIncidentOpen(true)}>
          <AlertTriangle className="h-4 w-4 mr-1" /> Rapportera avvikelse
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-presentation="kpi-cards">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{activeToday}</p>
            <p className="text-xs text-muted-foreground">Aktiva idag</p>
          </CardContent>
        </Card>
        <Card
          className={`${openIncidents > 0 ? "border-destructive/50" : ""} cursor-pointer hover:bg-accent/50 transition-colors`}
          onClick={() => onNavigate?.("incidents")}
        >
          <CardContent className="p-4 text-center">
            <AlertTriangle className={`h-5 w-5 mx-auto mb-1 ${openIncidents > 0 ? "text-destructive" : "text-primary"}`} />
            <p className="text-2xl font-bold text-foreground">{openIncidents}</p>
            <p className="text-xs text-muted-foreground">Öppna avvikelser</p>
          </CardContent>
        </Card>
        <Card className={expiringCerts > 0 ? "border-yellow-500/50" : ""}>
          <CardContent className="p-4 text-center">
            <Award className={`h-5 w-5 mx-auto mb-1 ${expiringCerts > 0 ? "text-yellow-500" : "text-primary"}`} />
            <p className="text-2xl font-bold text-foreground">{expiringCerts}</p>
            <p className="text-xs text-muted-foreground">Certifikat ⚠️</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{weekHours}h</p>
            <p className="text-xs text-muted-foreground">Veckotimmar</p>
          </CardContent>
        </Card>
      </div>

      {/* Two columns */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Today's schedule */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Dagens schema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todaySchedule.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga pass idag</p>
            ) : (
              todaySchedule.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{s.start_time}–{s.end_time} {s.user_name}</span>
                  {s.role && <Badge variant="outline" className="text-xs">{s.role}</Badge>}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Risk warnings */}
        <Card data-presentation="risk-warnings">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Riskvarningar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {riskWarnings.length === 0 ? (
              <p className="text-sm text-green-600">✓ Inga aktiva varningar</p>
            ) : (
              riskWarnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${w.level === "critical" ? "text-destructive" : "text-yellow-500"}`} />
                  <span className="text-foreground">{w.text}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent incidents */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Senaste avvikelser</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentIncidents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga avvikelser</p>
            ) : (
              recentIncidents.map((inc: any) => (
                <div
                  key={inc.id}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent/50 rounded p-1 -m-1 transition-colors"
                  onClick={() => onNavigate?.("incidents")}
                >
                  <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${SEVERITY_COLORS[inc.severity] || ""}`} />
                  <span className="text-foreground truncate">{inc.title}</span>
                  <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                    {new Date(inc.created_at).toLocaleDateString("sv-SE")}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Snabbåtgärder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setAddIncidentOpen(true)}>
              <AlertTriangle className="h-4 w-4 mr-2" /> Rapportera avvikelse
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate?.("schedule")}>
              <CalendarPlus className="h-4 w-4 mr-2" /> Lägg till pass
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate?.("checklists")}>
              <ClipboardList className="h-4 w-4 mr-2" /> Skapa checklista
            </Button>
          </CardContent>
        </Card>
      </div>

      <AddIncidentDialog open={addIncidentOpen} onOpenChange={setAddIncidentOpen} onAdded={fetchData} />
    </div>
  );
}
