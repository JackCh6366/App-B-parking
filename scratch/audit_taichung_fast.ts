import fetch from 'node-fetch';

interface SpotRaw {
  Section_ID: string;
  PS_ID: string;
  Lat: string;
  Lng: string;
  status: string;
}

interface SectionCentroid {
  sectionId: string;
  count: number;
  avgLat: number;
  avgLng: number;
}

// Distance from point (px, py) to line segment (x1, y1) -> (x2, y2) in meters
function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    return Math.hypot((px - x1) * 111000, (py - y1) * 100000);
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  // Convert lat/lng diff to meters approx (1 deg lat = 111km, 1 deg lng = 100km at lat 24)
  const dLat = (py - projY) * 111000;
  const dLng = (px - projX) * 101000;
  return Math.hypot(dLat, dLng);
}

async function auditTaichungFast() {
  console.log('1. Fetching live Taichung parking spots...');
  const res = await fetch('https://newdatacenter.taichung.gov.tw/api/v1/no-auth/resource.download?rid=1744bc00-cd16-48f3-9632-309f364662bb');
  const json: any = await res.json();
  const rawList: SpotRaw[] = Array.isArray(json) ? json : json?.result || json?.records || [];

  const sectionsMap = new Map<string, { latSum: number; lngSum: number; count: number }>();
  for (const item of rawList) {
    const secId = String(item.Section_ID || '');
    if (!secId) continue;
    const lat = parseFloat(item.Lat);
    const lng = parseFloat(item.Lng);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) continue;

    const existing = sectionsMap.get(secId) || { latSum: 0, lngSum: 0, count: 0 };
    existing.latSum += lat;
    existing.lngSum += lng;
    existing.count += 1;
    sectionsMap.set(secId, existing);
  }

  const centroids: SectionCentroid[] = [];
  sectionsMap.forEach((val, secId) => {
    centroids.push({
      sectionId: secId,
      count: val.count,
      avgLat: val.latSum / val.count,
      avgLng: val.lngSum / val.count,
    });
  });
  console.log(`Computed centroids for ${centroids.length} Section_IDs.`);

  // 2. Query Overpass API for all named highways in Taichung (bbox: 24.0, 120.5 to 24.4, 120.9)
  console.log('2. Fetching Taichung road network geometry from OpenStreetMap Overpass API...');
  const overpassQuery = `
    [out:json][timeout:30];
    (
      way["name"]["highway"](24.0,120.4,24.4,120.9);
    );
    out body;
    >;
    out skel qt;
  `;

  const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: overpassQuery,
  });

  if (!overpassRes.ok) {
    console.error(`Overpass API HTTP ${overpassRes.status}`);
    return;
  }

  const overpassData: any = await overpassRes.json();
  console.log(`Received Overpass data. Nodes count: ${overpassData.elements.filter((e: any) => e.type === 'node').length}, Ways count: ${overpassData.elements.filter((e: any) => e.type === 'way').length}`);

  // Build node map: id -> { lat, lon }
  const nodeMap = new Map<number, { lat: number; lon: number }>();
  for (const elem of overpassData.elements) {
    if (elem.type === 'node') {
      nodeMap.set(elem.id, { lat: elem.lat, lon: elem.lon });
    }
  }

  // Build road segments list
  const roadSegments: { name: string; x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const elem of overpassData.elements) {
    if (elem.type === 'way' && elem.tags && elem.tags.name && elem.nodes) {
      const name = elem.tags.name;
      const nodes = elem.nodes;
      for (let i = 0; i < nodes.length - 1; i++) {
        const n1 = nodeMap.get(nodes[i]);
        const n2 = nodeMap.get(nodes[i + 1]);
        if (n1 && n2) {
          roadSegments.push({
            name,
            x1: n1.lon,
            y1: n1.lat,
            x2: n2.lon,
            y2: n2.lat,
          });
        }
      }
    }
  }
  console.log(`Built ${roadSegments.length} road segment vectors with road names.`);

  // 3. Match each Section_ID centroid to nearest road segment
  let clearMatchCount = 0;        // Distance <= 30m, top 2 candidate roads are the same or distance diff > 15m
  let suspiciousMatchCount = 0;   // Distance <= 30m, but 2nd nearest road is within 10m (intersection conflict)
  let noMatchCount = 0;           // Nearest road distance > 50m

  const auditResults: any[] = [];

  for (const c of centroids) {
    // Find top 2 nearest roads
    let minDist1 = Infinity;
    let name1 = '';
    let minDist2 = Infinity;
    let name2 = '';

    for (const seg of roadSegments) {
      const dist = pointToSegmentDistance(c.avgLng, c.avgLat, seg.x1, seg.y1, seg.x2, seg.y2);
      if (dist < minDist1) {
        if (seg.name !== name1) {
          minDist2 = minDist1;
          name2 = name1;
        }
        minDist1 = dist;
        name1 = seg.name;
      } else if (dist < minDist2 && seg.name !== name1) {
        minDist2 = dist;
        name2 = seg.name;
      }
    }

    let status = 'SUCCESS';
    let riskNote = '';

    if (minDist1 > 50) {
      status = 'NO_ROAD_NAME';
      name1 = '';
      noMatchCount++;
      riskNote = `距離最近道路仍超出一範圍 (${minDist1.toFixed(1)}m)`;
    } else if (minDist2 < minDist1 + 10 && name2 && name1 !== name2) {
      status = 'SUSPICIOUS_INTERSECTION';
      suspiciousMatchCount++;
      riskNote = `路口轉角交叉疑慮: 主路名「${name1}」(${minDist1.toFixed(1)}m), 次路名「${name2}」(${minDist2.toFixed(1)}m)`;
    } else {
      status = 'SUCCESS';
      clearMatchCount++;
    }

    auditResults.push({
      sectionId: c.sectionId,
      spotCount: c.count,
      centroid: [c.avgLat, c.avgLng],
      status,
      roadName: name1,
      nearestDistanceMeter: Number(minDist1.toFixed(1)),
      secondCandidateRoad: name2 || undefined,
      secondDistanceMeter: minDist2 < 9999 ? Number(minDist2.toFixed(1)) : undefined,
      riskNote,
    });
  }

  // 4. Output Summary Statistics
  console.log('\n======================================================');
  console.log(`--- 全數 ${centroids.length} 個 Section_IDs 地理反查實測統計報告 ---`);
  console.log('======================================================');
  console.log(`總檢測 Section 數量: ${centroids.length} 個`);
  console.log(`1. 成功且明確中文路名 (SUCCESS): ${clearMatchCount} 筆 (${((clearMatchCount / centroids.length) * 100).toFixed(2)}%)`);
  console.log(`2. 轉角/路口交界疑慮 (SUSPICIOUS_INTERSECTION): ${suspiciousMatchCount} 筆 (${((suspiciousMatchCount / centroids.length) * 100).toFixed(2)}%)`);
  console.log(`3. 查無路名/偏離道路 (NO_ROAD_NAME): ${noMatchCount} 筆 (${((noMatchCount / centroids.length) * 100).toFixed(2)}%)`);

  console.log('\n--- 樣例 1: 成功明確路名 (前 5 筆) ---');
  console.log(auditResults.filter(r => r.status === 'SUCCESS').slice(0, 5));

  console.log('\n--- 樣例 2: 轉角路口交界風險 (前 5 筆) ---');
  console.log(auditResults.filter(r => r.status === 'SUSPICIOUS_INTERSECTION').slice(0, 5));

  if (noMatchCount > 0) {
    console.log('\n--- 樣例 3: 查無路名 (前 5 筆) ---');
    console.log(auditResults.filter(r => r.status === 'NO_ROAD_NAME').slice(0, 5));
  }

  // Write full json report
  const fs = await import('fs');
  fs.writeFileSync('scratch/taichung_sections_audit_full.json', JSON.stringify(auditResults, null, 2));
  console.log('\nFull audit dataset saved to: scratch/taichung_sections_audit_full.json');
}

auditTaichungFast();
