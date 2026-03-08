import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { QuoteData, PACKAGES, MODULES, calculateQuotePrice } from "./quoteTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  data: QuoteData;
  quoteText: string;
  onTextChange: (text: string) => void;
}

export function QuoteTextGenerator({ data, quoteText, onTextChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateText = async () => {
    setLoading(true);
    try {
      const pkg = PACKAGES[data.selectedPackage];
      const modules = data.selectedModules
        .map((id) => MODULES.find((m) => m.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      const price = calculateQuotePrice(data);

      const prompt = `Du är en professionell säljare för WorkBuddy, en modern SaaS-plattform för arbetsplatser. Skriv en professionell offerttext på svenska baserat på följande:
- Företag: ${data.customer.companyName || "Kunden"}
- Kontaktperson: ${data.customer.contactPerson || "N/A"}
- Bransch: ${data.customer.industry || "Ej specificerad"}
- Antal anställda: ${data.customer.employeeCount}
- Paket: ${pkg.name}
- Moduler: ${modules || "Inga tilläggsmoduler"}
- Behovsbeskrivning: ${data.customer.comment || "Ej specificerat"}
- Totalt pris: ${price.totalMonthly.toLocaleString("sv-SE")} kr/mån

Skriv max 250 ord. Tonalitet: professionell, enkel, säljande men inte aggressiv. Inkludera en kort intro, vad lösningen innehåller, och en avslutning. Använd inte markdown-formatering.`;

      const { data: fnData, error } = await supabase.functions.invoke("workbuddy-chat", {
        body: { messages: [{ role: "user", content: prompt }], skipSave: true },
      });

      if (error) throw error;
      const text = fnData?.response || fnData?.choices?.[0]?.message?.content || "";
      onTextChange(text);
    } catch (e) {
      console.error("Quote text generation error:", e);
      // Fallback to template
      const pkg = PACKAGES[data.selectedPackage];
      const modules = data.selectedModules
        .map((id) => MODULES.find((m) => m.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      const price = calculateQuotePrice(data);

      const fallback = `Tack för ert intresse för WorkBuddy.

Baserat på ert behov${data.customer.industry ? ` inom ${data.customer.industry.toLowerCase()}` : ""} och med ${data.customer.employeeCount} medarbetare rekommenderar vi vårt ${pkg.name}-paket${modules ? ` med tilläggsmodulerna ${modules}` : ""}.

WorkBuddy ger er en komplett digital arbetsplatsplattform med AI-stödd kommunikation, effektiv personalhantering och operativ kontroll – allt samlat i en modern och användarvänlig lösning.

Totalt pris: ${price.totalMonthly.toLocaleString("sv-SE")} kr/mån (exkl. moms).

Vi ser fram emot att hjälpa ${data.customer.companyName || "ert företag"} att ta nästa steg mot en smartare arbetsplats.

Med vänliga hälsningar,
WorkBuddy-teamet`;

      onTextChange(fallback);
      toast({ title: "Offerttext genererad", description: "Kunde inte nå AI — malltext använd istället." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(quoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Kopierat!" });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Offerttext
          </CardTitle>
          <div className="flex gap-2">
            {quoteText && (
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Kopierat" : "Kopiera"}
              </Button>
            )}
            <Button size="sm" onClick={generateText} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generera offerttext
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Klicka på 'Generera offerttext' eller skriv manuellt..."
          value={quoteText}
          onChange={(e) => onTextChange(e.target.value)}
          rows={10}
          className="text-sm leading-relaxed"
        />
      </CardContent>
    </Card>
  );
}
