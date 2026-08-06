import React from 'react';
import { City, CityInfo } from '../types/parking';
import { CITIES } from '../config/cities.config';
import { RefreshCw, Navigation, Car, Clock } from 'lucide-react';

interface HeaderProps {
  currentCity: City;
  onCityChange: (city: City) => void;
  lastUpdated: string;
  isLoading: boolean;
  onRefresh: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: (val: boolean) => void;
  onRequestGPS: () => void;
  emptyCountByCity: Record<string, number>;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onCityChange,
  lastUpdated,
  isLoading,
  onRefresh,
  autoRefresh,
  onToggleAutoRefresh,
  onRequestGPS,
  emptyCountByCity
}) => {
  return (
    <header className="bg-white text-slate-800 border-b border-slate-200 shadow-sm z-30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* 左側：品牌標題與城市切換 */}
          <div className="flex flex-wrap items-center justify-between md:justify-start gap-3 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-600/20">
                <Car className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2">
                  Jack的停車位小幫手
                  <span className="text-blue-600 font-medium text-xs sm:text-sm">Real-Time Parking</span>
                  <span className="hidden sm:inline-block bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    即時連線
                  </span>
                </h1>
                <p className="text-xs text-slate-500 hidden xs:block">
                  新北市 & 臺中市路邊即時車格查詢系統
                </p>
              </div>
            </div>

            {/* 城市切換 Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              {Object.keys(CITIES).map((cityKey) => {
                const info: CityInfo = CITIES[cityKey];
                const isActive = currentCity === cityKey;
                const count = emptyCountByCity[cityKey] || 0;

                return (
                  <button
                    key={cityKey}
                    onClick={() => onCityChange(cityKey)}
                    className={`relative px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>{info.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count} 格空位
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 右側：功能操作列 */}
          <div className="flex items-center justify-between md:justify-end gap-2 text-xs sm:text-sm border-t border-slate-100 md:border-t-0 pt-2 md:pt-0">
            {/* GPS 定位按鈕 */}
            <button
              onClick={onRequestGPS}
              title="定位我的當前位置"
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors font-medium shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              <span className="hidden sm:inline">GPS 定位</span>
            </button>

            {/* 重新整理按鈕 */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 disabled:opacity-50 px-3 py-1.5 rounded-lg font-semibold transition-all shadow-xs active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span>重新整理</span>
            </button>

            {/* 自動更新開關與更新時間 */}
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => onToggleAutoRefresh(e.target.checked)}
                  className="rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="hidden lg:inline text-slate-500">30s 自動更新</span>
              </label>

              <div className="flex items-center gap-1 text-slate-500 border-l border-slate-200 pl-2">
                <Clock className="w-3 h-3 text-blue-600" />
                <span className="font-mono text-slate-700">{lastUpdated || '--:--:--'}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
