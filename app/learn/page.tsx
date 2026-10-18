import type { Metadata } from "next";
import MemoryMatch from "./MemoryMatch";
export const metadata: Metadata = {
  title: "Vibe Memory Match · VibeCheck HK",
  description: "翻開兩張卡，配對八句香港金句，解鎖粵語街坊智慧。",
};
export default function LearnPage() {
  return <MemoryMatch />;
}
