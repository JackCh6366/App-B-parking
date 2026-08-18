import fetch from 'node-fetch';

async function testCoordinateFix() {
  const res = await fetch('https://newdatacenter.taichung.gov.tw/api/v1/no-auth/resource.download?rid=1744bc00-cd16-48f3-9632-309f364662bb');
  const json: any = await res.json();
  const rawList: any[] = Array.isArray(json) ? json : json?.result || json?.records || [];

  console.log('--- Testing Taiwan Bounding Box Validation ---');
  // Taiwan WGS84 range: Lat 21.8 ~ 25.5, Lng 119.5 ~ 122.5
  let invalidCoordCount = 0;
  const validSectionsMap = new Map<string, { latSum: number; lngSum: number; count: number }>();

  for (const item of rawList) {
    const secId = String(item.Section_ID || '');
    if (!secId) continue;

    const lat = parseFloat(item.Lat);
    const lng = parseFloat(item.Lng);

    // Validate if lat and lng are within Taiwan main island bounding box
    if (isNaN(lat) || isNaN(lng) || lat < 21.8 || lat > 25.5 || lng < 119.5 || lng > 122.5) {
      invalidCoordCount++;
      // console.log(`Invalid coord item: Section ${secId}, PS ${item.PS_ID}: Lat=${item.Lat}, Lng=${item.Lng}`);
      continue;
    }

    const existing = validSectionsMap.get(secId) || { latSum: 0, lngSum: 0, count: 0 };
    existing.latSum += lat;
    existing.lngSum += lng;
    existing.count += 1;
    validSectionsMap.set(secId, existing);
  }

  console.log(`Total raw items: ${rawList.length}, invalid coordinate items removed: ${invalidCoordCount}`);

  // Test Section 6434307 centroid after fix
  const sec6434307 = validSectionsMap.get('6434307');
  if (sec6434307) {
    const avgLat = sec6434307.latSum / sec6434307.count;
    const avgLng = sec6434307.lngSum / sec6434307.count;
    console.log(`Section 6434307 fixed centroid: Lat=${avgLat.toFixed(6)}, Lng=${avgLng.toFixed(6)}`);
  }

  // Inspect the remaining mountain sections: 8544201, 8553003, 8583201, 6457901
  const mountainIds = ['8544201', '8553003', '8583201', '6457901'];
  for (const id of mountainIds) {
    const sec = validSectionsMap.get(id);
    if (sec) {
      console.log(`Section ${id} fixed centroid: Lat=${(sec.latSum / sec.count).toFixed(6)}, Lng=${(sec.lngSum / sec.count).toFixed(6)}`);
    }
  }
}

testCoordinateFix();
