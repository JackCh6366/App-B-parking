import taipeiHandler from '../api/parking/taipei.js';

async function testHandler() {
  const req = { method: 'GET' };
  const createRes = () => {
    return {
      statusCode: 200,
      headers: {} as Record<string, string>,
      status(code: number) { this.statusCode = code; return this; },
      setHeader(k: string, v: string) { this.headers[k] = v; },
      json(data: any) {
        console.log('Response Status:', this.statusCode);
        console.log('Headers:', this.headers);
        console.log('Received items:', Array.isArray(data) ? data.length : data);
      }
    };
  };

  console.log('--- Call 1 (Expected MISS) ---');
  await taipeiHandler(req, createRes());

  console.log('--- Call 2 (Expected HIT) ---');
  await taipeiHandler(req, createRes());
}

testHandler();
