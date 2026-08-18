import { City, ParkingSpot, SpotStatus, SpotType } from '../types/parking';
import { CITIES, CITIES_LIST, NEW_TAIPEI_DISTRICTS, TAICHUNG_DISTRICTS, TAIPEI_DISTRICTS } from '../config/cities.config';

export { CITIES, CITIES_LIST, NEW_TAIPEI_DISTRICTS, TAICHUNG_DISTRICTS, TAIPEI_DISTRICTS };

const TAIPEI_DISTRICT_CENTERS: Record<string, [number, number]> = {
  '中正區': [25.0324, 121.5190],
  '大安區': [25.0264, 121.5434],
  '信義區': [25.0330, 121.5654],
  '中山區': [25.0685, 121.5332],
  '松山區': [25.0599, 121.5574],
  '大同區': [25.0628, 121.5126],
  '萬華區': [25.0354, 121.4997],
  '文山區': [24.9892, 121.5701],
  '南港區': [25.0553, 121.6171],
  '內湖區': [25.0830, 121.5868],
  '士林區': [25.0928, 121.5245],
  '北投區': [25.1321, 121.4987],
};

function extractTaipeiDistrict(roadName: string): { district: string; center: [number, number] } {
  for (const dist of Object.keys(TAIPEI_DISTRICT_CENTERS)) {
    const key = dist.replace('區', '');
    if (roadName.includes(dist) || roadName.includes(key)) {
      return { district: dist, center: TAIPEI_DISTRICT_CENTERS[dist] };
    }
  }

  // 根據常見路名推導行政區
  if (roadName.includes('敦化') || roadName.includes('仁愛') || roadName.includes('和平') || roadName.includes('復興南')) {
    return { district: '大安區', center: TAIPEI_DISTRICT_CENTERS['大安區'] };
  }
  if (roadName.includes('忠孝東') || roadName.includes('基隆路')) {
    return { district: '信義區', center: TAIPEI_DISTRICT_CENTERS['信義區'] };
  }
  if (roadName.includes('重慶') || roadName.includes('愛國') || roadName.includes('羅斯福')) {
    return { district: '中正區', center: TAIPEI_DISTRICT_CENTERS['中正區'] };
  }
  if (roadName.includes('民權東') || roadName.includes('南京東') || roadName.includes('民生東')) {
    return { district: '松山區', center: TAIPEI_DISTRICT_CENTERS['松山區'] };
  }
  if (roadName.includes('重慶北') || roadName.includes('延平北') || roadName.includes('承德路一段') || roadName.includes('承德路二段')) {
    return { district: '大同區', center: TAIPEI_DISTRICT_CENTERS['大同區'] };
  }
  if (roadName.includes('西園') || roadName.includes('和平西') || roadName.includes('廣州')) {
    return { district: '萬華區', center: TAIPEI_DISTRICT_CENTERS['萬華區'] };
  }
  if (roadName.includes('木柵') || roadName.includes('景美') || roadName.includes('興隆')) {
    return { district: '文山區', center: TAIPEI_DISTRICT_CENTERS['文山區'] };
  }
  if (roadName.includes('瑞光') || roadName.includes('洲子') || roadName.includes('成功路') || roadName.includes('民權東路六段')) {
    return { district: '內湖區', center: TAIPEI_DISTRICT_CENTERS['內湖區'] };
  }
  if (roadName.includes('忠孝東路六段') || roadName.includes('忠孝東路七段') || roadName.includes('研究院')) {
    return { district: '南港區', center: TAIPEI_DISTRICT_CENTERS['南港區'] };
  }
  if (roadName.includes('天母') || roadName.includes('文林') || roadName.includes('承德路四段') || roadName.includes('承德路五段')) {
    return { district: '士林區', center: TAIPEI_DISTRICT_CENTERS['士林區'] };
  }
  if (roadName.includes('石牌') || roadName.includes('中央北') || roadName.includes('光明')) {
    return { district: '北投區', center: TAIPEI_DISTRICT_CENTERS['北投區'] };
  }

  // 預設為 中山區
  return { district: '中山區', center: TAIPEI_DISTRICT_CENTERS['中山區'] };
}

