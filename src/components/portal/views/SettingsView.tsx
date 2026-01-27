import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Clock, Phone, FileText } from "lucide-react";

interface ImportantTime {
  id: string;
  time_value: string;
  description: string;
}

interface Contact {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  is_emergency: boolean;
}

export function SettingsView() {
  const { workplace, isWorkplaceAdmin } = useAuth();
  const [times, setTimes] = useState<ImportantTime[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workplace?.id) {
      fetchData();
    }
  }, [workplace?.id]);

  const fetchData = async () => {
    if (!workplace?.id) return;

    const [timesRes, contactsRes] = await Promise.all([
      supabase
        .from("important_times")
        .select("*")
        .eq("workplace_id", workplace.id)
        .order("sort_order"),
      supabase
        .from("contacts")
        .select("*")
        .eq("workplace_id", workplace.id)
        .order("sort_order"),
    ]);

    if (timesRes.data) setTimes(timesRes.data);
    if (contactsRes.data) setContacts(contactsRes.data);
    setLoading(false);
  };

  if (!isWorkplaceAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Du har inte behörighet att se denna sida.</p>
      </div>
    );
  }

  const settings = workplace?.settings as Record<string, unknown> | null;

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Inställningar</h1>
            <p className="text-sm text-muted-foreground">Arbetsplatsens konfiguration</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2 max-w-5xl">
            {/* Workplace Info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Arbetsplatsinformation
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Namn</dt>
                  <dd className="text-foreground">{workplace?.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Företag</dt>
                  <dd className="text-foreground">{workplace?.company_name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Platskod</dt>
                  <dd className="font-mono text-primary">{workplace?.workplace_code}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Typ</dt>
                  <dd className="text-foreground">{workplace?.workplace_type || "Ej angiven"}</dd>
                </div>
              </dl>
            </div>

            {/* Work Rules */}
            {settings && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-medium text-foreground mb-4">Arbetsregler</h2>
                <dl className="space-y-3">
                  {settings.hourly_rate && (
                    <div>
                      <dt className="text-xs text-muted-foreground uppercase">Timlön</dt>
                      <dd className="text-foreground">{String(settings.hourly_rate)} kr</dd>
                    </div>
                  )}
                  {settings.ob_rate && (
                    <div>
                      <dt className="text-xs text-muted-foreground uppercase">OB-tillägg</dt>
                      <dd className="text-foreground">{String(settings.ob_rate)} kr/h</dd>
                    </div>
                  )}
                  {settings.max_hours_per_week && (
                    <div>
                      <dt className="text-xs text-muted-foreground uppercase">Max timmar/vecka</dt>
                      <dd className="text-foreground">{String(settings.max_hours_per_week)} h</dd>
                    </div>
                  )}
                  {settings.min_rest_hours && (
                    <div>
                      <dt className="text-xs text-muted-foreground uppercase">Min vilotid</dt>
                      <dd className="text-foreground">{String(settings.min_rest_hours)} h</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Important Times */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Viktiga tider
              </h2>
              <div className="space-y-2">
                {times.map((time) => (
                  <div key={time.id} className="flex items-center gap-3">
                    <span className="font-mono text-sm text-primary w-14">{time.time_value}</span>
                    <span className="text-foreground text-sm">{time.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contacts */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Kontakter
              </h2>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-3 rounded-lg ${
                      contact.is_emergency ? "bg-destructive/10 border border-destructive/20" : "bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{contact.name}</span>
                      {contact.is_emergency && (
                        <span className="text-xs text-destructive">AKUT</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="text-sm text-primary hover:underline">
                        {contact.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
