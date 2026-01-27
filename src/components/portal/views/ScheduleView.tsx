import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, User } from "lucide-react";

interface Schedule {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  user_name: string | null;
  role: string | null;
  notes: string | null;
  is_approved: boolean;
}

export function ScheduleView() {
  const { workplace } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workplace?.id) {
      fetchSchedules();
    }
  }, [workplace?.id]);

  const fetchSchedules = async () => {
    if (!workplace?.id) return;
    
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("workplace_id", workplace.id)
      .gte("shift_date", new Date().toISOString().split("T")[0])
      .order("shift_date")
      .order("start_time");

    if (data) {
      setSchedules(data);
    }
    setLoading(false);
  };

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = schedule.shift_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Schema</h1>
            <p className="text-sm text-muted-foreground">Kommande pass</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : Object.keys(groupedSchedules).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-1">Inga schemalagda pass</h2>
            <p className="text-muted-foreground">Det finns inga kommande pass i schemat.</p>
            <p className="text-sm text-muted-foreground mt-4">
              Tips: Fråga WorkBuddy "Lägg schema för vecka 7 för 3 vakter"
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  {formatDate(date)}
                </h3>
                <div className="space-y-2">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="font-mono">
                            {schedule.start_time} - {schedule.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {schedule.user_name || "Ej tilldelad"}
                          </span>
                        </div>
                        {schedule.role && (
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {schedule.role}
                          </span>
                        )}
                      </div>
                      {schedule.is_approved ? (
                        <span className="text-xs text-accent">Godkänt</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Väntar</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
