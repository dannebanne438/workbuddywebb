import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Building, 
  Users, 
  Calendar, 
  ClipboardList, 
  BookOpen, 
  Bell,
  Clock,
  Phone,
  MessageSquare,
  Copy,
  KeyRound,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ResetPasswordDialog } from "../superadmin/ResetPasswordDialog";
import { WorkplaceAIPromptEditor } from "../superadmin/WorkplaceAIPromptEditor";

interface WorkplaceDetailViewProps {
  workplaceId: string;
  onBack: () => void;
}

interface Workplace {
  id: string;
  name: string;
  company_name: string;
  workplace_code: string;
  industry: string | null;
  workplace_type: string | null;
  settings: any;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface Schedule {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  user_name: string | null;
  role: string | null;
}

interface Checklist {
  id: string;
  title: string;
  description: string | null;
  is_template: boolean | null;
  created_at: string;
}

interface Routine {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  is_pinned: boolean | null;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  is_emergency: boolean | null;
}

interface ImportantTime {
  id: string;
  time_value: string;
  description: string;
}

export function WorkplaceDetailView({ workplaceId, onBack }: WorkplaceDetailViewProps) {
  const { toast } = useToast();
  const [workplace, setWorkplace] = useState<Workplace | null>(null);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [importantTimes, setImportantTimes] = useState<ImportantTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetUser, setResetUser] = useState<{ id: string; name: string } | null>(null);

