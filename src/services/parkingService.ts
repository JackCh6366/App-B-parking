import { City, CityInfo, ParkingSpot, SpotStatus, SpotType } from '../types/parking';

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

export const CITIES: Record<City, CityInfo> = {
  newtaipei: {
    id: 'newtaipei',
    name: '新北市',
    shortName: '新北',
    center: [25.0118, 121.4658], // 板橋車站周邊
    zoom: 13,
    description: '整合新北市全轄 29 個行政區即時路邊停車感測器狀態',
    apiEndpointDoc: '新北市政府資料開放平台 - 路邊停車即時空位資料 API',
    districts: NEW_TAIPEI_DISTRICTS
  },
  taichung: {
    id: 'taichung',
    name: '臺中市',
    shortName: '台中',
    center: [24.1627, 120.6471], // 臺中市政府/七期周邊
    zoom: 13,
    description: '整合臺中市全轄 29 個行政區路邊地磁感測器即時停車狀態',
    apiEndpointDoc: '臺中市政府資料開放平台 - 路邊停車剩餘車位即時 API (0=空位, 1=有車, 2=故障)',
    districts: TAICHUNG_DISTRICTS
  }
};

// 模擬動態改變車位狀態的記憶體狀態對照表
const dynamicStatusMap: Record<string, SpotStatus> = {};

/**
 * 基礎車位靜態樣本資料 (涵蓋新北與台中精華路段)
 */
