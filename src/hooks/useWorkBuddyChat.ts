import { useState, useCallback } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ToolResult {
  success: boolean;
  action?: string;
  created_shifts?: any[];
  error?: string;
}

export function useWorkBuddyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastToolResult, setLastToolResult] = useState<ToolResult | null>(null);

  const sendMessage = useCallback(async (input: string, session: { access_token: string } | null) => {
    if (!session?.access_token) {
      setError("Not authenticated");
      return;
    }

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);
    setLastToolResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/workbuddy-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ messages: [...messages, userMsg] }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error("För många förfrågningar. Försök igen om en stund.");
        }
        if (response.status === 402) {
          throw new Error("Krediter slut. Kontakta administratör.");
        }
        throw new Error(errorData.error || "Något gick fel");
      }

      const data = await response.json();
      
      // Handle non-streaming response with tool results
      if (data.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        
        if (data.tool_result) {
          setLastToolResult(data.tool_result);
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
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastToolResult(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages, lastToolResult };
}
