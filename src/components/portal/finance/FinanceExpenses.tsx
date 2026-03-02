import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFinanceData } from "./useFinanceData";
import { Plus, Trash2 } from "lucide-react";

const CATEGORIES = ["Material", "Hyra", "Fordon", "Telefon", "IT", "Försäkring", "Lön", "Övrigt"];

function fmt(n: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 2 }).format(n);
}

export function FinanceExpenses() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const d = useFinanceData(month);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    expense_date: new Date().toISOString().slice(0, 10),
    supplier_name: "",
    category: "",
    description: "",
    amount_excl_vat: "",
    vat_rate: "25",
    is_personal_withdrawal: false,
    is_paid: false,
  });

  const amountExcl = Number(form.amount_excl_vat) || 0;
  const vatRate = Number(form.vat_rate) || 25;
  const vatAmount = amountExcl * vatRate / 100;
  const amountIncl = amountExcl + vatAmount;

  const handleSubmit = () => {
    if (!form.supplier_name || !form.amount_excl_vat) return;
    d.addExpense.mutate({
      expense_date: form.expense_date,
      supplier_name: form.supplier_name,
      category: form.category || null,
      description: form.description || null,
      amount_excl_vat: amountExcl,
      vat_rate: vatRate,
      is_personal_withdrawal: form.is_personal_withdrawal,
      is_paid: form.is_paid,
    });
    setOpen(false);
    setForm({ expense_date: new Date().toISOString().slice(0, 10), supplier_name: "", category: "", description: "", amount_excl_vat: "", vat_rate: "25", is_personal_withdrawal: false, is_paid: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-48" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Lägg till utgift</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ny utgift</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Datum</Label><Input type="date" value={form.expense_date} onChange={e => setForm(p => ({ ...p, expense_date: e.target.value }))} /></div>
              <div><Label>Leverantör *</Label><Input value={form.supplier_name} onChange={e => setForm(p => ({ ...p, supplier_name: e.target.value }))} /></div>
              <div>
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Välj kategori" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Beskrivning</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div><Label>Belopp exkl moms *</Label><Input type="number" value={form.amount_excl_vat} onChange={e => setForm(p => ({ ...p, amount_excl_vat: e.target.value }))} /></div>
              <div><Label>Moms %</Label><Input type="number" value={form.vat_rate} onChange={e => setForm(p => ({ ...p, vat_rate: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted p-3 rounded-lg">
                <div><span className="text-muted-foreground">Moms:</span> <strong>{fmt(vatAmount)} kr</strong></div>
                <div><span className="text-muted-foreground">Inkl moms:</span> <strong>{fmt(amountIncl)} kr</strong></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_personal_withdrawal} onCheckedChange={v => setForm(p => ({ ...p, is_personal_withdrawal: v }))} />
                <Label>Eget uttag</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_paid} onCheckedChange={v => setForm(p => ({ ...p, is_paid: v }))} />
                <Label>Betald</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={d.addExpense.isPending}>Spara</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Utgifter — {fmt(d.totalExpensesExclVat)} kr (exkl moms, exkl eget uttag)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Leverantör</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Beskrivning</TableHead>
                  <TableHead className="text-right">Exkl moms</TableHead>
                  <TableHead className="text-right">Moms</TableHead>
                  <TableHead className="text-right">Inkl moms</TableHead>
                  <TableHead>Eget</TableHead>
                  <TableHead>Betald</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.expenses.length === 0 && (
                  <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">Inga utgifter registrerade</TableCell></TableRow>
                )}
                {d.expenses.map(e => (
                  <TableRow key={e.id} className={e.is_personal_withdrawal ? "opacity-60" : ""}>
                    <TableCell>{e.expense_date}</TableCell>
                    <TableCell>{e.supplier_name}</TableCell>
                    <TableCell>{e.category || "–"}</TableCell>
                    <TableCell>{e.description || "–"}</TableCell>
                    <TableCell className="text-right">{fmt(Number(e.amount_excl_vat))}</TableCell>
                    <TableCell className="text-right">{fmt(Number(e.vat_amount))}</TableCell>
                    <TableCell className="text-right font-medium">{fmt(Number(e.amount_incl_vat))}</TableCell>
                    <TableCell>{e.is_personal_withdrawal ? "Ja" : "Nej"}</TableCell>
                    <TableCell>{e.is_paid ? <span className="text-emerald-600">Ja</span> : <span className="text-amber-600">Nej</span>}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => d.deleteExpense.mutate(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