const BASE_MOCK_SPOTS: ParkingSpot[] = [
  // ================= 新北市 (New Taipei City - 全轄 29 區) =================
  {
    id: 'NTP-BQ-001',
    city: 'newtaipei',
    district: '板橋區',
    roadName: '縣民大道二段',
    addressDesc: '新北市民廣場旁 (靠近新府路口)',
    lat: 25.0131,
    lng: 121.4649,
    status: 'empty',
    statusCode: 0,
    type: 'charging',
    typeLabel: '綠能充電格',
    feeInfo: '30元/小時 (含充電服務費)',
    payTime: '07:00-22:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-BQ-002',
    city: 'newtaipei',
    district: '板橋區',
    roadName: '縣民大道二段',
    addressDesc: '板橋車站南二門對面',
    lat: 25.0125,
    lng: 121.4655,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '07:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-BQ-003',
    city: 'newtaipei',
    district: '板橋區',
    roadName: '新府路',
    addressDesc: '新北市政府後方 (新府路1號前)',
    lat: 25.0108,
    lng: 121.4642,
    status: 'empty',
    statusCode: 0,
    type: 'disability',
    typeLabel: '身障專用格',
    feeInfo: '前2小時免費，之後20元/小時',
    payTime: '07:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-SC-001',
    city: 'newtaipei',
    district: '三重區',
    roadName: '正義北路',
    addressDesc: '正義北路180號對面 (靠近三重國小站)',
    lat: 25.0682,
    lng: 121.4985,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-ZH-001',
    city: 'newtaipei',
    district: '中和區',
    roadName: '中山路二段',
    addressDesc: '環球購物中心中和店周邊',
    lat: 25.0012,
    lng: 121.5035,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '07:30-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-YH-001',
    city: 'newtaipei',
    district: '永和區',
    roadName: '中正路',
    addressDesc: '樂華夜市入口周邊 (中正路與永和路口)',
    lat: 25.0085,
    lng: 121.5160,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-XJ-001',
    city: 'newtaipei',
    district: '新莊區',
    roadName: '中正路',
    addressDesc: '輔仁大學正門斜對面',
    lat: 25.0360,
    lng: 121.4502,
    status: 'empty',
    statusCode: 0,
    type: 'charging',
    typeLabel: '綠能充電格',
    feeInfo: '30元/小時',
    payTime: '08:00-22:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-XD-001',
    city: 'newtaipei',
    district: '新店區',
    roadName: '北新路二段',
    addressDesc: '捷運七張站1號出口前',
    lat: 24.9685,
    lng: 121.5412,
    status: 'empty',
    statusCode: 0,
    type: 'disability',
    typeLabel: '身障專用格',
    feeInfo: '免費2小時，之後20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-TC-001',
    city: 'newtaipei',
    district: '土城區',
    roadName: '中央路二段',
    addressDesc: '捷運海山站2號出口旁',
    lat: 24.9722,
    lng: 121.4445,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-LZ-001',
    city: 'newtaipei',
    district: '蘆洲區',
    roadName: '中山一路',
    addressDesc: '徐匯廣場後方',
    lat: 25.0845,
    lng: 121.4782,
    status: 'empty',
    statusCode: 0,
    type: 'maternity',
    typeLabel: '孕婦親子格',
    feeInfo: '20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-SL-001',
    city: 'newtaipei',
    district: '樹林區',
    roadName: '中山路一段',
    addressDesc: '樹林火車站後站出口前',
    lat: 24.9902,
    lng: 121.4248,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-XZ-001',
    city: 'newtaipei',
    district: '汐止區',
    roadName: '新台五路一段',
    addressDesc: '遠雄 U-TOWN 購物中心前方',
    lat: 25.0628,
    lng: 121.6582,
    status: 'empty',
    statusCode: 0,
    type: 'charging',
    typeLabel: '綠能充電格',
    feeInfo: '30元/小時',
    payTime: '08:00-22:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-YG-001',
    city: 'newtaipei',
    district: '鶯歌區',
    roadName: '文化路',
    addressDesc: '鶯歌陶瓷老街路口旁',
    lat: 24.9542,
    lng: 121.3548,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '09:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-SX-001',
    city: 'newtaipei',
    district: '三峽區',
    roadName: '中正路一段',
    addressDesc: '三峽老街入口周邊 (民權街口)',
    lat: 24.9332,
    lng: 121.3695,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '09:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-TS-001',
    city: 'newtaipei',
    district: '淡水區',
    roadName: '中正路',
    addressDesc: '淡水老街停車區 (馬偕雕像附近)',
    lat: 25.1718,
    lng: 121.4395,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '30元/小時',
    payTime: '09:00-21:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-RF-001',
    city: 'newtaipei',
    district: '瑞芳區',
    roadName: '明燈路三段',
    addressDesc: '瑞芳火車站站前廣場旁',
    lat: 25.1085,
    lng: 121.8062,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-WG-001',
    city: 'newtaipei',
    district: '五股區',
    roadName: '成泰路三段',
    addressDesc: '洲子洋公園旁',
    lat: 25.0832,
    lng: 121.4382,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-TY-001',
    city: 'newtaipei',
    district: '泰山區',
    roadName: '明志路二段',
    addressDesc: '泰山區公所前方',
    lat: 25.0585,
    lng: 121.4285,
    status: 'empty',
    statusCode: 0,
    type: 'disability',
    typeLabel: '身障專用格',
    feeInfo: '免費2小時，之後20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-LK-001',
    city: 'newtaipei',
    district: '林口區',
    roadName: '文化二路一段',
    addressDesc: '三井 Outlet 側門周邊',
    lat: 25.0785,
    lng: 121.3685,
    status: 'empty',
    statusCode: 0,
    type: 'charging',
    typeLabel: '綠能充電格',
    feeInfo: '30元/小時',
    payTime: '08:00-22:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-SK-001',
    city: 'newtaipei',
    district: '深坑區',
    roadName: '北深路三段',
    addressDesc: '深坑老街入口處',
    lat: 25.0018,
    lng: 121.6152,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '09:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-SD-001',
    city: 'newtaipei',
    district: '石碇區',
    roadName: '石碇東街',
    addressDesc: '石碇老街入口停車格',
    lat: 24.9912,
    lng: 121.6582,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/次',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-PL-001',
    city: 'newtaipei',
    district: '坪林區',
    roadName: '坪林街',
    addressDesc: '坪林茶業博物館旁',
    lat: 24.9385,
    lng: 121.7112,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-SZ-001',
    city: 'newtaipei',
    district: '三芝區',
    roadName: '中山路二段',
    addressDesc: '三芝淺水灣公園入口',
    lat: 25.2582,
    lng: 121.5012,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-SM-001',
    city: 'newtaipei',
    district: '石門區',
    roadName: '中央路',
    addressDesc: '富貴角燈塔園區前',
    lat: 25.2912,
    lng: 121.5682,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/次',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-BL-001',
    city: 'newtaipei',
    district: '八里區',
    roadName: '中華路二段',
    addressDesc: '八里渡船頭老街側門',
    lat: 25.1485,
    lng: 121.3982,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-PX-001',
    city: 'newtaipei',
    district: '平溪區',
    roadName: '平溪街',
    addressDesc: '平溪火車站周邊',
    lat: 25.0252,
    lng: 121.7382,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/次',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-SS-001',
    city: 'newtaipei',
    district: '雙溪區',
    roadName: '中華路',
    addressDesc: '雙溪火車站廣場前',
    lat: 25.0352,
    lng: 121.8652,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-GL-001',
    city: 'newtaipei',
    district: '貢寮區',
    roadName: '朝陽街',
    addressDesc: '福隆海水浴場大門前',
    lat: 25.0185,
    lng: 121.9082,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '30元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-JS-001',
    city: 'newtaipei',
    district: '金山區',
    roadName: '中山路',
    addressDesc: '金山老街公有停車場前',
    lat: 25.2212,
    lng: 121.6382,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-WL-001',
    city: 'newtaipei',
    district: '萬里區',
    roadName: '瑪鋉路',
    addressDesc: '野柳地質公園周邊路段',
    lat: 25.1812,
    lng: 121.6882,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '30元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'NTP-WR-001',
    city: 'newtaipei',
    district: '烏來區',
    roadName: '烏來街',
    addressDesc: '烏來老街立體停車場旁',
    lat: 24.8652,
    lng: 121.5512,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '30元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },

  // ================= 臺中市 (Taichung City - 全轄 29 區) =================
  {
    id: 'TCC-XT-001',
    city: 'taichung',
    district: '西屯區',
    roadName: '臺灣大道三段',
    addressDesc: '臺中市政府新市政大樓前 (臺灣大道側)',
    lat: 24.1625,
    lng: 120.6468,
    status: 'empty',
    statusCode: 0,
    type: 'charging',
    typeLabel: '綠能充電格',
    feeInfo: '30元/小時',
    payTime: '08:00-22:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-XT-002',
    city: 'taichung',
    district: '西屯區',
    roadName: '惠中路一段',
    addressDesc: '臺中市議會側門 (靠近市政北二路)',
    lat: 24.1601,
    lng: 120.6452,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-ND-001',
    city: 'taichung',
    district: '北區',
    roadName: '一中街',
    addressDesc: '臺中一中側門旁 (近育才街口)',
    lat: 24.1488,
    lng: 120.6852,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '30元/小時',
    payTime: '08:00-22:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-WD-001',
    city: 'taichung',
    district: '西區',
    roadName: '公益路',
    addressDesc: '勤美誠品綠園道前 (館前路口)',
    lat: 24.1512,
    lng: 120.6638,
    status: 'empty',
    statusCode: 0,
    type: 'charging',
    typeLabel: '綠能充電格',
    feeInfo: '30元/小時',
    payTime: '08:00-22:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-NT-001',
    city: 'taichung',
    district: '南屯區',
    roadName: '文心南路',
    addressDesc: '秀泰生活文心店前方',
    lat: 24.1302,
    lng: 120.6478,
    status: 'empty',
    statusCode: 0,
    type: 'disability',
    typeLabel: '身障專用格',
    feeInfo: '優惠免費，20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-CD-001',
    city: 'taichung',
    district: '中區',
    roadName: '臺灣大道一段',
    addressDesc: '臺中火車站舊站前廣場旁',
    lat: 24.1385,
    lng: 120.6832,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '30元/小時',
    payTime: '08:00-22:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-ED-001',
    city: 'taichung',
    district: '東區',
    roadName: '復興路四段',
    addressDesc: '大魯閣新時代購物中心側邊',
    lat: 24.1352,
    lng: 120.6885,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-SD-001',
    city: 'taichung',
    district: '南區',
    roadName: '建國北路一段',
    addressDesc: '中山醫學大學附設醫院對面',
    lat: 24.1222,
    lng: 120.6552,
    status: 'empty',
    statusCode: 0,
    type: 'disability',
    typeLabel: '身障專用格',
    feeInfo: '免費2小時，之後20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-BT-001',
    city: 'taichung',
    district: '北屯區',
    roadName: '文心路四段',
    addressDesc: '捷運文心崇德站側出口前',
    lat: 24.1752,
    lng: 120.6835,
    status: 'empty',
    statusCode: 0,
    type: 'charging',
    typeLabel: '綠能充電格',
    feeInfo: '30元/小時',
    payTime: '08:00-22:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-TP-001',
    city: 'taichung',
    district: '太平區',
    roadName: '中山路四段',
    addressDesc: '坪林森林公園入場門口',
    lat: 24.1382,
    lng: 120.7182,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-DL-001',
    city: 'taichung',
    district: '大里區',
    roadName: '中興路二段',
    addressDesc: '臺中軟體園區側邊門口',
    lat: 24.0982,
    lng: 120.6882,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-WF-001',
    city: 'taichung',
    district: '霧峰區',
    roadName: '中正路',
    addressDesc: '亞洲大學正門步道前',
    lat: 24.0622,
    lng: 120.6982,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-WR-001',
    city: 'taichung',
    district: '烏日區',
    roadName: '高鐵東一路',
    addressDesc: '高鐵臺中站2號出口側邊',
    lat: 24.1112,
    lng: 120.6152,
    status: 'empty',
    statusCode: 0,
    type: 'charging',
    typeLabel: '綠能充電格',
    feeInfo: '30元/小時',
    payTime: '07:00-22:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-FY-001',
    city: 'taichung',
    district: '豐原區',
    roadName: '中正路',
    addressDesc: '廟東夜市入口處對面',
    lat: 24.2522,
    lng: 120.7182,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '30元/小時',
    payTime: '08:00-22:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-HL-001',
    city: 'taichung',
    district: '后里區',
    roadName: '甲后路一段',
    addressDesc: '麗寶 Outlet Mall 接駁站前',
    lat: 24.3082,
    lng: 120.7152,
    status: 'empty',
    statusCode: 0,
    type: 'maternity',
    typeLabel: '孕婦親子格',
    feeInfo: '20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-SG-001',
    city: 'taichung',
    district: '石岡區',
    roadName: '豐勢路',
    addressDesc: '東豐綠色走廊車道起點',
    lat: 24.2752,
    lng: 120.7782,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/次',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-TS-001',
    city: 'taichung',
    district: '東勢區',
    roadName: '豐勢路',
    addressDesc: '東勢客家文化園區正門',
    lat: 24.2582,
    lng: 120.8282,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-HP-001',
    city: 'taichung',
    district: '和平區',
    roadName: '東關路三段',
    addressDesc: '谷關溫泉文化館側邊停車區',
    lat: 24.1652,
    lng: 120.9852,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/次',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-NS-001',
    city: 'taichung',
    district: '新社區',
    roadName: '興社街四段',
    addressDesc: '新社花海活動區入口前',
    lat: 24.2382,
    lng: 120.8122,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/次',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-TZ-001',
    city: 'taichung',
    district: '潭子區',
    roadName: '中山路二段',
    addressDesc: '潭子加工出口區側門前',
    lat: 24.2122,
    lng: 120.7052,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-DY-001',
    city: 'taichung',
    district: '大雅區',
    roadName: '中清路三段',
    addressDesc: '中部科學園區大雅區入口',
    lat: 24.2282,
    lng: 120.6482,
    status: 'empty',
    statusCode: 0,
    type: 'charging',
    typeLabel: '綠能充電格',
    feeInfo: '30元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-SK-001',
    city: 'taichung',
    district: '神岡區',
    roadName: '神岡路',
    addressDesc: '神岡區公所前方廣場',
    lat: 24.2582,
    lng: 120.6622,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-TT-001',
    city: 'taichung',
    district: '大肚區',
    roadName: '沙田路二段',
    addressDesc: '追分火車站站前步道',
    lat: 24.1522,
    lng: 120.5422,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-SL-001',
    city: 'taichung',
    district: '沙鹿區',
    roadName: '中山路',
    addressDesc: '靜宜大學校門步道前',
    lat: 24.2382,
    lng: 120.5582,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-LJ-001',
    city: 'taichung',
    district: '龍井區',
    roadName: '沙田路六段',
    addressDesc: '東海藝術街商圈入口前',
    lat: 24.1982,
    lng: 120.5482,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-WC-001',
    city: 'taichung',
    district: '梧棲區',
    roadName: '臺灣大道八段',
    addressDesc: '台中港 MITSUI OUTLET PARK 前',
    lat: 24.2552,
    lng: 120.5312,
    status: 'empty',
    statusCode: 0,
    type: 'charging',
    typeLabel: '綠能充電格',
    feeInfo: '30元/小時',
    payTime: '08:00-22:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-CS-001',
    city: 'taichung',
    district: '清水區',
    roadName: '中山路',
    addressDesc: '高美濕地遊客中心接駁站',
    lat: 24.2682,
    lng: 120.5382,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/小時',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-TJ-001',
    city: 'taichung',
    district: '大甲區',
    roadName: '經國路',
    addressDesc: '大甲鎮瀾宮公園側邊',
    lat: 24.3482,
    lng: 120.6222,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '30元/小時',
    payTime: '08:00-20:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-WP-001',
    city: 'taichung',
    district: '外埔區',
    roadName: '甲后路三段',
    addressDesc: '鐵砧山風景區接駁步道前',
    lat: 24.3322,
    lng: 120.6522,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/次',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TCC-DA-001',
    city: 'taichung',
    district: '大安區',
    roadName: '中山南路',
    addressDesc: '大安濱海樂園入口處',
    lat: 24.3482,
    lng: 120.5882,
    status: 'empty',
    statusCode: 0,
    type: 'general',
    typeLabel: '一般車格',
    feeInfo: '20元/次',
    payTime: '08:00-18:00',
    updatedAt: new Date().toISOString()
  }
];

/**
 * 取得指定城市的路邊停車位狀態 (模擬地磁 sensor 動態即時變化)
 */
export async function fetchParkingSpots(city: City): Promise<ParkingSpot[]> {
  // 模擬網路延遲
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200));

  const baseSpots = BASE_MOCK_SPOTS.filter((spot) => spot.city === city);
  const nowISO = new Date().toISOString();

  // 自動為基礎樣本動態擴充周邊路段車位，大幅豐富各行政區車位密度
  const expandedSpots: ParkingSpot[] = [];

  baseSpots.forEach((baseSpot) => {
    // 保留原始基底車位
    let currentStatus = dynamicStatusMap[baseSpot.id] || baseSpot.status;
    if (Math.random() < 0.2) {
      const randVal = Math.random();
      currentStatus = randVal < 0.7 ? 'empty' : randVal < 0.92 ? 'occupied' : 'maintenance';
      dynamicStatusMap[baseSpot.id] = currentStatus;
    }
    const code = currentStatus === 'empty' ? 0 : currentStatus === 'occupied' ? 1 : 2;

    expandedSpots.push({
      ...baseSpot,
      status: currentStatus,
      statusCode: code,
      updatedAt: nowISO
    });

    // 為繁華或示範行政區動態衍生 3~5 個相鄰路邊車位 (帶有些微 offset 與號碼)
    const extraCount = ['板橋區', '三重區', '中和區', '新莊區', '新店區', '西屯區', '北區', '西區', '南屯區', '北屯區'].includes(baseSpot.district) ? 5 : 3;

    for (let i = 1; i <= extraCount; i++) {
      const subId = `${baseSpot.id}-EX${i}`;
      // 微調經緯度 (~20~150 公尺距離)
      const latOffset = (Math.sin(i * 1.5) * 0.0012) + ((Math.random() - 0.5) * 0.0008);
      const lngOffset = (Math.cos(i * 1.5) * 0.0012) + ((Math.random() - 0.5) * 0.0008);

      let subStatus = dynamicStatusMap[subId];
      if (!subStatus) {
        // 初次生成：65% 空位，30% 有車，5% 維護
        const r = Math.random();
        subStatus = r < 0.65 ? 'empty' : r < 0.95 ? 'occupied' : 'maintenance';
        dynamicStatusMap[subId] = subStatus;
      } else if (Math.random() < 0.25) {
        // 即時動態切換
        const r = Math.random();
        subStatus = r < 0.70 ? 'empty' : r < 0.93 ? 'occupied' : 'maintenance';
        dynamicStatusMap[subId] = subStatus;
      }

      const types: SpotType[] = ['general', 'general', 'general', 'maternity', 'disability', 'charging', 'loading'];
      const chosenType = types[i % types.length];
      const typeLabels: Record<SpotType, string> = {
        general: '一般車格',
        disability: '身障專用格',
        maternity: '孕婦親子格',
        charging: '綠能充電格',
        loading: '裝卸貨專用',
        motorcycle: '機車停車格'
      };

      expandedSpots.push({
        id: subId,
        city: baseSpot.city,
        district: baseSpot.district,
        roadName: baseSpot.roadName,
        addressDesc: `${baseSpot.roadName} ${i * 12 + 2} 號門前 (車格 #${100 + i})`,
        lat: Number((baseSpot.lat + latOffset).toFixed(5)),
        lng: Number((baseSpot.lng + lngOffset).toFixed(5)),
        status: subStatus,
        statusCode: subStatus === 'empty' ? 0 : subStatus === 'occupied' ? 1 : 2,
        type: chosenType,
        typeLabel: typeLabels[chosenType],
        feeInfo: baseSpot.feeInfo,
        payTime: baseSpot.payTime,
        updatedAt: nowISO
      });
    }
  });

  return expandedSpots;
}

