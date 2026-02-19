import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { PRESENTATION_STEPS, type PresentationStep } from "@/components/presentation/presentationSteps";

interface PresentationContextType {
  isPresentation: boolean;
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

const PRESENTATION_KEY = "wb_presentation_mode";

export function PresentationProvider({ children }: { children: React.ReactNode }) {
  const [isPresentation, setIsPresentation] = useState(() => {
    return localStorage.getItem(PRESENTATION_KEY) === "true";
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStepData = PRESENTATION_STEPS[currentStep] || PRESENTATION_STEPS[0];

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const next = useCallback(() => {
    clearTimer();
    setCurrentStep((prev) => Math.min(prev + 1, PRESENTATION_STEPS.length - 1));
  }, [clearTimer]);

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
    localStorage.removeItem(PRESENTATION_KEY);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [clearTimer]);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(true);
    setIsPresentation(true);
    localStorage.setItem(PRESENTATION_KEY, "true");
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (!isPresentation || !isPlaying) return;
    const step = PRESENTATION_STEPS[currentStep];
    if (!step || step.duration === 0) return; // CTA stays

    clearTimer();
    timerRef.current = setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev < PRESENTATION_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, step.duration);

    return clearTimer;
  }, [isPresentation, isPlaying, currentStep, clearTimer]);

  return (
    <PresentationContext.Provider
      value={{
        isPresentation,
        currentStep,
        currentStepData,
        totalSteps: PRESENTATION_STEPS.length,
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
