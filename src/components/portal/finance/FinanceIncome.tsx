import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFinanceData } from "./useFinanceData";
import { Plus, Trash2 } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 2 }).format(n);
}

export function FinanceIncome() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const d = useFinanceData(month);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    invoice_date: new Date().toISOString().slice(0, 10),
    customer_name: "",
    invoice_number: "",
    service_description: "",
    amount_excl_vat: "",
    vat_rate: "25",
    is_paid: false,
  });

  const amountExcl = Number(form.amount_excl_vat) || 0;
  const vatRate = Number(form.vat_rate) || 25;
  const vatAmount = amountExcl * vatRate / 100;
  const amountIncl = amountExcl + vatAmount;

  const handleSubmit = () => {
    if (!form.customer_name || !form.amount_excl_vat) return;
    d.addIncome.mutate({
      invoice_date: form.invoice_date,
      customer_name: form.customer_name,
      invoice_number: form.invoice_number || null,
      service_description: form.service_description || null,
      amount_excl_vat: amountExcl,
      vat_rate: vatRate,
      is_paid: form.is_paid,
    });
    setOpen(false);
    setForm({ invoice_date: new Date().toISOString().slice(0, 10), customer_name: "", invoice_number: "", service_description: "", amount_excl_vat: "", vat_rate: "25", is_paid: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-48" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Lägg till inkomst</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ny inkomst</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Datum</Label><Input type="date" value={form.invoice_date} onChange={e => setForm(p => ({ ...p, invoice_date: e.target.value }))} /></div>
              <div><Label>Kund *</Label><Input value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} /></div>
              <div><Label>Fakturanummer</Label><Input value={form.invoice_number} onChange={e => setForm(p => ({ ...p, invoice_number: e.target.value }))} /></div>
              <div><Label>Tjänst/Paket</Label><Input value={form.service_description} onChange={e => setForm(p => ({ ...p, service_description: e.target.value }))} /></div>
              <div><Label>Belopp exkl moms *</Label><Input type="number" value={form.amount_excl_vat} onChange={e => setForm(p => ({ ...p, amount_excl_vat: e.target.value }))} /></div>
              <div><Label>Moms %</Label><Input type="number" value={form.vat_rate} onChange={e => setForm(p => ({ ...p, vat_rate: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted p-3 rounded-lg">
                <div><span className="text-muted-foreground">Moms:</span> <strong>{fmt(vatAmount)} kr</strong></div>
                <div><span className="text-muted-foreground">Inkl moms:</span> <strong>{fmt(amountIncl)} kr</strong></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_paid} onCheckedChange={v => setForm(p => ({ ...p, is_paid: v }))} />
                <Label>Betald</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={d.addIncome.isPending}>Spara</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inkomster — {fmt(d.totalIncomeExclVat)} kr (exkl moms)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Kund</TableHead>
                  <TableHead>Faktura #</TableHead>
                  <TableHead>Tjänst</TableHead>
                  <TableHead className="text-right">Exkl moms</TableHead>
                  <TableHead className="text-right">Moms</TableHead>
                  <TableHead className="text-right">Inkl moms</TableHead>
                  <TableHead>Betald</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.income.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Inga inkomster registrerade</TableCell></TableRow>
                )}
                {d.income.map(i => (
                  <TableRow key={i.id}>
                    <TableCell>{i.invoice_date}</TableCell>
                    <TableCell>{i.customer_name}</TableCell>
                    <TableCell>{i.invoice_number || "–"}</TableCell>
                    <TableCell>{i.service_description || "–"}</TableCell>
                    <TableCell className="text-right">{fmt(Number(i.amount_excl_vat))}</TableCell>
                    <TableCell className="text-right">{fmt(Number(i.vat_amount))}</TableCell>
                    <TableCell className="text-right font-medium">{fmt(Number(i.amount_incl_vat))}</TableCell>
                    <TableCell>{i.is_paid ? <span className="text-emerald-600">Ja</span> : <span className="text-amber-600">Nej</span>}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => d.deleteIncome.mutate(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
