import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bot, Save } from "lucide-react";

interface WorkplaceAIPromptEditorProps {
  workplaceId: string;
  initialPrompt: string;
}

export function WorkplaceAIPromptEditor({ workplaceId, initialPrompt }: WorkplaceAIPromptEditorProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPrompt(initialPrompt);
    setHasChanges(false);
  }, [initialPrompt]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await supabase.functions.invoke("manage-workplace", {
        body: {
          action: "update-settings",
          workplace_id: workplaceId,
          settings: { custom_prompt: prompt.trim() },
        },
      });

      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);

      toast({ title: "AI-instruktioner sparade!" });
      setHasChanges(false);
    } catch (err: any) {
      toast({ title: "Fel", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Anpassad AI-prompt</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Skriv instruktioner som WorkBuddy ska följa för denna arbetsplats. 
              T.ex. "Vi är ett gym med fokus på CrossFit. Svara alltid med träningsrelaterade termer. 
              Våra öppettider är 05:00-22:00 vardagar och 08:00-18:00 helger."
            </p>
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setHasChanges(true);
          }}
          placeholder="Skriv arbetsplatsspecifika instruktioner för AI:n här...&#10;&#10;Exempel:&#10;- Vi är ett gym med 3 avdelningar: Gym, CrossFit och Gruppträning&#10;- Receptionen ska alltid vara bemannad 05:00-22:00&#10;- Vid maskinfel, kontakta alltid servicetekniker Jan på 070-123 45 67&#10;- Vi använder Clean & Jerk-terminologi för CrossFit-klasser"
          className="w-full min-h-[200px] rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
          maxLength={5000}
        />
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">{prompt.length}/5000 tecken</span>
          <Button onClick={handleSave} disabled={saving || !hasChanges} size="sm">
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Sparar..." : "Spara instruktioner"}
          </Button>
        </div>
      </div>
    </div>
  );
}
