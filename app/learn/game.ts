import type { ProverbInput } from "../lib/contracts";

export type Proverb = ProverbInput & {
  jyutping: string;
  scene: string;
  prompt: string;
  explanation: string;
  toneTip: string;
  trap: string;
  memeTop: string;
  memeBottom: string;
  symbol: string;
  audio: string;
};
export type Card = { id: string; proverbId: string };
export type Answer = {
  proverbId: string;
  selectedId: string;
  correct: boolean;
};
export type GameState = {
  quizIndex: number;
  answers: Answer[];
  reviewed: number;
  phase:
    | "ready"
    | "playing"
    | "matched"
    | "question"
    | "feedback"
    | "phonetics"
    | "complete";
  deck: Proverb[];
  cards: Card[];
  flipped: string[];
  matched: string[];
  moves: number;
  xp: number;
  startedAt: number | null;
  finishedAt: number | null;
  mismatchUntil: number | null;
};
export const initialState: GameState = {
  quizIndex: 0,
  answers: [],
  reviewed: 0,
  phase: "ready",
  deck: [],
  cards: [],
  flipped: [],
  matched: [],
  moves: 0,
  xp: 0,
  startedAt: null,
  finishedAt: null,
  mismatchUntil: null,
};
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function createCards(deck: Proverb[]): Card[] {
  return shuffle(
    deck.flatMap((p) =>
      [0, 1].map((copy) => ({
        id: `${p.proverbId}-${copy}`,
        proverbId: p.proverbId,
      })),
    ),
  );
}
export type Action =
  | { type: "START"; deck: Proverb[]; cards: Card[] }
  | { type: "FLIP"; id: string; now: number }
  | { type: "HIDE_MISMATCH"; now: number }
  | { type: "BEGIN_QUIZ" }
  | { type: "ANSWER"; id: string }
  | { type: "NEXT_QUESTION" }
  | { type: "REVIEW_TONE" };
