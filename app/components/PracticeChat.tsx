"use client";
// stage 2: persona and coversation data

import { useEffect, useMemo, useRef, useState } from "react";

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

type PersonaId = "uncle-cheong" | "brother-sing" | "auntie-sam";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type Persona = {
  id: PersonaId;
  name: string;
  title: string;
  accent: string;
  badge: string;
  intro: string;
};

const personas: Persona[] = [
  {
    id: "uncle-cheong",
    name: "Uncle Cheong",
    title: "霓虹燈牌師傅",
    accent: "from-[#00F0FF] to-cyan-300",
    badge: "craftsman",
    intro: "慢工出細貨，做野要落手落腳，唔好急住搶晒成個夜市。",
  },
  {
    id: "brother-sing",
    name: "Brother Sing",
    title: "紅頭小巴司機",
    accent: "from-[#FF2E93] to-pink-400",
    badge: "streetwise",
    intro: "過咗海就係神仙，先講到你有幾掂。講到最後，結果先係王道。",
  },
  {
    id: "auntie-sam",
    name: "Auntie Sam",
    title: "涼茶舖老闆娘",
    accent: "from-[#00F0FF] via-cyan-300 to-[#FF2E93]",
    badge: "community",
    intro: "食過下夜粥，先知點樣留住人情。要顧住自己，亦要顧住晒成個街。",
  },
];

const starterMessages = [
  {
    id: "assistant-1",
    role: "assistant" as const,
    text: "我哋今日講香港人嘅智慧，先由你講一個你而家最煩嘅事。",
  },
];

const createStarterMessages = (): Message[] => [...starterMessages];

export function PracticeChat() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>("uncle-cheong");
  const [messages, setMessages] = useState<Message[]>(createStarterMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [sendError, setSendError] = useState("");
  const recognitionRef = useRef<LocalSpeechRecognition | null>(null);
  const soundtrackRef = useRef<HTMLAudioElement | null>(null);
  const [isSoundtrackPlaying, setIsSoundtrackPlaying] = useState(false);
  const [isSoundtrackMuted, setIsSoundtrackMuted] = useState(false);

  const activePersona = useMemo(
    () => personas.find((persona) => persona.id === selectedPersona) ?? personas[0],
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
  }, []);

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

    if (!trimmed || isSending) {
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
      const result: { reply?: string; error?: string } = await response.json();

      if (!response.ok || !result.reply) {
        throw new Error(result.error ?? "The character could not reply. Please try again.");
      }

      setMessages((previous) => [
        ...previous,
        { id: `assistant-${Date.now()}`, role: "assistant", text: result.reply! },
      ]);
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "The character could not reply. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

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
                On the road
              </span>
            </div>
          </div>

          <div aria-label="Choose a character" className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {personas.map((persona) => {
            const isSelected = persona.id === selectedPersona;

            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => {
                  setSelectedPersona(persona.id);
                  setMessages(createStarterMessages());
                  setSendError("");
                }}
                aria-pressed={isSelected}
                className={`min-w-max border px-3 py-2 text-left transition ${
                  isSelected
                    ? "border-cyan-200/70 bg-black/25 text-white"
                    : "border-white/20 bg-black/10 text-white/70 hover:border-white/40 hover:bg-black/20 hover:text-white"
                }`}
              >
                <span className="block text-sm font-bold">{persona.name}</span>
                <span className="mt-0.5 block text-[10px] text-current/70">{persona.title}</span>
              </button>
            );
          })}
          </div>
        </header>

        <div className="flex h-[min(55vh,520px)] min-h-[320px] flex-col gap-4 overflow-y-auto bg-transparent p-4 sm:p-6" role="log" aria-live="polite" aria-label="Conversation">
          <p className="mx-auto mb-1 max-w-[90%] border border-white/20 bg-black/20 px-3 py-1.5 text-center text-[10px] uppercase tracking-[0.16em] text-white/75">
            {activePersona.intro}
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
                {message.text}
              </div>
            </div>
          ))}

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
            placeholder="講返你最真實嘅煩惱……"
            aria-label="Your message"
            className="min-h-12 flex-1 resize-none rounded-full border border-white/30 bg-black/10 px-4 py-3 text-sm text-white placeholder:text-white/55 focus:border-cyan-200/80 focus:outline-none"
          />

          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isSending}
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
            disabled={isSending || !draft.trim()}
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
