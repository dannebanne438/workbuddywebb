import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface CreateWorkplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateWorkplaceDialog({ open, onOpenChange, onCreated }: CreateWorkplaceDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [workplaceType, setWorkplaceType] = useState("");
  const [workplaceCode, setWorkplaceCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyName.trim()) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("manage-workplace", {
        body: {
          action: "create",
          name: name.trim(),
          company_name: companyName.trim(),
          industry: industry.trim() || undefined,
          workplace_type: workplaceType.trim() || undefined,
          workplace_code: workplaceCode.trim() || undefined,
        },
      });

      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);

      toast({ title: "Arbetsplats skapad!", description: `Platskod: ${res.data.workplace.workplace_code}` });
      onOpenChange(false);
      resetForm();
      onCreated();
    } catch (err: any) {
      toast({ title: "Fel", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCompanyName("");
    setIndustry("");
    setWorkplaceType("");
    setWorkplaceCode("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skapa ny arbetsplats</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Namn *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="t.ex. Gym Solna" required maxLength={100} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Företagsnamn *</label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="t.ex. FitLife AB" required maxLength={100} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Bransch</label>
            <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="t.ex. Hälsa & Fitness" maxLength={50} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Arbetsplatstyp</label>
            <Input value={workplaceType} onChange={(e) => setWorkplaceType(e.target.value)} placeholder="t.ex. Gym" maxLength={50} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Platskod (lämna tom för auto)</label>
            <Input value={workplaceCode} onChange={(e) => setWorkplaceCode(e.target.value.toUpperCase())} placeholder="Auto-genereras" maxLength={20} className="font-mono uppercase" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button>
            <Button type="submit" disabled={loading || !name.trim() || !companyName.trim()}>
              {loading ? "Skapar..." : "Skapa arbetsplats"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
