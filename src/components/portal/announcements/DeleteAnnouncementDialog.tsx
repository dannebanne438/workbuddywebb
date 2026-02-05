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

interface DeleteAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: {
    id: string;
    title: string;
  } | null;
  onSuccess: () => void;
}

export function DeleteAnnouncementDialog({ open, onOpenChange, announcement, onSuccess }: DeleteAnnouncementDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!announcement) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcement.id);

      if (error) throw error;

      toast.success("Nyheten togs bort");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Kunde inte ta bort nyheten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ta bort nyhet?</AlertDialogTitle>
          <AlertDialogDescription>
            {announcement && (
              <>
                Är du säker på att du vill ta bort nyheten{" "}
                <strong>"{announcement.title}"</strong>?
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
