import Link from "next/link";
import { StageNavigator } from "../components/StageNavigator";
// Reward page screen
export default function RewardPage() {
  return (
    <main className="min-h-screen bg-[#0D0D12] px-5 py-8 pb-24 text-white">
      <div className="mx-auto max-w-4xl rounded-[30px] border border-pink-400/30 bg-[linear-gradient(135deg,rgba(255,46,147,0.1),rgba(17,17,23,0.96)_48%,rgba(0,240,255,0.08))] p-8 shadow-[0_0_30px_rgba(255,46,147,0.1)]">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-pink-200">Stage 3</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] text-white">Reward</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
          This stage will render the final passport card and rarity tier based on the practice result.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-[#FF2E93] to-[#00F0FF] px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#0D0D12] shadow-[0_0_20px_rgba(255,46,147,0.2)]"
        >
          Back to home
        </Link>
      </div>
      <StageNavigator currentStage="Reward" />
    </main>
  );
}
