

# Fokuserad BYGGPRESENTATION: Avvikelser, PDF-bevis, Flersprakig chatt

## Oversikt
Presentationen bantas fran 8+intro+CTA till 6+intro+CTA slides. Alla slides om certifikat, dashboard, schema/checklistor tas bort. Kvarvarande teman far djupare, mer brutala formuleringar.

## Ny slide-struktur

```text
INTRO   -> "Kontroll. Sparbarhet. Ansvar."
SLIDE 1 -> Avvikelsen ingen dokumenterade (risk-scenario, incidents-vy)
SLIDE 2 -> Foto till fardig rapport direkt (kamera-vy, AI-analys)
SLIDE 3 -> Varje andring loggas permanent (audit trail, incidents-vy)
SLIDE 4 -> Exportera bevis pa 30 sekunder (PDF-export, incidents-vy)
SLIDE 5 -> Alla forstar -- oavsett sprak (flersprakig chatt-vy)
SLIDE 6 -> Fran avvikelse till ATA-underlag (helhetsflodet, incidents-vy)
CTA     -> "Vill ni se hur detta fungerar pa ert projekt?"
```

## Detaljerade slide-texter

### Slide 1: "Avvikelsen ingen dokumenterade"
- Spricka i stallning upptacks fredag kl 14
- Ingen rapport skrivs -- "vi fixar pa mandag"
- Olycka lordag. Arbetsmiljoverket kraver dokumentation
- WorkBuddy: foto, servertidsstampel, rapport pa 30 sekunder
- Beviskedjan finns innan ni lamnat bygget

### Slide 2: "Foto till fardig rapport direkt" (ny djupare version)
- Fotografera skadan -- AI foreslar kategori och allvarlighetsgrad
- Rubrik, beskrivning och klassificering fylls i automatiskt
- Granska, justera om du vill, publicera -- under 30 sekunder
- Ansvarig notifieras direkt med bild och tidsstampel
- Ingen manuell klassificering -- ingen rapportjakt

### Slide 3: "Varje andring loggas permanent" (djupare)
- Servertidsstampel som inte kan redigeras i efterhand
- Anvandar-ID kopplas automatiskt till varje handelse
- Fore- och efter-varden sparas vid statusandring
- Loggar ar skrivskyddade -- ingen kan radera historik
- Vid tvist: komplett andringslogg fran dag ett

### Slide 4: "Exportera bevis pa 30 sekunder" (djupare)
- PDF med foton, tidsstamplar, andringslogg och ansvariga
- Fore- och efter-bilder kravs innan arende stangs
- Redo for Arbetsmiljoverket, forsakringsbolag eller bestallare
- Varje foto last med servertidsstampel vid uppladdning
- ATA-underlag med verifierbar dokumentation i ett klick

### Slide 5: "Alla forstar -- oavsett sprak" (ny -- djupare chatt-slide)
- Arbetsledaren fragar pa svenska -- svaret ar korrekt
- Polsk UE-snickare fragar pa polska -- samma svar, ratt sprak
- Arabisktalande betongarbetare far instruktioner pa arabiska
- Missforstand minskar -- olycksrisken sjunker
- Alla kan rapportera avvikelser pa sitt eget sprak

### Slide 6: "Fran avvikelse till ATA-underlag" (ny helhetsbild)
- Avvikelse rapporteras med foto fran mobilen
- AI klassificerar, ansvarig tilldelas, atgard loggas
- Fore- och efter-bilder dokumenterar hela forloppet
- PDF-rapport genereras med komplett beviskedja
- Bevisunderlaget haller i rattslig provning

## Tekniska andringar

### 1. `byggPresentationSteps.ts`
- Ta bort slides: bygg-slide-2 (certifikat), bygg-slide-4 (dashboard), bygg-slide-7 (schema/checklistor)
- Uppdatera bygg-slide-6 fran kamera till ny "Alla forstar"-slide med `view: "camera"` och `id` som triggar `PresentationMultilingualChat`
- Lagg till ny slide 6 "Fran avvikelse till ATA-underlag" med `view: "incidents"`
- Justera slide-ID:n och ordning

### 2. `PortalContent.tsx`
- Uppdatera villkoret for `PresentationMultilingualChat` sa att det matchar det nya slide-ID:t for sprakovversattningen (t.ex. `bygg-slide-5`)

### 3. Inga andra filer paverkas
- Overlayet, intro och CTA forblir oforandrade
- Alla vyer (incidents, camera/chat) finns redan

