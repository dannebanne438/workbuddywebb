import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinanceData } from "./useFinanceData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowDown, ArrowUp } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(n);
}

export function FinanceVatCenter() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const d = useFinanceData(month);
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");

  const handleAddDeposit = async () => {
    if (!depositAmount || !d.workplaceId) return;
    const { error } = await supabase.from("finance_vat_deposits").insert({
      workplace_id: d.workplaceId,
      created_by: user?.id,
      amount: Number(depositAmount),
      note: depositNote || null,
    });
    if (error) {
      toast({ title: "Fel", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Insättning registrerad" });
      d.invalidateAll();
      setOpen(false);
      setDepositAmount("");
      setDepositNote("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUp className="h-4 w-4" /> Utgående moms (försäljning)
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{fmt(d.totalIncomeVat)} kr</p></CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDown className="h-4 w-4" /> Ingående moms (inköp)
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{fmt(d.totalExpensesVat)} kr</p></CardContent>
        </Card>
      </div>

      <Card className={d.vatToPay > 0 ? "border-amber-500/30" : "border-emerald-500/30"}>
        <CardHeader>
          <CardTitle className="text-base">Momssammanställning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Totala inkomster exkl moms</p>
              <p className="text-lg font-semibold">{fmt(d.totalIncomeExclVat)} kr</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Totala kostnader exkl moms</p>
              <p className="text-lg font-semibold">{fmt(d.totalExpensesExclVat)} kr</p>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">Moms att {d.vatToPay >= 0 ? "betala" : "få tillbaka"}</p>
            <p className={`text-2xl font-bold ${d.vatToPay > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {fmt(Math.abs(d.vatToPay))} kr
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Momskonto-insättningar</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Registrera insättning</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Ny insättning momskonto</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Belopp *</Label><Input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} /></div>
                <div><Label>Notering</Label><Input value={depositNote} onChange={e => setDepositNote(e.target.value)} /></div>
                <Button onClick={handleAddDeposit} className="w-full">Registrera</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 rounded-lg bg-muted grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Rekommenderat</p>
              <p className="font-semibold">{fmt(d.recommendedVatDeposit)} kr</p>
            </div>
            <div>
              <p className="text-muted-foreground">Inlagt</p>
              <p className="font-semibold">{fmt(d.totalVatDeposited)} kr</p>
            </div>
            <div>
              <p className="text-muted-foreground">Differens</p>
              <p className={`font-semibold ${d.vatDifference > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                {d.vatDifference > 0 ? `+${fmt(d.vatDifference)} kr` : "✓ OK"}
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Belopp</TableHead>
                <TableHead>Notering</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.vatDeposits.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">Inga insättningar</TableCell></TableRow>
              )}
              {d.vatDeposits.map(dep => (
                <TableRow key={dep.id}>
                  <TableCell>{dep.deposit_date}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(Number(dep.amount))} kr</TableCell>
                  <TableCell>{dep.note || "–"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
