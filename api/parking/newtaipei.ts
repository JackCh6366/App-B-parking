// In-memory cache per serverless function instance
// TTL 300秒（5分鐘）：全量31,611筆拉取需要~20秒，需拉長快取時間降低頻率
// Vercel Hobby 限10秒 → 冷啟動會逾時，需升級Pro或使用以下背景刷新策略
let cache: { timestamp: number; data: any[]; isComplete: boolean } | null = null;
const CACHE_TTL_MS = 300000; // 5分鐘（全量拉取成本高，減少頻率）
const STALE_SERVE_MS = 600000; // 過期10分鐘內仍可提供stale資料

const NTP_BASE_URL = 'https://data.ntpc.gov.tw/api/datasets/54A507C4-C038-41B5-BF60-BBECB9D052C6/json';
const PAGE_SIZE = 2000;
const MAX_PAGES = 20;
const PER_PAGE_TIMEOUT_MS = 9000; // 每頁9秒逾時

// 是否正在背景刷新（避免多個請求同時觸發拉取）
let isRefreshing = false;

async function fetchAllPages(): Promise<{ data: any[]; isComplete: boolean }> {
  const allItems: any[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `${NTP_BASE_URL}?page=${page}&size=${PAGE_SIZE}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PER_PAGE_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JackParkingHelper/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`NewTaipei page ${page} HTTP error: ${response.status}`);
        break;
      }

      const json = await response.json();
      const pageData = Array.isArray(json) ? json : json?.result?.records || json?.result || [];

      if (pageData.length === 0) break;
      allItems.push(...pageData);
      if (pageData.length < PAGE_SIZE) break; // 最後一頁
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError') {
        console.warn(`NewTaipei page ${page} timed out, stopping pagination with ${allItems.length} items so far`);
      } else {
        console.error(`NewTaipei page ${page} error:`, err?.message || err);
      }
      // 返回目前已拉到的部分資料（partial），標記 isComplete=false
      return { data: allItems, isComplete: false };
    }
  }

  return { data: allItems, isComplete: true };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const now = Date.now();

  // 1. 快取命中（TTL 5分鐘內）
  if (cache && (now - cache.timestamp) < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('X-Cache-Items', String(cache.data.length));
    res.setHeader('X-Cache-Complete', String(cache.isComplete));
    return res.status(200).json(cache.data);
  }

  // 2. 快取過期但仍在 stale 容忍範圍（10分鐘內），先回傳舊資料，非同步背景刷新
  if (cache && (now - cache.timestamp) < STALE_SERVE_MS && !isRefreshing) {
    // 啟動背景刷新（不等待）
    isRefreshing = true;
    fetchAllPages()
      .then(({ data, isComplete }) => {
        if (data.length > 0) {
          cache = { timestamp: Date.now(), data, isComplete };
          console.log(`NewTaipei background refresh done: ${data.length} items, complete=${isComplete}`);
        }
      })
      .catch(err => console.error('NewTaipei background refresh error:', err?.message))
      .finally(() => { isRefreshing = false; });

    res.setHeader('X-Cache', 'STALE-REFRESHING');
    res.setHeader('X-Cache-Items', String(cache.data.length));
    res.setHeader('X-Cache-Complete', String(cache.isComplete));
    return res.status(200).json(cache.data);
  }

  // 3. 冷啟動或快取完全失效：同步拉取全量資料
  try {
    const { data, isComplete } = await fetchAllPages();

    if (data.length === 0) {
      // 嘗試返回過期快取（降級）
      if (cache) {
        res.setHeader('X-Cache', 'STALE-ERROR');
        return res.status(200).json(cache.data);
      }
      return res.status(502).json({ error: '無法取得即時車位資料，請 5 分鐘後再試' });
    }

    cache = { timestamp: now, data, isComplete };

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Cache-Items', String(data.length));
    res.setHeader('X-Cache-Complete', String(isComplete));
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('NewTaipei handler error:', err?.message || err);

    if (cache) {
      res.setHeader('X-Cache', 'STALE-ERROR');
      return res.status(200).json(cache.data);
    }

    return res.status(502).json({ error: '無法取得即時車位資料，請 5 分鐘後再試' });
  }
}
