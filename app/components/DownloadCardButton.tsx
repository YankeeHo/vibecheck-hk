"use client";

import { useState } from "react";
import html2canvas from "html2canvas";

type DownloadCardButtonProps = {
  targetId: string;
};

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("The browser could not create a PNG image."));
      }
    }, "image/png");
  });
}

export default function DownloadCardButton({
  targetId,
}: DownloadCardButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function downloadCard() {
    setError(null);
    const card = document.getElementById(targetId);

    if (!card) {
      setError("The passport card could not be found.");
      return;
    }

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(card, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
      });
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "vibe-city-passport.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      console.error("Could not export the passport card.", cause);
      setError("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="download-card">
      <button
        className="download-card__button"
        type="button"
        onClick={downloadCard}
        disabled={isDownloading}
      >
        {isDownloading ? "Preparing image…" : "Download passport"}
      </button>
      {error ? (
        <p className="download-card__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