export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START": {
      const ids = new Set(action.deck.map((p) => p.proverbId));
      if (
        ids.size !== 8 ||
        action.deck.length !== 8 ||
        action.cards.length !== 16 ||
        new Set(action.cards.map((c) => c.id)).size !== 16 ||
        action.cards.some((c) => !ids.has(c.proverbId)) ||
        action.deck.some(
          (p) =>
            action.cards.filter((c) => c.proverbId === p.proverbId).length !==
            2,
        )
      )
        return state;
      return {
        ...initialState,
        phase: "playing",
        deck: action.deck,
        cards: action.cards,
      };
    }
    case "FLIP": {
      const card = state.cards.find((c) => c.id === action.id);
      if (
        state.phase !== "playing" ||
        !card ||
        state.mismatchUntil !== null ||
        state.matched.includes(card.proverbId) ||
        state.flipped.includes(card.id)
      )
        return state;
      const startedAt = state.startedAt ?? action.now;
      if (state.flipped.length === 0)
        return { ...state, startedAt, flipped: [card.id] };
      const first = state.cards.find((c) => c.id === state.flipped[0])!;
      const moves = state.moves + 1;
      if (first.proverbId !== card.proverbId)
        return {
          ...state,
          startedAt,
          moves,
          flipped: [first.id, card.id],
          mismatchUntil: action.now + 1000,
        };
      const matched = [...state.matched, card.proverbId];
      const complete = matched.length === state.deck.length;
      return {
        ...state,
        startedAt,
        moves,
        matched,
        flipped: [],
        xp: matched.length * 5,
        phase: complete ? "matched" : "playing",
        finishedAt: complete ? action.now : null,
      };
    }
    case "BEGIN_QUIZ":
      return state.phase === "matched"
        ? { ...state, phase: "question" }
        : state;
    case "ANSWER": {
      if (
        state.phase !== "question" ||
        !state.deck.slice(0, 3).some((p) => p.proverbId === action.id)
      )
        return state;
      const proverbId = state.deck[state.quizIndex].proverbId;
      const correct = proverbId === action.id;
      return {
        ...state,
        phase: "feedback",
        xp: state.xp + (correct ? 15 : 0),
        answers: [
          ...state.answers,
          { proverbId, selectedId: action.id, correct },
        ],
      };
    }
    case "NEXT_QUESTION":
      return state.phase !== "feedback"
        ? state
        : state.quizIndex < 2
          ? { ...state, phase: "question", quizIndex: state.quizIndex + 1 }
          : { ...state, phase: "phonetics" };
    case "REVIEW_TONE":
      return state.phase !== "phonetics"
        ? state
        : {
            ...state,
            reviewed: state.reviewed + 1,
            phase: state.reviewed === 2 ? "complete" : "phonetics",
            xp: state.xp + 5,
          };
    case "HIDE_MISMATCH":
      return state.mismatchUntil !== null && action.now >= state.mismatchUntil
        ? { ...state, flipped: [], mismatchUntil: null }
        : state;
  }
}
export const STORAGE_KEY = "vibecheck.stage1.v1";
export type Stage1Result = {
  version: 3;
  mode: "pairs-quiz-tones";
  proverb: ProverbInput;
  xp: number;
  answers: Answer[];
  reviewed: number;
  matchedIds: string[];
  moves: number;
};
function contract(p: Proverb): ProverbInput {
  const {
    proverbId,
    title,
    cantonese,
    literalMeaning,
    memeTranslation,
    persona,
    context,
  } = p;
  return {
    proverbId,
    title,
    cantonese,
    literalMeaning,
    memeTranslation,
    persona,
    context,
  };
}
export function makeResult(
  state: GameState,
  selectedId: string,
): Stage1Result | null {
  const p = state.deck.find((p) => p.proverbId === selectedId);
  return state.phase === "complete" && p
    ? {
        version: 3,
        mode: "pairs-quiz-tones",
        proverb: contract(p),
        xp: state.xp,
        answers: state.answers,
        reviewed: state.reviewed,
        matchedIds: state.matched,
        moves: state.moves,
      }
    : null;
}
/** Local demo progress only. Canonical text and persona always come from our catalog. */
export function parseResult(
  raw: string | null,
  catalog: Proverb[],
): Stage1Result | null {
  try {
    if (!raw) return null;
    const value = JSON.parse(raw);
    const p = catalog.find((p) => p.proverbId === value?.proverb?.proverbId);
    if (
      !p ||
      value.version !== 3 ||
      value.mode !== "pairs-quiz-tones" ||
      value.reviewed !== 3 ||
      !Array.isArray(value.answers) ||
      value.answers.length !== 3 ||
      !Number.isSafeInteger(value.moves) ||
      value.moves < 8 ||
      !Array.isArray(value.matchedIds) ||
      value.matchedIds.length !== 8 ||
      new Set(value.matchedIds).size !== 8 ||
      !value.matchedIds.includes(p.proverbId) ||
      value.matchedIds.some(
        (id: unknown) => !catalog.some((p) => p.proverbId === id),
      )
    )
      return null;
    const seen = new Set<string>();
    const answers: Answer[] = [];
    for (const a of value.answers) {
      if (
        !a ||
        seen.has(a.proverbId) ||
        !value.matchedIds.includes(a.proverbId) ||
        !value.answers.some((x: Answer) => x?.proverbId === a.selectedId)
      )
        return null;
      seen.add(a.proverbId);
      answers.push({
        proverbId: a.proverbId,
        selectedId: a.selectedId,
        correct: a.proverbId === a.selectedId,
      });
    }
    const xp = 55 + answers.filter((a) => a.correct).length * 15;
    if (value.xp !== xp) return null;
    return {
      version: 3,
      mode: "pairs-quiz-tones",
      proverb: contract(p),
      xp,
      answers,
      reviewed: 3,
      matchedIds: value.matchedIds,
      moves: value.moves,
    };
  } catch {
    return null;
  }
}
