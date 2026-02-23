
# Kameran som central funktion i avvikelserapportering

## Nuläge
- Avvikelsevyn ("Rapportera"-knappen) oppnar en textbaserad dialog utan fotomojlighet
- Kameravyn finns separat under WorkBuddy-fliken som sidopanel
- Tva helt separata floden for att rapportera avvikelser

## Forandringar

### 1. Lagg till kameraknapp direkt i Avvikelsevyn
Bredvid den befintliga "Rapportera"-knappen laggs en prominent kameraknapp som oppnar kameraflodet direkt fran avvikelsevyn. Kameraknappen blir den primare/storsta knappen, textrapportering blir sekundar.

### 2. Lagg till fotouppladdning i AddIncidentDialog
Den befintliga textbaserade rapporteringsdialoogen far ocksa ett fotofalt sa att varje avvikelse kan ha en bild bifogad, aven utan AI-analys.

### 3. Integrera CameraView som Sheet/Modal i Avvikelsevyn
Nar anvandaren klickar kameraknappen i avvikelsevyn oppnas CameraView som en bottom sheet (mobil) eller sidopanel (desktop), forifylld med typ "incident" (hoppa over valet nyhet/avvikelse).

### 4. Uppdatera CameraView med incident-fokuserat lage
CameraView far en optional prop `defaultType="incident"` som:
- Doljer typ-valjaren (nyhet/avvikelse)
- Laser typen till "incident"
- Andrar rubrik till "Rapportera avvikelse med foto"

---

## Tekniska detaljer

### CameraView.tsx
- Ny prop: `defaultType?: "incident" | "announcement"`
- Ny prop: `onSuccess?: () => void` (callback for att refresha listan)
- Nar `defaultType` ar satt, doljs typ-valjaren och typen ar last
- Vid lyckat publicering anropas `onSuccess`

### IncidentsView.tsx
- Lagg till state `cameraOpen` och importera `CameraView`
- Ersatt enkel "Rapportera"-knapp med tva knappar:
  - **Primare:** Kameraikon + "Foto" (oppnar CameraView som Sheet/sidopanel)
  - **Sekundar:** Plus-ikon + "Manuell" (oppnar befintlig AddIncidentDialog)
- Pa mobil: CameraView oppnas som `Sheet` fran botten
- Pa desktop: CameraView oppnas som sidopanel (420px bred)

### AddIncidentDialog.tsx
- Lagg till ett valfritt fotofalt med `<input type="file" accept="image/*">` 
- Laddar upp till `camera-uploads` bucket och sparar `image_url` pa incidenten

### Filstruktur
- `src/components/portal/views/CameraView.tsx` - uppdateras med `defaultType` och `onSuccess` props
- `src/components/portal/views/IncidentsView.tsx` - integrerar kameraflodet
- `src/components/portal/incidents/AddIncidentDialog.tsx` - lagg till fotofalt
