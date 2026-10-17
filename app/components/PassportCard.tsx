import type { RewardCardData } from "../lib/reward";

type PassportCardProps = {
  result: RewardCardData;
};

const tierLabels = {
  SSR: "Legendary",
  SR: "Rare",
  N: "Classic",
} as const;

export function PassportCard({ result }: PassportCardProps) {
  return (
    <div className="passport-card-frame" aria-label="VibeCheck HK reward card">
      <div className="passport-card-scale">
        <article
          id="passport-card"
          className={`passport-card passport-card--${result.rarity.toLowerCase()}`}
          aria-label={`${tierLabels[result.rarity]} VibeCheck HK card for ${result.persona}`}
        >
          <div className="passport-card__paper">
            <header className="passport-card__topline">
              <span>VIBE CHECK · HONG KONG</span>
              <span>NO. {result.sessionId.slice(-6).toUpperCase()}</span>
            </header>

            <div className="passport-card__seal" aria-hidden="true">
              <span>香港</span>
              <strong>HK</strong>
              <span>VIBE PASS</span>
            </div>

            <p className="passport-card__edition">CITY MEMORY · COLLECTOR EDITION</p>
            <h2 className="passport-card__title">街頭智慧<br />認證卡</h2>

            <div className="passport-card__portrait" aria-hidden="true">
              <span className="passport-card__sun" />
              <span className="passport-card__skyline passport-card__skyline--back" />
              <span className="passport-card__skyline passport-card__skyline--front" />
              <span className="passport-card__tram">叮叮</span>
              <span className="passport-card__portrait-caption">夜行香港 · 1980</span>
            </div>

            <div className="passport-card__holder">
              <div>
                <span className="passport-card__label">CARDHOLDER / 傳承人</span>
                <strong>{result.persona}</strong>
              </div>
              <span className="passport-card__tier">{result.rarity}</span>
            </div>

            <div className="passport-card__score-row">
              <span>VIBE SCORE</span>
              <strong>{result.vibeScore}<small> / 5</small></strong>
              <span>{tierLabels[result.rarity]} tier</span>
            </div>

            <div className="passport-card__proverb">
              <span className="passport-card__label">UNLOCKED SAYING / 解鎖俗語</span>
              <strong lang="zh-HK">{result.unlockedIdiom}</strong>
              <p>{result.feedback}</p>
            </div>

            <footer className="passport-card__footer">
              <span>傳承 · CONNECTION · 城市記憶</span>
              <span className="passport-card__stamp">{result.toneTip}</span>
            </footer>
          </div>
        </article>
      </div>
    </div>
  );
}