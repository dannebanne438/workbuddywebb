

# Fas 1: Platschef-Dashboard + Certifikathantering

## Sammanfattning
Bygger ut WorkBuddy med två sammankopplade funktioner:
1. **Platschef-dashboard** -- ett kontrolltorn med realtidsdata
2. **Certifikathantering** -- grunden for riskmotorn

Dessa bildar basen for att WorkBuddy ska ga fran "adminverktyg" till "operativsystem for byggarbetsplatser".

---

## Del 1: Certifikathantering (datagrund)

### Ny databastabell: `certificates`

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| id | uuid | PK |
| workplace_id | uuid | FK till workplaces |
| user_id | uuid | Koppling till profiles (nullable) |
| user_name | text | Personnnamn (for enkel visning) |
| certificate_type | text | Typ: "Fallskydd", "Heta arbeten", "Truck", "Lift", "El", "ID06", etc. |
| issued_date | date | Utfardandedatum |
| expiry_date | date | Utgangsdatum |
| issuer | text | Utfardare (nullable) |
| certificate_number | text | Certifikatnummer (nullable) |
| status | text | "valid", "expiring_soon", "expired" (beraknas) |
| notes | text | Anteckningar (nullable) |
| created_at | timestamptz | Default now() |
| created_by | uuid | Vem som lade till |

### RLS-policies
- Admins kan skapa, lasa, uppdatera och ta bort certifikat for sin arbetsplats
- Anstallda kan lasa certifikat for sin arbetsplats (behover se sitt eget)
- Super admin kan se allt

### Ny databastabell: `incidents`

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| id | uuid | PK |
| workplace_id | uuid | FK till workplaces |
| title | text | Rubrik |
| description | text | Beskrivning |
| severity | text | "low", "medium", "high", "critical" |
| category | text | "safety", "quality", "environment", "delay" |
| reported_by | uuid | Vem som rapporterade |
| reported_by_name | text | Namn pa rapportoren |
| status | text | "open", "investigating", "resolved", "closed" |
| resolved_at | timestamptz | Nar den lostes |
| created_at | timestamptz | Default now() |

### RLS-policies for incidents
- Alla anstallda pa arbetsplatsen kan skapa och lasa incidenter
- Admins kan uppdatera och ta bort

---

## Del 2: Platschef-Dashboard

### Ny vy: `DashboardView.tsx`

Dashboarden visar foljande sektioner i ett responsivt grid:

**Rad 1 -- KPI-kort (4 st)**

| Kort | Data | Berakning |
|------|------|-----------|
| Aktiva idag | Antal personer schemalagda idag | Count fran schedules for today |
| Oppna avvikelser | Antal olosta incidenter | Count fran incidents where status != "resolved"/"closed" |
| Utlopande certifikat | Certifikat som gar ut inom 30 dagar | Count fran certificates where expiry_date <= today+30 |
| Veckotimmar | Totala schemalagda timmar denna vecka | Sum fran schedules |

**Rad 2 -- Tva kolumner**

Vanster: **Dagsoversikt** (vem jobbar idag, tider, roller)
Hoger: **Riskvarningar** (utgangna certifikat, avvikelser, schemakrockar)

**Rad 3 -- Tva kolumner**

Vanster: **Senaste avvikelser** (lista med de 5 senaste incidenterna)
Hoger: **Snabbatgarder** (knappar: "Rapportera avvikelse", "Lagg till pass", "Skapa checklista")

### Ny vy: `CertificatesView.tsx`

En dedikerad vy for att hantera certifikat:
- Tabell/lista over alla certifikat per personal
- Fargkodning: gront (giltigt), gult (gar ut inom 30 dagar), rott (utgett)
- "Lagg till certifikat"-dialog
- "Ta bort"-knapp med bekraftelse
- Filtrering pa typ och status

### Ny vy: `IncidentsView.tsx`

En dedikerad vy for avvikelser:
- Lista over avvikelser med severity-ikoner
- "Rapportera avvikelse"-dialog
- Statusuppdatering (admin)
- Filtrering pa kategori och status

---

## Del 3: Navigation och routing

### Uppdateringar i sidomenyn

Lagger till "Dashboard" langst upp i navigeringen (for admins) och "Certifikat" under admin-sektionen. "Avvikelser" laggs till som en ny meny for alla anvandare.

```text
-- NavItems (alla) --
[Dashboard]  <-- NY (admin-only, default-vy for admins)
WorkBuddy
Teamchatt
Schema
Checklistor
Rutiner
Nyheter
Avvikelser   <-- NY (alla anvandare)

-- Admin --
Personal
Certifikat   <-- NY
Installningar
```

