"use client";
// stage 2: persona and coversation data

import { useEffect, useMemo, useRef, useState } from "react";
import { stage2IdiomsByPersona, type Stage2PersonaId } from "../lib/contracts";

type LocalSpeechRecognitionResult = {
  readonly 0: { readonly transcript: string };
};

type LocalSpeechRecognitionEvent = Event & {
  readonly resultIndex: number;
  readonly results: ArrayLike<LocalSpeechRecognitionResult>;
};

type LocalSpeechRecognitionErrorEvent = Event & {
  readonly error: string;
};

type LocalSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: LocalSpeechRecognitionEvent) => void) | null;
  onerror: ((event: LocalSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type LocalSpeechRecognitionConstructor = new () => LocalSpeechRecognition;

type PersonaId = Stage2PersonaId;

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type Persona = {
  id: PersonaId;
  name: string;
  title: string;
  era: string;
  setting: string;
  heritage: string;
  conflict: string;
  accent: string;
  badge: string;
  intro: string;
};
type Stage2Evaluation = {
  status: "COMPLETED";
  vibe_score: number;
  card_rarity: "SSR" | "SR" | "N";
  evaluator_feedback: string;
  unlocked_idiom: string;
  phonetic_tone_tip: string;
};

const personas: Persona[] = [
  {
    id: "uncle-cheong",
    name: "Uncle Cheong",
    title: "霓虹燈牌師傅",
    era: "1980s",
    setting: "深水埗",
    heritage: "屈管、氬氣焊接、北魏體書法",
    conflict: "Agile MVP vs. 匠人精神",
    accent: "from-[#00F0FF] to-cyan-300",
    badge: "craftsman",
    intro: "慢工出細貨，做野要落手落腳，唔好急住搶晒成個夜市。",
  },
  {
    id: "brother-sing",
    name: "Brother Sing",
    title: "紅頭小巴司機",
    era: "1970s",
    setting: "旺角／紅磡",
    heritage: "手寫小巴牌、紅隧通車、獅子山拼搏",
    conflict: "Quiet Quitting vs. 市井智慧",
    accent: "from-[#FF2E93] to-pink-400",
    badge: "streetwise",
    intro: "返工hea唔代表唔識做人，揸小巴見得多，知條路點走最重要。",
  },
  {
    id: "auntie-sam",
    name: "Auntie Sam",
    title: "涼茶舖老闆娘",
    era: "1960s",
    setting: "九龍城寨",
    heritage: "二十四味、武館夜粥、鄰里互助",
    conflict: "FIRE vs. 城寨安全感",
    accent: "from-[#00F0FF] via-cyan-300 to-[#FF2E93]",
    badge: "community",
    intro: "食過下夜粥，先知點樣留住人情。要顧住自己，亦要顧住晒成個街。",
  },
];

const openingHooks: Record<PersonaId, string> = {
  "uncle-cheong": "我係昌叔，喺深水埗整霓虹燈牌。如果趕住交個MVP，你會先求快，定係先做好每條屈管？",
  "brother-sing": "我係勝哥，旺角揸紅頭小巴。返工想靜靜雞hea下，又怕甩底，你覺得點先叫識做？",
  "auntie-sam": "我係三姑，喺城寨開涼茶舖。想早啲退休追自由，又想照應街坊，你會點樣兩邊兼顧？",
};

function highlightIdioms(text: string, personaId: PersonaId, isUserMessage = false) {
  const idioms = stage2IdiomsByPersona[personaId].map(({ cantonese }) => cantonese);
  const idiomSet = new Set<string>(idioms);
  const pattern = new RegExp(`(${[...idioms].sort((left, right) => right.length - left.length).join("|")})`, "g");

  return text.split(pattern).map((segment, index) =>
    idiomSet.has(segment) ? (
      <strong
        key={`idiom-${index}`}
        className={isUserMessage ? "font-extrabold text-[#102128] underline decoration-amber-700" : "font-extrabold text-amber-300"}
      >
        {segment}
      </strong>
    ) : segment,
  );
}

const createStarterMessages = (personaId: PersonaId): Message[] => [
  { id: "assistant-1", role: "assistant", text: openingHooks[personaId] },
];

export function PracticeChat() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaId | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSceneComplete, setIsSceneComplete] = useState(false);
  const [evaluation, setEvaluation] = useState<Stage2Evaluation | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [sendError, setSendError] = useState("");
  const recognitionRef = useRef<LocalSpeechRecognition | null>(null);
  const soundtrackRef = useRef<HTMLAudioElement | null>(null);
  const [isSoundtrackPlaying, setIsSoundtrackPlaying] = useState(false);
  const [isSoundtrackMuted, setIsSoundtrackMuted] = useState(false);

  const activePersona = useMemo(
    () => personas.find((persona) => persona.id === selectedPersona) ?? null,
    [selectedPersona],
  );

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;

      if (recognition) {
        recognition.onend = null;
        recognition.stop();
        recognitionRef.current = null;
      }
    };
  }, [selectedPersona]);

  useEffect(() => {
    const soundtrack = soundtrackRef.current;

    if (soundtrack) {
      void soundtrack.play().catch(() => setIsSoundtrackPlaying(false));
    }
  }, []);

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: LocalSpeechRecognitionConstructor;
      webkitSpeechRecognition?: LocalSpeechRecognitionConstructor;
    };
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "zh-HK";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(
        { length: event.results.length - event.resultIndex },
        (_, resultOffset) => event.results[event.resultIndex + resultOffset][0].transcript,
      ).join(" ").trim();

      if (transcript) {
        setDraft((currentDraft) => [currentDraft.trim(), transcript].filter(Boolean).join(" "));
      }
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setVoiceError(
          event.error === "not-allowed"
            ? "Allow microphone access in your browser to use voice input."
            : "Voice input could not start. Please try again.",
        );
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setVoiceError("");
    setIsListening(true);

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setVoiceError("Voice input could not start. Please try again.");
    }
  };

  const handleSend = async () => {
    const trimmed = draft.trim();

    if (!activePersona || !trimmed || isSending || isSceneComplete) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setDraft("");
    setIsSending(true);
    setSendError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: activePersona.id,
          messages: conversation
            .slice(-24)
            .map(({ role, text }) => ({ role, content: text })),
        }),
      });
      const result: {
        reply?: string;
        completed?: boolean;
        evaluation?: Stage2Evaluation;
        error?: string;
      } = await response.json();

      if (!response.ok || !result.reply) {
        throw new Error(result.error ?? "The character could not reply. Please try again.");
      }

      setMessages((previous) => [
        ...previous,
        { id: `assistant-${Date.now()}`, role: "assistant", text: result.reply! },
      ]);
      if (result.completed) setIsSceneComplete(true);
      if (result.evaluation) setEvaluation(result.evaluation);
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "The character could not reply. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!activePersona) {
    return (
      <main className="fixed inset-0 z-40 flex min-h-screen items-center justify-center overflow-y-auto bg-black px-5 py-10 text-white">
        <div className="w-full max-w-5xl">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-100/70">
            VibeCheck HK · Stage 2
          </p>
          <h1 className="mt-3 text-center text-2xl font-black text-white sm:text-3xl">Choose your character</h1>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {personas.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => {
                  setSelectedPersona(persona.id);
                  setMessages(createStarterMessages(persona.id));
                  setIsSceneComplete(false);
                  setEvaluation(null);
                  setSendError("");
                }}
                className="border border-white/20 bg-[#101112] p-5 text-left transition hover:border-cyan-100/70 hover:bg-[#17191a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-100"
              >
                <span className="block text-lg font-bold">{persona.name}</span>
                <span className="mt-1 block text-sm text-cyan-100">{persona.title}</span>
                <span className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-white/55">
                  {persona.era} · {persona.setting}
                </span>
                <span className="mt-2 block text-xs leading-5 text-white/75">{persona.heritage}</span>
                <span className="mt-3 block border-t border-white/10 pt-3 text-xs leading-5 text-white/65">
                  {persona.conflict}
                </span>
                <span className="mt-3 block text-[11px] leading-5 text-amber-200/90">
                  {stage2IdiomsByPersona[persona.id].map(({ cantonese }) => cantonese).join(" · ")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <audio
        ref={soundtrackRef}
        src="/stage2_sceneB.mp3"
        autoPlay
        loop
        muted={isSoundtrackMuted}
        preload="auto"
        onPlay={() => setIsSoundtrackPlaying(true)}
        onPause={() => setIsSoundtrackPlaying(false)}
      />
      <section className="overflow-hidden border border-white/25 bg-black/[0.08] shadow-[0_24px_90px_rgba(0,0,0,0.3)]">
        <header className="border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center border border-cyan-200/50 bg-black/20 text-lg font-black text-cyan-100">
                {activePersona.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100/75">
                  Riding with
                </p>
                <h2 className="truncate text-lg font-bold text-white sm:text-xl">
                  {activePersona.name}
                </h2>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSoundtrackMuted((muted) => !muted)}
                aria-label={isSoundtrackMuted ? "Unmute background audio" : "Mute background audio"}
                aria-pressed={isSoundtrackMuted}
                className="rounded-full border border-white/25 px-3 py-2 text-xs font-bold text-white/80 transition hover:border-cyan-100/70 hover:text-white"
              >
                {isSoundtrackMuted ? "Unmute" : "Mute"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const soundtrack = soundtrackRef.current;

                  if (!soundtrack) return;

                  if (soundtrack.paused) {
                    void soundtrack.play().catch(() => setIsSoundtrackPlaying(false));
                  } else {
                    soundtrack.pause();
                  }
                }}
                aria-label={isSoundtrackPlaying ? "Pause soundtrack" : "Play soundtrack"}
                aria-pressed={isSoundtrackPlaying}
                className="rounded-full border border-white/25 px-3 py-2 text-xs font-bold text-white/80 transition hover:border-cyan-100/70 hover:text-white"
              >
                {isSoundtrackPlaying ? "Sound on" : "Sound off"}
              </button>
              <span className="hidden items-center gap-2 text-xs text-white/65 sm:flex">
                <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
                  {activePersona.id === "uncle-cheong" ? "In the workshop" : activePersona.id === "brother-sing" ? "On the route" : "At the tea stall"}
              </span>
            </div>
          </div>

        </header>

        <div className="flex h-[min(55vh,520px)] min-h-[320px] flex-col gap-4 overflow-y-auto bg-transparent p-4 sm:p-6" role="log" aria-live="polite" aria-label="Conversation">
          <p className="mx-auto mb-1 max-w-[90%] border border-white/20 bg-black/20 px-3 py-1.5 text-center text-[10px] uppercase tracking-[0.16em] text-white/75">
            {highlightIdioms(activePersona.intro, activePersona.id)}
          </p>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[88%] ${message.role === "user" ? "ml-auto" : "mr-auto"}`}
            >
              <p className={`mb-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                message.role === "user" ? "text-cyan-100/70" : "text-white/45"
              }`}>
                {message.role === "user" ? "You" : activePersona.name}
              </p>
              <div
                className={`border px-4 py-3 text-sm leading-6 shadow-lg ${
                  message.role === "user"
                    ? "border-cyan-100/55 bg-cyan-100/85 text-[#102128]"
                    : "border-white/20 bg-black/50 text-white/95"
                }`}
              >
                {highlightIdioms(message.text, activePersona.id, message.role === "user")}
              </div>
            </div>
          ))}

          {evaluation && (
            <aside className="mr-auto w-full max-w-[88%] border border-cyan-100/35 bg-black/45 p-4" aria-live="polite">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">Session complete</p>
                <p className="text-xs font-bold text-white">{evaluation.vibe_score}/5 · {evaluation.card_rarity}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-white">{evaluation.evaluator_feedback}</p>
              <p className="mt-2 text-xs leading-5 text-white/70">{evaluation.unlocked_idiom} · {evaluation.phonetic_tone_tip}</p>
            </aside>
          )}
          {isSceneComplete && !evaluation && (
            <p className="mr-auto text-xs text-white/70" role="status">對話完成，評語暫時未能載入。</p>
          )}

          {isSending && (
            <div className="mr-auto max-w-[88%]">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                {activePersona.name}
              </p>
              <div className="border border-white/20 bg-black/50 px-4 py-3 text-sm text-white/80">
                正在回覆……
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/20 bg-black/[0.08] p-3 sm:p-4">
          <div className="flex items-end gap-2 sm:gap-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            placeholder={isSceneComplete ? "對話已完成" : "講返你最真實嘅煩惱……"}
            aria-label="Your message"
            disabled={isSceneComplete}
            className="min-h-12 flex-1 resize-none rounded-full border border-white/30 bg-black/10 px-4 py-3 text-sm text-white placeholder:text-white/55 focus:border-cyan-200/80 focus:outline-none"
          />

          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isSending || isSceneComplete}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            aria-pressed={isListening}
            className={`min-h-12 shrink-0 rounded-full border px-3 text-xs font-bold uppercase tracking-[0.1em] transition disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 ${
              isListening
                ? "border-rose-200 bg-rose-300/90 text-[#251114]"
                : "border-white/30 bg-black/15 text-white hover:border-cyan-100/70 hover:bg-black/30"
            }`}
          >
            {isListening ? "Stop" : "Voice"}
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || isSceneComplete || !draft.trim()}
            className="min-h-12 shrink-0 rounded-full border border-cyan-100 bg-cyan-100/90 px-4 text-sm font-black uppercase tracking-[0.12em] text-[#102128] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
          >
            Send
          </button>
          </div>
          {voiceError && (
            <p className="mt-2 text-xs text-rose-100" role="status">
              {voiceError}
            </p>
          )}
          {sendError && (
            <p className="mt-2 text-xs text-rose-100" role="alert">
              {sendError}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
