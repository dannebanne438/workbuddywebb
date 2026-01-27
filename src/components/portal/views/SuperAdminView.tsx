import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Check, X, Building, Users, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AdminRequest {
  id: string;
  user_id: string;
  workplace_id: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  user_email?: string;
  user_name?: string;
  workplace_name?: string;
}

interface ContactLead {
  id: string;
  company: string;
  contact_person: string;
  email: string;
  phone: string | null;
  workplace_type: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

interface Workplace {
  id: string;
  name: string;
  company_name: string;
  workplace_code: string;
}

export function SuperAdminView() {
  const { isSuperAdmin, user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin]);

  const fetchData = async () => {
    const [requestsRes, leadsRes, workplacesRes] = await Promise.all([
      supabase
        .from("admin_requests")
        .select("*")
        .eq("status", "pending")
        .order("requested_at", { ascending: false }),
      supabase
        .from("contact_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("workplaces")
        .select("id, name, company_name, workplace_code")
        .order("created_at", { ascending: false }),
    ]);

    if (requestsRes.data) setRequests(requestsRes.data as AdminRequest[]);
    if (leadsRes.data) setLeads(leadsRes.data);
    if (workplacesRes.data) setWorkplaces(workplacesRes.data);
    setLoading(false);
  };

  const handleApprove = async (request: AdminRequest) => {
    // Update request status
    await supabase
      .from("admin_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq("id", request.id);

    // Add workplace_admin role
    await supabase.from("user_roles").insert({
      user_id: request.user_id,
      role: "workplace_admin",
      workplace_id: request.workplace_id,
    });

    setRequests((prev) => prev.filter((r) => r.id !== request.id));
    toast({ title: "Förfrågan godkänd" });
  };

  const handleReject = async (request: AdminRequest) => {
    await supabase
      .from("admin_requests")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq("id", request.id);

    setRequests((prev) => prev.filter((r) => r.id !== request.id));
    toast({ title: "Förfrågan avvisad" });
  };

  if (!isSuperAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Du har inte behörighet att se denna sida.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl wb-gradient-accent flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Super Admin</h1>
            <p className="text-sm text-muted-foreground">Global administration</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Pending Admin Requests */}
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Väntande adminförfrågningar ({requests.length})
              </h2>
              {requests.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-6 text-center">
                  <p className="text-muted-foreground">Inga väntande förfrågningar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-card border border-border rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">
                          {request.user_email || request.user_id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.requested_at).toLocaleDateString("sv-SE")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Begär admin för: {request.workplace_name || request.workplace_id}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request)}
                          className="bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Godkänn
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Avvisa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workplaces */}
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Arbetsplatser ({workplaces.length})
              </h2>
              <div className="space-y-2">
                {workplaces.map((wp) => (
                  <div
                    key={wp.id}
                    className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{wp.name}</p>
                      <p className="text-sm text-muted-foreground">{wp.company_name}</p>
                    </div>
                    <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                      {wp.workplace_code}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Leads */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Kontaktförfrågningar ({leads.length})
              </h2>
              {leads.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-6 text-center">
                  <p className="text-muted-foreground">Inga kontaktförfrågningar</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Företag</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Kontakt</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">E-post</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Typ</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Datum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id} className="border-b border-border last:border-0">
                          <td className="p-3 text-sm text-foreground">{lead.company}</td>
                          <td className="p-3 text-sm text-foreground">{lead.contact_person}</td>
                          <td className="p-3 text-sm">
                            <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                              {lead.email}
                            </a>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{lead.workplace_type || "-"}</td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {new Date(lead.created_at).toLocaleDateString("sv-SE")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
