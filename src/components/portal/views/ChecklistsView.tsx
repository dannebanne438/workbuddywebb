import { useState, useEffect, useCallback } from "react";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";

interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface Checklist {
  id: string;
  title: string;
  description: string | null;
  items: ChecklistItem[];
  for_date: string | null;
  is_template: boolean;
  created_at: string;
}

export function ChecklistsView() {
  const { activeWorkplace } = useWorkplace();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (activeWorkplace?.id) {
      fetchChecklists();
    }
  }, [activeWorkplace?.id]);

  const fetchChecklists = async () => {
    if (!activeWorkplace?.id) return;

    const { data, error } = await supabase
      .from("checklists")
      .select("*")
      .eq("workplace_id", activeWorkplace.id)
      .order("created_at", { ascending: false });

    if (data) {
      const parsed = data.map((c) => ({
        ...c,
        items: Array.isArray(c.items)
          ? (c.items as unknown as ChecklistItem[])
          : [],
      }));
      setChecklists(parsed);
    }
    setLoading(false);
  };

  const toggleItem = useCallback(async (checklistId: string, itemIndex: number) => {
    // Optimistically update UI
    setChecklists((prev) =>
      prev.map((checklist) => {
        if (checklist.id !== checklistId) return checklist;
        const newItems = checklist.items.map((item, idx) =>
          idx === itemIndex ? { ...item, checked: !item.checked } : item
        );
        return { ...checklist, items: newItems };
      })
    );

    // Find the checklist and update in database
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;

    const newItems = checklist.items.map((item, idx) =>
      idx === itemIndex ? { ...item, checked: !item.checked } : item
    );

    const { error } = await supabase
      .from("checklists")
      .update({ items: newItems as unknown as Json })
      .eq("id", checklistId);

    if (error) {
      toast.error("Kunde inte uppdatera checklistan");
      // Revert on error
      fetchChecklists();
    }
  }, [checklists]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sv-SE");
  };

  const getProgress = (items: ChecklistItem[]) => {
    if (items.length === 0) return { completed: 0, total: 0, percent: 0 };
    const completed = items.filter((i) => i.checked).length;
    return {
      completed,
      total: items.length,
      percent: Math.round((completed / items.length) * 100),
    };
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card">
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

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : checklists.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-1">Inga checklistor</h2>
            <p className="text-muted-foreground">Det finns inga checklistor ännu.</p>
            <p className="text-sm text-muted-foreground mt-4">
              Tips: Fråga WorkBuddy "Skapa en checklista för idag för nattpasset"
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {checklists.map((checklist) => {
              const progress = getProgress(checklist.items);
              const isExpanded = expandedIds.has(checklist.id);
              const displayItems = isExpanded ? checklist.items : checklist.items.slice(0, 5);
              const hasMore = checklist.items.length > 5;

              return (
                <div key={checklist.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{checklist.title}</h3>
                      {checklist.for_date && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(checklist.for_date)}
                        </p>
                      )}
                    </div>
                    {checklist.is_template && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        Mall
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {checklist.items.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>{progress.completed} av {progress.total} klara</span>
                        <span>{progress.percent}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={cn(
                            "h-full transition-all duration-300",
                            progress.percent === 100 ? "bg-accent" : "bg-primary"
                          )}
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {checklist.description && (
                    <p className="text-sm text-muted-foreground mb-3">{checklist.description}</p>
                  )}

                  <div className="space-y-2">
                    {displayItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleItem(checklist.id, isExpanded ? idx : idx)}
                        className="w-full flex items-center gap-2 text-sm text-left hover:bg-accent/50 rounded p-1 -m-1 transition-colors"
                      >
                        <div
                          className={cn(
                            "h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                            item.checked
                              ? "bg-primary border-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {item.checked && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className={cn(
                          "flex-1",
                          item.checked ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>

                  {hasMore && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-3 text-xs"
                      onClick={() => toggleExpanded(checklist.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Visa mindre
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Visa alla ({checklist.items.length - 5} till)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
