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

function adaptNewTaipeiData(rawData: any[]): ParkingSpot[] {
  if (!Array.isArray(rawData)) return [];
  return rawData.map((item, index) => {
    const isFree = item.is_free === '1' || item.status === '0' || item.status === 0 || item.STATUS === '0' || item.STATUS === 0;
    return {
      id: item.ps_id || item.ID || `NTP-${index}`,
      city: 'newtaipei',
      district: item.district || item.area_name || item.AREA_NAME || '新北市',
      roadName: item.road_name || item.ROAD_NAME || item.address || '路段名稱',
      addressDesc: item.address || item.ADDRESS || '',
      lat: parseFloat(item.lat || item.latitude || item.LATITUDE) || 25.0118,
      lng: parseFloat(item.lng || item.longitude || item.LONGITUDE) || 121.4658,
      status: isFree ? 'empty' : 'occupied',
      statusCode: isFree ? 0 : 1,
      type: (item.space_type as SpotType) || 'general',
      typeLabel: item.type_label || '一般車格',
      feeInfo: item.fee || '20元/小時',
      payTime: item.pay_time || '08:00-20:00',
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

    const spotTypeRaw = item.PS_type || item.Type || 'general';
    let spotType: SpotType = 'general';
    let typeLabel = '一般車格';
    if (spotTypeRaw.includes('身障') || spotTypeRaw === 'disability') {
      spotType = 'disability';
      typeLabel = '身障專用格';
    } else if (spotTypeRaw.includes('孕婦') || spotTypeRaw.includes('親') || spotTypeRaw === 'maternity') {
      spotType = 'maternity';
      typeLabel = '孕婦親子格';
    } else if (spotTypeRaw.includes('充') || spotTypeRaw.includes('綠') || spotTypeRaw === 'charging') {
      spotType = 'charging';
      typeLabel = '綠能充電格';
    } else if (spotTypeRaw.includes('貨') || spotTypeRaw === 'loading') {
      spotType = 'loading';
      typeLabel = '裝卸貨專用';
    }

    return {
      id: item.PS_ID || item.SpaceID || item.ID || `TCC-${index}`,
      city: 'taichung',
      district: item.District || item.Area || item.Section_ID || '臺中市',
      roadName: item.RoadName || item.Address || item.road || '路段名稱',
      addressDesc: item.Address || item.addressDesc || '',
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
