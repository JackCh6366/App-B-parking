import fetch from 'node-fetch';

async function inspectAnomalies() {
  console.log('Fetching Taichung raw API to inspect the 6 anomaly sections...');
  const res = await fetch('https://newdatacenter.taichung.gov.tw/api/v1/no-auth/resource.download?rid=1744bc00-cd16-48f3-9632-309f364662bb');
  const json: any = await res.json();
  const rawList: any[] = Array.isArray(json) ? json : json?.result || json?.records || [];

  const anomalyIds = ['6434307', '6457901', '8544201', '8553003', '8583201'];

  for (const id of anomalyIds) {
    const items = rawList.filter(item => String(item.Section_ID) === id);
    console.log(`\n================ Section_ID: ${id} (Total spots: ${items.length}) ================`);
    if (items.length > 0) {
      console.log('Sample item:', items[0]);
      console.log('Lat range:', Math.min(...items.map(i => parseFloat(i.Lat))), '~', Math.max(...items.map(i => parseFloat(i.Lat))));
      console.log('Lng range:', Math.min(...items.map(i => parseFloat(i.Lng))), '~', Math.max(...items.map(i => parseFloat(i.Lng))));
    }
  }
}

inspectAnomalies();
