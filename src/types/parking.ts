export type City = 'newtaipei' | 'taichung';

export type SpotStatus = 'empty' | 'occupied' | 'maintenance' | 'unknown';

export type SpotType = 'general' | 'disability' | 'maternity' | 'charging' | 'loading' | 'motorcycle';

export interface ParkingSpot {
  id: string; // 車格編號
  city: City;
  district: string; // 行政區，如：板橋區、西屯區
  roadName: string; // 路段名稱
  addressDesc?: string; // 門牌或顯著地標描述
  lat: number;
  lng: number;
  status: SpotStatus; // 狀態 (empty: 可停, occupied: 有車, maintenance: 故障)
  statusCode: number; // 原始數值 (0: 空位, 1: 有車, 2: 故障)
  type: SpotType; // 車格類型
  typeLabel: string; // 類型顯示文字
  feeInfo: string; // 收費資訊
  payTime: string; // 收費時段
  updatedAt: string; // 資料最後更新時間
  distanceMeters?: number; // 距離使用者公尺數 (計算產生)
  rawSourceData?: Record<string, any>; // 預留原廠 Open API 回傳資料
}

export interface CityInfo {
  id: City;
  name: string;
  shortName: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  description: string;
  apiEndpointDoc: string;
  districts: string[]; // 全轄區 29 個行政區列表
}

export interface FilterOptions {
  searchQuery: string;
  spotType: SpotType | 'all';
  district: string | 'all';
  onlyAvailable: boolean;
  showHeatmap: boolean; // 是否開啟停車壓力熱力圖
}

export interface UserLocation {
  lat: number;
  lng: number;
  addressName?: string;
  isCustom?: boolean;
}
