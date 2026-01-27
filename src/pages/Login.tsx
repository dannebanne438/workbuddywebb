import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, User, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type LoginStep = "workplace" | "personal";
type AuthMode = "login" | "signup";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  
  const [step, setStep] = useState<LoginStep>("workplace");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [workplaceCode, setWorkplaceCode] = useState("");
  const [workplaceId, setWorkplaceId] = useState<string | null>(null);
  const [workplaceName, setWorkplaceName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeError, setCodeError] = useState("");

  const handleWorkplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCodeError("");

    try {
      const { data, error } = await supabase
        .from("workplaces")
        .select("id, name, company_name")
        .eq("workplace_code", workplaceCode.toUpperCase())
        .maybeSingle();

      if (error || !data) {
        setCodeError("Ogiltig platskod. Kontrollera koden och försök igen.");
        setIsLoading(false);
        return;
      }

      setWorkplaceId(data.id);
      setWorkplaceName(`${data.name} (${data.company_name})`);
      setStep("personal");
    } catch {
      setCodeError("Ett fel uppstod. Försök igen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Inloggning misslyckades",
            description: error.message,
          });
          setIsLoading(false);
          return;
        }
        toast({ title: "Välkommen tillbaka!" });
        navigate("/portal");
      } else {
        if (!workplaceId) {
          toast({
            variant: "destructive",
            title: "Fel",
            description: "Ingen arbetsplats vald",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName, workplaceId);
        if (error) {
          toast({
            variant: "destructive",
            title: "Registrering misslyckades",
            description: error.message,
          });
          setIsLoading(false);
          return;
        }
        toast({ title: "Konto skapat!", description: "Du är nu inloggad." });
        navigate("/portal");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Ett fel uppstod",
        description: "Försök igen senare.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen wb-gradient-hero flex items-center justify-center p-4">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka till startsidan
        </Link>

        <div className="bg-card rounded-2xl wb-shadow-elevated p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl wb-gradient-accent">
              <span className="text-lg font-bold text-primary-foreground">W</span>
            </div>
            <span className="text-2xl font-semibold text-foreground">WorkBuddy</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`flex items-center gap-2 ${step === "workplace" ? "text-foreground" : "text-muted-foreground"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "workplace" ? "wb-gradient-accent text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                1
              </div>
              <span className="hidden sm:inline text-sm">Arbetsplats</span>
            </div>
            <div className="w-8 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step === "personal" ? "text-foreground" : "text-muted-foreground"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "personal" ? "wb-gradient-accent text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                2
              </div>
              <span className="hidden sm:inline text-sm">Personlig</span>
            </div>
          </div>

          {step === "workplace" ? (
            <form onSubmit={handleWorkplaceSubmit} className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">Ange din platskod</h1>
                <p className="text-sm text-muted-foreground">Du har fått en platskod från din arbetsgivare</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workplaceCode">Platskod</Label>
                <Input
                  id="workplaceCode"
                  value={workplaceCode}
                  onChange={(e) => {
                    setWorkplaceCode(e.target.value.toUpperCase());
                    setCodeError("");
                  }}
                  placeholder="T.ex. NNS-SOLNA"
                  className={`h-12 text-center text-lg tracking-wider font-mono ${codeError ? "border-destructive" : ""}`}
                  required
                />
                {codeError && <p className="text-sm text-destructive">{codeError}</p>}
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading || !workplaceCode}>
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Fortsätt
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Demo: Använd <code className="bg-muted px-1 rounded">NNS-SOLNA</code>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePersonalSubmit} className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-2">
                  {authMode === "login" ? <User className="h-6 w-6 text-accent" /> : <UserPlus className="h-6 w-6 text-accent" />}
                </div>
                <h1 className="text-xl font-semibold text-foreground">
                  {authMode === "login" ? "Logga in" : "Skapa konto"}
                </h1>
                <p className="text-sm text-muted-foreground">{workplaceName}</p>
              </div>

              <div className="flex rounded-lg bg-secondary p-1 mb-4">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    authMode === "login" ? "bg-card wb-shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Logga in
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    authMode === "signup" ? "bg-card wb-shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Skapa konto
                </button>
              </div>

              <div className="space-y-4">
                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Namn</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ditt namn"
                      className="h-12"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@email.se"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Lösenord</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : authMode === "login" ? (
                    "Logga in"
                  ) : (
                    "Skapa konto"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep("workplace")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Byt arbetsplats
                </button>
              </div>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Demo: <code className="bg-muted px-1 rounded">vakt1@nns.demo</code> / <code className="bg-muted px-1 rounded">Vakt123!</code>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
