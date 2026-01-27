import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, User, UserPlus, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  workplaceCodeSchema,
  emailSchema,
  passwordSchema,
  fullNameSchema,
} from "@/lib/validation";
import { Checkbox } from "@/components/ui/checkbox";

type LoginStep = "workplace" | "personal";
type AuthMode = "login" | "signup";

interface FormErrors {
  workplaceCode?: string;
  email?: string;
  password?: string;
  fullName?: string;
  terms?: string;
}

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Clear errors when inputs change
  useEffect(() => {
    setErrors((prev) => ({ ...prev, workplaceCode: undefined }));
  }, [workplaceCode]);

  useEffect(() => {
    setErrors((prev) => ({ ...prev, email: undefined }));
  }, [email]);

  useEffect(() => {
    setErrors((prev) => ({ ...prev, password: undefined }));
  }, [password]);

  useEffect(() => {
    setErrors((prev) => ({ ...prev, fullName: undefined }));
  }, [fullName]);

  useEffect(() => {
    setErrors((prev) => ({ ...prev, terms: undefined }));
  }, [acceptedTerms]);

  const validateWorkplaceCode = (): boolean => {
    const result = workplaceCodeSchema.safeParse(workplaceCode);
    if (!result.success) {
      setErrors((prev) => ({
        ...prev,
        workplaceCode: result.error.errors[0].message,
      }));
      return false;
    }
    return true;
  };

  const validatePersonalForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
      isValid = false;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
      isValid = false;
    }

    if (authMode === "signup") {
      const nameResult = fullNameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.fullName = nameResult.error.errors[0].message;
        isValid = false;
      }

      if (!acceptedTerms) {
        newErrors.terms = "Du måste godkänna användarvillkoren";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleWorkplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateWorkplaceCode()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("workplaces")
        .select("id, name, company_name")
        .eq("workplace_code", workplaceCode.toUpperCase())
        .maybeSingle();

      if (error || !data) {
        setErrors((prev) => ({
          ...prev,
          workplaceCode: "Ogiltig platskod. Kontrollera koden och försök igen.",
        }));
        setIsLoading(false);
        return;
      }

      setWorkplaceId(data.id);
      setWorkplaceName(`${data.name} (${data.company_name})`);
      setStep("personal");
    } catch {
      setErrors((prev) => ({
        ...prev,
        workplaceCode: "Ett fel uppstod. Försök igen.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePersonalForm()) return;
    
    setIsLoading(true);
    try {
      if (authMode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login")) {
            setErrors({ email: "Fel e-post eller lösenord" });
          } else {
            toast({
              variant: "destructive",
              title: "Inloggning misslyckades",
              description: error.message,
            });
          }
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
          if (error.message.includes("already registered")) {
            setErrors({ email: "E-postadressen är redan registrerad" });
          } else {
            toast({
              variant: "destructive",
              title: "Registrering misslyckades",
              description: error.message,
            });
          }
          setIsLoading(false);
          return;
        }
        toast({
          title: "Konto skapat!",
          description: "Du är nu inloggad.",
        });
        navigate("/portal");
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Ett fel uppstod",
        description: "Försök igen senare.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const InputError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <p className="flex items-center gap-1.5 text-sm text-destructive mt-1.5">
        <AlertCircle className="h-3.5 w-3.5" />
        {message}
      </p>
    );
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

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`flex items-center gap-2 ${step === "workplace" ? "text-foreground" : "text-muted-foreground"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "workplace" ? "wb-gradient-accent text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                1
              </div>
              <span className="hidden sm:inline text-sm">Arbetsplats</span>
            </div>
            <div className="w-8 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step === "personal" ? "text-foreground" : "text-muted-foreground"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "personal" ? "wb-gradient-accent text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
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
                <p className="text-sm text-muted-foreground">
                  Du har fått en platskod från din arbetsgivare
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workplaceCode">Platskod</Label>
                <Input
                  id="workplaceCode"
                  value={workplaceCode}
                  onChange={(e) => setWorkplaceCode(e.target.value.toUpperCase())}
                  placeholder="T.ex. ABC-123"
                  className={`h-12 text-center text-lg tracking-wider font-mono ${errors.workplaceCode ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  required
                  autoComplete="off"
                />
                <InputError message={errors.workplaceCode} />
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
            </form>
          ) : (
            <form onSubmit={handlePersonalSubmit} className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-2">
                  {authMode === "login" ? (
                    <User className="h-6 w-6 text-accent" />
                  ) : (
                    <UserPlus className="h-6 w-6 text-accent" />
                  )}
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
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${authMode === "login" ? "bg-card wb-shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Logga in
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${authMode === "signup" ? "bg-card wb-shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"}`}
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
                      className={`h-12 ${errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      required
                      autoComplete="name"
                    />
                    <InputError message={errors.fullName} />
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
                    className={`h-12 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    required
                    autoComplete="email"
                  />
                  <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Lösenord</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`h-12 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    required
                    autoComplete={authMode === "login" ? "current-password" : "new-password"}
                  />
                  <InputError message={errors.password} />
                </div>

                {authMode === "signup" && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                        className="mt-0.5"
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                        Jag godkänner{" "}
                        <Link to="/terms" className="text-primary hover:underline" target="_blank">
                          användarvillkoren
                        </Link>{" "}
                        och{" "}
                        <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                          integritetspolicyn
                        </Link>
                      </label>
                    </div>
                    <InputError message={errors.terms} />
                  </div>
                )}
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
            </form>
          )}
        </div>

        {/* Legal links */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Integritetspolicy
          </Link>
          <span className="mx-2">•</span>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Användarvillkor
          </Link>
          <span className="mx-2">•</span>
          <Link to="/gdpr" className="hover:text-foreground transition-colors">
            GDPR
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
