import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Project, ProjectActivity, NHRCUnit, ProgramCode } from '../types/project';
import { fromThaiNumerals } from '../utils/thaiNumber';

// Configure pdfjs worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface ExtractedPlanData {
  isMultiProject: boolean;
  planTitle: string;
  fiscalYear: number;
  totalBudget: number;
  projects: Partial<Project>[];
  rawText?: string;
}

const NHRC_UNITS: NHRCUnit[] = [
  'สนย.', 'สบก.', 'สสค.', 'สรส.', 'สคส.1', 'สคส.2', 
  'สฝป.', 'สรป.', 'สกม.', 'สดส.', 'สบค.', 
  'สนง.ภาคใต้', 'สนง.ภาคอีสาน', 'สนง.ภาคเหนือ', 'งบบริหาร กสม.'
];

export const STRATEGIC_PILLARS: Record<number, string> = {
  1: 'สร้างพลังความร่วมมือส่งเสริมวัฒนธรรมสิทธิมนุษยชน',
  2: 'ยกระดับความสามารถการเฝ้าระวังสถานการณ์ด้านสิทธิมนุษยชน',
  3: 'เพิ่มประสิทธิภาพการคุ้มครองและการเสนอแนะมาตรการด้านสิทธิมนุษยชน',
  4: 'พัฒนาสำนักงาน กสม. ให้เป็นองค์กรสมรรถนะสูง'
};

/**
 * Fixes broken Thai vowel spacing common in PDF extractions
 * e.g. "ท า" -> "ทำ", "ส านักงาน" -> "สำนักงาน", "ประจ าปี" -> "ประจำปี"
 */
export function fixThaiSpacedVowels(text: string): string {
  return text
    .replace(/([\u0E01-\u0E2E])\s+([ะาำเแโใไ])/g, '$1$2')
    .replace(/([เแโใไ])\s+([\u0E01-\u0E2E])/g, '$1$2')
    .replace(/ท\s+า/g, 'ทำ')
    .replace(/ส\s+า/g, 'สา')
    .replace(/จ\s+า/g, 'จำ')
    .replace(/ด\s+า/g, 'ดำ')
    .replace(/ค\s+า/g, 'คำ')
    .replace(/น\s+า/g, 'นำ')
    .replace(/ป\s+า/g, 'ปำ')
    .replace(/ร\s+า/g, 'รำ')
    .replace(/ล\s+า/g, 'ลำ')
    .replace(/จัดท\s*า/g, 'จัดทำ')
    .replace(/ส\s*านักงาน/g, 'สำนักงาน')
    .replace(/ประจ\s*าปี/g, 'ประจำปี')
    .replace(/ด\s*าเนินงาน/g, 'ดำเนินงาน')
    .replace(/จ\s*านวน/g, 'จำนวน')
    .replace(/ส\s*าหรับ/g, 'สำหรับ')
    .replace(/ค\s*าสั่ง/g, 'คำสั่ง');
}

/**
 * Normalizes Thai number strings with spaces or commas into a float number
 * e.g. "84 , 466 , 020" -> 84466020
 */
function parseSpacedNumber(str: string): number {
  if (!str) return 0;
  const cleaned = fromThaiNumerals(str)
    .replace(/[^\d.]/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

/**
 * Clean and normalize Thai text with inconsistent spacing
 */
function cleanThaiText(text: string): string {
  const cleaned = text
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/(\d)\s*,\s*(\d)/g, '$1,$2') // fix "84 , 466" -> "84,466"
    .replace(/(\d)\s+(\d)/g, '$1$2') // fix separated digits
    .replace(/\s+/g, ' ')
    .trim();
  return fixThaiSpacedVowels(cleaned);
}

/**
 * Extracts all lines of text from a PDF file with coordinate-based line grouping
 */
export async function extractLinesFromPdf(file: File): Promise<{ page: number; lines: string[] }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const doc = await loadingTask.promise;
  const result: { page: number; lines: string[] }[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    let lastY: number | null = null;
    let curLine = '';
    const pageLines: string[] = [];

    for (const item of content.items) {
      if ('str' in item) {
        const itemY = item.transform[5];
        if (lastY !== null && Math.abs(itemY - lastY) > 4) {
          if (curLine.trim()) {
            pageLines.push(curLine.trim());
          }
          curLine = item.str;
        } else {
          curLine += (curLine ? ' ' : '') + item.str;
        }
        lastY = itemY;
      }
    }
    if (curLine.trim()) {
      pageLines.push(curLine.trim());
    }
    result.push({ page: p, lines: pageLines });
  }

  return result;
}

