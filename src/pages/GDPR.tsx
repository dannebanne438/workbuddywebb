import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Trash2, Download } from "lucide-react";

const GDPR = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka till startsidan
        </Link>

        <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            GDPR & Dataskydd
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}
          </p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3">
                Vårt åtagande
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                WorkBuddy följer EU:s dataskyddsförordning (GDPR). Vi är
                engagerade i att skydda dina personuppgifter och vara
                transparenta med hur vi hanterar dem.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Dina rättigheter</h2>
              <div className="grid gap-4">
                <div className="flex gap-4 p-4 bg-secondary/50 rounded-lg">
                  <Eye className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Rätt till tillgång</h3>
                    <p className="text-sm text-muted-foreground">
                      Du har rätt att få veta vilka personuppgifter vi har om
                      dig och hur vi använder dem.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-secondary/50 rounded-lg">
                  <Shield className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Rätt till rättelse</h3>
                    <p className="text-sm text-muted-foreground">
                      Du har rätt att begära rättelse av felaktiga
                      personuppgifter.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-secondary/50 rounded-lg">
                  <Trash2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Rätt till radering</h3>
                    <p className="text-sm text-muted-foreground">
                      Du har rätt att begära att vi raderar dina personuppgifter
                      under vissa omständigheter.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-secondary/50 rounded-lg">
                  <Download className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Rätt till dataportabilitet</h3>
                    <p className="text-sm text-muted-foreground">
                      Du har rätt att få ut dina personuppgifter i ett
                      maskinläsbart format.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-secondary/50 rounded-lg">
                  <Lock className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">
                      Rätt att begränsa behandling
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Du har rätt att begära att vi begränsar behandlingen av
                      dina uppgifter.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                Personuppgiftsansvarig
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                WorkBuddy AB är personuppgiftsansvarig för behandlingen av dina
                personuppgifter. Din arbetsgivare kan också vara
                personuppgiftsansvarig för viss behandling som sker på
                arbetsplatsen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                Lagringstid
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Vi sparar dina personuppgifter så länge du har ett aktivt konto
                och så länge det krävs för att uppfylla våra skyldigheter. När
                ditt konto avslutas raderas dina personuppgifter inom 90 dagar.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                Utöva dina rättigheter
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                För att utöva någon av dina rättigheter, kontakta oss på{" "}
                <a
                  href="mailto:gdpr@workbuddy.se"
                  className="text-primary hover:underline"
                >
                  gdpr@workbuddy.se
                </a>
                . Vi svarar inom 30 dagar.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                Klagomål
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Om du inte är nöjd med hur vi hanterar dina personuppgifter har
                du rätt att lämna in ett klagomål till
                Integritetsskyddsmyndigheten (IMY).
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPR;