  const copyCode = () => {
    if (workplace?.workplace_code) {
      navigator.clipboard.writeText(workplace.workplace_code);
      toast({ title: "Platskod kopierad!" });
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [workplaceId]);

  const fetchAllData = async () => {
    setLoading(true);
    
    const [
      workplaceRes,
      employeesRes,
      schedulesRes,
      checklistsRes,
      routinesRes,
      announcementsRes,
      contactsRes,
      timesRes
    ] = await Promise.all([
      supabase
        .from("workplaces")
        .select("*")
        .eq("id", workplaceId)
        .single(),
      supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .eq("workplace_id", workplaceId)
        .order("created_at", { ascending: false }),
      supabase
        .from("schedules")
        .select("id, shift_date, start_time, end_time, user_name, role")
        .eq("workplace_id", workplaceId)
        .order("shift_date", { ascending: false })
        .limit(20),
      supabase
        .from("checklists")
        .select("id, title, description, is_template, created_at")
        .eq("workplace_id", workplaceId)
        .order("created_at", { ascending: false }),
      supabase
        .from("routines")
        .select("id, title, category, created_at")
        .eq("workplace_id", workplaceId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("announcements")
        .select("id, title, is_pinned, created_at")
        .eq("workplace_id", workplaceId)
        .order("created_at", { ascending: false }),
      supabase
        .from("contacts")
        .select("id, name, role, phone, email, is_emergency")
        .eq("workplace_id", workplaceId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("important_times")
        .select("id, time_value, description")
        .eq("workplace_id", workplaceId)
        .order("sort_order", { ascending: true }),
    ]);

    if (workplaceRes.data) setWorkplace(workplaceRes.data);
    if (employeesRes.data) setEmployees(employeesRes.data);
    if (schedulesRes.data) setSchedules(schedulesRes.data);
    if (checklistsRes.data) setChecklists(checklistsRes.data);
    if (routinesRes.data) setRoutines(routinesRes.data);
    if (announcementsRes.data) setAnnouncements(announcementsRes.data);
    if (contactsRes.data) setContacts(contactsRes.data);
    if (timesRes.data) setImportantTimes(timesRes.data);
    
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sv-SE");
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!workplace) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground mb-4">Arbetsplatsen hittades inte</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tillbaka
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-semibold text-foreground">{workplace.name}</h1>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                title="Kopiera platskod"
              >
                {workplace.workplace_code}
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{workplace.company_name}</p>
          </div>
        </div>
        
        {/* Stats row */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{employees.length} anställda</span>
          </div>
          {workplace.industry && (
            <span className="bg-secondary px-2 py-1 rounded text-xs">{workplace.industry}</span>
          )}
          {workplace.workplace_type && (
            <span className="bg-secondary px-2 py-1 rounded text-xs">{workplace.workplace_type}</span>
          )}
          <span className="text-muted-foreground text-xs">
            Skapad: {formatDate(workplace.created_at)}
          </span>
        </div>
      </header>

      {/* Content with tabs */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="employees" className="gap-2">
              <Users className="h-4 w-4" />
              Anställda ({employees.length})
            </TabsTrigger>
            <TabsTrigger value="schedules" className="gap-2">
              <Calendar className="h-4 w-4" />
              Scheman ({schedules.length})
            </TabsTrigger>
            <TabsTrigger value="checklists" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Checklistor ({checklists.length})
            </TabsTrigger>
            <TabsTrigger value="routines" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Rutiner ({routines.length})
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2">
              <Bell className="h-4 w-4" />
              Nyheter ({announcements.length})
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Phone className="h-4 w-4" />
              Kontakter ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="ai-prompt" className="gap-2">
              <Bot className="h-4 w-4" />
              AI-prompt
            </TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees">
            {employees.length === 0 ? (
              <EmptyState icon={Users} message="Inga anställda registrerade" />
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Namn</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">E-post</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Registrerad</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Åtgärd</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id} className="border-b border-border last:border-0">
                        <td className="p-3 text-sm text-foreground">{emp.full_name || "-"}</td>
                        <td className="p-3 text-sm text-muted-foreground">{emp.email}</td>
                        <td className="p-3 text-sm text-muted-foreground">{formatDate(emp.created_at)}</td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setResetUser({ id: emp.id, name: emp.full_name || emp.email })}
                          >
                            <KeyRound className="h-3 w-3 mr-1" />
                            Lösenord
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules">
            {schedules.length === 0 ? (
              <EmptyState icon={Calendar} message="Inga scheman skapade" />
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Datum</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Tid</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Person</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Roll</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr key={s.id} className="border-b border-border last:border-0">
                        <td className="p-3 text-sm text-foreground">{formatDate(s.shift_date)}</td>
                        <td className="p-3 text-sm text-muted-foreground">{s.start_time} - {s.end_time}</td>
                        <td className="p-3 text-sm text-foreground">{s.user_name || "-"}</td>
                        <td className="p-3 text-sm text-muted-foreground">{s.role || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Checklists Tab */}
          <TabsContent value="checklists">
            {checklists.length === 0 ? (
              <EmptyState icon={ClipboardList} message="Inga checklistor skapade" />
            ) : (
              <div className="space-y-3">
                {checklists.map((c) => (
                  <div key={c.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{c.title}</p>
                        {c.description && (
                          <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {c.is_template && (
                          <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Mall</span>
                        )}
                        <span className="text-xs text-muted-foreground">{formatDate(c.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Routines Tab */}
          <TabsContent value="routines">
            {routines.length === 0 ? (
              <EmptyState icon={BookOpen} message="Inga rutiner skapade" />
            ) : (
              <div className="space-y-3">
                {routines.map((r) => (
                  <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{r.title}</p>
                      <div className="flex items-center gap-2">
                        {r.category && (
                          <span className="text-xs bg-secondary px-2 py-1 rounded">{r.category}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            {announcements.length === 0 ? (
              <EmptyState icon={Bell} message="Inga nyheter publicerade" />
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className={`bg-card border rounded-xl p-4 ${a.is_pinned ? "border-accent" : "border-border"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {a.is_pinned && <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">Fäst</span>}
                        <p className="font-medium text-foreground">{a.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(a.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Kontaktpersoner
                </h3>
                {contacts.length === 0 ? (
                  <EmptyState icon={Phone} message="Inga kontakter" />
                ) : (
                  <div className="space-y-2">
                    {contacts.map((c) => (
                      <div key={c.id} className={`bg-card border rounded-xl p-4 ${c.is_emergency ? "border-destructive/50" : "border-border"}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">{c.name}</p>
                            {c.role && <p className="text-sm text-muted-foreground">{c.role}</p>}
                          </div>
                          {c.is_emergency && (
                            <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">Nödfall</span>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {c.phone && <p>{c.phone}</p>}
                          {c.email && <p>{c.email}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Viktiga tider
                </h3>
                {importantTimes.length === 0 ? (
                  <EmptyState icon={Clock} message="Inga viktiga tider" />
                ) : (
                  <div className="space-y-2">
                    {importantTimes.map((t) => (
                      <div key={t.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                        <span className="font-mono text-lg font-semibold text-primary">{t.time_value}</span>
                        <span className="text-sm text-foreground">{t.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* AI Prompt Tab */}
          <TabsContent value="ai-prompt">
            <WorkplaceAIPromptEditor
              workplaceId={workplaceId}
              initialPrompt={(workplace?.settings as any)?.custom_prompt || ""}
            />
          </TabsContent>
        </Tabs>
      </div>

      {resetUser && (
        <ResetPasswordDialog
          open={!!resetUser}
          onOpenChange={(open) => !open && setResetUser(null)}
          userId={resetUser.id}
          userName={resetUser.name}
        />
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-8 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
