export const AboutSection = () => {
  return (
    <section className="landing-section bg-muted/30 border-t border-border">
      <div className="landing-container">
        <div className="max-w-2xl">
          <div className="landing-badge mb-4">Om oss</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-6">
            Byggt av människor som stått på golvet
          </h2>
          <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
            <p>
              WorkBuddy skapades inte på ett kontor långt från verkligheten. Teamet bakom plattformen har själva sprungit ronder, koordinerat event och svarat på samma frågor varje kväll.
            </p>
            <p>
              Vi har sett hur viktig information försvinner i Messenger-trådar, hur pärmar ingen hittar styr rutinerna, och hur chefer aldrig får vara ifred.
            </p>
            <p className="text-foreground font-medium">
              Därför byggde vi WorkBuddy – en digital arbetsplattform som alltid finns där, alltid vet svaret, och aldrig tar semester.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
