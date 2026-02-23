import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SEVERITY_OPTIONS = [
  { value: "low", label: "Låg" },
  { value: "medium", label: "Medium" },
  { value: "critical", label: "Kritisk" },
];

const CATEGORY_OPTIONS = [
  { value: "safety", label: "Säkerhet" },
  { value: "quality", label: "Kvalitet" },
  { value: "environment", label: "Miljö" },
  { value: "delay", label: "Försening" },
];

interface AddIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

export function AddIncidentDialog({ open, onOpenChange, onAdded }: AddIncidentDialogProps) {
  const { activeWorkplace } = useWorkplace();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [category, setCategory] = useState("safety");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkplace || !user) return;

    setLoading(true);

    let imageUrl: string | null = null;
    if (photoFile) {
      const fileName = `${activeWorkplace.id}/${Date.now()}_${photoFile.name}`;
      const { error: uploadError } = await supabase.storage.from("camera-uploads").upload(fileName, photoFile);
      if (uploadError) {
        toast.error("Kunde inte ladda upp bild");
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("camera-uploads").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("incidents").insert({
      workplace_id: activeWorkplace.id,
      title,
      description: description || null,
      severity,
      category,
      reported_by: user.id,
      reported_by_name: profile?.full_name || profile?.email || "Okänd",
      image_url: imageUrl,
    });
    setLoading(false);

    if (error) {
      toast.error("Kunde inte rapportera avvikelse");
    } else {
      toast.success("Avvikelse rapporterad");
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setSeverity("medium");
      setCategory("safety");
      setPhotoFile(null);
      setPhotoPreview(null);
      onAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rapportera avvikelse</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Rubrik *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="description">Beskrivning</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Allvarlighetsgrad</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="photo">Foto (valfritt)</Label>
            {photoPreview && (
              <div className="mt-1 mb-2 rounded-lg overflow-hidden border border-border">
                <img src={photoPreview} alt="Förhandsgranskning" className="w-full h-32 object-cover" />
              </div>
            )}
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPhotoFile(file);
                  setPhotoPreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button>
            <Button type="submit" disabled={loading || !title}>
              {loading ? "Sparar..." : "Rapportera"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
