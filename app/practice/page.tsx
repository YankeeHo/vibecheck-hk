import Link from "next/link";
import { PracticeChat } from "../components/PracticeChat";
import { StageNavigator } from "../components/StageNavigator";
// Practice page screen
export default function PracticePage() {
  return (
    <main className="practice-screen min-h-screen pb-24 text-white">
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-10">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-100/80">
              Kowloon · after dark
            </p>
            <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              A conversation on the way
            </h1>
          </div>

          <Link
            href="/"
            className="inline-flex shrink-0 items-center justify-center border border-white/25 bg-black/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md transition hover:border-cyan-200 hover:bg-black/50"
          >
            Back home
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center pb-8">
          <PracticeChat />
        </div>
      </div>
      <StageNavigator currentStage="Practice" />
    </main>
  );
}
