import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useWorkBuddyChat } from "@/hooks/useWorkBuddyChat";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Sparkles,
  Trash2,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  BookOpen,
  Bell,
  Trash,
  Pencil,
  Mic,
  MicOff,
  Plus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DemoPrompt {
  id: string;
  prompt_text: string;
  category: string | null;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const actionIcons: Record<string, { icon: typeof Calendar; label: string; color: string }> = {
  create_schedule: { icon: Calendar, label: "Pass schemalagda", color: "text-accent" },
  update_schedule: { icon: Pencil, label: "Pass uppdaterat", color: "text-blue-500" },
  delete_schedule: { icon: Trash, label: "Pass borttaget", color: "text-destructive" },
  create_checklist: { icon: ClipboardList, label: "Checklista skapad", color: "text-accent" },
  update_checklist: { icon: Pencil, label: "Checklista uppdaterad", color: "text-blue-500" },
  delete_checklist: { icon: Trash, label: "Checklista borttagen", color: "text-destructive" },
  create_routine: { icon: BookOpen, label: "Rutin skapad", color: "text-accent" },
  update_routine: { icon: Pencil, label: "Rutin uppdaterad", color: "text-blue-500" },
  delete_routine: { icon: Trash, label: "Rutin borttagen", color: "text-destructive" },
  create_announcement: { icon: Bell, label: "Nyhet publicerad", color: "text-accent" },
  update_announcement: { icon: Pencil, label: "Nyhet uppdaterad", color: "text-blue-500" },
  delete_announcement: { icon: Trash, label: "Nyhet borttagen", color: "text-destructive" },
};

export function ChatView() {
  const { session, user } = useAuth();
  const { activeWorkplace } = useWorkplace();
  const {
    messages, isLoading, error, sendMessage, clearMessages, toolResults,
    conversationId, loadConversation, startNewConversation,
  } = useWorkBuddyChat();
  const {
    isListening, isSupported: isSpeechSupported, transcript, interimTranscript,
    error: speechError, startListening, stopListening, resetTranscript,
  } = useSpeechRecognition();
  const [input, setInput] = useState("");
  const [demoPrompts, setDemoPrompts] = useState<DemoPrompt[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch demo prompts
  useEffect(() => {
    if (activeWorkplace?.id) {
      supabase
        .from("demo_prompts")
        .select("id, prompt_text, category")
        .eq("workplace_id", activeWorkplace.id)
        .order("sort_order")
        .then(({ data }) => { if (data) setDemoPrompts(data); });
    }
  }, [activeWorkplace?.id]);

  // Fetch conversations
  useEffect(() => {
    if (user?.id && activeWorkplace?.id) {
      fetchConversations();
    }
  }, [user?.id, activeWorkplace?.id]);

  const fetchConversations = async () => {
    if (!user?.id || !activeWorkplace?.id) return;
    const { data } = await supabase
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .eq("workplace_id", activeWorkplace.id)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) setConversations(data);
  };

  // Refresh conversation list when a conversation is active and messages change
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      fetchConversations();
    }
  }, [conversationId, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const handleMicClick = () => {
    if (isListening) { stopListening(); } else { resetTranscript(); startListening(); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim(), { session, workplaceId: activeWorkplace?.id });
    setInput("");
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt, { session, workplaceId: activeWorkplace?.id });
  };

  const handleNewChat = () => {
    startNewConversation();
  };

  const handleSelectConversation = (conv: Conversation) => {
    loadConversation(conv.id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("conversations").delete().eq("id", convId);
    if (conversationId === convId) startNewConversation();
    fetchConversations();
  };

  const getActionDisplay = (action: string) => {
    return actionIcons[action] || { icon: CheckCircle2, label: "Åtgärd utförd", color: "text-accent" };
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Idag";
    if (diffDays === 1) return "Igår";
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    return d.toLocaleDateString("sv-SE");
  };

  return (
    <div className="h-full flex bg-background">
      {/* Conversation sidebar */}
      <div className={`${sidebarOpen ? "w-72" : "w-0"} md:w-64 transition-all duration-300 overflow-hidden border-r border-border bg-card flex-shrink-0 flex flex-col`}>
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Konversationer</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewChat} title="Ny konversation">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Inga sparade konversationer</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                role="button"
                tabIndex={0}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors group flex items-center gap-2 cursor-pointer ${
                  conversationId === conv.id
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{conv.title}</p>
                  <p className={`text-[10px] ${conversationId === conv.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {formatDate(conv.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className={`opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded hover:bg-destructive/20 transition-opacity ${
                    conversationId === conv.id ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-4 sm:px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile sidebar toggle */}
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <div className="h-10 w-10 rounded-xl wb-gradient-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">WorkBuddy</h1>
                <p className="text-sm text-muted-foreground">{activeWorkplace?.name || "Din digitala kollega"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleNewChat} title="Ny konversation">
                <Plus className="h-4 w-4 mr-1" /> Ny
              </Button>
              {messages.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearMessages}>
                  <Trash2 className="h-4 w-4 mr-1" /> Rensa
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-16 w-16 rounded-2xl wb-gradient-accent flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Hej! Jag är WorkBuddy</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Jag kan schemalägga, skapa checklistor, rutiner och nyheter. Bara säg till!
              </p>

              {demoPrompts.length > 0 ? (
                <div className="w-full max-w-lg">
                  <p className="text-sm text-muted-foreground mb-3">Prova dessa:</p>
                  <div className="grid gap-2">
                    {demoPrompts.map((prompt) => (
                      <button key={prompt.id} onClick={() => handlePromptClick(prompt.prompt_text)}
                        className="text-left px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm text-foreground">
                        {prompt.prompt_text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-lg">
                  <p className="text-sm text-muted-foreground mb-3">Exempel på vad du kan säga:</p>
                  <div className="grid gap-2">
                    {["Schemalägg Anna imorgon 14-22", "Ta bort alla pass på fredag", "Skapa en öppningsrutin", "Publicera en nyhet om städdagen"].map((prompt, i) => (
                      <button key={i} onClick={() => handlePromptClick(prompt)}
                        className="text-left px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm text-foreground">
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                  }`}>
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none text-foreground"><ReactMarkdown>{message.content}</ReactMarkdown></div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Tool result notifications */}
              {toolResults.length > 0 && (
                <div className="flex justify-start">
                  <div className="space-y-2">
                    {toolResults.map((result, index) => {
                      const display = getActionDisplay(result.action);
                      const Icon = display.icon;
                      return (
                        <div key={index} className="bg-accent/10 border border-accent/30 rounded-2xl px-4 py-3 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                            <Icon className={`h-4 w-4 ${display.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-accent" />{display.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.shifts && `${result.shifts.length} pass`}
                              {result.deleted_count !== undefined && result.deleted_count > 0 && `${result.deleted_count} borttagna`}
                              {result.checklist && `"${result.checklist.title}"`}
                              {result.routine && `"${result.routine.title}"`}
                              {result.announcement && `"${result.announcement.title}"`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
              <AlertCircle className="h-4 w-4" /><p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-border bg-card">
          {speechError && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-3 py-2 rounded-lg mb-2 text-sm">
              <MicOff className="h-4 w-4 flex-shrink-0" /><span className="truncate">{speechError}</span>
            </div>
          )}
          {isListening && (
            <div className="flex items-center justify-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 mb-3">
              <div className="relative">
                <Mic className="h-5 w-5 text-destructive animate-pulse" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-ping" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {interimTranscript ? `"${interimTranscript}"` : "Lyssnar..."}
              </span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Prata nu..." : "Skriv eller prata..."} className="h-12 text-base" disabled={isLoading} />
            {isSpeechSupported && (
              <Button type="button" variant={isListening ? "destructive" : "secondary"} onClick={handleMicClick}
                disabled={isLoading} className={`h-12 w-12 flex-shrink-0 ${isListening ? "animate-pulse" : ""}`}
                aria-label={isListening ? "Stoppa inspelning" : "Starta röstinmatning"}>
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            )}
            <Button type="submit" variant="hero" className="h-12 w-12 flex-shrink-0" disabled={isLoading || !input.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
