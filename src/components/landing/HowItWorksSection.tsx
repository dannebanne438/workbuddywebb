export const HowItWorksSection = () => {
  return (
    <section className="landing-section bg-muted/30 border-t border-border">
      <div className="landing-container">
        <div className="mb-16">
          <div className="landing-badge mb-4">Problem</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
            Internkommunikation i företag är trasig
          </h2>
          <p className="text-muted-foreground text-base max-w-xl">
            De flesta arbetsplatser kör fortfarande på Messenger, papperslistor och mejlkedjor. Det funkar – tills det inte gör det.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
          {[
            {
              number: "01",
              title: "Informationen försvinner",
              body: "Rutiner i Messenger-trådar. Schema i Excel. Kontaktlistor i en pärm. Ny personal hittar ingenting.",
            },
            {
              number: "02",
              title: "Chefer avbryts konstant",
              body: "Samma frågor, varje kväll. \"Vem jobbar imorgon?\" \"Var finns nyckeln?\" \"Vad gör jag vid larm?\"",
            },
            {
              number: "03",
              title: "Ingen spårbarhet",
              body: "Ingen vet vem som läst vad. Checklistor bockas av på papper. Avvikelser rapporteras via SMS.",
            },
          ].map((item) => (
            <div key={item.number} className="bg-background p-8 sm:p-10">
              <span className="text-xs font-mono text-muted-foreground/60 mb-4 block">{item.number}</span>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-2xl">
          <p className="text-base text-foreground leading-relaxed">
            WorkBuddy ersätter kaos med kontroll. En digital arbetsplattform där all information samlas, alla vet vad som gäller, och chefer äntligen kan fokusera på det som faktiskt spelar roll.
          </p>
        </div>
      </div>
    </section>
  );
};
