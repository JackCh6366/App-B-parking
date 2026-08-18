import { XMLParser } from 'fast-xml-parser';
import { CITY_DATA_ADAPTERS } from '../src/services/parkingService.js';

async function checkDistricts() {
  const xmlRes = await fetch('https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_roadquery.xml');
  const xmlText = await xmlRes.text();
  const parsedObj = new XMLParser().parse(xmlText);
  const roadList = parsedObj?.DATA?.ROAD || [];

  const adapter = CITY_DATA_ADAPTERS['taipei'];
  const spots = adapter(roadList.map((r: any) => ({ dataType: 'roadside', ...r })));

  const districtCounts: Record<string, number> = {};
  spots.forEach(s => {
    districtCounts[s.district] = (districtCounts[s.district] || 0) + 1;
  });

  console.log('District counts distribution for 2,345 roadside spots:');
  console.log(districtCounts);
}

checkDistricts();
