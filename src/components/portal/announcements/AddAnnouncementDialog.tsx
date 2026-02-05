import { useState } from "react";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface AddAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddAnnouncementDialog({ open, onOpenChange, onSuccess }: AddAnnouncementDialogProps) {
  const { activeWorkplace } = useWorkplace();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_pinned: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkplace?.id || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("announcements").insert({
        workplace_id: activeWorkplace.id,
        title: formData.title,
        content: formData.content || null,
        is_pinned: formData.is_pinned,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Nyhet publicerad");
      onSuccess();
      onOpenChange(false);
      // Reset form
      setFormData({ title: "", content: "", is_pinned: false });
    } catch (error) {
      console.error("Error adding announcement:", error);
      toast.error("Kunde inte publicera nyhet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ny nyhet</DialogTitle>
          <DialogDescription>
            Publicera en nyhet eller uppdatering till teamet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="T.ex. Nya öppettider från och med måndag"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Innehåll (valfritt)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Skriv nyheten här..."
              rows={6}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_pinned"
              checked={formData.is_pinned}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_pinned: checked === true }))}
            />
            <Label htmlFor="is_pinned" className="cursor-pointer">
              Fäst högst upp (syns alltid först)
            </Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Avbryt
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Publicera
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
