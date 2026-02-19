export type PortalView = "camera" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin" | "workplace-detail" | "team-chat" | "dashboard" | "certificates" | "incidents" | "documents" | "photos" | "features";

export interface PresentationStep {
  id: string;
  view: PortalView | "intro" | "cta";
  title: string;
  description: string;
  example?: string; // Concrete example shown in a highlight box
  duration: number; // ms
  spotlightSelector?: string; // CSS selector for spotlight target
  icon?: string; // emoji for visual flair
}

export const PRESENTATION_STEPS: PresentationStep[] = [
  {
    id: "intro",
    view: "intro",
    title: "Välkommen till WorkBuddy",
    description: "Er digitala kollega för smartare arbetsplatser.",
    duration: 6000,
  },
  {
    id: "dashboard-overview",
    view: "dashboard",
    title: "Allt börjar här – er realtidspanel",
    description: "Istället för att jaga information i mejl, Excel och WhatsApp-grupper samlas allt på ett ställe. KPI:er uppdateras i realtid, så ni alltid vet hur dagen ser ut.",
    example: "Exempel: \"3 öppna avvikelser · 2 certifikat utgår snart · 12 anställda schemalagda idag\" – allt synligt direkt vid inloggning.",
    duration: 8000,
    spotlightSelector: "[data-presentation='kpi-cards']",
    icon: "📊",
  },
  {
    id: "dashboard-risks",
    view: "dashboard",
    title: "Riskvarningar – innan det blir ett problem",
    description: "Systemet analyserar era data och flaggar risker automatiskt. Utgångna certifikat, avvikelser som inte åtgärdats, bemanningsluckor – allt syns innan det eskalerar.",
    example: "Exempel: \"⚠️ Eriks truckkörkort går ut om 5 dagar\" – ni hinner agera istället för att reagera.",
    duration: 7000,
    spotlightSelector: "[data-presentation='risk-warnings']",
    icon: "⚠️",
  },
  {
    id: "incidents-overview",
    view: "incidents",
    title: "Avvikelser – från kaos till kontroll",
    description: "Glöm papperslappar och mejlkedjor. En medarbetare ser ett problem, rapporterar direkt i telefonen, och hela kedjan startar: notifiering till ansvarig, tidslinje, uppföljning. Allt dokumenterat.",
    example: "Exempel: En städare upptäcker en vattenläcka kl 06:15 → rapporterar med foto → platschefen får notis direkt → åtgärd loggad inom 30 min.",
    duration: 8000,
    icon: "🔔",
  },
  {
    id: "incidents-evidence",
    view: "incidents",
    title: "Juridiskt säkrad beviskedja",
    description: "Varje ändring loggas med server-tidsstämpel, användar-ID och IP-adress. Beviskedjan är oföränderlig och uppfyller kraven för Arbetsmiljöverket, ISO 45001 och försäkringsärenden. Exportera allt som PDF med ett klick.",
    example: "Exempel: Vid en arbetsplatsolycka kan ni inom sekunder ta fram en komplett rapport med foton, tidsstämplar och åtgärdslogg – redo för myndigheter.",
    duration: 8000,
    icon: "🔒",
  },
  {
    id: "camera-capture",
    view: "camera",
    title: "Fotografera – AI:n gör resten",
    description: "Ta en bild med mobilen. WorkBuddys AI analyserar innehållet automatiskt och avgör vad bilden föreställer. Ingen manuell klassificering behövs – systemet föreslår allt åt dig.",
    example: "Exempel: Du fotograferar en trasig brandslang → AI:n föreslår: \"Avvikelse · Brandsäkerhet · Hög allvarlighetsgrad\" – på 2 sekunder.",
    duration: 8000,
    spotlightSelector: "[data-presentation='camera-buttons']",
    icon: "📸",
  },
  {
    id: "camera-analysis",
    view: "camera",
    title: "AI:n ser vad du ser",
    description: "Efter analysen får du ett förslag med rubrik, beskrivning, kategori och allvarlighetsgrad. Du kan redigera, godkänna eller avvisa – publicera med ett tryck. Det som tog 15 minuter tar nu 30 sekunder.",
    example: "Exempel: AI-förslag → Rubrik: \"Spricka i betongvägg\" · Kategori: Strukturell · Allvarlighetsgrad: Medel · Beskrivning: \"Synlig spricka ca 40cm vid lastbrygga\"",
    duration: 8000,
    spotlightSelector: "[data-presentation='ai-badge']",
    icon: "🤖",
  },
  {
    id: "ai-chat",
    view: "camera",
    title: "Er digitala platschef – alltid tillgänglig",
    description: "Skriv eller prata med WorkBuddy på vanlig svenska. Er digitala platschef är tränad på er bransch och era rutiner. Fråga om regler, be om hjälp med beräkningar, eller ge kommandon som utförs direkt.",
    example: "Exempel: \"Vad säger AFS 2023:2 om fallskydd vid arbete över 2 meter?\" → WorkBuddy svarar med korrekt regeltext och praktiska rekommendationer.",
    duration: 9000,
    icon: "👷",
  },
  {
    id: "schedule",
    view: "schedule",
    title: "Schema – hela teamet, en överblick",
    description: "Skapa, redigera och dela schema med hela teamet i realtid. Alla ser sina pass direkt i appen. Konflikter flaggas automatiskt – dubbelbokning, vilotidsbrott och max-timmar per vecka.",
    example: "Exempel: Du lägger in Annas pass 06-14 på torsdag → systemet varnar: \"Anna har redan 48h denna vecka (max 50h)\" – innan du sparar.",
    duration: 8000,
    icon: "📅",
  },
  {
    id: "checklists",
    view: "checklists",
    title: "Checklistor som faktiskt blir gjorda",
    description: "Skapa mallar för dagliga, veckovisa eller projektspecifika kontroller. Skicka till rätt personal, se vem som slutfört vad, och få bevis på att säkerhetsrutinerna följs – utan att jaga folk.",
    example: "Exempel: \"Morgonchecklista – Lager\" → ✅ Nödutgångar fria · ✅ Truckar laddade · ✅ Brandslang kontrollerad – slutförd av Erik kl 06:32.",
    duration: 8000,
    icon: "✅",
  },
  {
    id: "employees",
    view: "employees",
    title: "Er personal – samlad och överblickbar",
    description: "Se all personal, deras roller, certifikat och status på ett ställe. Bjud in nya medarbetare med en inbjudningskod – de är igång på 60 sekunder. Inga komplicerade IT-processer.",
    example: "Exempel: Ny anställd får koden \"WB-LAGER23\" → registrerar sig → ser direkt sina scheman, checklistor och rutiner – utan att fråga någon.",
    duration: 8000,
    spotlightSelector: "[data-presentation='employee-list']",
    icon: "👥",
  },
  {
    id: "features",
    view: "features",
    title: "Anpassa systemet på sekunder",
    description: "Varje arbetsplats är unik. Aktivera bara de funktioner ni behöver – med ett klick. Ni betalar aldrig för funktioner ni inte använder, och kan skala upp när verksamheten växer.",
    example: "Exempel: Ett litet städföretag börjar med Schema + Checklistor. Sex månader senare lägger de till Avvikelser och Certifikat – utan uppgradering eller ny installation.",
    duration: 8000,
    spotlightSelector: "[data-presentation='feature-switches']",
    icon: "⚡",
  },
  {
    id: "cta",
    view: "cta",
    title: "Redo att ta kontroll över er arbetsplats?",
    description: "Starta en pilot eller boka en genomgång med oss.",
    duration: 0, // stays until user acts
  },
];