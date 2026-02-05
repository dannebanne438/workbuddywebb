import { useState, useEffect } from "react";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Pin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { AddAnnouncementDialog } from "../announcements/AddAnnouncementDialog";
import { DeleteAnnouncementDialog } from "../announcements/DeleteAnnouncementDialog";

interface Announcement {
  id: string;
  title: string;
  content: string | null;
  is_pinned: boolean;
  created_at: string;
}

export function AnnouncementsView() {
  const { activeWorkplace } = useWorkplace();
  const { isWorkplaceAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    if (activeWorkplace?.id) {
      fetchAnnouncements();
    }
  }, [activeWorkplace?.id]);

  const fetchAnnouncements = async () => {
    if (!activeWorkplace?.id) return;

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("workplace_id", activeWorkplace.id)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) {
      setAnnouncements(data);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDeleteClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Nyheter</h1>
              <p className="text-sm text-muted-foreground">Meddelanden och uppdateringar</p>
            </div>
          </div>
          
          {isWorkplaceAdmin && (
            <Button onClick={() => setAddDialogOpen(true)} size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Ny nyhet</span>
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-1">Inga nyheter</h2>
            <p className="text-muted-foreground">Det finns inga nyheter att visa.</p>
            {isWorkplaceAdmin && (
              <Button onClick={() => setAddDialogOpen(true)} className="mt-4 gap-1">
                <Plus className="h-4 w-4" />
                Skapa första nyheten
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`bg-card border rounded-xl p-5 ${
                  announcement.is_pinned ? "border-accent" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-medium text-foreground">{announcement.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    {announcement.is_pinned && <Pin className="h-4 w-4 text-accent" />}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(announcement.created_at)}
                    </span>
                    {isWorkplaceAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteClick(announcement)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {announcement.content && (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{announcement.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AddAnnouncementDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={fetchAnnouncements}
      />

      <DeleteAnnouncementDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        announcement={selectedAnnouncement}
        onSuccess={fetchAnnouncements}
      />
    </div>
  );
}
