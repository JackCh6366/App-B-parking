import { XMLParser } from 'fast-xml-parser';

async function inspectXml() {
  console.log('=== Step 1 & 2: Fetching Raw XML TCMSV_roadquery.xml ===');
  const res = await fetch('https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_roadquery.xml');
  const xmlText = await res.text();

  const parser = new XMLParser({ ignoreAttributes: true, trimValues: true });
  const parsed = parser.parse(xmlText);

  const roads = parsed?.DATA?.ROAD || [];
  console.log(`Total XML roads found: ${roads.length}`);

  if (roads.length > 0) {
    console.log('Sample raw ROAD object keys:', Object.keys(roads[0]));
    console.log('Sample raw ROAD object [0]:', roads[0]);
  }

  // Find 前港街
  const qiangangRaw = roads.filter((r: any) => String(r.roadSegName || '').includes('前港'));
  console.log('\n=== Raw XML items matching "前港": ===');
  console.log(qiangangRaw);

  // Field names presence check across dataset:
  const fieldCounts: Record<string, number> = {};
  roads.forEach((r: any) => {
    Object.keys(r).forEach(k => {
      fieldCounts[k] = (fieldCounts[k] || 0) + 1;
    });
  });
  console.log('\n=== Field presence counts across all 2,345 roads: ===');
  console.log(fieldCounts);
}

inspectXml();
