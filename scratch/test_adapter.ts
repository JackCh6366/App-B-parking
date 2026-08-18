import { CITY_DATA_ADAPTERS } from '../src/services/parkingService.js';
import taipeiHandler from '../api/parking/taipei.js';

async function testAdapter() {
  let rawData: any[] = [];
  const req = { method: 'GET' };
  const res = {
    statusCode: 200,
    headers: {},
    status(code: number) { this.statusCode = code; return this; },
    setHeader(k: string, v: string) {},
    json(data: any) { rawData = data; }
  };

  await taipeiHandler(req, res);

  const adapter = CITY_DATA_ADAPTERS['taipei'];
  const spots = adapter(rawData);

  console.log('Transformed ParkingSpots count:', spots.length);
  console.log('Sample ParkingSpot 0:', spots[0]);
  console.log('Sample ParkingSpot 1:', spots[1]);

  const emptyCount = spots.filter(s => s.status === 'empty').length;
  const occupiedCount = spots.filter(s => s.status === 'occupied').length;
  const maintenanceCount = spots.filter(s => s.status === 'maintenance').length;
  console.log(`Stats -> Empty: ${emptyCount}, Occupied: ${occupiedCount}, Maintenance/Unmeasured: ${maintenanceCount}`);

  const districts = Array.from(new Set(spots.map(s => s.district))).sort();
  console.log('Districts represented:', districts);
}

testAdapter();
