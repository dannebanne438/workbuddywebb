import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { sv } from "date-fns/locale";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    if (workplace?.id) {
      fetchSchedules();
    }
  }, [workplace?.id, currentMonth]);

  const fetchSchedules = async () => {
    if (!workplace?.id) return;
    
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("workplace_id", workplace.id)
      .gte("shift_date", format(monthStart, "yyyy-MM-dd"))
      .lte("shift_date", format(monthEnd, "yyyy-MM-dd"))
      .order("shift_date")
      .order("start_time");

    if (data) {
      setSchedules(data);
    }
    setLoading(false);
  };

  // Get dates that have schedules
  const datesWithSchedules = schedules.map(s => new Date(s.shift_date + "T00:00:00"));

  // Get schedules for selected date
  const selectedDateSchedules = schedules.filter(s => 
    isSameDay(new Date(s.shift_date + "T00:00:00"), selectedDate)
  );

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Custom day content to show indicators for days with shifts
  const modifiers = {
    hasShift: datesWithSchedules,
  };

  const modifiersStyles = {
    hasShift: {
      fontWeight: "bold" as const,
    },
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
            <p className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE d MMMM", { locale: sv })}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Calendar */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {format(currentMonth, "MMMM yyyy", { locale: sv })}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={handlePreviousMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={handleNextMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleSelectDate}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  locale={sv}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  className="w-full pointer-events-auto"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                    month: "space-y-4 w-full",
                    table: "w-full border-collapse",
                    head_row: "flex w-full",
                    head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center",
                    row: "flex w-full mt-2",
                    cell: "flex-1 h-12 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-12 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                    day_range_end: "day-range-end",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                    nav: "hidden",
                    caption: "hidden",
                  }}
                  components={{
                    DayContent: ({ date }) => {
                      const hasShift = datesWithSchedules.some(d => isSameDay(d, date));
                      return (
                        <div className="relative flex flex-col items-center justify-center h-full w-full">
                          <span>{date.getDate()}</span>
                          {hasShift && (
                            <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                      );
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* Selected day details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {format(selectedDate, "EEEE d MMMM", { locale: sv })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateSchedules.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Inga pass denna dag
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="bg-secondary/50 rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono font-medium">
                            {schedule.start_time} - {schedule.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{schedule.user_name || "Ej tilldelad"}</span>
                        </div>
                        {schedule.role && (
                          <span className="inline-block text-xs bg-background text-foreground px-2 py-1 rounded">
                            {schedule.role}
                          </span>
                        )}
                        {schedule.is_approved ? (
                          <span className="block text-xs text-primary">✓ Godkänt</span>
                        ) : (
                          <span className="block text-xs text-muted-foreground">Väntar på godkännande</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && schedules.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Tips: Fråga WorkBuddy "Lägg schema för vecka 7 för 3 vakter"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
