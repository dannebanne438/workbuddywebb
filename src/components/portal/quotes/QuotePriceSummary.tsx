import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, Sparkles } from "lucide-react";
import { QuoteData, PACKAGES, MODULES, calculateQuotePrice, PILOT_MAX_USERS } from "./quoteTypes";

interface Props {
  data: QuoteData;
  onTogglePilot: (v: boolean) => void;
}

export function QuotePriceSummary({ data, onTogglePilot }: Props) {
  const price = calculateQuotePrice(data);
  const pkg = PACKAGES[data.selectedPackage];
  const selectedModuleNames = data.selectedModules
    .map((id) => MODULES.find((m) => m.id === id))
    .filter(Boolean);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          Prissammanfattning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Pilot toggle */}
        <div className="flex items-center justify-between rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <Label htmlFor="pilot" className="text-sm font-medium cursor-pointer">Pilotkund</Label>
          </div>
          <Switch id="pilot" checked={data.isPilot} onCheckedChange={onTogglePilot} />
        </div>

        {data.isPilot && (
          <p className="text-xs text-primary bg-primary/10 rounded-md px-3 py-2">
            Pilotpris: 1 990 kr/mån för upp till {PILOT_MAX_USERS} användare. Tilläggsmoduler tillkommer.
          </p>
        )}

        {/* Line items */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paket</span>
            <Badge variant="secondary">{pkg.name}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Antal användare</span>
            <span className="font-medium">{data.customer.employeeCount}</span>
          </div>

          <hr className="border-border" />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Basplattform</span>
            <span>{price.baseCost.toLocaleString("sv-SE")} kr</span>
          </div>
          {!price.isPilot && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Användaravgift ({data.customer.employeeCount} × {pkg.perUser} kr)</span>
              <span>{price.userCost.toLocaleString("sv-SE")} kr</span>
            </div>
          )}

          {selectedModuleNames.length > 0 && (
            <>
              <hr className="border-border" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tilläggsmoduler</p>
              {selectedModuleNames.map((mod) => (
                <div key={mod!.id} className="flex justify-between pl-2">
                  <span className="text-muted-foreground">{mod!.name}</span>
                  <span>{mod!.monthlyPrice === 0 ? "Ingår" : `${mod!.monthlyPrice.toLocaleString("sv-SE")} kr`}</span>
                </div>
              ))}
            </>
          )}

          <hr className="border-border" />

          <div className="flex justify-between text-base font-semibold">
            <span>Totalt per månad</span>
            <span className="text-primary">{price.totalMonthly.toLocaleString("sv-SE")} kr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Totalt per år</span>
            <span className="font-semibold">{price.totalYearly.toLocaleString("sv-SE")} kr</span>
          </div>
        </div>

        {/* Big total */}
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-5 text-center">
          <p className="text-sm text-muted-foreground mb-1">Månadskostnad</p>
          <p className="text-3xl font-bold text-primary">{price.totalMonthly.toLocaleString("sv-SE")} kr</p>
          <p className="text-xs text-muted-foreground mt-1">exkl. moms</p>
        </div>
      </CardContent>
    </Card>
  );
}
