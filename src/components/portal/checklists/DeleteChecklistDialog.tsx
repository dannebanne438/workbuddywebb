import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist: { id: string; title: string } | null;
  onSuccess: () => void;
}

export function DeleteChecklistDialog({ open, onOpenChange, checklist, onSuccess }: DeleteChecklistDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!checklist) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("checklists").delete().eq("id", checklist.id);
      if (error) throw error;
      toast.success("Checklistan togs bort");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting checklist:", error);
      toast.error("Kunde inte ta bort checklistan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ta bort checklista?</AlertDialogTitle>
          <AlertDialogDescription>
            {checklist && (
              <>
                Är du säker på att du vill ta bort checklistan{" "}
                <strong>"{checklist.title}"</strong>?
                <br /><br />
                Detta går inte att ångra.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ta bort"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
