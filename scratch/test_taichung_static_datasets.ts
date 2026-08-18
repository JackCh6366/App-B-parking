import fetch from 'node-fetch';

async function testStaticDatasets() {
  console.log('--- Checking Dataset 116997 (臺中市路邊停車收費路段) ---');
  try {
    const res = await fetch('https://data.gov.tw/api/v2/rest/dataset/116997');
    if (res.ok) {
      const json: any = await res.json();
      console.log('Dataset 116997 metadata:', JSON.stringify(json, null, 2).slice(0, 1000));
    } else {
      console.log('Dataset 116997 http error:', res.status);
    }
  } catch (e: any) {
    console.error('Error 116997:', e.message);
  }

  console.log('\n--- Checking Dataset 45233 (臺中市路邊停車格位資訊) ---');
  try {
    const res = await fetch('https://data.gov.tw/api/v2/rest/dataset/45233');
    if (res.ok) {
      const json: any = await res.json();
      console.log('Dataset 45233 metadata:', JSON.stringify(json, null, 2).slice(0, 1000));
    } else {
      console.log('Dataset 45233 http error:', res.status);
    }
  } catch (e: any) {
    console.error('Error 45233:', e.message);
  }

  // Also let's check Taichung Open Data Platform direct API
  console.log('\n--- Checking Taichung Data Center API Search ---');
  try {
    const res = await fetch('https://datacenter.taichung.gov.tw/swagger/api-docs/');
    console.log('Taichung swagger status:', res.status);
  } catch (e: any) {
    console.error('Swagger fetch error:', e.message);
  }
}

testStaticDatasets();
