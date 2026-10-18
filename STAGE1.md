# Stage 1 — Vibe Memory Match

這份實作接在小組現有 Next.js 16.3.8 / React 19 專案的 `/learn`，不新增 npm dependencies。

## 在這部 Mac / PyCharm 開啟

1. PyCharm → File → Open → 選擇本文件所在的 `vibecheck-hk` 資料夾。
2. 開啟 `run_stage1.py`，使用已安裝的 Python 3.13 執行（右鍵 → Run）。或在 PyCharm Terminal 執行 `python3 run_stage1.py`。
3. 瀏覽 `http://localhost:3000/learn`。停止時按 Stop 或 Ctrl+C。

此 Mac 的 Node.js v24.21.0 放在旁邊工作目錄 `../../work/node-v24.21.0-darwin-arm64/bin/`；啟動器會自動找到。移動專案至其他位置或其他電腦時，請安装 Node.js 22.12+，或將 `VIBECHECK_NODE` 設為 node 的絕對路徑。

一般團隊開發仍用原有指令：

```sh
npm ci
npm run dev
npm run lint
node --experimental-strip-types --test tests/stage1.test.mjs
npm run build -- --webpack
```

本機已驗證 Webpack 正式建置。預設 Turbopack build 在此代理執行環境曾因內部連接埠限制失敗；Next.js 官方支援的 `--webpack` 已通過。開發伺服器使用預設 Turbopack 並已通過瀏覽器驗證。現有根 layout 使用 Google Fonts，首次 build 仍需連線下載字型。

## 三階段玩法與計分（2026-10-18 修正）

保留 4×4 翻牌配對，並恢復獨立 Phase B 與 Phase C。

- Phase A：16 張卡、八對金句；每次翻兩張，配錯一秒後蓋回。每對 +5 XP，共 40 XP。完成後按「進入 Phase B」。
- Phase B：從本局八句隨機抽三句，完成三道生活情境填空。三選一，答對 +15 XP，答錯顯示正解與解釋，仍可繼續；無倒數。
- Phase C：逐句播放／閱讀三句的粵語、粵拼、九聲六調與同音／近音提示；每按一次「已學識」+5 XP，共 15 XP。靜音時也可閱讀並完成。
- 完成 A、B、C 才出現 Stage 2 交接按鈕。總分 55–100 XP，三題全對為 100 XP。
- 「重新洗牌」重設全部階段、作答、音韻進度和 XP。配對用時只記錄 Phase A。
- 頂部進度列顯示 A → B → C；填空階段隱藏卡桌及解說，提交答案後才顯示正解。

## Stage 2 交接

沿用 `ProverbInput`，sessionStorage key 保留 `vibecheck.stage1.v1`，內容版本為 3 / mode `pairs-quiz-tones`。結果包含八個 `matchedIds`、三筆 `answers`、`reviewed: 3`、`moves` 和依作答重算的 XP。舊版純配對結果不再作為完整學習成果讀取。

完成頁選一句金句，再帶入 Stage 2 對應角色。格式無效時安全回退；文字與角色以 catalog 為準。這是本機 demo 進度，並非伺服器認證獎勵。

## 音檔與 Azure

現附的 10 段 `.m4a` 是 macOS **Sinji / zh-HK** 生成的本機示範粵語，來源記錄在 `public/audio/proverbs/source.json`。**目前未使用 Azure 語音，也未測試真實 Azure 連線。**

若要完全符合新版企劃的 Azure 語音要求，在 PyCharm Run Configuration 的 Environment variables 設定：

- `AZURE_SPEECH_KEY`：你的 Azure Speech resource key
- `AZURE_SPEECH_REGION`：resource 所在區域，如 `eastasia`
- `AZURE_SPEECH_VOICE`：可選，預設 `zh-HK-HiuGaaiNeural`，另支援 `zh-HK-HiuMaanNeural` / `zh-HK-WanLungNeural`

