const taipeiHandler = require('./api/parking/taipei').default;

async function testHandler() {
  const req = { method: 'GET' };
  const res = {
    statusCode: 200,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    setHeader(k, v) { this.headers[k] = v; },
    json(data) {
      console.log('Response Status:', this.statusCode);
      console.log('Headers:', this.headers);
      if (Array.isArray(data)) {
        console.log('Received array length:', data.length);
        console.log('Sample item 0:', data[0]);
      } else {
        console.log('Received data:', data);
      }
    }
  };

  await taipeiHandler(req, res);
}

testHandler();
