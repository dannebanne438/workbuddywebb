
# Skapa "Om Oss"-sektion för landningssidan

## Sammanfattning
Skapar en ny sektion som berättar om WorkBuddy-teamet på ett relaterbart sätt — utan att nämna specifika namn. Fokus ligger på att teamet har egen erfarenhet från branscher som säkerhet, event och bemanning, och därför förstår problemen på riktigt.

## Design & Ton
- Lugn och professionell, i linje med övriga sektioner
- Personligt men utan att vara "säljigt"
- Fokus på äkta upplevelser: frustration över papperslistor, ständiga frågor, förlorad information
- Budskap: "Vi byggde WorkBuddy för att vi själva behövde det"

## Innehåll

### Rubrik
**"Byggt av människor som förstår"**

### Undertext
"WorkBuddy skapades inte på ett kontor långt från verkligheten — utan av ett team som själva har stått i receptionen, sprungit ronder och koordinerat event."

### Tre berättelsepunkter

1. **Säkerhetsbranschen** (Shield-ikon)
   - "Vi har själva svarat på samma frågor varje kväll: 'Vad gör jag om larmet går?' 'Vem ringer jag vid en incident?'"

2. **Event & bemanning** (Calendar-ikon)
   - "Vi har upplevt kaoset när schemat ändras i sista minuten och ingen vet vem som faktiskt jobbar."

3. **Vardagen på golvet** (Users-ikon)
   - "Vi har sett hur viktig info försvinner i Messenger-trådar, pärmar som ingen hittar, och chefer som aldrig får vara ifred."

### Avslutande text
"Därför byggde vi WorkBuddy — en digital kollega som alltid finns där, alltid vet svaret, och aldrig tar semester."

---

## Tekniska ändringar

### 1. Ny fil: `src/components/landing/AboutSection.tsx`
- Skapar en ny React-komponent med samma struktur som TrustSection
- Använder `py-24 lg:py-32` och `bg-card` för att alternera bakgrund
- Responsiv grid med tre kort för berättelsepunkterna
- Lucide-ikoner: Shield, Calendar, Users
- Avslutande citat centrerat under korten

### 2. Uppdatering: `src/pages/Index.tsx`
- Importerar `AboutSection`
- Placerar komponenten mellan `TrustSection` och `CTASection`

---

## Visuell struktur

```text
┌─────────────────────────────────────────────────────────┐
│  "Byggt av människor som förstår"                       │
│  Undertitel med teamets bakgrund                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐   ┌─────────┐   ┌─────────┐               │
│  │ Shield  │   │Calendar │   │  Users  │               │
│  │ Säkerhet│   │ Event & │   │ Vardagen│               │
│  │         │   │bemanning│   │på golvet│               │
│  └─────────┘   └─────────┘   └─────────┘               │
├─────────────────────────────────────────────────────────┤
│  "Därför byggde vi WorkBuddy..."                        │
│  (avslutande citat)                                     │
└─────────────────────────────────────────────────────────┘
```
