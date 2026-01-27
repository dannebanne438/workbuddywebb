import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, User } from "lucide-react";

type LoginStep = "workplace" | "personal";

const Login = () => {
  const [step, setStep] = useState<LoginStep>("workplace");
  const [workplaceCode, setWorkplaceCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleWorkplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setStep("personal");
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call - would redirect to portal on success
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    // For now, just show success state - will connect to actual auth later
  };

  return (
    <div className="min-h-screen wb-gradient-hero flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Back to home link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka till startsidan
        </Link>

        {/* Login card */}
        <div className="bg-card rounded-2xl wb-shadow-elevated p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl wb-gradient-accent">
              <span className="text-lg font-bold text-primary-foreground">W</span>
            </div>
            <span className="text-2xl font-semibold text-foreground">WorkBuddy</span>
          </div>

          {/* Step indicator */}
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
                <h1 className="text-xl font-semibold text-foreground">
                  Ange din platskod
                </h1>
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
                  placeholder="T.ex. CAFE-2024"
                  className="h-12 text-center text-lg tracking-wider font-mono"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading || !workplaceCode}
              >
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
                  <User className="h-6 w-6 text-accent" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">
                  Logga in på ditt konto
                </h1>
                <p className="text-sm text-muted-foreground">
                  Ansluten till: <span className="font-medium text-foreground">{workplaceCode}</span>
                </p>
              </div>

              <div className="space-y-4">
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
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    "Logga in"
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
                <p className="text-sm text-muted-foreground">
                  Inget konto?{" "}
                  <button className="text-primary hover:underline font-medium">
                    Skapa konto
                  </button>
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
