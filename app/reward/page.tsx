import { StageNavigator } from "../components/StageNavigator";
import { RewardStage } from "../components/RewardStage";

export default function RewardPage() {
  return (
    <main className="reward-screen min-h-screen px-5 py-8 pb-28 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-cyan-100/25 pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">Stage 3 · The keepsake</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">Your Hong Kong Vibe Pass</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">A record of the wisdom you carried through the conversation.</p>
        </header>
        <RewardStage />
      </div>
      <StageNavigator currentStage="Reward" />
    </main>
  );
}
