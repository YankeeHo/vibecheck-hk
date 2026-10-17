import Image from "next/image";
import type { RewardCardData } from "../lib/reward";
import { getRewardCardImage } from "../lib/reward";

type PassportCardProps = {
  result: RewardCardData;
};

export function PassportCard({ result }: PassportCardProps) {
  return (
    <figure
      id="passport-card"
      className="relative aspect-[3/4] w-full max-w-sm overflow-hidden shadow-[0_18px_38px_rgba(0,0,0,0.4)]"
      aria-label={`Reward card featuring ${result.persona}`}
    >
      <Image
        src={getRewardCardImage(result.personaId, result.rarity)}
        alt={`${result.rarity} reward card featuring ${result.persona}`}
        fill
        sizes="(max-width: 420px) calc(100vw - 40px), 384px"
        className="object-contain"
      />
      {result.feedback && (
        <figcaption
          lang="yue"
          className="absolute inset-x-[7%] bottom-[6%] z-10 border border-[#f2d17b] bg-[#101214]/90 px-3 py-2 text-center text-xs leading-relaxed text-[#fff0bd] shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
        >
          <span className="mr-1 font-bold">對話評語：</span>
          {result.feedback}
        </figcaption>
      )}
    </figure>
  );
}