import { City, ParkingSpot, SpotStatus, SpotType } from '../types/parking';
import { CITIES, CITIES_LIST, NEW_TAIPEI_DISTRICTS, TAICHUNG_DISTRICTS, TAIPEI_DISTRICTS } from '../config/cities.config';
import { TAICHUNG_SECTION_DISTRICT_MAP } from '../config/taichungDistrictsMap';

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

const TAIPEI_KEYWORD_MAP: Record<string, string> = {
  // 士林區
  '前港': '士林區', '後港': '士林區', '社子': '士林區', '劍潭': '士林區', '基河': '士林區',
  '天母': '士林區', '至善': '士林區', '德行': '士林區', '忠誠': '士林區', '通河': '士林區',
  '芝山': '士林區', '福港': '士林區', '大南': '士林區', '文林': '士林區', '大興': '士林區',
  '承德路四段': '士林區', '承德路五段': '士林區', '延平北路五段': '士林區', '延平北路六段': '士林區',
  '延平北路七段': '士林區', '延平北路八段': '士林區', '延平北路九段': '士林區', '中正路': '士林區',

  // 中山區
  '中山北路一段': '中山區', '中山北路二段': '中山區', '中山北路三段': '中山區',
  '松江': '中山區', '林森': '中山區', '吉林': '中山區', '建國北路': '中山區',
  '新生北路': '中山區', '北安': '中山區', '明水': '中山區', '敬業': '中山區', '濱江': '中山區',

  // 大安區
  '敦化': '大安區', '仁愛路三段': '大安區', '仁愛路四段': '大安區',
  '信義路三段': '大安區', '信義路四段': '大安區', '和平東路一段': '大安區', '和平東路二段': '大安區',
  '復興南路': '大安區', '瑞安': '大安區', '建國南路': '大安區', '新生南路': '大安區', '永康': '大安區',

  // 信義區
  '市府': '信義區', '松高': '信義區', '松壽': '信義區', '松仁': '信義區', '松智': '信義區',
  '松廉': '信義區', '莊敬': '信義區', '忠孝東路四段': '大安區', '忠孝東路五段': '信義區',
  '基隆路一段': '信義區', '基隆路二段': '信義區', '吳興': '信義區', '松山路': '信義區',

  // 松山區
  '民生東路三段': '中山區', '民生東路四段': '松山區', '民生東路五段': '松山區',
  '南京東路三段': '中山區', '南京東路四段': '松山區', '南京東路五段': '松山區',
  '光復北路': '松山區', '八德路三段': '松山區', '八德路四段': '松山區',
  '三民': '松山區', '富錦': '松山區', '延壽': '松山區', '慶城': '松山區',

  // 中正區
  '重慶南路': '中正區', '愛國': '中正區', '羅斯福路一段': '中正區', '羅斯福路二段': '中正區',
  '羅斯福路三段': '中正區', '博愛': '中正區', '桃源': '中正區', '延平南路': '中正區',
  '南海': '中正區', '汀州路': '中正區', '濟南': '中正區', '青島': '中正區',

  // 大同區
  '重慶北路': '大同區', '延平北路一段': '大同區', '延平北路二段': '大同區',
  '延平北路三段': '大同區', '延平北路四段': '大同區', '承德路一段': '大同區',
  '承德路二段': '大同區', '承德路三段': '大同區', '南京西路': '大同區',
  '民生西路': '大同區', '迪化': '大同區', '太原': '大同區', '長安西路': '大同區',

  // 萬華區
  '西園': '萬華區', '和平西路': '萬華區', '廣州': '萬華區', '萬大': '萬華區',
  '康定': '萬華區', '昆明': '萬華區', '漢中': '萬華區', '中華路': '萬華區', '桂林': '萬華區',

  // 文山區
  '木柵': '文山區', '景美': '文山區', '興隆': '文山區', '指南': '文山區',
  '政大': '文山區', '辛亥路四段': '文山區', '辛亥路五段': '文山區', '辛亥路六段': '文山區',
  '羅斯福路五段': '文山區', '羅斯福路六段': '文山區', '萬芳': '文山區',

  // 內湖區
  '瑞光': '內湖區', '洲子': '內湖區', '成功路': '內湖區', '民權東路六段': '內湖區',
  '行善': '內湖區', '舊宗': '內湖區', '康寧': '內湖區', '東湖': '內湖區', '金莊': '內湖區', '環山': '內湖區',

  // 南港區
  '忠孝東路六段': '南港區', '忠孝東路七段': '南港區', '研究院': '南港區',
  '重陽路': '南港區', '三重路': '南港區', '經貿': '南港區', '園區': '南港區', '新風': '南港區',

  // 北投區
  '石牌': '北投區', '中央北路': '北投區', '光明路': '北投區', '新北投': '北投區',
  '磺港': '北投區', '大業': '北投區', '立農': '北投區', '西安街': '北投區', '東華街': '北投區', '溫泉': '北投區',
};

function extractTaipeiDistrict(roadName: string): { district: string; center: [number, number] } {
  for (const dist of Object.keys(TAIPEI_DISTRICT_CENTERS)) {
    const key = dist.replace('區', '');
    if (roadName.includes(dist) || roadName.includes(key)) {
      return { district: dist, center: TAIPEI_DISTRICT_CENTERS[dist] };
    }
  }

  // 根據擴充關鍵字詞典推導行政區
  for (const [kw, district] of Object.entries(TAIPEI_KEYWORD_MAP)) {
    if (roadName.includes(kw)) {
      return { district, center: TAIPEI_DISTRICT_CENTERS[district] || TAIPEI_DISTRICT_CENTERS['中山區'] };
    }
  }

  // 辨識不出來一律標記為「其他區」，避免靜默兜底至任何具體行政區
  return { district: '其他區', center: TAIPEI_DISTRICT_CENTERS['中山區'] };
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
    const sectionId = String(item.Section_ID || '');
    const district = item.District || item.Area || TAICHUNG_SECTION_DISTRICT_MAP[sectionId] || '其他區';

    return {
      id,
      city: 'taichung',
      district,
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

