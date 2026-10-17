import { getRewardTier, type RewardTier } from "./contracts";

export const rewardResultStorageKey = "vibecheck-hk:reward-result";

export type RewardCardData = {
  sessionId: string;
  persona: string;
  vibeScore: number;
  rarity: RewardTier;
  feedback: string;
  unlockedIdiom: string;
  toneTip: string;
};

export function isRewardCardData(value: unknown): value is RewardCardData {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;

  return (
    typeof result.sessionId === "string" &&
    typeof result.persona === "string" &&
    typeof result.vibeScore === "number" &&
    Number.isInteger(result.vibeScore) &&
    result.vibeScore >= 1 &&
    result.vibeScore <= 5 &&
    result.rarity === getRewardTier(result.vibeScore) &&
    typeof result.feedback === "string" &&
    typeof result.unlockedIdiom === "string" &&
    typeof result.toneTip === "string"
  );
}