import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Vad är ett verktyg för internkommunikation?",
    answer: "Ett verktyg för internkommunikation är en digital plattform som hjälper företag att samla och dela information med sina anställda. WorkBuddy gör det enkelt att kommunicera rutiner, schema, nyheter och viktiga uppdateringar till hela teamet – direkt i mobilen.",
  },
  {
    question: "Hur kan företag organisera personalinformation digitalt?",
    answer: "Med ett personalhanteringssystem som WorkBuddy kan företag samla all personalinformation på ett ställe: certifikat, scheman, kontaktuppgifter och arbetsrutiner. Det eliminerar papperslistor och gör informationen tillgänglig dygnet runt.",
  },
  {
    question: "Hur förbättrar man kommunikationen i ett företag?",
    answer: "Genom att använda en digital arbetsplattform som centraliserar all kommunikation. WorkBuddy erbjuder team-chat, meddelanden, AI-assistent och checklistor – vilket minskar missförstånd och ser till att alla anställda får samma information.",
  },
  {
    question: "Vad är en digital arbetsplattform?",
    answer: "En digital arbetsplattform är ett system som samlar alla verktyg som en arbetsplats behöver: schemaläggning, internkommunikation, personalhantering, dokumentation och mer. WorkBuddy är byggt specifikt för företag med skiftarbete och många medarbetare.",
  },
  {
    question: "Passar WorkBuddy för företag i alla branscher?",
    answer: "Ja, WorkBuddy är designat för alla typer av företag som har personal på plats – från säkerhetsbolag och restauranger till hotell, gym, butiker och lager. Plattformen anpassas efter varje arbetsplats behov.",
  },
  {
    question: "Hur kommer man igång med WorkBuddy?",
    answer: "Det är enkelt att komma igång. Boka en kostnadsfri demo så visar vi hur WorkBuddy kan fungera för just ert företag. Varje arbetsplats får en egen platskod och personalen kan börja använda systemet direkt.",
  },
];

export const FAQSection = () => {
  return (
    <section className="landing-section bg-background border-t border-border">
      <div className="landing-container">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="landing-badge mb-4">FAQ</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-3">
              Vanliga frågor
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-1">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border-b border-border px-0"
              >
                <AccordionTrigger className="text-left text-[14px] text-foreground font-medium hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[13px] text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
    </section>
  );
};
