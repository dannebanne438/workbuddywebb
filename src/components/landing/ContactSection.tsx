import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle } from "lucide-react";
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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("contact_leads").insert({
        company: formData.company,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone || null,
        workplace_type: formData.workplaceType || null,
        message: formData.message || null,
      });

      if (error) throw error;

      await supabase.functions.invoke("send-contact-notification", {
        body: {
          company: formData.company,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone || null,
          workplaceType: formData.workplaceType || null,
          message: formData.message || null,
        },
      }).catch(console.error);

      setIsSubmitted(true);
      toast({ title: "Tack för ditt intresse!", description: "Vi återkommer inom kort." });

      setTimeout(() => {
        setFormData({ company: "", contactPerson: "", email: "", phone: "", workplaceType: "", message: "" });
        setIsSubmitted(false);
      }, 3000);
    } catch {
      toast({ variant: "destructive", title: "Något gick fel", description: "Försök igen senare." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="landing-section bg-muted/30 border-t border-border">
      <div className="landing-container">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-3">
              Boka en demo
            </h2>
            <p className="text-[14px] text-muted-foreground">
              Se hur WorkBuddy förbättrar internkommunikation och personalhantering på er arbetsplats.
            </p>
          </div>

          {isSubmitted ? (
            <div className="text-center py-12">
              <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Tack!</h3>
              <p className="text-sm text-muted-foreground">Vi återkommer till dig så snart vi kan.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company" className="text-[13px]">Företag *</Label>
                  <Input id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Företagsnamn" required className="h-10 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contactPerson" className="text-[13px]">Kontaktperson *</Label>
                  <Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Ditt namn" required className="h-10 text-[13px]" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[13px]">E-post *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="namn@foretag.se" required className="h-10 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[13px]">Telefon</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="070-000 00 00" className="h-10 text-[13px]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="workplaceType" className="text-[13px]">Typ av arbetsplats</Label>
                <Input id="workplaceType" name="workplaceType" value={formData.workplaceType} onChange={handleChange} placeholder="T.ex. restaurang, lager, butik, kontor..." className="h-10 text-[13px]" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-[13px]">Meddelande</Label>
                <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Berätta gärna mer om er arbetsplats..." rows={3} className="resize-none text-[13px]" />
              </div>

              <Button type="submit" className="w-full h-10 rounded-lg text-[13px]" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Boka genomgång
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
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
