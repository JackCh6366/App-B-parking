// 共用 Redis 持久化快取工具 (含記憶體備援機制)
//
// 背景：Vercel Serverless Function 在低流量情況下會頻繁建立全新的執行個體，
// 每個執行個體的記憶體互不共享，導致原本用 `let cache = ...` 模組層級變數
// 做的快取，實測後發現幾乎每次請求都是 cache MISS，等同於快取完全沒有生效，
// 每次都重新打政府開放資料 API，有被限流的風險。
//
// 解法：改用 Upstash Redis（透過 Vercel Storage 整合，環境變數已自動注入）
// 做真正跨執行個體共享的持久化快取。若未設定環境變數，自動降級為記憶體快取備援。

import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;
let redisInitFailed = false;

// 記憶體備用快取（當 Redis 未設定或連線失敗時，供單個執行個體內重複使用）
const memoryCacheMap = new Map<string, CacheEnvelope<any>>();

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;
  if (redisInitFailed) return null;

  try {
    const url =
      process.env.KV_REST_API_URL ||
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.REDIS_REST_API_URL;
    const token =
      process.env.KV_REST_API_TOKEN ||
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      process.env.REDIS_REST_API_TOKEN;

    if (!url || !token) {
      console.warn('[redisCache] 未檢測到 Redis 環境變數，切換至記憶體快取備援模式');
      redisInitFailed = true;
      return null;
    }

    redisClient = new Redis({ url, token });
    return redisClient;
  } catch (err: any) {
    console.error('[redisCache] 初始化 Redis client 失敗:', err?.message || err);
    redisInitFailed = true;
    return null;
  }
}

export interface CacheEnvelope<T> {
  timestamp: number;
  data: T;
  isComplete?: boolean;
}

/**
 * 讀取快取資料。
 * @param key 快取鍵值（例如 'taipei' / 'newtaipei' / 'taichung'）
 */
export async function getCachedData<T>(key: string): Promise<CacheEnvelope<T> | null> {
  const client = getRedisClient();
  if (!client) {
    return memoryCacheMap.get(key) || null;
  }

  try {
    const raw = await client.get<CacheEnvelope<T>>(`parking:${key}`);
    if (!raw) return memoryCacheMap.get(key) || null;
    return raw;
  } catch (err: any) {
    console.error(`[redisCache] 讀取 Redis 快取失敗 (key=${key}):`, err?.message || err);
    return memoryCacheMap.get(key) || null;
  }
}

/**
 * 寫入快取資料。
 * @param key 快取鍵值
 * @param data 要快取的資料本體
 * @param isComplete 資料是否完整
 * @param expireSeconds Redis 端的過期秒數
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  isComplete: boolean = true,
  expireSeconds: number = 1800 // 預設 30 分鐘後 Redis 自動清除
): Promise<boolean> {
  const envelope: CacheEnvelope<T> = {
    timestamp: Date.now(),
    data,
    isComplete,
  };

  // 同步寫入記憶體備援
  memoryCacheMap.set(key, envelope);

  const client = getRedisClient();
  if (!client) return true;

  try {
    await client.set(`parking:${key}`, envelope, { ex: expireSeconds });
    return true;
  } catch (err: any) {
    console.error(`[redisCache] 寫入 Redis 快取失敗 (key=${key}):`, err?.message || err);
    return true;
  }
}

/**
 * 判斷快取是否仍在「新鮮」範圍內（未過期）。
 */
export function isFresh(envelope: CacheEnvelope<unknown> | null, ttlMs: number): boolean {
  if (!envelope) return false;
  return Date.now() - envelope.timestamp < ttlMs;
}

/**
 * 判斷快取是否仍在「stale 可容忍」範圍內（過期但還能先頂著用）。
 */
export function isWithinStale(envelope: CacheEnvelope<unknown> | null, staleMs: number): boolean {
  if (!envelope) return false;
  return Date.now() - envelope.timestamp < staleMs;
}
