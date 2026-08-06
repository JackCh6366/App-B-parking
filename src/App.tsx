import React, { useMemo } from 'react';
import { useParkingData } from './hooks/useParkingData';
import { Header } from './components/Header';
import { CityStatsBanner } from './components/CityStatsBanner';
import { FilterBar } from './components/FilterBar';
import { ParkingMap } from './components/ParkingMap';
import { NearbySpotList } from './components/NearbySpotList';
import { SpotDetailDrawer } from './components/SpotDetailDrawer';
import { AiCustomerServiceModal } from './components/AiCustomerServiceModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { CITIES } from './config/cities.config';

export default function App() {
  const {
    city,
    cityInfo,
    handleCityChange,
    spots,
    filteredSpots,
    stats,
    isLoading,
    error,
    lastUpdated,
    autoRefresh,
    setAutoRefresh,
    refreshData,
    filters,
    setFilters,
    userLocation,
    requestGPSLocation,
    availableDistricts,
    selectedSpot,
    setSelectedSpot
  } = useParkingData();

  // 各城市的即時可用車位數 (供 Header 頁籤動態計算 Badge)
  const emptyCountByCity = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    Object.keys(CITIES).forEach(cId => {
      map[cId] = 0;
    });
    spots.forEach((s) => {
      if (s.status === 'empty') {
        map[s.city] = (map[s.city] || 0) + 1;
      }
    });
    return map;
  }, [spots]);

  // 重置搜尋篩選
  const handleResetFilters = () => {
    setFilters(prev => ({
      searchQuery: '',
      spotType: 'all',
      district: 'all',
      onlyAvailable: true,
      showHeatmap: prev.showHeatmap
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-800 font-sans overflow-hidden select-none">
      {/* 1. 頂部導覽列 */}
      <Header
        currentCity={city}
        onCityChange={handleCityChange}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={refreshData}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={setAutoRefresh}
        onRequestGPS={requestGPSLocation}
        emptyCountByCity={emptyCountByCity}
      />

      {/* 2. 數據概況統計列 */}
      <CityStatsBanner stats={stats} cityName={cityInfo.name} />

      {/* 3. 多功能篩選列 */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        availableDistricts={availableDistricts}
        totalMatchCount={filteredSpots.length}
      />

      {/* 錯誤警示條 */}
      {error && (
        <div className="bg-rose-50 text-rose-800 px-4 py-2 text-xs flex items-center justify-between border-b border-rose-200 z-30 font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={refreshData}
            className="underline font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> 重試
          </button>
        </div>
      )}

      {/* 4. 主要版面：地圖 + 附近空位列表 */}
      <ErrorBoundary fallbackText="地圖與車位資料展示出現異常">
        <main className="flex-1 relative flex flex-col md:flex-row overflow-hidden bg-slate-100">
          {/* 地圖區域 */}
          <div className="flex-1 relative h-full w-full">
            {isLoading && spots.length === 0 ? (
              <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center text-slate-700">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-sm font-bold text-slate-800">正在同步{cityInfo.name}即時車位狀態...</p>
                <p className="text-xs text-slate-500 mt-1">請稍候，資料由地磁感測器即時更新</p>
              </div>
            ) : null}

            <ParkingMap
              spots={filteredSpots}
              allCitySpots={spots}
              center={cityInfo.center}
              zoom={cityInfo.zoom}
              userLocation={userLocation}
              selectedSpot={selectedSpot}
              onSelectSpot={setSelectedSpot}
              showHeatmap={filters.showHeatmap}
            />
          </div>

          {/* 右側/下方：附近空車格清單 */}
          <NearbySpotList
            spots={filteredSpots}
            selectedSpot={selectedSpot}
            onSelectSpot={setSelectedSpot}
            onFocusOnMap={(spot) => setSelectedSpot(spot)}
            onResetFilters={handleResetFilters}
            cityName={cityInfo.name}
          />
        </main>
      </ErrorBoundary>

      {/* 5. 車格詳細資訊彈窗/抽屜 */}
      <SpotDetailDrawer
        spot={selectedSpot}
        onClose={() => setSelectedSpot(null)}
        onFocusMap={(spot) => setSelectedSpot(spot)}
      />

      {/* 6. AI 智慧停車客服助理 */}
      <AiCustomerServiceModal
        currentCityName={cityInfo.name}
        district={filters.district}
        searchQuery={filters.searchQuery}
        filteredSpotsCount={filteredSpots.length}
        selectedSpot={selectedSpot}
      />
    </div>
  );
}
