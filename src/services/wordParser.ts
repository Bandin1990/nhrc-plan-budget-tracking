import mammoth from 'mammoth';
import { Project, ProjectActivity, NHRCUnit } from '../types/project';
import { fromThaiNumerals } from '../utils/thaiNumber';

export interface ParsedProjectResult {
  project?: Partial<Project>;
  projects?: Partial<Project>[];
  isMultiProject?: boolean;
  planTitle?: string;
  totalBudget?: number;
  extractedActivities: ProjectActivity[];
  rawText: string;
  sourceType: 'html_doc' | 'xml_docx' | 'pdf_ai' | 'pdf_plan' | 'unknown';
}

/**
 * Parses Word (.doc HTML or .docx binary XML) files commonly used by NHRC / Thai Gov
 */
export async function parseProjectWordFile(
  file: File, 
  targetFiscalYear: number = 2570
): Promise<ParsedProjectResult> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      const textResult = await mammoth.extractRawText({ arrayBuffer });
      return parseHtmlDoc(htmlResult.value, textResult.value, targetFiscalYear, 'xml_docx');
    } catch (err: any) {
      console.warn('Mammoth docx parsing failed, falling back to text:', err);
      const text = await file.text().catch(() => '');
      return parsePlainTextDoc(text, targetFiscalYear);
    }
  } else if (fileName.endsWith('.doc')) {
    // Check if it's an HTML-based .doc file exported from web systems
    const text = await file.text();
    if (text.includes('<html') || text.includes('xmlns:w="urn:schemas-microsoft-com:office:word"')) {
      return parseHtmlDoc(text, '', targetFiscalYear, 'html_doc');
    }
    // If binary .doc, attempt arrayBuffer with mammoth as fallback
    try {
      const arrayBuffer = await file.arrayBuffer();
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      const textResult = await mammoth.extractRawText({ arrayBuffer });
      if (htmlResult.value && htmlResult.value.length > 50) {
        return parseHtmlDoc(htmlResult.value, textResult.value, targetFiscalYear, 'xml_docx');
      }
    } catch (e) {}
    return parsePlainTextDoc(text, targetFiscalYear);
  } else {
    // Other text-based formats
    const text = await file.text().catch(() => '');
    return parseHtmlDoc(text, text, targetFiscalYear, 'unknown');
  }
}

