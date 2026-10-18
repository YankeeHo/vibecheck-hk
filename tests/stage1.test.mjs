import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  gameReducer,
  initialState,
  createCards,
  makeResult,
  parseResult,
  shuffle,
} from "../app/learn/game.ts";
const catalog = JSON.parse(
  fs.readFileSync(new URL("../app/data/proverbs.json", import.meta.url)),
);
const deck = catalog.slice(0, 8);
const start = () =>
  gameReducer(initialState, { type: "START", deck, cards: createCards(deck) });
const flip = (s, id, now = 1000) => gameReducer(s, { type: "FLIP", id, now });
const pair = (s, p, now = 1000) => {
  const [a, b] = s.cards.filter((c) => c.proverbId === p.proverbId);
  return flip(flip(s, a.id, now), b.id, now + 100);
};
const finish = (s, correct = true) => {
  s = gameReducer(s, { type: "BEGIN_QUIZ" });
  for (let i = 0; i < 3; i++) {
    s = gameReducer(s, {
      type: "ANSWER",
      id: deck[correct ? i : (i + 1) % 3].proverbId,
    });
    s = gameReducer(s, { type: "NEXT_QUESTION" });
  }
  for (let i = 0; i < 3; i++) s = gameReducer(s, { type: "REVIEW_TONE" });
  return s;
};
test("board has 16 unique cards, exactly two copies of eight proverbs", () => {
  const s = start();
  assert.equal(s.cards.length, 16);
  assert.equal(new Set(s.cards.map((c) => c.id)).size, 16);
  for (const p of deck)
    assert.equal(s.cards.filter((c) => c.proverbId === p.proverbId).length, 2);
  assert.equal(s.startedAt, null);
});
test("same card cannot match itself; first flip starts timer", () => {
  const s = flip(start(), "HK-01-0", 500);
  assert.equal(s.startedAt, 500);
  assert.equal(flip(s, "HK-01-0"), s);
  assert.equal(s.moves, 0);
  assert.equal(s.xp, 0);
});
test("mismatch locks third card, stays open for one second, then hides", () => {
  let s = flip(flip(start(), "HK-01-0", 500), "HK-02-0", 600);
  assert.equal(s.moves, 1);
  assert.equal(s.flipped.length, 2);
  assert.equal(s.xp, 0);
  assert.equal(flip(s, "HK-03-0", 700), s);
  assert.equal(gameReducer(s, { type: "HIDE_MISMATCH", now: 1599 }), s);
  s = gameReducer(s, { type: "HIDE_MISMATCH", now: 1600 });
  assert.deepEqual(s.flipped, []);
  assert.equal(s.mismatchUntil, null);
  assert.equal(flip(s, "HK-03-0", 1700).flipped.length, 1);
});
test("matched pair remains matched and cannot award points twice", () => {
  const s = pair(start(), deck[0]);
  assert.deepEqual(s.matched, ["HK-01"]);
  assert.equal(s.xp, 5);
  assert.equal(s.moves, 1);
  assert.deepEqual(s.flipped, []);
  assert.equal(flip(s, "HK-01-0"), s);
  assert.equal(flip(s, "HK-01-1"), s);
});
test("all eight pairs finish Phase A only; B and C are required for 100 XP", () => {
  let s = start();
  for (const p of deck) s = pair(s, p, 1000);
  assert.equal(s.phase, "matched");
  assert.equal(s.xp, 40);
  assert.equal(makeResult(s, "HK-01"), null);
  assert.equal(s.moves, 8);
  assert.equal(s.finishedAt, 1100);
  assert.equal(flip(s, "HK-01-0", 9000), s);
  s = finish(s);
  const result = makeResult(s, "HK-01");
  assert.equal(result.version, 3);
  assert.equal(parseResult(JSON.stringify(result), catalog).xp, 100);
});
test("restart clears cards, scores, mismatches and clock; stale timeout cannot touch new game", () => {
  const old = flip(flip(start(), "HK-01-0"), "HK-02-0");
  const s = gameReducer(old, { type: "START", deck, cards: createCards(deck) });
  assert.equal(s.moves, 0);
  assert.equal(s.xp, 0);
  assert.equal(s.startedAt, null);
  assert.deepEqual(s.flipped, []);
  assert.deepEqual(s.matched, []);
  assert.equal(gameReducer(s, { type: "HIDE_MISMATCH", now: 9999 }), s);
});
test("invalid cards and malformed boards cannot change game", () => {
  const s = start();
  assert.equal(flip(s, "invalid"), s);
  assert.equal(
    gameReducer(s, {
      type: "START",
      deck: deck.slice(1),
      cards: createCards(deck),
    }),
    s,
  );
  const cards = createCards(deck);
  cards[0] = cards[1];
  assert.equal(gameReducer(s, { type: "START", deck, cards }), s);
});
test("handoff rejects incomplete game, duplicate IDs, forged XP and old format", () => {
  assert.equal(makeResult(start(), "HK-01"), null);
  let s = start();
  for (const p of deck) s = pair(s, p);
  s = finish(s);
  const result = makeResult(s, "HK-01");
  for (const bad of [
    { ...result, xp: 500 },
    { ...result, moves: 7 },
    { ...result, version: 2 },
    { ...result, reviewed: 2 },
    { ...result, answers: [] },
    { ...result, answers: Array(3).fill(result.answers[0]) },
    { ...result, matchedIds: Array(8).fill("HK-01") },
    { ...result, proverb: { proverbId: "invalid" } },
  ])
    assert.equal(parseResult(JSON.stringify(bad), catalog), null);
  assert.equal(parseResult("garbage", catalog), null);
  assert.equal(parseResult(null, catalog), null);
});
test("handoff uses canonical text and persona", () => {
  let s = start();
  for (const p of deck) s = pair(s, p);
  s = finish(s);
  const result = makeResult(s, "HK-01");
  result.proverb.title = "tampered";
  result.proverb.persona = "tampered";
  const parsed = parseResult(JSON.stringify(result), catalog);
  assert.equal(parsed.proverb.title, deck[0].title);
  assert.equal(parsed.proverb.persona, deck[0].persona);
});
test("catalog has all ten unique proverbs with available local audio", () => {
  assert.equal(catalog.length, 10);
  assert.equal(new Set(catalog.map((p) => p.proverbId)).size, 10);
  for (const p of catalog) {
    assert.ok(p.title && p.jyutping && p.toneTip);
    assert.ok(
      fs.statSync(new URL("../public" + p.audio, import.meta.url)).size > 1000,
    );
  }
});
test("shuffle preserves original list and membership", () => {
  const original = [1, 2, 3, 4];
  const result = shuffle(original, () => 0);
  assert.deepEqual(original, [1, 2, 3, 4]);
  assert.deepEqual([...result].sort(), original);
  assert.notDeepEqual(result, original);
});

