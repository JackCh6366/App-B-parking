import fetch from 'node-fetch';

async function audit6434307() {
  const tccRes = await fetch('https://newdatacenter.taichung.gov.tw/api/v1/no-auth/resource.download?rid=1744bc00-cd16-48f3-9632-309f364662bb');
  const tccJson: any = await tccRes.json();
  const tccRaw: any[] = Array.isArray(tccJson) ? tccJson : tccJson?.result || tccJson?.records || [];

  const target = tccRaw.find(item => String(item.Section_ID || item.section_id) === '6434307' && String(item.PS_ID || item.ps_id) === '00100');
  console.log('★ Section 6434307 PS_ID 00100 Raw Item in official API response:');
  console.log(JSON.stringify(target, null, 2));

  // Let's also check all items in section 6434307
  const allInSec = tccRaw.filter(item => String(item.Section_ID || item.section_id) === '6434307');
  console.log(`\nTotal items in Section 6434307: ${allInSec.length}`);

  const invalidCoords = allInSec.filter(item => {
    const lat = parseFloat(item.Lat || item.Latitude || item.lat);
    const lng = parseFloat(item.Lng || item.Longitude || item.lng);
    return isNaN(lat) || isNaN(lng) || lat < 21.8 || lat > 25.5 || lng < 119.5 || lng > 122.5;
  });

  console.log('\nInvalid coordinate items in Section 6434307:');
  console.log(JSON.stringify(invalidCoords, null, 2));
}

audit6434307();
