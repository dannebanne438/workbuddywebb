import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
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
            Användarvillkor
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}
          </p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Godkännande</h2>
              <p className="text-muted-foreground leading-relaxed">
                Genom att använda WorkBuddy godkänner du dessa användarvillkor.
                Om du inte godkänner villkoren, vänligen avstå från att använda
                tjänsten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                2. Beskrivning av tjänsten
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                WorkBuddy är en digital arbetsplatsassistent som samlar rutiner,
                scheman och information för att underlätta kommunikation på
                arbetsplatsen. Tjänsten tillhandahålls via arbetsgivare och
                kopplas till specifika arbetsplatser.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                3. Användaransvar
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Du ansvarar för att hålla dina inloggningsuppgifter säkra</li>
                <li>Du får inte dela ditt konto med andra</li>
                <li>Du får inte använda tjänsten för olagliga ändamål</li>
                <li>
                  Du ansvarar för att information du lägger in är korrekt
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                4. Immateriella rättigheter
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Allt innehåll i WorkBuddy, inklusive design, logotyper och
                programkod, tillhör WorkBuddy eller dess licensgivare. Du får
                inte kopiera, distribuera eller modifiera något av detta utan
                skriftligt tillstånd.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                5. Ansvarsbegränsning
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                WorkBuddy tillhandahålls "i befintligt skick". Vi garanterar
                inte att tjänsten alltid kommer att vara tillgänglig eller fri
                från fel. Vi ansvarar inte för indirekta skador eller
                följdskador som uppstår genom användning av tjänsten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                6. Uppsägning
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Vi förbehåller oss rätten att avsluta eller begränsa din
                åtkomst till tjänsten om du bryter mot dessa villkor. Din
                arbetsgivare kan också avsluta din åtkomst.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                7. Ändringar av villkoren
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Vi kan uppdatera dessa villkor från tid till annan. Vid
                väsentliga ändringar kommer vi att meddela dig via e-post eller
                i tjänsten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Kontakt</h2>
              <p className="text-muted-foreground leading-relaxed">
                För frågor om dessa villkor, kontakta oss på{" "}
                <a
                  href="mailto:support@workbuddy.se"
                  className="text-primary hover:underline"
                >
                  support@workbuddy.se
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
