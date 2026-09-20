import * as XLSX from 'xlsx';
import { Project, NHRC_UNITS, BUDGET_PROGRAMS, NHRCUnit, ProgramCode } from '../types/project';
import { ProgressReport, REPORT_ROUNDS } from '../types/progress';
import { formatCurrency, fromThaiNumerals } from './thaiNumber';

const STRATEGIC_PILLAR_NAMES: Record<number, string> = {
  1: 'ยุทธศาสตร์ที่ 1: การส่งเสริมและคุ้มครองสิทธิมนุษยชนในระดับพื้นที่และระดับชาติ',
  2: 'ยุทธศาสตร์ที่ 2: การพัฒนาและเสริมสร้างความเข้มแข็งของภาคีเครือข่ายด้านสิทธิมนุษยชน',
  3: 'ยุทธศาสตร์ที่ 3: การศึกษาวิจัยและขับเคลื่อนข้อเสนอแนะเชิงนโยบายและกฎหมายด้านสิทธิมนุษยชน',
  4: 'ยุทธศาสตร์ที่ 4: การพัฒนาระบบบริหารจัดการองค์กรสู่ความเป็นเลิศและทันสมัย',
};

/**
 * Downloads a complete, neatly categorized Annual Report dossier in Microsoft Word (.doc)
 * Opens natively in Microsoft Word with TH Sarabun PSK / TH Sarabun New, 
 * official headings, tables, bullet points, and categorized by Strategic Pillar & Division.
 */
