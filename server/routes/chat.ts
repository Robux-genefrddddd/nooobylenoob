import { RequestHandler } from "express";
import { getAIConfig_ } from "./admin";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { messages } = req.body as ChatRequest;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "OpenRouter API key not configured" });
    }

    // Get AI config from admin settings
    const aiConfig = getAIConfig_();
    const SYSTEM_PROMPT = aiConfig.systemPrompt;

    // Inject system prompt if not already present
    const finalMessages: ChatMessage[] =
      messages[0]?.role === "system"
        ? messages
        : [{ role: "system" as const, content: SYSTEM_PROMPT }, ...messages];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": req.get("origin") || "http://localhost:8080",
          "X-Title": "Chat Application",
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: finalMessages,
          temperature: aiConfig.temperature,
          max_tokens: aiConfig.maxTokens,
        }),
      },
    );

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        console.error("OpenRouter API error:", responseText);
        return res.status(response.status).json({
          error: `OpenRouter API error: ${response.statusText}`,
          details: responseText,
        });
      }
      console.error("OpenRouter API error:", errorData);
      return res.status(response.status).json({
        error:
          errorData.error || `OpenRouter API error: ${response.statusText}`,
        details: errorData,
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse OpenRouter API response:", parseError);
      return res.status(500).json({
        error: "Failed to parse OpenRouter API response",
      });
    }

    const content = data.choices?.[0]?.message?.content || "";

    if (!content) {
      return res.status(500).json({ error: "No response from OpenRouter API" });
    }

    res.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({
      error: "Failed to process chat request",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
