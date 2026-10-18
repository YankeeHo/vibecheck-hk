# Jerry — Stage 1 implementation

Implemented the current Google Doc's Vibe Memory Match flow in `/learn`:

- Three selectable persona decks and a mixed deck; all 10 sayings live in `app/data/proverbs.json`.
- Five-second flip memory, three context questions, pronunciation and tone explanations, 30 XP per correct answer and a 10 XP perfect bonus.
- Unlimited learning mode, pause/visibility handling, keyboard controls, responsive layout, reduced motion, local audio and playback error handling.
- Minimal Stage 2 adapter retains `ProverbInput`, carries selected proverb/persona and XP, and preserves direct Stage 2 access.
- Local Cantonese demo clips included; Azure pre-generation script provided. Live Azure setup remains pending credentials.
- Logic tests and setup/integration instructions: see `STAGE1.md`.

Team review: YK should review the small `app/practice/page.tsx` / `PracticeChat.tsx` adapter changes before merging. Stage 2 chat remains its existing mock implementation; Stage 3 and shared contracts were not changed.


## 2026-10-18 使用者修正

Stage 1 改為 4×4、八對相同金句的記憶配對，取代先前五秒翻牌與填空。配錯一秒後蓋回，配對留在桌上，完成最高 100 XP。Stage 2 envelope 更新為 version 2 / mode pairs；詳見 STAGE1.md。


### 修正：恢復 Phase B / C

保留 A 翻牌配對，補回三題情境填空及獨立音韻學習，再進入 Stage 2。計分 A 40、B 最多 45、C 15 XP；交接格式 version 3。
