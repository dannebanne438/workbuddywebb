

# Utokade presentationssteg for WorkBuddy Presentation Mode

## Nya steg att lagga till

Den tidigare planen hade 10 steg. Nu laggs tre nya steg till for att visa **kamerafunktionen med AI-analys**, **personaloverblick** och **snabb funktionshantering**.

## Uppdaterad stegordning (13 steg totalt)

```text
Steg  Vy/Funktion              Overlay-text                                             Effekt
----  -----------------------  -------------------------------------------------------  ------------------------------------
1     Intro                    "Valkommen till WorkBuddy"                                Logo + fade-in
2     Dashboard                "Realtidsoverblick over hela verksamheten"                KPI-siffror raknas upp
3     Dashboard                "Riskvarningar flaggas automatiskt"                       Spotlight pa varningspanelen
4     Avvikelser               "Rapportera och folj upp avvikelser"                      Visa tidslinje, zoom in
5     Avvikelser               "Juridiskt sakrad beviskedja med audit trail"             Visa bevis + PDF-knapp
6     Kamera/Foto (NY)         "Fotografera -- AI analyserar automatiskt"                Visa kameravyn, simulera bildval
7     Kamera/Foto (NY)         "AI forslar: Nyhet eller Avvikelse"                       Visa redigeringssteget med AI-badge
8     AI-chatt                 "Fraga WorkBuddy -- din AI-assistent"                     Auto-typing av fraga + svar
9     Schema                   "Schema i realtid for hela teamet"                        Visa veckoschema
10    Checklistor              "Digitala checklistor for sakerhet och kvalitet"           Visa mallista
11    Personal (NY)            "Full overblick over all personal"                         Visa personallista + inbjudningskoder
12    Funktionshantering (NY)  "Aktivera funktioner med ett klick"                       Visa feature-toggles, animera en switch
13    CTA                      "Redo att ta kontroll over er arbetsplats?"                Tva knappar: Pilot + Demo
```

## Teknisk implementation per nytt steg

### Steg 6-7: Kamera/Foto -- "AI ser vad du ser"

Presentationen navigerar till **camera**-vyn och visar CameraWithChatView. Tva substeg:

**Steg 6 -- Fangst-lagets overlay:**
- Spotlight pa kameraknapparna ("Ta bild" / "Valj bild")
- Overlay-text: "Fotografera nagot pa arbetsplatsen. AI:n analyserar bilden automatiskt och forslar om det ar en nyhet eller en avvikelse."
- Ingen simulerad klick -- bara visar vyn och forklarar

**Steg 7 -- Analysresultat (simulerat):**
- Vyn visas i "edit"-steget med en forifyld simulerad bild och AI-badge ("AI-forslag: Avvikelse, hog sakerhet")
- Spotlight pa AI-confidence-badgen och typ-valjaren
- Overlay-text: "AI:n identifierar innehallet, forslar rubrik, beskrivning och allvarlighetsgrad. Du redigerar och publicerar med ett tryck."

For att simulera detta utan att faktiskt ta en bild skapas ett `presentationMode`-prop pa CameraView som visar ett forinstalt demo-tillstand (steg = "edit" med fejkad analys).

### Steg 11: Personal -- "Full kontroll over teamet"

Presentationen navigerar till **employees**-vyn.

- Visa personallistan med demo-anvandare
- Spotlight pa "Lagg till"-knappen
- Overlay-text: "Se all personal pa ett stalle. Lagg till nya anvandare direkt, hantera inbjudningskoder och roller."
- Spotlight ror sig sedan till inbjudningskod-sektionen

### Steg 12: Funktionshantering -- "Anpassa pa sekunder"

Presentationen navigerar till en specialvy som visar WorkplaceFeatureManager-komponenten. Eftersom denna normalt bara finns i SuperAdminView/WorkplaceDetailView, skapas en enkel wrapper-komponent som renderar den i presentationslaget.

- Visa listan med alla funktioner och deras switchar
- Animera en switch (t.ex. "Dokument") fran av till pa med en mjuk transition
- Overlay-text: "Aktivera eller inaktivera funktioner for varje arbetsplats -- med ett enda klick. Anpassa systemet efter era behov utan teknisk kompetens."
- Spotlight pa switch-raden som animeras

## Andringar i filer

### Nya filer

| Fil | Syfte |
|-----|-------|
| `src/components/presentation/presentationSteps.ts` | Uppdaterad steg-array med 13 steg inkl. nya vyer och overlays |

### Andringar i befintliga filer

| Fil | Andring |
|-----|---------|
| `src/components/presentation/presentationSteps.ts` | Lagga till steg 6, 7, 11, 12 med korrekt vy-referens, overlay-text och spotlight-target |
| `src/components/portal/views/CameraView.tsx` | Lagga till `presentationMode`-prop som visar "edit"-steget med simulerad AI-analys utan att behova ta en riktig bild |
| `src/components/presentation/PresentationOverlay.tsx` | Stodja de nya stegen i spotlight-logiken (berakna position for kamera-knappar, personallista, feature-switches) |
| `src/contexts/PresentationContext.tsx` | Utoka steglistan fran 10 till 13 steg, hantera vy-byten for "camera", "employees" och en ny "features"-wrapper |
| `src/components/portal/PortalContent.tsx` | Stodja att presentationen kan navigera till "employees" och visa feature-manager som en tillfalllig vy i presentationslaget |

### Simulerad switch-animation (steg 12)

I PresentationOverlay skapas en useEffect som nar steget ar 12:
1. Vantar 2 sekunder
2. Animerar en CSS-klass pa en specifik switch-rad (via data-attribut)
3. Togglar visuellt fran av till pa med en smooth transition
4. Visar en liten "toast"-liknande badge: "Dokument aktiverad"

Ingen riktig databasandring sker -- allt ar visuellt.

### CameraView demo-lage

CameraView far ett nytt prop:
```typescript
interface CameraViewProps {
  presentationMode?: boolean;
}
```

Nar `presentationMode` ar true:
- Hoppar direkt till `step = "edit"`
- Visar en placeholder-bild (t.ex. fran `/placeholder.svg` eller en demo-bild)
- Visar en fejkad AnalysisResult med `suggested_type: "incident"`, `confidence: "high"`, rubrik "Vattenlaecka i korridoren" och beskrivning
- Inga riktiga API-anrop gors

## Sammanfattning

Presentationen utdkas fran 10 till 13 steg och tacker nu aven:
- **Kamerafunktionen** med AI-bildanalys (tva steg som visar bade fangst och AI-forslag)
- **Personaloverblick** med anvandarlista och inbjudningskoder
- **Snabb funktionshantering** med animerade switchar

Allt ar simulerat och isolerat fran riktig data. Designen foljer samma minimalistiska, professionella stil som ovriga presentationssteg.

