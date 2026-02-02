
# WorkBuddy Förbättringsplan

## Status: ✅ IMPLEMENTERAD

Alla fem förbättringar plus PDF-export har implementerats:
1. ✅ **Interaktiva checklistor** - Klickbara items med progress-bar och expandera-funktion
2. ✅ **AI kan läsa scheman** - Nytt `query_schedule`-verktyg för AI-assistenten
3. ✅ **Redigerbara inställningar** - Admin-panel för att redigera arbetsregler, tider och kontakter
4. ✅ **Notifikationssystem** - In-app notiser med realtime-uppdateringar
5. ✅ **PDF-export av scheman** - Ladda ner rapport över vem som jobbat och när

---

## Del 1: Interaktiva Checklistor

### Nuläge
`ChecklistsView.tsx` visar checklistor som statiska kort utan möjlighet att bocka av items. Items lagras som JSON i `checklists.items`-kolumnen.

### Implementation

**Frontend-ändringar (`ChecklistsView.tsx`):**
- Lägg till klick-hantering på varje checklist-item
- Skapa `toggleChecklistItem(checklistId, itemIndex)` funktion
- Uppdatera lokal state omedelbart för snabb feedback
- Skicka PUT-request till databasen för att uppdatera `items` JSONB
- Visa progress-indikator (X av Y färdiga)
- Lägg till "Expandera"-knapp för att se alla items (inte bara första 5)

**Databaslogik:**
- Inga schemaändringar krävs (items är redan JSONB)
- RLS-policy tillåter redan uppdateringar för användare inom arbetsplatsen

---

## Del 2: AI Kan Läsa Scheman (`query_schedule`)

### Nuläge
Edge function `workbuddy-chat` har redan tillgång till scheman i sitt system-prompt (rad 611), men kan bara svara med det som laddades vid anropets start. Den kan inte söka dynamiskt.

### Implementation

**Nytt verktyg i `workbuddy-chat/index.ts`:**

```text
Verktyg: query_schedule
Beskrivning: Sök och fråga om scheman för specifika datum, personer eller perioder
Parametrar:
  - start_date: YYYY-MM-DD (obligatorisk)
  - end_date: YYYY-MM-DD (valfri, default = start_date)
  - user_name: Filtrera på person (valfri)
  - only_user: Om true, returnera endast pass för den autentiserade användaren

Returnerar: Lista av pass med datum, tid, person, roll
```

**Use cases som aktiveras:**
- "Vem jobbar på fredag?"
- "Vilka pass har jag nästa vecka?"
- "Hur många timmar har Anna jobbat denna månad?"
- "Visa schemat för vecka 6"

**Kod-ändringar:**
1. Lägg till verktyg-definition i `tools`-arrayen (rad 9)
2. Lägg till `case "query_schedule":` i `executeToolCall` (rad 252)
3. Implementera databasförfrågan med datumfilter

---

## Del 3: Redigerbara Inställningar

### Nuläge
`SettingsView.tsx` är helt statisk och visar bara data. Admins kan inte ändra timlön, kontakter eller viktiga tider.

### Implementation

**Ny komponentstruktur:**

```text
SettingsView.tsx
├── EditableWorkplaceInfo (namn, typ, företag)
├── EditableWorkRules (timlön, OB, max timmar, vilotid)
├── EditableImportantTimes (CRUD för tider)
└── EditableContacts (CRUD för kontakter)
```

**För varje sektion:**
- "Redigera"-knapp som byter till formulärläge
- Inline-redigering med Input/Select-komponenter
- "Spara" och "Avbryt" knappar
- Toast-meddelanden vid lyckad/misslyckad uppdatering

**Databasoperationer:**
- `workplaces.settings` (JSONB) - uppdatera arbetsregler
- `important_times` - INSERT/UPDATE/DELETE
- `contacts` - INSERT/UPDATE/DELETE

---

## Del 4: Notifikationssystem

### Databasschema

**Ny tabell: `notifications`**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workplace_id UUID REFERENCES workplaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'announcement', 'dm', 'schedule_change', 'team_message'
  title TEXT NOT NULL,
  message TEXT,
  link TEXT, -- Optional: deep link to relevant view
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Användare kan bara se sina egna notiser
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE USING (auth.uid() = user_id);
```

**Triggers för automatiska notiser:**
1. `AFTER INSERT ON announcements` → Skapa notis för alla på arbetsplatsen
2. `AFTER INSERT ON direct_messages` → Skapa notis för mottagaren
3. `AFTER UPDATE ON schedules` → Skapa notis för berörda personer

**Frontend-komponenter:**

```text
src/components/portal/
├── NotificationBell.tsx       -- Ikon med olästa-räknare
├── NotificationDropdown.tsx   -- Lista över senaste notiser
└── hooks/useNotifications.ts  -- Realtime-subscription + markera läst
```

**Integration:**
- Lägg till `<NotificationBell />` i `PortalSidebar.tsx` och `MobileNav.tsx`
- Realtime-subscription på `notifications` tabellen
- Klick på notis → Markera som läst + navigera till relevant vy

---

## Del 5: PDF-export av Scheman

### Funktion
En knapp i `ScheduleView.tsx` som genererar en PDF-rapport med alla pass för vald period.

### Implementation

**Ny Edge Function: `generate-schedule-pdf`**

```text
Input:
  - workplace_id
  - start_date
  - end_date
  - format: "summary" | "detailed"

Output:
  - PDF-fil (Content-Type: application/pdf)
```

**PDF-innehåll:**
- Rubrik: "Arbetsrapport - [Arbetsplats] - [Period]"
- Tabell med kolumner: Datum, Person, Tid, Roll, Timmar
- Summering: Totalt antal timmar per person
- Footer: Genererad datum

**Teknisk approach:**
1. Använd `jspdf` eller `pdfmake` via Deno-kompatibel version
2. Alternativt: Generera HTML och konvertera till PDF server-side

**Frontend:**
- Ny knapp i `ScheduleView.tsx` header: "Ladda ner rapport"
- Datumväljare för att välja rapportperiod (default: vald vecka/månad)
- Anropa edge function och ladda ner blob som fil

---

## Tekniska Detaljer

### Filer som skapas:
1. `src/components/portal/notifications/NotificationBell.tsx`
2. `src/components/portal/notifications/NotificationDropdown.tsx`
3. `src/hooks/useNotifications.ts`
4. `supabase/functions/generate-schedule-pdf/index.ts`
5. Databasmigration för `notifications`-tabellen

### Filer som uppdateras:
1. `src/components/portal/views/ChecklistsView.tsx` - Interaktivitet
2. `supabase/functions/workbuddy-chat/index.ts` - query_schedule tool
3. `src/components/portal/views/SettingsView.tsx` - Redigerbara fält
4. `src/components/portal/views/ScheduleView.tsx` - PDF-export knapp
5. `src/components/portal/PortalSidebar.tsx` - NotificationBell
6. `src/components/portal/MobileNav.tsx` - NotificationBell
7. `supabase/config.toml` - Registrera ny edge function

### Prioritetsordning:
1. Interaktiva checklistor (enklast, direkt värde)
2. AI kan läsa scheman (hög efterfrågan)
3. PDF-export (ny funktion användaren bad om)
4. Redigerbara inställningar (admin-fokus)
5. Notifikationssystem (mest komplext, störst påverkan)

### Beroenden:
- PDF-generering kräver ett bibliotek (jspdf eller pdfmake)
- Notifikationssystem kräver databasändringar och triggers
- Alla andra ändringar kan göras oberoende av varandra