/**
 * 【真實 Open API 串接介面說明與預留方法】
 * 
 * 1. 新北市政府開放資料：路邊停車動態資料
 *    - API Endpoint Example: https://data.ntpc.gov.tw/api/v1/rest/datastore/382000000A-000225-002
 *    - 格式：JSON，包含 id, ps_id, is_free, lat, lng, pay_type, update_time
 * 
 * 2. 臺中市政府開放資料：路邊剩餘車位 API
 *    - API Endpoint Example: https://datacenter.taichung.gov.tw/swagger/OpenData/91a3297a-97bb-4033-9e4a-388a101b7a24
 *    - 格式：JSON，包含 ID, SpaceID, Status (0:空車位, 1:有車, 2:故障), Latitude, Longitude, Address
 */
export async function fetchRealNewTaipeiSpots(): Promise<ParkingSpot[]> {
  try {
    const response = await fetch('/api/parking/newtaipei');
    if (!response.ok) throw new Error('新北 API 回應異常');
    const data = await response.json();
    return adaptNewTaipeiData(data);
  } catch (err) {
    console.warn('無法連線至新北實時 API，切換至備用模擬資料流:', err);
    return fetchParkingSpots('newtaipei');
  }
}

export async function fetchRealTaichungSpots(): Promise<ParkingSpot[]> {
  try {
    const response = await fetch('/api/parking/taichung');
    if (!response.ok) throw new Error('台中 API 回應異常');
    const data = await response.json();
    return adaptTaichungData(data);
  } catch (err) {
    console.warn('無法連線至台中實時 API，切換至備用模擬資料流:', err);
    return fetchParkingSpots('taichung');
  }
}

