import { usePresentation } from "@/contexts/PresentationContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

export function PresentationOverlay() {
  const {
    isPresentation,
    isByggPresentation,
    currentStep,
    currentStepData,
    totalSteps,
    isPlaying,
    next,
    prev,
    pause,
    resume,
  } = usePresentation();

  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [visibleBullets, setVisibleBullets] = useState<number>(0);

  // Animate in on step change
  useEffect(() => {
    setIsVisible(false);
    setVisibleBullets(0);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Stagger bullets for bygg presentation
  useEffect(() => {
    if (!isByggPresentation || !currentStepData.bullets?.length) return;
    setVisibleBullets(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    currentStepData.bullets.forEach((_, i) => {
      const t = setTimeout(() => setVisibleBullets(i + 1), 600 + i * 500);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [currentStep, isByggPresentation, currentStepData.bullets]);

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
  const stepData = currentStepData as { icon?: string; example?: string; bullets?: string[]; title: string; description: string };
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const hasBullets = stepData.bullets && stepData.bullets.length > 0;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Spotlight overlay */}
      {spotlightRect && (
        <svg className="absolute inset-0 w-full h-full transition-all duration-700" xmlns="http://www.w3.org/2000/svg">
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
                className="transition-all duration-700"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.55)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      )}

      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/30 pointer-events-none">
        <div
          className="h-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Bottom panel */}
      <div className={`absolute bottom-0 left-0 right-0 pointer-events-auto transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="mx-auto max-w-2xl p-4 pb-6">
          <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-6">
            {/* Step counter */}
            <div className="flex items-center gap-2 mb-3">
              {stepData.icon && (
                <span className="text-xl">{stepData.icon}</span>
              )}
              <span className="text-xs text-muted-foreground font-medium">
                {isByggPresentation ? `${currentStep} / ${totalSteps - 1}` : `Steg ${currentStep + 1} av ${totalSteps}`}
              </span>
            </div>

            {/* Title */}
            <h2 className={`font-semibold text-foreground mb-2 ${isByggPresentation ? 'text-xl' : 'text-lg'}`}>
              {stepData.title}
            </h2>

            {/* Bullets (bygg) or Description (standard) */}
            {hasBullets ? (
              <ul className="space-y-1.5 mb-4">
                {stepData.bullets!.map((bullet, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-sm text-foreground/90 transition-all duration-500 ${
                      i < visibleBullets
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 -translate-x-3'
                    }`}
                  >
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                {stepData.description && (
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {stepData.description}
                  </p>
                )}
                {stepData.example && (
                  <div className="bg-primary/5 border border-primary/15 rounded-lg px-4 py-3 mb-4">
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {stepData.example}
                    </p>
                  </div>
                )}
              </>
            )}

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
