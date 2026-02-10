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

const CERTIFICATE_TYPES = [
  "Fallskydd",
  "Heta arbeten",
  "Truck",
  "Lift",
  "El",
  "ID06",
  "Första hjälpen",
  "Ställningsbyggnad",
  "Asbest",
  "Annat",
];

interface AddCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

export function AddCertificateDialog({ open, onOpenChange, onAdded }: AddCertificateDialogProps) {
  const { activeWorkplace } = useWorkplace();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [issuer, setIssuer] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkplace || !user) return;

    setLoading(true);

    const now = new Date();
    const expiry = expiryDate ? new Date(expiryDate) : null;
    let status = "valid";
    if (expiry) {
      if (expiry < now) status = "expired";
      else {
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (expiry <= thirtyDays) status = "expiring_soon";
      }
    }

    const { error } = await supabase.from("certificates").insert({
      workplace_id: activeWorkplace.id,
      user_name: userName,
      certificate_type: certificateType,
      issued_date: issuedDate || null,
      expiry_date: expiryDate || null,
      issuer: issuer || null,
      certificate_number: certificateNumber || null,
      status,
      notes: notes || null,
      created_by: user.id,
    });

    setLoading(false);

    if (error) {
      toast.error("Kunde inte lägga till certifikat");
    } else {
      toast.success("Certifikat tillagt");
      onOpenChange(false);
      resetForm();
      onAdded();
    }
  };

  const resetForm = () => {
    setUserName("");
    setCertificateType("");
    setIssuedDate("");
    setExpiryDate("");
    setIssuer("");
    setCertificateNumber("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lägg till certifikat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userName">Personnamn *</Label>
            <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="certType">Certifikattyp *</Label>
            <Select value={certificateType} onValueChange={setCertificateType} required>
              <SelectTrigger><SelectValue placeholder="Välj typ" /></SelectTrigger>
              <SelectContent>
                {CERTIFICATE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="issuedDate">Utfärdat</Label>
              <Input id="issuedDate" type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="expiryDate">Utgångsdatum</Label>
              <Input id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="issuer">Utfärdare</Label>
            <Input id="issuer" value={issuer} onChange={(e) => setIssuer(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="certNumber">Certifikatnummer</Label>
            <Input id="certNumber" value={certificateNumber} onChange={(e) => setCertificateNumber(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="notes">Anteckningar</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button>
            <Button type="submit" disabled={loading || !userName || !certificateType}>
              {loading ? "Sparar..." : "Lägg till"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
