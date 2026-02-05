
# Manuell Hantering + AI-bekräftelse

## Sammanfattning
Lägger till fullständig manuell hantering (skapa, ta bort) för schema, rutiner och nyheter - samt uppdaterar AI-assistenten så att den alltid frågar om bekräftelse innan den utför ändringar i systemet.

---

## Funktionalitet som läggs till

### 1. Schema - Manuell hantering
**Nya funktioner för admins:**
- **"Lägg till pass"** knapp i headern
- Dialog för att skapa nytt pass (datum, namn, start/sluttid, roll)
- **Ta bort-knapp** på varje schemalagt pass
- Bekräftelsedialog innan borttagning

### 2. Rutiner - Manuell hantering
**Nya funktioner för admins:**
- **"Ny rutin"** knapp i headern
- Dialog med fält för titel, kategori och innehåll (markdown)
- **Ta bort-knapp** på varje rutin
- Bekräftelsedialog innan borttagning

### 3. Nyheter - Manuell hantering
**Nya funktioner för admins:**
- **"Ny nyhet"** knapp i headern
- Dialog med fält för titel, innehåll och "fäst"-alternativ
- **Ta bort-knapp** på varje nyhet
- Bekräftelsedialog innan borttagning

### 4. AI-bekräftelse före åtgärder
Uppdaterar AI-assistentens systemprompt så att den:
- **Alltid frågar** "Vill du att jag skapar detta?" innan den lägger in data
- Presenterar vad som ska skapas först, väntar på bekräftelse
- Först efter tydligt "ja" eller "gör det" utför åtgärden

---

## Teknisk implementation

### Nya komponenter

```text
src/components/portal/schedules/
├── AddShiftDialog.tsx      # Dialog för att lägga till pass manuellt
└── DeleteShiftDialog.tsx   # Bekräftelsedialog för borttagning

src/components/portal/routines/
├── AddRoutineDialog.tsx    # Dialog för att skapa ny rutin
└── DeleteRoutineDialog.tsx # Bekräftelsedialog för borttagning

src/components/portal/announcements/
├── AddAnnouncementDialog.tsx    # Dialog för att skapa ny nyhet
└── DeleteAnnouncementDialog.tsx # Bekräftelsedialog för borttagning
```

### Uppdaterade filer

| Fil | Ändringar |
|-----|-----------|
| `ScheduleView.tsx` | Lägg till "Lägg till pass"-knapp, integrera dialoger, lägg till delete-knapp på pass-kort |
| `RoutinesView.tsx` | Lägg till "Ny rutin"-knapp, integrera dialoger, lägg till delete-knapp |
| `AnnouncementsView.tsx` | Lägg till "Ny nyhet"-knapp, integrera dialoger, lägg till delete-knapp |
| `workbuddy-chat/index.ts` | Ändra instruktionen från "Använd ALLTID" till "Fråga ALLTID om bekräftelse först" |

### Admin-kontroll
Alla nya knappar visas endast för användare där `isWorkplaceAdmin === true` (från AuthContext).

---

## AI-prompt förändring

**Nuvarande instruktion (rad 689):**
```
- Använd ALLTID rätt verktyg när användaren vill göra ändringar
```

**Ny instruktion:**
```
- FRÅGA ALLTID användaren om bekräftelse INNAN du skapar, ändrar eller tar bort data
- Presentera först vad du planerar göra, t.ex. "Jag föreslår att skapa ett pass för Anna 08:00-16:00 den 10 februari. Ska jag lägga in det?"
- Vänta på tydligt "ja", "gör det", "lägg in det" innan du utför verktyget
- Om användaren säger "nej" eller "avbryt", lägg INTE in något
```

---

## Användargränssnitt

### Schema-vy (admin)
```text
┌─────────────────────────────────────────────────────────┐
│  📅 Schema                              [+ Lägg till pass]│
├─────────────────────────────────────────────────────────┤
│  Vecka 7 • 10 feb - 16 feb             [< Idag >]      │
├─────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐                      │
│  │ Mån 10 │ │ Tis 11 │ │ Ons 12 │  ...                 │
│  │ Anna   │ │ Erik   │ │ Maria  │                      │
│  │ 08-16  │ │ 12-20  │ │ 16-22  │                      │
│  │  [🗑️]  │ │  [🗑️]  │ │  [🗑️]  │                      │
│  └────────┘ └────────┘ └────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### Lägg till pass-dialog
```text
┌─────────────────────────────────────┐
│  Lägg till pass                  [X] │
├─────────────────────────────────────┤
│  Datum:        [📅 2025-02-10]      │
│  Personal:     [Välj person ▼]      │
│  Starttid:     [08:00]              │
│  Sluttid:      [16:00]              │
│  Roll:         [Kassa]              │
│  Anteckning:   [________________]   │
│                                     │
│           [Avbryt] [Lägg till]      │
└─────────────────────────────────────┘
```

### Rutiner-vy (admin)
```text
┌─────────────────────────────────────────────────────────┐
│  📖 Rutiner                              [+ Ny rutin]   │
├─────────────────────────────────────────────────────────┤
│  ▼ Öppningsrutin morgon          [Daglig] [🗑️]         │
│    1. Slå på lampor...                                 │
│                                                         │
│  ▶ Stängningsrutin kväll         [Daglig] [🗑️]         │
│  ▶ Nödprocedur vid brand         [Säkerhet] [🗑️]       │
└─────────────────────────────────────────────────────────┘
```

---

## Säkerhet
- Endast admins (`isWorkplaceAdmin`) ser hanteringsknappar
- RLS-policies kräver redan admin-roll för DELETE/INSERT
- Bekräftelsedialoger förhindrar oavsiktlig borttagning

---

## Testfall

1. **Admin lägger till pass manuellt** → Pass syns i kalendern
2. **Admin tar bort pass** → Bekräftelse visas → Pass försvinner
3. **Admin lägger till rutin** → Rutin syns i listan
4. **Admin skapar nyhet** → Nyhet visas högst upp
5. **Vanlig anställd** → Ser inte hanteringsknapparna
6. **AI föreslår schema** → Frågar "Ska jag lägga in det?" → Väntar på bekräftelse
7. **AI får bekräftelse** → Utför åtgärden
