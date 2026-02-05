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

interface DeleteShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: {
    id: string;
    user_name: string | null;
    shift_date: string;
    start_time: string;
    end_time: string;
  } | null;
  onSuccess: () => void;
}

export function DeleteShiftDialog({ open, onOpenChange, shift, onSuccess }: DeleteShiftDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!shift) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", shift.id);

      if (error) throw error;

      toast.success("Passet togs bort");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast.error("Kunde inte ta bort passet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ta bort pass?</AlertDialogTitle>
          <AlertDialogDescription>
            {shift && (
              <>
                Är du säker på att du vill ta bort passet för{" "}
                <strong>{shift.user_name || "Ej tilldelad"}</strong> den{" "}
                <strong>{shift.shift_date}</strong> kl{" "}
                <strong>{shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}</strong>?
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
