import React, { useState } from 'react';
import { ParkingSpot } from '../types/parking';
import { SpotCard } from './SpotCard';
import { ListFilter, ChevronDown, ChevronUp, MapPinOff } from 'lucide-react';

interface NearbySpotListProps {
  spots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSelectSpot: (spot: ParkingSpot) => void;
  onFocusOnMap: (spot: ParkingSpot) => void;
  onResetFilters: () => void;
  cityName: string;
}

export const NearbySpotList: React.FC<NearbySpotListProps> = ({
  spots,
  selectedSpot,
  onSelectSpot,
  onFocusOnMap,
  onResetFilters,
  cityName
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <aside
      className={`bg-white border-t md:border-t-0 md:border-l border-slate-200 transition-all duration-300 flex flex-col z-20 shadow-lg ${
        isCollapsed
          ? 'h-12 md:h-full md:w-14'
          : 'h-[40vh] md:h-full w-full md:w-[360px] lg:w-[400px]'
      }`}
    >
      {/* 面板標頭 Header */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 text-blue-600">
            <ListFilter className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                附近空位列表
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2 py-0.2 rounded-full font-bold">
                  共 {spots.length} 格
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">依距離由近至遠排序 ({cityName})</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          title={isCollapsed ? '展開清單' : '收合清單'}
        >
          {isCollapsed ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4 md:rotate-90" />
          )}
        </button>
      </div>

      {/* 清單內容 Body */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 custom-scrollbar">
          {spots.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-500 flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-3 text-slate-400">
                <MapPinOff className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-700">未找到符合條件的空車位</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                請嘗試放寬篩選條件或清空搜尋關鍵字
              </p>
              <button
                onClick={onResetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                重置搜尋條件
              </button>
            </div>
          ) : (
            spots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                isSelected={selectedSpot?.id === spot.id}
                onSelect={onSelectSpot}
                onFocusOnMap={onFocusOnMap}
              />
            ))
          )}
        </div>
      )}
    </aside>
  );
};

