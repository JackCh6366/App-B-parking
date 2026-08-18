import fetch from 'node-fetch';

interface SectionCentroid {
  sectionId: string;
  count: number;
  avgLat: number;
  avgLng: number;
}

function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    return Math.hypot((px - x1) * 111000, (py - y1) * 100000);
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  const dLat = (py - projY) * 111000;
  const dLng = (px - projX) * 101000;
  return Math.hypot(dLat, dLng);
}

async function auditWithValidation() {
  const res = await fetch('https://newdatacenter.taichung.gov.tw/api/v1/no-auth/resource.download?rid=1744bc00-cd16-48f3-9632-309f364662bb');
  const json: any = await res.json();
  const rawList: any[] = Array.isArray(json) ? json : json?.result || json?.records || [];

  const sectionsMap = new Map<string, { latSum: number; lngSum: number; count: number }>();
  let dirtyCount = 0;

  for (const item of rawList) {
    const secId = String(item.Section_ID || '');
    if (!secId) continue;
    const lat = parseFloat(item.Lat);
    const lng = parseFloat(item.Lng);

    // Filter out coordinates outside Taiwan main island bounding box
    if (isNaN(lat) || isNaN(lng) || lat < 21.8 || lat > 25.5 || lng < 119.5 || lng > 122.5) {
      dirtyCount++;
      continue;
    }

    const existing = sectionsMap.get(secId) || { latSum: 0, lngSum: 0, count: 0 };
    existing.latSum += lat;
    existing.lngSum += lng;
    existing.count += 1;
    sectionsMap.set(secId, existing);
  }

  console.log(`Filtered out ${dirtyCount} dirty raw coordinate items.`);

  const centroids: SectionCentroid[] = [];
  sectionsMap.forEach((val, secId) => {
    centroids.push({
      sectionId: secId,
      count: val.count,
      avgLat: val.latSum / val.count,
      avgLng: val.lngSum / val.count,
    });
  });

  // Query Overpass
  const overpassQuery = `
    [out:json][timeout:30];
    (
      way["name"]["highway"](24.0,120.4,24.4,120.9);
    );
    out body;
    >;
    out skel qt;
  `;

  const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: overpassQuery,
  });
  const overpassData: any = await overpassRes.json();

  const nodeMap = new Map<number, { lat: number; lon: number }>();
  for (const elem of overpassData.elements) {
    if (elem.type === 'node') {
      nodeMap.set(elem.id, { lat: elem.lat, lon: elem.lon });
    }
  }

  const roadSegments: { name: string; x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const elem of overpassData.elements) {
    if (elem.type === 'way' && elem.tags && elem.tags.name && elem.nodes) {
      const name = elem.tags.name;
      const nodes = elem.nodes;
      for (let i = 0; i < nodes.length - 1; i++) {
        const n1 = nodeMap.get(nodes[i]);
        const n2 = nodeMap.get(nodes[i + 1]);
        if (n1 && n2) {
          roadSegments.push({ name, x1: n1.lon, y1: n1.lat, x2: n2.lon, y2: n2.lat });
        }
      }
    }
  }

  const sec6434307 = centroids.find(c => c.sectionId === '6434307');
  if (sec6434307) {
    let minDist = Infinity;
    let bestName = '';
    for (const seg of roadSegments) {
      const d = pointToSegmentDistance(sec6434307.avgLng, sec6434307.avgLat, seg.x1, seg.y1, seg.x2, seg.y2);
      if (d < minDist) {
        minDist = d;
        bestName = seg.name;
      }
    }
    console.log(`Section 6434307 reverse geocoding result after coordinate fix: Name="${bestName}", Distance=${minDist.toFixed(1)}m`);
  }
}

auditWithValidation();
