import { XMLParser } from 'fast-xml-parser';

async function inspectCellDetails() {
  const res = await fetch('https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_roadquery.xml');
  const xmlText = await res.text();
  const parsed = new XMLParser({ ignoreAttributes: true, trimValues: true }).parse(xmlText);
  const roads = parsed?.DATA?.ROAD || [];

  const qg = roads.find((r: any) => String(r.roadSegID) === '1294000');
  console.log('=== Raw XML item 1294000 (前港街) ===');
  console.log('roadSegID:', qg.roadSegID);
  console.log('roadSegName:', qg.roadSegName);
  console.log('roadSegTotalValue:', qg.roadSegTotalValue);
  console.log('roadSegAvail:', qg.roadSegAvail);

  const cells = qg.cellStatusList?.cell || [];
  console.log(`Total cell items inside cellStatusList: ${cells.length}`);
  console.log('First 5 cell items structure:');
  console.log(cells.slice(0, 5));

  // Count statuses
  const statusCounts: Record<string, number> = {};
  cells.forEach((c: any) => {
    const st = String(c.cellStatus);
    statusCounts[st] = (statusCounts[st] || 0) + 1;
  });
  console.log('Cell status breakdown:', statusCounts);
}

inspectCellDetails();
