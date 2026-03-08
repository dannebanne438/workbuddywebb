import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Building2 } from "lucide-react";
import { DUMMY_LEADS, DUMMY_QUOTES, type CRMLead, type CRMQuote } from "./quoteTypes";

const leadStatusMap: Record<CRMLead["status"], { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  new: { label: "Ny", variant: "default" },
  contacted: { label: "Kontaktad", variant: "secondary" },
  qualified: { label: "Kvalificerad", variant: "outline" },
  proposal: { label: "Offert", variant: "default" },
};

const quoteStatusMap: Record<CRMQuote["status"], { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Utkast", variant: "secondary" },
  sent: { label: "Skickad", variant: "default" },
  accepted: { label: "Accepterad", variant: "default" },
  declined: { label: "Nekad", variant: "destructive" },
};

export function QuoteCRMSection() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Försäljningsöversikt</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="leads">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leads" className="text-xs">
              <Users className="h-3.5 w-3.5 mr-1" /> Leads
            </TabsTrigger>
            <TabsTrigger value="quotes" className="text-xs">
              <FileText className="h-3.5 w-3.5 mr-1" /> Offerter
            </TabsTrigger>
            <TabsTrigger value="customers" className="text-xs">
              <Building2 className="h-3.5 w-3.5 mr-1" /> Kunder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-3">
            <div className="space-y-2">
              {DUMMY_LEADS.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-foreground">{lead.company}</p>
                    <p className="text-xs text-muted-foreground">{lead.contact} · {lead.date}</p>
                  </div>
                  <Badge variant={leadStatusMap[lead.status].variant} className="text-xs">
                    {leadStatusMap[lead.status].label}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quotes" className="mt-3">
            <div className="space-y-2">
              {DUMMY_QUOTES.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-foreground">{q.company}</p>
                    <p className="text-xs text-muted-foreground">{q.id} · {q.package} · {q.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{q.total.toLocaleString("sv-SE")} kr/mån</p>
                    <Badge variant={quoteStatusMap[q.status].variant} className="text-xs">
                      {quoteStatusMap[q.status].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="customers" className="mt-3">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Accepterade offerter visas här som kunder.</p>
              <p className="text-xs text-muted-foreground mt-1">1 aktiv kund: EventPro Nordic</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
