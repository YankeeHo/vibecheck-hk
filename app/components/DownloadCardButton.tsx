"use client";

import { useState } from "react";

type DownloadCardButtonProps = {
  cardId: string;
};

export function DownloadCardButton({ cardId }: DownloadCardButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const downloadCard = async () => {
    setError("");
    const card = document.getElementById(cardId);
    if (!card) {
      setError("The reward card could not be found. Refresh the page and try again.");
      return;
    }

    setIsDownloading(true);

    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(card, {
        backgroundColor: null,
        height: 520,
        scale: 2,
        width: 360,
        windowHeight: 520,
        windowWidth: 360,
      });
      const anchor = document.createElement("a");
      anchor.download = "vibecheck-hk-reward-card.png";
      anchor.href = canvas.toDataURL("image/png");
      anchor.click();
    } catch {
      setError("The card image could not be created. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => void downloadCard()}
        disabled={isDownloading}
        className="inline-flex min-h-11 items-center gap-2 border border-[#17201d] bg-[#17201d] px-5 text-sm font-bold uppercase tracking-[0.12em] text-[#f2e9d5] transition hover:bg-[#35453b] disabled:cursor-wait disabled:opacity-60"
      >
        <span aria-hidden="true">↓</span>
        {isDownloading ? "Preparing card…" : "Download PNG"}
      </button>
      {error && <p className="max-w-sm text-center text-sm text-rose-800" role="alert">{error}</p>}
    </div>
  );
}