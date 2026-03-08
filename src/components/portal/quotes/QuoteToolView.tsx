import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { FileText, Eye, Download, Save, ClipboardList, TrendingUp, CheckCircle2 } from "lucide-react";
import { QuoteCustomerForm } from "./QuoteCustomerForm";
import { QuotePackageSelector } from "./QuotePackageSelector";
import { QuoteModuleSelector } from "./QuoteModuleSelector";
import { QuotePriceSummary } from "./QuotePriceSummary";
import { QuoteTextGenerator } from "./QuoteTextGenerator";
import { QuotePreview } from "./QuotePreview";
import { QuoteCRMSection } from "./QuoteCRMSection";
import {
  type Package,
  type QuoteData,
  DEFAULT_CUSTOMER,
  DUMMY_QUOTES,
} from "./quoteTypes";

const stats = [
  { label: "Aktiva offerter", value: "3", icon: ClipboardList, color: "text-primary" },
  { label: "Skickade offerter", value: "7", icon: TrendingUp, color: "text-amber-500" },
  { label: "Accepterade offerter", value: "4", icon: CheckCircle2, color: "text-green-500" },
];

export function QuoteToolView() {
  const [activeTab, setActiveTab] = useState("generator");
  const [data, setData] = useState<QuoteData>({
    customer: { ...DEFAULT_CUSTOMER },
    selectedPackage: "business",
    selectedModules: ["documents"],
    isPilot: false,
    quoteText: "",
  });
  const [showPreview, setShowPreview] = useState(false);

  const toggleModule = (id: string) => {
    setData((prev) => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(id)
        ? prev.selectedModules.filter((m) => m !== id)
        : [...prev.selectedModules, id],
    }));
  };

  const handleSave = () => {
    toast({ title: "Offert sparad", description: `Offert för ${data.customer.companyName || "kund"} har sparats.` });
  };

  const handleExportPDF = () => {
    toast({ title: "PDF-export", description: "PDF-export kommer snart. Funktionen förbereds." });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Offertverktyg</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Skapa och beräkna offerter för WorkBuddy snabbt och professionellt.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Skapa offert</TabsTrigger>
          <TabsTrigger value="preview">Förhandsgranskning</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column: form */}
            <div className="lg:col-span-2 space-y-6">
              <QuoteCustomerForm
                customer={data.customer}
                onChange={(c) => setData((prev) => ({ ...prev, customer: c }))}
              />
              <QuotePackageSelector
                selected={data.selectedPackage}
                onSelect={(p) => setData((prev) => ({ ...prev, selectedPackage: p }))}
              />
              <QuoteModuleSelector
                selected={data.selectedModules}
                onToggle={toggleModule}
              />
              <QuoteTextGenerator
                data={data}
                quoteText={data.quoteText}
                onTextChange={(t) => setData((prev) => ({ ...prev, quoteText: t }))}
              />

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4" /> Spara offert
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("preview")}>
                  <Eye className="h-4 w-4" /> Förhandsgranska
                </Button>
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="h-4 w-4" /> Exportera PDF
                </Button>
              </div>
            </div>

            {/* Right column: price summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <QuotePriceSummary
                  data={data}
                  onTogglePilot={(v) => setData((prev) => ({ ...prev, isPilot: v }))}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <div className="max-w-3xl mx-auto">
            <QuotePreview data={data} />
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" onClick={() => setActiveTab("generator")}>
                Tillbaka till redigering
              </Button>
              <Button onClick={handleExportPDF}>
                <Download className="h-4 w-4" /> Exportera PDF
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="crm" className="mt-6">
          <QuoteCRMSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
