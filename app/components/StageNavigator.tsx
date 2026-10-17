import Link from "next/link";

const stages = [
  { label: "Learn", href: "/learn" },
  { label: "Practice", href: "/practice" },
  { label: "Reward", href: "/reward" },
] as const;

type StageNavigatorProps = {
  currentStage: (typeof stages)[number]["label"];
};

export function StageNavigator({ currentStage }: StageNavigatorProps) {
  const currentIndex = stages.findIndex((stage) => stage.label === currentStage);
  const previousStage = stages[currentIndex - 1];
  const nextStage = stages[currentIndex + 1];

  return (
    <nav
      aria-label="Temporary stage navigation"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit items-center gap-3 rounded-full border border-cyan-300/40 bg-[#0D0D12]/95 px-3 py-2 shadow-[0_0_20px_rgba(0,240,255,0.16)] backdrop-blur"
    >
      <span className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200">
        Temp · {currentIndex + 1}/3
      </span>
      {previousStage ? (
        <Link
          href={previousStage.href}
          className="rounded-full border border-white/20 px-3 py-2 text-xs font-bold text-white transition hover:border-cyan-300 hover:text-cyan-100"
        >
          ← Previous
        </Link>
      ) : (
        <span aria-disabled="true" className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-white/35">
          ← Previous
        </span>
      )}
      {nextStage && (
        <Link
          href={nextStage.href}
          className="rounded-full bg-cyan-300 px-3 py-2 text-xs font-bold text-[#0D0D12] transition hover:bg-cyan-200"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}