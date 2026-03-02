import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFinanceData } from "./useFinanceData";
import { TrendingUp, TrendingDown, Receipt, Landmark, ArrowRightLeft } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(n);
}

export function FinanceDashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.toISOString().slice(0, 7));
  const d = useFinanceData(month);

  const cards = [
    { label: "Omsättning (exkl moms)", value: d.totalIncomeExclVat, icon: TrendingUp, positive: true },
    { label: "Kostnader (exkl moms)", value: d.totalExpensesExclVat, icon: TrendingDown, positive: false },
    { label: "Resultat", value: d.result, icon: ArrowRightLeft, positive: d.result >= 0 },
    { label: "Utgående moms", value: d.totalIncomeVat, icon: Receipt, positive: true },
    { label: "Ingående moms", value: d.totalExpensesVat, icon: Receipt, positive: true },
    { label: "Moms att betala", value: d.vatToPay, icon: Landmark, positive: d.vatToPay <= 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground">Period:</label>
        <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${c.value > 0 && c.positive ? "text-emerald-600 dark:text-emerald-400" : c.value < 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                {fmt(c.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* VAT Account Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Momskonto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Rekommenderat att avsätta</p>
              <p className="text-lg font-semibold text-foreground">{fmt(d.recommendedVatDeposit)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Redan inlagt</p>
              <p className="text-lg font-semibold text-foreground">{fmt(d.totalVatDeposited)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Differens</p>
              <p className={`text-lg font-semibold ${d.vatDifference > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {d.vatDifference > 0 ? `Du bör lägga in ${fmt(d.vatDifference)} till` : "✓ Fullt avsatt"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liquidity overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kvittobank / Likviditetsöversikt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Totalt registrerat denna månad</p>
          <p className="text-2xl font-bold text-foreground">{fmt(d.totalIncomeInclVat)}</p>
          <p className="text-xs text-muted-foreground mt-1">{d.income.length} fakturor, {d.receipts.length} kvitton</p>
        </CardContent>
      </Card>
    </div>
  );
}
