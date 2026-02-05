import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ClipboardList, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface ChecklistItem {
  text: string;
  checked: boolean;
  checked_by?: string | null;
  checked_by_name?: string | null;
}

interface ChatChecklistCardProps {
  checklistId: string;
}

export function ChatChecklistCard({ checklistId }: ChatChecklistCardProps) {
  const { user, profile } = useAuth();
  const [checklist, setChecklist] = useState<{
    id: string;
    title: string;
    items: ChecklistItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChecklist = async () => {
      const { data, error } = await supabase
        .from("checklists")
        .select("id, title, items")
        .eq("id", checklistId)
        .single();

      if (!error && data) {
        setChecklist({
          id: data.id,
          title: data.title,
          items: Array.isArray(data.items)
            ? (data.items as unknown as ChecklistItem[])
            : [],
        });
      }
      setLoading(false);
    };

    fetchChecklist();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`checklist-${checklistId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "checklists",
          filter: `id=eq.${checklistId}`,
        },
        (payload) => {
          const updated = payload.new;
          setChecklist({
            id: updated.id,
            title: updated.title,
            items: Array.isArray(updated.items)
              ? (updated.items as unknown as ChecklistItem[])
              : [],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checklistId]);

  const toggleItem = useCallback(
    async (itemIndex: number) => {
      if (!checklist || !user) return;

      const currentItem = checklist.items[itemIndex];
      const isChecking = !currentItem.checked;
      const userName = profile?.full_name || profile?.email || "Användare";

      const newItems = checklist.items.map((item, idx) =>
        idx === itemIndex
          ? {
              ...item,
              checked: isChecking,
              checked_by: isChecking ? user.id : null,
              checked_by_name: isChecking ? userName : null,
            }
          : item
      );

      // Optimistic update
      setChecklist((prev) => (prev ? { ...prev, items: newItems } : prev));

      const { error } = await supabase
        .from("checklists")
        .update({ items: newItems as unknown as Json })
        .eq("id", checklistId);

      if (error) {
        toast.error("Kunde inte uppdatera checklistan");
        // Revert on error
        setChecklist((prev) =>
          prev ? { ...prev, items: checklist.items } : prev
        );
      }
    },
    [checklist, checklistId, user, profile]
  );

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
        Checklistan kunde inte hittas
      </div>
    );
  }

  const completedCount = checklist.items.filter((i) => i.checked).length;
  const totalCount = checklist.items.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <ClipboardList className="h-4 w-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm truncate">
            {checklist.title}
          </h4>
          <p className="text-xs text-muted-foreground">
            {completedCount} av {totalCount} klara
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-3">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                progressPercent === 100 ? "bg-accent" : "bg-primary"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Items */}
      <div className="space-y-1.5">
        {checklist.items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => toggleItem(idx)}
            className="w-full flex items-center gap-2 text-sm text-left hover:bg-accent/30 rounded p-1.5 -mx-1.5 transition-colors"
          >
            <div
              className={cn(
                "h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                item.checked
                  ? "bg-primary border-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              {item.checked && (
                <Check className="h-3 w-3 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  item.checked
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                )}
              >
                {item.text}
              </span>
              {item.checked && item.checked_by_name && (
                <span className="block text-xs text-muted-foreground/70 mt-0.5">
                  ✓ {item.checked_by_name}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper to detect if a message contains a checklist reference
export function parseChecklistMessage(content: string): {
  isChecklist: boolean;
  checklistId: string | null;
  textBefore: string;
} {
  const match = content.match(/\[checklist:([a-f0-9-]+)\]/i);
  if (match) {
    const textBefore = content.substring(0, match.index).trim();
    return {
      isChecklist: true,
      checklistId: match[1],
      textBefore,
    };
  }
  return { isChecklist: false, checklistId: null, textBefore: content };
}
