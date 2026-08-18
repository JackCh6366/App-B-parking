// In-memory cache per serverless function instance (2 minutes TTL)
let cache: { timestamp: number; data: any[] } | null = null;
const CACHE_TTL_MS = 120000; // 2 分鐘 (120 秒)

const TAIPEI_API_URL = 'https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_roadquery.xml';

function parseTaipeiXml(xml: string) {
  const roads: any[] = [];
  const roadRegex = /<ROAD>([\s\S]*?)<\/ROAD>/gi;
  let match: RegExpExecArray | null;

  const getTagValue = (str: string, tag: string) => {
    const reg = new RegExp(`<${tag}>\\s*([\\s\\S]*?)\\s*<\\/${tag}>`, 'i');
    const m = str.match(reg);
    return m ? m[1].trim() : '';
  };

  while ((match = roadRegex.exec(xml)) !== null) {
    const block = match[1];
    const roadSegID = getTagValue(block, 'roadSegID');
    const roadSegName = getTagValue(block, 'roadSegName');
    const roadSegAvail = getTagValue(block, 'roadSegAvail');
    const roadSegTotalValue = getTagValue(block, 'roadSegTotalValue') || getTagValue(block, 'roadSegTotal');
    const roadSegCarType = getTagValue(block, 'roadSegCarType');
    const roadSegFee = getTagValue(block, 'roadSegFee');
    const roadSegtimeStart = getTagValue(block, 'roadSegtimeStart') || getTagValue(block, 'roadSegTmStart');
    const roadSegtimeEnd = getTagValue(block, 'roadSegtimeEnd') || getTagValue(block, 'roadSegTmEnd');
    const roadSegUpdatetime = getTagValue(block, 'roadSegUpdatetime') || getTagValue(block, 'roadSegUpdateTm');

    if (roadSegID || roadSegName) {
      roads.push({
        roadSegID,
        roadSegName,
        roadSegAvail,
        roadSegTotalValue,
        roadSegCarType,
        roadSegFee,
        roadSegtimeStart,
        roadSegtimeEnd,
        roadSegUpdatetime
      });
    }
  }

  return roads;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. 檢查 2 分鐘記憶體快取
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cache.data);
  }

  // 2. 呼叫臺北市政府開放資料 API (8 秒逾時)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(TAIPEI_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, text/xml, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JackParkingHelper/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Taipei Open Data HTTP error: ${response.status}`);
      return res.status(502).json({ error: '無法取得臺北市即時車位資料，請 5 分鐘後再試' });
    }

    const xmlText = await response.text();
    const resultData = parseTaipeiXml(xmlText);

    // 更新快取
    cache = {
      timestamp: Date.now(),
      data: resultData,
    };

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(resultData);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('Taipei Open Data Fetch Error:', err?.message || err);
    return res.status(502).json({ error: '無法取得臺北市即時車位資料，請 5 分鐘後再試' });
  }
}
