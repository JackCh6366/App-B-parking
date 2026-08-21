import { getCachedData, setCachedData, isFresh, isWithinStale } from '../lib/redisCache';

const CACHE_KEY = 'taichung';
const CACHE_TTL_MS = 60000; // 60 秒：視為新鮮
const STALE_SERVE_MS = 300000; // 5 分鐘內：過期但仍可先頂著用

const TAICHUNG_API_URL = 'https://newdatacenter.taichung.gov.tw/api/v1/no-auth/resource.download?rid=1744bc00-cd16-48f3-9632-309f364662bb';

async function fetchFreshData(): Promise<any[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(TAICHUNG_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JackParkingHelper/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Taichung Open Data HTTP error: ${response.status}`);
      return [];
    }

    const json = await response.json();
    const resultData = Array.isArray(json) ? json : json?.result || json?.records || [];
    return resultData;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('Taichung Open Data Fetch Error:', err?.message || err);
    return [];
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const cached = await getCachedData<any[]>(CACHE_KEY);

  // 1. 快取新鮮（60秒內）：直接回傳
  if (isFresh(cached, CACHE_TTL_MS)) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cached!.data);
  }

  // 2. 快取過期但仍在 stale 容忍範圍（5分鐘內）：同步刷新，失敗則降級回傳舊資料
  if (isWithinStale(cached, STALE_SERVE_MS)) {
    const freshData = await fetchFreshData();
    if (freshData.length > 0) {
      await setCachedData(CACHE_KEY, freshData);
      res.setHeader('X-Cache', 'REFRESHED');
      return res.status(200).json(freshData);
    }
    res.setHeader('X-Cache', 'STALE-FALLBACK');
    return res.status(200).json(cached!.data);
  }

  // 3. 完全沒有可用快取：同步拉取全新資料
  const freshData = await fetchFreshData();

  if (freshData.length === 0) {
    if (cached) {
      res.setHeader('X-Cache', 'STALE-ERROR');
      return res.status(200).json(cached.data);
    }
    return res.status(502).json({ error: '無法取得即時車位資料，請 5 分鐘後再試' });
  }

  await setCachedData(CACHE_KEY, freshData);
  res.setHeader('X-Cache', 'MISS');
  return res.status(200).json(freshData);
}
