import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, Plus, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function EmployeesView({ isPresentation }: { isPresentation?: boolean } = {}) {
  const { isWorkplaceAdmin, session } = useAuth();
  const { activeWorkplace } = useWorkplace();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add user form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "employee" as "employee" | "workplace_admin"
  });

  useEffect(() => {
    if (activeWorkplace?.id) {
      fetchData();
    }
  }, [activeWorkplace?.id]);

  const fetchData = async () => {
    if (!activeWorkplace?.id) return;

    const [employeesRes, codesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("workplace_id", activeWorkplace.id),
      supabase
        .from("invite_codes")
        .select("*")
        .eq("workplace_id", activeWorkplace.id),
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token || !activeWorkplace?.id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-workplace-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ...formData,
            workplace_id: activeWorkplace.id
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte skapa användare");
      }

      toast({ 
        title: "Användare skapad!", 
        description: `${formData.full_name} har lagts till.` 
      });
      
      // Reset form and close dialog
      setFormData({ full_name: "", email: "", password: "", role: "employee" });
      setIsAddDialogOpen(false);
      
      // Refresh employee list
      fetchData();
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Fel", 
        description: error instanceof Error ? error.message : "Något gick fel" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isWorkplaceAdmin && !isPresentation) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Du har inte behörighet att se denna sida.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Personal</h1>
              <p className="text-sm text-muted-foreground">
                {activeWorkplace?.name} - Hantera personal och inbjudningskoder
              </p>
            </div>
          </div>
          
          {/* Add User Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Lägg till
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Lägg till personal</DialogTitle>
                <DialogDescription>
                  Skapa ett nytt konto för {activeWorkplace?.name}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Namn</Label>
                  <Input
                    id="full_name"
                    placeholder="Anna Andersson"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="anna@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Lösenord</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minst 6 tecken"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Roll</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "employee" | "workplace_admin") => 
                      setFormData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Anställd</SelectItem>
                      <SelectItem value="workplace_admin">Arbetsplatsadmin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Avbryt
                  </Button>
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Skapar...
                      </>
                    ) : (
                      "Skapa användare"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                {employees.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Inga anställda ännu</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Lägg till första
                    </Button>
                  </div>
                ) : (
                  employees.map((emp) => (
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
                  ))
                )}
              </div>
            </div>

            {/* Invite Codes */}
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Inbjudningskoder
              </h2>
              <div className="space-y-2">
                {inviteCodes.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Inga inbjudningskoder</p>
                  </div>
                ) : (
                  inviteCodes.map((code) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
