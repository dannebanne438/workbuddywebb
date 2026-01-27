import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
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
            Integritetspolicy
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}
          </p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Inledning</h2>
              <p className="text-muted-foreground leading-relaxed">
                WorkBuddy värnar om din integritet. Denna integritetspolicy
                förklarar hur vi samlar in, använder och skyddar dina
                personuppgifter när du använder vår tjänst.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                2. Personuppgifter vi samlar in
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Namn och e-postadress vid registrering</li>
                <li>Arbetsplatsrelaterad information</li>
                <li>Scheman och arbetsinformation</li>
                <li>Kommunikation via chatten</li>
                <li>Teknisk information (IP-adress, webbläsare)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                3. Hur vi använder dina uppgifter
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Tillhandahålla och förbättra vår tjänst</li>
                <li>Hantera ditt konto och arbetsplatskoppling</li>
                <li>Kommunicera viktig information</li>
                <li>Säkerställa säkerhet och förhindra missbruk</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Delning av data</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vi delar aldrig dina personuppgifter med tredje part för
                marknadsföringsändamål. Data delas endast med din arbetsgivare i
                den utsträckning som krävs för tjänstens funktion, samt med
                tekniska underleverantörer som hjälper oss att driva tjänsten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Dina rättigheter</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Enligt GDPR har du rätt att:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Begära tillgång till dina personuppgifter</li>
                <li>Begära rättelse av felaktiga uppgifter</li>
                <li>Begära radering av dina uppgifter</li>
                <li>Invända mot behandling av dina uppgifter</li>
                <li>Begära dataportabilitet</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Kontakt</h2>
              <p className="text-muted-foreground leading-relaxed">
                För frågor om denna integritetspolicy eller för att utöva dina
                rättigheter, kontakta oss på{" "}
                <a
                  href="mailto:privacy@workbuddy.se"
                  className="text-primary hover:underline"
                >
                  privacy@workbuddy.se
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
