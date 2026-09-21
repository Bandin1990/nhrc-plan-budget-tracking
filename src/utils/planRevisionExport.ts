import * as XLSX from 'xlsx';
import { BUDGET_PROGRAMS, Project } from '../types/project';

type RevisionKind = 'return' | 'increase';

interface RevisionItem {
  project: Project;
  amount: number;
  reason: string;
  classification: string;
}

const REVISION_MARKER = /\[วาระทบทวนแผน[^\]]*\]/g;
const AMOUNT_PATTERN = /(?:ขอส่งคืนงบประมาณเหลือจ่าย|ขอคืนเงินงบประมาณเหลือจ่าย|ขอรับจัดสรรเงินงบประมาณเพิ่มเติม)\s+([\d,]+(?:\.\d+)?)/;

function extractAmount(notes: string): number | null {
  const match = notes.match(AMOUNT_PATTERN);
  if (!match) return null;
  const amount = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(amount) ? amount : null;
}

function getRevisionItems(projects: Project[], fiscalYear: number, kind: RevisionKind): RevisionItem[] {
  const isIncrease = (notes: string) => notes.includes('ขอรับจัดสรรเงินงบประมาณเพิ่มเติม');
  const isReturn = (notes: string) =>
    !isIncrease(notes) && (notes.includes('ขอส่งคืนงบประมาณเหลือจ่าย') || notes.includes('ขอคืนเงินงบประมาณเหลือจ่าย'));

  return projects
    .filter((project) => (project.fiscalYear || 2569) === fiscalYear)
    .flatMap((project) => {
      const notes = project.notes || '';
      const included = kind === 'increase' ? isIncrease(notes) : isReturn(notes);
      const amount = extractAmount(notes);
      if (!included || amount === null) return [];

      const reason = notes
        .replace(REVISION_MARKER, '')
        .replace(/^\s*\([^]*\)\s*$/, (value) => value.slice(1, -1))
        .trim();
      const classification = /ยกเลิก(?:งาน|กิจกรรม)/.test(notes) ? 'ยกเลิกกิจกรรม' : 'ปรับแผนการดำเนินงาน';
      return [{ project, amount, reason, classification }];
    })
    .sort((a, b) => a.project.programCode.localeCompare(b.project.programCode) || a.project.division.localeCompare(b.project.division) || a.project.name.localeCompare(b.project.name, 'th'));
}

export function getPlanRevisionReportStats(fiscalYear: number, projects: Project[]) {
  const returns = getRevisionItems(projects, fiscalYear, 'return');
  const increases = getRevisionItems(projects, fiscalYear, 'increase');
  return {
    returnCount: returns.length,
    returnAmount: returns.reduce((sum, item) => sum + item.amount, 0),
    increaseCount: increases.length,
    increaseAmount: increases.reduce((sum, item) => sum + item.amount, 0),
    cancelledCount: returns.filter((item) => item.classification === 'ยกเลิกกิจกรรม').length,
    revisedCount: returns.filter((item) => item.classification === 'ปรับแผนการดำเนินงาน').length,
  };
}

type CellStyle = Record<string, unknown>;

function addCell(ws: XLSX.WorkSheet, address: string, value: string | number, style?: CellStyle): void {
  ws[address] = { t: typeof value === 'number' ? 'n' : 's', v: value, s: style };
}

const titleStyle: CellStyle = { font: { name: 'TH Sarabun New', sz: 16, bold: true }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
const subtitleStyle: CellStyle = { font: { name: 'TH Sarabun New', sz: 14, bold: true }, alignment: { horizontal: 'left', vertical: 'center', wrapText: true } };
const headerStyle: CellStyle = { font: { name: 'TH Sarabun New', sz: 12, bold: true }, fill: { fgColor: { rgb: 'D9EAD3' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } }, left: { style: 'thin', color: { rgb: '000000' } }, right: { style: 'thin', color: { rgb: '000000' } } } };
const textStyle: CellStyle = { font: { name: 'TH Sarabun New', sz: 12 }, alignment: { vertical: 'top', wrapText: true }, border: { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } }, left: { style: 'thin', color: { rgb: '000000' } }, right: { style: 'thin', color: { rgb: '000000' } } } };
const numberStyle: CellStyle = { ...textStyle, alignment: { horizontal: 'right', vertical: 'top' }, numFmt: '#,##0.00' };

