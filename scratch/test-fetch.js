async function testParallelFetch() {
  const NTP_BASE_URL = 'https://data.ntpc.gov.tw/api/datasets/54A507C4-C038-41B5-BF60-BBECB9D052C6/json';
  const PAGE_SIZE = 2000;
  const MAX_PAGES = 20;

  console.time('Sequential Fetch');
  const seqItems = [];
  for (let page = 0; page < 5; page++) {
    const res = await fetch(`${NTP_BASE_URL}?page=${page}&size=${PAGE_SIZE}`);
    const json = await res.json();
    seqItems.push(...json);
  }
  console.timeEnd('Sequential Fetch');
  console.log('Sequential 5 pages item count:', seqItems.length);

  console.time('Parallel Fetch 20 pages');
  const pagePromises = Array.from({ length: MAX_PAGES }, (_, page) => {
    return fetch(`${NTP_BASE_URL}?page=${page}&size=${PAGE_SIZE}`, {
      headers: { 'Accept': 'application/json' }
    }).then(r => r.json()).catch(err => []);
  });

  const results = await Promise.all(pagePromises);
  const parItems = results.flat();
  console.timeEnd('Parallel Fetch 20 pages');
  console.log('Parallel 20 pages item count:', parItems.length);
}

testParallelFetch();
