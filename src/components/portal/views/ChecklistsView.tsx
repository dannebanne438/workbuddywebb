import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, Check } from "lucide-react";

interface Checklist {
  id: string;
  title: string;
  description: string | null;
  items: { text: string; checked: boolean }[];
  for_date: string | null;
  is_template: boolean;
  created_at: string;
}

export function ChecklistsView() {
  const { workplace } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workplace?.id) {
      fetchChecklists();
    }
  }, [workplace?.id]);

  const fetchChecklists = async () => {
    if (!workplace?.id) return;

    const { data, error } = await supabase
      .from("checklists")
      .select("*")
      .eq("workplace_id", workplace.id)
      .order("created_at", { ascending: false });

    if (data) {
      // Parse items from JSONB safely
      const parsed = data.map((c) => ({
        ...c,
        items: Array.isArray(c.items) 
          ? (c.items as unknown as { text: string; checked: boolean }[])
          : [],
      }));
      setChecklists(parsed);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sv-SE");
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
            {checklists.map((checklist) => (
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
                {checklist.description && (
                  <p className="text-sm text-muted-foreground mb-3">{checklist.description}</p>
                )}
                <div className="space-y-2">
                  {checklist.items.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          item.checked
                            ? "bg-accent border-accent"
                            : "border-border"
                        }`}
                      >
                        {item.checked && <Check className="h-3 w-3 text-accent-foreground" />}
                      </div>
                      <span className={item.checked ? "text-muted-foreground line-through" : "text-foreground"}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                  {checklist.items.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{checklist.items.length - 5} till
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
