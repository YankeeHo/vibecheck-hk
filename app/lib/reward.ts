import { getRewardTier, type RewardTier, type Stage2PersonaId } from "./contracts";

export const rewardResultStorageKey = "vibecheck-hk:reward-result";

export type RewardCardData = {
  sessionId: string;
  personaId: Stage2PersonaId;
  persona: string;
  vibeScore: number;
  rarity: RewardTier;
  feedback: string;
  unlockedIdiom: string;
  toneTip: string;
};

const rewardCardImages: Record<Stage2PersonaId, Record<RewardTier, string>> = {
  "auntie-sam": {
    SR: "/image/stage3/auntieSR.jpeg",
    S: "/image/stage3/auntieS.jpeg",
    R: "/image/stage3/auntieR.jpeg",
  },
  "brother-sing": {
    SR: "/image/stage3/brotherSR.jpeg",
    S: "/image/stage3/brotherS.jpeg",
    R: "/image/stage3/brotherR.jpeg",
  },
  "uncle-cheong": {
    SR: "/image/stage3/uncleSR.png",
    S: "/image/stage3/uncleS.png",
    R: "/image/stage3/uncleR.jpeg",
  },
};

export function getRewardCardImage(personaId: Stage2PersonaId, rarity: RewardTier) {
  return rewardCardImages[personaId][rarity];
}

export function isRewardCardData(value: unknown): value is RewardCardData {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;

  return (
    typeof result.sessionId === "string" &&
    (result.personaId === "auntie-sam" || result.personaId === "brother-sing" || result.personaId === "uncle-cheong") &&
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