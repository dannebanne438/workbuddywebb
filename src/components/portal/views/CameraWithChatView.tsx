import { useState } from "react";
import { CameraView } from "./CameraView";
import { ChatView } from "./ChatView";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function CameraWithChatView() {
  const [cameraOpen, setCameraOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="h-full relative">
        <ChatView />
        {/* Floating camera button */}
        <Button
          variant="hero"
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setCameraOpen(true)}
        >
          <Camera className="h-6 w-6" />
        </Button>
        <Sheet open={cameraOpen} onOpenChange={setCameraOpen}>
          <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-2xl">
            <CameraView />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Chat - main area */}
      <div className="flex-1">
        <ChatView />
      </div>

      {/* Camera toggle button when closed */}
      {!cameraOpen && (
        <button
          onClick={() => setCameraOpen(true)}
          className="flex flex-col items-center justify-center gap-2 w-12 bg-card border-l border-border hover:bg-secondary transition-colors"
          title="Öppna fotodokumentation"
        >
          <Camera className="h-5 w-5 text-primary" />
          <span className="text-xs text-muted-foreground [writing-mode:vertical-lr] rotate-180">
            Kamera
          </span>
        </button>
      )}

      {/* Camera sidebar when open */}
      {cameraOpen && (
        <div className="w-[420px] border-l border-border flex flex-col relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-10"
            onClick={() => setCameraOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CameraView />
        </div>
      )}
    </div>
  );
}
