import React from 'react';
import { Zap, Accessibility, CheckCircle2, Car, Wrench } from 'lucide-react';

interface CityStatsBannerProps {
  stats: {
    total: number;
    empty: number;
    occupied: number;
    maintenance: number;
    charging: number;
    disability: number;
  };
  cityName: string;
}

export const CityStatsBanner: React.FC<CityStatsBannerProps> = ({ stats, cityName }) => {
  const occupancyRate = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;

  return (
    <div className="bg-white border-b border-slate-200 text-slate-700 px-4 py-2 flex items-center overflow-x-auto no-scrollbar gap-3 text-xs font-medium shadow-xs">
      <div className="flex items-center gap-1.5 shrink-0 font-bold text-slate-900">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>{cityName}即時概況:</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>可停空車位：<strong className="text-emerald-700 text-sm font-bold">{stats.empty}</strong> 格</span>
      </div>

      {stats.charging > 0 && (
        <div className="flex items-center gap-1.5 shrink-0 bg-cyan-50 border border-cyan-200 text-cyan-800 px-2.5 py-1 rounded-full font-medium">
          <Zap className="w-3.5 h-3.5 text-cyan-600" />
          <span>充電空位：<strong className="text-cyan-700 font-bold">{stats.charging}</strong> 格</span>
        </div>
      )}

      {stats.disability > 0 && (
        <div className="flex items-center gap-1.5 shrink-0 bg-indigo-50 border border-indigo-200 text-indigo-800 px-2.5 py-1 rounded-full font-medium">
          <Accessibility className="w-3.5 h-3.5 text-indigo-600" />
          <span>身障空位：<strong className="text-indigo-700 font-bold">{stats.disability}</strong> 格</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 shrink-0 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
        <Car className="w-3.5 h-3.5 text-slate-400" />
        <span>已佔用：{stats.occupied} 格</span>
      </div>

      {stats.maintenance > 0 && (
        <div className="flex items-center gap-1.5 shrink-0 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          <Wrench className="w-3.5 h-3.5 text-amber-500" />
          <span>維護中：{stats.maintenance} 格</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 shrink-0 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 text-[11px]">
        <span>資料來源：{cityName === '臺北市' ? '臺北市停車管理工程處' : `${cityName}政府交通局 (開放資料)`}</span>
      </div>

      <div className="hidden sm:flex items-center gap-2 ml-auto shrink-0 text-slate-500 font-medium">
        <span>周邊車位佔用率 {occupancyRate}%</span>
        <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-500 ${
              occupancyRate > 80 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};

