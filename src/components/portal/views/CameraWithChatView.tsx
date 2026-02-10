import { useState } from "react";
import { CameraView } from "./CameraView";
import { ChatView } from "./ChatView";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function CameraWithChatView() {
  const [chatOpen, setChatOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="h-full relative">
        <CameraView />
        {/* Floating chat button */}
        <Button
          variant="hero"
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setChatOpen(true)}
        >
          <Sparkles className="h-6 w-6" />
        </Button>
        <Sheet open={chatOpen} onOpenChange={setChatOpen}>
          <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-2xl">
            <ChatView />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Camera - main area */}
      <div className={`flex-1 transition-all duration-300 ${chatOpen ? "" : ""}`}>
        <CameraView />
      </div>

      {/* Chat toggle button when closed */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="flex flex-col items-center justify-center gap-2 w-12 bg-card border-l border-border hover:bg-secondary transition-colors"
          title="Öppna AI-chatt"
        >
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-xs text-muted-foreground [writing-mode:vertical-lr] rotate-180">
            WorkBuddy
          </span>
        </button>
      )}

      {/* Chat sidebar when open */}
      {chatOpen && (
        <div className="w-[400px] border-l border-border flex flex-col relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-10"
            onClick={() => setChatOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <ChatView />
        </div>
      )}
    </div>
  );
}
