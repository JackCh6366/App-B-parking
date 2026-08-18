import React from 'react';
import { ParkingSpot } from '../types/parking';
import { formatDistance, formatTime } from '../utils/distance';
import { MapPin, Zap, Accessibility, Baby, Truck, Car, Navigation, DollarSign, Clock } from 'lucide-react';

interface SpotCardProps {
  spot: ParkingSpot;
  isSelected: boolean;
  onSelect: (spot: ParkingSpot) => void;
  onFocusOnMap: (spot: ParkingSpot) => void;
}

export const SpotCard: React.FC<SpotCardProps> = ({
  spot,
  isSelected,
  onSelect,
  onFocusOnMap
}) => {
  const isAvailable = spot.status === 'empty';

  // 取得類型 Badge 圖示與色彩
  const getTypeBadge = () => {
    switch (spot.type) {
      case 'charging':
        return {
          bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          icon: <Zap className="w-3 h-3 text-cyan-600" />,
          label: '綠能充電'
        };
      case 'disability':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: <Accessibility className="w-3 h-3 text-indigo-600" />,
          label: '身障專用'
        };
      case 'maternity':
        return {
          bg: 'bg-pink-50 text-pink-800 border-pink-200',
          icon: <Baby className="w-3 h-3 text-pink-600" />,
          label: '孕婦親子'
        };
      case 'loading':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Truck className="w-3 h-3 text-amber-600" />,
          label: '裝卸貨格'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Car className="w-3 h-3 text-slate-500" />,
          label: '小型車'
        };
    }
  };

  const badge = getTypeBadge();

  return (
    <div
      onClick={() => onSelect(spot)}
      className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left relative group bg-white shadow-xs ${
        isSelected
          ? 'border-l-4 border-blue-600 border-slate-200 ring-2 ring-blue-500/20 shadow-md'
          : 'border-l-4 border-transparent border-slate-200 hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* 狀態標籤 */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : spot.status === 'occupied'
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {isAvailable ? '目前空閒' : spot.status === 'occupied' ? '使用中' : '維護中'}
          </span>

          {/* 車格類型標籤 */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border font-semibold ${badge.bg}`}>
            {badge.icon}
            <span>{badge.label}</span>
          </span>
        </div>

        {/* 距離標籤 */}
        <div
          className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 border ${
            spot.lat === null || spot.lng === null || spot.distanceMeters === Infinity
              ? 'text-slate-500 bg-slate-100 border-slate-200'
              : 'text-blue-700 bg-blue-50 border-blue-100'
          }`}
        >
          {formatDistance(spot.distanceMeters)}
        </div>
      </div>

      {/* 行政區與路段 */}
      <div className="text-xs font-bold text-blue-600 mb-0.5">
        {spot.district} • {spot.roadName}
      </div>

      {/* 車格編號與標題 */}
      <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center justify-between group-hover:text-blue-600 transition-colors">
        <span>車格編號: {spot.id}</span>
      </h3>

      {/* 詳細地址地標描述 */}
      {spot.addressDesc && (
        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
          {spot.addressDesc}
        </p>
      )}

      {/* 收費與更新時間 */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1 text-slate-700 font-medium truncate max-w-[200px]">
          <DollarSign className="w-3 h-3 text-blue-600 shrink-0" />
          <span className="truncate">{spot.feeInfo}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{formatTime(spot.updatedAt)}</span>
        </div>
      </div>

      {/* 底部對焦按鈕 */}
      <div className="mt-2 flex items-center justify-end">
        {spot.lat !== null && spot.lng !== null ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFocusOnMap(spot);
            }}
            className="text-xs bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-200 flex items-center gap-1 transition-colors font-medium"
          >
            <Navigation className="w-3 h-3 text-blue-600" />
            <span>地圖定位</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
            僅列表呈現
          </span>
        )}
      </div>
    </div>
  );
};

