
# Röstinmatning för WorkBuddy

## Sammanfattning
Lägger till en mikrofonknapp i ChatView som låter användare prata istället för att skriva. Talet konverteras till text med webbläsarens inbyggda Web Speech API (gratis, ingen API-nyckel behövs).

---

## Funktionalitet

### Användarupplevelse
1. Mikrofonknapp visas bredvid skicka-knappen
2. Användaren trycker på mikrofonen - den blir röd och "lyssnar"
3. Användaren pratar på svenska
4. Talet konverteras till text och visas i inputfältet
5. Användaren kan redigera texten eller skicka direkt
6. Alternativt: "Tryck och håll" för att prata, släpp för att skicka

### Visuell feedback
- Mikrofonikon (grå) = inaktiv
- Mikrofonikon (röd + pulsande animation) = lyssnar
- Tillfällig text "Lyssnar..." under inspelning

---

## Teknisk Implementation

### Ny hook: `useSpeechRecognition`
Skapar en återanvändbar hook som hanterar:
- Initiering av `webkitSpeechRecognition` / `SpeechRecognition`
- Start/stopp av inspelning
- Språkinställning (svenska: `sv-SE`)
- Felhantering (mikrofon nekad, ingen support)
- Callback med transkriberad text

```text
src/hooks/useSpeechRecognition.ts
├── isListening: boolean
├── isSupported: boolean
├── startListening(): void
├── stopListening(): void
├── transcript: string
└── error: string | null
```

### Uppdatering av ChatView
- Importera `useSpeechRecognition` hook
- Lägg till mikrofonknapp bredvid skicka-knappen
- Visa visuell feedback när mikrofonen är aktiv
- Populera input-fältet med transkriberad text
- Valfritt: Auto-skicka efter en paus i talet

---

## Webbläsarstöd

| Webbläsare | Stöd |
|------------|------|
| Chrome | Ja |
| Edge | Ja |
| Safari | Ja (iOS 14.5+) |
| Firefox | Nej (visar alternativ text) |

För webbläsare utan stöd visas inte mikrofonknappen, eller en tooltip förklarar att funktionen inte stöds.

---

## Filer som skapas/uppdateras

### Ny fil:
- `src/hooks/useSpeechRecognition.ts` - Hook för taligenkänning

### Uppdaterad fil:
- `src/components/portal/views/ChatView.tsx` - Lägg till mikrofonknapp och integration

---

## Tekniska detaljer

### Web Speech API-konfiguration
```text
- lang: "sv-SE" (svenska)
- continuous: false (stoppar efter en mening)
- interimResults: true (visar text medan användaren pratar)
```

### Felhantering
- `not-allowed`: Användaren nekade mikrofontillgång
- `no-speech`: Inget tal detekterades
- `network`: Nätverksfel (krävs för Chrome)
- Fallback-meddelande för webbläsare utan stöd

### Tillgänglighet
- ARIA-labels för mikrofonknappen
- Visuell och auditiv feedback
- Keyboard-accessible (Enter för att starta/stoppa)