### PortalView-typ
Utoka `PortalView` med: `"dashboard"`, `"certificates"`, `"incidents"`

### PortalContent
Lagg till rendering av de tre nya vyerna i `renderView()` switch-satsen.

### MobileBottomNav
Byt ut ett av de befintliga nav-alternativen eller lagg till "Dashboard" som forsta alternativ (for admins).

---

## Del 4: AI-integration

### Nya verktyg i `workbuddy-chat/index.ts`

**`query_certificates`** -- Fraga om certifikat
- "Vilka certifikat har Anna?"
- "Vem saknar fallskyddscertifikat?"
- "Vilka certifikat gar ut snart?"

**`create_incident`** -- Rapportera avvikelse via AI
- "Rapportera att det saknas skyddsrackke pa vaning 3"
- "Lagg till en avvikelse: materialforrsening fran leverantor X"

### Uppdaterad systemprompt
Lagg till certifikat- och incidentdata i kontexten sa att AI:n kan svara pa fragor som:
- "Har alla som jobbar imorgon giltigt fallskyddscert?"
- "Visa alla oppna avvikelser"
- "Hur manga avvikelser har vi haft denna manad?"

---

## Tekniska filer som skapas/andras

### Nya filer
| Fil | Beskrivning |
|-----|-------------|
| `src/components/portal/views/DashboardView.tsx` | Platschef-dashboard med KPI:er, dagoversikt, riskvarningar |
| `src/components/portal/views/CertificatesView.tsx` | Certifikathantering med CRUD |
| `src/components/portal/views/IncidentsView.tsx` | Avvikelsehantering med CRUD |
| `src/components/portal/certificates/AddCertificateDialog.tsx` | Dialog for att lagga till certifikat |
| `src/components/portal/certificates/DeleteCertificateDialog.tsx` | Bekraftelsedialog |
| `src/components/portal/incidents/AddIncidentDialog.tsx` | Dialog for att rapportera avvikelse |

### Andrade filer
| Fil | Andringar |
|-----|-----------|
| `src/components/portal/PortalContent.tsx` | Utoka PortalView-typ, lagg till nya vyer i renderView |
| `src/components/portal/PortalSidebar.tsx` | Lagg till Dashboard, Avvikelser och Certifikat i menyerna |
| `src/components/portal/MobileBottomNav.tsx` | Lagg till Dashboard-alternativ |
| `src/components/portal/MobileNav.tsx` | Lagg till nya menyalternativ |
| `supabase/functions/workbuddy-chat/index.ts` | Nya verktyg + utokad systemprompt |

### Databas-migrering
- Skapa tabell `certificates` med RLS
- Skapa tabell `incidents` med RLS
- Aktivera realtime for `incidents` (for live-uppdateringar pa dashboarden)

---

## Visuell struktur -- Dashboard

```text
+---------------------------------------------------------------+
|  Dashboard                                 [Rapportera avvikelse]|
+---------------------------------------------------------------+
|  [Aktiva idag]  [Oppna avvik.]  [Certifikat!]  [Veckotimmar]  |
|      5              2               3              187h         |
+---------------------------------------------------------------+
|  DAGENS SCHEMA                |  RISKVARNINGAR                 |
|  08:00 Anna - Platschef       |  ! Erik: Fallskydd gar ut 15/2 |
|  08:00 Erik - Snickare        |  ! Maria: Truck utgett         |
|  12:00 Maria - Elektriker     |  ! 2 oppna avvikelser          |
|  16:00 Johan - Nattvakt       |                                |
+-------------------------------+--------------------------------+
|  SENASTE AVVIKELSER           |  SNABBATGARDER                 |
|  [!] Saknat skyddsrackke v3   |  [+ Lagg till pass]            |
|  [!] Materialforsening        |  [+ Skapa checklista]          |
|  [i] Buller kl 22             |  [+ Ny rutin]                  |
+-------------------------------+--------------------------------+
```

---

## Mobil layout

Pa mobil staplas korten vertikalt:
1. KPI-kort (2x2 grid)
2. Dagens schema (scrollbar lista)
3. Riskvarningar (badges)
4. Senaste avvikelser
5. Snabbatgarder (horisontell scroll)

---

## Sakerhetsovervaganden
- Certifikattabellen skyddas med RLS (workplace-scoped)
- Incidenttabellen tillater alla anstallda att skapa (rapportera), men bara admins kan ta bort
- Dashboarden visar bara data for den aktiva arbetsplatsen
- AI-verktygen for certifikat ar read-only for icke-admins
