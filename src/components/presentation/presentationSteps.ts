export type PortalView = "camera" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin" | "workplace-detail" | "team-chat" | "dashboard" | "certificates" | "incidents" | "documents" | "photos" | "features";

export interface PresentationStep {
  id: string;
  view: PortalView | "intro" | "cta";
  title: string;
  description: string;
  duration: number; // ms
  spotlightSelector?: string; // CSS selector for spotlight target
}

export const PRESENTATION_STEPS: PresentationStep[] = [
  {
    id: "intro",
    view: "intro",
    title: "Välkommen till WorkBuddy",
    description: "Er digitala kollega för smartare arbetsplatser. Låt oss visa vad systemet kan göra.",
    duration: 5000,
  },
  {
    id: "dashboard-overview",
    view: "dashboard",
    title: "Realtidsöverblick över hela verksamheten",
    description: "Dashboard ger er KPI:er, schemaöversikt och riskvarningar – allt på ett ställe.",
    duration: 7000,
    spotlightSelector: "[data-presentation='kpi-cards']",
  },
  {
    id: "dashboard-risks",
    view: "dashboard",
    title: "Riskvarningar flaggas automatiskt",
    description: "Utgångna certifikat, öppna avvikelser och bemanningsluckor syns direkt.",
    duration: 6000,
    spotlightSelector: "[data-presentation='risk-warnings']",
  },
  {
    id: "incidents-overview",
    view: "incidents",
    title: "Rapportera och följ upp avvikelser",
    description: "Hela livscykeln – från rapportering till åtgärd och uppföljning – i en tidslinje.",
    duration: 7000,
  },
  {
    id: "incidents-evidence",
    view: "incidents",
    title: "Juridiskt säkrad beviskedja med audit trail",
    description: "Varje ändring loggas med server-tidsstämpel, användar-ID och IP. Exportera som PDF.",
    duration: 7000,
  },
  {
    id: "camera-capture",
    view: "camera",
    title: "Fotografera – AI analyserar automatiskt",
    description: "Ta en bild på arbetsplatsen. AI:n identifierar innehållet och föreslår om det är en nyhet eller avvikelse.",
    duration: 7000,
    spotlightSelector: "[data-presentation='camera-buttons']",
  },
  {
    id: "camera-analysis",
    view: "camera",
    title: "AI föreslår: Nyhet eller Avvikelse",
    description: "AI:n identifierar innehållet, föreslår rubrik, beskrivning och allvarlighetsgrad. Du redigerar och publicerar med ett tryck.",
    duration: 7000,
    spotlightSelector: "[data-presentation='ai-badge']",
  },
  {
    id: "ai-chat",
    view: "camera",
    title: "Fråga WorkBuddy – din AI-assistent",
    description: "Skriv kommandon som \"Schemalägg Anna imorgon 14-22\" och systemet reagerar direkt.",
    duration: 8000,
  },
  {
    id: "schedule",
    view: "schedule",
    title: "Schema i realtid för hela teamet",
    description: "Veckovis schemaöversikt med drag-and-drop. AI:n kan schemalägga åt dig via chatten.",
    duration: 6000,
  },
  {
    id: "checklists",
    view: "checklists",
    title: "Digitala checklistor för säkerhet och kvalitet",
    description: "Skapa mallar, skicka till personal, följ upp i realtid. Allt dokumenterat.",
    duration: 6000,
  },
  {
    id: "employees",
    view: "employees",
    title: "Full överblick över all personal",
    description: "Se all personal på ett ställe. Lägg till nya användare direkt, hantera inbjudningskoder och roller.",
    duration: 7000,
    spotlightSelector: "[data-presentation='employee-list']",
  },
  {
    id: "features",
    view: "features",
    title: "Aktivera funktioner med ett klick",
    description: "Aktivera eller inaktivera funktioner för varje arbetsplats – med ett enda klick. Anpassa systemet efter era behov utan teknisk kompetens.",
    duration: 7000,
    spotlightSelector: "[data-presentation='feature-switches']",
  },
  {
    id: "cta",
    view: "cta",
    title: "Redo att ta kontroll över er arbetsplats?",
    description: "Starta en pilot eller boka en genomgång med oss.",
    duration: 0, // stays until user acts
  },
];
