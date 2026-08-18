import taipeiHandler from '../api/parking/taipei.js';
import { CITY_DATA_ADAPTERS } from '../src/services/parkingService.js';

async function runFullTest() {
  console.log('--- Executing Taipei Full Integration Test ---');
  let rawData: any[] = [];
  const req = { method: 'GET' };
  const res = {
    statusCode: 200,
    headers: {},
    status(code: number) { this.statusCode = code; return this; },
    setHeader(k: string, v: string) {},
    json(data: any) { rawData = data; }
  };

  await taipeiHandler(req, res);

  console.log('Raw combined items count:', rawData.length);

  const adapter = CITY_DATA_ADAPTERS['taipei'];
  const spots = adapter(rawData);
  console.log('Transformed ParkingSpot items count:', spots.length);

  // 檢查座標狀況 (有座標路外 vs 無座標路邊)
  const withCoords = spots.filter(s => s.lat !== null && s.lng !== null);
  const withoutCoords = spots.filter(s => s.lat === null || s.lng === null);
  console.log(`- 有座標項目 (路外停車場): ${withCoords.length}`);
  console.log(`- 無座標項目 (路邊停車格): ${withoutCoords.length}`);

  // 檢查士林區與劍潭路
  const shilinSpots = spots.filter(s => s.district === '士林區' || s.roadName.includes('士林'));
  const jiantanSpots = spots.filter(s => s.roadName.includes('劍潭'));
  console.log(`- 士林區相關項目數: ${shilinSpots.length}`);
  console.log(`- 劍潭路相關項目數: ${jiantanSpots.length}`);

  if (jiantanSpots.length > 0) {
    console.log('Sample 劍潭路 Spot:', jiantanSpots[0]);
  } else if (shilinSpots.length > 0) {
    console.log('Sample 士林區 Spot:', shilinSpots[0]);
  }

  // 檢查獨立車種標籤 (HM 重型機車, T 大客車)
  const heavyMotorcycleSpots = spots.filter(s => s.typeLabel === '重型機車格');
  const busSpots = spots.filter(s => s.typeLabel === '大客車格');
  console.log(`- 重型機車格 (HM) 筆數: ${heavyMotorcycleSpots.length}`);
  console.log(`- 大客車格 (T) 筆數: ${busSpots.length}`);
}

runFullTest();
