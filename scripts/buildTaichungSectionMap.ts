import fs from 'fs';
import path from 'path';

// Read full audit results
const auditPath = path.join(process.cwd(), 'scratch/taichung_sections_audit_full.json');
const auditData: any[] = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));

// District mapping lookup
import { TAICHUNG_SECTION_DISTRICT_MAP } from '../src/config/taichungDistrictsMap';

const mapOutput: Record<string, { roadName: string; district: string; isApproximate?: boolean; riskNote?: string }> = {};

for (const item of auditData) {
  const secId = String(item.sectionId);
  const district = TAICHUNG_SECTION_DISTRICT_MAP[secId] || '其他區';

  if (item.status === 'SUCCESS') {
    mapOutput[secId] = {
      roadName: item.roadName,
      district,
    };
  } else if (item.status === 'SUSPICIOUS_INTERSECTION') {
    mapOutput[secId] = {
      roadName: item.roadName,
      district,
      isApproximate: true,
      riskNote: item.riskNote || `路口轉角交叉疑慮: 主路名「${item.roadName}」, 次路名「${item.secondCandidateRoad || ''}」`,
    };
  } else {
    // NO_ROAD_NAME fallback
    mapOutput[secId] = {
      roadName: `路段 #${secId}`,
      district,
      isApproximate: true,
      riskNote: item.riskNote || '未提供路名',
    };
  }
}

const fileContent = `/**
 * 臺中市 Section_ID (路段代號) -> 真實路段名稱與起訖/轉角標記 靜態對照字典檔
 * 由向量地圖幾何距離反查產生，支援路口轉角標記與 fallback 保護機制。
 */

export interface TaichungSectionInfo {
  roadName: string;
  district: string;
  isApproximate?: boolean;
  riskNote?: string;
}

export const TAICHUNG_SECTION_MAP: Record<string, TaichungSectionInfo> = ${JSON.stringify(mapOutput, null, 2)};
`;

const outputPath = path.join(process.cwd(), 'src/config/taichungSectionMap.ts');
fs.writeFileSync(outputPath, fileContent, 'utf-8');
console.log(`Generated ${Object.keys(mapOutput).length} entries in src/config/taichungSectionMap.ts`);
