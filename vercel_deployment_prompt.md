# Jack的停車位小幫手 — Vercel 部署改造提示詞（優化版）

> 本文件取代原本的範例提示詞，已根據討論結果修正 10 個問題點。
> ✅ 標記代表這部分我已經在本次對話的容器環境中直接實作完成，可直接下載程式碼；
> 這份提示詞同時也可作為交付給 AI Studio / Claude Code 的完整指令，用於重新執行或驗證。

---

## 背景

這個專案由 Google AI Studio 協助建立而成，目前有多處內容僅能在 AI Studio 環境運作（Express 常駐伺服器、AI Studio 專屬設定檔等）。現在要改造成可以獨立部署在 **Vercel** 的一般專案。

---

## 一、整體架構調整 ✅

- **完全改為 Vercel 標準架構**：移除 `server.ts`（Express 常駐伺服器），前端改為純 Vite 建置，所有後端邏輯改成 `/api/*.ts` 各自獨立的 Vercel Serverless Function。
- 本地開發指令改為 `vercel dev`（會同時啟動前端與 `/api` 函式，行為與正式環境一致）。
- 新增 `vercel.json`：
  ```json
  {
    "buildCommand": "vite build",
    "outputDirectory": "dist",
    "framework": "vite",
    "functions": {
      "api/**/*.ts": { "maxDuration": 30 }
    }
  }
  ```
  > `maxDuration` 依你的 Vercel 方案上限調整（Hobby/Pro 方案上限不同，部署前請至 Vercel 文件確認目前數值）。

---

## 二、清除 AI Studio 專屬內容 ✅

| 檔案 | 處理方式 |
|---|---|
| `metadata.json`（`majorCapabilities: SERVER_SIDE_GEMINI_API` 等 AI Studio 專屬宣告） | 刪除，Vercel 不需要此檔案 |
| `vite.config.ts` 的 `DISABLE_HMR` 邏輯 | 移除，改回標準 Vite dev server 設定 |
| `server.ts` 的 `User-Agent: 'aistudio-build'` header | 隨 `server.ts` 一併刪除 |
| `.env.example` 的 `APP_URL`（AI Studio 自動注入 Cloud Run URL 用） | 移除，改成一般 Vercel 環境變數說明 |

---

## 三、新增 AI 服務選擇介面（7 引擎版本）✅

前端下拉選單支援以下 7 個 AI 引擎（依「繁體中文正確 + 回應快」為篩選標準，已排除 Meta/Mistral 系列）：

| 顯示名稱 | provider 參數 | 對應 model |
|---|---|---|
| Google Gemini | `gemini` | `gemini-3.6-flash` |
| NVIDIA Nemotron Ultra | `nemotron-ultra` | `nvidia/nemotron-3-ultra-550b-a55b` |
| NVIDIA Nemotron Super | `nemotron-super` | `nvidia/nemotron-3-super-120b-a12b` |
| NVIDIA Nemotron 49B | `nemotron-49b` | `nvidia/llama-3.3-nemotron-super-49b-v1.5` |
| NVIDIA Nemotron Nano | `nemotron-nano` | `nvidia/nemotron-3-nano-30b-a3b` |
| Google Gemma 4 | `gemma-4` | `google/gemma-4-31b-it` |
| OpenAI GPT-OSS | `gpt-oss` | `openai/gpt-oss-120b` |

- **選擇方式**：每次對話前用下拉選單手動選，選完可中途切換。
- **失敗處理**：呼叫失敗時顯示明確錯誤訊息（標明是哪個引擎掉了），使用者可手動切換其他引擎；**不自動靜默切換**。

---

## 四、建立 Serverless Function ✅

### `/api/analyze.ts`（取代原本的 `/api/ai-chat`，直接取代不並存）

- 依前端傳入的 `provider` 動態呼叫對應 API：
  - `provider === 'gemini'` → 使用 `process.env.GEMINI_API_KEY`，走 `@google/genai` SDK
  - 其餘 6 個 provider → 使用 `process.env.NVIDIA_API_KEY`，Base URL 為 `https://integrate.api.nvidia.com/v1`（OpenAI 相容格式），依 provider 帶入對應 `model` 字串
- Request body 格式：`{ provider, messages: [{role, content}], context: {...} }`
- Response 格式：`{ reply: string, provider: string }`
- 逾時設定：NVIDIA 呼叫 30 秒逾時保護

### `/api/parking/newtaipei.ts`、`/api/parking/taichung.ts`（全新，原本完全不存在）✅