function parseHtmlDoc(
  htmlContent: string, 
  rawTextContent: string = '', 
  targetFiscalYear: number = 2570,
  sourceType: 'html_doc' | 'xml_docx' | 'unknown' = 'html_doc'
): ParsedProjectResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const fullText = rawTextContent || doc.body.textContent || '';

  // Helper to find text after a label
  const findTextAfter = (labels: string[]): string => {
    const allElements = doc.querySelectorAll('p, b, td, th, div, span, h1, h2, h3, h4, li');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      const text = el.textContent?.trim() || '';
      for (const label of labels) {
        if (text.includes(label)) {
          // Try getting text directly from element if it's "Label: Value" or "Label Value"
          const parts = text.split(label);
          if (parts.length > 1 && parts[1].trim()) {
            const candidate = parts[1].replace(/^[:\s*–—-]+/, '').trim();
            if (candidate) return candidate;
          }
          // Next sibling element
          if (el.nextElementSibling) {
            const nextText = el.nextElementSibling.textContent?.trim() || '';
            if (nextText) return nextText;
          }
          // Table cell next to this cell (e.g. <td>Label</td><td>Value</td>)
          if (el.tagName === 'TD' || el.tagName === 'TH') {
            const nextCell = (el as HTMLTableCellElement).nextElementSibling;
            if (nextCell && nextCell.textContent?.trim()) {
              return nextCell.textContent.trim();
            }
          }
          // Parent's next sibling
          if (el.parentElement && el.parentElement.nextElementSibling) {
            const parentNextText = el.parentElement.nextElementSibling.textContent?.trim() || '';
            if (parentNextText) return parentNextText;
          }
        }
      }
    }
    return '';
  };

  // 1. Project Name
  let projectName = findTextAfter(['1.1 ชื่อโครงการ', 'ชื่อโครงการ', 'โครงการ']);
  if (!projectName) {
    const headings = doc.querySelectorAll('h1, h2, h3, strong, b');
    for (let h = 0; h < headings.length; h++) {
      const txt = headings[h].textContent?.trim() || '';
      if (txt.includes('โครงการ') && txt.length > 10 && txt.length < 200) {
        projectName = txt.replace(/^.*?(โครงการ)/, '$1').trim();
        break;
      }
    }
  }
  if (!projectName) {
    projectName = 'โครงการนำเข้าจากเอกสารแผนปฏิบัติการ';
  }

  // 2. Division / Unit
  let divisionName = findTextAfter(['สำนัก/หน่วยงาน', 'สำนัก / หน่วยงาน', 'สังกัด', 'หน่วยงาน']);
  if (!divisionName) {
    divisionName = fullText;
  }
  let division: NHRCUnit = 'สนย.';
  if (divisionName.includes('บริหารกลาง') || divisionName.includes('สบก')) division = 'สบก.';
  else if (divisionName.includes('บุคคล') || divisionName.includes('สบค')) division = 'สบค.';
  else if (divisionName.includes('ส่งเสริม') || divisionName.includes('สสค')) division = 'สสค.';
  else if (divisionName.includes('รับเรื่อง') || divisionName.includes('สรส')) division = 'สรส.';
  else if (divisionName.includes('คุ้มครอง 1') || divisionName.includes('คุ้มครองสิทธิ 1') || divisionName.includes('สคส.1')) division = 'สคส.1';
  else if (divisionName.includes('คุ้มครอง 2') || divisionName.includes('คุ้มครองสิทธิ 2') || divisionName.includes('สคส.2')) division = 'สคส.2';
  else if (divisionName.includes('เฝ้าระวัง') || divisionName.includes('สฝป')) division = 'สฝป.';
  else if (divisionName.includes('ระหว่างประเทศ') || divisionName.includes('สรป')) division = 'สรป.';
  else if (divisionName.includes('กฎหมาย') || divisionName.includes('สกม')) division = 'สกม.';
  else if (divisionName.includes('ดิจิทัล') || divisionName.includes('สดส') || divisionName.includes('สารสนเทศ')) division = 'สดส.';
  else if (divisionName.includes('ใต้') || divisionName.includes('ภาคใต้')) division = 'สนง.ภาคใต้';
  else if (divisionName.includes('อีสาน') || divisionName.includes('ตะวันออกเฉียงเหนือ')) division = 'สนง.ภาคอีสาน';
  else if (divisionName.includes('เหนือ') || divisionName.includes('ภาคเหนือ')) division = 'สนง.ภาคเหนือ';
  else if (divisionName.includes('นโยบาย') || divisionName.includes('สนย')) division = 'สนย.';

  // 3. SubDivision
  const subDivision = findTextAfter(['กลุ่มงาน', 'กลุ่มวิจัย', 'กลุ่มงานย่อย']) || 'กลุ่มงานทั่วไป';

  // 4. Responsible person
  const respName = findTextAfter(['ชื่อ-นามสกุล', 'ชื่อ - นามสกุล', 'ผู้รับผิดชอบโครงการ', 'ผู้เสนอโครงการ']) || 'เจ้าหน้าที่ผู้รับผิดชอบ';
  const respPos = findTextAfter(['ตำแหน่ง']) || 'นักวิชาการสิทธิมนุษยชน';
  const rawPhone = findTextAfter(['เบอร์โทรศัพท์', 'เบอร์โทร', 'โทรศัพท์', 'โทร.']) || '02 141 3800';
  const respPhone = fromThaiNumerals(rawPhone);
  const respEmail = findTextAfter(['e-Mail', 'e-mail', 'อีเมล', 'Email', 'E-mail']) || 'contact@nhrc.or.th';

  // 5. Total budget
  let totalBudget = 0;
  const budgetText = findTextAfter([
    '4.1 งบประมาณที่ขอรับจัดสรร', 
    'งบประมาณที่ขอรับจัดสรร', 
    'วงเงินงบประมาณ', 
    'งบประมาณทั้งสิ้น',
    'รวมงบประมาณ'
  ]);
  const numMatches = budgetText.replace(/,/g, '').match(/\d+(\.\d+)?/);
  if (numMatches) {
    totalBudget = parseFloat(numMatches[0]);
  }

  // 6. Timeframe
  const timeframe = findTextAfter(['3.8 ระยะเวลาการดำเนินโครงการ', 'ระยะเวลาดำเนินโครงการ', 'ระยะเวลาการดำเนินงาน']) 
    || `ตุลาคม ${targetFiscalYear - 1} ถึงกันยายน ${targetFiscalYear}`;

  // 7. Objectives
  const objText = findTextAfter(['3.2 วัตถุประสงค์', 'วัตถุประสงค์ของโครงการ', 'วัตถุประสงค์']);
  const objectives: string[] = objText
    ? objText.split(/\n|\r|\d+\)|\d+\./).map(s => s.trim()).filter(s => s.length > 5)
    : ['เพื่อขับเคลื่อนภารกิจตามแผนปฏิบัติการประจำปีของ กสม.'];

  // 8. Parse Activities from Tables
  const extractedActivities: ProjectActivity[] = [];
  const tables = doc.querySelectorAll('table');
  const timestamp = Date.now();
  
  tables.forEach((table) => {
    const rows = table.querySelectorAll('tr');
    if (rows.length <= 1) return;

    // Check if table contains activity rows
    let actNameCol = -1;
    let budgetCol = -1;
    let percentCol = -1;
    let timeCol = -1;

    const headerCells = rows[0]?.querySelectorAll('td, th') || [];
    for (let c = 0; c < headerCells.length; c++) {
      const hTxt = headerCells[c].textContent?.trim() || '';
      if (hTxt.includes('กิจกรรม') || hTxt.includes('รายการ') || hTxt.includes('ขั้นตอน')) actNameCol = c;
      if (hTxt.includes('งบประมาณ') || hTxt.includes('จำนวนเงิน') || hTxt.includes('บาท')) budgetCol = c;
      if (hTxt.includes('ร้อยละ') || hTxt.includes('%') || hTxt.includes('น้ำหนัก')) percentCol = c;
      if (hTxt.includes('ช่วงเวลา') || hTxt.includes('ระยะเวลา') || hTxt.includes('ไตรมาส') || hTxt.includes('เดือน')) timeCol = c;
    }

    // Default column fallback if not named precisely
    if (actNameCol === -1 && headerCells.length >= 2) actNameCol = 0;
    if (budgetCol === -1 && headerCells.length >= 3) budgetCol = headerCells.length - 1;

    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r].querySelectorAll('td, th');
      if (cells.length >= 2 && actNameCol !== -1 && cells[actNameCol]) {
        const actName = cells[actNameCol].textContent?.trim() || '';
        // Exclude summary rows
        if (actName && !actName.includes('รวม') && !actName.includes('ทั้งสิ้น') && actName.length > 3) {
          let costVal = 0;
          if (budgetCol !== -1 && cells[budgetCol]) {
            const rawCost = cells[budgetCol].textContent?.replace(/,/g, '').trim() || '';
            const match = rawCost.match(/\d+(\.\d+)?/);
            if (match) costVal = parseFloat(match[0]);
          }

          let percentVal = 0;
          if (percentCol !== -1 && cells[percentCol]) {
            const rawP = cells[percentCol].textContent?.replace(/%/g, '').trim() || '';
            const match = rawP.match(/\d+(\.\d+)?/);
            if (match) percentVal = parseFloat(match[0]);
          }

          let timeText = `ต.ค. ${targetFiscalYear - 1} - ก.ย. ${targetFiscalYear}`;
          if (timeCol !== -1 && cells[timeCol]) {
            timeText = cells[timeCol].textContent?.trim() || timeText;
          }

          extractedActivities.push({
            id: `act_import_${timestamp}_${r}`,
            code: `${extractedActivities.length + 1}`,
            name: actName,
            plannedPercent: percentVal || (extractedActivities.length === 0 ? 100 : 0),
            timeframe: timeText,
            plannedBudget: costVal,
            actualSpent: 0,
            status: 'not_started',
          });
        }
      }
    }
  });

  // If no activities parsed from table, generate default activity
  if (extractedActivities.length === 0) {
    extractedActivities.push({
      id: `act_import_${timestamp}_1`,
      code: '1',
      name: `กิจกรรมหลักของ ${projectName}`,
      plannedPercent: 100,
      timeframe: `ต.ค. ${targetFiscalYear - 1} - ก.ย. ${targetFiscalYear}`,
      plannedBudget: totalBudget || 200000,
      actualSpent: 0,
      status: 'not_started',
    });
  }

  // Recalculate total budget if activities have budget and total was 0
  const sumActBudget = extractedActivities.reduce((sum, a) => sum + a.plannedBudget, 0);
  if (sumActBudget > 0 && totalBudget === 0) {
    totalBudget = sumActBudget;
  }

  const project: Partial<Project> = {
    id: `proj_imported_${timestamp}`,
    code: `${String(targetFiscalYear).substring(2)}O1-${Math.floor(10000 + Math.random() * 90000)}`,
    name: projectName,
    fiscalYear: targetFiscalYear,
    programCode: 'O',
    division,
    subDivision,
    responsiblePerson: {
      name: respName,
      position: respPos,
      division,
      subDivision,
      phone: respPhone,
      email: respEmail,
    },
    isStrategic: true,
    strategicPillar: 1,
    budgetAllocated: totalBudget || sumActBudget || 250000,
    budgetSpent: 0,
    progressPercent: 0,
    status: 'NOT_STARTED',
    startDate: `${targetFiscalYear - 543 - 1}-10-01`,
    endDate: `${targetFiscalYear - 543}-09-30`,
    timeframeText: timeframe,
    objectives,
    expectedOutputs: ['ผลผลิตตามรายละเอียดโครงการในเอกสารข้อเสนอโครงการ'],
    expectedOutcomes: ['ผลลัพธ์เพื่อประโยชน์ด้านการคุ้มครองและส่งเสริมสิทธิมนุษยชน'],
    indicators: [
      {
        id: `ind_imp_${timestamp}_1`,
        title: 'ร้อยละความสำเร็จตามแผนปฏิบัติการ',
        target: '100%',
        actual: '0%',
        status: 'on_track',
      }
    ],
    activities: extractedActivities,
    isBaselineLocked: true, // Baseline for operational plan
    unlockedForEdit: false
  };

  return {
    project,
    extractedActivities,
    rawText: fullText,
    sourceType,
  };
}

