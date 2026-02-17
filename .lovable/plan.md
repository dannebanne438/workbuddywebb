

# Implementeringsplan - 5 förbättringar

## 1. Dashboard: Avvikelser-kort som länkar direkt till Avvikelser-vyn

Avvikelsekorten i Dashboard (KPI-kortet "Öppna avvikelser" och "Senaste avvikelser"-listan) ska bli klickbara och navigera direkt till Avvikelser-vyn.

### Tekniska ändringar
- **DashboardView.tsx**: Gör KPI-kortet "Öppna avvikelser" klickbart med `onClick={() => onNavigate?.("incidents")}`
- Gör varje rad i "Senaste avvikelser"-listan klickbar med samma navigering
- Lägg till visuell hover-effekt (cursor-pointer, hover:bg)

---

## 2. Dokumentimport i systemet

Skapa en ny funktion för att ladda upp och lagra dokument (PDF, Word, bilder etc.) kopplat till arbetsplatsen. Dokument lagras i Lovable Cloud Storage (inte i databasen).

### Tekniska ändringar
- **Databas**: Skapa tabell `documents` (id, workplace_id, title, file_url, file_type, file_size, uploaded_by, uploaded_by_name, category, created_at) med RLS-policies
- **Storage**: Skapa storage bucket `documents` för filuppladdning
- **Ny vy**: `DocumentsView.tsx` med uppladdning, listning, filtrering per kategori, och nedladdning/förhandsgranskning
- **Navigation**: Lägg till "Dokument" i sidomenyn (PortalSidebar, MobileBottomNav/MobileNav) med FileText-ikon
- **PortalContent.tsx**: Lägg till "documents"-vy i router/switch

---

## 3. Fotolagring med pedagogisk dokumentationsmiljö

Skapa en bildbank/galleri kopplat till arbetsplatsen där foton kan laddas upp, kategoriseras och enkelt hämtas. Fokus på pedagogisk dokumentation.

### Tekniska ändringar
- **Databas**: Skapa tabell `photos` (id, workplace_id, title, description, image_url, category, tags, uploaded_by, uploaded_by_name, created_at) med RLS-policies
- **Storage**: Skapa storage bucket `photos` (public) för bildlagring
- **Ny vy**: `PhotoGalleryView.tsx` med rutnätsvisning, kategorifilter (t.ex. "Pedagogisk dokumentation", "Aktiviteter", "Projekt"), uppladdning, och enkel nedladdning/kopiering av bilder
- **Navigation**: Lägg till "Bildbank" i sidomenyn med Image-ikon
- **PortalContent.tsx**: Lägg till "photos"-vy

---

## 4. Checklista: Spara-funktion och "Slutförd"-markering

Lägg till möjligheten att spara en checklista som mall samt att markera en checklista som slutförd.

### Tekniska ändringar
- **Databas**: Lägg till kolumner i `checklists`: `status` (text, default 'active'), `completed_at` (timestamp, nullable), `completed_by` (uuid, nullable), `completed_by_name` (text, nullable)
- **ChecklistsView.tsx**:
  - Lägg till "Spara som mall"-knapp som duplicerar checklistan med `is_template: true` och nollställda checkboxar
  - Lägg till "Markera som slutförd"-knapp som sätter status till 'completed' och sparar tidpunkt + vem som slutförde
  - Slutförda checklistor visas med visuell indikation (grön ram, slutförd-badge)
  - Filtreringsmöjlighet: Aktiva / Slutförda / Mallar

---

## 5. Färgsystem (Röd/Gul/Grön) i checklistor

Visa checklistornas framsteg med färgkodning baserat på hur många punkter som är avklarade.

### Tekniska ändringar
- **ChecklistsView.tsx** och **ChatChecklistCard.tsx**:
  - Progress-bar och kort-ram färgas baserat på procent:
    - **Rod** (0-33%): Knappt påbörjad
    - **Gul** (34-66%): Pågående
    - **Gron** (67-100%): Snart/helt klar
  - Logik: `percent <= 33 ? "bg-red-500 border-red-500/50" : percent <= 66 ? "bg-yellow-500 border-yellow-500/50" : "bg-green-500 border-green-500/50"`
  - Applicera på progress-baren, KPI-siffror och kortets border

---

## Sammanfattning av filer som berörs

| Fil | Ändring |
|-----|---------|
| DashboardView.tsx | Klickbara avvikelse-kort |
| ChecklistsView.tsx | Spara mall, slutför, färgsystem |
| ChatChecklistCard.tsx | Färgsystem progress |
| PortalSidebar.tsx | Nya menyval (Dokument, Bildbank) |
| MobileBottomNav.tsx | Nya menyval |
| MobileNav.tsx | Nya menyval |
| PortalContent.tsx | Nya vyer i switch |
| DocumentsView.tsx | Ny fil - dokumenthantering |
| PhotoGalleryView.tsx | Ny fil - bildgalleri |
| features.ts | Nya feature-nycklar |
| Databasmigration | Nya tabeller + kolumner + storage buckets |

