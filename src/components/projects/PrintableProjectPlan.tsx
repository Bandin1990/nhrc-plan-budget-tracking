import React, { useState } from 'react';
import { Printer, Download, ArrowLeft, ToggleLeft, ToggleRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Project, NHRC_UNITS } from '../../types/project';
import { toThaiNumerals, fromThaiNumerals, formatCurrency } from '../../utils/thaiNumber';
import { NHRC_STRATEGIC_PILLARS_FULL } from '../../constants/strategicOptions';

interface PrintableProjectPlanProps {
  project: Project;
  onBack: () => void;
}

export const PrintableProjectPlan: React.FC<PrintableProjectPlanProps> = ({ project, onBack }) => {
  const [useThaiNumerals, setUseThaiNumerals] = useState(false);
  const [scale, setScale] = useState(100);

  const num = (val: string | number | undefined | null) => {
    if (val === null || val === undefined) return '';
    const str = val.toString();
    return useThaiNumerals ? toThaiNumerals(str) : fromThaiNumerals(str);
  };

  const curr = (val: number) => {
    return formatCurrency(val, useThaiNumerals);
  };

  const handlePrint = () => {
    window.print();
  };

  const unitInfo = NHRC_UNITS[project.division];
  const divisionFullName = unitInfo ? unitInfo.fullName : project.division;
  const s2 = project.strategicSection2;
  const pillarNum = s2?.nhrcStrategicPillar || project.strategicPillar || 1;
  const pillarFullName = NHRC_STRATEGIC_PILLARS_FULL[pillarNum] || `ยุทธศาสตร์ที่ ${pillarNum}`;

  const handleExportWord = () => {
    const numFmt = (val: string | number | undefined | null) => {
      if (val === null || val === undefined) return '';
      const str = val.toString();
      return useThaiNumerals ? toThaiNumerals(str) : fromThaiNumerals(str);
    };

    const currFmt = (val: number) => formatCurrency(val, useThaiNumerals);

    const isOpSelf = !project.operationMethod || project.operationMethod.includes('ดำเนินการเอง');
    const isOpHired = project.operationMethod?.includes('จัดจ้าง') || project.operationMethod?.includes('จ้างเหมา');
    const isOpReg = project.operationMethod?.includes('ลงทะเบียน');

    const isBudPerson = project.budgetCategory === 'งบบุคลากร';
    const isBudOp = !project.budgetCategory || project.budgetCategory === 'งบดำเนินงาน';
    const isBudInvest = project.budgetCategory === 'งบลงทุน';

    const isSrcAnnual = !project.budgetSource || project.budgetSource.includes('รายจ่ายประจำปี');
    const isSrcLeftover = project.budgetSource?.includes('เหลือจ่าย');
    const isSrcRevenue = project.budgetSource?.includes('รายได้');
    const isSrcOther = project.budgetSource?.includes('อื่น');

    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>แบบฟอร์มรายละเอียดแผนปฏิบัติงานและการใช้จ่ายงบประมาณของโครงการ (${project.code})</title>
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
          @page { size: 210mm 297mm; margin: 20mm 20mm 20mm 25mm; }
          body { font-family: 'TH SarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif; font-size: 16pt; line-height: 1.3; color: #000; }
          .title-center { text-align: center; font-size: 20pt; font-weight: bold; margin-bottom: 8pt; }
          .section-header { font-size: 16pt; font-weight: bold; background-color: #FDE9D9; padding: 2pt 4pt; margin-top: 12pt; margin-bottom: 6pt; }
          .field-row { font-size: 16pt; margin-bottom: 4pt; }
          .indent { margin-left: 20pt; }
          .red-star { color: red; }
          table { width: 100%; border-collapse: collapse; margin-top: 6pt; margin-bottom: 12pt; font-size: 14pt; }
          th, td { border: 1pt solid #000; padding: 4pt 6pt; vertical-align: top; }
          th { background-color: #F2F2F2; font-weight: bold; text-align: center; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>

        <div class="title-center">
          <b>แบบฟอร์มรายละเอียดแผนปฏิบัติงานและการใช้จ่ายงบประมาณของโครงการ<br> ประจำปีงบประมาณ พ.ศ. ${numFmt(project.fiscalYear)}</b>
        </div>

        <div class="title-center">
          <b>สำนัก/หน่วยงาน ${divisionFullName}</b>
        </div>

        <!-- ส่วนที่ 1 -->
        <div class="section-header">
          <b>ส่วนที่ 1  : ข้อมูลโครงการ</b>
        </div>

        <div class="field-row">
          <b>1.1 ชื่อโครงการ<span class="red-star">*</span></b> ${project.name}
        </div>

        <div class="field-row">
          <b>1.2 วิธีการดำเนินงาน<span class="red-star">*</span> </b>
          &nbsp;&nbsp;&nbsp; ${isOpSelf ? '[✓]' : '[  ]'} ดำเนินการเอง
          &nbsp;&nbsp;&nbsp; ${isOpHired ? '[✓]' : '[  ]'} จัดจ้าง
          &nbsp;&nbsp;&nbsp; ${isOpReg ? '[✓]' : '[  ]'} ลงทะเบียน
        </div>

        <div class="field-row">
          <b>1.3 ประเภทงบประมาณ<span class="red-star">*</span> </b>
          &nbsp;&nbsp;&nbsp; ${isBudPerson ? '[✓]' : '[  ]'} งบบุคลากร
          &nbsp;&nbsp;&nbsp; ${isBudOp ? '[✓]' : '[  ]'} งบดำเนินงาน
          &nbsp;&nbsp;&nbsp; ${isBudInvest ? '[✓]' : '[  ]'} งบลงทุน
        </div>

        <div class="field-row">
          <b>1.4 แหล่งงบประมาณ<span class="red-star">*</span> </b>
          &nbsp;&nbsp;&nbsp; ${isSrcAnnual ? '[✓]' : '[  ]'} เงินงบประมาณรายจ่ายประจำปี
          &nbsp;&nbsp;&nbsp; ${isSrcLeftover ? '[✓]' : '[  ]'} เงินงบประมาณเหลือจ่าย
          &nbsp;&nbsp;&nbsp; ${isSrcRevenue ? '[✓]' : '[  ]'} เงินรายได้
          &nbsp;&nbsp;&nbsp; ${isSrcOther ? '[✓]' : '[  ]'} อื่น ๆ (ระบุ)
        </div>

        <!-- ส่วนที่ 2 -->
        <div class="section-header">
          <b>ส่วนที่ 2 : ความเชื่อมโยงกับยุทธศาสตร์ชาติ</b>
        </div>

        <div class="field-row">
          <b>2.1 ยุทธศาสตร์ชาติ</b> ${s2?.nationalStrategyPillar || project.nationalStrategy || '-'}
        </div>
        <div class="field-row indent">
          <b>ประเด็น</b> ${s2?.nationalStrategyIssue || '-'}
        </div>
        <div class="field-row indent">
          <b>เป้าหมาย</b> ${s2?.nationalStrategyTarget || '-'}
        </div>

        <div class="field-row">
          <b>2.2 แผนแม่บทภายใต้ยุทธศาสตร์ชาติ </b> ${s2?.masterPlanSubPlan || project.masterPlan || '-'}
        </div>
        <div class="field-row indent">
          <b>แผนย่อย </b> ${s2?.masterPlanSubPlan || '-'}
        </div>
        <div class="field-row indent">
          <b>เป้าหมายแผนย่อย </b> ${s2?.masterPlanSubTarget || '-'}
        </div>

        <div class="field-row">
          <b>2.3 แผนการปฏิรูปประเทศ </b> ${s2?.nationalReformPlan || '-'}
        </div>

        <div class="field-row">
          <b>2.4 แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ ฉบับที่ ${numFmt(13)}</b>
        </div>
        <div class="field-row indent">
          <b>หมุดหมายที่ </b> ${s2?.economicDevPlanMilestone || '-'}
        </div>

        <div class="field-row">
          <b>2.5 แผนระดับที่ 3 ที่เกี่ยวข้อง </b> ${s2?.level3Plan || project.relatedPlans || '-'}
        </div>

        <div class="field-row">
          <b>2.6 ยุทธศาสตร์ กสม.</b>
        </div>
        <div class="field-row indent">
          <b>ยุทธศาสตร์ที่</b> ${pillarFullName}
        </div>
        <div class="field-row indent">
          <b>ประเด็นยุทธศาสตร์ที่</b> ${s2?.nhrcStrategicIssue || '-'}
        </div>

        <div class="field-row">
          <b>2.7 กฎหมายที่เกี่ยวข้อง </b> ${s2?.relatedLaws || '-'}
        </div>

        <!-- ส่วนที่ 3 -->
        <div class="section-header">
          <b>ส่วนที่ 3 : รายละเอียดโครงการ</b>
        </div>

        <div class="field-row">
          <b>3.1 หลักการและเหตุผล<span class="red-star">*</span></b> ${project.rationale || '-'}
        </div>

        <div class="field-row">
          <b>3.2 วัตถุประสงค์<span class="red-star">*</span></b> ${(project.objectives || []).join(' ')}
        </div>

        <div class="field-row">
          <b>3.3 เป้าหมาย<span class="red-star">*</span></b>
        </div>
        <div class="field-row indent">
          <b>1) เป้าหมายผลผลิต</b> ${(project.expectedOutputs || []).join(' ')}
        </div>
        <div class="field-row indent">
          <b>2) เป้าหมายผลลัพธ์</b> ${(project.expectedOutcomes || []).join(' ')}
        </div>

        <div class="field-row">
          <b>3.4 ผลที่คาดว่าจะเกิดขึ้นหรือได้รับ<span class="red-star">*</span></b> ${(project.expectedBenefits && project.expectedBenefits.length > 0 ? project.expectedBenefits : project.expectedOutcomes || []).join(' ')}
        </div>

        <div class="field-row">
          <b>3.5 ตัวชี้วัดความสำเร็จของโครงการ<span class="red-star">*</span></b> ${(project.indicators || []).map(ind => `${ind.title} (${ind.target})`).join(' ')}
        </div>

        <div class="field-row">
          <b>3.6 กลุ่มเป้าหมาย<span class="red-star">*</span></b>
        </div>
        <div class="field-row indent">
          <b>1) ประเภทกลุ่มเป้าหมาย</b> ${project.targetGroup || '-'}
        </div>
        <div class="field-row indent">
          <b>2) จำนวนกลุ่มเป้าหมายแต่ละประเภท</b> ${project.targetGroup || '-'}
        </div>

        <div class="field-row">
          <b>3.7 พื้นที่ดำเนินงาน<span class="red-star">*</span></b> ${project.targetArea || '-'}
        </div>

        <div class="field-row">
          <b>3.8 ระยะเวลาการดำเนินโครงการ<span class="red-star">*</span></b> ${project.timeframeText || '-'}
        </div>

        <!-- ส่วนที่ 4 -->
        <div class="section-header">
          <b>ส่วนที่ 4 : แผนการดำเนินงานและการใช้จ่ายงบประมาณ</b>
        </div>

        <div class="field-row">
          <b>4.1 งบประมาณที่ขอรับจัดสรร<span class="red-star">*</span> จำนวน </b> ${currFmt(project.budgetAllocated)} <b> บาท</b>
        </div>

        <div class="field-row">
          <b>4.2 รายละเอียดค่าใช้จ่าย</b>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:10%;"><b>ลำดับที่</b></th>
              <th style="width:40%;"><b>รายการ</b></th>
              <th style="width:30%;"><b>รายละเอียดค่าใช้จ่าย</b></th>
              <th style="width:20%;"><b>จำนวนเงิน (บาท)</b></th>
            </tr>
          </thead>
          <tbody>
            ${(project.activities || []).map((act, idx) => `
              <tr>
                <td class="text-center">${numFmt(idx + 1)}</td>
                <td>${act.name}</td>
                <td class="text-center">ดำเนินงานตามกิจกรรม ${act.code || (idx + 1)}</td>
                <td class="text-right">${currFmt(act.plannedBudget)}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3" class="text-right bold">รวมทั้งสิ้น</td>
              <td class="text-right bold">${currFmt(project.budgetAllocated)}</td>
            </tr>
          </tbody>
        </table>

        <div class="field-row">
          <b>4.3 แผนการดำเนินงานและการใช้จ่ายงบประมาณ<span class="red-star">*</span></b>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:40%;"><b>กิจกรรม</b></th>
              <th style="width:20%;"><b>ร้อยละของแผน</b></th>
              <th style="width:20%;"><b>ช่วงเวลาดำเนินงาน<br>(ระบุเดือน)</b></th>
              <th style="width:20%;"><b>งบประมาณที่จะใช้<br>(จำนวนเงิน)</b></th>
            </tr>
          </thead>
          <tbody>
            ${(project.activities || []).map((act, idx) => `
              <tr>
                <td>${numFmt(idx + 1)}. ${act.name}</td>
                <td class="text-center">${numFmt(act.plannedPercent || 100)}%</td>
                <td class="text-center">${act.timeframe}</td>
                <td class="text-right">${currFmt(act.plannedBudget)}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3" class="text-right bold">รวม</td>
              <td class="text-right bold">${currFmt(project.budgetAllocated)}</td>
            </tr>
          </tbody>
        </table>

        <!-- ส่วนที่ 5 -->
        <div class="section-header">
          <b>ส่วนที่ 5 : ผู้รับผิดชอบ/ผู้ประสานงานโครงการ</b>
        </div>

        <table>
          <tbody>
            <tr>
              <th style="width:25%; text-align:left;"><b>ชื่อ-นามสกุล</b></th>
              <td>${project.responsiblePerson?.name || '-'}</td>
            </tr>
            <tr>
              <th style="width:25%; text-align:left;"><b>ตำแหน่ง</b></th>
              <td>${project.responsiblePerson?.position || '-'}</td>
            </tr>
            <tr>
              <th style="width:25%; text-align:left;"><b>สังกัด</b></th>
              <td>${divisionFullName}</td>
            </tr>
            <tr>
              <th style="width:25%; text-align:left;"><b>กลุ่มงาน</b></th>
              <td>${project.subDivision || 'กลุ่มงานที่ได้รับมอบหมาย'}</td>
            </tr>
            <tr>
              <th style="width:25%; text-align:left;"><b>เบอร์โทรศัพท์</b></th>
              <td>${numFmt(project.responsiblePerson?.phone || '-')}</td>
            </tr>
            <tr>
              <th style="width:25%; text-align:left;"><b>e-Mail</b></th>
              <td>${project.responsiblePerson?.email || '-'}</td>
            </tr>
          </tbody>
        </table>

      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `แบบฟอร์มรายละเอียดแผนปฏิบัติงานและการใช้จ่ายงบประมาณของโครงการ_${project.code}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isOpSelf = !project.operationMethod || project.operationMethod.includes('ดำเนินการเอง');
  const isOpHired = project.operationMethod?.includes('จัดจ้าง') || project.operationMethod?.includes('จ้างเหมา');
  const isOpReg = project.operationMethod?.includes('ลงทะเบียน');

  const isBudPerson = project.budgetCategory === 'งบบุคลากร';
  const isBudOp = !project.budgetCategory || project.budgetCategory === 'งบดำเนินงาน';
  const isBudInvest = project.budgetCategory === 'งบลงทุน';

  const isSrcAnnual = !project.budgetSource || project.budgetSource.includes('รายจ่ายประจำปี');
  const isSrcLeftover = project.budgetSource?.includes('เหลือจ่าย');
  const isSrcRevenue = project.budgetSource?.includes('รายได้');
  const isSrcOther = project.budgetSource?.includes('อื่น');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto flex flex-col items-center p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      
      {/* Top Controls Bar - Hidden on Print */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-t-xl shadow-lg border-b border-slate-200 dark:border-slate-700 p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </button>
          <span className="font-bold text-slate-800 dark:text-white text-base">
            แบบฟอร์มรายละเอียดแผนปฏิบัติงานฯ ({project.code})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Thai Numeral Toggle */}
          <button
            onClick={() => setUseThaiNumerals(!useThaiNumerals)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
            title="สลับการแสดงผลตัวเลขอารบิก / ตัวเลขไทย"
          >
            {useThaiNumerals ? <ToggleRight className="w-4 h-4 text-amber-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
            {useThaiNumerals ? 'เลขไทย (๑๒๓)' : 'เลขอารบิก (123)'}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 text-xs text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setScale(Math.max(70, scale - 10))}
              className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded transition-colors"
              title="ย่อขนาด"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono font-medium">{scale}%</span>
            <button
              onClick={() => setScale(Math.min(130, scale + 10))}
              className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded transition-colors"
              title="ขยายขนาด"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export MS Word */}
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            title="ดาวน์โหลดเป็นไฟล์ Microsoft Word (.doc)"
          >
            <Download className="w-4 h-4" />
            ดาวน์โหลด Word (.doc)
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0a4d44] hover:bg-[#073832] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            สั่งพิมพ์ / บันทึก PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet View - Exact Official Form Design */}
      <div 
        className="w-full max-w-4xl bg-white text-slate-900 shadow-2xl p-8 sm:p-12 mb-8 print:p-0 print:m-0 print:shadow-none print:w-full print:max-w-none print:text-black font-serif"
        style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top center' }}
      >
        <div className="text-center mb-6 space-y-1">
          <h2 className="text-xl font-bold text-slate-900 print:text-black">
            แบบฟอร์มรายละเอียดแผนปฏิบัติงานและการใช้จ่ายงบประมาณของโครงการ<br />
            ประจำปีงบประมาณ พ.ศ. {num(project.fiscalYear)}
          </h2>
          <h3 className="text-lg font-bold text-slate-800 print:text-black pt-1">
            สำนัก/หน่วยงาน {divisionFullName}
          </h3>
        </div>

        {/* ส่วนที่ 1 : ข้อมูลโครงการ */}
        <div className="mb-4">
          <div className="bg-[#FDE9D9] print:bg-[#FDE9D9] px-3 py-1 text-sm font-bold text-slate-900 print:text-black border-l-4 border-amber-600 mb-3">
            ส่วนที่ 1  : ข้อมูลโครงการ
          </div>
          <div className="space-y-2 text-sm leading-relaxed text-slate-800 print:text-black pl-2">
            <p><span className="font-bold">1.1 ชื่อโครงการ<span className="text-red-600">*</span></span> {project.name}</p>
            
            <p>
              <span className="font-bold">1.2 วิธีการดำเนินงาน<span className="text-red-600">*</span> </span>
              <span className="ml-4 inline-flex items-center gap-1 font-sans">{isOpSelf ? '☑' : '☐'} ดำเนินการเอง</span>
              <span className="ml-4 inline-flex items-center gap-1 font-sans">{isOpHired ? '☑' : '☐'} จัดจ้าง</span>
              <span className="ml-4 inline-flex items-center gap-1 font-sans">{isOpReg ? '☑' : '☐'} ลงทะเบียน</span>
            </p>

            <p>
              <span className="font-bold">1.3 ประเภทงบประมาณ<span className="text-red-600">*</span> </span>
              <span className="ml-4 inline-flex items-center gap-1 font-sans">{isBudPerson ? '☑' : '☐'} งบบุคลากร</span>
              <span className="ml-4 inline-flex items-center gap-1 font-sans">{isBudOp ? '☑' : '☐'} งบดำเนินงาน</span>
              <span className="ml-4 inline-flex items-center gap-1 font-sans">{isBudInvest ? '☑' : '☐'} งบลงทุน</span>
            </p>

            <p>
              <span className="font-bold">1.4 แหล่งงบประมาณ<span className="text-red-600">*</span> </span>
              <span className="ml-4 inline-flex items-center gap-1 font-sans">{isSrcAnnual ? '☑' : '☐'} เงินงบประมาณรายจ่ายประจำปี</span>
              <span className="ml-4 inline-flex items-center gap-1 font-sans">{isSrcLeftover ? '☑' : '☐'} เงินงบประมาณเหลือจ่าย</span>
              <span className="ml-4 inline-flex items-center gap-1 font-sans">{isSrcRevenue ? '☑' : '☐'} เงินรายได้</span>
              <span className="ml-4 inline-flex items-center gap-1 font-sans">{isSrcOther ? '☑' : '☐'} อื่น ๆ (ระบุ)</span>
            </p>
          </div>
        </div>

        {/* ส่วนที่ 2 : ความเชื่อมโยงกับยุทธศาสตร์ชาติ */}
        <div className="mb-4">
          <div className="bg-[#FDE9D9] print:bg-[#FDE9D9] px-3 py-1 text-sm font-bold text-slate-900 print:text-black border-l-4 border-amber-600 mb-3">
            ส่วนที่ 2 : ความเชื่อมโยงกับยุทธศาสตร์ชาติ
          </div>
          <div className="space-y-1.5 text-sm leading-relaxed text-slate-800 print:text-black pl-2">
            <p><span className="font-bold">2.1 ยุทธศาสตร์ชาติ</span> {s2?.nationalStrategyPillar || project.nationalStrategy || '-'}</p>
            <p className="pl-6"><span className="font-bold">ประเด็น</span> {s2?.nationalStrategyIssue || '-'}</p>
            <p className="pl-6"><span className="font-bold">เป้าหมาย</span> {s2?.nationalStrategyTarget || '-'}</p>

            <p className="pt-1"><span className="font-bold">2.2 แผนแม่บทภายใต้ยุทธศาสตร์ชาติ  </span> {s2?.masterPlanSubPlan || project.masterPlan || '-'}</p>
            <p className="pl-6"><span className="font-bold">แผนย่อย </span> {s2?.masterPlanSubPlan || '-'}</p>
            <p className="pl-6"><span className="font-bold">เป้าหมายแผนย่อย </span> {s2?.masterPlanSubTarget || '-'}</p>

            <p className="pt-1"><span className="font-bold">2.3 แผนการปฏิรูปประเทศ </span> {s2?.nationalReformPlan || '-'}</p>
            <p><span className="font-bold">2.4 แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ ฉบับที่ {num(13)}</span></p>
            <p className="pl-6"><span className="font-bold">หมุดหมายที่ </span> {s2?.economicDevPlanMilestone || '-'}</p>

            <p className="pt-1"><span className="font-bold">2.5 แผนระดับที่ {num(3)} ที่เกี่ยวข้อง </span> {s2?.level3Plan || project.relatedPlans || '-'}</p>
            <p><span className="font-bold">2.6 ยุทธศาสตร์ กสม.</span></p>
            <p className="pl-6"><span className="font-bold">ยุทธศาสตร์ที่</span> {pillarFullName}</p>
            <p className="pl-6"><span className="font-bold">ประเด็นยุทธศาสตร์ที่</span> {s2?.nhrcStrategicIssue || '-'}</p>

            <p className="pt-1"><span className="font-bold">2.7 กฎหมายที่เกี่ยวข้อง </span> {s2?.relatedLaws || '-'}</p>
          </div>
        </div>

        {/* ส่วนที่ 3 : รายละเอียดโครงการ */}
        <div className="mb-4">
          <div className="bg-[#FDE9D9] print:bg-[#FDE9D9] px-3 py-1 text-sm font-bold text-slate-900 print:text-black border-l-4 border-amber-600 mb-3">
            ส่วนที่ 3 : รายละเอียดโครงการ
          </div>
          <div className="space-y-2 text-sm leading-relaxed text-slate-800 print:text-black pl-2">
            <p><span className="font-bold">3.1 หลักการและเหตุผล<span className="text-red-600">*</span></span> {project.rationale || '-'}</p>
            <p><span className="font-bold">3.2 วัตถุประสงค์<span className="text-red-600">*</span></span> {(project.objectives || []).join(' ')}</p>
            
            <p><span className="font-bold">3.3 เป้าหมาย<span className="text-red-600">*</span></span></p>
            <p className="pl-6"><span className="font-bold">1) เป้าหมายผลผลิต</span> {(project.expectedOutputs || []).join(' ')}</p>
            <p className="pl-6"><span className="font-bold">2) เป้าหมายผลลัพธ์</span> {(project.expectedOutcomes || []).join(' ')}</p>

            <p><span className="font-bold">3.4 ผลที่คาดว่าจะเกิดขึ้นหรือได้รับ<span className="text-red-600">*</span></span> {(project.expectedBenefits && project.expectedBenefits.length > 0 ? project.expectedBenefits : project.expectedOutcomes || []).join(' ')}</p>
            <p><span className="font-bold">3.5 ตัวชี้วัดความสำเร็จของโครงการ<span className="text-red-600">*</span></span> {(project.indicators || []).map(ind => `${ind.title} (${ind.target})`).join(' ')}</p>

            <p><span className="font-bold">3.6 กลุ่มเป้าหมาย<span className="text-red-600">*</span></span></p>
            <p className="pl-6"><span className="font-bold">1) ประเภทกลุ่มเป้าหมาย</span> {project.targetGroup || '-'}</p>
            <p className="pl-6"><span className="font-bold">2) จำนวนกลุ่มเป้าหมายแต่ละประเภท</span> {project.targetGroup || '-'}</p>

            <p><span className="font-bold">3.7 พื้นที่ดำเนินงาน<span className="text-red-600">*</span></span> {project.targetArea || '-'}</p>
            <p><span className="font-bold">3.8 ระยะเวลาการดำเนินโครงการ<span className="text-red-600">*</span></span> {project.timeframeText || '-'}</p>
          </div>
        </div>

        {/* ส่วนที่ 4 : แผนการดำเนินงานและการใช้จ่ายงบประมาณ */}
        <div className="mb-4">
          <div className="bg-[#FDE9D9] print:bg-[#FDE9D9] px-3 py-1 text-sm font-bold text-slate-900 print:text-black border-l-4 border-amber-600 mb-3">
            ส่วนที่ 4 : แผนการดำเนินงานและการใช้จ่ายงบประมาณ
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-slate-800 print:text-black pl-2">
            <p><span className="font-bold">4.1 งบประมาณที่ขอรับจัดสรร<span className="text-red-600">*</span> จำนวน </span> <strong className="text-base font-bold">{curr(project.budgetAllocated)}</strong> <span className="font-bold"> บาท</span></p>
            
            <p><span className="font-bold">4.2 รายละเอียดค่าใช้จ่าย</span></p>
            <table className="w-full border-collapse border border-slate-400 text-xs my-2">
              <thead>
                <tr className="bg-[#F2F2F2] print:bg-[#F2F2F2]">
                  <th className="border border-slate-400 p-2 w-14 text-center font-bold">ลำดับที่</th>
                  <th className="border border-slate-400 p-2 text-left font-bold">รายการ</th>
                  <th className="border border-slate-400 p-2 text-left font-bold">รายละเอียดค่าใช้จ่าย</th>
                  <th className="border border-slate-400 p-2 w-32 text-right font-bold">จำนวนเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {(project.activities || []).map((act, idx) => (
                  <tr key={act.id}>
                    <td className="border border-slate-400 p-2 text-center">{num(idx + 1)}</td>
                    <td className="border border-slate-400 p-2">{act.name}</td>
                    <td className="border border-slate-400 p-2 text-center">ดำเนินงานตามกิจกรรม {act.code || (idx + 1)}</td>
                    <td className="border border-slate-400 p-2 text-right font-mono">{curr(act.plannedBudget)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="border border-slate-400 p-2 text-right">รวมทั้งสิ้น</td>
                  <td className="border border-slate-400 p-2 text-right font-mono text-emerald-800">{curr(project.budgetAllocated)}</td>
                </tr>
              </tbody>
            </table>

            <p><span className="font-bold">4.3 แผนการดำเนินงานและการใช้จ่ายงบประมาณ<span className="text-red-600">*</span></span></p>
            <table className="w-full border-collapse border border-slate-400 text-xs my-2">
              <thead>
                <tr className="bg-[#F2F2F2] print:bg-[#F2F2F2]">
                  <th className="border border-slate-400 p-2 text-left font-bold">กิจกรรม</th>
                  <th className="border border-slate-400 p-2 w-28 text-center font-bold">ร้อยละของแผน</th>
                  <th className="border border-slate-400 p-2 w-32 text-center font-bold">ช่วงเวลาดำเนินงาน<br />(ระบุเดือน)</th>
                  <th className="border border-slate-400 p-2 w-32 text-right font-bold">งบประมาณที่จะใช้<br />(จำนวนเงิน)</th>
                </tr>
              </thead>
              <tbody>
                {(project.activities || []).map((act, idx) => (
                  <tr key={act.id}>
                    <td className="border border-slate-400 p-2">{num(idx + 1)}. {act.name}</td>
                    <td className="border border-slate-400 p-2 text-center font-bold">{num(act.plannedPercent || 100)}%</td>
                    <td className="border border-slate-400 p-2 text-center">{act.timeframe}</td>
                    <td className="border border-slate-400 p-2 text-right font-mono">{curr(act.plannedBudget)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="border border-slate-400 p-2 text-right">รวม</td>
                  <td className="border border-slate-400 p-2 text-right font-mono text-emerald-800">{curr(project.budgetAllocated)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ส่วนที่ 5 : ผู้รับผิดชอบ/ผู้ประสานงานโครงการ */}
        <div className="mb-4">
          <div className="bg-[#FDE9D9] print:bg-[#FDE9D9] px-3 py-1 text-sm font-bold text-slate-900 print:text-black border-l-4 border-amber-600 mb-3">
            ส่วนที่ 5 : ผู้รับผิดชอบ/ผู้ประสานงานโครงการ
          </div>
          
          <table className="w-full border-collapse border border-slate-400 text-xs my-2">
            <tbody>
              <tr>
                <th className="border border-slate-400 p-2 bg-[#F2F2F2] w-36 text-left font-bold">ชื่อ-นามสกุล</th>
                <td className="border border-slate-400 p-2 font-medium">{project.responsiblePerson?.name || '-'}</td>
              </tr>
              <tr>
                <th className="border border-slate-400 p-2 bg-[#F2F2F2] w-36 text-left font-bold">ตำแหน่ง</th>
                <td className="border border-slate-400 p-2">{project.responsiblePerson?.position || '-'}</td>
              </tr>
              <tr>
                <th className="border border-slate-400 p-2 bg-[#F2F2F2] w-36 text-left font-bold">สังกัด</th>
                <td className="border border-slate-400 p-2">{divisionFullName}</td>
              </tr>
              <tr>
                <th className="border border-slate-400 p-2 bg-[#F2F2F2] w-36 text-left font-bold">กลุ่มงาน</th>
                <td className="border border-slate-400 p-2">{project.subDivision || 'กลุ่มงานที่ได้รับมอบหมาย'}</td>
              </tr>
              <tr>
                <th className="border border-slate-400 p-2 bg-[#F2F2F2] w-36 text-left font-bold">เบอร์โทรศัพท์</th>
                <td className="border border-slate-400 p-2 font-mono">{num(project.responsiblePerson?.phone || '-')}</td>
              </tr>
              <tr>
                <th className="border border-slate-400 p-2 bg-[#F2F2F2] w-36 text-left font-bold">e-Mail</th>
                <td className="border border-slate-400 p-2">{project.responsiblePerson?.email || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
