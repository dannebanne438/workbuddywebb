import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert } from "lucide-react";
import { FinanceDashboard } from "./FinanceDashboard";
import { FinanceIncome } from "./FinanceIncome";
import { FinanceExpenses } from "./FinanceExpenses";
import { FinanceReceipts } from "./FinanceReceipts";
import { FinanceVatCenter } from "./FinanceVatCenter";
import { FinanceExport } from "./FinanceExport";
import { InvoiceGenerator } from "./InvoiceGenerator";
import { QuoteToolView } from "../quotes/QuoteToolView";

export function FinanceView() {
  const { isSuperAdmin, isWorkplaceAdmin } = useAuth();
  const hasAccess = isSuperAdmin || isWorkplaceAdmin;

  if (!hasAccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background gap-3">
        <ShieldAlert className="h-12 w-12 text-destructive/60" />
        <h2 className="text-lg font-semibold text-foreground">Åtkomst nekad</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Du har inte behörighet att se ekonomimodulen. Kontakta din administratör.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card">
        <h1 className="text-xl font-bold text-foreground">Ekonomi</h1>
        <p className="text-sm text-muted-foreground">Hantera inkomster, utgifter, kvitton och moms</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="income">Inkomster</TabsTrigger>
            <TabsTrigger value="expenses">Utgifter</TabsTrigger>
            <TabsTrigger value="receipts">Kvitton</TabsTrigger>
            <TabsTrigger value="vat">Momscenter</TabsTrigger>
            <TabsTrigger value="invoices">Fakturor</TabsTrigger>
            <TabsTrigger value="quotes">Offerter</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><FinanceDashboard /></TabsContent>
          <TabsContent value="income"><FinanceIncome /></TabsContent>
          <TabsContent value="expenses"><FinanceExpenses /></TabsContent>
          <TabsContent value="receipts"><FinanceReceipts /></TabsContent>
          <TabsContent value="vat"><FinanceVatCenter /></TabsContent>
          <TabsContent value="invoices"><InvoiceGenerator /></TabsContent>
          <TabsContent value="quotes"><QuoteToolView /></TabsContent>
          <TabsContent value="export"><FinanceExport /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
