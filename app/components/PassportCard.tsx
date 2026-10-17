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
      aria-label={`${result.rarity} reward card for ${result.persona}`}
    >
      <Image
        src={getRewardCardImage(result.personaId, result.rarity)}
        alt={`${result.rarity} reward card featuring ${result.persona}`}
        fill
        sizes="(max-width: 420px) calc(100vw - 40px), 384px"
        className="object-contain"
      />
      <span
        aria-hidden="true"
        className="absolute right-[5%] top-[5%] z-10 grid aspect-square w-[22%] place-items-center border-2 border-[#f2d17b] bg-[#101214]/95 font-serif text-lg font-bold text-[#fff0bd] shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
      >
        {result.rarity}
      </span>
    </figure>
  );
}