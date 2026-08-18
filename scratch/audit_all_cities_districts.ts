import newTaipeiHandler from '../api/parking/newtaipei.js';
import taichungHandler from '../api/parking/taichung.js';
import taipeiHandler from '../api/parking/taipei.js';
import { CITY_DATA_ADAPTERS } from '../src/services/parkingService.js';

async function auditCities() {
  console.log('=================== AUDITING ALL CITIES DISTRICTS ===================\n');

  // Helper function to invoke handlers
  const callHandler = async (handler: any) => {
    let data: any = null;
    await handler({ method: 'GET' }, {
      statusCode: 200,
      headers: {},
      status() { return this; },
      setHeader() {},
      json(d: any) { data = d; }
    });
    return data;
  };

  // 1. Audit New Taipei City
  console.log('--- 1. NEW TAIPEI CITY (新北市) ---');
  const ntpRaw = await callHandler(newTaipeiHandler);
  if (Array.isArray(ntpRaw) && ntpRaw.length > 0) {
    const sample = ntpRaw[0];
    console.log('Sample Raw Keys:', Object.keys(sample));
    console.log('Sample District/Area Fields:', {
      areacode: sample.areacode,
      district: sample.district,
      area_name: sample.area_name,
      AREA_NAME: sample.AREA_NAME
    });

    // Check adapter output
    const ntpAdapter = CITY_DATA_ADAPTERS['newtaipei'];
    const ntpSpots = ntpAdapter(ntpRaw);
    const ntpFallbackCount = ntpSpots.filter(s => s.district === '新北市').length;
    const ntpDistricts = Array.from(new Set(ntpSpots.map(s => s.district)));
    console.log(`Total NTP Spots: ${ntpSpots.length}`);
    console.log(`Fallback to '新北市': ${ntpFallbackCount} items`);
    console.log(`Distinct Districts found (${ntpDistricts.length}):`, ntpDistricts.sort());
  }

  // 2. Audit Taichung City
  console.log('\n--- 2. TAICHUNG CITY (臺中市) ---');
  const tccRaw = await callHandler(taichungHandler);
  if (Array.isArray(tccRaw) && tccRaw.length > 0) {
    const sample = tccRaw[0];
    console.log('Sample Raw Keys:', Object.keys(sample));
    console.log('Sample District/Area Fields:', {
      District: sample.District,
      Area: sample.Area,
      district: sample.district,
      area: sample.area
    });

    // Check adapter output
    const tccAdapter = CITY_DATA_ADAPTERS['taichung'];
    const tccSpots = tccAdapter(tccRaw);
    const tccFallbackCount = tccSpots.filter(s => s.district === '臺中市').length;
    const tccDistricts = Array.from(new Set(tccSpots.map(s => s.district)));
    console.log(`Total TCC Spots: ${tccSpots.length}`);
    console.log(`Fallback to '臺中市': ${tccFallbackCount} items`);
    console.log(`Distinct Districts found (${tccDistricts.length}):`, tccDistricts.sort());
  }

  // 3. Audit Taipei City
  console.log('\n--- 3. TAIPEI CITY (臺北市) ---');
  const tpeRaw = await callHandler(taipeiHandler);
  if (Array.isArray(tpeRaw) && tpeRaw.length > 0) {
    const roadsideRaw = tpeRaw.filter(i => i.dataType === 'roadside');
    const offstreetRaw = tpeRaw.filter(i => i.dataType === 'offstreet');
    console.log(`Raw Roadside Count: ${roadsideRaw.length}, Raw Offstreet Count: ${offstreetRaw.length}`);
    if (roadsideRaw.length > 0) {
      console.log('Sample Roadside Raw Keys:', Object.keys(roadsideRaw[0]));
    }
    if (offstreetRaw.length > 0) {
      console.log('Sample Offstreet Raw Keys:', Object.keys(offstreetRaw[0]));
    }

    const tpeAdapter = CITY_DATA_ADAPTERS['taipei'];
    const tpeSpots = tpeAdapter(tpeRaw);
    const tpeFallbackCount = tpeSpots.filter(s => s.district === '中山區' && s.rawSourceData?.dataType === 'roadside').length;
    const tpeDistricts = Array.from(new Set(tpeSpots.map(s => s.district)));
    console.log(`Total TPE Spots: ${tpeSpots.length}`);
    console.log(`Roadside Fallback to '中山區': ${tpeFallbackCount} items / ${roadsideRaw.length}`);
    console.log(`Distinct Districts found (${tpeDistricts.length}):`, tpeDistricts.sort());
  }
}

auditCities();
