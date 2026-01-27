import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, Clock, CheckCircle, XCircle } from "lucide-react";

export function RequestAdminAccess() {
  const { user, workplace, isWorkplaceAdmin } = useAuth();
  const { toast } = useToast();
  const [requestStatus, setRequestStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id && workplace?.id) {
      checkExistingRequest();
    }
  }, [user?.id, workplace?.id]);

  const checkExistingRequest = async () => {
    if (!user?.id || !workplace?.id) return;

    const { data, error } = await supabase
      .from("admin_requests")
      .select("status")
      .eq("user_id", user.id)
      .eq("workplace_id", workplace.id)
      .maybeSingle();

    if (data) {
      setRequestStatus(data.status as "pending" | "approved" | "rejected");
    }
    setLoading(false);
  };

  const handleRequest = async () => {
    if (!user?.id || !workplace?.id) return;

    setSubmitting(true);

    const { error } = await supabase.from("admin_requests").insert({
      user_id: user.id,
      workplace_id: workplace.id,
      status: "pending",
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Kunde inte skicka förfrågan",
        description: error.message,
      });
    } else {
      setRequestStatus("pending");
      toast({
        title: "Förfrågan skickad!",
        description: "En Super Admin kommer granska din förfrågan.",
      });
    }

    setSubmitting(false);
  };

  // Don't show if already admin
  if (isWorkplaceAdmin) {
    return null;
  }

  if (loading) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-foreground mb-1">Begär adminbehörighet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Som arbetsplatsadmin kan du hantera schema, checklistor, personal och inställningar.
          </p>

          {requestStatus === "none" && (
            <Button onClick={handleRequest} disabled={submitting} size="sm">
              {submitting ? (
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                "Begär adminbehörighet"
              )}
            </Button>
          )}

          {requestStatus === "pending" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Din förfrågan väntar på godkännande
            </div>
          )}

          {requestStatus === "approved" && (
            <div className="flex items-center gap-2 text-sm text-accent">
              <CheckCircle className="h-4 w-4" />
              Godkänd – logga ut och in igen för att aktivera
            </div>
          )}

          {requestStatus === "rejected" && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              Din förfrågan avvisades
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
