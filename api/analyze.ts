import { GoogleGenAI } from '@google/genai';

const MODEL_MAP: Record<string, string> = {
  'nemotron-ultra': 'nvidia/nemotron-3-ultra-550b-a55b',
  'nemotron-super': 'nvidia/nemotron-3-super-120b-a12b',
  'nemotron-49b': 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
  'nemotron-nano': 'nvidia/nemotron-3-nano-30b-a3b',
  'gemma-4': 'google/gemma-4-31b-it',
  'gpt-oss': 'openai/gpt-oss-120b',
};

const PROVIDER_NAMES: Record<string, string> = {
  'gemini': 'Google Gemini (gemini-3.6-flash)',
  'nemotron-ultra': 'NVIDIA Nemotron Ultra',
  'nemotron-super': 'NVIDIA Nemotron Super',
  'nemotron-49b': 'NVIDIA Nemotron 49B',
  'nemotron-nano': 'NVIDIA Nemotron Nano',
  'gemma-4': 'Google Gemma 4',
  'gpt-oss': 'OpenAI GPT-OSS',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { provider = 'gemini', messages, context } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '無效的訊息格式' });
    }

    const providerName = PROVIDER_NAMES[provider] || provider;

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

    if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: `AI 引擎 (${providerName}) 連線失敗：環境變數 GEMINI_API_KEY 未設定。`,
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.status(200).json({
        reply: response.text || '抱歉，Gemini 目前無法產生回應。',
        provider: 'gemini',
      });
    } else {
      // NVIDIA OpenAI-Compatible Endpoint
      const apiKey = process.env.NVIDIA_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: `AI 引擎 (${providerName}) 連線失敗：環境變數 NVIDIA_API_KEY 未設定。`,
        });
      }

      const model = MODEL_MAP[provider];
      if (!model) {
        return res.status(400).json({ error: `不支援的 AI provider: ${provider}` });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const nvidiaMessages = [
          { role: 'system', content: systemInstruction },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        ];

        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: nvidiaMessages,
            temperature: 0.7,
            max_tokens: 1024,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          console.error(`NVIDIA API Error (${provider}):`, response.status, errText);
          return res.status(502).json({
            error: `AI 引擎 (${providerName}) 回應異常 (HTTP ${response.status})。`,
            details: errText,
          });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || '抱歉，目前無法產生回應。';

        return res.status(200).json({
          reply,
          provider,
        });
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          return res.status(504).json({
            error: `AI 引擎 (${providerName}) 呼叫逾時 (超過 30 秒)，請重試或切換其他引擎。`,
          });
        }
        throw err;
      }
    }
  } catch (error: any) {
    console.error('API Analyze Error:', error);
    return res.status(500).json({
      error: `AI 客服系統處理發生錯誤：${error?.message || '未知錯誤'}`,
    });
  }
}
