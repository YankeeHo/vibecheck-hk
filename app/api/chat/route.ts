import { OpenRouter } from "@openrouter/sdk";
import { stage2IdiomsByPersona, type Stage2PersonaId } from "../../lib/contracts";

type PersonaId = Stage2PersonaId;
type ChatMessage = { role: "user" | "assistant"; content: string };
type PromptMessage = { role: "system" | "user" | "assistant"; content: string };
type Persona = {
  name: string;
  characterName: string;
  background: string;
  heritage: string;
  conflict: string;
  voice: string;
};
type Stage2Evaluation = {
  status: "COMPLETED";
  vibe_score: number;
  card_rarity: "SSR" | "SR" | "N";
  evaluator_feedback: string;
  unlocked_idiom: string;
  phonetic_tone_tip: string;
};

const personas: Record<PersonaId, Persona> = {
  "uncle-cheong": {
    name: "Uncle Cheong",
    characterName: "昌叔",
    background: "1980年代深水埗霓虹燈牌師傅",
    heritage: "屈管工藝、氬氣焊接、北魏體書法",
    conflict: "Agile MVP 同匠人精神之間點樣取捨",
    voice: "沉穩、重手藝同耐性；用霓虹招牌、屈管、焊接同交貨做比喻。",
  },
  "brother-sing": {
    name: "Brother Sing",
    characterName: "勝哥",
    background: "1970年代旺角／紅磡紅頭小巴司機",
    heritage: "手寫小巴牌、紅隧通車、獅子山拼搏精神",
    conflict: "Quiet Quitting 同市井智慧之間點樣取捨",
    voice: "爽快直接、街頭醒目；用小巴路線、過海同街頭打拼做比喻。",
  },
  "auntie-sam": {
    name: "Auntie Sam",
    characterName: "三姑",
    background: "1960年代九龍城寨涼茶舖老闆娘",
    heritage: "二十四味涼茶、城寨武館、夜粥",
    conflict: "FIRE 提早退休同城寨鄰里安全感之間點樣取捨",
    voice: "爽朗暖心但精明；用涼茶、藥材、夜粥、武館同鄰里互助做比喻。",
  },
};

const sceneCompleteTag = "[COMPLETED]";

function buildStage2Prompt(persona: Persona, personaId: PersonaId, assistantTurn: number) {
  const idioms = stage2IdiomsByPersona[personaId];
  const idiomList = idioms
    .map(({ cantonese, meaning, context }) => `- ${cantonese}: ${meaning} Modern connection: ${context}`)
    .join("\n");

  return `You are playing a historical Hong Kong character in VibeCheck HK.
Character: ${persona.characterName} (${persona.name})
Background: ${persona.background}
Intangible cultural heritage: ${persona.heritage}
Character voice: ${persona.voice}
Core conflict: ${persona.conflict}

Idioms assigned only to this character:
${idiomList}
Use only idioms from this character's list. Choose the one that best fits the user's current concern, explain its meaning naturally, and connect it to the listed modern-life context. Never claim another character's idiom, source, or occupation as your own.

Speak authentic spoken Hong Kong Cantonese in Traditional Chinese, with a warm, witty, immersive voice like a wise Hong Kong senior. Naturally weave in relevant heritage details; do not force them into every reply. Reply only as ${persona.characterName}. Keep each character response strictly to 40-60 Chinese characters, excluding the final scene tag.
Character boundary: stay in this character's own era, workplace, heritage, and voice. Never blend personas or claim another character's memories, job, or signature knowledge. 昌叔 is the neon-sign craftsman, 勝哥 is the red-minibus driver, and 三姑 is the herbal-tea shop owner; do not swap these identities or their conflicts.
Keep the conversation continuous: directly respond to the user's latest message and stay with their situation. Never abruptly change the subject just to mention the idiom; use the target idiom as a way to understand or illuminate the concern they are already discussing, and bridge into it naturally. If the user goes off-topic, use streetwise humor to steer them back, for example: 「別扯遠了，現在說的是…」.
The character's opening hook has already been shown and counts as turn 1. This is assistant turn ${assistantTurn} of the roleplay. Follow this four-turn arc: turn 1 introduces the situation and conflict; turns 2-3 respond to the user's real situation, explain the target idiom's meaning, and connect it to modern life without breaking conversational continuity; turn 4, when the topic has reached understanding or resonance, briefly summarize the wisdom and end with the exact hidden tag ${sceneCompleteTag}. Do not output evaluation JSON or any text after that tag in a conversation reply. The server will request the evaluation separately after this response.`;
}

