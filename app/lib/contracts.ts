// General types and contracts for the app
export type Persona = "Uncle Cheong" | "Brother Sing" | "Auntie Sam";
export type RewardTier = "N" | "SR" | "SSR";

export type ProverbInput = {
  proverbId: string;
  title: string;
  cantonese: string;
  literalMeaning: string;
  memeTranslation: string;
  persona: Persona;
  context: string;
};

export type PracticeResult = {
  sessionId: string;
  proverbId: string;
  persona: Persona;
  vibeScore: number;
  feedback: string;
  rarity: RewardTier;
  owner: "YK";
  status: "complete";
};

export type SharedContract = {
  stage: "Learn" | "Practice" | "Reward";
  owner: "Jerry" | "YK" | "Andy";
  purpose: string;
  fields: readonly string[];
};

export const sharedContracts: SharedContract[] = [
  {
    stage: "Learn",
    owner: "Jerry",
    purpose: "Cantonese saying selected for the lesson flow.",
    fields: [
      "proverbId",
      "title",
      "cantonese",
      "literalMeaning",
      "memeTranslation",
      "persona",
      "context",
    ],
  },
  {
    stage: "Practice",
    owner: "YK",
    purpose: "Outcome that is passed to the reward stage after the chat.",
    fields: [
      "sessionId",
      "proverbId",
      "persona",
      "vibeScore",
      "feedback",
      "rarity",
      "owner",
      "status",
    ],
  },
  {
    stage: "Reward",
    owner: "Andy",
    purpose: "Reward card rendering should only read the final practice result.",
    fields: ["sessionId", "vibeScore", "rarity", "feedback"],
  },
];

export const exampleProverbInput: ProverbInput = {
  proverbId: "HK-02",
  title: "過咗海就係神仙",
  cantonese: "過咗海就係神仙",
  literalMeaning: "Once you cross the sea, you become a god.",
  memeTranslation: "After you survive the chaos and adapt, everyone suddenly respects your hustle.",
  persona: "Brother Sing",
  context: "A red minibus driver uses the proverb to explain why people only admire results after the hard part is over.",
};

export const examplePracticeResult: PracticeResult = {
  sessionId: "session-004",
  proverbId: "HK-02",
  persona: "Brother Sing",
  vibeScore: 4.5,
  feedback: "Your reply felt practical, vivid, and very Hong Kong. It landed the modern hustle joke without losing the proverb's lesson.",
  rarity: "SR",
  owner: "YK",
  status: "complete",
};
