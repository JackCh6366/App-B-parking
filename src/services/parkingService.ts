import { City, ParkingSpot, SpotStatus, SpotType } from '../types/parking';
import { CITIES, CITIES_LIST, NEW_TAIPEI_DISTRICTS, TAICHUNG_DISTRICTS } from '../config/cities.config';

export { CITIES, CITIES_LIST, NEW_TAIPEI_DISTRICTS, TAICHUNG_DISTRICTS };

export const CITY_DATA_ADAPTERS: Record<string, (data: any[]) => ParkingSpot[]> = {
  newtaipei: adaptNewTaipeiData,
  taichung: adaptTaichungData,
};

export async function fetchRealSpotsForCity(cityId: string): Promise<ParkingSpot[]> {
  const response = await fetch(`/api/parking/${cityId}`);
  if (!response.ok) {
    let errMessage = '無法取得即時車位資料，請 5 分鐘後再試';
    try {
      const errJson = await response.json();
      if (errJson?.error) errMessage = errJson.error;
    } catch (_) {}
    throw new Error(errMessage);
  }
  
  const data = await response.json();
  const adapter = CITY_DATA_ADAPTERS[cityId];
  if (adapter) {
    return adapter(data);
  }
  return Array.isArray(data) ? data : [];
}

export async function fetchParkingSpots(cityId: string): Promise<ParkingSpot[]> {
  return fetchRealSpotsForCity(cityId);
}

export async function fetchRealNewTaipeiSpots(): Promise<ParkingSpot[]> {
  return fetchRealSpotsForCity('newtaipei');
}

export async function fetchRealTaichungSpots(): Promise<ParkingSpot[]> {
  return fetchRealSpotsForCity('taichung');
}

const NTP_AREA_CODE_MAP: Record<string, string> = {
  '65000010': '板橋區',
  '65000020': '三重區',
  '65000030': '中和區',
  '65000040': '永和區',
  '65000050': '新莊區',
  '65000060': '新店區',
  '65000070': '樹林區',
  '65000080': '鶯歌區',
  '65000090': '三峽區',
  '65000100': '淡水區',
  '65000110': '汐止區',
  '65000130': '土城區',
  '65000140': '蘆洲區',
  '65000150': '五股區',
  '65000160': '泰山區',
  '65000170': '林口區',
  '65000180': '深坑區',
  '65000230': '八里區',
};

function adaptNewTaipeiData(rawData: any[]): ParkingSpot[] {
  if (!Array.isArray(rawData)) return [];
  return rawData.map((item, index) => {
    // 新北市 cellstatus: 'N' (空位/無車), 'Y' (有車/Occupied)
    // parkingstatus: '2' (空位/無車), '1' (有車/Occupied)
    const isFree = item.cellstatus === 'N' || item.parkingstatus === '2' || item.parkingstatus === 2 || item.is_free === '1' || item.status === '0' || item.status === 0 || item.STATUS === '0' || item.STATUS === 0;

    let spotType: SpotType = 'general';
    let typeLabel = '一般車格';
    const nameStr = item.name || item.type_label || '';
    if (nameStr.includes('身心障礙') || nameStr.includes('身障')) {
      spotType = 'disability';
      typeLabel = '身障專用格';
    } else if (nameStr.includes('孕婦') || nameStr.includes('親') || nameStr.includes('接送')) {
      spotType = 'maternity';
      typeLabel = '孕婦親子格';
    } else if (nameStr.includes('充') || nameStr.includes('綠')) {
      spotType = 'charging';
      typeLabel = '綠能充電格';
    } else if (nameStr.includes('卸貨') || nameStr.includes('貨')) {
      spotType = 'loading';
      typeLabel = '裝卸貨專用';
    }

    const district = item.district || item.area_name || item.AREA_NAME || NTP_AREA_CODE_MAP[item.areacode] || '新北市';
    const payTime = item.pay_time || (item.day && item.hour ? `${item.day} ${item.hour}` : '08:00-20:00');
    const feeInfo = item.fee || item.paycash || item.pay || '20元/小時';

    return {
      id: item.cellid ? `NTP-${item.cellid}` : (item.id || item.ps_id || item.ID || `NTP-${index}`),
      city: 'newtaipei',
      district,
      roadName: item.roadname || item.road_name || item.ROAD_NAME || item.address || '路段名稱',
      addressDesc: item.address || item.ADDRESS || item.roadname || '',
      lat: parseFloat(item.latitude || item.lat || item.LATITUDE) || 25.0118,
      lng: parseFloat(item.longitude || item.lng || item.LONGITUDE) || 121.4658,
      status: isFree ? 'empty' : 'occupied',
      statusCode: isFree ? 0 : 1,
      type: spotType,
      typeLabel,
      feeInfo,
      payTime,
      updatedAt: item.update_time || new Date().toISOString(),
      rawSourceData: item
    };
  });
}

function adaptTaichungData(rawData: any[]): ParkingSpot[] {
  if (!Array.isArray(rawData)) return [];
  return rawData.map((item, index) => {
    // 臺中市定義: 0=空、1=有車、2=故障
    const statusCode = Number(item.status ?? item.Status ?? 0);
    let status: SpotStatus = 'empty';
    if (statusCode === 1) status = 'occupied';
    else if (statusCode === 2) status = 'maintenance';

    const spotTypeRaw = String(item.PS_type ?? item.Type ?? '0');
    let spotType: SpotType = 'general';
    let typeLabel = '一般車格';
    if (spotTypeRaw === '1' || spotTypeRaw.includes('身障') || spotTypeRaw === 'disability') {
      spotType = 'disability';
      typeLabel = '身障專用格';
    } else if (spotTypeRaw === '4' || spotTypeRaw.includes('孕婦') || spotTypeRaw.includes('親') || spotTypeRaw === 'maternity') {
      spotType = 'maternity';
      typeLabel = '孕婦親子格';
    } else if (spotTypeRaw === '3' || spotTypeRaw.includes('充') || spotTypeRaw.includes('綠') || spotTypeRaw === 'charging') {
      spotType = 'charging';
      typeLabel = '綠能充電格';
    } else if (spotTypeRaw === '2' || spotTypeRaw.includes('貨') || spotTypeRaw === 'loading') {
      spotType = 'loading';
      typeLabel = '裝卸貨專用';
    }

    const id = item.Section_ID && item.PS_ID ? `TCC-${item.Section_ID}-${item.PS_ID}` : (item.PS_ID || item.SpaceID || item.ID || `TCC-${index}`);

    return {
      id,
      city: 'taichung',
      district: item.District || item.Area || '臺中市',
      roadName: item.RoadName || item.Address || (item.Section_ID ? `路段 #${item.Section_ID}` : '路段名稱'),
      addressDesc: item.Address || item.addressDesc || (item.Section_ID ? `車格 #${item.PS_ID || ''}` : ''),
      lat: parseFloat(item.Lat || item.Latitude || item.lat) || 24.1627,
      lng: parseFloat(item.Lng || item.Longitude || item.lng) || 120.6471,
      status,
      statusCode,
      type: spotType,
      typeLabel,
      feeInfo: item.Fee || '20元/小時',
      payTime: item.PayTime || '08:00-18:00',
      updatedAt: item.UpdateTime || new Date().toISOString(),
      rawSourceData: item
    };
  });
}

