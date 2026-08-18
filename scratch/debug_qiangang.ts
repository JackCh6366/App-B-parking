import taipeiHandler from '../api/parking/taipei.js';
import { CITY_DATA_ADAPTERS } from '../src/services/parkingService.js';
import { XMLParser } from 'fast-xml-parser';

async function debugQiangang() {
  console.log('=== Step 1 & 2: Testing /api/parking/taipei Endpoint ===');
  let rawData: any[] = [];
  const req = { method: 'GET' };
  const res = {
    statusCode: 200,
    headers: {},
    status(code: number) { this.statusCode = code; return this; },
    setHeader(k: string, v: string) {},
    json(data: any) { rawData = data; }
  };

  try {
    await taipeiHandler(req, res);
  } catch (err) {
    console.error('API Route Error thrown:', err);
  }

  const roadsideItems = rawData.filter(i => i.dataType === 'roadside');
  const offstreetItems = rawData.filter(i => i.dataType === 'offstreet');
  console.log(`- API Returned Total Items: ${rawData.length}`);
  console.log(`- Roadside (路邊) Items Count: ${roadsideItems.length}`);
  console.log(`- Offstreet (路外) Items Count: ${offstreetItems.length}`);

  console.log('\n=== Step 4: Inspecting Raw XML for 前港街 ===');
  const xmlRes = await fetch('https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_roadquery.xml');
  const xmlText = await xmlRes.text();
  const parsedObj = new XMLParser().parse(xmlText);
  const roadList = parsedObj?.DATA?.ROAD || [];

  const rawQiangangRoads = roadList.filter((r: any) => String(r.roadSegName || '').includes('前港'));
  console.log(`- Raw XML matching '前港': ${rawQiangangRoads.length} items`);
  rawQiangangRoads.forEach((r: any, idx: number) => {
    console.log(`  [${idx}] ID: ${r.roadSegID}, Name: "${r.roadSegName}", Avail: ${r.roadSegAvail}, Total: ${r.roadSegTotalValue}, CarType: ${r.roadSegCarType}`);
  });

  console.log('\n=== Step 5 & Frontend Filter Check ===');
  const adapter = CITY_DATA_ADAPTERS['taipei'];
  const spots = adapter(rawData);
  const qiangangSpots = spots.filter(s => s.roadName.includes('前港') || (s.addressDesc || '').includes('前港'));
  console.log(`- Transformed ParkingSpot matching '前港': ${qiangangSpots.length} items`);
  qiangangSpots.forEach((s, idx) => {
    console.log(`  [${idx}] ID: ${s.id}, District: "${s.district}", RoadName: "${s.roadName}", Status: ${s.status}, TypeLabel: ${s.typeLabel}`);
  });

  // 測試在『士林區』選單或『onlyAvailable』開啟狀態下的過濾結果
  console.log('\n=== Testing Filter Scenarios for 前港街 ===');
  const shilinOnly = qiangangSpots.filter(s => s.district === '士林區');
  const availableOnly = qiangangSpots.filter(s => s.status === 'empty');
  const searchResult = spots.filter(s => {
    const q = '前港街';
    const matchRoad = s.roadName.toLowerCase().includes(q);
    const matchDistrict = s.district.toLowerCase().includes(q);
    const matchId = s.id.toLowerCase().includes(q);
    const matchDesc = (s.addressDesc || '').toLowerCase().includes(q);
    return matchRoad || matchDistrict || matchId || matchDesc;
  });

  console.log(`- Filter by Query '前港街': ${searchResult.length} items`);
  searchResult.forEach((s, idx) => {
    console.log(`  Search Result [${idx}]: ID=${s.id}, Name="${s.roadName}", District="${s.district}", Status=${s.status}`);
  });
}

debugQiangang();
