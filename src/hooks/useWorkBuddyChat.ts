import { useState, useCallback } from "react";
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

  const loadConversation = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data.map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content })));
    }
    setConversationId(convId);
    setError(null);
    setToolResults([]);
  }, []);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setToolResults([]);
  }, []);

  const sendMessage = useCallback(async (input: string, options: SendMessageOptions) => {
    const { session, workplaceId } = options;

    if (!session?.access_token) {
      setError("Not authenticated");
      return;
    }

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);
    setToolResults([]);

    try {
      // Create conversation if needed
      let activeConvId = conversationId;
      if (!activeConvId && workplaceId) {
        const { data: conv } = await supabase
          .from("conversations")
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            workplace_id: workplaceId,
            title: input.slice(0, 60),
          })
          .select("id")
          .single();
        if (conv) {
          activeConvId = conv.id;
          setConversationId(conv.id);
        }
      }

      // Save user message to DB
      if (activeConvId) {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          await supabase.from("chat_messages").insert({
            conversation_id: activeConvId,
            user_id: userId,
            workplace_id: workplaceId || "",
            role: "user",
            content: input,
          });
        }
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
            messages: [...messages, userMsg],
            workplaceId: workplaceId || undefined,
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
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);

        // Save assistant message to DB
        if (activeConvId) {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          if (userId) {
            await supabase.from("chat_messages").insert({
              conversation_id: activeConvId,
              user_id: userId,
              workplace_id: workplaceId || "",
              role: "assistant",
              content: data.response,
            });
          }
        }

        // Update conversation title with first response if it's the first exchange
        if (activeConvId && messages.length === 0) {
          const shortTitle = input.length > 50 ? input.slice(0, 50) + "…" : input;
          await supabase.from("conversations").update({ title: shortTitle }).eq("id", activeConvId);
        }

        if (data.tool_results && Array.isArray(data.tool_results)) {
          setToolResults(data.tool_results);
        }
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, conversationId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
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
