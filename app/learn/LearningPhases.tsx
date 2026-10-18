import type { Dispatch } from "react";
import type { Action, GameState, Proverb } from "./game";
import styles from "./memory.module.css";

type Props = {
  state: GameState;
  dispatch: Dispatch<Action>;
  play: (p: Proverb) => void;
  muted: boolean;
  audioError: string;
  selectedId: string;
  select: (id: string) => void;
  handoff: () => void;
  message: string;
};
export default function LearningPhases({
  state,
  dispatch,
  play,
  muted,
  audioError,
  selectedId,
  select,
  handoff,
  message,
}: Props) {
  const quiz = state.deck.slice(0, 3);
  const question = quiz[state.quizIndex];
  // Card order was shuffled at the start. It supplies an independent, stable option order.
  const options = [...new Set(state.cards.map((c) => c.proverbId))]
    .filter((id) => quiz.some((p) => p.proverbId === id))
    .map((id) => quiz.find((p) => p.proverbId === id)!);
  if (state.phase === "question" || state.phase === "feedback") {
    const answered = state.answers[state.quizIndex];
    return (
      <section className={styles.flowPanel} aria-label="Phase B 情境填空">
        <p className={styles.eyebrow}>
          PHASE B · 情境填空 · {state.quizIndex + 1} / 3
        </p>
        <h2>放返入今日嘅生活。</h2>
        <p className={styles.subtitle}>
          從啱啱配對嘅金句抽三句，每題揀一句填入空格。
        </p>
        <div className={styles.chatScene}>
          <span>{question.scene}</span>
          <p>{question.prompt}</p>
        </div>
        <div className={styles.options}>
          {options.map((p, i) => (
            <button
              key={p.proverbId}
              className={`${styles.option} ${answered && p.proverbId === question.proverbId ? styles.correct : ""} ${answered && p.proverbId === answered.selectedId && !answered.correct ? styles.incorrect : ""}`}
              disabled={state.phase === "feedback"}
              onClick={() => {
                dispatch({ type: "ANSWER", id: p.proverbId });
                if (p.proverbId === question.proverbId) play(question);
              }}
            >
              <span>{String.fromCharCode(65 + i)}</span>
              {p.title}
              {answered && p.proverbId === question.proverbId && <b>✓ 正解</b>}
              {answered &&
                p.proverbId === answered.selectedId &&
                !answered.correct && <b>你嘅答案</b>}
            </button>
          ))}
        </div>
        {answered && (
          <div className={styles.feedback} role="status">
            <h3>{answered.correct ? "答啱！+15 XP" : "差少少，睇吓正解。"}</h3>
            <p>
              <strong>{question.title}</strong>：{question.explanation}
            </p>
            <button
              className={styles.start}
              onClick={() => {
                dispatch({ type: "NEXT_QUESTION" });
                if (state.quizIndex === 2) play(quiz[0]);
              }}
            >
              {state.quizIndex === 2 ? "進入 Phase C · 音韻解鎖 →" : "下一題 →"}
            </button>
          </div>
        )}
        <p className={styles.error} role="status">
          {audioError}
        </p>
      </section>
    );
  }
  if (state.phase === "phonetics") {
    const p = quiz[state.reviewed];
    return (
      <section className={styles.flowPanel} aria-label="Phase C 音韻解鎖">
        <p className={styles.eyebrow}>
          PHASE C · 音韻解鎖 · {state.reviewed + 1} / 3
        </p>
        <h2>{p.title}</h2>
        <p className={styles.pronunciation}>{p.jyutping}</p>
        <button
          className={styles.listen}
          disabled={muted}
          onClick={() => play(p)}
        >
          ▷ 播放完整粵語
        </button>
        {muted && (
          <p className={styles.subtitle}>
            目前已靜音，可在右上角開啟音效，或直接閱讀粵拼。
          </p>
        )}
        <div className={styles.toneGrid}>
          <article>
            <span>01 / 聽聲調</span>
            <h3>九聲六調</h3>
            <p>
              粵拼用 1–6 標記六個聲調；以 -p、-t、-k
              收尾嘅入聲，傳統另外計入九聲。
            </p>
            <p>{p.toneTip}</p>
          </article>
          <article>
            <span>02 / 辨字音</span>
            <h3>同音、近音，意思唔同。</h3>
            <p>{p.trap}</p>
          </article>
        </div>
        <blockquote className={styles.translation}>
          {p.memeTranslation}
        </blockquote>
        <p>{p.literalMeaning}</p>
        <p className={styles.error} role="status">
          {audioError}
        </p>
        <button
          className={styles.start}
          onClick={() => {
            dispatch({ type: "REVIEW_TONE" });
            if (state.reviewed < 2) play(quiz[state.reviewed + 1]);
          }}
        >
          {state.reviewed < 2
            ? "已學識 · 下一句 +5 XP →"
            : "完成音韻學習 +5 XP →"}
        </button>
      </section>
    );
  }
  if (state.phase === "complete")
    return (
      <section className={styles.flowPanel} aria-label="Stage 1 完成">
        <p className={styles.eyebrow}>A ＋ B ＋ C · 全部完成</p>
        <h2>金句記得，意思識用。</h2>
        <div className={styles.total}>
          {state.xp}
          <span> / 100 XP</span>
        </div>
        <p>
          翻牌配對 40 XP ＋ 情境填空{" "}
          {state.answers.filter((a) => a.correct).length * 15} XP ＋ 音韻學習 15
          XP
        </p>
        <p>
          情境填空答啱 {state.answers.filter((a) => a.correct).length} / 3
          題。揀一句帶去 Stage 2：
        </p>
        <label className={styles.selectLabel}>
          想練嘅金句
          <select value={selectedId} onChange={(e) => select(e.target.value)}>
            {state.deck.map((p) => (
              <option key={p.proverbId} value={p.proverbId}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <button className={styles.start} onClick={handoff}>
          帶住金句去 Stage 2 ↗
        </button>
        <p className={styles.status} role="status">
          {message.includes("未能儲存") ? message : "完成！可以去實戰。"}
        </p>
      </section>
    );
  return null;
}
