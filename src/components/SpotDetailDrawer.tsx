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

          {/* 若即時/地磁感測資料存在，呈現拆解統計網格與車格明細 */}
          {spot.sensorDetail && (spot.sensorDetail.dataSource === 'geomagnetic' || spot.sensorDetail.dataSource === 'realtime_sensor') && (
            <div className="bg-blue-50/60 border border-blue-200/80 p-3.5 rounded-xl space-y-3">
              <div className="text-xs font-bold text-blue-900 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>實體感測器明細 ({spot.sensorDetail.dataSource === 'geomagnetic' ? '地磁動態' : '即時動態'})</span>
                </div>
                {spot.sensorDetail.totalSpaces && (
                  <span className="text-[11px] font-normal text-blue-700 font-mono">共 {spot.sensorDetail.totalSpaces} 格</span>
                )}
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
                  <span className="text-slate-500 block text-[11px]">維護/離線</span>
                  <span className="text-slate-600 font-bold text-base">{spot.sensorDetail.offlineCount ?? 0}</span>
                </div>
              </div>

              {/* 風險/轉角提示語 */}
              {spot.sensorDetail.riskNote && (
                <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>提示：{spot.sensorDetail.riskNote}</span>
                </div>
              )}

              {/* 車格獨立狀態明細網格 */}
              {spot.sensorDetail.cellList && spot.sensorDetail.cellList.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-semibold">個別車格即時狀態：</span>
                    <span className="text-slate-400 font-normal">綠:空位 / 紅:有車 / 黃:維護</span>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-44 overflow-y-auto p-2 bg-white rounded-lg border border-blue-100 shadow-2xs">
                    {spot.sensorDetail.cellList.map((cell, idx) => {
                      const isFree = cell.status === 'empty';
                      const isMaint = cell.status === 'maintenance';
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col items-center justify-center p-1.5 rounded-md border text-[11px] font-mono transition-colors ${
                            isFree
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : isMaint
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}
                          title={`車格 #${cell.cellId} - ${isFree ? '空位' : isMaint ? '維護中' : '有車'}`}
                        >
                          <span className={`w-2 h-2 rounded-full mb-1 ${isFree ? 'bg-emerald-500 animate-pulse' : isMaint ? 'bg-amber-500' : 'bg-rose-500'}`} />
                          <span className="truncate w-full text-center text-[10px]">{cell.cellId}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
