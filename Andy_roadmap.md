# Roadmap: Retro Hong Kong Vibe Score Reward Card

## Project files

- `app/reward/page.tsx` — determine the Vibe Score and rarity, then compose the card and download button.
- `app/components/PassportCard.tsx` — render the card as HTML.
- `app/components/DownloadCardButton.tsx` — capture the card and download it as an image.
- `app/reward/passport-card.css` — style the card and its rarity variations.

## 1. Define the rarity rules

Decide how the Vibe Score maps to a rarity tier. These thresholds are examples; replace them with your actual product rules.

| Vibe Score | Rarity |
|---|---|
| 80–100 | SSR |
| 50–79 | SR |
| 0–49 | N |

Decide how to handle missing or out-of-range scores. Keep the score-to-rarity mapping in one place so the rarity shown on the page always matches the card.

## 2. Build the card component

In `app/components/PassportCard.tsx`:

- Define typed props for the Vibe Score, rarity tier, and any cardholder details.
- Render the card with HTML.
- Build the artwork and decorations with CSS—do not use AI-generated card artwork.
- Give the card’s outer element a stable `id` or `ref` so it can be captured.
- Use a tier-specific class, such as `passport-card--ssr`, to apply rarity styling.

## 3. Create the card styles

In `app/reward/passport-card.css`:

- Establish the retro Hong Kong trading-card look with a cohesive palette, typography, frames, and decorative details.
- Set explicit card dimensions and spacing to make image capture predictable.
- Add responsive presentation styles while keeping the captured card dimensions consistent.
- Make SSR, SR, and N visually distinct, while keeping text legible.

## 4. Connect the score and card

In `app/reward/page.tsx`:

- Get or define the Vibe Score.
- Map the score to `SSR`, `SR`, or `N`.
- Pass the score, rarity, and cardholder details to `PassportCard`.
- Render `DownloadCardButton` with a reference to the card element, or pass its `id` if that fits the component design.

## 5. Add image download

In `app/components/DownloadCardButton.tsx`:

- Use `html2canvas` to capture the card when the user clicks Download.
- Convert the canvas to an image and trigger a file download.
- Handle a missing card element and capture failures with a visible error message.
- Check custom fonts, external images, and cross-origin assets: they may fail to render or prevent export. CSS-drawn artwork avoids many of these issues.
- Keep the button in a client component (`"use client"`) because image capture requires browser APIs.

Install `html2canvas` and its types if they are not already included in the project.

## 6. Verify the finished flow

- Test low, boundary, and high scores.
- Confirm each score selects the expected rarity.
- Confirm the on-page card and downloaded image show the same tier.
- Check that the capture includes the card only, at the intended dimensions.
- Test a capture failure and verify that the user sees a clear error message.
