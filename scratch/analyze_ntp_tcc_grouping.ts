import fetch from 'node-fetch';

async function testGrouping() {
  console.log('--- Testing New Taipei Grouping ---');
  try {
    const ntpRes = await fetch('https://data.ntpc.gov.tw/api/datasets/54A507C4-C038-41B5-BF60-BBECB9D052C6/json?page=0&size=2000');
    const ntpJson: any = await ntpRes.json();
    const ntpList = Array.isArray(ntpJson) ? ntpJson : ntpJson?.result?.records || [];
    console.log(`New Taipei total raw items: ${ntpList.length}`);
    if (ntpList.length > 0) {
      console.log('Sample NTP item keys:', Object.keys(ntpList[0]));
      console.log('Sample NTP item:', ntpList[0]);
    }

    // Test grouping by (district + roadname)
    const ntpGroups = new Map<string, number>();
    for (const item of ntpList) {
      const dist = item.district || item.area_name || item.AREA_NAME || item.areacode || 'Unknown';
      const road = item.roadname || item.road_name || item.ROAD_NAME || item.address || 'UnknownRoad';
      const key = `${dist}__${road}`;
      ntpGroups.set(key, (ntpGroups.get(key) || 0) + 1);
    }
    console.log(`New Taipei grouped into ${ntpGroups.size} segments (by District + RoadName).`);
    const ntpTop5 = Array.from(ntpGroups.entries()).slice(0, 5);
    console.log('Sample NTP groups:', ntpTop5);
  } catch (err: any) {
    console.error('NTP fetch error:', err?.message || err);
  }

  console.log('\n--- Testing Taichung Grouping ---');
  try {
    const tccRes = await fetch('https://newdatacenter.taichung.gov.tw/api/v1/no-auth/resource.download?rid=1744bc00-cd16-48f3-9632-309f364662bb');
    const tccJson: any = await tccRes.json();
    const tccList = Array.isArray(tccJson) ? tccJson : tccJson?.result || tccJson?.records || [];
    console.log(`Taichung total raw items: ${tccList.length}`);
    if (tccList.length > 0) {
      console.log('Sample TCC item keys:', Object.keys(tccList[0]));
      console.log('Sample TCC item:', tccList[0]);
    }

    // Test grouping by Section_ID vs RoadName
    const tccGroupsBySection = new Map<string, number>();
    const tccGroupsByRoad = new Map<string, number>();
    const tccGroupsByDistRoad = new Map<string, number>();

    for (const item of tccList) {
      const section = item.Section_ID || item.section_id || 'NoSection';
      const road = item.RoadName || item.roadname || item.Address || 'UnknownRoad';
      const dist = item.District || item.Area || 'UnknownDist';

      tccGroupsBySection.set(section, (tccGroupsBySection.get(section) || 0) + 1);
      tccGroupsByRoad.set(road, (tccGroupsByRoad.get(road) || 0) + 1);
      const distRoadKey = `${dist}__${road}`;
      tccGroupsByDistRoad.set(distRoadKey, (tccGroupsByDistRoad.get(distRoadKey) || 0) + 1);
    }

    console.log(`Taichung grouped by Section_ID: ${tccGroupsBySection.size} segments.`);
    console.log(`Taichung grouped by RoadName: ${tccGroupsByRoad.size} segments.`);
    console.log(`Taichung grouped by District + RoadName: ${tccGroupsByDistRoad.size} segments.`);
    console.log('Sample TCC groups by Section_ID (first 5):', Array.from(tccGroupsBySection.entries()).slice(0, 5));
    console.log('Sample TCC groups by District + RoadName (first 5):', Array.from(tccGroupsByDistRoad.entries()).slice(0, 5));
  } catch (err: any) {
    console.error('TCC fetch error:', err?.message || err);
  }
}

testGrouping();
