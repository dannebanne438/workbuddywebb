import { usePresentation } from "@/contexts/PresentationContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { useEffect, useState } from "react";

export function PresentationOverlay() {
  const {
    isPresentation,
    currentStep,
    currentStepData,
    totalSteps,
    isPlaying,
    next,
    prev,
    pause,
    resume,
    exit,
  } = usePresentation();

  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  // Find and track spotlight target
  useEffect(() => {
    if (!isPresentation || !currentStepData.spotlightSelector) {
      setSpotlightRect(null);
      return;
    }

    const findElement = () => {
      const el = document.querySelector(currentStepData.spotlightSelector!);
      if (el) {
        setSpotlightRect(el.getBoundingClientRect());
      } else {
        setSpotlightRect(null);
      }
    };

    // Delay to let view render
    const timer = setTimeout(findElement, 500);
    const interval = setInterval(findElement, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isPresentation, currentStep, currentStepData.spotlightSelector]);

  if (!isPresentation) return null;

  // Don't show overlay for intro and cta (they have their own full-screen views)
  if (currentStepData.view === "intro" || currentStepData.view === "cta") return null;

  const padding = 12;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Spotlight overlay */}
      {spotlightRect && (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={spotlightRect.x - padding}
                y={spotlightRect.y - padding}
                width={spotlightRect.width + padding * 2}
                height={spotlightRect.height + padding * 2}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.5)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      )}

      {/* Bottom panel */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
        <div className="mx-auto max-w-2xl p-4 pb-6">
          <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-6">
            {/* Step counter */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">
                {currentStep + 1} / {totalSteps}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={exit}
                className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Avsluta
              </Button>
            </div>

            {/* Text */}
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {currentStepData.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {currentStepData.description}
            </p>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={prev}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={isPlaying ? pause : resume}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={next}
                  disabled={currentStep === totalSteps - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Step dots */}
              <div className="flex gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-6 bg-primary"
                        : i < currentStep
                          ? "w-1.5 bg-primary/40"
                          : "w-1.5 bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
