import type { Stage2PersonaId } from "../../lib/contracts";

const voices: Record<Stage2PersonaId, string> = {
  "uncle-cheong": "zh-HK-WanLungNeural",
  "brother-sing": "zh-HK-WanLungNeural",
  "auntie-sam": "zh-HK-HiuGaaiNeural",
};

function isPersonaId(value: unknown): value is Stage2PersonaId {
  return typeof value === "string" && Object.hasOwn(voices, value);
}

function escapeXml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return Response.json({ error: "Azure Speech is not configured." }, { status: 503 });
  }

  try {
    const response = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": key },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("Azure Speech token request failed", response.status);
      return Response.json({ error: "Voice recognition could not be authorized." }, { status: 502 });
    }

    return Response.json(
      { token: await response.text(), region },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Azure Speech token request could not be completed", error);
    return Response.json({ error: "Voice recognition could not be authorized." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return Response.json(
      { error: "Azure Speech is not configured. Add AZURE_SPEECH_KEY and AZURE_SPEECH_REGION." },
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
    return Response.json({ error: "Invalid speech request." }, { status: 400 });
  }

  const { personaId, text } = body as Record<string, unknown>;
  if (!isPersonaId(personaId) || typeof text !== "string" || !text.trim() || text.length > 500) {
    return Response.json({ error: "Invalid character or speech text." }, { status: 400 });
  }

  const ssml = `<speak version="1.0" xml:lang="zh-HK"><voice name="${voices[personaId]}"><prosody rate="+20%">${escapeXml(text.trim())}</prosody></voice></speak>`;

  try {
    const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/ssml+xml",
        "Ocp-Apim-Subscription-Key": key,
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "VibeCheckHK",
      },
      body: ssml,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.error("Azure Speech request failed", response.status);
      return Response.json({ error: "Character speech could not be generated." }, { status: 502 });
    }

    return new Response(await response.arrayBuffer(), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Azure Speech request could not be completed", error);
    return Response.json({ error: "Character speech could not be generated." }, { status: 502 });
  }
}