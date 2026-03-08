import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, PACKAGES } from "./quoteTypes";
import { cn } from "@/lib/utils";
import { Check, Layers } from "lucide-react";

interface Props {
  selected: Package;
  onSelect: (p: Package) => void;
}

const TIERS: Package[] = ["starter", "business", "enterprise"];

export function QuotePackageSelector({ selected, onSelect }: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-primary" />
          Välj paket
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((tier) => {
          const pkg = PACKAGES[tier];
          const isSelected = selected === tier;
          return (
            <button
              key={tier}
              type="button"
              onClick={() => onSelect(tier)}
              className={cn(
                "relative flex flex-col items-start gap-2 rounded-xl border-2 p-5 text-left transition-all duration-200 hover:shadow-md",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <span className={cn("text-lg font-bold", isSelected ? "text-primary" : "text-foreground")}>
                {pkg.name}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{pkg.description}</p>
              <div className="mt-auto pt-3 border-t border-border w-full">
                <span className="text-2xl font-bold text-foreground">{pkg.baseCost.toLocaleString("sv-SE")} kr</span>
                <span className="text-sm text-muted-foreground">/mån</span>
                <p className="text-xs text-muted-foreground mt-1">+ {pkg.perUser} kr/användare</p>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
