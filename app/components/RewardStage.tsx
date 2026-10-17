"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { DownloadCardButton } from "./DownloadCardButton";
import { PassportCard } from "./PassportCard";
import { isRewardCardData, rewardResultStorageKey, type RewardCardData } from "../lib/reward";

function subscribeToRewardResult() {
  return () => {};
}

function getRewardResultSnapshot() {
  try {
    return sessionStorage.getItem(rewardResultStorageKey);
  } catch {
    return null;
  }
}

export function RewardStage() {
  const storedResult = useSyncExternalStore(
    subscribeToRewardResult,
    getRewardResultSnapshot,
    () => undefined,
  );
  let result: RewardCardData | null = null;

  if (storedResult === undefined) {
    return <p className="py-16 text-center text-sm text-cyan-100/75" role="status">Preparing your reward card…</p>;
  }

  try {
    const parsedResult: unknown = storedResult ? JSON.parse(storedResult) : null;
    if (isRewardCardData(parsedResult)) result = parsedResult;
  } catch {
    result = null;
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-md border-y border-cyan-100/25 py-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">No completed session</p>
        <h2 className="mt-3 font-serif text-2xl text-white">Your card is waiting in the city.</h2>
        <p className="mt-3 text-sm leading-6 text-white/70">Finish a practice conversation first, then come back for your Vibe Pass.</p>
        <Link
          href="/practice"
          className="mt-6 inline-flex min-h-11 items-center border border-cyan-100 bg-black/35 px-5 text-sm font-bold uppercase tracking-[0.1em] text-cyan-50 shadow-[0_0_14px_rgba(0,240,255,0.24)] transition hover:bg-cyan-100 hover:text-[#102128]"
        >
          Go to practice
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <PassportCard result={result} />
      <DownloadCardButton cardId="passport-card" />
    </div>
  );
}