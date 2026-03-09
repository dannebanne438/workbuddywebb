export const TrustSection = () => {
  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="landing-container">
        <div className="grid sm:grid-cols-3 gap-12">
          {[
            {
              title: "Byggd för riktiga arbetsplatser",
              body: "Designad för skiftarbete, rutiner och verklig drift – inte kontorsjobb.",
            },
            {
              title: "Platsbaserad säkerhet",
              body: "All data är strikt isolerad per arbetsplats. Inget läcker mellan organisationer.",
            },
            {
              title: "AI som faktiskt gör nytta",
              body: "Skapar schema, svarar på frågor och genererar checklistor – inte bara pratar.",
            },
          ].map((p) => (
            <div key={p.title}>
              <h3 className="text-sm font-semibold text-foreground mb-2">{p.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
