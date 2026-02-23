export type PortalView = "camera" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin" | "workplace-detail" | "team-chat" | "dashboard" | "certificates" | "incidents" | "documents" | "photos" | "features";

export interface PresentationStep {
  id: string;
  view: PortalView | "intro" | "cta";
  title: string;
  description: string;
  example?: string;
  bullets?: string[];
  duration: number;
  spotlightSelector?: string;
  icon?: string;
}

export const PRESENTATION_STEPS: PresentationStep[] = [
  {
    id: "intro",
    view: "intro",
    title: "Välkommen till WorkBuddy",
    description: "Operativsystemet för byggarbetsplatsen.",
    duration: 7000,
  },
  {
    id: "dashboard-overview",
    view: "dashboard",
    title: "Hela projektet – en överblick",
    description: "Som platschef behöver du veta exakt vad som händer, just nu. WorkBuddy samlar allt på en enda skärm: bemanning, öppna avvikelser, certifikatstatus och projektmilstolpar. Sluta jaga information – den kommer till dig.",
    example: "Exempel: Måndag morgon, kl 06:30. Du öppnar WorkBuddy och ser direkt: 8 personer på plats, 1 certifikat utgår ikväll, 2 öppna avvikelser från fredagen. Du vet exakt vad som behöver hanteras – innan första fikarasten.",
    duration: 12000,
    spotlightSelector: "[data-presentation='kpi-cards']",
    icon: "📊",
  },
  {
    id: "dashboard-risks",
    view: "dashboard",
    title: "Varningar innan det blir stopp",
    description: "Systemet övervakar era data och flaggar risker automatiskt. Utgångna certifikat, avvikelser som inte åtgärdats, bemanningsluckor – ni ser det innan det blir ett dyrt produktionsstopp eller en arbetsmiljöanmälan.",
    example: "Exempel: \"⚠️ Eriks fallskyddscertifikat går ut om 3 dagar – han är schemalagd för takarbete på torsdag.\" Ni hinner agera, istället för att stå med Arbetsmiljöverket på plats.",
    duration: 11000,
    spotlightSelector: "[data-presentation='risk-warnings']",
    icon: "⚠️",
  },
  {
    id: "incidents-overview",
    view: "incidents",
    title: "Avvikelser – dokumenterat på sekunder",
    description: "När något händer på bygget ska det inte ta 20 minuter att fylla i ett papper som ändå försvinner i en pärm. Med WorkBuddy rapporterar personalen direkt i mobilen – med foto, plats och tidsstämpel. Ansvarig får notis omedelbart.",
    example: "Exempel: En snickare ser en spricka i ställningen kl 07:45 → rapporterar med foto → platschefen får notis → ställningen spärras av inom 15 minuter. Hela kedjan dokumenterad.",
    duration: 12000,
    icon: "🔔",
  },
  {
    id: "incidents-evidence",
    view: "incidents",
    title: "Beviskedja som håller i rätten",
    description: "Varje ändring loggas med server-tidsstämpel och användar-ID. Beviskedjan går inte att manipulera i efterhand. Det här är skillnaden mellan \"vi tror vi hanterade det\" och \"här är dokumentationen\". Exportera som PDF för Arbetsmiljöverket, försäkringsbolag eller beställare.",
    example: "Exempel: Vid en olycksutredning kan ni ta fram en komplett rapport med alla foton, tidsstämplar, åtgärder och ansvariga – på 30 sekunder istället för att gräva i mejl och pärmar.",
    duration: 12000,
    icon: "🔒",
  },
  {
    id: "camera-capture",
    view: "camera",
    title: "Fotografera – systemet gör resten",
    description: "Ta en bild med mobilen. WorkBuddy analyserar innehållet och föreslår automatiskt om det är en avvikelse, en dokumentation eller ett tillbudsrapport. Ingen manuell klassificering – bara tryck och publicera.",
    example: "Exempel: Du fotograferar en trasig skyddsräcke → systemet föreslår: \"Avvikelse · Fallskydd · Hög allvarlighetsgrad\" – rubrik och beskrivning fylls i automatiskt.",
    duration: 11000,
    spotlightSelector: "[data-presentation='camera-buttons']",
    icon: "📸",
  },
  {
    id: "camera-analysis",
    view: "camera",
    title: "Från foto till rapport på 30 sekunder",
    description: "Systemet identifierar vad bilden föreställer och skapar ett komplett förslag med rubrik, beskrivning och allvarlighetsgrad. Du granskar, justerar om du vill, och publicerar. Det som förut tog ett kvarts tar nu en halv minut.",
    example: "Exempel: Systemförslag → Rubrik: \"Bristfällig avspärrning vid schakt\" · Kategori: Markarbete · Allvarlighetsgrad: Kritisk · Beskrivning: \"Avspärrning saknas vid öppen schakt, djup ca 1.5m, nära gångväg\"",
    duration: 11000,
    spotlightSelector: "[data-presentation='ai-badge']",
    icon: "📋",
  },
  {
    id: "ai-chat",
    view: "camera",
    title: "Förstår alla på bygget – oavsett språk",
    description: "Er digitala platschef svarar på svenska, engelska, polska, arabiska och fler språk. Perfekt för projekt med internationella UE och blandade team. Alla kan ställa frågor om byggregler och rutiner på sitt eget språk.",
    example: "Exempel: En polsk UE-snickare undrar vilka regler som gäller för arbete på höjd – och får svaret direkt på polska, med hänvisning till svenska arbetsmiljöregler.",
    duration: 18000,
    icon: "🌍",
  },
  {
    id: "employees",
    view: "employees",
    title: "Personalen – samlad och spårbar",
    description: "Se all personal, deras certifikat, roller och närvaro på ett ställe. Bjud in nya medarbetare med en kod – de är igång på en minut. Perfekt för projekt med snabb personalomsättning och UE.",
    example: "Exempel: Ny UE-snickare anländer på måndag → får koden \"BYGG-SOLNA\" → registrerar sig → ser direkt sina pass, checklistor och projektrutiner. Ingen introduktionsjakt.",
    duration: 11000,
    spotlightSelector: "[data-presentation='employee-list']",
    icon: "👥",
  },
  {
    id: "features",
    view: "features",
    title: "Anpassa efter ert projekt",
    description: "Varje byggprojekt är unikt. Aktivera bara de moduler ni behöver – avvikelser, certifikat, checklistor, schema. Skala upp eller ner efter projektets fas utan krånglig uppgradering.",
    example: "Exempel: I grundläggningsfasen behöver ni Schema + Avvikelser. När stommen kommer lägger ni till Certifikat och Checklistor. Ett klick, inga extra kostnader förrän ni använder det.",
    duration: 11000,
    spotlightSelector: "[data-presentation='feature-switches']",
    icon: "⚡",
  },
  {
    id: "cta",
    view: "cta",
    title: "Redo att digitalisera ert byggprojekt?",
    description: "Boka en genomgång och se hur WorkBuddy kan anpassas för just er verksamhet.",
    duration: 0,
  },
];
