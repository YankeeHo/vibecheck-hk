# This is the summary of project, please do not change this file unless human approval.

📌 VibeCheck HK — 專案架構總結
1. 專案定位與核心價值 (Value Proposition)
賽道主題：Theme 3: Smart Living, Culture & Belonging

核心使命：用「生成式 AI + 遊戲化（Gamification）」解決香港 Gen-Z 對廣東話文化與非遺（ICH）的斷層問題。

產品哲學：將老土的傳統諺語，轉譯為年輕人的「現代社交貨幣（Social Currency）」，實現 "Learn → Practice → Reward" 的閉環體驗。

🔄 核心用戶旅程 (Core User Journey)
Stage 1: Learn — Meme 轉譯引擎 (Meme-Translation Engine)
機制：將傳統諺語/歇後語與 Gen-Z 現代生活焦慮/迷因進行配對（Meme Matching）。

亮點：加入廣東話「九聲六調（9 Tones）」與諧音陷阱，讓用戶從迷因中理解諺語的本意。

Stage 2: Practice — AI 時空漫遊角色 (AI Time-Travel Personas)
機制：透過低延遲語音/文字，與 3 位歷史角色進行「微型任務（Micro-quest）」對話與角色扮演。

評分機制 (Vibe Score)：對話結束後觸發 Evaluator Prompt，從 語意情境 (40%)、廣東話口語 (30%) 與 腦洞共鳴 (30%) 輸出 1-5 星級評分與評語。

Stage 3: Reward — 打卡文化護照 (Daa Kaak Passport)
機制：結合 html2canvas 渲染前端卡片，根據 Vibe Score 解鎖不同稀有度（SSR 閃卡 / SR 常規卡 / N 普通卡）的復古香港美學 Trading Cards，供 IG/TikTok 分享。

🎭 3 大 AI 時空角色與 10 個精選諺語劇本矩陣
角色 Persona
時代與非遺地緣背景 (Heritage)
精選諺語 / 歇後語
現代 Gen-Z 轉譯與情境衝突 (Conflict)
昌叔 (Uncle Cheong)


霓虹燈牌師傅

1980s 深水埗


非遺：霓虹燈工藝（屈管、氬氣、北魏體書法）

1. 慢工出細貨


2. 針無兩頭利


3. 贏咗粒糖，輸咗間廠

Agile MVP vs. 匠人精神


用戶急著催交貨/要平要亮，昌叔用 workshop 哲學開解選擇困難症與短線惡性競爭。

勝哥 (Brother Sing)


紅頭小巴司機

1970s 旺角/紅磡


地緣：紅隧通車、手寫小巴牌、獅子山拼搏

4. 過咗海就係神仙


5. 阿崩叫狗——越叫越走


6. 邊有咁大隻蛤乸隨街跳


7. 水過鴨背

Quiet Quitting vs. 市井智慧


過海後態度轉變對應現代職場「摸魚」；分析街頭詐騙與現代 Crypto 騙局；歇後語音韻趣味。

三姑 (Auntie Sam)


涼茶舖老闆娘

1960s 九龍城寨


非遺：涼茶藥理（24味）、武館（夜粥）、鄰里互助

8. 食過下夜粥


9. 好天搵埋落雨柴


10. 陰功

FIRE 運動 vs. 城寨安全感


展示武館背景談現代「副業（Side Hustle）」；用囤柴談抗風險財務規劃；用「陰功」展現社區同理心。


🛠️ 「VibeCheck HK」極簡新手技術棧
1. 前端（UI 介面與網頁）
工具：Next.js 或 React（搭配 Tailwind CSS 畫介面）

為什麼選它：這是目前最主流、AI 輔助工具（如 Cursor、ChatGPT）最會寫的語法。你可以直接讓 AI 幫你寫出復古霓虹燈樣式，不用自己從頭刻。

2. Stage 1: Learn（諺語迷因展示）
工具：純前端 JSON 檔案 + 預先錄好的音訊檔 (.mp3)


做法：把備忘錄裡的 10 個諺語（如「過咗海就係神仙」、「食過下夜粥」等） 直接存成一個本地文字檔。錄好或下載好 10 段九聲六調的語音檔，點擊卡片直接播放！不調用任何 AI API，0 延遲且完全免費。

3. Stage 2: Practice（AI 角色對話）
語音輸入 (STT)：Web Speech API（瀏覽器自帶免費功能）

做法：讓用戶用瀏覽器自帶的「語音轉文字」功能直接講廣東話（zh-HK）。

AI 大腦 (LLM)：OpenAI API (gpt-4o-mini)

做法：給它寫好 System Prompt（限制它是昌叔/勝哥/三姑，且每次回覆不超過 60 個字）。這個模型反應極快且非常便宜。

AI 說話 (TTS)：Azure Speech Service


做法：用 Azure 的廣東話語音 API（如 zh-HK-HiuGaaiNeural 或 WanLungNeural），把文字轉成自然流利的廣東話語音播給用戶聽。

4. Stage 3: Reward（卡片生成與分享）
工具：html2canvas（前端套件）

做法：不要用 AI 畫圖！ 先用 CSS 做好一張漂亮的復古閃卡模板（SSR/SR/N），對話結束後把 Stage 2 計算出來的 Vibe Score 分數 填進這張模板裡，然後用 html2canvas 瞬間把這塊 HTML 轉成圖片，讓用戶一鍵下載或分享到社交平台！

💡 Newbie 開發建議（給 Hackathon 階段）
不需要複雜的後端資料庫：一開始連 Supabase 或 Firebase 都不需要，把用戶對話狀態留在瀏覽器（React State）即可。

防踩坑金句：「文字用 GPT，聲音用 Azure，卡片用 HTML 轉圖片」，這樣組裝開發難度最低，而且現場 Demo 絕對順暢、不會出現 AI 生成卡住的窘境！
🌟 答辯 Pitch 亮點摘要 (Judges Impact)
深層文化復興 (Cultural Depth)：不只教廣東話，更透過非遺（ICH）、地緣記憶與「九聲六調」音韻傳承城寨與香港精神。

跨世代共鳴 (Intergenerational Synergy)：讓 Gen-Z 發現「原來 50 年前香港人的焦慮，跟今天我們面對的完全一樣」，消弭世代隔閡。

負責任 AI 範例 (Responsible AI)：明確的 Rubric 評分規準 + Prompt FSM 圍欄，展示出高安全性、可控性與教育價值的 AI 應用。