import { getCachedData, setCachedData, isFresh, isWithinStale } from '../lib/redisCache.js';

// 全量31,611筆拉取需要~20秒，改用平行請求可在 3~5 秒內完成
const CACHE_KEY = 'newtaipei';
const CACHE_TTL_MS = 300000; // 5分鐘：視為新鮮
const STALE_SERVE_MS = 600000; // 過期後10分鐘內仍可先頂著用

const NTP_BASE_URL = 'https://data.ntpc.gov.tw/api/datasets/54A507C4-C038-41B5-BF60-BBECB9D052C6/json';
const PAGE_SIZE = 2000;
const MAX_PAGES = 20;
const PER_PAGE_TIMEOUT_MS = 8000; // 每頁8秒逾時

interface NewTaipeiResult {
  data: any[];
  isComplete: boolean;
}

async function fetchAllPages(): Promise<NewTaipeiResult> {
  const pagePromises = Array.from({ length: MAX_PAGES }, async (_, page) => {
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
        return [];
      }

      const json = await response.json();
      const pageData = Array.isArray(json) ? json : json?.result?.records || json?.result || [];
      return pageData;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError') {
        console.warn(`NewTaipei page ${page} timed out`);
      } else {
        console.error(`NewTaipei page ${page} error:`, err?.message || err);
      }
      return [];
    }
  });

  const pagesData = await Promise.all(pagePromises);
  const allItems = pagesData.flat();
  const successfulPages = pagesData.filter(p => p.length > 0).length;
  const isComplete = successfulPages >= MAX_PAGES || (pagesData.length > 0 && pagesData[pagesData.length - 1].length < PAGE_SIZE);

  return { data: allItems, isComplete };
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const cached = await getCachedData<any[]>(CACHE_KEY);

    // 1. 快取新鮮（5分鐘內）：直接回傳
    if (isFresh(cached, CACHE_TTL_MS)) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Items', String(cached!.data.length));
      res.setHeader('X-Cache-Complete', String(cached!.isComplete ?? true));
      return res.status(200).json(cached!.data);
    }

    // 2. 快取過期但仍在 stale 容忍範圍（10分鐘內）：同步刷新，失敗則降級回傳舊資料
    if (isWithinStale(cached, STALE_SERVE_MS)) {
      const { data, isComplete } = await fetchAllPages();
      if (data.length > 0) {
        await setCachedData(CACHE_KEY, data, isComplete);
        res.setHeader('X-Cache', 'REFRESHED');
        res.setHeader('X-Cache-Items', String(data.length));
        res.setHeader('X-Cache-Complete', String(isComplete));
        return res.status(200).json(data);
      }
      res.setHeader('X-Cache', 'STALE-FALLBACK');
      res.setHeader('X-Cache-Items', String(cached!.data.length));
      res.setHeader('X-Cache-Complete', String(cached!.isComplete ?? true));
      return res.status(200).json(cached!.data);
    }

    // 3. 完全沒有可用快取：同步拉取全量資料
    const { data, isComplete } = await fetchAllPages();

    if (data.length === 0) {
      if (cached) {
        res.setHeader('X-Cache', 'STALE-ERROR');
        return res.status(200).json(cached.data);
      }
      return res.status(502).json({ error: '無法取得即時車位資料，請 5 分鐘後再試' });
    }

    await setCachedData(CACHE_KEY, data, isComplete);

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Cache-Items', String(data.length));
    res.setHeader('X-Cache-Complete', String(isComplete));
    return res.status(200).json(data);
  } catch (globalErr: any) {
    console.error('NewTaipei Handler Exception:', globalErr);
    return res.status(500).json({
      error: globalErr?.message || String(globalErr),
      stack: globalErr?.stack || null
    });
  }
}
