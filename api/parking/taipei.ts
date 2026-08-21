import { XMLParser } from 'fast-xml-parser';
import { getCachedData, setCachedData, isFresh, isWithinStale } from '../_lib/redisCache';

const CACHE_KEY = 'taipei';
const CACHE_TTL_MS = 60000; // 60 秒：視為新鮮
const STALE_SERVE_MS = 300000; // 5 分鐘內：過期但仍可先頂著用

const TAIPEI_ROAD_XML_URL = 'https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_roadquery.xml';
const TAIPEI_PARK_DESC_URL = 'https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_alldesc.json';
const TAIPEI_PARK_AVAIL_URL = 'https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_allavailable.json';

// TWD97 (TM2 121) 轉 WGS84 座標公式
function twd97ToWgs84(xStr: any, yStr: any): { lat: number; lng: number } | null {
  const x = parseFloat(xStr);
  const y = parseFloat(yStr);
  if (isNaN(x) || isNaN(y) || x <= 0 || y <= 0) return null;

  const a = 6378137.0;
  const b = 6356752.3142451;
  const long0 = (121 * Math.PI) / 180;
  const k0 = 0.9999;
  const dx = 250000;

  const e = Math.sqrt(1 - (b * b) / (a * a));
  const e2 = (a * a - b * b) / (b * b);

  const xOffset = x - dx;
  const M = y / k0;
  const mu = M / (a * (1 - Math.pow(e, 2) / 4 - (3 * Math.pow(e, 4)) / 64 - (5 * Math.pow(e, 6)) / 256));

  const e1 = (1 - Math.sqrt(1 - Math.pow(e, 2))) / (1 + Math.sqrt(1 - Math.pow(e, 2)));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * Math.pow(e1, 2)) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu);

  const N1 = a / Math.sqrt(1 - Math.pow(e, 2) * Math.pow(Math.sin(phi1), 2));
  const T1 = Math.pow(Math.tan(phi1), 2);
  const C1 = e2 * Math.pow(Math.cos(phi1), 2);
  const R1 = (a * (1 - Math.pow(e, 2))) / Math.pow(1 - Math.pow(e, 2) * Math.pow(Math.sin(phi1), 2), 1.5);
  const D = xOffset / (N1 * k0);

  let lat =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      (Math.pow(D, 2) / 2 -
        (5 + 3 * T1 + 10 * C1 - 4 * Math.pow(C1, 2) - 9 * e2) * (Math.pow(D, 4) / 24) +
        (61 + 90 * T1 + 298 * C1 + 45 * Math.pow(T1, 2) - 252 * e2 - 3 * Math.pow(C1, 2)) * (Math.pow(D, 6) / 720));

  let lng =
    long0 +
    (D -
      (1 + 2 * T1 + C1) * (Math.pow(D, 3) / 6) +
      (5 - 2 * C1 + 28 * T1 - 3 * Math.pow(C1, 2) + 8 * e2 + 24 * Math.pow(T1, 2)) * (Math.pow(D, 5) / 120)) /
      Math.cos(phi1);

  lat = (lat * 180) / Math.PI;
  lng = (lng * 180) / Math.PI;

  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

// 解析路邊 XML
function parseRoadXml(xmlText: string): any[] {
  const parser = new XMLParser({
    ignoreAttributes: true,
    trimValues: true,
  });

  try {
    const parsedObj = parser.parse(xmlText);
    const roadQuery = parsedObj?.DATA || parsedObj?.TCMSV?.roadquery || parsedObj?.roadquery || parsedObj;
    let roadList = roadQuery?.ROAD || roadQuery?.road || [];

    if (!Array.isArray(roadList)) {
      roadList = [roadList];
    }

    return roadList.map((item: any) => ({
      dataType: 'roadside',
      roadSegID: String(item?.roadSegID || item?.roadSegId || ''),
      roadSegName: String(item?.roadSegName || ''),
      roadSegAvail: String(item?.roadSegAvail ?? '-99'),
      roadSegTotalValue: String(item?.roadSegTotalValue || item?.roadSegTotal || '0'),
      roadSegCarType: String(item?.roadSegCarType || '1'),
      roadSegFee: String(item?.roadSegFee || ''),
      roadSegtimeStart: String(item?.roadSegtimeStart || item?.roadSegTmStart || ''),
      roadSegtimeEnd: String(item?.roadSegtimeEnd || item?.roadSegTmEnd || ''),
      roadSegUpdatetime: String(item?.roadSegUpdatetime || item?.roadSegUpdateTm || ''),
      cellStatusList: item?.cellStatusList || null,
    }));
  } catch (e) {
    console.error('Failed to parse road XML:', e);
    return [];
  }
}

