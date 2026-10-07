# YK Development Roadmap

YK owns the general UI and Stage 2 (Practice). Start with shared foundations so Jerry (Stage 1) and Andy (Stage 3) can build independently and integrate against stable contracts. Each roadmap item includes Plan, Execute, Test, and Replan.

In Test phrase, program be runned on a real web app and test by human. 

## 1. General Foundation and Team Contracts

- **Plan:** Agree with Jerry and Andy on the MVP flow, file/component ownership, and the data passed between stages. Define a proverb input for Stage 1 and a practice result for Stage 3, including persona, score, feedback, and the rarity decision owner. Keep the contracts small and avoid building a database.
- **Execute:** Record the agreed field names and ownership boundaries; use representative mock data so each teammate can develop without waiting on another stage. Notify the relevant owner before changing a shared contract.
- **Test:** Have each teammate verify that their stage can consume or provide the agreed example data; run `npm run lint` and `npm run build` on the shared baseline.
- **Replan:** If a contract or ownership boundary is unclear, keep the integration mocked and resolve it together before adding dependencies or coupling stage code.

## 2. General UI Shell

- **Plan:** Establish the shared visual foundation and navigation for Learn, Practice, and Reward, with responsive layout, shared typography/colors, and reusable buttons, panels, and loading/error states.
- **Execute:** Replace the starter screen in `app/page.tsx`; set shared document metadata in `app/layout.tsx`; define global styles in `app/globals.css`. Keep stage-specific content isolated so teammates can integrate without rewriting the shell.
- **Test:** Check the main flow at mobile and desktop sizes, verify keyboard navigation and readable loading/error states, then run `npm run lint` and `npm run build`.
- **Replan:** If stage work needs a different layout or shared component, agree on the smallest reusable interface and update the shell before duplicating UI patterns.

## 3. Stage 2 Text-First Character Practice

- **Plan:** Define the chat message and session shape, persona selection, turn-taking, and short-response behavior for Uncle Cheong, Brother Sing, and Auntie Sam. Deliver text chat before adding speech so the core interaction is testable without browser or audio-service support.
- **Execute:** Build the conversation UI with mock replies first, then connect the approved server-side OpenAI integration. Keep prompts and API credentials out of client code; include pending, retry, and service-error states.
- **Test:** Verify all three personas, message ordering, empty input, long input, loading, retry, and API failure behavior. Confirm replies follow the agreed length and do not expose credentials; run lint and build.
- **Replan:** If live model access is unavailable or unstable, retain the same interface and use deterministic sample replies until the integration is ready.

## 4. Vibe Score Evaluation

- **Plan:** Agree on examples and expected results for the rubric: semantic/context fit (40%), Cantonese spoken-language use (30%), and creativity/resonance (30%), producing a 1-5 score and concise feedback.
- **Execute:** Implement evaluation separately from chat presentation, validate its output shape and score bounds, and pass the result through the Stage 3 contract agreed with Andy.
- **Test:** Check representative strong, weak, and off-topic conversations; confirm the weights total 100%, scores remain within 1-5, and malformed evaluator output is handled safely.
- **Replan:** If scores are inconsistent, review the shared examples and rubric with the team, adjust the evaluation criteria, and rerun the same cases before connecting card rewards.

## 5. Speech and Cross-Stage Integration

- **Plan:** Add voice only after text practice and scoring work end to end. Confirm browser support and Azure voice configuration, then coordinate integration points with Jerry's Learn content and Andy's Reward cards.
- **Execute:** Add Cantonese speech input with text entry as a fallback and optional Azure speech output. Connect the Stage 1 selection to a practice scenario and pass the finished Vibe Score result to Andy's card flow without taking over their stage implementation.
- **Test:** Verify supported and unsupported speech-recognition cases, text fallback, audio playback failure, and the complete Learn-to-Practice-to-Reward path. Rehearse the demo and run `npm run lint` and `npm run build`.
- **Replan:** If speech or a third-party service blocks the demo, disable that optional integration and use text input, sample responses, and fixture scores while preserving the agreed stage contracts.

