import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 初始化 Gemini AI Client (使用伺服器端 GEMINI_API_KEY)
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // AI 客服諮詢 API 端點
  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { messages, context } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: '無效的訊息格式' });
      }

      // 構建系統提示詞
      const systemInstruction = `
你是一位專業、親切且精通台灣地方路邊停車法規與資訊的「Jack的停車位小幫手 AI 客服助理」。
你的任務是解答使用者關於路邊停車、特殊車格類型、收費標準、法規罰則、違規舉報、付費管道以及地圖停車壓力熱力圖等問題。

【當前地圖狀況 Context】：
- 城市：${context?.cityName || '新北市/臺中市'}
- 選取行政區：${context?.district || '全轄區'}
- 搜尋關鍵字：${context?.searchQuery || '無'}
- 當前篩選出的空車位數量：${context?.filteredSpotCount || 0} 格
- 選中的車位名稱：${context?.selectedSpotName || '未選擇'}

【專業知識庫與常見問題指南】：
1. **特殊車位類型與規範**：
   - **孕婦及育有六歲以下兒童專用車位**：粉紅識別證，無證占用罰 NT$600~1,200。
   - **身心障礙者專用停車位**：藍底白輪椅圖案，須放身障證或專用車牌。享前 2~4 小時免費/半價優惠。無證占用罰 NT$600~1,200。
   - **電動車充電專用車位**：綠色車格或充電樁標示。非充電電車或燃油車占用開罰 NT$600~1,200。
   - **裝卸貨專用車位**：黃黑斜線或黃線標示，限貨車/客貨兩用車停放（每次 30~60 分鐘）。一般車輛占用開罰 NT$600~1,200。
2. **收費與繳費資訊**：
   - 一般路邊車位收費時間為 08:00 - 20:00，非收費時段免收費。
   - 繳費方式：四大超商多媒體機補單、街口/Line Pay/悠遊付等行動支付、車牌自動扣款。
3. **停車壓力熱力圖功能介紹**：
   - 熱力圖顯示區域停車車位佔用率（Occupancy Rate）。
   - 🔴 紅色：車位極緊繃 (>=75% 佔用)
   - 橘色/黃色：車位中等 (25%~74% 佔用)
   - 🟢 綠色：車位充裕 (<25% 佔用)

【回答原則】：
- 使用正體中文（繁體中文）親切回答。
- 條理分明、內容精確且有幫助。適當使用點列與粗體語法。
`;

      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ reply: response.text || '抱歉，我目前無法產生回應。' });
    } catch (error: any) {
      console.error('AI Customer Service Error:', error);
      return res.status(500).json({
        error: 'AI 客服系統連線異常，請檢查 GEMINI_API_KEY 設定或稍後再試。',
        message: error?.message,
      });
    }
  });

  // 開發環境使用 Vite Middleware，正式環境服務靜態檔案
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
