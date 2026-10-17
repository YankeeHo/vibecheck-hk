//OpenRouter request flow
import { OpenRouter } from "@openrouter/sdk";
import { getRewardTier, stage2IdiomsByPersona, type Stage2PersonaId } from "../../lib/contracts";
import {
  buildStage2Prompt,
  getAssistantTurn,
  isStage2ChatMessage,
  isStage2Evaluation,
  sceneCompleteTag,
  stage2ChatPersonas,
  type ChatMessage,
  type PromptMessage,
} from "../../lib/stage2-chat";
import type { Stage2Evaluation } from "../../lib/stage2";

async function streamText(
  openrouter: OpenRouter,
  model: string,
  messages: PromptMessage[],
  maxTokens: number,
  responseFormat?: { type: "json_object" },
) {
  const stream = await openrouter.chat.send(
    {
      chatRequest: {
        model,
        messages,
        temperature: responseFormat ? 0.2 : 0.8,
        reasoningEffort: "none",
        maxTokens,
        responseFormat,
        stream: true,
      },
    },
    { timeoutMs: 30_000 },
  );

  if (!(Symbol.asyncIterator in stream)) {
    throw new Error("OpenRouter returned a non-streaming response.");
  }

  let text = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (typeof content === "string") text += content;
  }

  if (!text.trim()) throw new Error("OpenRouter returned an empty response.");
  return text.trim();
}

function isPersonaId(value: unknown): value is Stage2PersonaId {
  return typeof value === "string" && Object.hasOwn(stage2ChatPersonas, value);
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
    !messages.every(isStage2ChatMessage) ||
    messages[messages.length - 1].role !== "user"
  ) {
    return Response.json({ error: "Invalid chat messages or character." }, { status: 400 });
  }

  const persona = stage2ChatPersonas[personaId];
  const chatMessages = messages as ChatMessage[];
  const assistantTurn = getAssistantTurn(chatMessages);
  const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4.1-flash";

  try {
    const openrouter = new OpenRouter({ apiKey });
    const idioms = stage2IdiomsByPersona[personaId];
    const modelReply = await streamText(
      openrouter,
      model,
      [{ role: "system", content: buildStage2Prompt(persona, personaId, assistantTurn) }, ...chatMessages],
      300,
    );
    const completed = modelReply.includes(sceneCompleteTag) || assistantTurn >= 4;
    const reply = modelReply.replace(sceneCompleteTag, "").trim();
    if (!reply) throw new Error("OpenRouter returned an empty character reply.");

    let evaluation: Stage2Evaluation | undefined;
    if (completed) {
      const idiomOptions = idioms.map(({ cantonese }) => cantonese).join("、");
      const evaluatorPrompt = `Evaluate the user's full roleplay performance. Score semantic understanding (40%), authentic spoken Cantonese (30%), and creative connection to modern life (30%). Return only a JSON object with status="COMPLETED", vibe_score as an integer from 1 to 5, card_rarity (score 5=SR, 3-4=S, 1-2=R), evaluator_feedback as one short Cantonese phrase, unlocked_idiom exactly matching the idiom used in the roleplay and selected from this character's list [${idiomOptions}], and phonetic_tone_tip with a useful Cantonese tone or homophone tip connected to that idiom. Do not include markdown or extra keys.`;

      try {
        const evaluationText = await streamText(
          openrouter,
          model,
          [
            { role: "system", content: evaluatorPrompt },
            ...chatMessages,
            { role: "assistant", content: reply },
          ],
          350,
          { type: "json_object" },
        );
        const jsonStart = evaluationText.indexOf("{");
        const jsonEnd = evaluationText.lastIndexOf("}");
        const parsed: unknown = JSON.parse(evaluationText.slice(jsonStart, jsonEnd + 1));

        if (isStage2Evaluation(parsed) && idioms.some((idiom) => idiom.cantonese === parsed.unlocked_idiom)) {
          evaluation = {
            ...parsed,
            card_rarity: getRewardTier(parsed.vibe_score),
          };
        }
      } catch (error) {
        console.error("Stage 2 evaluation could not be completed", error);
      }
    }

    return Response.json(
      { reply, completed, evaluation },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("OpenRouter request could not be completed", error);
    return Response.json(
      { error: "Could not connect to OpenRouter. Please try again." },
      { status: 502 },
    );
  }
}
