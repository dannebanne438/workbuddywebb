import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    contactPerson: "",
    email: "",
    phone: "",
    workplaceType: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to database
      const { error } = await supabase.from("contact_leads").insert({
        company: formData.company,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone || null,
        workplace_type: formData.workplaceType || null,
        message: formData.message || null,
      });

      if (error) throw error;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke("send-contact-notification", {
        body: {
          company: formData.company,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone || null,
          workplaceType: formData.workplaceType || null,
          message: formData.message || null,
        },
      });

      if (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the submission if email fails - data is already saved
      }

      setIsSubmitted(true);
      toast({
        title: "Tack för ditt intresse!",
        description: "Vi återkommer inom kort.",
      });

      // Reset form after showing success
      setTimeout(() => {
        setFormData({
          company: "",
          contactPerson: "",
          email: "",
          phone: "",
          workplaceType: "",
          message: "",
        });
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Något gick fel",
        description: "Försök igen senare.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Vill ni se hur WorkBuddy fungerar för er arbetsplats?
            </h2>
            <p className="text-lg text-muted-foreground">
              Boka en kostnadsfri genomgång så visar vi hur det fungerar.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-secondary rounded-2xl p-12 text-center animate-scale-in">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-6">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Tack för ditt meddelande!
              </h3>
              <p className="text-muted-foreground">
                Vi återkommer till dig så snart vi kan.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">Företag *</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Företagsnamn"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Kontaktperson *</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Ditt namn"
                    required
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">E-post *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="namn@foretag.se"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="070-000 00 00"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workplaceType">Typ av arbetsplats</Label>
                <Input
                  id="workplaceType"
                  name="workplaceType"
                  value={formData.workplaceType}
                  onChange={handleChange}
                  placeholder="T.ex. restaurang, lager, butik, kontor..."
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Meddelande</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Berätta gärna mer om er arbetsplats och vad ni söker..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Skickar...
                  </>
                ) : (
                  <>
                    Boka genomgång
                    <Send className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
