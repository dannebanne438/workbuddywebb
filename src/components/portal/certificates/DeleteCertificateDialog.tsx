import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificateId: string | null;
  onDeleted: () => void;
}

export function DeleteCertificateDialog({ open, onOpenChange, certificateId, onDeleted }: DeleteCertificateDialogProps) {
  const handleDelete = async () => {
    if (!certificateId) return;
    const { error } = await supabase.from("certificates").delete().eq("id", certificateId);
    if (error) {
      toast.error("Kunde inte ta bort certifikat");
    } else {
      toast.success("Certifikat borttaget");
      onDeleted();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ta bort certifikat?</AlertDialogTitle>
          <AlertDialogDescription>Detta kan inte ångras.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Ta bort</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
