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

interface DeleteRoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routine: {
    id: string;
    title: string;
  } | null;
  onSuccess: () => void;
}

export function DeleteRoutineDialog({ open, onOpenChange, routine, onSuccess }: DeleteRoutineDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!routine) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("routines")
        .delete()
        .eq("id", routine.id);

      if (error) throw error;

      toast.success("Rutinen togs bort");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting routine:", error);
      toast.error("Kunde inte ta bort rutinen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ta bort rutin?</AlertDialogTitle>
          <AlertDialogDescription>
            {routine && (
              <>
                Är du säker på att du vill ta bort rutinen{" "}
                <strong>"{routine.title}"</strong>?
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
