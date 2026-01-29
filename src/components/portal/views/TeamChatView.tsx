import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare, Users } from "lucide-react";
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

export function TeamChatView() {
  const { user, profile, workplace } = useAuth();
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile?.workplace_id) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("team_messages")
        .select("*")
        .eq("workplace_id", profile.workplace_id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
      setIsLoading(false);
    };

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel("team-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "team_messages",
          filter: `workplace_id=eq.${profile.workplace_id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as TeamMessage]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "team_messages",
          filter: `workplace_id=eq.${profile.workplace_id}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.workplace_id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !profile?.workplace_id) return;

    setIsSending(true);
    const { error } = await supabase.from("team_messages").insert({
      workplace_id: profile.workplace_id,
      sender_id: user.id,
      sender_name: profile.full_name || profile.email,
      content: newMessage.trim(),
    });

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
    }
    setIsSending(false);
  };

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return `Igår ${format(date, "HH:mm")}`;
    }
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

  const groupMessagesByDate = (msgs: TeamMessage[]) => {
    const groups: { date: string; messages: TeamMessage[] }[] = [];
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

  if (!profile?.workplace_id) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Ingen arbetsplats tilldelad</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b p-4 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Teamchatt</h1>
          <p className="text-sm text-muted-foreground">
            {workplace?.name || "Arbetsplats"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
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
                        className={`flex gap-3 ${
                          isOwnMessage ? "flex-row-reverse" : ""
                        }`}
                      >
                        {!isOwnMessage && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(message.sender_name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] ${
                            isOwnMessage ? "items-end" : "items-start"
                          }`}
                        >
                          {!isOwnMessage && (
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
            placeholder="Skriv ett meddelande..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
