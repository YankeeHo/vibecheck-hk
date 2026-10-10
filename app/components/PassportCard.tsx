export type Rarity = "SSR" | "SR" | "N";

export type CardCategory = "Category 01" | "Category 02" | "Category 03";

type PassportCardProps = {
  vibeScore: number;
  rarity: Rarity;
  category: CardCategory;
};

export function getRarityForScore(score: number): Rarity {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new RangeError("Vibe Score must be a number from 0 to 100.");
  }

  if (score >= 80) return "SSR";
  if (score >= 50) return "SR";
  return "N";
}

export default function PassportCard({
  vibeScore,
  rarity,
  category,
}: PassportCardProps) {
  return (
    <article
      id="passport-card"
      className={`passport-card passport-card--${rarity.toLowerCase()}`}
      aria-label={`${rarity} Vibe City passport card`}
    >
      <div className="passport-card__inner">
        <header className="passport-card__header">
          <div>
            <p className="passport-card__eyebrow">VIBE CITY · HONG KONG</p>
            <h2 className="passport-card__title">CITY PASSPORT</h2>
          </div>
          <span className="passport-card__serial">HK—026</span>
        </header>

        <div className="passport-card__art" aria-hidden="true">
          <div className="passport-card__moon" />
          <div className="passport-card__skyline passport-card__skyline--back" />
          <div className="passport-card__skyline passport-card__skyline--front" />
          <div className="passport-card__reflection" />
          <span className="passport-card__art-caption">夜 · NEON DISTRICT</span>
        </div>

        <div className="passport-card__details">
          <div>
            <p className="passport-card__label">CARD CATEGORY</p>
            <p className="passport-card__category">{category}</p>
          </div>
          <div className="passport-card__score-block">
            <p className="passport-card__label">VIBE SCORE</p>
            <p className="passport-card__score">{vibeScore}</p>
          </div>
        </div>

        <footer className="passport-card__footer">
          <span>HONG KONG · 22° 17′ N</span>
          <span className="passport-card__rarity">{rarity}</span>
        </footer>
      </div>
    </article>
  );
}
