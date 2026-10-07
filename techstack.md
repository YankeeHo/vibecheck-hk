# VibeCheck HK Tech Stack

This document records the current project foundation and the proposed implementation stack from `summary.md`. The General section comes first because it applies across all stages. Proposed services and libraries are not necessarily installed or integrated yet.

## General

- Framework: Next.js 16 with the App Router, using the version currently installed in `package.json`.
- UI: React 19 and TypeScript 5.
- Styling: Tailwind CSS 4, configured through PostCSS.
- Package manager: npm. `npm run dev` starts local development, `npm run lint` runs ESLint, `npm run build` creates a production build, and `npm start` serves that build.
- State and persistence: keep hackathon demo state in React/browser memory. No database is planned initially.
- Secrets: any API credentials must remain on the server and must not be exposed in client-side code or committed to the repository.

## Stage 1: Learn

- Content: local JSON data for the ten selected Cantonese sayings, their explanations, meme pairings, and related learning content.
- Audio: prerecorded Cantonese pronunciation clips in MP3 format, served as static assets.
- Playback: play the matching clip from the learning UI. This stage does not require an AI API.
- Owner: Jerry.

## Stage 2: Practice

- Speech input: browser Web Speech API configured for Cantonese (`zh-HK`). Browser support can vary, so provide text input as a fallback.
- Conversation model: OpenAI API using `gpt-4o-mini`, with character-specific system prompts and short replies (up to 60 Chinese characters, as planned in `summary.md`). Keep API calls and credentials server-side.
- Speech output: Azure Speech Service with a Cantonese voice, such as `zh-HK-HiuGaaiNeural` or `zh-HK-WanLungNeural`.
- Vibe Score: evaluate semantic/context fit (40%), Cantonese spoken-language use (30%), and creativity/resonance (30%); return a 1-5 star score and feedback.
- Owner: YK.

## Stage 3: Reward

- Card templates: build the retro Hong Kong trading-card designs with HTML and CSS; do not generate the card artwork with AI.
- Image rendering: use `html2canvas` to render the completed card for download or social sharing.
- Rewards: use the Vibe Score to select a rarity tier: SSR, SR, or N.
- Owner: Andy.

## Integration Status

Next.js, React, TypeScript, Tailwind CSS, and the npm scripts are present in the project. OpenAI, Azure Speech, `html2canvas`, and the planned content/audio assets are not listed as project dependencies or implemented integrations yet. Confirm versions, browser behavior, service configuration, and any additional dependencies before implementation.