執行 `python3 scripts/generate_azure_audio.py`。它會對 Azure 發送這十句金句，可能產生帳戶用量費用；全部音檔收到後才更新 catalog 的路徑及來源記錄。失敗保留現有 demo。完成後重啟 dev server／重新 build。

憑證只從執行環境讀取；不要放到 `NEXT_PUBLIC_*`、JSON、Git 或聊天室。前端僅播放預先生成的檔案，現場 demo 不必呼叫 TTS API。播放器失敗會提示並保留粵拼，切換階段／靜音會停止之前的語音。

## 檔案索引

| 檔案 | 用途 |
| --- | --- |
| `app/learn/page.tsx` | `/learn` Server Component / metadata |
| `app/learn/MemoryMatch.tsx` | 遊戲介面、音訊、計時與交接 |
| `app/learn/game.ts` | 可獨立測試的狀態機與儲存驗證 |
| `app/learn/MemeArt.tsx` | 十款原創 SVG 插圖 |
| `app/learn/memory.module.css` | 限 Stage 1 的樣式 |
| `app/data/proverbs.json` | 十句諺語、粵拼、情境、音韻內容 |
| `public/audio/proverbs/` | 十段 demo 音訊、來源記錄 |
| `app/learn/Stage1Practice.tsx` | Stage 1 → 2 adapter |
| `tests/stage1.test.mjs` | 狀態機、資料、音訊檔及交接測試 |
| `scripts/generate_azure_audio.py` | 預先產生 Azure MP3 |
| `run_stage1.py` | PyCharm 的 Python 啟動入口 |

## 來源版本與交付

來源是私人 repo `YankeeHo/vibecheck-hk` 的 GitHub ZIP，頁面上 latest commit 為 `91fe9edd08660173e0296d7fac56e60e3bc7b038`。
由於終端 Git clone 未能連線，這是 **原始碼快照**，不是含完整 upstream history 的 clone。本機 Git 的 `source-snapshot` 是本地建立的基線，`feat/stage1-memory-match` 是本地工作分支。未 push / 未開 PR / 未部署。

若要合併：在你們正常 clone、基於上述 commit 的 feature branch 中，先檢查另附 `stage1.patch`，再 `git apply --check /path/to/stage1.patch`，確認後 `git apply /path/to/stage1.patch`。若 upstream 已更動，先由 owner review／處理衝突。不要直接推送這個快照的 Git history。

## 驗證紀錄

2026-10-18：ESLint 已通過，新的頁面已透過本機 HTTP 回應確認包含 16 張卡。新配對引擎的 11 項 Node 測試通過，包括相同卡重複點擊、配錯鎖定與延遲蓋回、配對計分、八對完成、重開清除、無效牌組與 Stage 2 資料驗證。先前版本的瀏覽器操作紀錄不能代表本次改版已做瀏覽器互動驗證。

PyCharm 控制先前未獲准；仍可按照上方說明開啟專案及執行 `run_stage1.py`。若 localhost:3000 已在執行，重新整理 `/learn` 即可讀取更新。

## 內容與技術參考

- 最新玩法來自小組 Google Doc： https://docs.google.com/document/d/1pnD2nO1x6NVeMchyhFundtxFD7ujpYntcSfB67Ctet4/edit
- 粵拼方案及六個調號： https://lshk.org/jyutping-scheme/
- Azure Speech REST / SSML： https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech
- Azure 語音清單： https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts

角色年代／地點沿用小組故事設定；現代對話及迷因為本次撰寫。個別俗語可能有不同地區讀法，正式比賽前建議由隊友試聽一次並校對語感。沒有修改受保護的 `summary.md`。

## 補回 B / C 的驗證

新增完整流程、禁止跳階段、重複計分、答錯仍可完成與儲存格式測試；另以 React server renderer 驗證 B 題目／解說、獨立 C 提示及完成頁交接按鈕。執行 `node --experimental-strip-types --test tests/stage1.test.mjs tests/stage1-ui.test.cjs`。
