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

interface AuditResult {
  sectionId: string;
  count: number;
  avgLat: number;
  avgLng: number;
  status: 'SUCCESS' | 'NO_ROAD_NAME' | 'SUSPICIOUS_INTERSECTION';
  roadName: string;
  district: string;
  fullAddress: string;
  riskNote?: string;
}

async function auditTaichungSections() {
  console.log('Fetching live Taichung parking data...');
  const res = await fetch('https://newdatacenter.taichung.gov.tw/api/v1/no-auth/resource.download?rid=1744bc00-cd16-48f3-9632-309f364662bb');
  const json: any = await res.json();
  const rawList: SpotRaw[] = Array.isArray(json) ? json : json?.result || json?.records || [];
  console.log(`Total live spots fetched: ${rawList.length}`);

  // 1. Group by Section_ID and compute centroid
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

  console.log(`Total valid Section_IDs to audit: ${centroids.length}`);

  // 2. Perform Reverse Geocoding via Nominatim
  const auditResults: AuditResult[] = [];

  // Delay helper to avoid hitting Nominatim rate limits (1 req / 100ms)
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  let successCount = 0;
  let noRoadCount = 0;
  let suspiciousCount = 0;

  for (let i = 0; i < centroids.length; i++) {
    const c = centroids[i];
    if ((i + 1) % 20 === 0 || i === centroids.length - 1) {
      console.log(`Progress: ${i + 1} / ${centroids.length} sections processed...`);
    }

    try {
      // Use OpenStreetMap Nominatim reverse geocoding API
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${c.avgLat}&lon=${c.avgLng}&zoom=18&addressdetails=1&accept-language=zh-TW`;
      const geoRes = await fetch(url, {
        headers: {
          'User-Agent': 'JackTaichungParkingAppAudit/1.0 (contact@example.com)',
        },
      });

      if (!geoRes.ok) {
        auditResults.push({
          sectionId: c.sectionId,
          count: c.count,
          avgLat: c.avgLat,
          avgLng: c.avgLng,
          status: 'NO_ROAD_NAME',
          roadName: '',
          district: '',
          fullAddress: `HTTP ${geoRes.status}`,
          riskNote: 'API 呼叫失敗',
        });
        noRoadCount++;
        await delay(150);
        continue;
      }

      const geoData: any = await geoRes.json();
      const addr = geoData.address || {};
      
      const roadName = addr.road || addr.pedestrian || addr.street || addr.suburb || '';
      const district = addr.suburb || addr.district || addr.town || addr.city_district || '';
      const displayName = geoData.display_name || '';

      let status: AuditResult['status'] = 'SUCCESS';
      let riskNote = '';

      if (!roadName) {
        status = 'NO_ROAD_NAME';
        noRoadCount++;
      } else {
        // Check for suspicious intersection signals
        // If display_name contains junction/intersection phrases or multiple road indicators
        const isJunction = displayName.includes('交叉口') || displayName.includes('路口') || displayName.includes('角') || displayName.includes('巷') || (addr.suburb && roadName.includes(addr.suburb));
        if (isJunction || roadName.includes('巷') || roadName.includes('弄')) {
          status = 'SUSPICIOUS_INTERSECTION';
          riskNote = `可能為轉角、路口或巷弄: ${roadName}`;
          suspiciousCount++;
        } else {
          status = 'SUCCESS';
          successCount++;
        }
      }

      auditResults.push({
        sectionId: c.sectionId,
        count: c.count,
        avgLat: c.avgLat,
        avgLng: c.avgLng,
        status,
        roadName,
        district,
        fullAddress: displayName,
        riskNote,
      });

      await delay(120); // 120ms rate limit delay
    } catch (err: any) {
      auditResults.push({
        sectionId: c.sectionId,
        count: c.count,
        avgLat: c.avgLat,
        avgLng: c.avgLng,
        status: 'NO_ROAD_NAME',
        roadName: '',
        district: '',
        fullAddress: err?.message || 'Error',
        riskNote: '網路/解析異常',
      });
      noRoadCount++;
      await delay(150);
    }
  }

  // 3. Print summary report
  console.log('\n==========================================');
  console.log('--- 台中市 359 路段地理反查實測統計報告 ---');
  console.log('==========================================');
  console.log(`總檢測路段數: ${centroids.length}`);
  console.log(`1. 成功且明確路名 (SUCCESS): ${successCount} 筆 (${((successCount / centroids.length) * 100).toFixed(2)}%)`);
  console.log(`2. 可疑/轉角/巷弄風險 (SUSPICIOUS_INTERSECTION): ${suspiciousCount} 筆 (${((suspiciousCount / centroids.length) * 100).toFixed(2)}%)`);
  console.log(`3. 查無路名/解析失敗 (NO_ROAD_NAME): ${noRoadCount} 筆 (${((noRoadCount / centroids.length) * 100).toFixed(2)}%)`);

  console.log('\n--- 樣例抽查 (成功路名樣例 5 筆) ---');
  console.log(auditResults.filter(r => r.status === 'SUCCESS').slice(0, 5));

  console.log('\n--- 樣例抽查 (可疑/轉角樣例 5 筆) ---');
  console.log(auditResults.filter(r => r.status === 'SUSPICIOUS_INTERSECTION').slice(0, 5));

  if (noRoadCount > 0) {
    console.log('\n--- 樣例抽查 (查無路名樣例 5 筆) ---');
    console.log(auditResults.filter(r => r.status === 'NO_ROAD_NAME').slice(0, 5));
  }

  // Save audit output to scratch directory for reference
  const fs = await import('fs');
  fs.writeFileSync('scratch/taichung_geocoding_audit_report.json', JSON.stringify(auditResults, null, 2));
  console.log('\nFull audit results written to scratch/taichung_geocoding_audit_report.json');
}

auditTaichungSections();
