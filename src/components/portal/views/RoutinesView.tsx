import { useState, useEffect } from "react";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Book, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { AddRoutineDialog } from "../routines/AddRoutineDialog";
import { DeleteRoutineDialog } from "../routines/DeleteRoutineDialog";

interface Routine {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
}

export function RoutinesView() {
  const { activeWorkplace } = useWorkplace();
  const { isWorkplaceAdmin } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

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

  const handleDeleteClick = (e: React.MouseEvent, routine: Routine) => {
    e.stopPropagation();
    setSelectedRoutine(routine);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Book className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Rutiner</h1>
              <p className="text-sm text-muted-foreground">SOPs och arbetsinstruktioner</p>
            </div>
          </div>
          
          {isWorkplaceAdmin && (
            <Button onClick={() => setAddDialogOpen(true)} size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Ny rutin</span>
            </Button>
          )}
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
            {isWorkplaceAdmin && (
              <Button onClick={() => setAddDialogOpen(true)} className="mt-4 gap-1">
                <Plus className="h-4 w-4" />
                Skapa första rutinen
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {routines.map((routine) => (
              <div key={routine.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === routine.id ? null : routine.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-medium text-foreground truncate">{routine.title}</span>
                    {routine.category && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded shrink-0">
                        {routine.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    {isWorkplaceAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDeleteClick(e, routine)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {expandedId === routine.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
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

      <AddRoutineDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={fetchRoutines}
      />

      <DeleteRoutineDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        routine={selectedRoutine}
        onSuccess={fetchRoutines}
      />
    </div>
  );
}
