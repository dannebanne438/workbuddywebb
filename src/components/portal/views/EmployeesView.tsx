import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Mail, Shield, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  email: string;
  full_name: string | null;
}

interface InviteCode {
  id: string;
  code: string;
  name: string;
  status: "active" | "paused";
  uses_count: number;
}

export function EmployeesView() {
  const { workplace, isWorkplaceAdmin } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workplace?.id) {
      fetchData();
    }
  }, [workplace?.id]);

  const fetchData = async () => {
    if (!workplace?.id) return;

    const [employeesRes, codesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("workplace_id", workplace.id),
      supabase
        .from("invite_codes")
        .select("*")
        .eq("workplace_id", workplace.id),
    ]);

    if (employeesRes.data) setEmployees(employeesRes.data);
    if (codesRes.data) setInviteCodes(codesRes.data as InviteCode[]);
    setLoading(false);
  };

  const toggleCodeStatus = async (code: InviteCode) => {
    const newStatus = code.status === "active" ? "paused" : "active";
    const { error } = await supabase
      .from("invite_codes")
      .update({ status: newStatus })
      .eq("id", code.id);

    if (error) {
      toast({ variant: "destructive", title: "Kunde inte uppdatera kod" });
    } else {
      setInviteCodes((prev) =>
        prev.map((c) => (c.id === code.id ? { ...c, status: newStatus } : c))
      );
      toast({ title: `Kod ${newStatus === "active" ? "aktiverad" : "pausad"}` });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Kopierad!", description: code });
  };

  if (!isWorkplaceAdmin) {
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
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Personal</h1>
            <p className="text-sm text-muted-foreground">Hantera personal och inbjudningskoder</p>
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
            {/* Employees */}
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Anställda ({employees.length})
              </h2>
              <div className="space-y-2">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
                  >
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-sm font-medium text-secondary-foreground">
                        {(emp.full_name || emp.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {emp.full_name || "Namn ej angivet"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{emp.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Codes */}
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Inbjudningskoder
              </h2>
              <div className="space-y-2">
                {inviteCodes.map((code) => (
                  <div
                    key={code.id}
                    className="bg-card border border-border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{code.name}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          code.status === "active"
                            ? "bg-accent/20 text-accent"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {code.status === "active" ? "Aktiv" : "Pausad"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => copyCode(code.code)}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {code.code}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {code.uses_count} användningar
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCodeStatus(code)}
                        >
                          {code.status === "active" ? "Pausa" : "Aktivera"}
                        </Button>
                      </div>
                    </div>
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
