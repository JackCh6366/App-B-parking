import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ParkingSpot, UserLocation } from '../types/parking';

interface ParkingMapProps {
  spots: ParkingSpot[];
  allCitySpots?: ParkingSpot[];
  center: [number, number];
  zoom: number;
  userLocation: UserLocation;
  selectedSpot: ParkingSpot | null;
  onSelectSpot: (spot: ParkingSpot) => void;
  showHeatmap?: boolean;
}

export const ParkingMap: React.FC<ParkingMapProps> = ({
  spots,
  allCitySpots,
  center,
  zoom,
  userLocation,
  selectedSpot,
  onSelectSpot,
  showHeatmap = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const heatmapGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // 初始化地圖
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false
      });

      // 使用 CartoDB Positron 簡約高亮地圖圖層
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // 放大縮小控制鈕移至右上角
      L.control.zoom({ position: 'topright' }).addTo(map);

      heatmapGroupRef.current = L.layerGroup().addTo(map);
      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 當地圖中心改變或切換城市時更新視角
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom, { animate: true, duration: 0.8 });
    }
  }, [center, zoom]);

  // 當選取的車格變更時自動飛向該標記
  useEffect(() => {
    if (selectedSpot && mapInstanceRef.current && selectedSpot.lat !== null && selectedSpot.lng !== null) {
      mapInstanceRef.current.flyTo([selectedSpot.lat, selectedSpot.lng], 17, {
        duration: 1.2
      });
    }
  }, [selectedSpot]);

  // 繪製熱力圖層 (根據區域總車位與空車位比例，以紅色至綠色漸層顯示停車壓力)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const heatmapGroup = heatmapGroupRef.current;
    if (!map || !heatmapGroup) return;

    heatmapGroup.clearLayers();

    if (!showHeatmap) return;

    const sourceSpots = allCitySpots && allCitySpots.length > 0 ? allCitySpots : spots;
    if (sourceSpots.length === 0) return;

    // 將車位以約 500m~700m 的空間網格進行聚合
    const GRID_SIZE = 0.0055;
    const gridMap = new Map<string, {
      total: number;
      empty: number;
      occupied: number;
      latSum: number;
      lngSum: number;
      district: string;
      roads: Set<string>;
    }>();

    sourceSpots.forEach(spot => {
      if (spot.lat === null || spot.lng === null) return;
      const gridX = Math.floor(spot.lat / GRID_SIZE);
      const gridY = Math.floor(spot.lng / GRID_SIZE);
      const key = `${gridX}_${gridY}`;

      const existing = gridMap.get(key) || {
        total: 0,
        empty: 0,
        occupied: 0,
        latSum: 0,
        lngSum: 0,
        district: spot.district || '',
        roads: new Set<string>()
      };

      existing.total += 1;
      if (spot.status === 'empty') {
        existing.empty += 1;
      } else {
        existing.occupied += 1;
      }
      existing.latSum += spot.lat;
      existing.lngSum += spot.lng;
      if (spot.roadName) existing.roads.add(spot.roadName);

      gridMap.set(key, existing);
    });

    // 繪製每一個熱力區域 (以車位總數與空車位比例計算壓力度 0.0 ~ 1.0)
    gridMap.forEach((data) => {
      const avgLat = data.latSum / data.total;
      const avgLng = data.lngSum / data.total;

      // 停車壓力比例 = 已佔用車位 / 總車位數 (0: 完全沒車-好停, 1: 全滿-極難停)
      const pressureRatio = data.total > 0 ? (data.occupied / data.total) : 0;

      // 根據壓力比例繪製色彩：0% (極好停-綠) -> 50% (中壓-黃/橘) -> 100% (極難停-紅)
      let fillColor = '#10b981'; // 綠色
      let strokeColor = '#059669';
      let pressureTitle = '車位充裕 (低壓力)';

      if (pressureRatio >= 0.75) {
        fillColor = '#ef4444'; // 紅色
        strokeColor = '#dc2626';
        pressureTitle = '停車極度緊繃 (高壓力)';
      } else if (pressureRatio >= 0.50) {
        fillColor = '#f97316'; // 橘色
        strokeColor = '#ea580c';
        pressureTitle = '車位較少 (中高壓力)';
      } else if (pressureRatio >= 0.25) {
        fillColor = '#eab308'; // 黃色
        strokeColor = '#ca8a04';
        pressureTitle = '車位尚可 (中等壓力)';
      }

      // 外圍擴散熱力圈
      const outerCircle = L.circle([avgLat, avgLng], {
        radius: 420 + Math.min(data.total * 30, 200),
        stroke: false,
        fillColor: fillColor,
        fillOpacity: 0.35
      });

      // 核心熱力圈
      const innerCircle = L.circle([avgLat, avgLng], {
        radius: 180 + Math.min(data.total * 15, 100),
        color: strokeColor,
        weight: 1.5,
        fillColor: fillColor,
        fillOpacity: 0.65
      });

      const roadListStr = Array.from(data.roads).slice(0, 3).join('、');
      const tooltipContent = `
        <div class="p-1.5 font-sans text-xs leading-relaxed">
          <div class="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1">
            📍 ${data.district} ${roadListStr ? `(${roadListStr} 周邊)` : ''}
          </div>
          <div class="flex items-center gap-1.5 my-1">
            <span class="inline-block w-2.5 h-2.5 rounded-full shadow-2xs" style="background-color: ${fillColor}"></span>
            <span class="font-bold text-slate-800">${pressureTitle}</span>
            <span class="text-[10px] text-slate-500 font-mono">(${(pressureRatio * 100).toFixed(0)}% 佔用)</span>
          </div>
          <div class="text-slate-600 font-medium text-[11px] mt-1">
            🟢 空車位: <strong class="text-emerald-700">${data.empty}</strong> 格 / 總車位: ${data.total} 格
          </div>
        </div>
      `;

      outerCircle.bindTooltip(tooltipContent, { direction: 'top', opacity: 0.95 });
      innerCircle.bindTooltip(tooltipContent, { direction: 'top', opacity: 0.95 });

      outerCircle.addTo(heatmapGroup);
      innerCircle.addTo(heatmapGroup);
    });
  }, [showHeatmap, spots, allCitySpots]);

  // 繪製車位標記與使用者位置標記
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. 繪製使用者位置 Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center w-7 h-7">
            <div class="absolute w-7 h-7 bg-blue-500/30 rounded-full animate-ping"></div>
            <div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md z-10"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000
      })
        .bindTooltip(`📍 ${userLocation.addressName || '您的位置'}`, {
          permanent: false,
          direction: 'top'
        })
        .addTo(markersGroup);
    }

    // 2. 繪製每一個車格 Marker
    spots.forEach((spot) => {
      if (spot.lat === null || spot.lng === null) return;
      const isSelected = selectedSpot?.id === spot.id;
      const isAvailable = spot.status === 'empty';

      // 依車位類型與狀態生成地圖圖示
      let iconSymbol = 'P';
      let iconColorClass = 'bg-emerald-500 border-emerald-300 text-slate-950';

      if (!isAvailable) {
        iconColorClass = 'bg-slate-600 border-slate-400 text-slate-200';
      } else {
        switch (spot.type) {
          case 'charging':
            iconSymbol = '⚡';
            iconColorClass = 'bg-cyan-500 border-cyan-200 text-slate-950 font-bold';
            break;
          case 'disability':
            iconSymbol = '♿';
            iconColorClass = 'bg-indigo-600 border-indigo-200 text-white';
            break;
          case 'maternity':
            iconSymbol = '👶';
            iconColorClass = 'bg-pink-500 border-pink-200 text-white';
            break;
          case 'loading':
            iconSymbol = '🚚';
            iconColorClass = 'bg-amber-500 border-amber-200 text-slate-950';
            break;
          default:
            iconSymbol = 'P';
            break;
        }
      }

      const spotIcon = L.divIcon({
        className: 'custom-parking-marker',
        html: `
          <div class="relative group cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <div class="w-8 h-8 rounded-full ${iconColorClass} border-2 shadow-lg flex items-center justify-center font-black text-xs">
              ${iconSymbol}
            </div>
            ${isAvailable ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full animate-pulse"></span>' : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: spotIcon });

      // 點擊事件
      marker.on('click', () => {
        onSelectSpot(spot);
      });

      let statusText = '🟢 即時可停車';
      if (spot.status === 'occupied') statusText = '🔴 已被佔用';
      else if (spot.status === 'maintenance') statusText = '🟠 車格維護中';
      else if (spot.status === 'unknown') statusText = '⚪ 無即時資訊 (依現場為準)';

      // Hover 簡易浮動提示
      marker.bindTooltip(
        `
        <div class="p-1 font-sans text-xs font-semibold">
          <div class="text-slate-900">[${spot.district}] ${spot.roadName}</div>
          <div class="font-bold mt-0.5">${statusText} - ${spot.typeLabel}</div>
        </div>
      `,
        { direction: 'top', offset: [0, -10] }
      );

      marker.addTo(markersGroup);
    });
  }, [spots, userLocation, selectedSpot, onSelectSpot]);

  return (
    <div className="relative w-full h-full bg-slate-100 flex-1 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* 熱力圖指標浮動圖例 (當熱力圖開啟時加強顯示) */}
      {showHeatmap && (
        <div className="absolute top-4 left-4 z-20 bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-700 text-xs shadow-2xl animate-fade-in flex flex-col gap-1.5 max-w-[280px]">
          <div className="flex items-center justify-between font-bold text-amber-300 border-b border-slate-800 pb-1">
            <span className="flex items-center gap-1.5">🔥 停車壓力熱力圖</span>
            <span className="text-[10px] text-slate-400 font-normal">即時佔用率</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            基於該區域總車位與空位比例計算：
          </p>
          <div className="flex items-center justify-between text-[10px] font-semibold pt-0.5">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>充裕 (低壓)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>尚可 (中壓)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>吃緊 (高壓)</span>
            </div>
          </div>
          {/* 漸層色彩條 */}
          <div className="w-full h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 shadow-inner"></div>
        </div>
      )}

      {/* 地圖左下角標記圖例 */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md text-slate-800 p-3 rounded-2xl border border-slate-200 text-xs shadow-xl hidden sm:block">
        <div className="font-bold text-slate-900 mb-1.5 border-b border-slate-100 pb-1 flex items-center justify-between">
          <span>地圖車格圖例</span>
          <span className="text-[10px] text-slate-400 font-normal">即時更新</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">P</span>
            <span className="font-medium text-slate-700">一般空車位</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">⚡</span>
            <span className="font-medium text-slate-700">綠能充電</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">♿</span>
            <span className="font-medium text-slate-700">身障專用</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">👶</span>
            <span className="font-medium text-slate-700">孕婦親子</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">🚚</span>
            <span className="font-medium text-slate-700">裝卸貨格</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold shadow-2xs">P</span>
            <span className="font-medium text-slate-400">已佔用/維護</span>
          </div>
        </div>
      </div>
    </div>
  );
};

