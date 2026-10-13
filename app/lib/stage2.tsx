// persona data, storyboard helpers, and idiom highlighting.
import { stage2IdiomsByPersona, type Stage2PersonaId } from "./contracts";

export type Stage2Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type Stage2RoleplayPersona = {
  id: Stage2PersonaId;
  name: string;
  title: string;
  era: string;
  setting: string;
  heritage: string;
  conflict: string;
  accent: string;
  badge: string;
  intro: string;
  avatar: string;
  background: string;
  soundtrack: string;
};

export type Stage2Evaluation = {
  status: "COMPLETED";
  vibe_score: number;
  card_rarity: "SSR" | "SR" | "N";
  evaluator_feedback: string;
  unlocked_idiom: string;
  phonetic_tone_tip: string;
};

export const personas: Stage2RoleplayPersona[] = [
  {
    id: "uncle-cheong",
    name: "Uncle Cheong",
    title: "霓虹燈牌師傅",
    era: "1980s",
    setting: "深水埗",
    heritage: "屈管、氬氣焊接、北魏體書法",
    conflict: "Agile MVP vs. 匠人精神",
    accent: "from-[#00F0FF] to-cyan-300",
    badge: "craftsman",
    intro: "慢工出細貨，做野要落手落腳，唔好急住搶晒成個夜市。",
    avatar: "/image/stage2/uncle-cheong_avatar.jpg",
    background: "/image/stage2/uncle-cheong_background.jpg",
    soundtrack: "/audio/stage2/uncle-cheong_background.mp3",
  },
  {
    id: "brother-sing",
    name: "Brother Sing",
    title: "紅頭小巴司機",
    era: "1970s",
    setting: "旺角／紅磡",
    heritage: "手寫小巴牌、紅隧通車、獅子山拼搏",
    conflict: "Quiet Quitting vs. 市井智慧",
    accent: "from-[#FF2E93] to-pink-400",
    badge: "streetwise",
    intro: "返工hea唔代表唔識做人，揸小巴見得多，知條路點走最重要。",
    avatar: "/image/stage2/brother-sing_avatar.jpg",
    background: "/image/stage2/brother-sing_background.jpg",
    soundtrack: "/audio/stage2/brother-sing_background.mp3",
  },
  {
    id: "auntie-sam",
    name: "Auntie Sam",
    title: "涼茶舖老闆娘",
    era: "1960s",
    setting: "九龍城寨",
    heritage: "二十四味、武館夜粥、鄰里互助",
    conflict: "FIRE vs. 城寨安全感",
    accent: "from-[#00F0FF] via-cyan-300 to-[#FF2E93]",
    badge: "community",
    intro: "食過下夜粥，先知點樣留住人情。要顧住自己，亦要顧住晒成個街。",
    avatar: "/image/stage2/auntie-sam_avatar.jpg",
    background: "/image/stage2/auntie-sam_background.jpg",
    soundtrack: "/audio/stage2/auntie-sam_background.mp3",
  },
];

export const openingHooks: Record<Stage2PersonaId, string> = {
  "uncle-cheong": "我係昌叔，喺深水埗整霓虹燈牌。如果你趕住交貨，你會先求快，定係先做好每條屈管？",
  "brother-sing": "我係勝哥，旺角揸紅頭小巴。返工想靜靜雞hea下，又怕甩底，你覺得點先叫識做？",
  "auntie-sam": "我係三姑，喺城寨開涼茶舖。想早啲退休追自由，又想照應街坊，你會點樣兩邊兼顧？",
};

export const stage2Missions: Record<
  Stage2PersonaId,
  { label: string; proverbChunks: string[]; separator: string; suffix: string }
> = {
  "uncle-cheong": {
    label: "解鎖昌叔的匠人密碼",
    proverbChunks: ["贏咗", "粒糖"],
    separator: "，",
    suffix: "輸咗間廠",
  },
  "brother-sing": {
    label: "解鎖勝哥的街頭智慧",
    proverbChunks: ["邊有咁大隻", "蛤乸"],
    separator: "",
    suffix: "隨街跳",
  },
  "auntie-sam": {
    label: "解鎖三姑的鄰里智慧",
    proverbChunks: ["好天", "搵埋"],
    separator: "",
    suffix: "落雨柴",
  },
};

export function getMysteryProverb(personaId: Stage2PersonaId, round: number) {
  const { proverbChunks, separator, suffix } = stage2Missions[personaId];
  let prefix = "";
  let isConcealed = false;

  proverbChunks.forEach((chunk, index) => {
    if (round >= index + 2) {
      prefix += chunk;
      isConcealed = false;
    } else if (!isConcealed) {
      prefix += "????";
      isConcealed = true;
    }
  });

  return `『${prefix}${separator}${suffix}』`;
}

export function highlightIdioms(text: string, personaId: Stage2PersonaId, isUserMessage = false) {
  const idioms = stage2IdiomsByPersona[personaId].map(({ cantonese }) => cantonese);
  const idiomSet = new Set<string>(idioms);
  const pattern = new RegExp(`(${[...idioms].sort((left, right) => right.length - left.length).join("|")})`, "g");

  return text.split(pattern).map((segment, index) =>
    idiomSet.has(segment) ? (
      <strong
        key={`idiom-${index}`}
        className={
          isUserMessage
            ? "font-extrabold text-[#102128] underline decoration-amber-700"
            : "font-extrabold text-amber-300"
        }
      >
        {segment}
      </strong>
    ) : (
      segment
    ),
  );
}

export function createStarterMessages(personaId: Stage2PersonaId): Stage2Message[] {
  return [{ id: "assistant-1", role: "assistant", text: openingHooks[personaId] }];
}
