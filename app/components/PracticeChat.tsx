"use client";

import { useMemo, useState } from "react";

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
  replies: string[];
};

const personas: Persona[] = [
  {
    id: "uncle-cheong",
    name: "Uncle Cheong",
    title: "霓虹燈牌師傅",
    accent: "from-cyan-400 via-sky-400 to-indigo-500",
    badge: "craftsman",
    intro: "慢工出細貨，做野要落手落腳，唔好急住搶晒成個夜市。",
    replies: [
      "慢工出細貨，做野有步驟先有成果。你唔好淨係睇結果，重點係你有冇守住工序。",
      "我哋做嘢唔係追求最快，而係追求最穩。你個方案如果冇得持久，咁冇意思。",
      "有時你急住出貨，反而變成賣死貨。要識停一停，先至有時間做得靚。",
    ],
  },
  {
    id: "brother-sing",
    name: "Brother Sing",
    title: "紅頭小巴司機",
    accent: "from-fuchsia-400 via-violet-500 to-purple-600",
    badge: "streetwise",
    intro: "過咗海就係神仙，先講到你有幾掂。講到最後，結果先係王道。",
    replies: [
      "過咗海就係神仙，講到最後，所有人都會睇你攜帶住幾多實力。你呢個做法有冇經得起關卡？",
      "世事講究嘅就係見招拆招。你唔好以為最講理嗰個就係贏家，最穩定嗰個先至係高手。",
      "市井智慧都係實戰。你要係風大浪急嗰陣都仲可以行到，先至算真本事。",
    ],
  },
  {
    id: "auntie-sam",
    name: "Auntie Sam",
    title: "涼茶舖老闆娘",
    accent: "from-amber-300 via-orange-400 to-rose-500",
    badge: "community",
    intro: "食過下夜粥，先知點樣留住人情。要顧住自己，亦要顧住晒成個街。",
    replies: [
      "你睇，做事唔好成日只顧自己。夜粥一口熱氣，係見人情、留人心。你呢個決定有冇顧到社區？",
      "冇人係一個人住喺度，做任何事都要計埋風險同人情。唔好猛咁衝，先講掂背景。",
      "好天搵埋落雨柴，講嘅就係預備。你有冇預留後路？冇後路，點樣捱到長遠？",
    ],
  },
];

const starterMessages = [
  {
    id: "assistant-1",
    role: "assistant" as const,
    text: "我哋今日講香港人嘅智慧，先由你講一個你而家最煩嘅事。",
  },
];

export function PracticeChat() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>("uncle-cheong");
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  const activePersona = useMemo(
    () => personas.find((persona) => persona.id === selectedPersona) ?? personas[0],
    [selectedPersona],
  );

  const handleSend = () => {
    const trimmed = draft.trim();

    if (!trimmed || isSending) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    const replyText =
      activePersona.replies[Math.floor(Math.random() * activePersona.replies.length)];

    setMessages((previous) => [...previous, userMessage]);
    setDraft("");
    setIsSending(true);

    window.setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: replyText,
        },
      ]);
      setIsSending(false);
    }, 500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[28px] border border-white/10 bg-slate-950/70 p-4 shadow-[0_0_30px_rgba(15,23,42,0.3)]">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200">Persona</p>

        <div className="mt-4 space-y-3">
          {personas.map((persona) => {
            const isSelected = persona.id === selectedPersona;

            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setSelectedPersona(persona.id)}
                className={`w-full rounded-2xl border p-3 text-left transition ${
                  isSelected
                    ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.18)]"
                    : "border-white/10 bg-slate-900/60 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-white">{persona.name}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{persona.title}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200">
                    {persona.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-violet-400/30 bg-violet-500/10 p-3 text-sm leading-6 text-violet-100">
          {activePersona.intro}
        </div>
      </aside>

      <section className="rounded-[30px] border border-white/10 bg-slate-950/70 p-4 shadow-[0_0_30px_rgba(168,85,247,0.08)] sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-200">Active character</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-white">
              {activePersona.name}
            </h2>
          </div>

          <div className={`rounded-full bg-gradient-to-r ${activePersona.accent} px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950`}>
            {activePersona.title}
          </div>
        </div>

        <div className="flex h-[440px] flex-col gap-3 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/60 p-3 sm:p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                message.role === "user"
                  ? "ml-auto bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950"
                  : "bg-slate-800 text-slate-100"
              }`}
            >
              {message.text}
            </div>
          ))}

          {isSending && (
            <div className="max-w-[85%] rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-200">
              {activePersona.name} 正在回覆……
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder="講返你最真實嘅煩惱……"
            className="min-h-[90px] flex-1 resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400/60 focus:outline-none"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !draft.trim()}
            className="self-end rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
