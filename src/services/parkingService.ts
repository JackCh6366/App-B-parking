import { City, ParkingSpot, SpotStatus, SpotType } from '../types/parking';
import { CITIES, CITIES_LIST, NEW_TAIPEI_DISTRICTS, TAICHUNG_DISTRICTS, TAIPEI_DISTRICTS } from '../config/cities.config';
import { TAICHUNG_SECTION_DISTRICT_MAP } from '../config/taichungDistrictsMap';
import { TAICHUNG_SECTION_MAP } from '../config/taichungSectionMap';

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
    const total = parseInt(item.roadSegTotalValue, 10) || 0;
    const rawAvail = parseInt(item.roadSegAvail, 10);
    const roadName = item.roadSegName || `路段 #${item.roadSegID || index}`;
    const { district } = extractTaipeiDistrict(roadName);

    // 解析 cellStatusList 節點 (若存在實體地磁感測器)
    let hasCells = false;
    let emptyCount = 0;   // cellStatus === '0'
    let occupiedCount = 0; // cellStatus === '1'
    let offlineCount = 0;  // cellStatus === '2'
    let totalSensors = 0;

    if (item.cellStatusList && item.cellStatusList.cell) {
      const cells = Array.isArray(item.cellStatusList.cell)
        ? item.cellStatusList.cell
        : [item.cellStatusList.cell];
      if (cells.length > 0) {
        hasCells = true;
        totalSensors = cells.length;
        cells.forEach((c: any) => {
          const st = String(c.cellStatus);
          if (st === '0') emptyCount++;
          else if (st === '1') occupiedCount++;
          else if (st === '2') offlineCount++;
        });
      }
    }

    let status: SpotStatus = 'unknown';
    let statusCode = 3;
    let addressDesc = '';
    let sensorDetail: ParkingSpot['sensorDetail'];

    if (hasCells) {
      // 1. 地磁感測器即時直算 (最高可信度)
      sensorDetail = {
        dataSource: 'geomagnetic',
        emptyCount,
        occupiedCount,
        offlineCount,
        totalSensors,
        totalSpaces: total,
      };

      if (emptyCount > 0) {
        status = 'empty';
        statusCode = 0;
      } else if (occupiedCount > 0) {
        status = 'occupied';
        statusCode = 1;
      } else {
        status = 'unknown';
        statusCode = 3;
      }

      const offlineText = offlineCount > 0 ? ` | 訊號離線: ${offlineCount} 格` : '';
      addressDesc = `即時空位: ${emptyCount} 格 | 有車: ${occupiedCount} 格${offlineText} | 總格數: ${total > 0 ? total : totalSensors} 格 (地磁覆蓋 ${totalSensors} 格)`;

    } else if (!isNaN(rawAvail) && rawAvail >= 0) {
      // 2. 官方頂層概估值 (次要可信度)
      sensorDetail = {
        dataSource: 'estimate',
        emptyCount: rawAvail,
        totalSpaces: total,
      };

      if (rawAvail > 0) {
        status = 'empty';
        statusCode = 0;
      } else {
        status = 'occupied';
        statusCode = 1;
      }

      addressDesc = `剩餘空位: ${rawAvail} 格 (官方概估值) | 總格數: ${total > 0 ? total : '未知'}`;

    } else {
      // 3. 無即時動態/未感測路段 (rawAvail === -99)
      sensorDetail = {
        dataSource: 'none',
        totalSpaces: total,
      };

      status = 'unknown';
      statusCode = 3;
      addressDesc = `無即時動態資訊 (請依現場標示為準) | 總格數: ${total > 0 ? total : '未知'}`;
    }

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
      sensorDetail,
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

  const grouped = new Map<string, any[]>();
  for (const item of rawData) {
    if (!item) continue;
    const district = item.district || item.area_name || item.AREA_NAME || NTP_AREA_CODE_MAP[item.areacode] || '新北市';
    const roadName = item.roadname || item.road_name || item.ROAD_NAME || item.address || '路段名稱';
    const groupKey = `${district}__${roadName}`;
    const existing = grouped.get(groupKey) || [];
    existing.push(item);
    grouped.set(groupKey, existing);
  }

  const result: ParkingSpot[] = [];

  grouped.forEach((items, groupKey) => {
    const [district, roadName] = groupKey.split('__');
    let emptyCount = 0;
    let occupiedCount = 0;
    let offlineCount = 0;

    let latSum = 0;
    let lngSum = 0;
    let validCoordCount = 0;

    const cellList: Array<{
      cellId: string;
      status: SpotStatus;
      statusCode: number;
      lat?: number | null;
      lng?: number | null;
    }> = [];

    const firstItem = items[0] || {};
    const payTime = firstItem.pay_time || (firstItem.day && firstItem.hour ? `${firstItem.day} ${firstItem.hour}` : '08:00-20:00');
    const feeInfo = firstItem.fee || firstItem.paycash || firstItem.pay || '20元/小時';

    items.forEach((item, idx) => {
      const isFree = item.cellstatus === 'N' || item.parkingstatus === '2' || item.parkingstatus === 2 || item.is_free === '1' || item.status === '0' || item.status === 0 || item.STATUS === '0' || item.STATUS === 0;
      const status: SpotStatus = isFree ? 'empty' : 'occupied';
      const statusCode = isFree ? 0 : 1;

      if (isFree) emptyCount++;
      else occupiedCount++;

      const lat = parseFloat(item.latitude || item.lat || item.LATITUDE);
      const lng = parseFloat(item.longitude || item.lng || item.LONGITUDE);

      if (!isNaN(lat) && !isNaN(lng) && lat >= 21.8 && lat <= 25.5 && lng >= 119.5 && lng <= 122.5) {
        latSum += lat;
        lngSum += lng;
        validCoordCount++;
      }

      cellList.push({
        cellId: String(item.cellid || item.id || idx),
        status,
        statusCode,
        lat: !isNaN(lat) ? lat : null,
        lng: !isNaN(lng) ? lng : null,
      });
    });

    const totalSpaces = items.length;
    const roadStatus: SpotStatus = emptyCount > 0 ? 'empty' : 'occupied';
    const roadStatusCode = emptyCount > 0 ? 0 : 1;

    const avgLat = validCoordCount > 0 ? Number((latSum / validCoordCount).toFixed(6)) : 25.0118;
    const avgLng = validCoordCount > 0 ? Number((lngSum / validCoordCount).toFixed(6)) : 121.4658;

    const addressDesc = `即時空位: ${emptyCount} 格 | 有車: ${occupiedCount} 格 | 總格數: ${totalSpaces} 格 (即時動態感測)`;

    result.push({
      id: `NTP-ROAD-${district}-${roadName}`,
      city: 'newtaipei',
      district,
      roadName,
      addressDesc,
      lat: avgLat,
      lng: avgLng,
      status: roadStatus,
      statusCode: roadStatusCode,
      type: 'general',
      typeLabel: '一般車格',
      feeInfo,
      payTime,
      updatedAt: firstItem.update_time || new Date().toISOString(),
      sensorDetail: {
        dataSource: 'realtime_sensor',
        emptyCount,
        occupiedCount,
        offlineCount,
        totalSensors: totalSpaces,
        totalSpaces,
        cellList,
      },
      rawSourceData: items,
    });
  });

  return result;
}

