import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ToolResult {
  action: string;
  shifts?: any[];
  checklist?: any;
  routine?: any;
  announcement?: any;
  deleted_count?: number;
  shift?: any;
}

interface SendMessageOptions {
  session: { access_token: string } | null;
  workplaceId?: string | null;
}

export function useWorkBuddyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const messagesRef = useRef<Message[]>([]);

  // Keep ref in sync
  const updateMessages = (updater: (prev: Message[]) => Message[]) => {
    setMessages((prev) => {
      const next = updater(prev);
      messagesRef.current = next;
      return next;
    });
  };

  const loadConversation = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (data) {
      const loaded = data.map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content }));
      setMessages(loaded);
      messagesRef.current = loaded;
    }
    setConversationId(convId);
    conversationIdRef.current = convId;
    setError(null);
    setToolResults([]);
  }, []);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
    setConversationId(null);
    conversationIdRef.current = null;
    setError(null);
    setToolResults([]);
  }, []);

  const sendMessage = useCallback(async (input: string, options: SendMessageOptions) => {
    const { session, workplaceId } = options;

    if (!session?.access_token || !workplaceId) {
      setError(!session?.access_token ? "Inte inloggad" : "Ingen arbetsplats vald");
      return;
    }

    const userMsg: Message = { role: "user", content: input };
    const prevMessages = messagesRef.current;
    updateMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);
    setToolResults([]);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Inte inloggad");

      // Use ref to get the latest conversationId
      let activeConvId = conversationIdRef.current;
      if (!activeConvId) {
        const { data: conv } = await supabase
          .from("conversations")
          .insert({
            user_id: authUser.id,
            workplace_id: workplaceId,
            title: input.length > 50 ? input.slice(0, 50) + "…" : input,
          })
          .select("id")
          .single();
        if (conv) {
          activeConvId = conv.id;
          setConversationId(conv.id);
          conversationIdRef.current = conv.id;
        }
      }

      // Save user message
      if (activeConvId) {
        const { error: insertError } = await supabase.from("chat_messages").insert({
          conversation_id: activeConvId,
          user_id: authUser.id,
          workplace_id: workplaceId,
          role: "user",
          content: input,
        });
        if (insertError) console.error("Failed to save user message:", insertError);
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/workbuddy-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [...prevMessages, userMsg],
            workplaceId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) throw new Error("För många förfrågningar. Försök igen om en stund.");
        if (response.status === 402) throw new Error("Krediter slut. Kontakta administratör.");
        throw new Error(errorData.error || "Något gick fel");
      }

      const data = await response.json();

      if (data.response) {
        updateMessages((prev) => [...prev, { role: "assistant", content: data.response }]);

        // Save assistant message
        if (activeConvId) {
          const { error: saveError } = await supabase.from("chat_messages").insert({
            conversation_id: activeConvId,
            user_id: authUser.id,
            workplace_id: workplaceId,
            role: "assistant",
            content: data.response,
          });
          if (saveError) console.error("Failed to save assistant message:", saveError);
        }

        if (data.tool_results && Array.isArray(data.tool_results)) {
          setToolResults(data.tool_results);
        }
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Okänt fel");
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed - uses refs

  const clearMessages = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
    setConversationId(null);
    conversationIdRef.current = null;
    setError(null);
    setToolResults([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    toolResults,
    conversationId,
    loadConversation,
    startNewConversation,
  };
}
