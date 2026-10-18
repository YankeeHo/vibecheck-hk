"use client";

import { useMemo, useSyncExternalStore } from "react";
import { PracticeChat } from "../components/PracticeChat";
import catalog from "../data/proverbs.json";
import { parseResult, STORAGE_KEY, type Proverb } from "./game";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function snapshot() {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
/** Thin Stage 1 adapter: all Stage 2 conversation logic remains in PracticeChat. */
export default function Stage1Practice() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const result = useMemo(() => parseResult(raw, catalog as Proverb[]), [raw]);
  return (
    <>
      {result && (
        <section
          lang="zh-HK"
          aria-label="Stage 1 學習成果"
          className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-300/30 bg-cyan-300/5 px-5 py-4"
        >
          <div>
            <p className="text-xs tracking-widest text-cyan-200">
              STAGE 1 → STAGE 2 · 已帶入金句
            </p>
            <h2 className="mt-1 text-xl font-bold">{result.proverb.title}</h2>
            <p className="mt-1 text-sm text-slate-300">
              {result.proverb.context}
            </p>
          </div>
          <span className="text-lg font-bold text-cyan-200">
            ✦ {result.xp} Vibe XP
          </span>
        </section>
      )}
      <PracticeChat
        key={result?.proverb.proverbId ?? "direct"}
        initialProverb={result?.proverb}
      />
    </>
  );
}
