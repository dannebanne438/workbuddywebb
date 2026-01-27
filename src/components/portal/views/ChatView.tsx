import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkBuddyChat } from "@/hooks/useWorkBuddyChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Trash2, AlertCircle, Calendar, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { RequestAdminAccess } from "../RequestAdminAccess";

interface DemoPrompt {
  id: string;
  prompt_text: string;
  category: string | null;
}

export function ChatView() {
  const { session, workplace } = useAuth();
  const { messages, isLoading, error, sendMessage, clearMessages, lastToolResult } = useWorkBuddyChat();
  const [input, setInput] = useState("");
  const [demoPrompts, setDemoPrompts] = useState<DemoPrompt[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (workplace?.id) {
      supabase
        .from("demo_prompts")
        .select("id, prompt_text, category")
        .eq("workplace_id", workplace.id)
        .order("sort_order")
        .then(({ data }) => {
          if (data) setDemoPrompts(data);
        });
    }
  }, [workplace?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim(), session);
    setInput("");
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt, session);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl wb-gradient-accent flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">WorkBuddy</h1>
              <p className="text-sm text-muted-foreground">
                {workplace?.name || "Din digitala kollega"}
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearMessages}>
              <Trash2 className="h-4 w-4 mr-2" />
              Rensa
            </Button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-16 w-16 rounded-2xl wb-gradient-accent flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Hej! Jag är WorkBuddy</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Fråga mig om rutiner, schema, kontakter eller be mig skapa checklistor och schemalägga personal.
            </p>

            {demoPrompts.length > 0 && (
              <div className="w-full max-w-lg">
                <p className="text-sm text-muted-foreground mb-3">Prova dessa:</p>
                <div className="grid gap-2">
                  {demoPrompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handlePromptClick(prompt.prompt_text)}
                      className="text-left px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm text-foreground"
                    >
                      {prompt.prompt_text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Admin request card */}
            <div className="w-full max-w-lg mt-6">
              <RequestAdminAccess />
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none text-foreground">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Tool result notification */}
            {lastToolResult?.success && lastToolResult.action === "create_schedule" && (
              <div className="flex justify-start">
                <div className="bg-accent/10 border border-accent/30 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      {lastToolResult.created_shifts?.length || 0} pass schemalagda
                    </p>
                    <p className="text-xs text-muted-foreground">Visa i Schema-fliken</p>
                  </div>
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
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Skriv ett meddelande eller 'Schemalägg Anna imorgon 14-22'..."
            className="h-12"
            disabled={isLoading}
          />
          <Button type="submit" variant="hero" size="lg" disabled={isLoading || !input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
