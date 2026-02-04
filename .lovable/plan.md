

# Kartbaserad Företagsinhämtning för WorkBuddy HQ

## Sammanfattning

Ett nytt verktyg i Super Admin-vyn som låter dig välja ett geografiskt område på en interaktiv karta och sedan använda AI för att identifiera och prioritera relevanta företagskontakter för WorkBuddy-försäljning.

## Hur det fungerar

```text
┌─────────────────────────────────────────────────────────────┐
│                    WORKBUDDY HQ                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 INTERAKTIV KARTA                       │  │
│  │     ┌──────────────────┐                               │  │
│  │     │   Stockholm      │  ← Sök efter stad/område      │  │
│  │     └──────────────────┘                               │  │
│  │                                                        │  │
│  │         ╭─────────────────╮                            │  │
│  │         │    VALT         │  ← Rita cirkel på kartan   │  │
│  │         │    OMRÅDE       │    (radie i km)            │  │
│  │         │    2.5 km       │                            │  │
│  │         ╰─────────────────╯                            │  │
│  │                                                        │  │
│  │  [Säkerhet ✓] [Event ✓] [Bemanning ✓] [Hotell ✓]      │  │
│  │                                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│               [ Sök Företag i Området ]                      │
│                         ↓                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  AI ANALYSERAR OCH RETURNERAR:                        │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │ SecureGuard AB                    Lead: 87/100 │   │  │
│  │  │ Bransch: Säkerhet | Storlek: 45 anställda      │   │  │
│  │  │ Kontakt: Anna Lindberg (Driftchef)             │   │  │
│  │  │ E-post: anna@secureguard.se                    │   │  │
│  │  │ Relevans: Skiftarbete, 3 kontor                │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │  [Spara som Lead]  [Exportera Lista]                  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Vad som byggs

| Komponent | Beskrivning |
|-----------|-------------|
| **Interaktiv karta** | React Leaflet med OpenStreetMap (gratis, ingen API-nyckel) |
| **Områdesväljare** | Sök stad + ange radie i km |
| **Branschfilter** | Förvalda kategorier: Säkerhet, Event, Bemanning, Hotell/Restaurang, Gym |
| **AI-sökfunktion** | Edge function som använder Lovable AI för att identifiera företag |
| **Lead-tabell** | Ny databastabell för att lagra genererade leads med poängsättning |
| **Export** | Spara leads till databasen för uppföljning |

## Begränsningar (som specificerats)

- Ingen data fabriceras - AI instrueras att returnera `null` vid osäkerhet
- Kvalitet prioriteras före kvantitet
- Endast Super Admin har tillgång

---

## Teknisk implementation

### Steg 1: Ny databastabell för prospekt-leads

En ny tabell `prospect_leads` skapas för att lagra AI-genererade företagskontakter separat från inkommande kontaktförfrågningar:

```sql
CREATE TABLE public.prospect_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Företagsinfo
  company_name TEXT NOT NULL,
  industry TEXT,
  address TEXT,
  city TEXT,
  
  -- Storlek och relevans
  estimated_employees INTEGER,
  relevance_notes TEXT,
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
  
  -- Kontaktpersoner (JSON-array)
  contacts JSONB DEFAULT '[]',
  
  -- Sökparametrar
  search_area TEXT,
  search_coordinates JSONB,
  search_radius_km NUMERIC,
  
  -- Status
  status TEXT DEFAULT 'new',
  notes TEXT
);

-- RLS: Endast super admins
ALTER TABLE public.prospect_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage prospect leads"
  ON public.prospect_leads FOR ALL
  USING (is_super_admin(auth.uid()));
```

### Steg 2: Edge Function för AI-sökning

Ny edge function `prospect-search` som:
1. Tar emot koordinater, radie och branschfilter
2. Använder Lovable AI (Gemini) med strukturerad output
3. Returnerar matchande företag med lead-poäng

```typescript
// supabase/functions/prospect-search/index.ts

