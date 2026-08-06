import { CityInfo } from '../types/parking';

export const NEW_TAIPEI_DISTRICTS = [
  '板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '土城區', '蘆洲區', '樹林區',
  '汐止區', '鶯歌區', '三峽區', '淡水區', '瑞芳區', '五股區', '泰山區', '林口區', '深坑區',
  '石碇區', '坪林區', '三芝區', '石門區', '八里區', '平溪區', '雙溪區', '貢寮區', '金山區',
  '萬里區', '烏來區'
];

export const TAICHUNG_DISTRICTS = [
  '中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區',
  '大里區', '霧峰區', '烏日區', '豐原區', '后里區', '石岡區', '東勢區', '和平區',
  '新社區', '潭子區', '大雅區', '神岡區', '大肚區', '沙鹿區', '龍井區', '梧棲區',
  '清水區', '大甲區', '外埔區', '大安區'
];

export const CITIES_LIST: CityInfo[] = [
  {
    id: 'newtaipei',
    name: '新北市',
    shortName: '新北',
    center: [25.0118, 121.4658], // 板橋車站周邊
    zoom: 13,
    description: '整合新北市全轄 29 個行政區即時路邊停車感測器狀態',
    apiEndpointDoc: '新北市政府資料開放平台 - 路邊停車即時空位資料 API',
    districts: NEW_TAIPEI_DISTRICTS
  },
  {
    id: 'taichung',
    name: '臺中市',
    shortName: '台中',
    center: [24.1627, 120.6471], // 臺中市政府/七期周邊
    zoom: 13,
    description: '整合臺中市全轄 29 個行政區路邊地磁感測器即時停車狀態',
    apiEndpointDoc: '臺中市政府資料開放平台 - 路邊停車剩餘車位即時 API (0=空位, 1=有車, 2=故障)',
    districts: TAICHUNG_DISTRICTS
  }
];

export const CITIES: Record<string, CityInfo> = CITIES_LIST.reduce((acc, city) => {
  acc[city.id] = city;
  return acc;
}, {} as Record<string, CityInfo>);
