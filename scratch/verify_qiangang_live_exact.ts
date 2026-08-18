import { XMLParser } from 'fast-xml-parser';
import { CITY_DATA_ADAPTERS } from '../src/services/parkingService.js';

async function verifyQiangangExact() {
  console.log('=== Fetching Live TCMSV_roadquery.xml ===');
  const res = await fetch('https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_roadquery.xml');
  const xmlText = await res.text();
  const parsed = new XMLParser({ ignoreAttributes: true, trimValues: true }).parse(xmlText);
  const roads = parsed?.DATA?.ROAD || [];

  const qg = roads.find((r: any) => String(r.roadSegName).includes('前港'));
  if (!qg) return;

  qg.dataType = 'roadside';
  const adapter = CITY_DATA_ADAPTERS['taipei'];
  const spot = adapter([qg])[0];

  console.log('\n--- Transformed ParkingSpot Object for 前港街 ---');
  console.log(spot);
}

verifyQiangangExact();
