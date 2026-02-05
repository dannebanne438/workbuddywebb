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
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface AddRoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddRoutineDialog({ open, onOpenChange, onSuccess }: AddRoutineDialogProps) {
  const { activeWorkplace } = useWorkplace();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkplace?.id || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("routines").insert({
        workplace_id: activeWorkplace.id,
        title: formData.title,
        category: formData.category || null,
        content: formData.content || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Rutin skapad");
      onSuccess();
      onOpenChange(false);
      // Reset form
      setFormData({ title: "", category: "", content: "" });
    } catch (error) {
      console.error("Error adding routine:", error);
      toast.error("Kunde inte skapa rutin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ny rutin</DialogTitle>
          <DialogDescription>
            Skapa en ny rutin eller arbetsinstruktion
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="T.ex. Öppningsrutin morgon"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori (valfritt)</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="T.ex. Daglig, Säkerhet, Kvalitet"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Innehåll (Markdown)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Skriv instruktioner här...

Du kan använda Markdown:
- Punktlistor med -
- **Fetstil** för viktiga saker
- Numrerade steg med 1. 2. 3."
              rows={8}
            />
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
                  Skapa rutin
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
