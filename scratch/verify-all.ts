import taipeiHandler from '../api/parking/taipei.ts';
import taichungHandler from '../api/parking/taichung.ts';
import newtaipeiHandler from '../api/parking/newtaipei.ts';
import { CITY_DATA_ADAPTERS } from '../src/services/parkingService.ts';

async function testApi(name, handler, adapterKey) {
  console.log(`\n========================================`);
  console.log(`Testing API Endpoint: /api/parking/${adapterKey} (${name})`);
  console.log(`========================================`);

  // Request 1: Initial (MISS)
  const req1 = { method: 'GET' };
  let status1 = 0;
  let headers1 = {};
  let data1 = null;
  const res1 = {
    status(c) { status1 = c; return res1; },
    setHeader(k, v) { headers1[k] = v; },
    json(d) { data1 = d; return res1; }
  };

  const start1 = Date.now();
  await handler(req1, res1);
  const time1 = Date.now() - start1;

  console.log(`[Req 1 - First Fetch]`);
  console.log(`  Status: ${status1}`);
  console.log(`  Headers:`, headers1);
  console.log(`  Duration: ${time1} ms`);
  console.log(`  Raw items count: ${Array.isArray(data1) ? data1.length : 'N/A'}`);

  // Test Adapter Transformation
  let spots = [];
  if (Array.isArray(data1)) {
    const adapterFn = CITY_DATA_ADAPTERS[adapterKey];
    spots = adapterFn(data1);
    console.log(`  Adapter output spots count: ${spots.length}`);
    if (spots.length > 0) {
      const sample = spots[0];
      console.log(`  Sample Spot: ID=${sample.id}, City=${sample.city}, District=${sample.district}, Road=${sample.roadName}, Status=${sample.status}`);
    }
  }

  // Request 2: Cached (HIT)
  const req2 = { method: 'GET' };
  let status2 = 0;
  let headers2 = {};
  let data2 = null;
  const res2 = {
    status(c) { status2 = c; return res2; },
    setHeader(k, v) { headers2[k] = v; },
    json(d) { data2 = d; return res2; }
  };

  const start2 = Date.now();
  await handler(req2, res2);
  const time2 = Date.now() - start2;

  console.log(`[Req 2 - Cached Read]`);
  console.log(`  Status: ${status2}`);
  console.log(`  Headers:`, headers2);
  console.log(`  Duration: ${time2} ms (Speedup: ${(time1 / Math.max(time2, 1)).toFixed(1)}x)`);
  console.log(`  Cached items count: ${Array.isArray(data2) ? data2.length : 'N/A'}`);

  const isOk = status1 === 200 && status2 === 200 && spots.length > 0;
  console.log(`>>> Result for ${name}: ${isOk ? '✅ PASSED' : '❌ FAILED'}`);
  return isOk;
}

async function runAllVerifications() {
  const r1 = await testApi('臺北市 (Taipei)', taipeiHandler, 'taipei');
  const r2 = await testApi('臺中市 (Taichung)', taichungHandler, 'taichung');
  const r3 = await testApi('新北市 (NewTaipei)', newtaipeiHandler, 'newtaipei');

  console.log(`\n========================================`);
  console.log(`OVERALL VERIFICATION SUMMARY`);
  console.log(`========================================`);
  console.log(`Taipei API:    ${r1 ? '✅ OK' : '❌ Failed'}`);
  console.log(`Taichung API:  ${r2 ? '✅ OK' : '❌ Failed'}`);
  console.log(`NewTaipei API: ${r3 ? '✅ OK' : '❌ Failed'}`);
  console.log(`========================================\n`);
}

runAllVerifications();