function parsePlainTextDoc(text: string, targetFiscalYear: number = 2570): ParsedProjectResult {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const projectName = lines.find(l => l.includes('โครงการ')) || 'โครงการที่นำเข้าจากเอกสาร';
  const timestamp = Date.now();
  
  return {
    project: {
      id: `proj_imported_${timestamp}`,
      code: `${String(targetFiscalYear).substring(2)}O1-${Math.floor(10000 + Math.random() * 90000)}`,
      name: projectName.substring(0, 120),
      fiscalYear: targetFiscalYear,
      programCode: 'O',
      division: 'สนย.',
      subDivision: 'กลุ่มงานนโยบายและยุทธศาสตร์',
      responsiblePerson: {
        name: 'เจ้าหน้าที่ผู้รับผิดชอบ',
        position: 'นักวิชาการสิทธิมนุษยชน',
        division: 'สนย.',
        phone: '02 141 3800',
        email: 'contact@nhrc.or.th',
      },
      isStrategic: true,
      strategicPillar: 1,
      budgetAllocated: 250000,
      budgetSpent: 0,
      progressPercent: 0,
      status: 'NOT_STARTED',
      startDate: `${targetFiscalYear - 543 - 1}-10-01`,
      endDate: `${targetFiscalYear - 543}-09-30`,
      timeframeText: `ตุลาคม ${targetFiscalYear - 1} ถึงกันยายน ${targetFiscalYear}`,
      objectives: ['เพื่อดำเนินงานตามแผนปฏิบัติการประจำปี'],
      expectedOutputs: ['ผลผลิตตามที่กำหนดในเอกสาร'],
      expectedOutcomes: ['ผลลัพธ์ตามเป้าหมายยุทธศาสตร์'],
      indicators: [],
      activities: [
        {
          id: `act_${timestamp}_1`,
          code: '1',
          name: 'ดำเนินกิจกรรมตามโครงการ',
          plannedPercent: 100,
          timeframe: `ต.ค. ${targetFiscalYear - 1} - ก.ย. ${targetFiscalYear}`,
          plannedBudget: 250000,
          actualSpent: 0,
          status: 'not_started',
        }
      ],
      isBaselineLocked: true,
      unlockedForEdit: false
    },
    extractedActivities: [],
    rawText: text,
    sourceType: 'unknown',
  };
}
