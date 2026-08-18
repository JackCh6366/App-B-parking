import { XMLParser } from 'fast-xml-parser';

async function inspectRoadSegments() {
  console.log('=== Step 1 & 4: Fetching TCMSV_roadquery.xml ===');
  const res = await fetch('https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_roadquery.xml');
  const xmlText = await res.text();
  const parsed = new XMLParser({ ignoreAttributes: true, trimValues: true }).parse(xmlText);
  const roads = parsed?.DATA?.ROAD || [];

  console.log(`Total ROAD entries in XML: ${roads.length}`);

  // Query 1: 前港 matches
  const qiangangMatches = roads.filter((r: any) => String(r.roadSegName || '').includes('前港'));
  console.log(`\n========================================`);
  console.log(`1. Matches for "前港" in XML (Count: ${qiangangMatches.length}):`);
  qiangangMatches.forEach((m: any, idx: number) => {
    const rawCells = m.cellStatusList?.cell || [];
    const cellArr = Array.isArray(rawCells) ? rawCells : [rawCells];
    console.log(`  [${idx + 1}] ID: ${m.roadSegID} | Name: "${m.roadSegName}" | Avail: ${m.roadSegAvail} | Total: ${m.roadSegTotalValue} | Sensors: ${cellArr.length}`);
  });

  // Query 4: 劍潭 matches
  const jiantanMatches = roads.filter((r: any) => String(r.roadSegName || '').includes('劍潭'));
  console.log(`\n========================================`);
  console.log(`4a. Matches for "劍潭" in XML (Count: ${jiantanMatches.length}):`);
  jiantanMatches.forEach((m: any, idx: number) => {
    const rawCells = m.cellStatusList?.cell || [];
    const cellArr = Array.isArray(rawCells) ? rawCells : (rawCells ? [rawCells] : []);
    console.log(`  [${idx + 1}] ID: ${m.roadSegID} | Name: "${m.roadSegName}" | Avail: ${m.roadSegAvail} | Total: ${m.roadSegTotalValue} | Sensors: ${cellArr.length}`);
  });

  // Query 4b: General Road Segmentation Analysis
  // Group roads by base road name (removing numbers / directions / 巷 / 弄)
  const nameDistribution: Record<string, any[]> = {};
  roads.forEach((r: any) => {
    const name = String(r.roadSegName || '');
    if (!name) return;
    if (!nameDistribution[name]) nameDistribution[name] = [];
    nameDistribution[name].push(r);
  });

  const multiSegmentRoads = Object.entries(nameDistribution).filter(([_, list]) => list.length > 1);
  console.log(`\n========================================`);
  console.log(`4b. General Segmentation Structure Analysis:`);
  console.log(`- Unique roadSegName strings: ${Object.keys(nameDistribution).length}`);
  console.log(`- Exact duplicate roadSegName strings with different roadSegIDs: ${multiSegmentRoads.length}`);

  if (multiSegmentRoads.length > 0) {
    console.log(`\nSample roadSegName duplicated entries:`);
    multiSegmentRoads.slice(0, 5).forEach(([name, list]) => {
      console.log(`  - Road Name "${name}" (${list.length} segments):`, list.map(l => l.roadSegID));
    });
  }

  // Also check roads with prefix matches, e.g. "中山北路"
  const zhongshanMatches = roads.filter((r: any) => String(r.roadSegName || '').startsWith('中山北路'));
  console.log(`\nSample: Roads starting with "中山北路" (${zhongshanMatches.length} segments found)`);
  zhongshanMatches.slice(0, 8).forEach((m: any) => {
    console.log(`  - ID: ${m.roadSegID} | Name: "${m.roadSegName}" | Total: ${m.roadSegTotalValue}`);
  });
}

inspectRoadSegments();