// 解析路外 JSON (靜態 + 動態合併)
function parseParkJson(descJson: any, availJson: any): any[] {
  const descList = descJson?.data?.park || [];
  const availList = availJson?.data?.park || [];

  // 以 id 建立動態車位對照 Map
  const availMap = new Map<string, any>();
  if (Array.isArray(availList)) {
    for (const item of availList) {
      if (item?.id) {
        availMap.set(String(item.id), item);
      }
    }
  }

  if (!Array.isArray(descList)) return [];

  const combinedParks: any[] = [];

  for (const park of descList) {
    if (!park || !park.id) continue;
    const parkId = String(park.id);
    const availItem = availMap.get(parkId);

    // 座標解析：優先用 EntrancecoordInfo (WGS84)，次之轉換 tw97
    let lat: number | null = null;
    let lng: number | null = null;

    const entranceInfo = park?.EntranceCoord?.EntrancecoordInfo;
    if (Array.isArray(entranceInfo) && entranceInfo.length > 0) {
      const x = parseFloat(entranceInfo[0]?.Xcod);
      const y = parseFloat(entranceInfo[0]?.Ycod);
      if (!isNaN(x) && !isNaN(y) && x > 0 && y > 0) {
        lat = x;
        lng = y;
      }
    }

    if (lat === null || lng === null) {
      const conv = twd97ToWgs84(park.tw97x, park.tw97y);
      if (conv) {
        lat = conv.lat;
        lng = conv.lng;
      }
    }

    combinedParks.push({
      dataType: 'offstreet',
      id: parkId,
      name: String(park.name || '臺北市路外停車場'),
      area: String(park.area || ''),
      address: String(park.address || ''),
      lat,
      lng,
      payex: String(park.payex || park.FareInfo?.WorkingDay || '依現場告示'),
      serviceTime: String(park.serviceTime || '24小時'),
      totalcar: parseInt(park.totalcar, 10) || 0,
      totalmotor: parseInt(park.totalmotor, 10) || 0,
      // 動態即時資訊 (若無則預設 -99 表示數據未定/維護中)
      availablecar: availItem ? (parseInt(availItem.availablecar, 10) ?? -99) : -99,
      availablemotor: availItem ? (parseInt(availItem.availablemotor, 10) ?? -99) : -99,
      availablebus: availItem ? (parseInt(availItem.availablebus, 10) ?? -99) : -99,
      availablehandicap: availItem ? (parseInt(availItem.availablehandicap, 10) ?? -99) : -99,
      availablepregnancy: availItem ? (parseInt(availItem.availablepregnancy, 10) ?? -99) : -99,
      updateTime: availItem?.ChargeStationInfo?.UpdateTime || new Date().toISOString(),
    });
  }

  return combinedParks;
}

async function fetchFreshData(): Promise<any[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const [roadRes, parkDescRes, parkAvailRes] = await Promise.all([
      fetch(TAIPEI_ROAD_XML_URL, { signal: controller.signal }),
      fetch(TAIPEI_PARK_DESC_URL, { signal: controller.signal }),
      fetch(TAIPEI_PARK_AVAIL_URL, { signal: controller.signal }),
    ]);

    clearTimeout(timeoutId);

    let roadData: any[] = [];
    if (roadRes.ok) {
      const xmlText = await roadRes.text();
      roadData = parseRoadXml(xmlText);
    } else {
      console.warn(`Taipei Road XML fetch warning status: ${roadRes.status}`);
    }

    let parkData: any[] = [];
    if (parkDescRes.ok) {
      const descJson = await parkDescRes.json();
      const availJson = parkAvailRes.ok ? await parkAvailRes.json() : null;
      parkData = parseParkJson(descJson, availJson);
    } else {
      console.warn(`Taipei Park Desc JSON fetch warning status: ${parkDescRes.status}`);
    }

    return [...roadData, ...parkData];
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('Taipei Open Data Fetch Error:', err?.message || err);
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
    return res.status(502).json({ error: '無法取得臺北市即時車位資料，請 5 分鐘後再試' });
  }

  await setCachedData(CACHE_KEY, freshData);
  res.setHeader('X-Cache', 'MISS');
  return res.status(200).json(freshData);
}
