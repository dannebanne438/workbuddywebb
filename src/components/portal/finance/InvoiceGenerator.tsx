import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { InvoiceSettingsDialog } from "./InvoiceSettingsDialog";
import { FileText, Plus, Trash2, Settings, Download } from "lucide-react";

interface InvoiceLine {
  description: string;
  quantity: string;
  unit_price: string;
  vat_rate: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 2 }).format(n);
}

export function InvoiceGenerator() {
  const { activeWorkplace } = useWorkplace();
  const { toast } = useToast();
  const workplaceId = activeWorkplace?.id;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

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

  const [invoice, setInvoice] = useState({
    invoice_number: "",
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    customer_name: "",
    customer_address: "",
    customer_org: "",
    customer_ref: "",
    our_ref: "",
    notes: "",
    is_paid: false,
  });

  const [lines, setLines] = useState<InvoiceLine[]>([
    { description: "", quantity: "1", unit_price: "", vat_rate: "25" },
  ]);

  // Auto-calc due date from payment terms
  const effectiveDueDate = invoice.due_date || (() => {
    const d = new Date(invoice.invoice_date);
    d.setDate(d.getDate() + (settings?.payment_terms_days || 30));
    return d.toISOString().slice(0, 10);
  })();

  const lineCalcs = lines.map(l => {
    const qty = Number(l.quantity) || 0;
    const price = Number(l.unit_price) || 0;
    const net = qty * price;
    const vat = net * (Number(l.vat_rate) || 25) / 100;
    return { net, vat, total: net + vat };
  });

  const totalNet = lineCalcs.reduce((s, l) => s + l.net, 0);
  const totalVat = lineCalcs.reduce((s, l) => s + l.vat, 0);
  const totalIncl = totalNet + totalVat;

  const addLine = () => setLines([...lines, { description: "", quantity: "1", unit_price: "", vat_rate: "25" }]);
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, key: keyof InvoiceLine, value: string) => {
    const updated = [...lines];
    updated[i] = { ...updated[i], [key]: value };
    setLines(updated);
  };

  const handleDownloadPDF = () => {
    const s = settings;
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; color: #1a1a1a; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .logo-area { max-width: 200px; }
  .logo-area img { max-width: 120px; max-height: 60px; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { font-size: 28px; margin: 0; color: #0EA5E9; font-weight: 700; }
  .invoice-title p { margin: 4px 0; color: #666; }
  .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
  .party { width: 45%; }
  .party h3 { font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 6px; letter-spacing: 1px; }
  .party p { margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #f8f9fa; border-bottom: 2px solid #dee2e6; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 0.5px; }
  td { border-bottom: 1px solid #eee; padding: 10px 8px; }
  .text-right { text-align: right; }
  .totals { margin-left: auto; width: 280px; margin-top: 20px; }
  .totals table { margin: 0; }
  .totals td { border: none; padding: 6px 8px; }
  .totals tr:last-child { font-size: 16px; font-weight: 700; border-top: 2px solid #333; }
  .totals tr:last-child td { padding-top: 10px; }
  .bank-info { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
  .bank-info h3 { margin: 0 0 10px 0; font-size: 13px; }
  .bank-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .bank-item label { display: block; font-size: 10px; text-transform: uppercase; color: #999; letter-spacing: 0.5px; }
  .bank-item span { font-size: 14px; font-weight: 600; }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
  .notes { margin-top: 20px; padding: 12px; background: #fffde7; border-radius: 6px; font-size: 12px; }
  .paid-stamp { position: absolute; top: 180px; right: 60px; transform: rotate(-15deg); border: 4px solid #16a34a; color: #16a34a; padding: 8px 30px; font-size: 32px; font-weight: 900; text-transform: uppercase; opacity: 0.3; border-radius: 8px; }
</style></head><body>
  ${invoice.is_paid ? '<div class="paid-stamp">BETALD</div>' : ''}
  <div class="header">
    <div class="logo-area">
      <img src="/images/workbuddy-logo.png" alt="Logo" onerror="this.style.display='none'" />
      <p style="font-weight:700;margin-top:8px;">${s?.company_name || activeWorkplace?.company_name || ''}</p>
      <p>${s?.org_number ? 'Org.nr: ' + s.org_number : ''}</p>
    </div>
    <div class="invoice-title">
      <h1>FAKTURA</h1>
      <p><strong>Fakturanummer:</strong> ${invoice.invoice_number || '–'}</p>
      <p><strong>Fakturadatum:</strong> ${invoice.invoice_date}</p>
      <p><strong>Förfallodatum:</strong> ${effectiveDueDate}</p>
      <p><strong>Betalningsvillkor:</strong> ${s?.payment_terms_days || 30} dagar</p>
    </div>
  </div>
  <div class="parties">
    <div class="party">
      <h3>Från</h3>
      <p><strong>${s?.company_name || activeWorkplace?.company_name || ''}</strong></p>
      ${s?.address ? `<p>${s.address}</p>` : ''}
      ${s?.postal_code || s?.city ? `<p>${s?.postal_code || ''} ${s?.city || ''}</p>` : ''}
      ${s?.phone ? `<p>Tel: ${s.phone}</p>` : ''}
      ${s?.email ? `<p>${s.email}</p>` : ''}
    </div>
    <div class="party">
      <h3>Till</h3>
      <p><strong>${invoice.customer_name}</strong></p>
      ${invoice.customer_address ? `<p>${invoice.customer_address.replace(/\n/g, '</p><p>')}</p>` : ''}
      ${invoice.customer_org ? `<p>Org.nr: ${invoice.customer_org}</p>` : ''}
      ${invoice.customer_ref ? `<p>Er referens: ${invoice.customer_ref}</p>` : ''}
      ${invoice.our_ref ? `<p>Vår referens: ${invoice.our_ref}</p>` : ''}
    </div>
  </div>
  <table>
    <thead><tr><th>Beskrivning</th><th class="text-right">Antal</th><th class="text-right">À-pris</th><th class="text-right">Moms %</th><th class="text-right">Moms</th><th class="text-right">Summa</th></tr></thead>
    <tbody>
      ${lines.map((l, i) => {
        const c = lineCalcs[i];
        return `<tr><td>${l.description}</td><td class="text-right">${l.quantity}</td><td class="text-right">${fmt(Number(l.unit_price))}</td><td class="text-right">${l.vat_rate}%</td><td class="text-right">${fmt(c.vat)}</td><td class="text-right">${fmt(c.total)}</td></tr>`;
      }).join('')}
    </tbody>
  </table>
  <div class="totals">
    <table>
      <tr><td>Netto</td><td class="text-right">${fmt(totalNet)} kr</td></tr>
      <tr><td>Moms</td><td class="text-right">${fmt(totalVat)} kr</td></tr>
      <tr><td>Att betala</td><td class="text-right">${fmt(totalIncl)} kr</td></tr>
    </table>
  </div>
  ${invoice.notes ? `<div class="notes"><strong>Meddelande:</strong> ${invoice.notes}</div>` : ''}
  <div class="bank-info">
    <h3>Betalningsinformation</h3>
    <div class="bank-grid">
      ${s?.bg_number ? `<div class="bank-item"><label>Bankgiro</label><span>${s.bg_number}</span></div>` : ''}
      ${s?.pg_number ? `<div class="bank-item"><label>Plusgiro</label><span>${s.pg_number}</span></div>` : ''}
      ${s?.bank_name ? `<div class="bank-item"><label>Bank</label><span>${s.bank_name}</span></div>` : ''}
      ${s?.bank_account ? `<div class="bank-item"><label>Kontonummer</label><span>${s.bank_account}</span></div>` : ''}
      ${s?.bank_reference ? `<div class="bank-item"><label>Bankreferens</label><span>${s.bank_reference}</span></div>` : ''}
      <div class="bank-item"><label>OCR / Fakturanr</label><span>${invoice.invoice_number || '–'}</span></div>
    </div>
  </div>
  <div class="footer">
    ${s?.footer_text || `${s?.company_name || activeWorkplace?.company_name || ''} — Tack för ert förtroende!`}
    <br/>Genererad av WorkBuddy HQ — ${new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })}
  </div>
</body></html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 500);
    }
    toast({ title: "Faktura genererad — spara via utskriftsdialogen" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-base font-semibold text-foreground">Skapa faktura</h3>
        <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />Fakturainställningar
        </Button>
      </div>

      {!settings && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4 text-sm text-amber-800 dark:text-amber-200">
            ⚠️ Du har inte konfigurerat dina fakturainställningar ännu. <button className="underline font-medium" onClick={() => setSettingsOpen(true)}>Klicka här</button> för att lägga in företagsuppgifter och bankdetaljer.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Fakturauppgifter</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Fakturanummer</Label><Input value={invoice.invoice_number} onChange={e => setInvoice(p => ({ ...p, invoice_number: e.target.value }))} /></div>
              <div><Label className="text-xs">Fakturadatum</Label><Input type="date" value={invoice.invoice_date} onChange={e => setInvoice(p => ({ ...p, invoice_date: e.target.value }))} /></div>
              <div><Label className="text-xs">Förfallodatum</Label><Input type="date" value={invoice.due_date} placeholder={effectiveDueDate} onChange={e => setInvoice(p => ({ ...p, due_date: e.target.value }))} /></div>
              <div className="flex items-end gap-2 pb-0.5">
                <Switch checked={invoice.is_paid} onCheckedChange={v => setInvoice(p => ({ ...p, is_paid: v }))} />
                <Label className="text-xs">Betald</Label>
              </div>
            </div>
            <div><Label className="text-xs">Vår referens</Label><Input value={invoice.our_ref} onChange={e => setInvoice(p => ({ ...p, our_ref: e.target.value }))} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Kunduppgifter</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Kundnamn *</Label><Input value={invoice.customer_name} onChange={e => setInvoice(p => ({ ...p, customer_name: e.target.value }))} /></div>
            <div><Label className="text-xs">Adress</Label><Textarea rows={2} value={invoice.customer_address} onChange={e => setInvoice(p => ({ ...p, customer_address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Org.nummer</Label><Input value={invoice.customer_org} onChange={e => setInvoice(p => ({ ...p, customer_org: e.target.value }))} /></div>
              <div><Label className="text-xs">Er referens</Label><Input value={invoice.customer_ref} onChange={e => setInvoice(p => ({ ...p, customer_ref: e.target.value }))} /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Fakturarader</CardTitle>
            <Button size="sm" variant="outline" onClick={addLine}><Plus className="h-3 w-3 mr-1" />Lägg till rad</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5"><Label className="text-xs">Beskrivning</Label><Input value={line.description} onChange={e => updateLine(i, "description", e.target.value)} /></div>
              <div className="col-span-2"><Label className="text-xs">Antal</Label><Input type="number" value={line.quantity} onChange={e => updateLine(i, "quantity", e.target.value)} /></div>
              <div className="col-span-2"><Label className="text-xs">À-pris</Label><Input type="number" value={line.unit_price} onChange={e => updateLine(i, "unit_price", e.target.value)} /></div>
              <div className="col-span-1"><Label className="text-xs">Moms%</Label><Input type="number" value={line.vat_rate} onChange={e => updateLine(i, "vat_rate", e.target.value)} /></div>
              <div className="col-span-1 text-right text-sm font-medium pt-5">{fmt(lineCalcs[i].total)} kr</div>
              <div className="col-span-1 pt-5">
                {lines.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeLine(i)}><Trash2 className="h-3 w-3 text-destructive" /></Button>}
              </div>
            </div>
          ))}

          <div className="border-t border-border pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Netto</span><span>{fmt(totalNet)} kr</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Moms</span><span>{fmt(totalVat)} kr</span></div>
            <div className="flex justify-between text-lg font-bold"><span>Att betala</span><span>{fmt(totalIncl)} kr</span></div>
          </div>
        </CardContent>
      </Card>

      <div><Label className="text-xs">Meddelande till kund</Label><Textarea rows={2} value={invoice.notes} onChange={e => setInvoice(p => ({ ...p, notes: e.target.value }))} /></div>

      <Button onClick={handleDownloadPDF} className="w-full" disabled={!invoice.customer_name}>
        <Download className="h-4 w-4 mr-2" />Generera & ladda ner faktura (PDF)
      </Button>

      <InvoiceSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