export function exportAnnualReportToWord(
  fiscalYear: number,
  projects: Project[],
  reports: ProgressReport[]
): void {
  const yearProjects = projects.filter(p => (p.fiscalYear || 2569) === fiscalYear);
  const yearReports = reports.filter(r => (r.fiscalYear || 2569) === fiscalYear);

  // Group latest report by projectId
  const latestReportByProjectId = new Map<string, ProgressReport>();
  yearReports.forEach(rep => {
    const existing = latestReportByProjectId.get(rep.projectId);
    if (!existing) {
      latestReportByProjectId.set(rep.projectId, rep);
    } else {
      // compare round numbers if possible
      const rNum = (r: string) => parseInt(r.replace(/\D/g, ''), 10) || 0;
      if (rNum(rep.round) >= rNum(existing.round)) {
        latestReportByProjectId.set(rep.projectId, rep);
      }
    }
  });

  // Calculate high-level metrics
  const totalAllocated = yearProjects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0);
  const totalSpent = yearProjects.reduce((sum, p) => sum + (p.budgetSpent || 0), 0);
  const overallSpentPercent = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(2) : '0.00';
  const strategicCount = yearProjects.filter(p => p.isStrategic).length;
  const standardCount = yearProjects.length - strategicCount;

  // Group projects by strategic pillar
  const pillarGroups: Record<number, Project[]> = { 1: [], 2: [], 3: [], 4: [] };
  const otherProjects: Project[] = [];

  yearProjects.forEach(p => {
    const pillar = p.strategicPillar;
    if (pillar && pillarGroups[pillar]) {
      pillarGroups[pillar].push(p);
    } else {
      otherProjects.push(p);
    }
  });

  // Helper for clean text
  const clean = (val: any) => fromThaiNumerals((val ?? '').toString().trim());

  let htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>รายงานผลการดำเนินงานตามแผนปฏิบัติการประจำปีงบประมาณ พ.ศ. ${fiscalYear}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 210mm 297mm;
          margin: 25mm 20mm 20mm 25mm;
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: 'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', 'Cordia New', sans-serif;
          font-size: 16pt;
          line-height: 1.35;
          color: #000000;
        }
        h1.title {
          font-size: 24pt;
          font-weight: bold;
          text-align: center;
          margin-top: 15pt;
          margin-bottom: 6pt;
          color: #0a4d44;
        }
        h2.subtitle {
          font-size: 18pt;
          font-weight: bold;
          text-align: center;
          margin-top: 0;
          margin-bottom: 20pt;
          color: #333333;
        }
        h2.chapter-header {
          font-size: 18pt;
          font-weight: bold;
          color: #0a4d44;
          border-bottom: 2pt solid #0a4d44;
          padding-bottom: 4pt;
          margin-top: 25pt;
          margin-bottom: 12pt;
          page-break-before: always;
        }
        h3.project-header {
          font-size: 16pt;
          font-weight: bold;
          background-color: #f3f6f5;
          padding: 6pt 10pt;
          border-left: 5pt solid #0a4d44;
          margin-top: 18pt;
          margin-bottom: 8pt;
        }
        h4.section-subhead {
          font-size: 15pt;
          font-weight: bold;
          color: #1e293b;
          margin-top: 10pt;
          margin-bottom: 4pt;
        }
        p {
          margin: 0 0 6pt 0;
          text-align: justify;
          text-justify: inter-cluster;
        }
        p.indent {
          text-indent: 2.5cm;
        }
        table.doc-table {
          width: 100%;
          border-collapse: collapse;
          margin: 8pt 0 14pt 0;
          font-size: 14pt;
        }
        table.doc-table th, table.doc-table td {
          border: 1pt solid #cbd5e1;
          padding: 5pt 7pt;
          vertical-align: top;
        }
        table.doc-table th {
          background-color: #f1f5f9;
          font-weight: bold;
          color: #0f172a;
          text-align: center;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        .badge {
          display: inline-block;
          padding: 2pt 6pt;
          background-color: #e2e8f0;
          border-radius: 4pt;
          font-size: 13pt;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <!-- COVER / TITLE -->
        <div style="text-align: center; margin-top: 40pt; margin-bottom: 30pt;">
          <h1 class="title">รายงานผลการดำเนินงานตามแผนปฏิบัติการ</h1>
          <h2 class="subtitle">ประจำปีงบประมาณ พ.ศ. ${fiscalYear}</h2>
          <p style="font-size: 16pt; font-weight: bold; text-align: center;">สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ (สำนักงาน กสม.)</p>
          <p style="font-size: 14pt; color: #64748b; text-align: center; margin-top: 10pt;">
            รวบรวมและจัดหมวดหมู่ข้อมูลผลการดำเนินงานเพื่อใช้ประกอบการจัดทำรายงานประจำปี กสม.
          </p>
        </div>

        <!-- EXECUTIVE SUMMARY TABLE -->
        <h2 style="font-size: 18pt; font-weight: bold; color: #0a4d44; border-bottom: 2pt solid #0a4d44; padding-bottom: 4pt; margin-top: 25pt;">
          บทสรุปภาพรวมงบประมาณและการดำเนินงานทั้งปี
        </h2>
        <table class="doc-table">
          <thead>
            <tr>
              <th style="width: 25%;">รายการสรุป</th>
              <th style="width: 25%;">งบประมาณจัดสรร (บาท)</th>
              <th style="width: 25%;">ผลการเบิกจ่ายจริง (บาท)</th>
              <th style="width: 25%;">ร้อยละการเบิกจ่าย (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="bold">ภาพรวมสำนักงาน กสม. ทั้งหมด (${yearProjects.length} โครงการ)</td>
              <td class="text-right bold">${formatCurrency(totalAllocated, false)}</td>
              <td class="text-right bold" style="color: #0a4d44;">${formatCurrency(totalSpent, false)}</td>
              <td class="text-center bold">${overallSpentPercent}%</td>
            </tr>
            <tr>
              <td>- โครงการเชิงยุทธศาสตร์ (${strategicCount} โครงการ)</td>
              <td class="text-right">${formatCurrency(yearProjects.filter(p => p.isStrategic).reduce((s, p) => s + p.budgetAllocated, 0), false)}</td>
              <td class="text-right">${formatCurrency(yearProjects.filter(p => p.isStrategic).reduce((s, p) => s + p.budgetSpent, 0), false)}</td>
              <td class="text-center">${yearProjects.filter(p => p.isStrategic).reduce((s, p) => s + p.budgetAllocated, 0) > 0 ? ((yearProjects.filter(p => p.isStrategic).reduce((s, p) => s + p.budgetSpent, 0) / yearProjects.filter(p => p.isStrategic).reduce((s, p) => s + p.budgetAllocated, 0)) * 100).toFixed(2) : '0.00'}%</td>
            </tr>
            <tr>
              <td>- โครงการตามภารกิจประจำ/พื้นฐาน (${standardCount} โครงการ)</td>
              <td class="text-right">${formatCurrency(yearProjects.filter(p => !p.isStrategic).reduce((s, p) => s + p.budgetAllocated, 0), false)}</td>
              <td class="text-right">${formatCurrency(yearProjects.filter(p => !p.isStrategic).reduce((s, p) => s + p.budgetSpent, 0), false)}</td>
              <td class="text-center">${yearProjects.filter(p => !p.isStrategic).reduce((s, p) => s + p.budgetAllocated, 0) > 0 ? ((yearProjects.filter(p => !p.isStrategic).reduce((s, p) => s + p.budgetSpent, 0) / yearProjects.filter(p => !p.isStrategic).reduce((s, p) => s + p.budgetAllocated, 0)) * 100).toFixed(2) : '0.00'}%</td>
            </tr>
          </tbody>
        </table>
  `;

  // Function to render a single project section
  const renderProjectBlock = (p: Project, pIdx: number, pillarNum?: number) => {
    const rep = latestReportByProjectId.get(p.id);
    const divisionFull = NHRC_UNITS[p.division]?.fullName || p.division;
    const spentPercent = p.budgetAllocated > 0 ? ((p.budgetSpent / p.budgetAllocated) * 100).toFixed(2) : '0.00';
    const numPrefix = pillarNum ? `${pillarNum}.${pIdx + 1}` : `${pIdx + 1}`;

    let block = `
      <div style="margin-bottom: 25pt;">
        <h3 class="project-header">
          โครงการที่ ${numPrefix}: ${clean(p.name)} (${clean(p.code)})
        </h3>

        <!-- Project Meta Table -->
        <table class="doc-table">
          <tr>
            <td style="width: 20%;" class="bold">หน่วยงานรับผิดชอบ:</td>
            <td style="width: 30%;">${clean(divisionFull)} (${clean(p.division)})</td>
            <td style="width: 20%;" class="bold">ผู้รับผิดชอบโครงการ:</td>
            <td style="width: 30%;">${clean(p.responsiblePerson?.name || '-')} (${clean(p.responsiblePerson?.position || '-')})</td>
          </tr>
          <tr>
            <td class="bold">งบประมาณจัดสรร:</td>
            <td>${formatCurrency(p.budgetAllocated, false)} บาท</td>
            <td class="bold">ผลการเบิกจ่ายสะสม:</td>
            <td class="bold" style="color: #0a4d44;">${formatCurrency(p.budgetSpent, false)} บาท (${spentPercent}%)</td>
          </tr>
          <tr>
            <td class="bold">ความก้าวหน้าโครงการ:</td>
            <td><span class="bold" style="color: #0a4d44;">${p.progressPercent}%</span> (${p.status === 'COMPLETED' ? 'บรรลุเป้าหมายแล้ว' : 'อยู่ระหว่างดำเนินการ'})</td>
            <td class="bold">แผนงาน/ประเภท:</td>
            <td>${BUDGET_PROGRAMS[p.programCode]?.shortName || p.programCode} ${p.isStrategic ? '(เชิงยุทธศาสตร์)' : ''}</td>
          </tr>
        </table>

        <!-- Objective & Targets -->
        <h4 class="section-subhead">๑. วัตถุประสงค์และกลุ่มเป้าหมาย</h4>
        <p class="indent">
          <span class="bold">วัตถุประสงค์:</span> ${clean(p.objectives && p.objectives.length > 0 ? p.objectives.join('; ') : 'เพื่อขับเคลื่อนภารกิจและส่งเสริมการเคารพสิทธิมนุษยชนให้เป็นไปตามมาตรฐานสากลและพันธกิจของ กสม.')}
        </p>
        <p class="indent">
          <span class="bold">เป้าหมายผลผลิต/ผลลัพธ์:</span> ${clean(p.expectedOutputs && p.expectedOutputs.length > 0 ? p.expectedOutputs.join('; ') : (p.timeframeText || 'หน่วยงานภาครัฐ ภาคประชาสังคม ประชาชน และเครือข่ายสิทธิมนุษยชน'))}
        </p>

        <!-- Activities Operational Accomplishments -->
        <h4 class="section-subhead">๒. ผลการดำเนินงานรายกิจกรรม (ผลผลิตและผลลัพธ์)</h4>
    `;

    // Render activities either from SnYo3 report section2_2 or project activities
    if (rep && rep.section2_2 && rep.section2_2.length > 0) {
      rep.section2_2.forEach((act, aIdx) => {
        block += `
          <div style="margin-left: 15pt; margin-bottom: 8pt;">
            <p><span class="bold">${clean(act.activityNumberText || `กิจกรรมที่ ${aIdx + 1}`)}: ${clean(act.activityTitle)}</span></p>
            <p class="indent">${clean(act.detailDescription || 'ดำเนินการตามแผนการปฏิบัติงานและการบริหารจัดการโครงการ')}</p>
            ${act.targetPlan || act.targetActual ? `
              <p class="indent" style="color: #334155;">
                <span class="bold">เป้าหมายผู้เข้าร่วม/ผลผลิต:</span> แผน ${clean(act.targetPlan || '-')} | ผลที่ทำได้จริง <span class="bold" style="color: #0a4d44;">${clean(act.targetActual || '-')}</span>
              </p>
            ` : ''}
          </div>
        `;
      });
    } else if (p.activities && p.activities.length > 0) {
      p.activities.forEach((act, aIdx) => {
        block += `
          <div style="margin-left: 15pt; margin-bottom: 8pt;">
            <p><span class="bold">กิจกรรมที่ ${aIdx + 1}: ${clean(act.name)}</span></p>
            <p class="indent">${clean(act.actualResultDescription || act.targetDescription || 'ดำเนินการตามแผนงานและบรรลุผลตามเป้าหมายของกิจกรรม')}</p>
            <p class="indent" style="color: #334155;">
              <span class="bold">งบประมาณกิจกรรม:</span> แผน ${formatCurrency(act.plannedBudget, false)} บาท | เบิกจ่ายจริง ${formatCurrency(act.actualSpent, false)} บาท
            </p>
          </div>
        `;
      });
    } else {
      block += `<p class="indent">ดำเนินกิจกรรมตามแผนปฏิบัติการประจำปี บรรลุตามวัตถุประสงค์และเป้าหมายที่กำหนด</p>`;
    }

    // Section 2.3: Objectives & Indicators table from SnYo3
    if (rep && rep.section2_3 && rep.section2_3.length > 0) {
      block += `
        <h4 class="section-subhead">๓. ผลสัมฤทธิ์ตามวัตถุประสงค์ เป้าหมาย และตัวชี้วัดความสำเร็จ</h4>
        <table class="doc-table">
          <thead>
            <tr>
              <th style="width: 45%;">วัตถุประสงค์ / เป้าหมาย / ตัวชี้วัด</th>
              <th style="width: 55%;">ความก้าวหน้าผลการดำเนินงานจริง</th>
            </tr>
          </thead>
          <tbody>
      `;
      rep.section2_3.forEach(s2_3 => {
        block += `
          <tr>
            <td><span class="bold">${clean(s2_3.label || 'ตัวชี้วัด')}:</span> ${clean(s2_3.targetText)}</td>
            <td>${clean(s2_3.progressText)}</td>
          </tr>
        `;
      });
      block += `</tbody></table>`;
    }

    // Section 3: Contribution to NHRC Policy
    if (rep && rep.section3 && rep.section3.length > 0) {
      block += `
        <h4 class="section-subhead">๔. การขับเคลื่อนนโยบายของ กสม. และผลกระทบต่อสิทธิมนุษยชน</h4>
      `;
      rep.section3.forEach(s3 => {
        block += `
          <p class="indent">
            <span class="bold">${clean(s3.policyTitle)}:</span> ${clean(s3.progressDescription)}
          </p>
        `;
      });
    }

    // Section 4/5: Problems, Challenges & Suggestions
    if (rep && rep.section4_5 && rep.section4_5.length > 0) {
      block += `
        <h4 class="section-subhead">๕. ปัญหา อุปสรรค และข้อเสนอแนะเชิงนโยบาย</h4>
        <table class="doc-table">
          <thead>
            <tr>
              <th style="width: 50%;">ปัญหา อุปสรรค หรือข้อจำกัด</th>
              <th style="width: 50%;">แนวทางการแก้ไข หรือข้อเสนอแนะ</th>
            </tr>
          </thead>
          <tbody>
      `;
      rep.section4_5.forEach(s4_5 => {
        block += `
          <tr>
            <td>${clean(s4_5.obstacle)}</td>
            <td>${clean(s4_5.solution)}</td>
          </tr>
        `;
      });
      block += `</tbody></table>`;
    }

    block += `</div>`;
    return block;
  };

  // Render chapters by Strategic Pillar
  [1, 2, 3, 4].forEach(pillar => {
    const list = pillarGroups[pillar];
    if (list && list.length > 0) {
      htmlContent += `
        <h2 class="chapter-header">
          หมวดที่ ${pillar}: ${STRATEGIC_PILLAR_NAMES[pillar]}
        </h2>
        <p style="font-size: 14pt; color: #475569; margin-bottom: 15pt;">
          มีโครงการภายใต้ยุทธศาสตร์นี้จำนวนทั้งสิ้น ${list.length} โครงการ รวมงบประมาณ ${formatCurrency(list.reduce((s, p) => s + p.budgetAllocated, 0), false)} บาท เบิกจ่ายแล้ว ${formatCurrency(list.reduce((s, p) => s + p.budgetSpent, 0), false)} บาท
        </p>
      `;
      list.forEach((p, idx) => {
        htmlContent += renderProjectBlock(p, idx, pillar);
      });
    }
  });

  // Render Other Projects (if any)
  if (otherProjects.length > 0) {
    htmlContent += `
      <h2 class="chapter-header">
        หมวดโครงการพื้นฐานและสนับสนุนการปฏิบัติงานของสำนักงาน กสม.
      </h2>
      <p style="font-size: 14pt; color: #475569; margin-bottom: 15pt;">
        มีโครงการตามภารกิจสนับสนุนจำนวนทั้งสิ้น ${otherProjects.length} โครงการ รวมงบประมาณ ${formatCurrency(otherProjects.reduce((s, p) => s + p.budgetAllocated, 0), false)} บาท เบิกจ่ายแล้ว ${formatCurrency(otherProjects.reduce((s, p) => s + p.budgetSpent, 0), false)} บาท
      </p>
    `;
    otherProjects.forEach((p, idx) => {
      htmlContent += renderProjectBlock(p, idx, 5);
    });
  }

  // Close HTML
  htmlContent += `
        <!-- ANNEX: COMPLETE PROJECT LIST -->
        <h2 class="chapter-header">
          ภาคผนวก: บัญชีสรุปข้อมูลโครงการและการใช้จ่ายงบประมาณจำแนกรายสำนัก
        </h2>
        <table class="doc-table">
          <thead>
            <tr>
              <th style="width: 6%;">ลำดับ</th>
              <th style="width: 14%;">รหัสโครงการ</th>
              <th style="width: 40%;">ชื่อโครงการ</th>
              <th style="width: 12%;">สำนัก</th>
              <th style="width: 14%;">งบจัดสรร (บาท)</th>
              <th style="width: 14%;">เบิกจ่ายจริง (บาท)</th>
            </tr>
          </thead>
          <tbody>
  `;

  yearProjects.forEach((p, idx) => {
    htmlContent += `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td class="text-center" style="font-family: monospace;">${clean(p.code)}</td>
        <td>${clean(p.name)}</td>
        <td class="text-center">${clean(p.division)}</td>
        <td class="text-right">${formatCurrency(p.budgetAllocated, false)}</td>
        <td class="text-right bold" style="color: #0a4d44;">${formatCurrency(p.budgetSpent, false)}</td>
      </tr>
    `;
  });

  htmlContent += `
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  // Trigger File Download
  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `รายงานผลการดำเนินงานสำหรับรายงานประจำปี_กสม_พศ_${fiscalYear}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a complete Microsoft Excel (.xlsx) workbook for the Annual Report
 * containing 3 sheets:
 * 1. ภาพรวมโครงการทั้งหมด (All Projects Master)
 * 2. รายละเอียดกิจกรรมและเป้าหมาย (Activities & Targets)
 * 3. สรุปจำแนกตามยุทธศาสตร์และสำนัก (Summary by Pillar & Division)
 */
export function exportAnnualReportToExcel(
  fiscalYear: number,
  projects: Project[],
  reports: ProgressReport[]
): void {
  const yearProjects = projects.filter(p => (p.fiscalYear || 2569) === fiscalYear);
  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // Sheet 1: Master Projects Table
  // -------------------------------------------------------------
  const sheet1Data = yearProjects.map((p, idx) => {
    const spentPercent = p.budgetAllocated > 0 ? ((p.budgetSpent / p.budgetAllocated) * 100).toFixed(2) : '0.00';
    return {
      'ลำดับ': idx + 1,
      'รหัสโครงการ': fromThaiNumerals(p.code),
      'ชื่อโครงการ': fromThaiNumerals(p.name),
      'ยุทธศาสตร์ กสม.': p.strategicPillar ? STRATEGIC_PILLAR_NAMES[p.strategicPillar] : 'โครงการตามภารกิจพื้นฐาน/สนับสนุน',
      'สำนัก/กลุ่มงาน': p.division,
      'ชื่อเต็มสำนัก': NHRC_UNITS[p.division]?.fullName || p.division,
      'ผู้รับผิดชอบ': p.responsiblePerson?.name || '',
      'งบประมาณจัดสรร (บาท)': p.budgetAllocated,
      'ผลเบิกจ่ายจริง (บาท)': p.budgetSpent,
      'งบประมาณคงเหลือ (บาท)': Math.max(0, p.budgetAllocated - p.budgetSpent),
      'ร้อยละการเบิกจ่าย (%)': parseFloat(spentPercent),
      'ความก้าวหน้าโครงการ (%)': p.progressPercent,
      'สถานะโครงการ': p.status === 'COMPLETED' ? 'บรรลุเป้าหมายแล้ว' : 'อยู่ระหว่างดำเนินการ',
      'ประเภทโครงการ': p.isStrategic ? 'เชิงยุทธศาสตร์' : 'ภารกิจประจำ',
    };
  });
  const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
  XLSX.utils.book_append_sheet(wb, ws1, 'ภาพรวมโครงการทั้งหมด');

  // -------------------------------------------------------------
  // Sheet 2: Activities and Targets
  // -------------------------------------------------------------
  const sheet2Data: any[] = [];
  yearProjects.forEach(p => {
    if (p.activities && p.activities.length > 0) {
      p.activities.forEach((act, aIdx) => {
        sheet2Data.push({
          'รหัสโครงการ': fromThaiNumerals(p.code),
          'ชื่อโครงการ': fromThaiNumerals(p.name),
          'สำนัก': p.division,
          'ลำดับกิจกรรม': aIdx + 1,
          'ชื่อกิจกรรม': fromThaiNumerals(act.name),
          'งบประมาณกิจกรรม (บาท)': act.plannedBudget || 0,
          'เบิกจ่ายจริง (บาท)': act.actualSpent || 0,
          'เป้าหมายตามแผน': fromThaiNumerals(act.targetDescription || '-'),
          'ผลการดำเนินงานจริง': fromThaiNumerals(act.actualResultDescription || '-'),
          'สถานะกิจกรรม': act.status === 'completed' ? 'เสร็จสิ้น' : 'อยู่ระหว่างดำเนินการ',
        });
      });
    }
  });
  const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
  XLSX.utils.book_append_sheet(wb, ws2, 'ผลการดำเนินงานรายกิจกรรม');

  // -------------------------------------------------------------
  // Sheet 3: Summary by Strategy & Division
  // -------------------------------------------------------------
  const divisionSummary: Record<string, { count: number; allocated: number; spent: number }> = {};
  yearProjects.forEach(p => {
    if (!divisionSummary[p.division]) {
      divisionSummary[p.division] = { count: 0, allocated: 0, spent: 0 };
    }
    divisionSummary[p.division].count += 1;
    divisionSummary[p.division].allocated += p.budgetAllocated;
    divisionSummary[p.division].spent += p.budgetSpent;
  });

  const sheet3Data = Object.entries(divisionSummary).map(([div, stat]) => {
    const rate = stat.allocated > 0 ? ((stat.spent / stat.allocated) * 100).toFixed(2) : '0.00';
    return {
      'รหัสสำนัก': div,
      'ชื่อเต็มสำนัก': NHRC_UNITS[div as NHRCUnit]?.fullName || div,
      'จำนวนโครงการ': stat.count,
      'งบประมาณรวม (บาท)': stat.allocated,
      'เบิกจ่ายจริง (บาท)': stat.spent,
      'งบคงเหลือ (บาท)': Math.max(0, stat.allocated - stat.spent),
      'ร้อยละการเบิกจ่าย (%)': parseFloat(rate),
    };
  });
  const ws3 = XLSX.utils.json_to_sheet(sheet3Data);
  XLSX.utils.book_append_sheet(wb, ws3, 'สรุปจำแนกตามสำนัก');

  // Write file
  XLSX.writeFile(wb, `ข้อมูลจัดทำรายงานประจำปี_กสม_${fiscalYear}.xlsx`);
}
