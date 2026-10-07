import Link from "next/link";
import { PracticeChat } from "../components/PracticeChat";

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-violet-400/30 bg-violet-500/10 p-5 shadow-[0_0_25px_rgba(168,85,247,0.12)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-violet-200">Stage 2</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-white sm:text-4xl">
                Practice with a Hong Kong persona
              </h1>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-100 transition hover:border-cyan-300/60 hover:text-white"
            >
              Back home
            </Link>
          </div>
        </header>

        <PracticeChat />
      </div>
    </main>
  );
}
