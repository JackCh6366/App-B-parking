import React, { useState } from 'react';
import { ParkingSpot } from '../types/parking';
import { formatDistance, formatTime } from '../utils/distance';
import { getSpotDisplayInfo } from '../utils/spotDisplay';
import {
  X,
  MapPin,
  Navigation,
  Clock,
  DollarSign,
  Zap,
  Accessibility,
  Baby,
  Truck,
  Car,
  Copy,
  Check,
  Activity,
  Info
} from 'lucide-react';

interface SpotDetailDrawerProps {
  spot: ParkingSpot | null;
  onClose: () => void;
  onFocusMap: (spot: ParkingSpot) => void;
}

export const SpotDetailDrawer: React.FC<SpotDetailDrawerProps> = ({
  spot,
  onClose,
  onFocusMap
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!spot) return null;

  const displayInfo = getSpotDisplayInfo(spot);

  const handleCopy = () => {
    const text = `【${spot.city === 'newtaipei' ? '新北市' : spot.city === 'taipei' ? '臺北市' : '臺中市'}路邊停車格】\n車格編號：${spot.id}\n位置：${spot.district} ${spot.roadName} ${spot.addressDesc || ''}\n類型：${spot.typeLabel}\n費率：${spot.feeInfo}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigateGoogleMaps = () => {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${spot.district}${spot.roadName}`)}`;
    if (spot.lat !== null && spot.lng !== null) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between relative">
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {/* 狀態 Badge (共用邏輯) */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${displayInfo.statusBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${displayInfo.statusBadge.dot}`} />
                {displayInfo.statusBadge.text}
              </span>

              {/* 類型 Badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                {spot.type === 'charging' && <Zap className="w-3.5 h-3.5 text-cyan-600" />}
                {spot.type === 'disability' && <Accessibility className="w-3.5 h-3.5 text-indigo-600" />}
                {spot.type === 'maternity' && <Baby className="w-3.5 h-3.5 text-pink-600" />}
                {spot.type === 'loading' && <Truck className="w-3.5 h-3.5 text-amber-600" />}
                {spot.type === 'general' && <Car className="w-3.5 h-3.5 text-slate-500" />}
                <span>{spot.typeLabel}</span>
              </span>

              {/* 資料來源強度標籤 (共用邏輯) */}
              {displayInfo.dataSourceBadge && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${displayInfo.dataSourceBadge.bg}`}>
                  {displayInfo.dataSourceBadge.text}
                </span>
              )}

              <span className="text-xs text-slate-500 font-medium">車格編號: {spot.id}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
              <span>[{spot.district}] {spot.roadName}</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full border border-slate-200 shadow-2xs transition-colors absolute right-4 top-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* 位置與即時動態明細描述 */}
          {spot.addressDesc && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold mb-1">
                <Activity className="w-4 h-4" />
                <span>即時偵測動態說明：</span>
              </div>
              <span>{spot.addressDesc}</span>
            </div>
          )}

          {/* 若地磁即時資料存在，呈現拆解統計網格 */}
          {spot.sensorDetail && spot.sensorDetail.dataSource === 'geomagnetic' && (
            <div className="bg-blue-50/60 border border-blue-200/80 p-3.5 rounded-xl">
              <div className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>實體地磁感測器明細 (動態掃描)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                  <span className="text-slate-500 block text-[11px]">即時空位</span>
                  <span className="text-emerald-700 font-black text-base">{spot.sensorDetail.emptyCount ?? 0}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                  <span className="text-slate-500 block text-[11px]">車位佔用</span>
                  <span className="text-rose-600 font-bold text-base">{spot.sensorDetail.occupiedCount ?? 0}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                  <span className="text-slate-500 block text-[11px]">訊號離線</span>
                  <span className="text-slate-600 font-bold text-base">{spot.sensorDetail.offlineCount ?? 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* 數據欄位網格 */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>距離目前位置</span>
              </div>
              <div className="text-base font-bold text-blue-700">
                {formatDistance(spot.distanceMeters)}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>最後更新時間</span>
              </div>
              <div className="text-base font-bold text-slate-800 font-mono">
                {formatTime(spot.updatedAt)}
              </div>
            </div>
          </div>

          {/* 收費細節 */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-blue-700 font-bold border-b border-slate-200 pb-2">
              <DollarSign className="w-4 h-4" />
              <span>收費說明與費率資訊</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">費率標準：</span>
              <span className="text-slate-900 font-bold">{spot.feeInfo}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-slate-200/80">
              <span className="text-slate-500 font-medium">收費時段：</span>
              <span className="text-slate-700 font-semibold">{spot.payTime}</span>
            </div>
          </div>

        </div>

        {/* Footer 操作區域 */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleNavigateGoogleMaps}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-98"
          >
            <Navigation className="w-4 h-4" />
            <span>開啟 Google 地圖導航</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onFocusMap(spot)}
              className="flex-1 sm:flex-initial bg-white hover:bg-slate-100 text-slate-700 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>置中對焦</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial bg-white hover:bg-slate-100 text-slate-700 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? '已複製' : '複製'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
