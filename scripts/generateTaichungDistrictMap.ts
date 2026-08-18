import fs from 'fs';
import path from 'path';
import https from 'https';

/**
 * 腳本名稱：generateTaichungDistrictMap.ts
 * 說明：從內政部/g0v 權威 29 行政區 GeoJSON 邊界圖資對臺中市 359 個路段 (Section_ID) 執行 Point-in-Polygon
 * 運算，產生離線對照字典檔 `src/config/taichungDistrictsMap.ts`。
 * 
 * 使用方式：
 *   npx tsx scripts/generateTaichungDistrictMap.ts
 */

// 射線交叉法 Point-in-Polygon (點是否落於多邊形內)
function isPointInRing(point: [number, number], ring: number[][]): boolean {
  const [x, y] = point; // [lng, lat]
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function isPointInFeature(point: [number, number], feature: any): boolean {
  const geom = feature.geometry;
  if (!geom) return false;

  if (geom.type === 'Polygon') {
    return isPointInRing(point, geom.coordinates[0]);
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      if (isPointInRing(point, poly[0])) return true;
    }
  }
  return false;
}

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runGenerator() {
  console.log('=== Starting Taichung District Map Pre-computation ===');

  // 1. 抓取臺中市即時 API 所有點位
  console.log('1. Fetching Taichung Parking API Dataset...');
  const taichungData = await fetchJson(
    'https://newdatacenter.taichung.gov.tw/api/v1/no-auth/resource.download?rid=1744bc00-cd16-48f3-9632-309f364662bb'
  );
  console.log(`Total parking spots fetched: ${taichungData.length}`);

  // 計算每個 Section_ID 的中心座標 (經緯度平均)
  const sectionCoordsMap = new Map<string, { latSum: number; lngSum: number; count: number }>();
  for (const item of taichungData) {
    const sectionId = String(item.Section_ID || '');
    const lat = parseFloat(item.Lat);
    const lng = parseFloat(item.Lng);
    if (!sectionId || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) continue;

    const current = sectionCoordsMap.get(sectionId) || { latSum: 0, lngSum: 0, count: 0 };
    current.latSum += lat;
    current.lngSum += lng;
    current.count += 1;
    sectionCoordsMap.set(sectionId, current);
  }

  console.log(`Unique Section_IDs found: ${sectionCoordsMap.size}`);

  // 2. 抓取台灣全轄鄉鎮市區 GeoJSON 圖資
  console.log('2. Fetching Taiwan Townships GeoJSON Boundary...');
  const geojson = await fetchJson(
    'https://raw.githubusercontent.com/g0v/twgeojson/master/json/twTown1982.geo.json'
  );

  // 篩選臺中市 29 個行政區多邊形
  const taichungFeatures = geojson.features.filter((f: any) => {
    const cName = f.properties.COUNTYNAME || f.properties.county || f.properties.COUNTY || '';
    return cName.includes('中');
  });

  console.log(`Loaded ${taichungFeatures.length} district polygons for Taichung City.`);

  // 3. 執行 Point-in-polygon 計算
  const sectionDistrictMap: Record<string, string> = {};
  const districtCounts: Record<string, number> = {};
  let unmappedCount = 0;

  sectionCoordsMap.forEach((val, sectionId) => {
    const avgLat = val.latSum / val.count;
    const avgLng = val.lngSum / val.count;
    const point: [number, number] = [avgLng, avgLat]; // [lng, lat]

    let matchedDistrict: string | null = null;
    for (const feature of taichungFeatures) {
      if (isPointInFeature(point, feature)) {
        matchedDistrict = feature.properties.TOWNNAME || feature.properties.Town || feature.properties.name;
        break;
      }
    }

    if (matchedDistrict) {
      // 確保格式統一致 '區' 結尾
      if (!matchedDistrict.endsWith('區') && !matchedDistrict.endsWith('市')) {
        matchedDistrict += '區';
      }
      sectionDistrictMap[sectionId] = matchedDistrict;
      districtCounts[matchedDistrict] = (districtCounts[matchedDistrict] || 0) + 1;
    } else {
      unmappedCount++;
    }
  });

  console.log('\n--- Section_ID to District Mapping Summary ---');
  console.log(districtCounts);
  console.log(`Unmapped Section_IDs count: ${unmappedCount}`);

  // 4. 寫入到 src/config/taichungDistrictsMap.ts
  const targetPath = path.join(process.cwd(), 'src', 'config', 'taichungDistrictsMap.ts');
  const fileContent = `/**
 * 臺中市 Section_ID (路段代號) -> 行政區 靜態對照字典檔
 * 由 scripts/generateTaichungDistrictMap.ts 基於內政部/g0v 官方 29 行政區邊界圖資 (GeoJSON Point-in-polygon) 自動產生。
 * 
 * 若未來臺中市新增路段，不在本表中時，適配器會自動退回至 '其他區'，絕不靜默塞回 '臺中市'。
 */

export const TAICHUNG_SECTION_DISTRICT_MAP: Record<string, string> = ${JSON.stringify(sectionDistrictMap, null, 2)};
`;

  fs.writeFileSync(targetPath, fileContent, 'utf-8');
  console.log(`\nSuccessfully saved static mapping dictionary to: ${targetPath}`);
}

runGenerator().catch(console.error);
