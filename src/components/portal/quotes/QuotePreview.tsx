import { Card, CardContent } from "@/components/ui/card";
import { QuoteData, PACKAGES, MODULES, calculateQuotePrice } from "./quoteTypes";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface Props {
  data: QuoteData;
}

export function QuotePreview({ data }: Props) {
  const pkg = PACKAGES[data.selectedPackage];
  const price = calculateQuotePrice(data);
  const selectedMods = data.selectedModules
    .map((id) => MODULES.find((m) => m.id === id))
    .filter(Boolean);
  const today = format(new Date(), "d MMMM yyyy", { locale: sv });

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-card border-b border-border">
          {/* Header */}
          <div className="px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/workbuddy-logo.png" alt="WorkBuddy" className="h-8 w-auto" />
              <span className="text-xl font-bold text-foreground">WorkBuddy</span>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p className="font-medium text-foreground">OFFERT</p>
              <p>{today}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6 text-sm">
          {/* Customer */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Till</p>
            <p className="font-semibold text-foreground">{data.customer.companyName || "—"}</p>
            <p className="text-muted-foreground">{data.customer.contactPerson}</p>
            <p className="text-muted-foreground">{data.customer.email}</p>
          </div>

          {/* Package */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Paketinnehåll</p>
            <div className="rounded-lg border border-border p-4">
              <p className="font-semibold text-foreground">{pkg.name}</p>
              <p className="text-muted-foreground text-xs mt-1">{pkg.description}</p>
              {selectedMods.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tilläggsmoduler:</p>
                  <ul className="space-y-1">
                    {selectedMods.map((m) => (
                      <li key={m!.id} className="text-xs text-foreground">• {m!.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Pricing table */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Pris</p>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5 text-muted-foreground">Basplattform ({pkg.name})</td>
                    <td className="px-4 py-2.5 text-right font-medium">{price.baseCost.toLocaleString("sv-SE")} kr</td>
                  </tr>
                  {!price.isPilot && (
                    <tr className="border-b border-border">
                      <td className="px-4 py-2.5 text-muted-foreground">Användaravgift ({data.customer.employeeCount} användare)</td>
                      <td className="px-4 py-2.5 text-right font-medium">{price.userCost.toLocaleString("sv-SE")} kr</td>
                    </tr>
                  )}
                  {price.modulesCost > 0 && (
                    <tr className="border-b border-border">
                      <td className="px-4 py-2.5 text-muted-foreground">Tilläggsmoduler</td>
                      <td className="px-4 py-2.5 text-right font-medium">{price.modulesCost.toLocaleString("sv-SE")} kr</td>
                    </tr>
                  )}
                  <tr className="bg-primary/5">
                    <td className="px-4 py-3 font-semibold text-foreground">Totalt per månad</td>
                    <td className="px-4 py-3 text-right font-bold text-primary text-base">{price.totalMonthly.toLocaleString("sv-SE")} kr</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">Alla priser exkl. moms</p>
          </div>

          {/* Quote text */}
          {data.quoteText && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Meddelande</p>
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {data.quoteText}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
