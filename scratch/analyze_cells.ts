import { XMLParser } from 'fast-xml-parser';

async function analyzeCells() {
  const res = await fetch('https://tcgbusfs.blob.core.windows.net/blobtcmsv/TCMSV_roadquery.xml');
  const xmlText = await res.text();
  const parsed = new XMLParser({ ignoreAttributes: true, trimValues: true }).parse(xmlText);
  const roads = parsed?.DATA?.ROAD || [];

  let cellMatchCount = 0;
  let cellDiffCount = 0;

  roads.slice(0, 20).forEach((r: any) => {
    const rawAvail = parseInt(r.roadSegAvail, 10);
    const rawTotal = parseInt(r.roadSegTotalValue, 10);
    let cellEmpty = 0;
    let cellOccupied = 0;
    let cellTotal = 0;

    if (r.cellStatusList?.cell) {
      const cells = Array.isArray(r.cellStatusList.cell) ? r.cellStatusList.cell : [r.cellStatusList.cell];
      cellTotal = cells.length;
      cells.forEach((c: any) => {
        const statusStr = String(c.cellStatus);
        if (statusStr === '0') cellEmpty++;
        else if (statusStr === '1') cellOccupied++;
      });
    }

    console.log(`[${r.roadSegID}] ${r.roadSegName}:`);
    console.log(`  - Header: roadSegAvail=${rawAvail}, roadSegTotalValue=${rawTotal}`);
    console.log(`  - Cell List: totalCells=${cellTotal}, emptyCount=${cellEmpty}, occupiedCount=${cellOccupied}`);
  });
}

analyzeCells();
