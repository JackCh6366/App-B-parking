import taichungHandler from '../api/parking/taichung.js';
import { CITY_DATA_ADAPTERS } from '../src/services/parkingService.js';

async function testTaichungDistricts() {
  console.log('--- Testing Taichung Data Adapter with Official GeoJSON Point-in-Polygon Map ---');
  let rawData: any[] = [];
  await taichungHandler({ method: 'GET' }, {
    statusCode: 200,
    headers: {},
    status() { return this; },
    setHeader() {},
    json(d: any) { rawData = d; }
  });

  console.log(`Raw Taichung Items Count: ${rawData.length}`);

  const adapter = CITY_DATA_ADAPTERS['taichung'];
  const spots = adapter(rawData);
  console.log(`Transformed ParkingSpot Count: ${spots.length}`);

  const districtDistribution: Record<string, number> = {};
  spots.forEach(s => {
    districtDistribution[s.district] = (districtDistribution[s.district] || 0) + 1;
  });

  console.log('\n--- Taichung Spots District Distribution ---');
  console.log(districtDistribution);

  const xitunSpots = spots.filter(s => s.district === '西屯區');
  const beitunSpots = spots.filter(s => s.district === '北屯區');
  const otherSpots = spots.filter(s => s.district === '其他區');
  const fallbackTaichungSpots = spots.filter(s => s.district === '臺中市');

  console.log(`\n- 西屯區車位數: ${xitunSpots.length}`);
  console.log(`- 北屯區車位數: ${beitunSpots.length}`);
  console.log(`- 其他區車位數: ${otherSpots.length}`);
  console.log(`- 靜默兜底至 '臺中市' 筆數: ${fallbackTaichungSpots.length}`);

  if (xitunSpots.length > 0) {
    console.log('Sample 西屯區 Spot:', {
      id: xitunSpots[0].id,
      district: xitunSpots[0].district,
      roadName: xitunSpots[0].roadName,
      status: xitunSpots[0].status
    });
  }
}

testTaichungDistricts();
