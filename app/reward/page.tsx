import Link from "next/link";

export default function RewardPage() {
  return (
    <main className="min-h-screen bg-[#0b1020] px-5 py-8 text-white">
      <div className="mx-auto max-w-4xl rounded-[30px] border border-amber-400/30 bg-amber-500/10 p-8 shadow-[0_0_30px_rgba(251,191,36,0.12)]">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-amber-200">Stage 3</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] text-white">Reward</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
          This stage will render the final passport card and rarity tier based on the practice result.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-amber-300 to-orange-500 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-950"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
