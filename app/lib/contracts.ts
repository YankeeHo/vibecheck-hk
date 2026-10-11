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

export const stage2IdiomsByPersona = {
  "uncle-cheong": [
    {
      cantonese: "慢工出細貨",
      meaning: "Careful work produces quality goods.",
      context: "Neon-sign craftsmanship, the choice between a rushed MVP and durable work.",
    },
    {
      cantonese: "針無兩頭利",
      meaning: "A needle cannot be sharp at both ends; every choice has a trade-off.",
      context: "Balancing low cost, speed, and quality in a neon-sign commission.",
    },
    {
      cantonese: "贏咗粒糖，輸咗間廠",
      meaning: "Winning a small prize but losing the whole factory is a bad bargain.",
      context: "Short-term competition or a quick win that sacrifices a craft workshop's future.",
    },
  ],
  "brother-sing": [
    {
      cantonese: "過咗海就係神仙",
      meaning: "People can seem transformed after crossing the harbour and reaching the other side.",
      context: "A red-minibus driver's cross-harbour route and the way people change their attitude after getting what they wanted.",
    },
    {
      cantonese: "阿崩叫狗——越叫越走",
      meaning: "The more you call after someone, the further they may run away.",
      context: "A streetwise lesson about pressure, micromanagement, and people avoiding a nagging workplace.",
    },
    {
      cantonese: "邊有咁大隻蛤乸隨街跳",
      meaning: "A deal that sounds too good to be true is unlikely to be real.",
      context: "Street scams and modern crypto schemes that promise effortless riches.",
    },
    {
      cantonese: "水過鴨背",
      meaning: "Like water off a duck's back, words can fail to leave an impression.",
      context: "Workplace criticism, detachment, and knowing when not to let every comment stick.",
    },
  ],
  "auntie-sam": [
    {
      cantonese: "食過下夜粥",
      meaning: "Someone has put in real practice and knows their craft or martial arts.",
      context: "Kowloon Walled City martial-arts schools, late-night training, and building a side hustle through practice.",
    },
    {
      cantonese: "好天搵埋落雨柴",
      meaning: "Gather firewood while the weather is good; prepare before hardship comes.",
      context: "Rainy-day savings, risk planning, and looking after neighbours before a crisis.",
    },
    {
      cantonese: "陰功",
      meaning: "An expression of pity and compassion for someone in a difficult situation.",
      context: "A tea-shop owner's empathy, community care, and the safety net neighbours create for one another.",
    },
  ],
} as const;

export type Stage2PersonaId = keyof typeof stage2IdiomsByPersona;
export type Stage2Idiom = (typeof stage2IdiomsByPersona)[Stage2PersonaId][number];

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