// Systempromp som instruerar AI att:
// - Endast returnera verifierbara företag
// - Prioritera skiftarbete, flera arbetsplatser, 10+ anställda
// - Fokusera på: Säkerhet, Event, Bemanning, Hotell, Gym
// - Returnera null för osäkra fält

// Tool-call schema för strukturerad output:
{
  name: "return_prospect_leads",
  parameters: {
    prospects: [{
      company_name: string,
      industry: string | null,
      address: string | null,
      city: string | null,
      estimated_employees: number | null,
      contacts: [{
        name: string | null,
        role: string | null,
        email: string | null,
        phone: string | null,
        linkedin: string | null
      }],
      relevance_notes: string,
      lead_score: number
    }]
  }
}
```

### Steg 3: UI-komponent för Super Admin

Ny flik "Prospektering" i Super Admin-vyn med:

**MapLeadFinder.tsx:**
- React Leaflet-karta centrerad på Sverige
- Sökfält för stad/område (Nominatim geocoding)
- Slider för radie (1-10 km)
- Checkbox-filter för branscher
- "Sök"-knapp som triggar AI-analys
- Resultatvisning med lead-kort
- Spara-funktion till `prospect_leads`

### Steg 4: Filer som skapas/ändras

| Fil | Ändring |
|-----|---------|
| `supabase/functions/prospect-search/index.ts` | Ny edge function för AI-sökning |
| `src/components/portal/views/MapLeadFinder.tsx` | Ny kartkomponent |
| `src/components/portal/views/SuperAdminView.tsx` | Lägg till flik för prospektering |
| `package.json` | Lägg till `react-leaflet`, `leaflet` |

### Steg 5: Beroenden

```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "@types/leaflet": "^1.9.8"
}
```

---

## Dataflöde

```text
1. Super Admin öppnar "Prospektering"-fliken
2. Väljer område på kartan (stad + radie)
3. Väljer branschfilter (Säkerhet, Event, etc.)
4. Klickar "Sök Företag"
           │
           ▼
5. Frontend anropar /functions/v1/prospect-search
           │
           ▼
6. Edge function bygger prompt:
   "Identifiera företag inom [stad], [radie] km,
    inom branscherna [filter], som har skiftarbete,
    10+ anställda, eller flera arbetsplatser..."
           │
           ▼
7. Lovable AI (Gemini) returnerar strukturerade leads
           │
           ▼
8. Frontend visar resultaten som kort med:
   - Företagsnamn, bransch, storlek
   - Kontaktpersoner (om tillgängliga)
   - Lead-poäng (0-100)
   - Relevansnotering
           │
           ▼
9. Super Admin kan spara leads till databasen
```

## Output-format

Varje genererat lead innehåller:

```json
{
  "company_name": "SecureGuard AB",
  "industry": "Säkerhet",
  "address": "Storgatan 15",
  "city": "Stockholm",
  "estimated_employees": 45,
  "contacts": [
    {
      "name": "Anna Lindberg",
      "role": "Driftchef",
      "email": "anna@secureguard.se",
      "phone": null,
      "linkedin": null
    }
  ],
  "relevance_notes": "Skiftarbete dygnet runt, 3 kontor i Stockholmsområdet",
  "lead_score": 87
}
```

---

## Säkerhet

- **Endast Super Admin**: RLS-policy begränsar åtkomst till `prospect_leads`-tabellen
- **Ingen känslig data exponeras**: Funktionen körs endast på backend
- **Rate limiting**: Edge function har inbyggd rate limiting via Lovable AI

## Begränsningar att kommunicera

AI-modellen har begränsad realtidskunskap om specifika företag. För bästa resultat:
- Större städer ger fler och mer korrekta resultat
- Kända branschkedjor identifieras bättre
- Kontaktpersoner kan saknas för mindre företag

