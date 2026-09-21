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

    // 構建精簡化系統提示詞
    const systemInstruction = `
你是一位精準、簡潔且精通台灣路邊與路外停車資訊的「停車位 AI 助理」。
你的唯一任務是針對使用者的提問給予精準、直接且高度聚焦的解答。

【重要行為約束（必須嚴格遵守）】：
1. 嚴禁主動自我介紹（例如「您好，我是Jack的停車位小幫手...」），禁止開場寒暄。
2. 嚴禁結尾客套問候（例如「祝您用車愉快」、「如有其他問題歡迎詢問」等），直接在核心答案結束處停止。
3. 嚴格限定回答範圍：**僅回答使用者提問的核心問題**。未被使用者主動問及的知識庫內容（例如繳費管道、違規罰則、停車熱力圖、其他無關車格說明等）**絕對不要主動附加或發散說明**。
4. 篇幅與精準度控制：單次回答原則上控制在 **150 字以內**，或使用 **不超過 3 點** 的精簡條列。在精簡的同時，必須確保核心資訊完整（如具體空位數、費率與時段、車格規範與罰則等），不因字數而遺漏提問重點。
5. 一律使用正體中文（繁體中文），語氣客觀中立、精確明瞭。

【當前即時 Context】：
- 城市：${context?.cityName || '新北市/臺中市/臺北市'}
- 行政區：${context?.district || '全轄區'}
- 搜尋關鍵字：${context?.searchQuery || '無'}
- 當前篩選空車位數：${context?.filteredSpotCount ?? 0} 格
- 當前選中車格/場站：${context?.selectedSpotName || '未選擇'}

【專業知識庫（僅在使用者提問直接相關時引用，切勿主動附加無關項）】：
1. 特殊車位類型：
   - 孕婦幼兒專用：須持粉紅識別證，違規占用罰 NT$600~1,200。
   - 身障專用：須放身障證或專用車牌，享前 2~4 小時免費/半價優惠，違規占用罰 NT$600~1,200。
   - 充電專用：限電動車充電使用，非電車或充飽未移占用罰 NT$600~1,200。
   - 裝卸貨專用：限貨車/客貨兩用車，每次限停 30~60 分鐘，一般小客車占用罰 NT$600~1,200。
2. 收費時段與計費：
   - 路邊一般收費時段多為 08:00 - 20:00，非收費時段免收費（特定商圈假日可能不同）。
   - 計費多以每半小時為單位，一般費率約 NT$20~40/小時，熱門商圈累進費率最高 NT$60/小時。
   - 繳費方式：四大超商多媒體機補單、行動支付（街口/LINE Pay/悠遊付等）。
3. 停車壓力熱力圖（僅在被問到熱力圖時回答）：
   - 🔴 紅色：佔用率 ≥ 75%（車位緊繃）
   - 🟡 黃色/橘色：佔用率 25%~74%（中等）
   - 🟢 綠色：佔用率 < 25%（充裕）
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
