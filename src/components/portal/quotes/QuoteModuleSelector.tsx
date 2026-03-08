import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MODULES } from "./quoteTypes";
import { cn } from "@/lib/utils";
import { Check, Puzzle } from "lucide-react";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

export function QuoteModuleSelector({ selected, onToggle }: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Puzzle className="h-5 w-5 text-primary" />
          Lägg till moduler
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {MODULES.map((mod) => {
          const isSelected = selected.includes(mod.id);
          const isFree = mod.monthlyPrice === 0;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onToggle(mod.id)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-200 hover:shadow-sm",
                isSelected
                  ? "border-primary/60 bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground/30"
              )}
            >
              <div className={cn(
                "mt-0.5 h-5 w-5 shrink-0 rounded border flex items-center justify-center transition-colors",
                isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"
              )}>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-foreground">{mod.name}</span>
                  <span className={cn("text-xs font-semibold shrink-0", isFree ? "text-green-600" : "text-muted-foreground")}>
                    {isFree ? "Ingår" : `+${mod.monthlyPrice.toLocaleString("sv-SE")} kr/mån`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mod.description}</p>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
