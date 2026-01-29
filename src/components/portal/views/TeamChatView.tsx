import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare, Users, Hash } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { sv } from "date-fns/locale";

interface TeamMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  workplace_id: string;
}

interface DirectMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
  workplace_id: string;
}

interface Colleague {
  id: string;
  full_name: string | null;
  email: string;
  unreadCount?: number;
}

type ChatMode = "group" | { recipientId: string; recipientName: string };

export function TeamChatView() {
  const { user, profile } = useAuth();
  const { activeWorkplace } = useWorkplace();
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [chatMode, setChatMode] = useState<ChatMode>("group");
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch colleagues
  useEffect(() => {
    if (!activeWorkplace?.id || !user) return;

    const fetchColleagues = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("workplace_id", activeWorkplace.id)
        .neq("id", user.id);

      if (!error && data) {
        setColleagues(data);
      }
    };

    fetchColleagues();
  }, [activeWorkplace?.id, user]);

  // Fetch unread counts
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCounts = async () => {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("sender_id")
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      if (!error && data) {
        const counts: Record<string, number> = {};
        data.forEach((msg) => {
          counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
        });
        setUnreadCounts(counts);
      }
    };

    fetchUnreadCounts();
  }, [user, directMessages]);

  // Fetch team messages
  useEffect(() => {
    if (!activeWorkplace?.id || chatMode !== "group") return;

    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("team_messages")
        .select("*")
        .eq("workplace_id", activeWorkplace.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (!error) {
        setTeamMessages(data || []);
      }
      setIsLoading(false);
    };

    fetchMessages();

    const channel = supabase
      .channel("team-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "team_messages",
          filter: `workplace_id=eq.${activeWorkplace.id}`,
        },
        (payload) => {
          setTeamMessages((prev) => [...prev, payload.new as TeamMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeWorkplace?.id, chatMode]);

  // Fetch direct messages
  useEffect(() => {
    if (!user || chatMode === "group") return;
    const recipientId = chatMode.recipientId;

    const fetchDMs = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .order("created_at", { ascending: true })
        .limit(100);

      if (!error) {
        setDirectMessages(data || []);
        
        // Mark as read
        await supabase
          .from("direct_messages")
          .update({ is_read: true })
          .eq("recipient_id", user.id)
          .eq("sender_id", recipientId)
          .eq("is_read", false);
      }
      setIsLoading(false);
    };

    fetchDMs();

    const channel = supabase
      .channel(`dm-${recipientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        (payload) => {
          const msg = payload.new as DirectMessage;
          if (
            (msg.sender_id === user.id && msg.recipient_id === recipientId) ||
            (msg.sender_id === recipientId && msg.recipient_id === user.id)
          ) {
            setDirectMessages((prev) => [...prev, msg]);
            
            // Mark as read if we're the recipient
            if (msg.recipient_id === user.id) {
              supabase
                .from("direct_messages")
                .update({ is_read: true })
                .eq("id", msg.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, chatMode]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [teamMessages, directMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeWorkplace?.id) return;

    setIsSending(true);

    if (chatMode === "group") {
      await supabase.from("team_messages").insert({
        workplace_id: activeWorkplace.id,
        sender_id: user.id,
        sender_name: profile.full_name || profile.email,
        content: newMessage.trim(),
      });
    } else {
      await supabase.from("direct_messages").insert({
        workplace_id: activeWorkplace.id,
        sender_id: user.id,
        sender_name: profile.full_name || profile.email,
        recipient_id: chatMode.recipientId,
        recipient_name: chatMode.recipientName,
        content: newMessage.trim(),
      });
    }

    setNewMessage("");
    setIsSending(false);
  };

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return `Igår ${format(date, "HH:mm")}`;
    return format(date, "d MMM HH:mm", { locale: sv });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const groupMessagesByDate = (msgs: (TeamMessage | DirectMessage)[]) => {
    const groups: { date: string; messages: (TeamMessage | DirectMessage)[] }[] = [];
    let currentDate = "";

    msgs.forEach((msg) => {
      const msgDate = new Date(msg.created_at).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const formatGroupDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Idag";
    if (isYesterday(date)) return "Igår";
    return format(date, "EEEE d MMMM", { locale: sv });
  };

  const messages = chatMode === "group" ? teamMessages : directMessages;

  if (!activeWorkplace?.id) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Ingen arbetsplats tilldelad</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar - Conversations */}
      <div className="w-64 border-r flex flex-col bg-card">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Konversationer
          </h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* Group chat */}
            <button
              onClick={() => setChatMode("group")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                chatMode === "group"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${chatMode === "group" ? "bg-primary-foreground/20" : "bg-primary/10"}`}>
                <Hash className={`h-4 w-4 ${chatMode === "group" ? "text-primary-foreground" : "text-primary"}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Alla</p>
                <p className={`text-xs ${chatMode === "group" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  Gruppchatt
                </p>
              </div>
            </button>

            <div className="py-2">
              <div className="h-px bg-border" />
            </div>

            <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase">
              Direktmeddelanden
            </p>

            {/* Colleagues */}
            {colleagues.map((colleague) => {
              const isActive =
                chatMode !== "group" && chatMode.recipientId === colleague.id;
              const unread = unreadCounts[colleague.id] || 0;
              const name = colleague.full_name || colleague.email;

              return (
                <button
                  key={colleague.id}
                  onClick={() =>
                    setChatMode({ recipientId: colleague.id, recipientName: name })
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`text-xs ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                  </div>
                  {unread > 0 && !isActive && (
                    <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}

            {colleagues.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Inga kollegor hittades
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center gap-3">
          {chatMode === "group" ? (
            <>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Gruppchatt</h1>
                <p className="text-sm text-muted-foreground">
                  {activeWorkplace?.name || "Arbetsplats"}
                </p>
              </div>
            </>
          ) : (
            <>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(chatMode.recipientName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold">{chatMode.recipientName}</h1>
                <p className="text-sm text-muted-foreground">Direktmeddelande</p>
              </div>
            </>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Laddar meddelanden...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Inga meddelanden ännu</p>
              <p className="text-sm text-muted-foreground/70">
                Skriv ett meddelande för att starta konversationen
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupMessagesByDate(messages).map((group) => (
                <div key={group.date}>
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatGroupDate(group.date)}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="space-y-3">
                    {group.messages.map((message) => {
                      const isOwnMessage = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                        >
                          {!isOwnMessage && (
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(message.sender_name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                            {!isOwnMessage && chatMode === "group" && (
                              <p className="text-xs text-muted-foreground mb-1 ml-1">
                                {message.sender_name}
                              </p>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted rounded-bl-md"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            </div>
                            <p
                              className={`text-xs text-muted-foreground mt-1 ${
                                isOwnMessage ? "text-right mr-1" : "ml-1"
                              }`}
                            >
                              {formatMessageDate(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                chatMode === "group"
                  ? "Skriv till alla..."
                  : `Skriv till ${chatMode.recipientName}...`
              }
              disabled={isSending}
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim() || isSending} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