test("phase gating, duplicate answers, correct feedback and incremental tone rewards", () => {
  let s = start();
  for (const action of [
    { type: "BEGIN_QUIZ" },
    { type: "ANSWER", id: "HK-01" },
    { type: "NEXT_QUESTION" },
    { type: "REVIEW_TONE" },
  ])
    assert.equal(gameReducer(s, action), s);
  for (const p of deck) s = pair(s, p);
  s = gameReducer(s, { type: "BEGIN_QUIZ" });
  assert.equal(s.phase, "question");
  assert.equal(gameReducer(s, { type: "ANSWER", id: "HK-08" }), s);
  s = gameReducer(s, { type: "ANSWER", id: "HK-01" });
  assert.equal(s.phase, "feedback");
  assert.equal(s.xp, 55);
  assert.equal(gameReducer(s, { type: "ANSWER", id: "HK-01" }), s);
  for (let i = 1; i < 3; i++) {
    s = gameReducer(s, { type: "NEXT_QUESTION" });
    s = gameReducer(s, { type: "ANSWER", id: deck[i].proverbId });
  }
  s = gameReducer(s, { type: "NEXT_QUESTION" });
  assert.equal(s.phase, "phonetics");
  assert.equal(s.xp, 85);
  assert.equal(makeResult(s, "HK-01"), null);
  for (let i = 0; i < 3; i++) s = gameReducer(s, { type: "REVIEW_TONE" });
  assert.equal(s.phase, "complete");
  assert.equal(s.xp, 100);
  assert.equal(gameReducer(s, { type: "REVIEW_TONE" }), s);
});
test("all wrong still finishes all phases at 55 XP with valid handoff", () => {
  let s = start();
  for (const p of deck) s = pair(s, p);
  s = finish(s, false);
  assert.equal(s.phase, "complete");
  assert.equal(s.xp, 55);
  assert.ok(s.answers.every((a) => !a.correct));
  assert.equal(
    parseResult(JSON.stringify(makeResult(s, "HK-01")), catalog).xp,
    55,
  );
  const reset = gameReducer(s, {
    type: "START",
    deck,
    cards: createCards(deck),
  });
  assert.deepEqual(reset.answers, []);
  assert.equal(reset.reviewed, 0);
  assert.equal(reset.quizIndex, 0);
});