function adaptTaichungData(rawData: any[]): ParkingSpot[] {
  if (!Array.isArray(rawData)) return [];

  const grouped = new Map<string, any[]>();
  for (const item of rawData) {
    if (!item) continue;
    const secId = String(item.Section_ID || item.section_id || '000');
    const existing = grouped.get(secId) || [];
    existing.push(item);
    grouped.set(secId, existing);
  }

  const result: ParkingSpot[] = [];

  grouped.forEach((items, secId) => {
    const secInfo = TAICHUNG_SECTION_MAP[secId];
    const rawRoadName = secInfo?.roadName || (secId !== '000' ? `路段 #${secId}` : '路段名稱');
    const district = secInfo?.district || TAICHUNG_SECTION_DISTRICT_MAP[secId] || '其他區';
    const isApproximate = secInfo?.isApproximate || false;
    const riskNote = secInfo?.riskNote || undefined;

    const roadName = isApproximate && !rawRoadName.startsWith('約 ') ? `約 ${rawRoadName}` : rawRoadName;

    let emptyCount = 0;
    let occupiedCount = 0;
    let offlineCount = 0;

    let latSum = 0;
    let lngSum = 0;
    let validCoordCount = 0;

    const cellList: Array<{
      cellId: string;
      status: SpotStatus;
      statusCode: number;
      lat?: number | null;
      lng?: number | null;
    }> = [];

    const firstItem = items[0] || {};
    const payTime = firstItem.PayTime || '08:00-18:00';
    const feeInfo = firstItem.Fee || '20元/小時';

    items.forEach((item, idx) => {
      const statusCode = Number(item.status ?? item.Status ?? 0);
      let status: SpotStatus = 'empty';
      if (statusCode === 1) {
        status = 'occupied';
        occupiedCount++;
      } else if (statusCode === 2) {
        status = 'maintenance';
        offlineCount++;
      } else {
        status = 'empty';
        emptyCount++;
      }

      const lat = parseFloat(item.Lat || item.Latitude || item.lat);
      const lng = parseFloat(item.Lng || item.Longitude || item.lng);

      if (!isNaN(lat) && !isNaN(lng) && lat >= 21.8 && lat <= 25.5 && lng >= 119.5 && lng <= 122.5) {
        latSum += lat;
        lngSum += lng;
        validCoordCount++;
      }

      cellList.push({
        cellId: String(item.PS_ID || idx),
        status,
        statusCode,
        lat: !isNaN(lat) ? lat : null,
        lng: !isNaN(lng) ? lng : null,
      });
    });

    const totalSpaces = items.length;
    let roadStatus: SpotStatus = 'empty';
    let roadStatusCode = 0;

    if (emptyCount > 0) {
      roadStatus = 'empty';
      roadStatusCode = 0;
    } else if (occupiedCount > 0) {
      roadStatus = 'occupied';
      roadStatusCode = 1;
    } else {
      roadStatus = 'maintenance';
      roadStatusCode = 2;
    }

    const avgLat = validCoordCount > 0 ? Number((latSum / validCoordCount).toFixed(6)) : 24.1627;
    const avgLng = validCoordCount > 0 ? Number((lngSum / validCoordCount).toFixed(6)) : 120.6471;

    const offlineText = offlineCount > 0 ? ` | 維護中: ${offlineCount} 格` : '';
    const addressDesc = `即時空位: ${emptyCount} 格 | 有車: ${occupiedCount} 格${offlineText} | 總格數: ${totalSpaces} 格 (即時動態感測)`;

    result.push({
      id: `TCC-ROAD-${secId}`,
      city: 'taichung',
      district,
      roadName,
      addressDesc,
      lat: avgLat,
      lng: avgLng,
      status: roadStatus,
      statusCode: roadStatusCode,
      type: 'general',
      typeLabel: '一般車格',
      feeInfo,
      payTime,
      updatedAt: firstItem.UpdateTime || new Date().toISOString(),
      sensorDetail: {
        dataSource: 'realtime_sensor',
        emptyCount,
        occupiedCount,
        offlineCount,
        totalSensors: totalSpaces,
        totalSpaces,
        isApproximate,
        riskNote,
        cellList,
      },
      rawSourceData: items,
    });
  });

  return result;
}

export const CITY_DATA_ADAPTERS: Record<string, (data: any[]) => ParkingSpot[]> = {
  taipei: adaptTaipeiData,
  newtaipei: adaptNewTaipeiData,
  taichung: adaptTaichungData,
};
