export type Package = "starter" | "business" | "enterprise";

export interface QuoteCustomer {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  employeeCount: number;
  comment: string;
}

export interface QuoteModule {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
}

export interface QuoteData {
  customer: QuoteCustomer;
  selectedPackage: Package;
  selectedModules: string[];
  isPilot: boolean;
  quoteText: string;
}

export const INDUSTRIES = [
  "Säkerhet",
  "Event",
  "Bemanning",
  "Hotell",
  "Gym",
  "Detaljhandel",
  "Annat",
];

export const PACKAGES: Record<Package, { name: string; description: string; baseCost: number; perUser: number }> = {
  starter: {
    name: "Starter",
    description: "För mindre företag som vill ha grundläggande intranät och kommunikation.",
    baseCost: 999,
    perUser: 19,
  },
  business: {
    name: "Business",
    description: "För företag som vill ha AI, personalfunktioner och mer operativ kontroll.",
    baseCost: 1490,
    perUser: 29,
  },
  enterprise: {
    name: "Enterprise",
    description: "För större företag med behov av avancerade funktioner, analys och specialanpassning.",
    baseCost: 2990,
    perUser: 39,
  },
};

export const MODULES: QuoteModule[] = [
  { id: "ai", name: "AI-assistent", description: "Digital platschef som svarar på frågor, analyserar bilder och stöttar teamet.", monthlyPrice: 990 },
  { id: "schedule", name: "Schemahantering", description: "Planera och hantera arbetsscheman med godkännandeflöde.", monthlyPrice: 790 },
  { id: "incidents", name: "Avvikelsehantering", description: "Rapportera och spåra incidenter med beviskedja och PDF-export.", monthlyPrice: 590 },
  { id: "onboarding", name: "Onboarding / utbildning", description: "Introduktionsflöden och utbildningsmaterial för nyanställda.", monthlyPrice: 590 },
  { id: "documents", name: "Dokument & intranät", description: "Delad dokumenthantering och internt kunskapsbibliotek.", monthlyPrice: 0 },
  { id: "analytics", name: "Analys / rapporter", description: "Dashboards, statistik och exporterbara rapporter.", monthlyPrice: 690 },
  { id: "custom", name: "Specialanpassning", description: "Anpassade arbetsflöden, UI och funktionalitet efter kundens behov.", monthlyPrice: 1490 },
  { id: "integrations", name: "Integrationer", description: "Kopplingar mot externa system som lönehantering, bokföring m.m.", monthlyPrice: 1290 },
];

export const PILOT_PRICE = 1990;
export const PILOT_MAX_USERS = 50;

export function calculateQuotePrice(data: QuoteData) {
  if (data.isPilot) {
    const modulesCost = data.selectedModules.reduce((sum, id) => {
      const mod = MODULES.find((m) => m.id === id);
      return sum + (mod?.monthlyPrice ?? 0);
    }, 0);
    return {
      baseCost: PILOT_PRICE,
      userCost: 0,
      modulesCost,
      totalMonthly: PILOT_PRICE + modulesCost,
      totalYearly: (PILOT_PRICE + modulesCost) * 12,
      isPilot: true,
    };
  }

  const pkg = PACKAGES[data.selectedPackage];
  const baseCost = pkg.baseCost;
  const userCost = pkg.perUser * (data.customer.employeeCount || 0);
  const modulesCost = data.selectedModules.reduce((sum, id) => {
    const mod = MODULES.find((m) => m.id === id);
    return sum + (mod?.monthlyPrice ?? 0);
  }, 0);
  const totalMonthly = baseCost + userCost + modulesCost;

  return {
    baseCost,
    userCost,
    modulesCost,
    totalMonthly,
    totalYearly: totalMonthly * 12,
    isPilot: false,
  };
}

export const DEFAULT_CUSTOMER: QuoteCustomer = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  industry: "",
  employeeCount: 10,
  comment: "",
};

// CRM dummy data
export interface CRMLead {
  id: string;
  company: string;
  contact: string;
  status: "new" | "contacted" | "qualified" | "proposal";
  date: string;
}

export interface CRMQuote {
  id: string;
  company: string;
  package: string;
  total: number;
  status: "draft" | "sent" | "accepted" | "declined";
  date: string;
}

export const DUMMY_LEADS: CRMLead[] = [
  { id: "1", company: "SecureGuard AB", contact: "Erik Johansson", status: "proposal", date: "2026-03-06" },
  { id: "2", company: "EventPro Nordic", contact: "Sara Lindström", status: "qualified", date: "2026-03-05" },
  { id: "3", company: "StaffConnect Sverige", contact: "Ahmad Al-Rashid", status: "contacted", date: "2026-03-04" },
  { id: "4", company: "Nordic Hotels Group", contact: "Maria Andersson", status: "new", date: "2026-03-07" },
  { id: "5", company: "FitLife Gym", contact: "Jonas Berg", status: "new", date: "2026-03-08" },
];

export const DUMMY_QUOTES: CRMQuote[] = [
  { id: "Q-001", company: "SecureGuard AB", package: "Enterprise", total: 8470, status: "sent", date: "2026-03-06" },
  { id: "Q-002", company: "EventPro Nordic", package: "Business", total: 4360, status: "accepted", date: "2026-02-28" },
  { id: "Q-003", company: "StaffConnect Sverige", package: "Business", total: 3180, status: "draft", date: "2026-03-04" },
];