function adaptNewTaipeiData(rawData: any[]): ParkingSpot[] {
  if (!Array.isArray(rawData)) return [];
  return rawData.map((item, index) => {
    const isFree = item.is_free === '1' || item.status === '0' || item.status === 0;
    return {
      id: item.ps_id || `NTP-${index}`,
      city: 'newtaipei',
      district: item.district || item.area_name || '新北市',
      roadName: item.road_name || item.address || '路段名稱',
      addressDesc: item.address || '',
      lat: parseFloat(item.lat || item.latitude) || 25.0118,
      lng: parseFloat(item.lng || item.longitude) || 121.4658,
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
    const statusCode = Number(item.Status ?? item.status ?? 0);
    let status: SpotStatus = 'empty';
    if (statusCode === 1) status = 'occupied';
    else if (statusCode === 2) status = 'maintenance';

    return {
      id: item.SpaceID || item.ID || `TCC-${index}`,
      city: 'taichung',
      district: item.District || item.Area || '臺中市',
      roadName: item.RoadName || item.Address || '路段名稱',
      addressDesc: item.Address || '',
      lat: parseFloat(item.Latitude || item.lat) || 24.1627,
      lng: parseFloat(item.Longitude || item.lng) || 120.6471,
      status,
      statusCode,
      type: (item.Type as SpotType) || 'general',
      typeLabel: item.TypeLabel || '一般車格',
      feeInfo: item.Fee || '20元/小時',
      payTime: item.PayTime || '08:00-18:00',
      updatedAt: item.UpdateTime || new Date().toISOString(),
      rawSourceData: item
    };
  });
}
