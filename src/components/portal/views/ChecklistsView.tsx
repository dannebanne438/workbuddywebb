import { useState, useEffect, useCallback } from "react";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, Check, ChevronDown, ChevronUp, Send, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";
import { SendChecklistDialog } from "../checklists/SendChecklistDialog";

interface ChecklistItem {
  text: string;
  checked: boolean;
  checked_by?: string | null;
  checked_by_name?: string | null;
}

interface Checklist {
  id: string;
  title: string;
  description: string | null;
  items: ChecklistItem[];
  for_date: string | null;
  is_template: boolean;
  status: string;
  completed_at: string | null;
  completed_by_name: string | null;
  created_at: string;
}

type FilterType = "active" | "completed" | "templates";

function getProgressColor(percent: number) {
  if (percent <= 33) return { bar: "bg-red-500", border: "border-red-500/50", text: "text-red-500" };
  if (percent <= 66) return { bar: "bg-yellow-500", border: "border-yellow-500/50", text: "text-yellow-500" };
  return { bar: "bg-green-500", border: "border-green-500/50", text: "text-green-500" };
}

export function ChecklistsView() {
  const { activeWorkplace } = useWorkplace();
  const { user, profile } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [filter, setFilter] = useState<FilterType>("active");

  useEffect(() => {
    if (activeWorkplace?.id) fetchChecklists();
  }, [activeWorkplace?.id]);

  const fetchChecklists = async () => {
    if (!activeWorkplace?.id) return;
    const { data } = await supabase
      .from("checklists")
      .select("*")
      .eq("workplace_id", activeWorkplace.id)
      .order("created_at", { ascending: false });
    if (data) {
      const parsed = data.map((c: any) => ({
        ...c,
        items: Array.isArray(c.items) ? (c.items as unknown as ChecklistItem[]) : [],
        status: c.status || "active",
      }));
      setChecklists(parsed);
    }
    setLoading(false);
  };

  const toggleItem = useCallback(async (checklistId: string, itemIndex: number) => {
    if (!user) return;
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist || checklist.status === "completed") return;
    const currentItem = checklist.items[itemIndex];
    const isChecking = !currentItem.checked;
    const userName = profile?.full_name || profile?.email || "Användare";
    const newItems = checklist.items.map((item, idx) =>
      idx === itemIndex
        ? { ...item, checked: isChecking, checked_by: isChecking ? user.id : null, checked_by_name: isChecking ? userName : null }
        : item
    );
    setChecklists((prev) => prev.map((c) => (c.id === checklistId ? { ...c, items: newItems } : c)));
    const { error } = await supabase.from("checklists").update({ items: newItems as unknown as Json }).eq("id", checklistId);
    if (error) { toast.error("Kunde inte uppdatera checklistan"); fetchChecklists(); }
  }, [checklists, user, profile]);

  const saveAsTemplate = async (checklist: Checklist) => {
    if (!activeWorkplace?.id || !user) return;
    const resetItems = checklist.items.map((item) => ({ text: item.text, checked: false }));
    const { error } = await supabase.from("checklists").insert({
      workplace_id: activeWorkplace.id,
      title: `${checklist.title} (Mall)`,
      description: checklist.description,
      items: resetItems as unknown as Json,
      is_template: true,
      created_by: user.id,
    });
    if (error) toast.error("Kunde inte spara mall");
    else { toast.success("Sparad som mall!"); fetchChecklists(); }
  };

  const markCompleted = async (checklist: Checklist) => {
    if (!user) return;
    const userName = profile?.full_name || profile?.email || "Användare";
    const { error } = await supabase.from("checklists").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      completed_by: user.id,
      completed_by_name: userName,
    }).eq("id", checklist.id);
    if (error) toast.error("Kunde inte slutföra checklistan");
    else { toast.success("Checklista slutförd!"); fetchChecklists(); }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const getProgress = (items: ChecklistItem[]) => {
    if (items.length === 0) return { completed: 0, total: 0, percent: 0 };
    const completed = items.filter((i) => i.checked).length;
    return { completed, total: items.length, percent: Math.round((completed / items.length) * 100) };
  };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filteredChecklists = checklists.filter((c) => {
    if (filter === "active") return c.status === "active" && !c.is_template;
    if (filter === "completed") {
      if (c.status !== "completed") return false;
      if (c.completed_at && new Date(c.completed_at) < thirtyDaysAgo) return false;
      return true;
    }
    if (filter === "templates") return c.is_template;
    return true;
  });

  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Checklistor</h1>
            <p className="text-sm text-muted-foreground">Dagliga uppgifter och mallar</p>
          </div>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="px-6 py-3 border-b border-border bg-card flex gap-2">
        {([
          { key: "active" as FilterType, label: "Aktiva" },
          { key: "completed" as FilterType, label: "Slutförda" },
          { key: "templates" as FilterType, label: "Mallar" },
        ]).map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredChecklists.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-1">
              {filter === "active" ? "Inga aktiva checklistor" : filter === "completed" ? "Inga slutförda" : "Inga mallar"}
            </h2>
            {filter === "active" && (
              <p className="text-sm text-muted-foreground mt-4">
                Tips: Fråga WorkBuddy "Skapa en checklista för idag för nattpasset"
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredChecklists.map((checklist) => {
              const progress = getProgress(checklist.items);
              const colors = getProgressColor(progress.percent);
              const isExpanded = expandedIds.has(checklist.id);
              const displayItems = isExpanded ? checklist.items : checklist.items.slice(0, 5);
              const hasMore = checklist.items.length > 5;
              const isCompleted = checklist.status === "completed";

              return (
                <div key={checklist.id} className={cn(
                  "bg-card border rounded-xl p-5",
                  isCompleted ? "border-green-500/50" : colors.border
                )}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{checklist.title}</h3>
                      {checklist.for_date && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(checklist.for_date).toLocaleDateString("sv-SE")}
                        </p>
                      )}
                      {isCompleted && checklist.completed_by_name && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Slutförd av {checklist.completed_by_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!isCompleted && !checklist.is_template && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveAsTemplate(checklist)} title="Spara som mall">
                            <Save className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markCompleted(checklist)} title="Markera som slutförd">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedChecklist(checklist); setSendDialogOpen(true); }} title="Skicka">
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                      {checklist.is_template && <Badge variant="secondary" className="text-xs ml-1">Mall</Badge>}
                      {isCompleted && <Badge className="bg-green-500 text-white text-xs ml-1">Slutförd</Badge>}
                    </div>
                  </div>

                  {/* Progress bar with color */}
                  {checklist.items.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{progress.completed} av {progress.total} klara</span>
                        <span className={colors.text}>{progress.percent}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-300", colors.bar)} style={{ width: `${progress.percent}%` }} />
                      </div>
                    </div>
                  )}

                  {checklist.description && <p className="text-sm text-muted-foreground mb-3">{checklist.description}</p>}

                  <div className="space-y-2">
                    {displayItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleItem(checklist.id, isExpanded ? idx : idx)}
                        disabled={isCompleted}
                        className="w-full flex items-center gap-2 text-sm text-left hover:bg-accent/50 rounded p-1 -m-1 transition-colors disabled:opacity-60"
                      >
                        <div className={cn(
                          "h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                          item.checked ? "bg-primary border-primary" : "border-border hover:border-primary/50"
                        )}>
                          {item.checked && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={cn(item.checked ? "text-muted-foreground line-through" : "text-foreground")}>{item.text}</span>
                          {item.checked && item.checked_by_name && (
                            <span className="block text-xs text-muted-foreground/70 mt-0.5">✓ {item.checked_by_name}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {hasMore && (
                    <Button variant="ghost" size="sm" className="w-full mt-3 text-xs" onClick={() => toggleExpanded(checklist.id)}>
                      {isExpanded ? <><ChevronUp className="h-3 w-3 mr-1" /> Visa mindre</> : <><ChevronDown className="h-3 w-3 mr-1" /> Visa alla ({checklist.items.length - 5} till)</>}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <SendChecklistDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen} checklist={selectedChecklist} />
    </div>
  );
}