function buildRevisionSheet(items: RevisionItem[], fiscalYear: number, kind: RevisionKind): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const action = kind === 'return' ? 'ขอส่งคืนเงินงบประมาณจากการดำเนินงาน/ก่อหนี้ผูกพันแล้วเสร็จ' : 'ขอรับจัดสรรเงินงบประมาณเพิ่มเติม';
  const amountHeader = kind === 'return' ? 'จำนวนเงิน\nขอส่งคืน' : 'จำนวนเงิน\nที่ขอเพิ่ม';
  const title = `รายการทบทวนแผนปฏิบัติการประจำปีงบประมาณ พ.ศ. ${fiscalYear}`;
  const section = `3.2.${kind === 'return' ? '1' : '2'} ${action} (${items.length} รายการ)`;

  addCell(ws, 'A1', title, titleStyle);
  addCell(ws, 'A2', section, subtitleStyle);
  ['ลำดับ', 'ชื่องาน/โครงการ', 'รหัสกิจกรรม', 'หน่วยงาน', 'จำนวนเงิน\nที่ได้รับจัดสรร', 'ผลการใช้จ่าย', amountHeader, 'หมายเหตุ'].forEach((label, index) => addCell(ws, XLSX.utils.encode_cell({ r: 3, c: index }), label, headerStyle));

  let row = 4;
  let index = 1;
  let activeProgram = '';
  for (const item of items) {
    const programName = BUDGET_PROGRAMS[item.project.programCode]?.name || item.project.programCode;
    if (programName !== activeProgram) {
      addCell(ws, XLSX.utils.encode_cell({ r: row, c: 0 }), programName, subtitleStyle);
      ws['!merges'] = [...(ws['!merges'] || []), { s: { r: row, c: 0 }, e: { r: row, c: 7 } }];
      activeProgram = programName;
      row += 1;
    }

    const values: Array<string | number> = [index, item.project.name, item.project.code, item.project.division, item.project.budgetAllocated || 0, item.project.budgetSpent || 0, item.amount, item.reason || '-'];
    values.forEach((value, column) => addCell(ws, XLSX.utils.encode_cell({ r: row, c: column }), value, column >= 4 && column <= 6 ? numberStyle : textStyle));
    row += 1;
    index += 1;
  }

  const totalRow = row;
  addCell(ws, XLSX.utils.encode_cell({ r: totalRow, c: 0 }), 'รวมทั้งสิ้น', headerStyle);
  ws['!merges'] = [...(ws['!merges'] || []), { s: { r: totalRow, c: 0 }, e: { r: totalRow, c: 5 } }];
  addCell(ws, XLSX.utils.encode_cell({ r: totalRow, c: 6 }), items.reduce((sum, item) => sum + item.amount, 0), numberStyle);
  addCell(ws, XLSX.utils.encode_cell({ r: totalRow, c: 7 }), '', headerStyle);

  ws['!ref'] = `A1:H${totalRow + 1}`;
  ws['!merges'] = [...(ws['!merges'] || []), { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }];
  ws['!cols'] = [{ wch: 8 }, { wch: 48 }, { wch: 17 }, { wch: 13 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 62 }];
  ws['!rows'] = [{ hpt: 24 }, { hpt: 21 }, { hpt: 8 }, { hpt: 35 }];
  ws['!pageSetup'] = { orientation: 'landscape', paperSize: '9', fitToWidth: 1, fitToHeight: 0 };
  ws['!margins'] = { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 };
  return ws;
}

function buildSummarySheet(items: RevisionItem[], fiscalYear: number): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  addCell(ws, 'A1', `สรุปจำแนกรายการขอส่งคืนเงินงบประมาณ (พ.ศ. ${fiscalYear}) : ยกเลิกกิจกรรม vs ปรับแผนการดำเนินงาน`, titleStyle);
  addCell(ws, 'A2', 'หลักเกณฑ์: จัดเป็น “ยกเลิกกิจกรรม” เฉพาะกรณีที่ระบุชัดเจนว่ายกเลิกงาน/กิจกรรมนั้น ๆ ส่วนกรณีอื่นให้ถือเป็น “ปรับแผนการดำเนินงาน”', subtitleStyle);
  ['ลำดับ', 'ชื่องาน/โครงการ', 'รหัสกิจกรรม', 'หน่วยงาน', 'จำนวนเงิน\nขอส่งคืน', 'การจำแนก'].forEach((label, index) => addCell(ws, XLSX.utils.encode_cell({ r: 3, c: index }), label, headerStyle));

  items.forEach((item, index) => {
    const row = index + 4;
    const values: Array<string | number> = [index + 1, item.project.name, item.project.code, item.project.division, item.amount, item.classification];
    values.forEach((value, column) => addCell(ws, XLSX.utils.encode_cell({ r: row, c: column }), value, column === 4 ? numberStyle : textStyle));
  });

  const totalRow = items.length + 4;
  addCell(ws, XLSX.utils.encode_cell({ r: totalRow, c: 0 }), 'รวมทั้งสิ้น', headerStyle);
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, { s: { r: totalRow, c: 0 }, e: { r: totalRow, c: 3 } }];
  addCell(ws, XLSX.utils.encode_cell({ r: totalRow, c: 4 }), items.reduce((sum, item) => sum + item.amount, 0), numberStyle);
  addCell(ws, XLSX.utils.encode_cell({ r: totalRow, c: 5 }), '', headerStyle);
  ws['!ref'] = `A1:F${totalRow + 1}`;
  ws['!cols'] = [{ wch: 8 }, { wch: 60 }, { wch: 17 }, { wch: 14 }, { wch: 18 }, { wch: 24 }];
  ws['!rows'] = [{ hpt: 24 }, { hpt: 35 }, { hpt: 8 }, { hpt: 35 }];
  ws['!pageSetup'] = { orientation: 'landscape', paperSize: '9', fitToWidth: 1, fitToHeight: 0 };
  ws['!margins'] = { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 };
  return ws;
}

/** Creates the three printable plan-review tables used for the agenda attachment. */
export function exportPlanRevisionReport(fiscalYear: number, projects: Project[]): void {
  const returns = getRevisionItems(projects, fiscalYear, 'return');
  const increases = getRevisionItems(projects, fiscalYear, 'increase');
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, buildRevisionSheet(returns, fiscalYear, 'return'), 'แนบ 1 อำนาจรับคืน');
  XLSX.utils.book_append_sheet(workbook, buildRevisionSheet(increases, fiscalYear, 'increase'), 'แนบ 1 อำนาจให้เพิ่ม');
  XLSX.utils.book_append_sheet(workbook, buildSummarySheet(returns, fiscalYear), 'สรุปยกเลิก-ปรับแผน');
  XLSX.writeFile(workbook, `รายงานทบทวนแผน_${fiscalYear}.xlsx`, { compression: true });
}
