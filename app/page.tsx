import Link from "next/link";

const stages = [
  {
    id: "learn",
    number: "01",
    title: "Learn",
    subtitle: "Meme translation",
    description: "Decode the meaning behind every saying and connect it to modern Hong Kong life.",
    accent: "from-cyan-400 via-sky-500 to-indigo-500",
    border: "border-cyan-300/70",
    button: "Enter Learn",
    unlocked: true,
  },
  {
    id: "practice",
    number: "02",
    title: "Practice",
    subtitle: "AI personas",
    description: "Chat with Uncle Cheong, Brother Sing, and Auntie Sam to test your Cantonese vibe.",
    accent: "from-fuchsia-400 via-violet-500 to-purple-600",
    border: "border-violet-300/70",
    button: "Open Practice",
    unlocked: false,
  },
  {
    id: "reward",
    number: "03",
    title: "Reward",
    subtitle: "Culture passport",
    description: "Unlock a retro card and share your Hong Kong cultural streak with the world.",
    accent: "from-amber-300 via-orange-400 to-red-500",
    border: "border-amber-300/70",
    button: "View Reward",
    unlocked: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0b1020] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(244,114,182,0.16),_transparent_30%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-8 sm:px-8 lg:px-10">
        <header className="mb-8 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/60 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
                Retro neon route
              </div>

              <h1 className="text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
                VibeCheck HK
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                Learn the saying, practice the vibe, and unlock a culture passport from your Hong Kong story.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-100 shadow-[0_0_20px_rgba(217,70,239,0.28)]">
              <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-300" />
              Journey progress: 1 / 3
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-cyan-400/30 bg-[linear-gradient(135deg,rgba(6,182,212,0.14),rgba(17,24,39,0.9),rgba(76,29,149,0.2))] p-6 shadow-[0_0_40px_rgba(34,211,238,0.12)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.33em] text-cyan-200">Start here</p>
            <h2 className="mt-4 max-w-lg text-3xl font-black leading-tight tracking-[-0.05em] text-white sm:text-4xl">
              Keep the trip in order: learn first, then speak, then collect the reward.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
              This prototype guides the user through the core journey in sequence, using a clear home screen and locked progression for the later stages.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/learn"
                className="inline-flex rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.45)] transition hover:scale-[1.02]"
              >
                Start the journey
              </Link>
              <Link
                href="/practice"
                className="inline-flex rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/60 hover:text-white"
              >
                View flow
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_0_30px_rgba(168,85,247,0.1)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-200">Progress map</p>
            <div className="mt-5 space-y-4">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className={`rounded-2xl border bg-slate-900/80 p-4 ${stage.border} ${
                    stage.unlocked ? "opacity-100" : "opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stage.accent} text-sm font-black text-slate-950`}
                      >
                        {stage.number}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-300">
                          {stage.title}
                        </p>
                        <p className="mt-1 text-base font-semibold text-white">{stage.subtitle}</p>
                      </div>
                    </div>

                    {stage.unlocked ? (
                      <Link
                        href={
                          stage.id === "learn"
                            ? "/learn"
                            : stage.id === "practice"
                              ? "/practice"
                              : "/reward"
                        }
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-900 transition hover:bg-cyan-200"
                      >
                        Open
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-full border border-white/10 bg-slate-800 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-400"
                      >
                        Locked
                      </button>
                    )}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-300">{stage.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {stages.map((stage) => (
            <article
              key={stage.id}
              className={`group relative overflow-hidden rounded-[28px] border bg-slate-900/70 p-5 shadow-[0_0_25px_rgba(15,23,42,0.6)] transition hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(34,211,238,0.18)] ${
                stage.unlocked ? "border-white/10" : "border-white/5 opacity-75"
              }`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stage.accent}`} />

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                  {stage.number}
                </span>
                <span
                  className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                    stage.unlocked
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                      : "border-slate-600 bg-slate-800 text-slate-400"
                  }`}
                >
                  {stage.unlocked ? "ready" : "locked"}
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-black tracking-[-0.05em] text-white">{stage.title}</h3>
              <p className="mt-2 text-sm font-medium text-slate-300">{stage.subtitle}</p>
              <p className="mt-4 text-sm leading-7 text-slate-300">{stage.description}</p>

              {stage.unlocked ? (
                <Link
                  href={
                    stage.id === "learn"
                      ? "/learn"
                      : stage.id === "practice"
                        ? "/practice"
                        : "/reward"
                  }
                  className="mt-6 inline-flex rounded-full bg-gradient-to-r from-white to-cyan-100 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-900 transition hover:brightness-110"
                >
                  {stage.button}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-6 inline-flex cursor-not-allowed rounded-full border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-500"
                >
                  Complete previous stage
                </button>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
