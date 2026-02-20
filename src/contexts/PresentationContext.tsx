import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { PRESENTATION_STEPS, type PresentationStep } from "@/components/presentation/presentationSteps";
import { BYGG_PRESENTATION_STEPS } from "@/components/presentation/byggPresentationSteps";
import { useWorkplace } from "@/contexts/WorkplaceContext";

interface PresentationContextType {
  isPresentation: boolean;
  isByggPresentation: boolean;
  currentStep: number;
  currentStepData: PresentationStep;
  totalSteps: number;
  isPlaying: boolean;
  next: () => void;
  prev: () => void;
  pause: () => void;
  resume: () => void;
  exit: () => void;
  start: () => void;
}

const PresentationContext = createContext<PresentationContextType | null>(null);

const PRESENTATION_CODES = ["WBPRESENTATION", "BYGGPRESENTATION"];

export function PresentationProvider({ children }: { children: React.ReactNode }) {
  const { activeWorkplace } = useWorkplace();
  const workplaceCode = activeWorkplace?.workplace_code?.toUpperCase() || "";
  const isPresentationWorkplace = PRESENTATION_CODES.includes(workplaceCode);
  const isByggPresentation = workplaceCode === "BYGGPRESENTATION";

  const steps = useMemo(() => isByggPresentation ? BYGG_PRESENTATION_STEPS : PRESENTATION_STEPS, [isByggPresentation]);

  const [isPresentation, setIsPresentation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStepData = steps[currentStep] || steps[0];

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const next = useCallback(() => {
    clearTimer();
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [clearTimer, steps.length]);

  const prev = useCallback(() => {
    clearTimer();
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const exit = useCallback(() => {
    clearTimer();
    setIsPresentation(false);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [clearTimer]);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(true);
    setIsPresentation(true);
  }, []);

  // Auto-start presentation when on a presentation workplace
  useEffect(() => {
    if (isPresentationWorkplace && !isPresentation) {
      start();
    }
  }, [isPresentationWorkplace]);

  // Auto-advance timer
  useEffect(() => {
    if (!isPresentation || !isPlaying) return;
    const step = steps[currentStep];
    if (!step || step.duration === 0) return;

    clearTimer();
    timerRef.current = setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, step.duration);

    return clearTimer;
  }, [isPresentation, isPlaying, currentStep, clearTimer, steps]);

  return (
    <PresentationContext.Provider
      value={{
        isPresentation,
        isByggPresentation,
        currentStep,
        currentStepData,
        totalSteps: steps.length,
        isPlaying,
        next,
        prev,
        pause,
        resume,
        exit,
        start,
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentation() {
  const ctx = useContext(PresentationContext);
  if (!ctx) throw new Error("usePresentation must be used within PresentationProvider");
  return ctx;
}