function adaptTaipeiData(rawData: any[]): ParkingSpot[] {
  if (!Array.isArray(rawData)) return [];

  return rawData.map((item, index) => {
    if (item.dataType === 'offstreet') {
      // 臺北市路外停車場 (有座標)
      const avail = parseInt(item.availablecar, 10);
      const total = parseInt(item.totalcar, 10) || 0;

      let status: SpotStatus = 'empty';
      let statusCode = 0;
      if (isNaN(avail) || avail < 0) {
        status = 'maintenance';
        statusCode = 2;
      } else if (avail === 0) {
        status = 'occupied';
        statusCode = 1;
      }

      const roadName = item.name || '臺北市路外停車場';
      let district = item.area ? (item.area.endsWith('區') ? item.area : `${item.area}區`) : '';
      if (!district) {
        const extracted = extractTaipeiDistrict(item.address || roadName);
        district = extracted.district;
      }

      const availDisplay = avail >= 0 ? `${avail}` : '未定';
      const addressDesc = item.address
        ? `${item.address} (剩餘車位: ${availDisplay}/${total > 0 ? total : '未知'})`
        : `剩餘車位: ${availDisplay}/${total > 0 ? total : '未知'}`;

      return {
        id: item.id ? `TPE-PARK-${item.id}` : `TPE-PARK-${index}`,
        city: 'taipei',
        district,
        roadName,
        addressDesc,
        lat: typeof item.lat === 'number' ? item.lat : null,
        lng: typeof item.lng === 'number' ? item.lng : null,
        status,
        statusCode,
        type: 'general',
        typeLabel: '路外停車場',
        feeInfo: item.payex || '依現場告示',
        payTime: item.serviceTime || '24小時',
        updatedAt: item.updateTime || new Date().toISOString(),
        rawSourceData: item,
      };
    }

    // 臺北市路邊停車格 (無座標，lat/lng 為 null)
    const avail = parseInt(item.roadSegAvail, 10);
    const total = parseInt(item.roadSegTotalValue, 10) || 0;

    let status: SpotStatus = 'empty';
    let statusCode = 0;
    if (isNaN(avail) || avail < 0) {
      status = 'maintenance';
      statusCode = 2;
    } else if (avail === 0) {
      status = 'occupied';
      statusCode = 1;
    }

    const roadName = item.roadSegName || `路段 #${item.roadSegID || index}`;
    const { district } = extractTaipeiDistrict(roadName);

    const carType = String(item.roadSegCarType || '1').toUpperCase();
    let spotType: SpotType = 'general';
    let typeLabel = '一般車格';

    if (carType === '2' || carType === 'M') {
      spotType = 'motorcycle';
      typeLabel = '機車格';
    } else if (carType === 'HM') {
      spotType = 'motorcycle';
      typeLabel = '重型機車格';
    } else if (carType === 'T') {
      spotType = 'loading';
      typeLabel = '大客車格';
    } else if (carType === 'CM') {
      spotType = 'general';
      typeLabel = '汽機車共用格';
    } else if (roadName.includes('身障') || roadName.includes('身心障礙')) {
      spotType = 'disability';
      typeLabel = '身障專用格';
    } else if (roadName.includes('孕婦') || roadName.includes('親')) {
      spotType = 'maternity';
      typeLabel = '孕婦親子格';
    } else if (roadName.includes('充') || roadName.includes('綠')) {
      spotType = 'charging';
      typeLabel = '綠能充電格';
    } else if (roadName.includes('卸貨') || roadName.includes('貨')) {
      spotType = 'loading';
      typeLabel = '裝卸貨專用';
    }

    const availDisplay = avail >= 0 ? `${avail}` : '未定';
    const addressDesc = `目前剩餘空位: ${availDisplay} / 總格數: ${total > 0 ? total : '未知'} (路段代號: ${item.roadSegID || index})`;

    const startTime = item.roadSegtimeStart || '07:00';
    const endTime = item.roadSegtimeEnd || '20:00';
    const payTime = `${startTime}-${endTime}`;

    let updatedAt = new Date().toISOString();
    if (item.roadSegUpdatetime && typeof item.roadSegUpdatetime === 'string' && item.roadSegUpdatetime.length >= 15) {
      const u = item.roadSegUpdatetime;
      updatedAt = `${u.slice(0, 4)}-${u.slice(4, 6)}-${u.slice(6, 8)}T${u.slice(9, 11)}:${u.slice(11, 13)}:${u.slice(13, 15)}`;
    }

    return {
      id: item.roadSegID ? `TPE-ROAD-${item.roadSegID}` : `TPE-ROAD-${index}`,
      city: 'taipei',
      district,
      roadName,
      addressDesc,
      lat: null,
      lng: null,
      status,
      statusCode,
      type: spotType,
      typeLabel,
      feeInfo: item.roadSegFee || '30元/小時',
      payTime,
      updatedAt,
      rawSourceData: item,
    };
  });
}

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

export async function fetchRealTaipeiSpots(): Promise<ParkingSpot[]> {
  return fetchRealSpotsForCity('taipei');
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

export const CITY_DATA_ADAPTERS: Record<string, (data: any[]) => ParkingSpot[]> = {
  taipei: adaptTaipeiData,
  newtaipei: adaptNewTaipeiData,
  taichung: adaptTaichungData,
};

