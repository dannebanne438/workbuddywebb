import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Calendar,
  ClipboardList,
  Bell,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  userName?: string;
}

const steps = [
  {
    icon: MessageSquare,
    title: "Fråga WorkBuddy",
    description:
      "Din AI-assistent som kan svara på frågor om rutiner, regler och din arbetsplats. Skriv fritt så hjälper den dig!",
  },
  {
    icon: Calendar,
    title: "Ditt schema",
    description:
      "Se dina kommande pass och vilka kollegor som jobbar. Allt samlat på ett ställe.",
  },
  {
    icon: ClipboardList,
    title: "Checklistor & Rutiner",
    description:
      "Hitta steg-för-steg-instruktioner för alla vanliga uppgifter. Aldrig mer gissa hur något ska göras.",
  },
  {
    icon: Bell,
    title: "Nyheter & Uppdateringar",
    description:
      "Håll dig uppdaterad med viktiga meddelanden från din arbetsplats.",
  },
];

export const OnboardingModal = ({
  open,
  onComplete,
  userName,
}: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {currentStep === 0
              ? `Välkommen${userName ? `, ${userName.split(" ")[0]}` : ""}! 👋`
              : steps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentStep === 0
              ? "Låt oss visa dig runt i WorkBuddy"
              : `Steg ${currentStep + 1} av ${steps.length}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="h-10 w-10 text-primary" />
            </div>
          </div>

          <div className="text-center space-y-3 px-4">
            <h3 className="text-lg font-semibold">
              {steps[currentStep].title}
            </h3>
            <p className="text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-6 bg-primary"
                    : index < currentStep
                    ? "w-2 bg-primary/60"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={handleSkip}>
            Hoppa över
          </Button>
          <Button variant="hero" className="flex-1" onClick={handleNext}>
            {currentStep === steps.length - 1 ? (
              <>
                Kom igång
                <CheckCircle2 className="h-4 w-4" />
              </>
            ) : (
              <>
                Nästa
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
