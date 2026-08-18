/**
 * 測試新北市分頁拉取效能
 * 模擬 Serverless Function 實際執行情境
 */
import fetch from 'node-fetch';

const NTP_BASE_URL = 'https://data.ntpc.gov.tw/api/datasets/54A507C4-C038-41B5-BF60-BBECB9D052C6/json';
const PAGE_SIZE = 2000;
const MAX_PAGES = 20;
const PER_PAGE_TIMEOUT_MS = 8000;

async function fetchAllPagesTimingTest() {
  const allItems: any[] = [];
  const pageTimes: number[] = [];

  const overallStart = Date.now();

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `${NTP_BASE_URL}?page=${page}&size=${PAGE_SIZE}`;
    const pageStart = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PER_PAGE_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JackParkingHelper/1.0',
        },
        signal: controller.signal,
      } as any);

      clearTimeout(timeoutId);

      if (!response.ok) { console.log(`Page ${page}: HTTP ${response.status}, stopping.`); break; }

      const json: any = await response.json();
      const pageData: any[] = Array.isArray(json) ? json : json?.result?.records || [];
      if (pageData.length === 0) { console.log(`Page ${page}: empty, stopping.`); break; }

      const pageTime = Date.now() - pageStart;
      pageTimes.push(pageTime);
      allItems.push(...pageData);

      console.log(`Page ${page}: ${pageData.length} items, ${pageTime}ms`);
      if (pageData.length < PAGE_SIZE) break;
    } catch (err: any) {
      clearTimeout(timeoutId);
      const pageTime = Date.now() - pageStart;
      console.error(`Page ${page}: ERROR after ${pageTime}ms:`, err?.message);
      break;
    }
  }

  const totalTime = Date.now() - overallStart;

  console.log('\n=== Performance Summary ===');
  console.log(`Total items fetched:   ${allItems.length}`);
  console.log(`Total pages:           ${pageTimes.length}`);
  console.log(`Total wall-clock time: ${totalTime}ms`);
  console.log(`Average time/page:     ${Math.round(pageTimes.reduce((a,b)=>a+b,0)/pageTimes.length)}ms`);
  console.log(`Slowest page:          ${Math.max(...pageTimes)}ms`);
  console.log(`Fastest page:          ${Math.min(...pageTimes)}ms`);
  console.log('');
  console.log('=== Vercel Timeout Analysis ===');
  console.log(`Vercel Hobby (10s):    ${totalTime < 10000 ? '✅ OK' : '❌ EXCEEDS'}`);
  console.log(`Vercel Pro (60s):      ${totalTime < 60000 ? '✅ OK' : '❌ EXCEEDS'}`);
  console.log('');
  console.log('=== Cache Strategy Assessment ===');
  const approxMemoryKB = Math.round((JSON.stringify(allItems).length) / 1024);
  console.log(`Approx in-memory size: ~${approxMemoryKB} KB`);
  console.log(`Current TTL: 120s — after cold start, all subsequent requests served from cache`);
}

fetchAllPagesTimingTest();
