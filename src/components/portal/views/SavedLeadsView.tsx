import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, MapPin, Users, Mail, Phone, Linkedin, Trash2, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Contact {
  name: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
}

interface ProspectLead {
  id: string;
  company_name: string;
  industry: string | null;
  address: string | null;
  city: string | null;
  estimated_employees: number | null;
  contacts: Contact[];
  relevance_notes: string | null;
  lead_score: number | null;
  search_area: string | null;
  status: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Alla" },
  { value: "new", label: "Nya" },
  { value: "contacted", label: "Kontaktade" },
  { value: "qualified", label: "Kvalificerade" },
  { value: "rejected", label: "Avvisade" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-primary/20 text-primary",
  contacted: "bg-yellow-500/20 text-yellow-600",
  qualified: "bg-accent/20 text-accent-foreground",
  rejected: "bg-destructive/20 text-destructive",
};

export function SavedLeadsView() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<ProspectLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    let query = supabase
      .from("prospect_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching leads:", error);
      toast({ title: "Kunde inte hämta leads", variant: "destructive" });
    } else {
      // Parse contacts from JSON with proper typing
      const parsedLeads = (data || []).map((lead) => ({
        ...lead,
        contacts: (Array.isArray(lead.contacts) ? lead.contacts : []) as unknown as Contact[],
      }));
      setLeads(parsedLeads as unknown as ProspectLead[]);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("prospect_leads")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Kunde inte uppdatera status", variant: "destructive" });
    } else {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
      );
      toast({ title: "Status uppdaterad" });
    }
  };

  const deleteLead = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("prospect_leads").delete().eq("id", id);

    if (error) {
      toast({ title: "Kunde inte ta bort lead", variant: "destructive" });
    } else {
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      toast({ title: "Lead borttagen" });
    }
    setDeletingId(null);
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      {/* Header with filter */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Sparade Leads</h2>
          <p className="text-sm text-muted-foreground">{leads.length} leads totalt</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leads list */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : leads.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-8">
            <div className="text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Inga sparade leads ännu.</p>
              <p className="text-sm mt-1">Använd prospekteringen för att hitta och spara leads.</p>
            </div>
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-card border border-border rounded-xl p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{lead.company_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {lead.industry && (
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        {lead.industry}
                      </span>
                    )}
                    {lead.search_area && (
                      <span className="text-xs text-muted-foreground">
                        Sökområde: {lead.search_area}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lead.lead_score && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        lead.lead_score >= 80
                          ? "bg-accent text-accent-foreground"
                          : lead.lead_score >= 60
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {lead.lead_score}/100
                    </span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="text-sm text-muted-foreground space-y-1">
                {(lead.address || lead.city) && (
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {lead.address}
                    {lead.address && lead.city && ", "}
                    {lead.city}
                  </p>
                )}
                {lead.estimated_employees && (
                  <p className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    ~{lead.estimated_employees} anställda
                  </p>
                )}
              </div>

              {/* Contacts */}
              {lead.contacts && lead.contacts.length > 0 && (
                <div className="border-t border-border pt-3 space-y-2">
                  <span className="text-xs text-muted-foreground font-medium">Kontakter</span>
                  {lead.contacts.map((contact, i) => (
                    <div key={i} className="text-sm bg-secondary/50 rounded-lg p-2">
                      <p className="font-medium text-foreground">
                        {contact.name || "Okänt namn"}
                        {contact.role && (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            - {contact.role}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </a>
                        )}
                        {contact.linkedin && (
                          <a
                            href={contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <Linkedin className="h-3 w-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Relevance notes */}
              {lead.relevance_notes && (
                <p className="text-sm text-muted-foreground italic">"{lead.relevance_notes}"</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Select
                  value={lead.status || "new"}
                  onValueChange={(val) => updateStatus(lead.id, val)}
                >
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(lead.created_at).toLocaleDateString("sv-SE")}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteLead(lead.id)}
                    disabled={deletingId === lead.id}
                  >
                    {deletingId === lead.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
