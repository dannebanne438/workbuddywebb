import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, Users, Hash } from "lucide-react";
import { toast } from "sonner";

interface Colleague {
  id: string;
  full_name: string | null;
  email: string;
}

interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface SendChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist: {
    id: string;
    title: string;
    items: ChecklistItem[];
  } | null;
}

export function SendChecklistDialog({
  open,
  onOpenChange,
  checklist,
}: SendChecklistDialogProps) {
  const { user, profile } = useAuth();
  const { activeWorkplace } = useWorkplace();
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !activeWorkplace?.id || !user) return;

    const fetchColleagues = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("workplace_id", activeWorkplace.id)
        .neq("id", user.id);

      if (!error && data) {
        setColleagues(data);
      }
      setLoading(false);
    };

    fetchColleagues();
  }, [open, activeWorkplace?.id, user]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatChecklistMessage = () => {
    if (!checklist) return "";
    // Send a special format that embeds the checklist ID for interactive rendering
    return `📋 Delad checklista: "${checklist.title}"\n[checklist:${checklist.id}]`;
  };

  const handleSendToGroup = async () => {
    if (!activeWorkplace?.id || !user || !checklist) return;

    setSending("group");
    try {
      const { error } = await supabase.from("team_messages").insert({
        workplace_id: activeWorkplace.id,
        sender_id: user.id,
        sender_name: profile?.full_name || profile?.email || "Användare",
        content: formatChecklistMessage(),
      });

      if (error) throw error;

      toast.success("Checklistan skickades till gruppchatten");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending checklist to group:", error);
      toast.error("Kunde inte skicka checklistan");
    } finally {
      setSending(null);
    }
  };

  const handleSendToPerson = async (colleague: Colleague) => {
    if (!activeWorkplace?.id || !user || !checklist) return;

    setSending(colleague.id);
    try {
      const { error } = await supabase.from("direct_messages").insert({
        workplace_id: activeWorkplace.id,
        sender_id: user.id,
        sender_name: profile?.full_name || profile?.email || "Användare",
        recipient_id: colleague.id,
        recipient_name: colleague.full_name || colleague.email,
        content: formatChecklistMessage(),
      });

      if (error) throw error;

      toast.success(`Checklistan skickades till ${colleague.full_name || colleague.email}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending checklist to person:", error);
      toast.error("Kunde inte skicka checklistan");
    } finally {
      setSending(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skicka checklista</DialogTitle>
          <DialogDescription>
            Skicka "{checklist?.title}" till en kollega eller hela teamet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Send to group */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3"
            onClick={handleSendToGroup}
            disabled={sending !== null}
          >
            {sending === "group" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Hash className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="text-left">
              <p className="font-medium">Skicka till gruppchatten</p>
              <p className="text-xs text-muted-foreground">Alla i teamet ser checklistan</p>
            </div>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Eller skicka till person
              </span>
            </div>
          </div>

          {/* Colleagues list */}
          <div className="max-h-[300px] overflow-y-auto overscroll-contain rounded-md border border-border bg-card/50">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : colleagues.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Inga kollegor hittades</p>
              </div>
            ) : (
              <div className="p-1 space-y-1">
                {colleagues.map((colleague) => {
                  const name = colleague.full_name || colleague.email;
                  const isSending = sending === colleague.id;

                  return (
                    <Button
                      key={colleague.id}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-3"
                      onClick={() => handleSendToPerson(colleague)}
                      disabled={sending !== null}
                    >
                      {isSending ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium truncate">{name}</p>
                        {colleague.full_name && (
                          <p className="text-xs text-muted-foreground truncate">{colleague.email}</p>
                        )}
                      </div>
                      <Send className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