/**
 * Parses multi-project master plan tables (e.g. Table 6 / Chapter 3 of NHRC Annual Operational Plan)
 */
export async function parsePdfOperationalPlan(
  file: File, 
  targetFiscalYear: number = 2569
): Promise<ExtractedPlanData> {
  const pageData = await extractLinesFromPdf(file);
  const allLines: { page: number; line: string }[] = [];
  
  for (const p of pageData) {
    for (const l of p.lines) {
      allLines.push({ page: p.page, line: cleanThaiText(l) });
    }
  }

  // Detect fiscal year from first 10 pages if available
  let detectedFiscalYear = targetFiscalYear;
  for (let i = 0; i < Math.min(150, allLines.length); i++) {
    const l = allLines[i].line;
    const mYear = l.match(/25\d{2}/);
    if (mYear && (l.includes('แผนปฏิบัติการ') || l.includes('งบประมาณ'))) {
      detectedFiscalYear = parseInt(mYear[0], 10);
      break;
    }
  }

  // Check if Table 6 or Chapter 3.1 project list exists
  const isMasterPlan = allLines.some(al => 
    al.line.includes('ตารางที่ 6') || 
    al.line.includes('โครงการเชิงยุทธศาสตร์ตามแผนปฏิบัติการ') ||
    (al.line.includes('โครงการ') && al.line.includes('ยุทธศาสตร์ที่'))
  );

  if (!isMasterPlan) {
    // Attempt single-project PDF extraction from text lines
    let singleProjectName = '';
    let singleDivision: NHRCUnit = 'สนย.';
    let singleSubDivision = 'กลุ่มงานนโยบายและยุทธศาสตร์';
    let singleBudget = 0;
    const activities: ProjectActivity[] = [];
    const timestamp = Date.now();

    for (const al of allLines) {
      const l = al.line;
      if (!singleProjectName && l.includes('โครงการ') && l.length > 5 && l.length < 200) {
        singleProjectName = l.replace(/^.*?(โครงการ)/, '$1').trim();
      }
      if (l.includes('สำนัก') || l.includes('ส่วนราชการ')) {
        if (l.includes('สบก')) singleDivision = 'สบก.';
        else if (l.includes('สบค')) singleDivision = 'สบค.';
        else if (l.includes('สสค')) singleDivision = 'สสค.';
        else if (l.includes('สรส')) singleDivision = 'สรส.';
        else if (l.includes('สคส.1')) singleDivision = 'สคส.1';
        else if (l.includes('สคส.2')) singleDivision = 'สคส.2';
        else if (l.includes('สฝป')) singleDivision = 'สฝป.';
        else if (l.includes('สรป')) singleDivision = 'สรป.';
        else if (l.includes('สกม')) singleDivision = 'สกม.';
        else if (l.includes('สดส')) singleDivision = 'สดส.';
      }
      if (singleBudget === 0 && (l.includes('งบประมาณ') || l.includes('บาท')) && /\d+/.test(l)) {
        const val = parseSpacedNumber(l);
        if (val > 1000) singleBudget = val;
      }
      if (l.includes('กิจกรรม') && l.length > 5 && l.length < 150) {
        activities.push({
          id: `act_pdf_${timestamp}_${activities.length + 1}`,
          code: `${activities.length + 1}`,
          name: l.trim(),
          plannedPercent: 100,
          timeframe: `ต.ค. ${detectedFiscalYear - 1} - ก.ย. ${detectedFiscalYear}`,
          plannedBudget: 0,
          actualSpent: 0,
          status: 'not_started'
        });
      }
    }

    if (!singleProjectName) {
      singleProjectName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
    }

    const singleProj: Partial<Project> = {
      id: `proj_pdf_${timestamp}`,
      code: `${String(detectedFiscalYear).substring(2)}O1-${Math.floor(10000 + Math.random() * 90000)}`,
      name: singleProjectName,
      fiscalYear: detectedFiscalYear,
      programCode: 'O',
      division: singleDivision,
      subDivision: singleSubDivision,
      budgetAllocated: singleBudget || 250000,
      budgetSpent: 0,
      progressPercent: 0,
      status: 'NOT_STARTED',
      isStrategic: true,
      strategicPillar: 1,
      responsiblePerson: {
        name: 'เจ้าหน้าที่ผู้รับผิดชอบ',
        position: 'นักวิชาการสิทธิมนุษยชน',
        division: singleDivision,
        subDivision: singleSubDivision,
        phone: '02 141 3800',
        email: 'contact@nhrc.or.th'
      },
      timeframeText: `ตุลาคม ${detectedFiscalYear - 1} ถึงกันยายน ${detectedFiscalYear}`,
      objectives: ['เพื่อดำเนินงานตามแผนปฏิบัติการประจำปี'],
      expectedOutputs: ['ผลผลิตตามที่กำหนดในเอกสารโครงการ'],
      expectedOutcomes: ['ผลลัพธ์ตามเป้าหมายยุทธศาสตร์'],
      indicators: [],
      activities: activities.length > 0 ? activities : [
        {
          id: `act_pdf_${timestamp}_1`,
          code: '1',
          name: `กิจกรรมหลักของ ${singleProjectName}`,
          plannedPercent: 100,
          timeframe: `ต.ค. ${detectedFiscalYear - 1} - ก.ย. ${detectedFiscalYear}`,
          plannedBudget: singleBudget || 250000,
          actualSpent: 0,
          status: 'not_started'
        }
      ],
      isBaselineLocked: true,
      unlockedForEdit: false
    };

    return {
      isMultiProject: false,
      planTitle: singleProjectName,
      fiscalYear: detectedFiscalYear,
      totalBudget: singleBudget,
      projects: [singleProj]
    };
  }

  // Find Section 3.2 / Table 6 start
  let startIdx = 0;
  for (let idx = 0; idx < allLines.length; idx++) {
    const l = allLines[idx].line;
    if (l.includes('ยุทธศาสตร์ที่ 1') && allLines[idx].page >= 15) {
      startIdx = idx;
      break;
    }
  }

  // Extract projects from Table 6 / Chapter 3
  const projects: Partial<Project>[] = [];
  let currentPillar = 1;
  let currentProgramCode: ProgramCode = 'M_T';
  const timestamp = Date.now();

  let i = startIdx;
  while (i < allLines.length) {
    const { page, line } = allLines[i];

    // Stop if table 6 grand total is reached or table ended
    if (
      line.includes('รวมทั้งสิ้น (บาท)') || 
      line.includes('แผนการใช้จ่ายงบประมาณ รวมทั้งสิ้น') ||
      (line.includes('รวมทั้งสิ้น') && line.includes('84,466,020')) ||
      (page > 32 && projects.length >= 20)
    ) {
      break;
    }

    // Pillar detection (ยุทธศาสตร์ที่ 1-4)
    const mPillar = line.match(/ยุทธศาสตร์ที่\s*([1-4])/);
    if (mPillar) {
      currentPillar = parseInt(mPillar[1], 10);
      i++;
      continue;
    }

    // Program code detection: strictly on lines declaring budget programs
    if (line.includes('แผนงาน')) {
      if (/แผนงาน\s*พื้นฐาน/i.test(line)) {
        currentProgramCode = 'M_T';
      } else if (/พัฒนาบริการ|ประสิทธิภาพภาครัฐ/i.test(line)) {
        currentProgramCode = 'D2';
      } else if (/สร้างหลักประกัน/i.test(line)) {
        currentProgramCode = 'O';
      } else if (/ความมั่นคง/i.test(line)) {
        currentProgramCode = 'S1';
      } else if (/ความสัมพันธ์ระหว่างประเทศ/i.test(line)) {
        currentProgramCode = 'A';
      }
      i++;
      continue;
    }

    // Skip grouping rows
    if (
      line.includes('งบดำเนินงาน') || 
      line.includes('งบดาเนินงาน') || 
      line.includes('งบลงทุน') ||
      line.includes('จำนวน') ||
      line.includes('จ านวน') ||
      line.includes('รวมทั้งสิ้น')
    ) {
      i++;
      continue;
    }

    // Project header detection: e.g. "1 โครงการ..." or "11 โครงการ..."
    const mProj = line.match(/^(\d{1,2})\s+โครงการ(.+)$/);
    if (mProj) {
      const order = parseInt(mProj[1], 10);
      const initialTitle = 'โครงการ' + mProj[2].trim();
      
      const headerLines: string[] = [initialTitle];
      const activityLines: string[] = [];
      let j = i + 1;

      // Phase 1: Collect project header lines UNTIL first activity or section break
      while (j < allLines.length) {
        const nextLine = allLines[j].line;
        if (
          /^\d{1,2}\.\d+/.test(nextLine) ||
          /^\(\d+\)/.test(nextLine) ||
          nextLine.includes('แผนการใช้จ่ายงบประมาณ') ||
          /^\d{1,2}\s+โครงการ/.test(nextLine) ||
          /ยุทธศาสตร์ที่\s*[1-4]/.test(nextLine) ||
          nextLine.includes('แผนงาน') ||
          nextLine.includes('งบดำเนินงาน') ||
          nextLine.includes('งบดาเนินงาน') ||
          nextLine.includes('งบลงทุน') ||
          nextLine.includes('รวมทั้งสิ้น') ||
          (allLines[j].page > 32 && projects.length >= 20)
        ) {
          break;
        }

        if (
          !nextLine.includes('แผนการด') &&
          !nextLine.includes('หน่วยงานรับผิดชอบ') &&
          !nextLine.includes('ต.ค. พ.ย.') &&
          !/^\d+\s*$/.test(nextLine)
        ) {
          headerLines.push(nextLine);
        }
        j++;
      }

      // Phase 2: Collect activities for this project UNTIL next project or section break
      while (j < allLines.length) {
        const nextLine = allLines[j].line;
        if (
          /^\d{1,2}\s+โครงการ/.test(nextLine) ||
          /ยุทธศาสตร์ที่\s*[1-4]/.test(nextLine) ||
          nextLine.includes('แผนงาน') ||
          nextLine.includes('งบดำเนินงาน') ||
          nextLine.includes('งบดาเนินงาน') ||
          nextLine.includes('งบลงทุน') ||
          nextLine.includes('รวมทั้งสิ้น') ||
          (allLines[j].page > 32 && projects.length >= 20)
        ) {
          break;
        }

        if (
          /^\d{1,2}\.\d+/.test(nextLine) || 
          /^\(\d+\)/.test(nextLine) ||
          nextLine.includes('แผนการใช้จ่ายงบประมาณ')
        ) {
          activityLines.push(nextLine);
        }
        j++;
      }

      const fullHeaderBlock = headerLines.join(' ');

      // Extract division
      let division: NHRCUnit = 'สนย.';
      if (fullHeaderBlock.includes('บูรณาการ')) {
        division = 'สนย.'; // map to primary or สนย.
      } else if (fullHeaderBlock.includes('ภาคใต้') || fullHeaderBlock.includes('ภาค ใต้')) {
        division = 'สนง.ภาคใต้';
      } else if (fullHeaderBlock.includes('ภาคอีสาน')) {
        division = 'สนง.ภาคอีสาน';
      } else if (fullHeaderBlock.includes('ภาคเหนือ')) {
        division = 'สนง.ภาคเหนือ';
      } else {
        for (const u of NHRC_UNITS) {
          const uClean = u.replace(/\s+/g, '');
          if (fullHeaderBlock.replace(/\s+/g, '').includes(uClean)) {
            division = u;
            break;
          }
        }
      }

      // Extract budget from header block: take the last valid number
      let budget = 0;
      const budgetMatches = fullHeaderBlock.match(/[\d,]{4,}(?:\.\d+)?/g);
      if (budgetMatches) {
        const candidates: number[] = [];
        for (const bm of budgetMatches) {
          const bVal = parseSpacedNumber(bm);
          if (bVal >= 2560 && bVal <= 2575) continue; // skip years
          if (bVal >= 50000 && bVal <= 50000000) {
            candidates.push(bVal);
          }
        }
        if (candidates.length > 0) {
          budget = candidates[candidates.length - 1];
        }
      }

      // Clean project title carefully (preserve region names in title, remove trailing agency acronyms)
      let cleanTitle = fullHeaderBlock;
      for (const u of NHRC_UNITS) {
        cleanTitle = cleanTitle.replace(new RegExp(u.replace('.', '\\.'), 'g'), '');
      }
      cleanTitle = cleanTitle
        .replace(/บูรณาการ/g, '')
        .replace(/\bสนง\.\b/g, '')
        .replace(/ส\s*น\s*ย\s*\./g, '')
        .replace(/ส\s*ด\s*ส\s*\./g, '')
        .replace(/ส\s*บ\s*ก\s*\./g, '')
        .replace(/ส\s*ส\s*ค\s*\./g, '')
        .replace(/ส\s*ฝ\s*ป\s*\./g, '')
        .replace(/ส\s*ร\s*ส\s*\./g, '')
        .replace(/ส\s*ก\s*ม\s*\./g, '');

      if (budgetMatches) {
        for (const bm of budgetMatches) {
          const bVal = parseSpacedNumber(bm);
          if (bVal !== 2569 && bVal !== 2568) {
            cleanTitle = cleanTitle.replace(bm, '');
          }
        }
      }
      cleanTitle = fixThaiSpacedVowels(cleanTitle)
        .replace(/สิ้นสุด.+$/g, '')
        .replace(/\(บาท\)/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Parse sub-activities
      const activities: ProjectActivity[] = [];
      let actIdx = 1;

      for (let a = 0; a < activityLines.length; a++) {
        const aLine = activityLines[a];
        const mAct = aLine.match(/^(\d{1,2}\.\d+|\(\d+\))\s+(.+)$/);
        if (mAct) {
          const actCode = mAct[1];
          const actRest = mAct[2];
          
          let actBudget = 0;
          const actBudgetMatches = actRest.match(/[\d,]{4,}(?:\.\d+)?/g);
          if (actBudgetMatches) {
            for (const abm of actBudgetMatches) {
              const abVal = parseSpacedNumber(abm);
              if (abVal >= 2560 && abVal <= 2575) continue;
              actBudget = abVal;
            }
          }

          let actName = actRest;
          if (actBudgetMatches) {
            for (const bm of actBudgetMatches) {
              actName = actName.replace(bm, '');
            }
          }
          actName = fixThaiSpacedVowels(actName.replace(/\s+/g, ' ').trim());

          activities.push({
            id: `act_pdf_${timestamp}_${projects.length + 1}_${actIdx}`,
            code: actCode,
            name: actName || `กิจกรรมที่ ${actCode}`,
            plannedBudget: actBudget,
            timeframe: `ต.ค. ${detectedFiscalYear - 1} - ก.ย. ${detectedFiscalYear}`,
            plannedPercent: 100,
            actualSpent: 0,
            status: 'not_started'
          });
          actIdx++;
        }
      }

      // If no sub-activities extracted, create default activity
      if (activities.length === 0) {
        activities.push({
          id: `act_pdf_${timestamp}_${projects.length + 1}_1`,
          code: '1',
          name: `ดำเนินงานตาม ${cleanTitle}`,
          plannedBudget: budget,
          timeframe: `ต.ค. ${detectedFiscalYear - 1} - ก.ย. ${detectedFiscalYear}`,
          plannedPercent: 100,
          actualSpent: 0,
          status: 'not_started'
        });
      }

      // Calculate weight percentage across activities
      const totalActBudget = activities.reduce((sum, act) => sum + act.plannedBudget, 0);
      if (totalActBudget > 0) {
        activities.forEach(act => {
          act.plannedPercent = Math.round((act.plannedBudget / totalActBudget) * 100);
        });
      }

      const year2Digits = String(detectedFiscalYear).slice(-2);
      const projectIndex = projects.length + 1;
      const codePrefix = `${year2Digits}${currentProgramCode}-`;
      const projectCode = `${codePrefix}${String(projectIndex).padStart(4, '0')}`;

      projects.push({
        id: `proj_pdf_${timestamp}_${projectIndex}`,
        code: projectCode,
        name: cleanTitle,
        fiscalYear: detectedFiscalYear,
        division: division,
        subDivision: 'กลุ่มงานที่ได้รับมอบหมาย',
        budgetAllocated: budget,
        programCode: currentProgramCode,
        isStrategic: true,
        strategicPillar: currentPillar,
        isBaselineLocked: true,
        unlockedForEdit: false,
        timeframeText: `ตุลาคม ${detectedFiscalYear - 1} ถึงกันยายน ${detectedFiscalYear}`,
        responsiblePerson: {
          name: `ผู้รับผิดชอบงานยุทธศาสตร์ (${division})`,
          position: 'นักวิชาการสิทธิมนุษยชนชำนาญการพิเศษ',
          division: division,
          subDivision: 'กลุ่มงานที่ได้รับมอบหมาย',
          phone: '02 141 3800',
          email: 'contact@nhrc.or.th'
        },
        objectives: [
          `เพื่อขับเคลื่อนยุทธศาสตร์ที่ ${currentPillar} (${STRATEGIC_PILLARS[currentPillar]}) ตามแผนปฏิบัติการสำนักงาน กสม.`
        ],
        expectedOutputs: [
          `ผลผลิตตามเป้าหมายของ ${cleanTitle}`
        ],
        expectedOutcomes: [
          'ส่งเสริมและคุ้มครองสิทธิมนุษยชนตามมาตรฐานสากล'
        ],
        indicators: [
          {
            id: `ind_pdf_${timestamp}_${projectIndex}_1`,
            title: 'ร้อยละความสำเร็จตามแผนปฏิบัติการของโครงการ',
            target: '100%',
            actual: '0%',
            status: 'on_track'
          }
        ],
        activities: activities
      });

      i = j;
      continue;
    }

    i++;
  }

  const totalBudget = projects.reduce((s, p) => s + (p.budgetAllocated || 0), 0);

  return {
    isMultiProject: projects.length > 1,
    planTitle: `แผนปฏิบัติการประจำปีงบประมาณ พ.ศ. ${detectedFiscalYear}`,
    fiscalYear: detectedFiscalYear,
    totalBudget: totalBudget,
    projects: projects
  };
}
