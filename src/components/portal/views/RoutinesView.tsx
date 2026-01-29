import { useState, useEffect } from "react";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { supabase } from "@/integrations/supabase/client";
import { Book, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Routine {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
}

export function RoutinesView() {
  const { activeWorkplace } = useWorkplace();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (activeWorkplace?.id) {
      fetchRoutines();
    }
  }, [activeWorkplace?.id]);

  const fetchRoutines = async () => {
    if (!activeWorkplace?.id) return;

    const { data, error } = await supabase
      .from("routines")
      .select("*")
      .eq("workplace_id", activeWorkplace.id)
      .order("sort_order");

    if (data) {
      setRoutines(data);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Book className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Rutiner</h1>
            <p className="text-sm text-muted-foreground">SOPs och arbetsinstruktioner</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Book className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-1">Inga rutiner</h2>
            <p className="text-muted-foreground">Det finns inga rutiner registrerade.</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {routines.map((routine) => (
              <div key={routine.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === routine.id ? null : routine.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">{routine.title}</span>
                    {routine.category && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {routine.category}
                      </span>
                    )}
                  </div>
                  {expandedId === routine.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {expandedId === routine.id && routine.content && (
                  <div className="px-4 pb-4 border-t border-border">
                    <div className="prose prose-sm max-w-none pt-4 text-foreground">
                      <ReactMarkdown>{routine.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
