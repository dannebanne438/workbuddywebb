import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { QuoteCustomer, INDUSTRIES } from "./quoteTypes";

interface Props {
  customer: QuoteCustomer;
  onChange: (c: QuoteCustomer) => void;
}

export function QuoteCustomerForm({ customer, onChange }: Props) {
  const set = (field: keyof QuoteCustomer, value: string | number) =>
    onChange({ ...customer, [field]: value });

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          Kundinformation
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Företagsnamn</Label>
          <Input id="companyName" placeholder="AB Företaget" value={customer.companyName} onChange={(e) => set("companyName", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactPerson">Kontaktperson</Label>
          <Input id="contactPerson" placeholder="Anna Svensson" value={customer.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-post</Label>
          <Input id="email" type="email" placeholder="anna@foretaget.se" value={customer.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefonnummer</Label>
          <Input id="phone" placeholder="070-123 45 67" value={customer.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Bransch</Label>
          <Select value={customer.industry} onValueChange={(v) => set("industry", v)}>
            <SelectTrigger><SelectValue placeholder="Välj bransch" /></SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((i) => (
                <SelectItem key={i} value={i}>{i}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="employeeCount">Antal anställda</Label>
          <Input id="employeeCount" type="number" min={1} value={customer.employeeCount} onChange={(e) => set("employeeCount", parseInt(e.target.value) || 0)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="comment">Kommentar / behovsbeskrivning</Label>
          <Textarea id="comment" placeholder="Beskriv kundens behov..." value={customer.comment} onChange={(e) => set("comment", e.target.value)} rows={3} />
        </div>
      </CardContent>
    </Card>
  );
}
