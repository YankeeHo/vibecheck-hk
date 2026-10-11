import { OpenRouter } from "@openrouter/sdk";

type PersonaId = "uncle-cheong" | "brother-sing" | "auntie-sam";
type ChatMessage = { role: "user" | "assistant"; content: string };

const personas: Record<PersonaId, { name: string; prompt: string }> = {
  "uncle-cheong": {
    name: "Uncle Cheong",
    prompt:
      "You are Uncle Cheong, a veteran Hong Kong neon-sign craftsman. Speak as a patient, practical craftsman who values careful steps, durable work, and not rushing. Help the user think through their real situation; use natural Hong Kong Cantonese in Traditional Chinese. Do not force a proverb into every reply.",
  },
  "brother-sing": {
    name: "Brother Sing",
    prompt:
      "You are Brother Sing, a streetwise Hong Kong red-minibus driver. Speak directly and vividly, with practical street smarts and a focus on what works in real life. Help the user think through their real situation; use natural Hong Kong Cantonese in Traditional Chinese. Do not force a proverb into every reply.",
  },
  "auntie-sam": {
    name: "Auntie Sam",
    prompt:
      "You are Auntie Sam, a warm, sharp Hong Kong herbal-tea shop owner. Speak with care for relationships, community, and preparing for setbacks, while still respecting the user's own needs. Help the user think through their real situation; use natural Hong Kong Cantonese in Traditional Chinese. Do not force a proverb into every reply.",
  },
};

function isPersonaId(value: unknown): value is PersonaId {
  return typeof value === "string" && value in personas;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= 2000
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "OpenRouter is not configured. Add OPENROUTER_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const { personaId, messages } = body as Record<string, unknown>;
  if (
    !isPersonaId(personaId) ||
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > 24 ||
    !messages.every(isChatMessage) ||
    messages[messages.length - 1].role !== "user"
  ) {
    return Response.json({ error: "Invalid chat messages or character." }, { status: 400 });
  }

  const persona = personas[personaId];
  try {
    const openrouter = new OpenRouter({ apiKey });
    const stream = await openrouter.chat.send({
      chatRequest: {
        model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4.1-flash",
        messages: [
          {
            role: "system",
            content: `${persona.prompt} Keep replies concise (usually 2-4 sentences). Your character is ${persona.name}.`,
          },
          ...messages,
        ],
        temperature: 0.8,
        reasoningEffort: "none",
        maxTokens: 300,
        stream: true,
      },
    }, { timeoutMs: 30_000 });

    if (!(Symbol.asyncIterator in stream)) {
      throw new Error("OpenRouter returned a non-streaming response.");
    }

    let reply = "";
    let reasoningTokens: number | null | undefined;
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (typeof content === "string") reply += content;

      if (chunk.usage) {
        reasoningTokens = chunk.usage.completionTokensDetails?.reasoningTokens;
      }
    }

    if (reasoningTokens !== undefined) {
      console.info("OpenRouter reasoning tokens:", reasoningTokens);
    }

    if (typeof reply !== "string" || !reply.trim()) {
      return Response.json(
        { error: "The character returned an empty reply. Please try again." },
        { status: 502 },
      );
    }

    return Response.json({ reply: reply.trim() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("OpenRouter request could not be completed", error);
    return Response.json(
      { error: "Could not connect to OpenRouter. Please try again." },
      { status: 502 },
    );
  }
}