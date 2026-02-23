

# Snabbare avvikelserapportering: 3 steg

## Problem
Nuvarande flode har 4 separata steg med manga formulärfält som bromsar rapporteringen:
1. Ta bild (capture-skärm med knappar)
2. AI analyserar (laddningsskärm)
3. Redigera (rubrik, beskrivning, allvarlighetsgrad, kategori -- manuella fält)
4. Bekräftelse (success-skärm)

## Nytt flöde: 3 steg

```text
STEG 1: Ta bild (kamera/galleri)
STEG 2: Granska och skicka (AI-ifyllt, en knapp)
STEG 3: Klart!
```

### Steg 1: Ta bild
- Oförändrat -- kameraknapp och galleriknapp

### Steg 2: Granska och skicka (slår ihop "analyzing" + "edit")
- Medan AI arbetar visas laddningsindikator OVANPÅ bilden (inte som en separat skärm)
- När AI är klar visas resultatet direkt:
  - Bilden som thumbnail
  - AI-ifylld rubrik och beskrivning som redigerbar text (inte separata fält med labels -- bara texten direkt)
  - Allvarlighetsgrad och kategori visas som klickbara chips (inte dropdowns) -- förifyllda av AI
  - En stor "Rapportera"-knapp längst ner
- Användaren behöver normalt bara trycka "Rapportera" direkt utan att ändra något

### Steg 3: Klart
- Kort bekräftelse med knapp för "Ta ny bild"

## Tekniska ändringar

### CameraView.tsx
- Ta bort steget "analyzing" som separat vy -- slå ihop med "edit"
- Ändra step-typen från `"capture" | "analyzing" | "edit" | "success"` till `"capture" | "review" | "success"`
- I "review"-steget:
  - Visa laddningsoverlay på bilden medan AI analyserar
  - När klart: visa kompakt kort med bild, rubrik, beskrivning, severity/category som chips
  - Severity och category blir horisontella chip-knappar istället för Select-dropdowns
  - Rubrik och beskrivning renderas som inline-redigerbara fält (input utan synlig ram, ser ut som text)
- Publicera-knappen aktiveras först när AI-analysen är klar
- Inga andra filer påverkas

