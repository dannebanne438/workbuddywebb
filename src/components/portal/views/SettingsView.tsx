import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Clock, Phone, FileText, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";

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

interface WorkplaceSettings {
  hourly_rate?: number;
  ob_rate?: number;
  max_hours_per_week?: number;
  min_rest_hours?: number;
  [key: string]: unknown;
}

export function SettingsView() {
  const { isWorkplaceAdmin } = useAuth();
  const { activeWorkplace } = useWorkplace();
  const [times, setTimes] = useState<ImportantTime[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [editingRules, setEditingRules] = useState(false);
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [addingTime, setAddingTime] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  
  // Form states
  const [ruleForm, setRuleForm] = useState<WorkplaceSettings>({});
  const [timeForm, setTimeForm] = useState({ time_value: "", description: "" });
  const [contactForm, setContactForm] = useState({ name: "", role: "", phone: "", email: "", is_emergency: false });

  useEffect(() => {
    if (activeWorkplace?.id) {
      fetchData();
      setRuleForm((activeWorkplace.settings as WorkplaceSettings) || {});
    }
  }, [activeWorkplace?.id]);

  const fetchData = async () => {
    if (!activeWorkplace?.id) return;

    const [timesRes, contactsRes] = await Promise.all([
      supabase
        .from("important_times")
        .select("*")
        .eq("workplace_id", activeWorkplace.id)
        .order("sort_order"),
      supabase
        .from("contacts")
        .select("*")
        .eq("workplace_id", activeWorkplace.id)
        .order("sort_order"),
    ]);

    if (timesRes.data) setTimes(timesRes.data);
    if (contactsRes.data) setContacts(contactsRes.data);
    setLoading(false);
  };

  // Save work rules
  const saveRules = async () => {
    if (!activeWorkplace?.id) return;
    
    const { error } = await supabase
      .from("workplaces")
      .update({ settings: ruleForm as unknown as Json })
      .eq("id", activeWorkplace.id);

    if (error) {
      toast.error("Kunde inte spara arbetsregler");
    } else {
      toast.success("Arbetsregler sparade");
      setEditingRules(false);
    }
  };

  // Important Times CRUD
  const saveTime = async (id?: string) => {
    if (!activeWorkplace?.id) return;
    
    if (id) {
      const { error } = await supabase
        .from("important_times")
        .update({ time_value: timeForm.time_value, description: timeForm.description })
        .eq("id", id);
      
      if (error) toast.error("Kunde inte uppdatera");
      else {
        toast.success("Tid uppdaterad");
        setEditingTimeId(null);
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from("important_times")
        .insert({ workplace_id: activeWorkplace.id, time_value: timeForm.time_value, description: timeForm.description });
      
      if (error) toast.error("Kunde inte lägga till");
      else {
        toast.success("Tid tillagd");
        setAddingTime(false);
        setTimeForm({ time_value: "", description: "" });
        fetchData();
      }
    }
  };

  const deleteTime = async (id: string) => {
    const { error } = await supabase.from("important_times").delete().eq("id", id);
    if (error) toast.error("Kunde inte ta bort");
    else {
      toast.success("Tid borttagen");
      fetchData();
    }
  };

  // Contacts CRUD
  const saveContact = async (id?: string) => {
    if (!activeWorkplace?.id) return;
    
    if (id) {
      const { error } = await supabase
        .from("contacts")
        .update({
          name: contactForm.name,
          role: contactForm.role || null,
          phone: contactForm.phone || null,
          email: contactForm.email || null,
          is_emergency: contactForm.is_emergency,
        })
        .eq("id", id);
      
      if (error) toast.error("Kunde inte uppdatera");
      else {
        toast.success("Kontakt uppdaterad");
        setEditingContactId(null);
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from("contacts")
        .insert({
          workplace_id: activeWorkplace.id,
          name: contactForm.name,
          role: contactForm.role || null,
          phone: contactForm.phone || null,
          email: contactForm.email || null,
          is_emergency: contactForm.is_emergency,
        });
      
      if (error) toast.error("Kunde inte lägga till");
      else {
        toast.success("Kontakt tillagd");
        setAddingContact(false);
        setContactForm({ name: "", role: "", phone: "", email: "", is_emergency: false });
        fetchData();
      }
    }
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) toast.error("Kunde inte ta bort");
    else {
      toast.success("Kontakt borttagen");
      fetchData();
    }
  };

  if (!isWorkplaceAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Du har inte behörighet att se denna sida.</p>
      </div>
    );
  }

  const settings = (activeWorkplace?.settings as WorkplaceSettings) || {};

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
                  <dd className="text-foreground">{activeWorkplace?.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Företag</dt>
                  <dd className="text-foreground">{activeWorkplace?.company_name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Platskod</dt>
                  <dd className="font-mono text-primary">{activeWorkplace?.workplace_code}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Typ</dt>
                  <dd className="text-foreground">{activeWorkplace?.workplace_type || "Ej angiven"}</dd>
                </div>
              </dl>
            </div>

            {/* Work Rules - Editable */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-foreground">Arbetsregler</h2>
                {!editingRules ? (
                  <Button variant="ghost" size="sm" onClick={() => setEditingRules(true)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Redigera
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditingRules(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button variant="default" size="sm" onClick={saveRules}>
                      <Check className="h-4 w-4 mr-1" />
                      Spara
                    </Button>
                  </div>
                )}
              </div>
              
              {editingRules ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Timlön (kr)</label>
                    <Input
                      type="number"
                      value={ruleForm.hourly_rate || ""}
                      onChange={(e) => setRuleForm({ ...ruleForm, hourly_rate: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">OB-tillägg (kr/h)</label>
                    <Input
                      type="number"
                      value={ruleForm.ob_rate || ""}
                      onChange={(e) => setRuleForm({ ...ruleForm, ob_rate: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Max timmar/vecka</label>
                    <Input
                      type="number"
                      value={ruleForm.max_hours_per_week || ""}
                      onChange={(e) => setRuleForm({ ...ruleForm, max_hours_per_week: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Min vilotid (h)</label>
                    <Input
                      type="number"
                      value={ruleForm.min_rest_hours || ""}
                      onChange={(e) => setRuleForm({ ...ruleForm, min_rest_hours: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">Timlön</dt>
                    <dd className="text-foreground">{settings.hourly_rate || "-"} kr</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">OB-tillägg</dt>
                    <dd className="text-foreground">{settings.ob_rate || "-"} kr/h</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">Max timmar/vecka</dt>
                    <dd className="text-foreground">{settings.max_hours_per_week || "-"} h</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">Min vilotid</dt>
                    <dd className="text-foreground">{settings.min_rest_hours || "-"} h</dd>
                  </div>
                </dl>
              )}
            </div>

            {/* Important Times - Editable */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Viktiga tider
                </h2>
                <Button variant="ghost" size="sm" onClick={() => { setAddingTime(true); setTimeForm({ time_value: "", description: "" }); }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Lägg till
                </Button>
              </div>
              <div className="space-y-2">
                {addingTime && (
                  <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                    <Input
                      placeholder="08:00"
                      value={timeForm.time_value}
                      onChange={(e) => setTimeForm({ ...timeForm, time_value: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      placeholder="Beskrivning"
                      value={timeForm.description}
                      onChange={(e) => setTimeForm({ ...timeForm, description: e.target.value })}
                      className="flex-1"
                    />
                    <Button size="icon" variant="ghost" onClick={() => setAddingTime(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="icon" onClick={() => saveTime()}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {times.map((time) => (
                  <div key={time.id} className="flex items-center gap-3 group">
                    {editingTimeId === time.id ? (
                      <>
                        <Input
                          value={timeForm.time_value}
                          onChange={(e) => setTimeForm({ ...timeForm, time_value: e.target.value })}
                          className="w-20"
                        />
                        <Input
                          value={timeForm.description}
                          onChange={(e) => setTimeForm({ ...timeForm, description: e.target.value })}
                          className="flex-1"
                        />
                        <Button size="icon" variant="ghost" onClick={() => setEditingTimeId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="icon" onClick={() => saveTime(time.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-sm text-primary w-14">{time.time_value}</span>
                        <span className="text-foreground text-sm flex-1">{time.description}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingTimeId(time.id); setTimeForm({ time_value: time.time_value, description: time.description }); }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteTime(time.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {times.length === 0 && !addingTime && (
                  <p className="text-sm text-muted-foreground">Inga viktiga tider tillagda</p>
                )}
              </div>
            </div>

            {/* Contacts - Editable */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-foreground flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Kontakter
                </h2>
                <Button variant="ghost" size="sm" onClick={() => { setAddingContact(true); setContactForm({ name: "", role: "", phone: "", email: "", is_emergency: false }); }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Lägg till
                </Button>
              </div>
              <div className="space-y-3">
                {addingContact && (
                  <div className="p-3 bg-secondary rounded-lg space-y-2">
                    <Input placeholder="Namn" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                    <Input placeholder="Roll" value={contactForm.role} onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })} />
                    <Input placeholder="Telefon" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
                    <Input placeholder="Email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={contactForm.is_emergency} onChange={(e) => setContactForm({ ...contactForm, is_emergency: e.target.checked })} />
                      Akutkontakt
                    </label>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setAddingContact(false)}>Avbryt</Button>
                      <Button size="sm" onClick={() => saveContact()}>Spara</Button>
                    </div>
                  </div>
                )}
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={cn(
                      "p-3 rounded-lg group relative",
                      contact.is_emergency ? "bg-destructive/10 border border-destructive/20" : "bg-secondary"
                    )}
                  >
                    {editingContactId === contact.id ? (
                      <div className="space-y-2">
                        <Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                        <Input value={contactForm.role} onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })} placeholder="Roll" />
                        <Input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="Telefon" />
                        <Input value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} placeholder="Email" />
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={contactForm.is_emergency} onChange={(e) => setContactForm({ ...contactForm, is_emergency: e.target.checked })} />
                          Akutkontakt
                        </label>
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setEditingContactId(null)}>Avbryt</Button>
                          <Button size="sm" onClick={() => saveContact(contact.id)}>Spara</Button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingContactId(contact.id); setContactForm({ name: contact.name, role: contact.role || "", phone: contact.phone || "", email: contact.email || "", is_emergency: contact.is_emergency }); }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteContact(contact.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {contacts.length === 0 && !addingContact && (
                  <p className="text-sm text-muted-foreground">Inga kontakter tillagda</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
