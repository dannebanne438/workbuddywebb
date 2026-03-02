import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings, Loader2 } from "lucide-react";

export function InvoiceSettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { activeWorkplace } = useWorkplace();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const workplaceId = activeWorkplace?.id;
  const [saving, setSaving] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["invoice-settings", workplaceId],
    queryFn: async () => {
      if (!workplaceId) return null;
      const { data } = await supabase
        .from("invoice_settings")
        .select("*")
        .eq("workplace_id", workplaceId)
        .maybeSingle();
      return data;
    },
    enabled: !!workplaceId,
  });

  const [form, setForm] = useState({
    company_name: "",
    org_number: "",
    address: "",
    postal_code: "",
    city: "",
    phone: "",
    email: "",
    website: "",
    bank_name: "",
    bank_account: "",
    bank_reference: "",
    bg_number: "",
    pg_number: "",
    payment_terms_days: "30",
    footer_text: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        company_name: settings.company_name || activeWorkplace?.company_name || "",
        org_number: settings.org_number || "",
        address: settings.address || "",
        postal_code: settings.postal_code || "",
        city: settings.city || "",
        phone: settings.phone || "",
        email: settings.email || "",
        website: settings.website || "",
        bank_name: settings.bank_name || "",
        bank_account: settings.bank_account || "",
        bank_reference: settings.bank_reference || "",
        bg_number: settings.bg_number || "",
        pg_number: settings.pg_number || "",
        payment_terms_days: String(settings.payment_terms_days || 30),
        footer_text: settings.footer_text || "",
      });
    } else if (activeWorkplace) {
      setForm(f => ({ ...f, company_name: activeWorkplace.company_name || "" }));
    }
  }, [settings, activeWorkplace]);

  const handleSave = async () => {
    if (!workplaceId) return;
    setSaving(true);
    try {
      const payload = {
        workplace_id: workplaceId,
        ...form,
        payment_terms_days: Number(form.payment_terms_days) || 30,
      };

      if (settings?.id) {
        const { error } = await supabase.from("invoice_settings").update(payload).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("invoice_settings").insert(payload);
        if (error) throw error;
      }
      queryClient.invalidateQueries({ queryKey: ["invoice-settings"] });
      toast({ title: "Fakturainställningar sparade" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Kunde inte spara", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const f = (key: keyof typeof form, label: string, type = "text") => (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Fakturainställningar</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Företagsuppgifter</h4>
          <div className="grid grid-cols-2 gap-3">
            {f("company_name", "Företagsnamn")}
            {f("org_number", "Org.nummer")}
            {f("address", "Adress")}
            {f("postal_code", "Postnummer")}
            {f("city", "Ort")}
            {f("phone", "Telefon")}
            {f("email", "E-post")}
            {f("website", "Webbplats")}
          </div>

          <h4 className="text-sm font-semibold text-foreground">Bankuppgifter</h4>
          <div className="grid grid-cols-2 gap-3">
            {f("bank_name", "Bank")}
            {f("bank_account", "Kontonummer")}
            {f("bank_reference", "Bankreferens")}
            {f("bg_number", "Bankgiro")}
            {f("pg_number", "Plusgiro")}
          </div>

          <h4 className="text-sm font-semibold text-foreground">Övriga inställningar</h4>
          {f("payment_terms_days", "Betalningsvillkor (dagar)", "number")}
          <div>
            <Label className="text-xs">Sidfot på faktura</Label>
            <Textarea value={form.footer_text} onChange={e => setForm(p => ({ ...p, footer_text: e.target.value }))} rows={2} />
          </div>

          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Spara inställningar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
