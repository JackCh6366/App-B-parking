# Jack的停車位小幫手 — 需求規格書

文件版本：v1.0　彙整日期：2026-08-06

---

## 1. 專案概述

一個整合新北市、臺中市**真實**路邊停車開放資料的即時查詢工具，並提供多引擎 AI 客服協助解答停車相關問題。原專案由 Google AI Studio 產生，本次改造目標為：(1) 資料真實化 (2) 客服多引擎化 (3) 部署至 Vercel。

---

## 2. 功能需求範圍

### 2.1 資料層（本次開發）

| 項目 | 規格 |
|---|---|
| 資料來源 | 新北市 + 臺中市，**同時**串接真實開放資料 API |
| 新北 Endpoint | `https://data.ntpc.gov.tw/api/datasets/54A507C4-C038-41B5-BF60-BBECB9D052C6/json`（免金鑰，官方更新頻率每 2 分鐘） |
| 台中 Endpoint | 路邊車格 API，官方確認欄位 `Section_ID/PS_ID/PS_type/Lat/Lng/status`（免金鑰，實際 Endpoint 網址待部署前實測確認） |
| 更新機制 | 使用者開啟/刷新網頁時觸發請求 → 後端 Serverless Function 設 **45 秒記憶體快取**，降低被政府平台流量保護機制阻擋的風險，使用者感知不到差異 |
| Fallback 策略 | API 失敗時**明確顯示**「⚠️ 目前無法取得○○市即時車位資料，請 5 分鐘後再試」+ 重試按鈕，**絕不使用假資料混充** |
| 新增檔案 | `/api/parking/newtaipei.ts`、`/api/parking/taichung.ts` |

### 2.2 核心體驗

| 項目 | 決定 |
|---|---|
| B1 路線導航 | ❌ 本次不做 |
| B2 我的最愛/常用車位 | ❌ 本次不做 |
| B3 停車計時提醒 | ❌ 本次不做 |
| B4 車位預測（尖峰時段） | ❌ 本次不做 |
| B5 多城市擴充框架 | ✅ **本次執行**：城市資料抽成可配置化結構（`src/config/cities.config.ts`），新增城市時不需修改 TypeScript 型別定義 |

### 2.3 帳號與進階功能

C1（登入系統）、C2（繳費整合）、C3（違規回報）、C4（PWA 化）、C5（多語系）— ❌ 全數暫不執行。

---

## 3. AI 多引擎客服需求

### 3.1 篩選標準

主要需求：**可回應繁體中文，內容不需複雜但要快速提供正確資訊**。依此標準排除中文語感較弱的 Meta（Llama）與 Mistral 系列模型。

### 3.2 最終上線引擎（7 個）

| # | 顯示名稱 | provider 參數 | model 參數 | 走哪個 API |
|---|---|---|---|---|
| 1 | Google Gemini | `gemini` | `gemini-3.6-flash` | Gemini API |
| 2 | NVIDIA Nemotron Ultra | `nemotron-ultra` | `nvidia/nemotron-3-ultra-550b-a55b` | NVIDIA |
| 3 | NVIDIA Nemotron Super | `nemotron-super` | `nvidia/nemotron-3-super-120b-a12b` | NVIDIA |
| 4 | NVIDIA Nemotron 49B | `nemotron-49b` | `nvidia/llama-3.3-nemotron-super-49b-v1.5` | NVIDIA |
| 5 | NVIDIA Nemotron Nano | `nemotron-nano` | `nvidia/nemotron-3-nano-30b-a3b` | NVIDIA |
| 6 | Google Gemma 4 | `gemma-4` | `google/gemma-4-31b-it` | NVIDIA |
| 7 | OpenAI GPT-OSS | `gpt-oss` | `openai/gpt-oss-120b` | NVIDIA |

已排除：Meta Llama 4 Maverick、Meta Llama 3.3 70B、Mistral Nemotron、Mistral Small。

### 3.3 互動規格

