import { XMLParser } from 'fast-xml-parser';

async function checkQiangangSegments() {
  const res = await fetch('https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_roadquery.xml');
  const xmlText = await res.text();
  const parsed = new XMLParser({ ignoreAttributes: true, trimValues: true }).parse(xmlText);
  const roads = parsed?.DATA?.ROAD || [];

  const matches = roads.filter((r: any) => 
    String(r.roadSegName || '').includes('前港') || 
    String(r.roadSegID || '').includes('1294')
  );

  console.log(`Matching segments count: ${matches.length}`);
  matches.forEach((m: any, idx: number) => {
    console.log(`\nSegment [${idx}]:`);
    console.log(`- ID: ${m.roadSegID}`);
    console.log(`- Name: "${m.roadSegName}"`);
    console.log(`- CarType: ${m.roadSegCarType}`);
    console.log(`- Avail: ${m.roadSegAvail}`);
    console.log(`- Total: ${m.roadSegTotalValue}`);
    console.log(`- Fee: ${m.roadSegFee}`);
    console.log(`- UpdateTime: ${m.roadSegUpdatetime}`);
    console.log(`- Cell count in cellStatusList:`, m.cellStatusList?.cell?.length || 0);
    if (m.cellStatusList?.cell) {
      const cells = Array.isArray(m.cellStatusList.cell) ? m.cellStatusList.cell : [m.cellStatusList.cell];
      console.log(`  Sample Cell [0]:`, cells[0]);
      const availCells = cells.filter((c: any) => String(c.cellStatus) === '0');
      const occupiedCells = cells.filter((c: any) => String(c.cellStatus) === '1');
      console.log(`  Cell status breakdown: empty (0) = ${availCells.length}, occupied (1) = ${occupiedCells.length}, total cells = ${cells.length}`);
    }
  });
}

checkQiangangSegments();
