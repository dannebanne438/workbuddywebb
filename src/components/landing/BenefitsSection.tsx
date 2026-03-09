export const BenefitsSection = () => {
  return (
    <section className="landing-section bg-muted/30 border-t border-border">
      <div className="landing-container">
        <div className="mb-16">
          <div className="landing-badge mb-4">Resultat</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
            Förbättra kommunikationen med anställda – mätbart
          </h2>
          <p className="text-muted-foreground text-base max-w-xl">
            Företag som använder WorkBuddy ser direkt skillnad i hur information flödar och hur mycket tid chefer sparar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {[
            { stat: "70%", label: "Färre avbrott", detail: "Chefer slipper svara på samma frågor om och om igen." },
            { stat: "24/7", label: "Alltid tillgänglig", detail: "Personalen får svar dygnet runt – även helger och kvällar." },
            { stat: "100%", label: "Enhetlig info", detail: "Alla får samma svar. Ingen risk för missförstånd." },
            { stat: "0", label: "Papperslistor", detail: "Ersätt pärmar och lappar med digitala checklistor." },
          ].map((b) => (
            <div key={b.label}>
              <div className="text-4xl font-extrabold text-foreground tracking-tight mb-1">
                {b.stat}
              </div>
              <div className="text-sm font-semibold text-foreground mb-1.5">
                {b.label}
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {b.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