- Proxy 新北市 / 臺中市政府開放資料 API（皆免金鑰）
- **On-demand 觸發 + 45 秒記憶體快取**：使用者開啟/刷新頁面才觸發請求，同一 Function 執行環境內 45 秒內的重複請求直接回傳快取，降低被政府平台流量保護機制阻擋的機率
- 失敗時回傳明確錯誤（HTTP 502 + 錯誤訊息），**不提供假資料 fallback**，前端會顯示「無法取得即時車位資料，請 5 分鐘後再試」

> ⚠️ 台中市 API 實際 Endpoint 網址請於部署前實測確認（台中市開放資料平台網址曾有異動）；本次實作先以官方文件確認過的欄位（`Section_ID`/`PS_ID`/`PS_type`/`Lat`/`Lng`/`status`）撰寫轉換邏輯，正式欄位若有出入需要微調 `adaptTaichungData`。

---

## 五、前端串接邏輯調整 ✅

- 前端不直接呼叫任何 AI 平台或政府 API，全部透過 `/api/*` 轉發
- `AiCustomerServiceModal.tsx` 新增引擎下拉選單，呼叫 `/api/analyze` 時帶入 `provider`
- `parkingService.ts` 改用 `fetchRealSpotsForCity(cityId)` 取代原本的模擬資料函式，錯誤直接拋出讓 UI 顯示

---

## 六、城市可配置化架構（B5，本次一併處理）✅

- `src/config/cities.config.ts`：城市資料抽成陣列，`CityId` 型別改為 `string`
- 新增城市時，只需要：
  1. 在 `cities.config.ts` 新增一筆 `CityInfo`
  2. 建立對應的 `/api/parking/{city}.ts`
  3. 在 `parkingService.ts` 的 `CITY_DATA_ADAPTERS` 註冊資料轉換器
  4. **完全不需要修改任何 TypeScript 型別定義**

---

## 七、環境變數設定

Vercel 後台 Project Settings → Environment Variables：
```
GEMINI_API_KEY=你的_Gemini_API_Key
NVIDIA_API_KEY=你的_NVIDIA_API_Key
```

本地開發：複製 `.env.example` 為 `.env.local`，填入相同兩把金鑰。

**重要**：`.env.local` 已被 `.gitignore` 的 `.env*` 規則排除（保留 `.env.example` 供參考），絕對不可上傳至 GitHub。部署前請務必實際 `cat .gitignore` 確認排除規則存在，不要只憑口頭確認。

---

## 八、錯誤處理與逾時策略 ✅

- 三個外部服務（Gemini / NVIDIA / 政府開放資料 API）皆設定逾時保護（AI 客服 30 秒、政府資料 8 秒）
- 失敗時一律回傳明確錯誤訊息，**不做自動 fallback 到假資料或靜默切換引擎**，使用者可自行決定重試或換一個選項

---

## 九、驗收前必跑的本地測試 ✅

實作完成後，請執行並回報以下結果：

```bash
npm install
npx tsc --noEmit        # 型別檢查需全數通過
npx vite build           # 前端 build 需成功
vercel dev                # 本地啟動，手動測試：
```

**Smoke test checklist**（請逐項確認並回報結果）：
- [ ] 7 個 AI 引擎皆能透過 `/api/analyze` 正常回應（至少各發送 1 則測試訊息）
- [ ] `/api/parking/newtaipei` 能正常回傳資料或明確錯誤訊息
- [ ] `/api/parking/taichung` 能正常回傳資料或明確錯誤訊息
- [ ] `.gitignore` 內容確認包含 `.env*` 排除規則（請貼出實際檔案內容佐證，不要只回報「已處理」）
- [ ] 政府 API 失敗時，畫面顯示明確錯誤訊息而非假資料

---

## 十、本次執行狀態總覽

| 項目 | 狀態 |
|---|---|
| 刪除 server.ts，改為 Vercel 標準架構 | ✅ 已完成 |
| 清除 AI Studio 專屬設定 | ✅ 已完成 |
| `/api/analyze.ts`（7 引擎） | ✅ 已完成 |
| `/api/parking/newtaipei.ts`、`taichung.ts` | ✅ 已完成（台中 Endpoint 網址待實測確認） |
| 前端引擎下拉選單 | ✅ 已完成 |
| 城市可配置化架構 | ✅ 已完成 |
| `npx tsc --noEmit` / `vite build` | ✅ 已通過 |
| 實際呼叫 3 個外部 API 的 smoke test | ⬜ 待你補上 API 金鑰後實際測試 |
| Vercel 正式部署與環境變數設定 | ⬜ 待你操作 Vercel 後台 |
