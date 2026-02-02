import { useState, useEffect } from "react";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, User, ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, Download } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isToday, addDays, subDays } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
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

type ViewMode = "month" | "week";

export function ScheduleView() {
  const { activeWorkplace } = useWorkplace();
  const { session } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportStartDate, setExportStartDate] = useState<string>(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  const [exportEndDate, setExportEndDate] = useState<string>(format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  const isMobile = useIsMobile();

  useEffect(() => {
    if (activeWorkplace?.id) {
      fetchSchedules();
    }
  }, [activeWorkplace?.id, currentMonth, currentWeek, viewMode]);

  const fetchSchedules = async () => {
    if (!activeWorkplace?.id) return;
    
    let startDate: Date;
    let endDate: Date;
    
    if (viewMode === "month") {
      startDate = startOfMonth(currentMonth);
      endDate = endOfMonth(currentMonth);
    } else {
      startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
      endDate = endOfWeek(currentWeek, { weekStartsOn: 1 });
    }
    
    const { data } = await supabase
      .from("schedules")
      .select("*")
      .eq("workplace_id", activeWorkplace.id)
      .gte("shift_date", format(startDate, "yyyy-MM-dd"))
      .lte("shift_date", format(endDate, "yyyy-MM-dd"))
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

  // Week view helpers
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getSchedulesForDay = (date: Date) => {
    return schedules.filter(s => 
      isSameDay(new Date(s.shift_date + "T00:00:00"), date)
    );
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Mobile day navigation
  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleExportPdf = async () => {
    if (!activeWorkplace?.id || !session?.access_token) {
      toast.error("Kunde inte generera rapport");
      return;
    }

    setExportLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-schedule-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            workplace_id: activeWorkplace.id,
            start_date: exportStartDate,
            end_date: exportEndDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const html = await response.text();
      
      // Open in new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      setShowExportDialog(false);
      toast.success("Rapport öppnad i nytt fönster");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Kunde inte generera rapporten");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-foreground text-sm md:text-base">Schema</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {format(new Date(), "EEEE d MMMM", { locale: sv })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Export button */}
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 md:gap-2 px-2 md:px-3 text-xs md:text-sm">
                  <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Rapport</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ladda ner arbetsrapport</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">Från</label>
                      <input
                        type="date"
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Till</label>
                      <input
                        type="date"
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleExportPdf}
                    disabled={exportLoading}
                    className="w-full"
                  >
                    {exportLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Genererar...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Ladda ner rapport
                      </span>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* View toggle */}
            <div className="flex gap-1 bg-secondary rounded-lg p-1 shrink-0">
              <Button
                variant={viewMode === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("week")}
                className="gap-1 md:gap-2 px-2 md:px-3 text-xs md:text-sm"
              >
                <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Vecka</span>
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("month")}
                className="gap-1 md:gap-2 px-2 md:px-3 text-xs md:text-sm"
              >
                <LayoutGrid className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Månad</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : viewMode === "week" ? (
          /* Week View */
          <div className="space-y-4">
            {/* Week navigation */}
            <Card>
              <CardHeader className="pb-2 md:pb-3 px-3 md:px-6">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base md:text-lg">
                    <span className="hidden sm:inline">Vecka {format(currentWeek, "w", { locale: sv })} • </span>
                    <span className="sm:hidden">V{format(currentWeek, "w", { locale: sv })} </span>
                    {format(weekStart, "d MMM", { locale: sv })} - {format(weekEnd, "d MMM", { locale: sv })}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 md:h-8 md:w-8"
                      onClick={handlePreviousWeek}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentWeek(new Date())}
                      className="text-xs md:text-sm px-2 md:px-3 h-7 md:h-8"
                    >
                      Idag
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 md:h-8 md:w-8"
                      onClick={handleNextWeek}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                {/* Desktop: Full week grid */}
                <div className="hidden md:grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const daySchedules = getSchedulesForDay(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);
                    
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          "flex flex-col rounded-lg border p-3 text-left transition-colors min-h-[120px]",
                          isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50 hover:bg-accent/50",
                          isTodayDate && !isSelected && "border-primary/30 bg-primary/5"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "text-xs font-medium uppercase",
                            isTodayDate ? "text-primary" : "text-muted-foreground"
                          )}>
                            {format(day, "EEE", { locale: sv })}
                          </span>
                          <span className={cn(
                            "text-lg font-semibold",
                            isTodayDate ? "text-primary" : "text-foreground"
                          )}>
                            {format(day, "d")}
                          </span>
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          {daySchedules.length === 0 ? (
                            <span className="text-xs text-muted-foreground">Ledigt</span>
                          ) : (
                            daySchedules.slice(0, 3).map((schedule) => (
                              <div 
                                key={schedule.id}
                                className={cn(
                                  "text-xs rounded px-1.5 py-0.5 truncate",
                                  schedule.is_approved 
                                    ? "bg-primary/10 text-primary" 
                                    : "bg-secondary text-muted-foreground"
                                )}
                              >
                                {schedule.start_time.slice(0, 5)}
                                {schedule.user_name && ` • ${schedule.user_name.split(' ')[0]}`}
                              </div>
                            ))
                          )}
                          {daySchedules.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{daySchedules.length - 3} till
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile: Horizontal scroll day picker */}
                <div className="md:hidden">
                  <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                    {weekDays.map((day) => {
                      const daySchedules = getSchedulesForDay(day);
                      const isSelected = isSameDay(day, selectedDate);
                      const isTodayDate = isToday(day);
                      
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => handleDayClick(day)}
                          className={cn(
                            "flex flex-col items-center rounded-xl border p-2 min-w-[52px] transition-colors shrink-0",
                            isSelected 
                              ? "border-primary bg-primary text-primary-foreground" 
                              : "border-border",
                            isTodayDate && !isSelected && "border-primary/50 bg-primary/10"
                          )}
                        >
                          <span className={cn(
                            "text-[10px] font-medium uppercase",
                            isSelected ? "text-primary-foreground" : isTodayDate ? "text-primary" : "text-muted-foreground"
                          )}>
                            {format(day, "EEE", { locale: sv })}
                          </span>
                          <span className={cn(
                            "text-lg font-bold",
                            isSelected ? "text-primary-foreground" : isTodayDate ? "text-primary" : "text-foreground"
                          )}>
                            {format(day, "d")}
                          </span>
                          {daySchedules.length > 0 && (
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full mt-0.5",
                              isSelected ? "bg-primary-foreground" : "bg-primary"
                            )} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected day details */}
            <Card>
              <CardHeader className="pb-2 md:pb-3 px-3 md:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm md:text-base">
                    {format(selectedDate, "EEEE d MMMM", { locale: sv })}
                  </CardTitle>
                  {/* Mobile day navigation */}
                  <div className="flex gap-1 md:hidden">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={handlePreviousDay}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={handleNextDay}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                {selectedDateSchedules.length === 0 ? (
                  <div className="text-center py-4 md:py-6">
                    <Calendar className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Inga pass denna dag
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2 md:gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedDateSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="bg-secondary/50 rounded-lg p-2.5 md:p-3 space-y-1.5 md:space-y-2"
                      >
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0" />
                          <span className="font-mono font-medium">
                            {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{schedule.user_name || "Ej tilldelad"}</span>
                        </div>
                        {schedule.role && (
                          <span className="inline-block text-[10px] md:text-xs bg-background text-foreground px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                            {schedule.role}
                          </span>
                        )}
                        {schedule.is_approved ? (
                          <span className="block text-[10px] md:text-xs text-primary">✓ Godkänt</span>
                        ) : (
                          <span className="block text-[10px] md:text-xs text-muted-foreground">Väntar på godkännande</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Month View */
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
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
              <CardContent className="px-2 md:px-6">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleSelectDate}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  locale={sv}
                  className="w-full pointer-events-auto"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                    month: "space-y-4 w-full",
                    table: "w-full border-collapse",
                    head_row: "flex w-full",
                    head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.7rem] md:text-[0.8rem] text-center",
                    row: "flex w-full mt-2",
                    cell: "flex-1 h-10 md:h-12 text-center text-xs md:text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-10 md:h-12 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
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
                            <div className="absolute bottom-0.5 md:bottom-1 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                      );
                    },
                  }}
                />
              </CardContent>
            </Card>

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
          <div className="text-center mt-6 md:mt-8">
            <p className="text-xs md:text-sm text-muted-foreground">
              Tips: Fråga WorkBuddy "Lägg schema för vecka 7 för 3 vakter"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
