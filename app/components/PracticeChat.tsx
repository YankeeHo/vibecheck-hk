// UI and voice flow
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";
import { stage2IdiomsByPersona, type Stage2PersonaId } from "../lib/contracts";
import {
  createStarterMessages,
  getMysteryProverb,
  highlightIdioms,
  personas,
  stage2Missions,
  type Stage2Evaluation,
  type Stage2Message,
} from "../lib/stage2";

type PersonaId = Stage2PersonaId;
type Message = Stage2Message;

export function PracticeChat() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaId | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSceneComplete, setIsSceneComplete] = useState(false);
  const [evaluation, setEvaluation] = useState<Stage2Evaluation | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState("");
  const [sendError, setSendError] = useState("");
  const recognitionRef = useRef<SpeechRecognizer | null>(null);
  const soundtrackRef = useRef<HTMLAudioElement | null>(null);
  const speechAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechObjectUrlRef = useRef<string | null>(null);
  const speechRequestRef = useRef<AbortController | null>(null);
  const messageIdRef = useRef(0);
  const resumeSoundtrackRef = useRef(false);
  const [isSoundtrackPlaying, setIsSoundtrackPlaying] = useState(false);

  const activePersona = useMemo(
    () => personas.find((persona) => persona.id === selectedPersona) ?? null,
    [selectedPersona],
  );
  const currentRound = Math.min(4, Math.max(1, messages.filter((message) => message.role === "assistant").length));

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;

      if (recognition) {
        recognitionRef.current = null;
        recognition.stopContinuousRecognitionAsync(
          () => recognition.close(),
          () => recognition.close(),
        );
      }
    };
  }, [selectedPersona]);

  useEffect(() => {
    const soundtrack = soundtrackRef.current;

    if (soundtrack) {
      soundtrack.volume = 0.2;
      void soundtrack.play().catch(() => setIsSoundtrackPlaying(false));
    }
  }, [activePersona?.id]);

  useEffect(() => {
    return () => {
      speechRequestRef.current?.abort();
      speechAudioRef.current?.pause();
      if (speechObjectUrlRef.current) URL.revokeObjectURL(speechObjectUrlRef.current);
    };
  }, []);

  const stopCharacterSpeech = () => {
    speechRequestRef.current?.abort();
    speechRequestRef.current = null;
    speechAudioRef.current?.pause();
    speechAudioRef.current = null;
    if (speechObjectUrlRef.current) {
      URL.revokeObjectURL(speechObjectUrlRef.current);
      speechObjectUrlRef.current = null;
    }
    setActiveSpeechId(null);

    if (resumeSoundtrackRef.current) {
      void soundtrackRef.current?.play().catch(() => setIsSoundtrackPlaying(false));
      resumeSoundtrackRef.current = false;
    }
  };

  const handleCharacterSpeech = async (message: Message, persona = activePersona) => {
    if (!persona) return;

    if (activeSpeechId === message.id) {
      stopCharacterSpeech();
      return;
    }

    const controller = new AbortController();
    speechRequestRef.current = controller;
    resumeSoundtrackRef.current = Boolean(soundtrackRef.current && !soundtrackRef.current.paused);
    soundtrackRef.current?.pause();
    speechAudioRef.current?.pause();
    if (speechObjectUrlRef.current) URL.revokeObjectURL(speechObjectUrlRef.current);
    setActiveSpeechId(message.id);
    setSpeechError("");

    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: persona.id, text: message.text }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Character speech could not be generated.");
      }

      const objectUrl = URL.createObjectURL(await response.blob());
      if (speechRequestRef.current !== controller) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      speechObjectUrlRef.current = objectUrl;
      const audio = new Audio(objectUrl);
      speechAudioRef.current = audio;
      audio.onended = stopCharacterSpeech;
      audio.onerror = () => {
        setSpeechError("Character speech could not be played. Please try again.");
        stopCharacterSpeech();
      };
      await audio.play();
    } catch (error) {
      if (speechRequestRef.current === controller) {
        stopCharacterSpeech();
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSpeechError(error instanceof Error ? error.message : "Character speech could not be played.");
        }
      }
    }
  };

  const handleVoiceInput = async () => {
    const currentRecognition = recognitionRef.current;
    if (currentRecognition) {
      recognitionRef.current = null;
      setIsListening(false);
      currentRecognition.stopContinuousRecognitionAsync(
        () => currentRecognition.close(),
        () => currentRecognition.close(),
      );
      return;
    }

    setVoiceError("");
    setIsListening(true);

    try {
      const response = await fetch("/api/speech", { cache: "no-store" });
      const result = (await response.json()) as { token?: string; region?: string; error?: string };
      if (!response.ok || !result.token || !result.region) {
        throw new Error(result.error ?? "Voice recognition could not be authorized.");
      }

      const speechSdk = await import("microsoft-cognitiveservices-speech-sdk");
      const speechConfig = speechSdk.SpeechConfig.fromAuthorizationToken(result.token, result.region);
      speechConfig.speechRecognitionLanguage = "zh-HK";
      const recognition = new speechSdk.SpeechRecognizer(
        speechConfig,
        speechSdk.AudioConfig.fromDefaultMicrophoneInput(),
      );
      recognitionRef.current = recognition;
      recognition.recognized = (_sender, event) => {
        if (
          recognitionRef.current === recognition &&
          event.result.reason === speechSdk.ResultReason.RecognizedSpeech &&
          event.result.text.trim()
        ) {
          setDraft((currentDraft) => [currentDraft.trim(), event.result.text.trim()].filter(Boolean).join(" "));
        }
      };
      recognition.canceled = (_sender, event) => {
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
          setIsListening(false);
          if (event.errorDetails) setVoiceError(event.errorDetails);
        }
        recognition.close();
      };
      recognition.startContinuousRecognitionAsync(undefined, (error) => {
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
          setIsListening(false);
          setVoiceError(error || "Voice recognition could not start. Please try again.");
        }
        recognition.close();
      });
    } catch (error) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition?.close();
      setIsListening(false);
      setVoiceError(error instanceof Error ? error.message : "Voice recognition could not start.");
    }
  };

  const handleSend = async () => {
    const trimmed = draft.trim();

    if (!activePersona || !trimmed || isSending || isSceneComplete) {
      return;
    }

    const userMessage: Message = {
      id: `user-${++messageIdRef.current}`,
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
          messages: conversation.slice(-24).map(({ role, text }) => ({ role, content: text })),
        }),
      });
      const result = await response
        .text()
        .then(
          (responseText) =>
            JSON.parse(responseText) as {
              reply?: string;
              completed?: boolean;
              evaluation?: Stage2Evaluation;
              error?: string;
            },
        )
        .catch(() => null);

      if (!response.ok || !result?.reply) {
        throw new Error(
          result?.error ??
            (response.ok
              ? "The chat service returned an invalid response. Please try again."
              : `The chat service is unavailable (${response.status}). Please try again.`),
        );
      }

      const assistantMessage: Message = {
        id: `assistant-${++messageIdRef.current}`,
        role: "assistant",
        text: result.reply,
      };
      setMessages((previous) => [...previous, assistantMessage]);
      void handleCharacterSpeech(assistantMessage);
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
      <main
        className="fixed inset-0 z-40 flex min-h-screen items-center justify-center overflow-y-auto bg-cover bg-center bg-no-repeat px-5 py-10 text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(5, 8, 10, 0.58), rgba(5, 8, 10, 0.78)), url('/image/stage2/homepage_bg.jpg')",
        }}
      >
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
                  stopCharacterSpeech();
                  setSelectedPersona(persona.id);
                  const [starterMessage] = createStarterMessages(persona.id);
                  setMessages([starterMessage]);
                  void handleCharacterSpeech(starterMessage, persona);
                  setIsSceneComplete(false);
                  setEvaluation(null);
                  setSendError("");
                }}
                className="border border-white/20 bg-black/55 p-4 text-left backdrop-blur-sm transition hover:border-cyan-100/70 hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-100"
              >
                <span className="relative mb-4 block aspect-[16/10] overflow-hidden border border-white/15">
                  <Image
                    src={persona.avatar}
                    alt={persona.name}
                    fill
                    sizes="(max-width: 768px) 90vw, 30vw"
                    className="object-cover"
                  />
                </span>
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
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(5, 8, 10, 0.48), rgba(5, 8, 10, 0.58)), url('${activePersona.background}')`,
        }}
      />
      <div className="relative z-10 w-full max-w-3xl">
        <audio
          ref={soundtrackRef}
          src={activePersona.soundtrack}
          autoPlay
          loop
          preload="auto"
          onLoadedMetadata={(event) => {
            event.currentTarget.volume = 0.2;
          }}
          onPlay={() => setIsSoundtrackPlaying(true)}
          onPause={() => setIsSoundtrackPlaying(false)}
        />
        <section className="overflow-hidden border border-cyan-200/90 bg-black/[0.08] shadow-[0_0_14px_rgba(0,240,255,0.7),0_0_34px_rgba(255,46,147,0.28),0_24px_90px_rgba(0,0,0,0.3)]">
          <header className="border-b border-white/10 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative size-11 shrink-0 overflow-hidden border border-cyan-200/50 bg-black/20">
                  <Image
                    src={activePersona.avatar}
                    alt={activePersona.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100/75">
                    Riding with
                  </p>
                  <h2 className="truncate text-lg font-bold text-white sm:text-xl">{activePersona.name}</h2>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
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
                  {activePersona.id === "uncle-cheong"
                    ? "In the workshop"
                    : activePersona.id === "brother-sing"
                      ? "On the route"
                      : "At the tea stall"}
                </span>
              </div>
            </div>
          </header>

          <div className="sticky top-0 z-20 border-b border-cyan-100/20 bg-[#071014]/95 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p className="min-w-0 flex-1 truncate text-xs font-bold text-cyan-50 sm:text-sm">
                <span aria-hidden="true" className="mr-2 text-amber-300">
                  🎯
                </span>
                {stage2Missions[activePersona.id].label}
              </p>
              <div className="flex shrink-0 items-center gap-2" aria-label={`Round ${currentRound} of 4`}>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/65 sm:text-xs">
                  Round {currentRound} / 4
                </span>
                <span className="flex gap-1" aria-hidden="true">
                  {[1, 2, 3, 4].map((round) => (
                    <span
                      key={round}
                      className={`h-1.5 w-4 sm:w-5 ${round <= currentRound ? "bg-cyan-200" : "bg-white/20"}`}
                    />
                  ))}
                </span>
              </div>
            </div>
            <p className="mt-2 truncate text-xs text-amber-100/85 sm:text-sm" aria-live="polite">
              <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">神秘諺語</span>
              <span className="font-semibold tracking-[0.04em]">{getMysteryProverb(activePersona.id, currentRound)}</span>
            </p>
          </div>

          <div
            className="flex h-[min(55vh,520px)] min-h-[320px] flex-col gap-4 overflow-y-auto bg-transparent p-4 sm:p-6"
            role="log"
            aria-live="polite"
            aria-label="Conversation"
          >
            <p className="mx-auto mb-1 max-w-[90%] border border-white/20 bg-black/20 px-3 py-1.5 text-center text-[10px] uppercase tracking-[0.16em] text-white/75">
              {highlightIdioms(activePersona.intro, activePersona.id)}
            </p>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[88%] ${message.role === "user" ? "ml-auto" : "mr-auto"}`}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                      message.role === "user" ? "text-cyan-100/70" : "text-white/45"
                    }`}
                  >
                    {message.role === "user" ? "You" : activePersona.name}
                  </p>
                  {message.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => void handleCharacterSpeech(message)}
                      disabled={activeSpeechId !== null && activeSpeechId !== message.id}
                      aria-label={activeSpeechId === message.id ? "Stop character speech" : `Listen to ${activePersona.name}`}
                      className="text-[10px] font-bold uppercase text-cyan-100/80 transition hover:text-white disabled:opacity-40"
                    >
                      {activeSpeechId === message.id ? "Stop" : "Listen"}
                    </button>
                  )}
                </div>
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

            {isSceneComplete && (
              <p
                className="mr-auto max-w-[88%] border border-cyan-200/60 bg-black/55 px-4 py-3 text-sm font-bold leading-6 text-cyan-100 shadow-[0_0_14px_rgba(0,240,255,0.3)]"
                role="status"
              >
                好吧，看來你今天學到了很多。讓我們看看你的 'Vibe Score' 吧！
              </p>
            )}

            {evaluation && (
              <aside className="mr-auto w-full max-w-[88%] border border-cyan-100/35 bg-black/45 p-4" aria-live="polite">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">Session complete</p>
                  <p className="text-xs font-bold text-white">
                    {evaluation.vibe_score}/5 · {evaluation.card_rarity}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-white">{evaluation.evaluator_feedback}</p>
                <p className="mt-2 text-xs leading-5 text-white/70">
                  {evaluation.unlocked_idiom} · {evaluation.phonetic_tone_tip}
                </p>
              </aside>
            )}
            {isSceneComplete && !evaluation && (
              <p className="mr-auto text-xs text-white/70" role="status">
                對話完成，評語暫時未能載入。
              </p>
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
            {speechError && (
              <p className="mt-2 text-xs text-rose-100" role="status">
                {speechError}
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
    </>
  );
}