| 項目 | 決定 |
|---|---|
| 選擇方式 | 每次對話前手動下拉選單選擇，可中途切換 |
| 失敗處理 | 顯示錯誤訊息（標明是哪個引擎），使用者可手動改選其他引擎，**不自動靜默切換** |
| API 金鑰 | 只需 `GEMINI_API_KEY` + `NVIDIA_API_KEY` 兩把（NVIDIA 系 6 個引擎共用一把金鑰，只是 model 參數不同） |

---

## 4. Vercel 部署技術需求

| 項目 | 決定 |
|---|---|
| 整體架構 | 完全改為 Vercel 標準架構：刪除 `server.ts`，改用 Vite 純前端建置 + `/api/*.ts` 各自獨立 Serverless Function |
| 本地開發 | `vercel dev` |
| API 路徑 | `/api/ai-chat` 直接**取代**為 `/api/analyze`，不保留舊路徑 |
| 測試要求 | 實作完成後**必須自動跑一輪 smoke test**：7 個引擎皆能回應、兩個資料 proxy 皆能拉到資料，並回報結果 |
| AI Studio 清理 | 刪除 `metadata.json`；`vite.config.ts` 移除 `DISABLE_HMR` 邏輯；`.env.example` 移除 `APP_URL` |

---

## 5. 開發範圍檔案清單

```
新增
├── /api/analyze.ts                    7引擎AI客服（取代 /api/ai-chat）
├── /api/parking/newtaipei.ts          proxy + 45秒快取
├── /api/parking/taichung.ts           proxy + 45秒快取
├── src/config/cities.config.ts        城市可配置化結構
└── vercel.json                        Vercel 部署設定

修改
├── src/types/parking.ts               City 型別改為 string
├── src/services/parkingService.ts     接上真實 fetchRealSpotsForCity，adapter registry
├── src/hooks/useParkingData.ts        呼叫真實資料函式 + 明確錯誤處理
├── src/components/AiCustomerServiceModal.tsx   加入7引擎下拉選單
├── vite.config.ts                     移除 AI Studio 專屬邏輯
├── .env.example                       移除 APP_URL，新增 NVIDIA_API_KEY
├── .gitignore                         新增 .vercel
└── package.json                       scripts/依賴改為 Vercel 標準模式

刪除
├── server.ts
└── metadata.json
```

---

## 6. 已知風險與待辦事項

| 項目 | 說明 | 負責 |
|---|---|---|
| 台中市 API 實際 Endpoint | 官方欄位已確認，但完整 Endpoint 網址需部署前實測驗證 | 使用者部署前確認 |
| 7 個 AI 引擎實際可用性 | NVIDIA 免費模型目錄變動快，正式串接前建議到 build.nvidia.com/models 逐一測試 model ID | 使用者部署前確認 |
| API 金鑰申請 | 需申請 `GEMINI_API_KEY`、`NVIDIA_API_KEY` 並設定於 Vercel 環境變數 | 使用者 |
| Vercel Function 執行時間上限 | `maxDuration` 依方案（Hobby/Pro）有不同上限，需依實際方案調整 `vercel.json` | 使用者部署前確認 |

---

## 7. 討論過程紀錄（決策軌跡）

1. **資料層決策**：先評估「兩城市一起接 vs 分批」→ 選擇一起接；「排程快取 vs on-demand」→ 選擇 on-demand；因使用者提出「不想給錯誤資訊」原則，最終在 on-demand 基礎上加入 45 秒極短效期快取作為折衷，兼顧「不排程」與「降低被擋風險」。
2. **AI 引擎決策**：先列出 10 個非中國製 NVIDIA 候選模型 → 依「繁中正確 + 速度快」重新評估，排除 Meta/Mistral 系列 → 使用者自行指定保留 1/2/3/4/5/10/11 共 7 個。
3. **部署架構決策**：確認完全改為 Vercel 標準 Serverless 架構（非包裝 Express）、`/api/analyze` 直接取代舊路徑、要求自動 smoke test。
