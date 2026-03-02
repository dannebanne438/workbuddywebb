import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFinanceData } from "./useFinanceData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2, CheckCircle } from "lucide-react";

export function FinanceReceipts() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const d = useFinanceData(month);
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleFileUpload = async (file: File) => {
    if (!d.workplaceId || !user) return;
    setUploading(true);
    setAiResult(null);

    try {
      const ext = file.name.split(".").pop();
      const path = `${d.workplaceId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("camera-uploads").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("camera-uploads").getPublicUrl(path);
      const imageUrl = urlData.publicUrl;

      // AI analysis
      setUploading(false);
      setAnalyzing(true);

      const { data: fnData, error: fnError } = await supabase.functions.invoke("analyze-receipt", {
        body: { imageUrl },
      });

      const parsed = fnError ? null : fnData;

      const receiptData = {
        image_url: imageUrl,
        receipt_date: parsed?.date || new Date().toISOString().slice(0, 10),
        supplier_name: parsed?.supplier || null,
        amount: parsed?.amount || null,
        vat_amount: parsed?.vat_amount || null,
        category: parsed?.category || null,
        ai_parsed_data: parsed || null,
        is_processed: false,
      };

      d.addReceipt.mutate(receiptData);
      setAiResult(parsed);
    } catch (err: any) {
      toast({ title: "Fel vid uppladdning", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleCreateExpenseFromReceipt = (receipt: any) => {
    d.addExpense.mutate({
      expense_date: receipt.receipt_date || new Date().toISOString().slice(0, 10),
      supplier_name: receipt.supplier_name || "Okänd",
      category: receipt.category || null,
      description: `Kvitto #${receipt.id.slice(0, 8)}`,
      amount_excl_vat: Number(receipt.amount || 0) - Number(receipt.vat_amount || 0),
      vat_rate: receipt.amount && receipt.vat_amount ? (Number(receipt.vat_amount) / (Number(receipt.amount) - Number(receipt.vat_amount)) * 100) : 25,
      is_personal_withdrawal: false,
      is_paid: true,
      receipt_id: receipt.id,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-48" />
        <div className="flex gap-2">
          <Button onClick={() => fileRef.current?.click()} disabled={uploading || analyzing}>
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Ladda upp kvitto
          </Button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />
          <Button variant="outline" onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.capture = "environment"; input.onchange = (e: any) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }; input.click(); }}>
            <Camera className="h-4 w-4 mr-2" />Ta foto
          </Button>
        </div>
      </div>

      {analyzing && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-foreground">AI analyserar kvittot...</p>
          </CardContent>
        </Card>
      )}

      {aiResult && (
        <Card className="border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="py-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-medium text-foreground">AI-analys klar</p>
            </div>
            <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
              <div>Belopp: <strong>{aiResult.amount} kr</strong></div>
              <div>Moms: <strong>{aiResult.vat_amount} kr</strong></div>
              <div>Leverantör: <strong>{aiResult.supplier || "Okänd"}</strong></div>
              <div>Kategori: <strong>{aiResult.category || "–"}</strong></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {d.receipts.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">Inga kvitton denna period</p>
        )}
        {d.receipts.map(r => (
          <Card key={r.id}>
            <CardContent className="p-4 space-y-3">
              {r.image_url && (
                <img src={r.image_url} alt="Kvitto" className="w-full h-32 object-cover rounded-lg" />
              )}
              <div className="text-sm space-y-1">
                <p className="font-medium">{r.supplier_name || "Okänd leverantör"}</p>
                <p className="text-muted-foreground">{r.receipt_date || "–"}</p>
                <p>Belopp: <strong>{r.amount ? `${r.amount} kr` : "–"}</strong></p>
                <p>Moms: <strong>{r.vat_amount ? `${r.vat_amount} kr` : "–"}</strong></p>
              </div>
              {!r.is_processed && (
                <Button size="sm" variant="outline" className="w-full" onClick={() => handleCreateExpenseFromReceipt(r)}>
                  Skapa utgift från kvitto
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