function isStage2Evaluation(value: unknown): value is Stage2Evaluation {
  if (!value || typeof value !== "object") return false;
  const evaluation = value as Record<string, unknown>;
  return (
    evaluation.status === "COMPLETED" &&
    typeof evaluation.vibe_score === "number" &&
    Number.isInteger(evaluation.vibe_score) &&
    evaluation.vibe_score >= 1 &&
    evaluation.vibe_score <= 5 &&
    (evaluation.card_rarity === "SSR" || evaluation.card_rarity === "SR" || evaluation.card_rarity === "N") &&
    typeof evaluation.evaluator_feedback === "string" &&
    typeof evaluation.unlocked_idiom === "string" &&
    typeof evaluation.phonetic_tone_tip === "string"
  );
}

async function streamText(
  openrouter: OpenRouter,
  model: string,
  messages: PromptMessage[],
  maxTokens: number,
  responseFormat?: { type: "json_object" },
) {
  const stream = await openrouter.chat.send({
    chatRequest: {
      model,
      messages,
      temperature: responseFormat ? 0.2 : 0.8,
      reasoningEffort: "none",
      maxTokens,
      responseFormat,
      stream: true,
    },
  }, { timeoutMs: 30_000 });

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
  const chatMessages = messages as ChatMessage[];
  const assistantTurn = chatMessages.filter((message) => message.role === "assistant").length + 1;
  const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4.1-flash";
  try {
    const openrouter = new OpenRouter({ apiKey });
    const idioms = stage2IdiomsByPersona[personaId];
    const modelReply = await streamText(
      openrouter,
      model,
      [
        { role: "system", content: buildStage2Prompt(persona, personaId, assistantTurn) },
        ...chatMessages,
      ],
      300,
    );
    const completed = modelReply.includes(sceneCompleteTag) || assistantTurn >= 4;
    const reply = modelReply.replace(sceneCompleteTag, "").trim();

    if (!reply) throw new Error("OpenRouter returned an empty character reply.");
    if (assistantTurn >= 4 && !modelReply.includes(sceneCompleteTag)) {
      console.warn("Stage 2 reached its final turn without the completion tag.");
    }

    let evaluation: Stage2Evaluation | undefined;
    if (completed) {
      const idiomOptions = idioms.map(({ cantonese }) => cantonese).join("、");
      const evaluatorPrompt = `Evaluate the user's full roleplay performance. Score semantic understanding (40%), authentic spoken Cantonese (30%), and creative connection to modern life (30%). Return only a JSON object with status="COMPLETED", vibe_score as an integer from 1 to 5, card_rarity (score 5=SSR, 3-4=SR, 1-2=N), evaluator_feedback as one short Cantonese phrase, unlocked_idiom exactly matching the idiom used in the roleplay and selected from this character's list [${idiomOptions}], and phonetic_tone_tip with a useful Cantonese tone or homophone tip connected to that idiom. Do not include markdown or extra keys.`;

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

        if (
          isStage2Evaluation(parsed) &&
          idioms.some((idiom) => idiom.cantonese === parsed.unlocked_idiom)
        ) {
          const rarity = parsed.vibe_score === 5 ? "SSR" : parsed.vibe_score >= 3 ? "SR" : "N";
          evaluation = {
            ...parsed,
            card_rarity: rarity,
          };
        } else {
          throw new Error("OpenRouter returned an invalid evaluation.");
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