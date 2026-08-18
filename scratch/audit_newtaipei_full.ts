import fetch from 'node-fetch';
import { CITY_DATA_ADAPTERS } from '../src/services/parkingService';

async function auditNewTaipeiComplete() {
  console.log('=== New Taipei Complete Audit ===\n');
  console.log('Fetching all pages...');
  
  let allRawItems: any[] = [];
  
  for (let page = 0; page < 20; page++) {
    const url = `https://data.ntpc.gov.tw/api/datasets/54A507C4-C038-41B5-BF60-BBECB9D052C6/json?page=${page}&size=2000`;
    try {
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JackParkingHelper/1.0',
        }
      });
      if (!res.ok) { console.log(`Page ${page}: HTTP ${res.status}, stopping.`); break; }
      const json: any = await res.json();
      if (!Array.isArray(json) || json.length === 0) { console.log(`Page ${page}: empty, stopping.`); break; }
      console.log(`Page ${page}: ${json.length} items`);
      allRawItems = allRawItems.concat(json);
      if (json.length < 2000) break;
    } catch (e: any) {
      console.error(`Page ${page} fetch error:`, e?.message);
      break;
    }
  }

  console.log(`\n★ Total Raw Items Fetched: ${allRawItems.length}`);

  // ------- Adapter Transform -------
  const spots = CITY_DATA_ADAPTERS['newtaipei'](allRawItems);
  console.log(`★ Total Aggregated Road Segments: ${spots.length}`);

  // ------- Audit 1: Count Integrity -------
  let sumTotalSpaces = 0;
  let sumEmptyCount = 0;
  let sumOccupiedCount = 0;
  let sumCellListLength = 0;

  spots.forEach(s => {
    sumTotalSpaces += s.sensorDetail?.totalSpaces || 0;
    sumEmptyCount += s.sensorDetail?.emptyCount || 0;
    sumOccupiedCount += s.sensorDetail?.occupiedCount || 0;
    sumCellListLength += s.sensorDetail?.cellList?.length || 0;
  });

  console.log('\n--- [1] Count Integrity ---');
  console.log(`Raw items total:            ${allRawItems.length}`);
  console.log(`Sum of totalSpaces:         ${sumTotalSpaces}`);
  console.log(`Sum of cellList lengths:    ${sumCellListLength}`);
  console.log(`empty + occupied sum:       ${sumEmptyCount + sumOccupiedCount}`);
  console.log(`Discrepancy (raw-segments): ${allRawItems.length - sumTotalSpaces}`);

  // ------- Audit 2: Segment ID Uniqueness -------
  const idSet = new Set<string>();
  const dupes: string[] = [];
  spots.forEach(s => {
    if (idSet.has(s.id)) dupes.push(s.id);
    else idSet.add(s.id);
  });

  console.log('\n--- [2] Segment ID Uniqueness ---');
  console.log(`Unique IDs: ${idSet.size} / ${spots.length}`);
  if (dupes.length > 0) console.log('⚠ Duplicate IDs:', dupes);
  else console.log('✓ No duplicate IDs');

  // ------- Audit 3: Cross-District Same-Name Roads -------
  const roadDistricts = new Map<string, Set<string>>();
  spots.forEach(s => {
    const dSet = roadDistricts.get(s.roadName) || new Set();
    dSet.add(s.district);
    roadDistricts.set(s.roadName, dSet);
  });

  const crossDistrict: Array<{ roadName: string; districts: string[]; segmentCount: number }> = [];
  roadDistricts.forEach((dSet, rn) => {
    if (dSet.size > 1) {
      const segCount = spots.filter(s => s.roadName === rn).length;
      crossDistrict.push({ roadName: rn, districts: Array.from(dSet), segmentCount: segCount });
    }
  });

  console.log('\n--- [3] Cross-District Same-Name Roads ---');
  console.log(`Roads appearing in multiple districts: ${crossDistrict.length}`);
  console.log('These are CORRECTLY split into separate segments by (District+RoadName) grouping:');
  crossDistrict.slice(0, 10).forEach(cd => {
    console.log(`  「${cd.roadName}」→ ${cd.districts.join(', ')} (${cd.segmentCount} segments)`);
  });

  // ------- Audit 4: Coordinate Outliers (Bounding Box) -------
  let totalValidCoord = 0;
  let totalInvalidCoord = 0;
  const invalidCoordItems: Array<{ cellId: string; lat: any; lng: any; segment: string }> = [];

  spots.forEach(s => {
    (s.sensorDetail?.cellList || []).forEach((c: any) => {
      const lat = c.lat;
      const lng = c.lng;
      if (lat !== null && lng !== null && lat >= 21.8 && lat <= 25.5 && lng >= 119.5 && lng <= 122.5) {
        totalValidCoord++;
      } else {
        totalInvalidCoord++;
        if (invalidCoordItems.length < 10) {
          invalidCoordItems.push({ cellId: c.cellId, lat, lng, segment: s.roadName });
        }
      }
    });
  });

  console.log('\n--- [4] Coordinate Bounding Box Filter ---');
  console.log(`Valid coordinates:   ${totalValidCoord}`);
  console.log(`Invalid/null coords: ${totalInvalidCoord}`);
  if (invalidCoordItems.length > 0) {
    console.log('Sample invalid items:', JSON.stringify(invalidCoordItems, null, 2));
  }

  // ------- Audit 5: Segment Size Distribution -------
  const sizes = spots.map(s => s.sensorDetail?.totalSpaces || 0).sort((a, b) => a - b);
  const minSize = sizes[0];
  const maxSize = sizes[sizes.length - 1];
  const medianSize = sizes[Math.floor(sizes.length / 2)];
  const avgSize = (sumTotalSpaces / spots.length).toFixed(1);

  console.log('\n--- [5] Segment Size Distribution ---');
  console.log(`Min: ${minSize}, Median: ${medianSize}, Avg: ${avgSize}, Max: ${maxSize}`);

  // Top 5 largest segments
  const top5 = spots
    .map(s => ({ id: s.id, name: `[${s.district}] ${s.roadName}`, total: s.sensorDetail?.totalSpaces || 0 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  console.log('Top 5 largest segments:');
  top5.forEach(t => console.log(`  ${t.name}: ${t.total} 格`));
}

auditNewTaipeiComplete();
