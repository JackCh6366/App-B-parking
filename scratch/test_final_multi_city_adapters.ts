import fetch from 'node-fetch';
import { CITY_DATA_ADAPTERS } from '../src/services/parkingService';

async function testFinalAdapters() {
  console.log('--- Testing New Taipei Segment Aggregation ---');
  const mockNtpRaw = [
    { areacode: '65000010', district: '板橋區', roadname: '文化路一段', cellstatus: 'N', latitude: '25.0135', longitude: '121.4650', cellid: 'NTP-001' },
    { areacode: '65000010', district: '板橋區', roadname: '文化路一段', cellstatus: 'Y', latitude: '25.0137', longitude: '121.4652', cellid: 'NTP-002' },
    { areacode: '65000010', district: '板橋區', roadname: '文化路一段', cellstatus: 'N', latitude: '25.0139', longitude: '121.4654', cellid: 'NTP-003' },
    { areacode: '65000020', district: '三重區', roadname: '正義北路', cellstatus: 'Y', latitude: '25.0680', longitude: '121.4980', cellid: 'NTP-004' },
  ];

  const ntpSpots = CITY_DATA_ADAPTERS['newtaipei'](mockNtpRaw);
  console.log(`New Taipei Aggregated Road Segments: ${ntpSpots.length}`);
  if (ntpSpots.length > 0) {
    console.log('Sample NTP Road Segment Spot:', {
      id: ntpSpots[0].id,
      district: ntpSpots[0].district,
      roadName: ntpSpots[0].roadName,
      addressDesc: ntpSpots[0].addressDesc,
      sensorDetail: {
        dataSource: ntpSpots[0].sensorDetail?.dataSource,
        emptyCount: ntpSpots[0].sensorDetail?.emptyCount,
        occupiedCount: ntpSpots[0].sensorDetail?.occupiedCount,
        totalSpaces: ntpSpots[0].sensorDetail?.totalSpaces,
        cellListCount: ntpSpots[0].sensorDetail?.cellList?.length,
      }
    });
  }

  console.log('\n--- Testing Taichung Segment Aggregation & Road Mapping ---');
  const tccRes = await fetch('https://newdatacenter.taichung.gov.tw/api/v1/no-auth/resource.download?rid=1744bc00-cd16-48f3-9632-309f364662bb');
  const tccJson: any = await tccRes.json();
  const tccRaw = Array.isArray(tccJson) ? tccJson : tccJson?.result || tccJson?.records || [];
  console.log(`Taichung Raw Items: ${tccRaw.length}`);
  const tccSpots = CITY_DATA_ADAPTERS['taichung'](tccRaw);
  console.log(`Taichung Aggregated Road Segments: ${tccSpots.length}`);

  // Test Section 6434307 specifically
  const sec6434307 = tccSpots.find(s => s.id === 'TCC-ROAD-6434307');
  if (sec6434307) {
    console.log('\n★ Section 6434307 (The 29-spot section with 1 corrupted Lng) Verification:');
    console.log({
      id: sec6434307.id,
      district: sec6434307.district,
      roadName: sec6434307.roadName,
      addressDesc: sec6434307.addressDesc,
      centroid: [sec6434307.lat, sec6434307.lng],
      sensorDetail: {
        dataSource: sec6434307.sensorDetail?.dataSource,
        emptyCount: sec6434307.sensorDetail?.emptyCount,
        occupiedCount: sec6434307.sensorDetail?.occupiedCount,
        totalSpaces: sec6434307.sensorDetail?.totalSpaces,
        isApproximate: sec6434307.sensorDetail?.isApproximate,
        cellListLength: sec6434307.sensorDetail?.cellList?.length,
      }
    });
  }

  // Test approximate intersection sample
  const approxSample = tccSpots.find(s => s.sensorDetail?.isApproximate);
  if (approxSample) {
    console.log('\n★ Approximate / Intersection Risk Sample:');
    console.log({
      id: approxSample.id,
      district: approxSample.district,
      roadName: approxSample.roadName,
      riskNote: approxSample.sensorDetail?.riskNote,
    });
  }
}

testFinalAdapters();
