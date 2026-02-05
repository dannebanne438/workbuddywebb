import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface AddShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultDate?: Date;
}

export function AddShiftDialog({ open, onOpenChange, onSuccess, defaultDate }: AddShiftDialogProps) {
  const { activeWorkplace } = useWorkplace();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shift_date: defaultDate ? format(defaultDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    user_name: "",
    start_time: "08:00",
    end_time: "16:00",
    role: "",
    notes: "",
  });

  useEffect(() => {
    if (defaultDate) {
      setFormData(prev => ({ ...prev, shift_date: format(defaultDate, "yyyy-MM-dd") }));
    }
  }, [defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkplace?.id || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("schedules").insert({
        workplace_id: activeWorkplace.id,
        shift_date: formData.shift_date,
        user_name: formData.user_name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        role: formData.role || null,
        notes: formData.notes || null,
        created_by: user.id,
        is_approved: false,
      });

      if (error) throw error;

      toast.success("Pass tillagt");
      onSuccess();
      onOpenChange(false);
      // Reset form
      setFormData({
        shift_date: format(new Date(), "yyyy-MM-dd"),
        user_name: "",
        start_time: "08:00",
        end_time: "16:00",
        role: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error adding shift:", error);
      toast.error("Kunde inte lägga till pass");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lägg till pass</DialogTitle>
          <DialogDescription>
            Skapa ett nytt schemalagt pass manuellt
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shift_date">Datum</Label>
              <Input
                id="shift_date"
                type="date"
                value={formData.shift_date}
                onChange={(e) => setFormData(prev => ({ ...prev, shift_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_name">Personal</Label>
              <Input
                id="user_name"
                value={formData.user_name}
                onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                placeholder="Namn"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_time">Starttid</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">Sluttid</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Roll (valfritt)</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              placeholder="T.ex. Kassa, Lager, Reception"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Anteckning (valfritt)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Extra info..."
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
                  Lägg till
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
