"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import catalog from "../data/proverbs.json";
import {
  createCards,
  gameReducer,
  initialState,
  makeResult,
  shuffle,
  STORAGE_KEY,
  type Proverb,
} from "./game";
import LearningPhases from "./LearningPhases";
import MemeArt from "./MemeArt";
import styles from "./memory.module.css";

const proverbs = catalog as Proverb[];
const preview = Array.from({ length: 16 }, (_, i) => ({
  id: `preview-${i}`,
  proverbId: "",
}));
const names: Record<string, string> = {
  "Uncle Cheong": "昌叔",
  "Brother Sing": "勝哥",
  "Auntie Sam": "三姑",
};
function duration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
export default function MemoryMatch() {
  const router = useRouter();
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("撳「開始遊戲」，搵出八對相同金句。");
  const [audioError, setAudioError] = useState("");
  const heading = useRef<HTMLHeadingElement | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const selected = state.deck.find((p) => p.proverbId === selectedId);
  const cards = state.phase === "ready" ? preview : state.cards;

  useEffect(() => {
    if (state.mismatchUntil === null) return;
    const timer = window.setTimeout(
      () => dispatch({ type: "HIDE_MISMATCH", now: Date.now() }),
      Math.max(0, state.mismatchUntil - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [state.mismatchUntil]);
  useEffect(() => {
    if (state.startedAt === null || state.phase !== "playing") return;
    const start = state.startedAt;
    const timer = window.setInterval(() => setElapsed(Date.now() - start), 250);
    return () => window.clearInterval(timer);
  }, [state.startedAt, state.phase]);
  useEffect(
    () => () => {
      audio.current?.pause();
    },
    [],
  );

  useEffect(() => {
    if (
      ["question", "feedback", "phonetics", "complete"].includes(state.phase)
    ) {
      heading.current?.focus();
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [state.phase, state.reviewed, state.quizIndex]);

  function play(p: Proverb) {
    audio.current?.pause();
    setAudioError("");
    if (muted) return;
    const next = new Audio(p.audio);
    audio.current = next;
    void next.play().catch(() => {
      if (audio.current === next)
        setAudioError("音訊暫時未能播放，請再試；下方亦有粵拼。");
    });
  }
  function start() {
    audio.current?.pause();
    audio.current = null;
    const deck = shuffle(proverbs).slice(0, 8);
    dispatch({ type: "START", deck, cards: createCards(deck) });
    setSelectedId("");
    setElapsed(0);
    setAudioError("");
    setMessage("每次翻兩張。相同就留低，唔同就蓋返。");
  }
  function flip(id: string, now: number) {
    const next = gameReducer(state, { type: "FLIP", id, now });
    if (next === state) return;
    dispatch({ type: "FLIP", id, now });
    if (next.matched.length > state.matched.length) {
      const p = state.deck.find((p) => p.proverbId === next.matched.at(-1))!;
      setSelectedId(p.proverbId);
      play(p);
      setMessage(
        next.phase === "matched"
          ? "Phase A 完成！接住進入 Phase B 情境填空。"
          : `配對成功：${p.title}，加 5 XP！`,
      );
    } else if (next.mismatchUntil !== null)
      setMessage("呢兩張唔同，一秒後蓋返。記住佢哋嘅位置！");
    else setMessage("已翻開一張，搵出另一張相同嘅金句。");
  }
  function handoff() {
    const result = makeResult(state, selectedId);
    if (!result) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      audio.current?.pause();
      router.push("/practice?from=learn");
    } catch {
      setMessage("未能儲存進度，請允許瀏覽器儲存資料後再試。");
    }
  }
  const time =
    state.finishedAt !== null && state.startedAt !== null
      ? state.finishedAt - state.startedAt
      : elapsed;
  const isBoard = ["ready", "playing", "matched"].includes(state.phase);
  const activePhase = isBoard
    ? 0
    : ["question", "feedback"].includes(state.phase)
      ? 1
      : 2;
  return (
    <main className={styles.page} lang="zh-HK">
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span>港</span> VIBECHECK
        </Link>
        <span className={styles.stage}>STAGE 01 · MEMORY MATCH</span>
        <button
          className={styles.quiet}
          onClick={() => {
            audio.current?.pause();
            setMuted(!muted);
          }}
          aria-pressed={muted}
        >
          {muted ? "音效：關" : "音效：開"}
        </button>
      </header>
      <div className={styles.titleRow}>
        <div>
          <p className={styles.eyebrow}>翻一張，記一張。</p>
          <h1 ref={heading} tabIndex={-1}>
            港式金句
            <span>
              {
                [
                  "配對記憶",
                  "情境填空",
                  state.phase === "complete" ? "完成挑戰" : "音韻解鎖",
                ][activePhase]
              }
            </span>
          </h1>
          <p className={styles.subtitle}>
            翻牌配對 → 情境填空 → 音韻解鎖 · 最高 100 XP
          </p>
        </div>
        <button className={styles.start} onClick={start}>
          {state.phase === "ready" ? "開始遊戲 ↗" : "重新洗牌 ↻"}
        </button>
      </div>
      <ol className={styles.phaseSteps} aria-label="Stage 1 學習進度">
        {["A · 翻牌配對", "B · 情境填空", "C · 音韻解鎖"].map((name, i) => (
          <li
            key={name}
            aria-current={activePhase === i ? "step" : undefined}
            className={activePhase === i ? styles.activeStep : ""}
          >
            {i < activePhase || state.phase === "complete" ? "✓ " : ""}
            {name}
          </li>
        ))}
      </ol>
      {!isBoard && (
        <LearningPhases
          state={state}
          dispatch={dispatch}
          play={play}
          muted={muted}
          audioError={audioError}
          selectedId={selectedId}
          select={setSelectedId}
          handoff={handoff}
          message={message}
        />
      )}
      {isBoard && (
        <div className={styles.layout}>
          <section className={styles.table} aria-label="翻牌配對遊戲">
            <div className={styles.stats}>
              <div>
                <span>配對</span>
                <strong>
                  {state.matched.length}
                  <small> / 8</small>
                </strong>
              </div>
              <div>
                <span>翻牌次數</span>
                <strong>{state.moves}</strong>
              </div>
              <div>
                <span>用時</span>
                <strong>{duration(time)}</strong>
              </div>
              <div>
                <span>VIBE XP</span>
                <strong className={styles.pink}>{state.xp}</strong>
              </div>
            </div>
            <div className={styles.board}>
              {cards.map((card, i) => {
                const p = state.deck.find(
                  (p) => p.proverbId === card.proverbId,
                );
                const matched = state.matched.includes(card.proverbId);
                const visible = matched || state.flipped.includes(card.id);
                return (
                  <button
                    key={card.id}
                    className={`${styles.card} ${visible ? styles.flipped : ""} ${matched ? styles.matched : ""}`}
                    aria-label={
                      visible
                        ? `第 ${i + 1} 張：${p?.title}${matched ? "，已配對，查看解說" : "，已翻開"}`
                        : `翻開第 ${i + 1} 張卡`
                    }
                    aria-pressed={visible}
                    disabled={
                      state.phase === "ready" ||
                      (!matched && (state.mismatchUntil !== null || visible))
                    }
                    onClick={() => {
                      if (matched && p) {
                        setSelectedId(p.proverbId);
                        play(p);
                      } else flip(card.id, Date.now());
                    }}
                  >
                    <span className={styles.cardInner}>
                      <span className={styles.back} aria-hidden="true">
                        <span className={styles.backSeal}>
                          港<span>VIBE</span>
                        </span>
                      </span>
                      <span className={styles.front} aria-hidden="true">
                        <span className={styles.corner}>
                          {p ? proverbs.indexOf(p) + 1 : ""}
                          <span>✦</span>
                        </span>
                        {p && (
                          <>
                            <MemeArt symbol={p.symbol} className={styles.art} />
                            <strong>{p.title}</strong>
                          </>
                        )}
                        <span className={styles.cardFoot}>
                          {matched ? "✓ 已配對" : "HONG KONG"}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className={styles.status} role="status">
              {message}
            </p>
          </section>
          <aside className={styles.side}>
            {state.phase === "matched" && (
              <section className={styles.win}>
                <span>✦ PHASE A COMPLETE</span>
                <h2>全部搵到！</h2>
                <p>
                  {state.moves} 次翻牌 · {duration(time)}
                  <br />8 對 × 5 XP = 40 XP
                </p>
                <button
                  className={styles.start}
                  onClick={() => {
                    audio.current?.pause();
                    setAudioError("");
                    dispatch({ type: "BEGIN_QUIZ" });
                  }}
                >
                  進入 Phase B · 情境填空 →
                </button>
                <p>下一步：用啱啱學過嘅金句完成三題生活情境。</p>
              </section>
            )}
            <section className={styles.lesson}>
              <p className={styles.eyebrow}>
                金句收藏 / {state.matched.length.toString().padStart(2, "0")}
              </p>
              {selected ? (
                <>
                  <span className={styles.persona}>
                    {names[selected.persona]}嘅街坊智慧
                  </span>
                  <h2>{selected.title}</h2>
                  <p className={styles.jyutping}>{selected.jyutping}</p>
                  <button
                    className={styles.listen}
                    onClick={() => play(selected)}
                    disabled={muted}
                  >
                    ▷ 聽粵語
                  </button>
                  <p>{selected.literalMeaning}</p>
                  <blockquote>{selected.memeTranslation}</blockquote>
                  <details>
                    <summary>聲調與諧音提示</summary>
                    <p>{selected.toneTip}</p>
                    <p>{selected.trap}</p>
                  </details>
                  <p className={styles.error} role="status">
                    {audioError}
                  </p>
                </>
              ) : (
                <div className={styles.empty}>
                  <span>✦</span>
                  <h2>配對，解鎖街坊智慧。</h2>
                  <p>每搵到一對，就解鎖一句金句嘅意思同粵語讀音。</p>
                  <p>冇倒數壓力，慢慢記住每張卡嘅位置。</p>
                </div>
              )}
            </section>
            <section className={styles.rules}>
              <h2>玩法就係咁簡單</h2>
              <ol>
                <li>撳兩張卡，翻開睇吓。</li>
                <li>相同金句：配對成功，留喺枱面。</li>
                <li>唔同金句：一秒後蓋返，再搵。</li>
                <li>搵齊八對，進入 Phase B！</li>
              </ol>
              <p>每翻開第二張計一次。已配對嘅卡可以再撳嚟重溫。</p>
            </section>
          </aside>
        </div>
      )}
      <footer className={styles.footer}>
        OLD WISDOM. GOOD MEMORY. <span>香港嘅故事，由你接落去。</span>
      </footer>
    </main>
  );
}
