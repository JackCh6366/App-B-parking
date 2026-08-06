// In-memory cache per serverless function instance (45 seconds TTL)
let cache: { timestamp: number; data: any } | null = null;
const CACHE_TTL_MS = 45000; // 45 秒

const NEWTAIPEI_API_URL = 'https://data.ntpc.gov.tw/api/v1/rest/datastore/382000000A-000225-002';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. 檢查 45 秒記憶體快取
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cache.data);
  }

  // 2. 呼叫政府開放資料 API (8 秒逾時)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(NEWTAIPEI_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JackParkingHelper/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`NewTaipei Open Data HTTP error: ${response.status}`);
      return res.status(502).json({ error: '無法取得即時車位資料，請 5 分鐘後再試' });
    }

    const json = await response.json();
    const resultData = json?.result?.records || json?.result || json || [];

    // 更新快取
    cache = {
      timestamp: Date.now(),
      data: resultData,
    };

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(resultData);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('NewTaipei Open Data Fetch Error:', err?.message || err);
    return res.status(502).json({ error: '無法取得即時車位資料，請 5 分鐘後再試' });
  }
}
