import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinanceData } from "./useFinanceData";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Loader2 } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(n);
}

export function FinanceExport() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const d = useFinanceData(month);
  const { activeWorkplace } = useWorkplace();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-finance-pdf", {
        body: {
          workplaceId: d.workplaceId,
          month,
          companyName: activeWorkplace?.company_name || "–",
          income: d.income,
          expenses: d.expenses,
          totals: {
            totalIncomeExclVat: d.totalIncomeExclVat,
            totalIncomeVat: d.totalIncomeVat,
            totalExpensesExclVat: d.totalExpensesExclVat,
            totalExpensesVat: d.totalExpensesVat,
            vatToPay: d.vatToPay,
            result: d.result,
            recommendedVatDeposit: d.recommendedVatDeposit,
            totalVatDeposited: d.totalVatDeposited,
          },
        },
      });

      if (error) throw error;

      if (data?.html) {
        // Open HTML in new window for print-to-PDF
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(data.html);
          printWindow.document.close();
          printWindow.print();
        }
        toast({ title: "PDF genererad — använd utskriftsdialogen för att spara" });
      } else if (data?.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
        toast({ title: "PDF genererad" });
      }
    } catch (err: any) {
      toast({ title: "Kunde inte generera PDF", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Label>Period:</Label>
        <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-48" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ekonomirapport — {month}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Inkomster</h4>
              <p className="text-muted-foreground">Exkl moms: <strong className="text-foreground">{fmt(d.totalIncomeExclVat)} kr</strong></p>
              <p className="text-muted-foreground">Moms: <strong className="text-foreground">{fmt(d.totalIncomeVat)} kr</strong></p>
              <p className="text-muted-foreground">Antal: <strong className="text-foreground">{d.income.length}</strong></p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Utgifter</h4>
              <p className="text-muted-foreground">Exkl moms: <strong className="text-foreground">{fmt(d.totalExpensesExclVat)} kr</strong></p>
              <p className="text-muted-foreground">Moms: <strong className="text-foreground">{fmt(d.totalExpensesVat)} kr</strong></p>
              <p className="text-muted-foreground">Antal: <strong className="text-foreground">{d.expenses.length}</strong></p>
            </div>
          </div>

          <div className="border-t border-border pt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Resultat</p>
              <p className={`text-xl font-bold ${d.result >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{fmt(d.result)} kr</p>
            </div>
            <div>
              <p className="text-muted-foreground">Moms att betala</p>
              <p className="text-xl font-bold text-foreground">{fmt(d.vatToPay)} kr</p>
            </div>
          </div>

          <Button onClick={handleExport} disabled={generating} className="w-full">
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Generera & ladda ner PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
