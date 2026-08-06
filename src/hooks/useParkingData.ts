import { useState, useEffect, useCallback, useMemo } from 'react';
import { City, FilterOptions, ParkingSpot, UserLocation } from '../types/parking';
import { CITIES, fetchParkingSpots } from '../services/parkingService';
import { calculateDistanceMeters } from '../utils/distance';

export function useParkingData() {
  const [city, setCity] = useState<City>('newtaipei');
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);

  // 用戶當前位置資訊
  const [userLocation, setUserLocation] = useState<UserLocation>({
    lat: CITIES['newtaipei'].center[0],
    lng: CITIES['newtaipei'].center[1],
    addressName: '新北市政府 (預設中心)',
    isCustom: false
  });

  // 篩選條件
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    spotType: 'all',
    district: 'all',
    onlyAvailable: true,
    showHeatmap: false
  });

  // 切換城市時自動重置使用者中心點與選取車格
  const handleCityChange = useCallback((newCity: City) => {
    setCity(newCity);
    setSelectedSpot(null);
    const cityInfo = CITIES[newCity];
    setUserLocation({
      lat: cityInfo.center[0],
      lng: cityInfo.center[1],
      addressName: `${cityInfo.name}中心點`,
      isCustom: false
    });
    setFilters(prev => ({ ...prev, district: 'all', searchQuery: '' }));
  }, []);

  // 載入車位資料函數
  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    setError(null);
    try {
      const data = await fetchParkingSpots(city);
      setSpots(data);
      setLastUpdated(new Date().toLocaleTimeString('zh-TW', { hour12: false }));
    } catch (err) {
      console.error('載入停車位資料失敗:', err);
      setError('無法取得即時車位狀態，請稍後再試');
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, [city]);

  // 初始與城市變更時載入
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 30 秒自動更新計時器
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  // 要求取得真實 GPS 位置
  const requestGPSLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('您的瀏覽器不支援 GPS 定位功能');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          addressName: '您的當前 GPS 位置',
          isCustom: true
        });
      },
      (err) => {
        console.warn('GPS 定位失敗:', err);
        alert('無法取得您的位置權限，已維持使用預設區域中心');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // 提取該城市全轄 29 個行政區列表 (結合 CityInfo 與動態車位資料)
  const availableDistricts = useMemo(() => {
    const set = new Set<string>(CITIES[city]?.districts || []);
    spots.forEach(spot => {
      if (spot.district) set.add(spot.district);
    });
    return Array.from(set).sort();
  }, [city, spots]);

  // 計算距離並進行關鍵字與條件篩選，最後按距離由近到遠排序
  const filteredSpots = useMemo(() => {
    return spots
      .map(spot => {
        const dist = calculateDistanceMeters(
          userLocation.lat,
          userLocation.lng,
          spot.lat,
          spot.lng
        );
        return { ...spot, distanceMeters: dist };
      })
      .filter(spot => {
        // 1. 只看空車位篩選
        if (filters.onlyAvailable && spot.status !== 'empty') {
          return false;
        }

        // 2. 車位類型篩選
        if (filters.spotType !== 'all' && spot.type !== filters.spotType) {
          return false;
        }

        // 3. 行政區篩選
        if (filters.district !== 'all' && spot.district !== filters.district) {
          return false;
        }

        // 4. 關鍵字搜尋 (路名、行政區、編號)
        if (filters.searchQuery.trim() !== '') {
          const q = filters.searchQuery.trim().toLowerCase();
          const matchRoad = spot.roadName.toLowerCase().includes(q);
          const matchDistrict = spot.district.toLowerCase().includes(q);
          const matchId = spot.id.toLowerCase().includes(q);
          const matchDesc = (spot.addressDesc || '').toLowerCase().includes(q);
          if (!matchRoad && !matchDistrict && !matchId && !matchDesc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
  }, [spots, filters, userLocation]);

  // 車位狀態總計統計
  const stats = useMemo(() => {
    const total = spots.length;
    const empty = spots.filter(s => s.status === 'empty').length;
    const occupied = spots.filter(s => s.status === 'occupied').length;
    const maintenance = spots.filter(s => s.status === 'maintenance').length;
    const charging = spots.filter(s => s.type === 'charging' && s.status === 'empty').length;
    const disability = spots.filter(s => s.type === 'disability' && s.status === 'empty').length;

    return {
      total,
      empty,
      occupied,
      maintenance,
      charging,
      disability
    };
  }, [spots]);

  return {
    city,
    cityInfo: CITIES[city],
    handleCityChange,
    spots,
    filteredSpots,
    stats,
    isLoading,
    error,
    lastUpdated,
    autoRefresh,
    setAutoRefresh,
    refreshData: () => loadData(false),
    filters,
    setFilters,
    userLocation,
    setUserLocation,
    requestGPSLocation,
    availableDistricts,
    selectedSpot,
    setSelectedSpot
  };
}
