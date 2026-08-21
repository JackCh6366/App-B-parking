import taipeiHandler from '../api/parking/taipei.ts';
import taichungHandler from '../api/parking/taichung.ts';
import newtaipeiHandler from '../api/parking/newtaipei.ts';

async function test() {
  console.log('--- Testing Taipei Handler ---');
  let resData = null;
  let resStatus = null;
  let headers = {};
  const mockReq = { method: 'GET' };
  const mockRes = {
    status(code) { resStatus = code; return mockRes; },
    setHeader(k, v) { headers[k] = v; },
    json(data) { resData = data; return mockRes; }
  };

  try {
    await taipeiHandler(mockReq, mockRes);
    console.log('Taipei Status:', resStatus, 'Headers:', headers, 'Data count:', Array.isArray(resData) ? resData.length : resData);
  } catch (err) {
    console.error('Taipei Error:', err);
  }

  console.log('--- Testing Taichung Handler ---');
  resData = null; resStatus = null; headers = {};
  try {
    await taichungHandler(mockReq, mockRes);
    console.log('Taichung Status:', resStatus, 'Headers:', headers, 'Data count:', Array.isArray(resData) ? resData.length : resData);
  } catch (err) {
    console.error('Taichung Error:', err);
  }

  console.log('--- Testing NewTaipei Handler ---');
  resData = null; resStatus = null; headers = {};
  try {
    await newtaipeiHandler(mockReq, mockRes);
    console.log('NewTaipei Status:', resStatus, 'Headers:', headers, 'Data count:', Array.isArray(resData) ? resData.length : resData);
  } catch (err) {
    console.error('NewTaipei Error:', err);
  }
}

test();
