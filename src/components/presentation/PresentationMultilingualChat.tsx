import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  lang: string;
  flag: string;
}

const MULTILINGUAL_CHAT: ChatMessage[] = [
  { id: 1, role: "user", content: "Vad gäller för tillfälliga elinstallationer på bygget?", lang: "Svenska", flag: "🇸🇪" },
  { id: 2, role: "assistant", content: "Tillfälliga elinstallationer ska utföras av behörig elektriker och kontrolleras regelbundet enligt SS 436 40 00. Jordfelsbrytare (30 mA) krävs alltid.", lang: "Svenska", flag: "🇸🇪" },
  { id: 3, role: "user", content: "What PPE is required for concrete work?", lang: "English", flag: "🇬🇧" },
  { id: 4, role: "assistant", content: "For concrete work you need: safety boots, chemical-resistant gloves, eye protection, and long sleeves to prevent skin contact. A dust mask (FFP2) is required when cutting.", lang: "English", flag: "🇬🇧" },
  { id: 5, role: "user", content: "Jakie zasady BHP obowiązują przy pracach na wysokości?", lang: "Polski", flag: "🇵🇱" },
  { id: 6, role: "assistant", content: "Przy pracach powyżej 2m wymagana jest uprząż bezpieczeństwa, punkt kotwiczenia i przeszkolenie z ochrony przed upadkiem. Rusztowania muszą być codziennie kontrolowane.", lang: "Polski", flag: "🇵🇱" },
  { id: 7, role: "user", content: "ما هي قواعد السلامة للعمل في الحفريات؟", lang: "العربية", flag: "🇸🇦" },
  { id: 8, role: "assistant", content: "يجب تأمين الحفريات التي يزيد عمقها عن 1.5 متر بدعامات جانبية. يُمنع العمل بدون سلالم وصول ونقاط إنقاذ محددة.", lang: "العربية", flag: "🇸🇦" },
];

export function PresentationMultilingualChat() {
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [typingLang, setTypingLang] = useState<string | null>(null);

  useEffect(() => {
    setVisibleMessages([]);
    setTypingLang(null);

    const timers: ReturnType<typeof setTimeout>[] = [];

    MULTILINGUAL_CHAT.forEach((msg, i) => {
      // Show typing indicator before each message
      const typingDelay = i * 2200;
      const msgDelay = typingDelay + 800;

      const t1 = setTimeout(() => {
        setTypingLang(msg.role === "assistant" ? `${msg.flag} ${msg.lang}` : null);
      }, typingDelay);

      const t2 = setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg]);
        setTypingLang(null);
      }, msgDelay);

      timers.push(t1, t2);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Digital platschef</h1>
            <p className="text-sm text-muted-foreground">Flerspråkig byggassistent</p>
          </div>
          <div className="ml-auto flex gap-1.5">
            {["🇸🇪", "🇬🇧", "🇵🇱", "🇸🇦"].map(flag => (
              <span key={flag} className="text-lg">{flag}</span>
            ))}
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {visibleMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
              dir={msg.lang === "العربية" ? "rtl" : "ltr"}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs opacity-70">{msg.flag} {msg.lang}</span>
              </div>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typingLang && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{typingLang}</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
