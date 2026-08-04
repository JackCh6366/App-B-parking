import React from 'react';
import { FilterOptions, SpotType } from '../types/parking';
import { Search, Filter, X, Zap, Accessibility, Baby, Truck, Car, Check, Flame } from 'lucide-react';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: React.Dispatch<React.SetStateAction<FilterOptions>>;
  availableDistricts: string[];
  totalMatchCount: number;
}

const SPOT_TYPE_OPTIONS: { type: SpotType | 'all'; label: string; icon: React.ReactNode }[] = [
  { type: 'all', label: '全部類型', icon: <Car className="w-3.5 h-3.5" /> },
  { type: 'general', label: '一般車格', icon: <Car className="w-3.5 h-3.5 text-slate-500" /> },
  { type: 'charging', label: '綠能充電', icon: <Zap className="w-3.5 h-3.5 text-cyan-600" /> },
  { type: 'disability', label: '身障專用', icon: <Accessibility className="w-3.5 h-3.5 text-indigo-600" /> },
  { type: 'maternity', label: '孕婦親子', icon: <Baby className="w-3.5 h-3.5 text-pink-600" /> },
  { type: 'loading', label: '裝卸貨', icon: <Truck className="w-3.5 h-3.5 text-amber-600" /> }
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  availableDistricts,
  totalMatchCount
}) => {
  return (
    <div className="bg-white text-slate-700 border-b border-slate-200 p-2.5 sm:p-3 shadow-xs z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        
        {/* 左側：關鍵字搜尋與行政區下拉 */}
        <div className="flex flex-1 items-center gap-2">
          {/* 搜尋框 */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="搜尋路名或編號 (如：縣民大道、臺灣大道)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 行政區選單 */}
          <div className="relative shrink-0">
            <select
              value={filters.district}
              onChange={(e) => onFilterChange(prev => ({ ...prev, district: e.target.value }))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer pr-7 appearance-none font-medium"
            >
              <option value="all">全區 (所有區域)</option>
              {availableDistricts.map(dist => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 右側：類型 Quick Chips & 僅顯示空車位 toggle */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 text-xs">
          {/* 車格類型 chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {SPOT_TYPE_OPTIONS.map((opt) => {
              const isSelected = filters.spotType === opt.type;
              return (
                <button
                  key={opt.type}
                  onClick={() => onFilterChange(prev => ({ ...prev, spotType: opt.type }))}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap font-medium ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* 熱力圖 Toggle */}
          <button
            onClick={() => onFilterChange(prev => ({ ...prev, showHeatmap: !prev.showHeatmap }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-semibold ${
              filters.showHeatmap
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-300/50'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="根據空車位與總車位比例顯示區域停車壓力熱力圖"
          >
            <Flame className={`w-3.5 h-3.5 ${filters.showHeatmap ? 'text-amber-200 animate-pulse' : 'text-rose-500'}`} />
            <span>壓力熱力圖</span>
          </button>

          {/* 只顯示空位 Toggle */}
          <button
            onClick={() => onFilterChange(prev => ({ ...prev, onlyAvailable: !prev.onlyAvailable }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-semibold ${
              filters.onlyAvailable
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
              filters.onlyAvailable ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300 bg-white'
            }`}>
              {filters.onlyAvailable && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>僅空位 ({totalMatchCount})</span>
          </button>
        </div>

      </div>
    </div>
  );
};

