import React, { useState } from 'react';
import { Printer, Download, ArrowLeft, ToggleLeft, ToggleRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Project, NHRC_UNITS, BUDGET_PROGRAMS } from '../../types/project';
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

  const handleExportWord = () => {
    const numFmt = (val: string | number | undefined | null) => {
      if (val === null || val === undefined) return '';
      const str = val.toString();
      return useThaiNumerals ? toThaiNumerals(str) : fromThaiNumerals(str);
    };

    const currFmt = (val: number) => formatCurrency(val, useThaiNumerals);

    const unitInfo = NHRC_UNITS[project.division];
    const divisionFullName = unitInfo ? unitInfo.fullName : project.division;
    const s2 = project.strategicSection2;
    const pillarNum = s2?.nhrcStrategicPillar || project.strategicPillar || 1;
    const pillarFullName = NHRC_STRATEGIC_PILLARS_FULL[pillarNum] || `ยุทธศาสตร์ที่ ${pillarNum}`;

    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>แบบรายละเอียดโครงการ (${project.code})</title>
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
          body { font-family: 'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', sans-serif; font-size: 15pt; line-height: 1.3; }
          .title { text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 12pt; }
          .header-right { text-align: right; font-size: 14pt; font-weight: bold; margin-bottom: 8pt; }
          .section-title { font-size: 15pt; font-weight: bold; background-color: #e2e8f0; padding: 4pt 6pt; border-left: 4pt solid #0a4d44; margin-top: 14pt; margin-bottom: 6pt; }
          .sub-section-title { font-size: 14.5pt; font-weight: bold; color: #0a4d44; margin-top: 8pt; margin-bottom: 4pt; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; font-size: 14pt; }
          th, td { border: 1pt solid #000; padding: 4pt 6pt; vertical-align: top; }
          th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          ul, ol { margin-top: 2pt; margin-bottom: 6pt; padding-left: 20pt; }
          li { margin-bottom: 2pt; }
          .signature-box { margin-top: 24pt; width: 100%; }
          .signature-col { width: 50%; float: left; text-align: center; font-size: 14pt; }
          .clear { clear: both; }
        </style>
      </head>
      <body>
        <div class="header-right">แบบเสนอโครงการ / แผนปฏิบัติงาน</div>
        <div class="title">
          <div>แบบเสนอโครงการและรายละเอียดแผนปฏิบัติงานและการใช้จ่ายงบประมาณ</div>
          <div>ประจำปีงบประมาณ พ.ศ. ${numFmt(project.fiscalYear)}</div>
          <div>${divisionFullName} สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ</div>
        </div>

        <!-- ส่วนที่ 1 -->
        <div class="section-title">ส่วนที่ ${numFmt(1)} : ข้อมูลพื้นฐานโครงการ</div>
        <p><b>${numFmt('1.1')} ชื่อโครงการ:</b> ${project.name}</p>
        <p><b>${numFmt('1.2')} รหัสโครงการ/กิจกรรม:</b> ${project.code}</p>
        <p><b>${numFmt('1.3')} หน่วยงานรับผิดชอบ:</b> ${divisionFullName} (${project.subDivision || 'กลุ่มงานที่ได้รับมอบหมาย'})</p>
        <p><b>${numFmt('1.4')} ผู้รับผิดชอบโครงการ:</b> ${project.responsiblePerson?.name || '-'} ตำแหน่ง: ${project.responsiblePerson?.position || '-'} โทรศัพท์: ${numFmt(project.responsiblePerson?.phone || '-')} อีเมล: ${project.responsiblePerson?.email || '-'}</p>
        <p><b>${numFmt('1.5')} แผนงานงบประมาณ:</b> ${BUDGET_PROGRAMS[project.programCode]?.name || project.programCode}</p>
        <p><b>${numFmt('1.6')} ประเภทงบประมาณ:</b> ${project.budgetCategory || 'งบดำเนินงาน'} | <b>แหล่งงบประมาณ:</b> ${project.budgetSource || 'งบประมาณแผ่นดินรายจ่ายประจำปี พ.ศ. ' + numFmt(project.fiscalYear)}</p>
        <p><b>${numFmt('1.7')} วิธีการดำเนินงาน:</b> ${project.operationMethod || 'ดำเนินการเอง'}</p>
        <p><b>${numFmt('1.8')} งบประมาณที่ได้รับจัดสรร:</b> <b style="color:#0a4d44;">${currFmt(project.budgetAllocated)}</b> บาท</p>

        <!-- ส่วนที่ 2 -->
        <div class="section-title">ส่วนที่ ${numFmt(2)} : ความเชื่อมโยงยุทธศาสตร์ชาติและแผนระดับต่างๆ</div>
        <p><b>${numFmt('2.1')} ยุทธศาสตร์ชาติ:</b> ${s2?.nationalStrategyPillar || project.nationalStrategy || '-'}</p>
        <p style="margin-left: 15pt;">- <b>ประเด็น:</b> ${s2?.nationalStrategyIssue || '-'}</p>
        <p style="margin-left: 15pt;">- <b>เป้าหมาย:</b> ${s2?.nationalStrategyTarget || '-'}</p>
        
        <p><b>${numFmt('2.2')} แผนแม่บทภายใต้ยุทธศาสตร์ชาติ:</b> ${s2?.masterPlanSubPlan || project.masterPlan || '-'}</p>
        <p style="margin-left: 15pt;">- <b>เป้าหมายแผนย่อย:</b> ${s2?.masterPlanSubTarget || '-'}</p>
        
        <p><b>${numFmt('2.3')} แผนการปฏิรูปประเทศ:</b> ${s2?.nationalReformPlan || '-'}</p>
        <p><b>${numFmt('2.4')} แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ (ฉบับที่ ${numFmt(13)}):</b> ${s2?.economicDevPlanMilestone || '-'}</p>
        <p><b>${numFmt('2.5')} แผนระดับที่ ${numFmt(3)} ที่เกี่ยวข้อง:</b> ${s2?.level3Plan || project.relatedPlans || '-'}</p>
        <p><b>${numFmt('2.6')} ยุทธศาสตร์ กสม.:</b> ${pillarFullName}</p>
        <p style="margin-left: 15pt;">- <b>ประเด็นยุทธศาสตร์:</b> ${s2?.nhrcStrategicIssue || '-'}</p>
        <p><b>${numFmt('2.7')} กฎหมายที่เกี่ยวข้อง:</b> ${s2?.relatedLaws || '-'}</p>

        <!-- ส่วนที่ 3 -->
        <div class="section-title">ส่วนที่ ${numFmt(3)} : รายละเอียดโครงการ</div>
        <div class="sub-section-title">${numFmt('3.1')} หลักการและเหตุผล</div>
        <p>${project.rationale || '-'}</p>

        <div class="sub-section-title">${numFmt('3.2')} วัตถุประสงค์ของโครงการ</div>
        <ol>
          ${(project.objectives || []).map(o => `<li>${o}</li>`).join('')}
        </ol>

        <p><b>${numFmt('3.3')} กลุ่มเป้าหมาย:</b> ${project.targetGroup || '-'}</p>
        <p><b>${numFmt('3.4')} พื้นที่ดำเนินงาน:</b> ${project.targetArea || '-'}</p>
        <p><b>${numFmt('3.5')} ระยะเวลาดำเนินโครงการ:</b> ${project.timeframeText || '-'}</p>

        <div class="sub-section-title">${numFmt('3.6')} ผลผลิตของโครงการ (Outputs)</div>
        <ul>
          ${(project.expectedOutputs || []).map(o => `<li>${o}</li>`).join('')}
        </ul>

        <div class="sub-section-title">${numFmt('3.7')} ผลลัพธ์และผลที่คาดว่าจะได้รับ (Outcomes & Benefits)</div>
        <ul>
          ${(project.expectedOutcomes || []).concat(project.expectedBenefits || []).map(o => `<li>${o}</li>`).join('')}
        </ul>

        <div class="sub-section-title">${numFmt('3.8')} ตัวชี้วัดความสำเร็จของโครงการ (KPIs)</div>
        <table>
          <thead>
            <tr>
              <th style="width:10%;">ลำดับ</th>
              <th style="width:60%;">ตัวชี้วัดความสำเร็จ</th>
              <th style="width:30%;">เป้าหมาย</th>
            </tr>
          </thead>
          <tbody>
            ${(project.indicators || []).map((ind, idx) => `
              <tr>
                <td class="text-center">${numFmt(idx + 1)}</td>
                <td>${ind.title}</td>
                <td class="text-center bold">${ind.target}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="sub-section-title">${numFmt('3.9')} กิจกรรมการดำเนินงาน</div>
        <table>
          <thead>
            <tr>
              <th style="width:10%;">รหัส</th>
              <th style="width:45%;">ชื่อกิจกรรม</th>
              <th style="width:25%;">ระยะเวลา</th>
              <th style="width:20%;">งบประมาณ (บาท)</th>
            </tr>
          </thead>
          <tbody>
            ${(project.activities || []).map(act => `
              <tr>
                <td class="text-center">${act.code || '-'}</td>
                <td>${act.name}</td>
                <td class="text-center">${act.timeframe}</td>
                <td class="text-right bold">${currFmt(act.plannedBudget)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- ส่วนที่ 4 -->
        <div class="section-title">ส่วนที่ ${numFmt(4)} : แผนการดำเนินงานและการใช้จ่ายงบประมาณ</div>
        <p><b>งบประมาณจัดสรรรวมทั้งสิ้น:</b> <b style="color:#0a4d44;">${currFmt(project.budgetAllocated)}</b> บาท</p>
        
        ${project.monthlyBudgetPlan && project.monthlyBudgetPlan.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>เดือน</th>
                <th>แผนปฏิบัติการ</th>
                <th>แผนงบประมาณ (บาท)</th>
              </tr>
            </thead>
            <tbody>
              ${project.monthlyBudgetPlan.map(m => `
                <tr>
                  <td class="text-center bold">${m.monthName}</td>
                  <td>${m.operationMilestone || '-'}</td>
                  <td class="text-right">${currFmt(m.plannedSpent)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>- กำหนดแผนการดำเนินงานตามไตรมาสและรายเดือน -</p>'}

        <!-- ส่วนที่ 5 -->
        <div class="section-title">ส่วนที่ ${numFmt(5)} : การลงนามรับรองเสนอโครงการ</div>
        <div class="signature-box">
          <div class="signature-col">
            <p>ลงชื่อ..........................................................</p>
            <p>(${project.responsiblePerson?.name || '..........................................................'})</p>
            <p>ตำแหน่ง ${project.responsiblePerson?.position || 'ผู้รับผิดชอบโครงการ'}</p>
            <p>วันที่ .......... / .................... / ..........</p>
          </div>
          <div class="signature-col">
            <p>ลงชื่อ..........................................................</p>
            <p>(..........................................................)</p>
            <p>ผู้อำนวยการ${divisionFullName}</p>
            <p>วันที่ .......... / .................... / ..........</p>
          </div>
          <div class="clear"></div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `แบบรายละเอียดโครงการ_${project.code}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const unitInfo = NHRC_UNITS[project.division];
  const divisionFullName = unitInfo ? unitInfo.fullName : project.division;
  const s2 = project.strategicSection2;
  const pillarNum = s2?.nhrcStrategicPillar || project.strategicPillar || 1;
  const pillarFullName = NHRC_STRATEGIC_PILLARS_FULL[pillarNum] || `ยุทธศาสตร์ที่ ${pillarNum}`;

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
            แบบฟอร์มรายละเอียดโครงการ ({project.code})
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

      {/* Printable Sheet View */}
      <div 
        className="w-full max-w-4xl bg-white text-slate-900 shadow-2xl p-8 sm:p-12 mb-8 print:p-0 print:m-0 print:shadow-none print:w-full print:max-w-none print:text-black"
        style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top center' }}
      >
        {/* Document Header */}
        <div className="text-right text-xs font-bold text-slate-500 print:text-black mb-2">
          แบบฟอร์มรายละเอียดแผนปฏิบัติงานและการใช้จ่ายงบประมาณโครงการ
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 print:text-black mb-1">
            แบบเสนอโครงการและรายละเอียดแผนปฏิบัติงานและการใช้จ่ายงบประมาณ
          </h2>
          <h3 className="text-base font-semibold text-slate-800 print:text-black">
            ประจำปีงบประมาณ พ.ศ. {num(project.fiscalYear)}
          </h3>
          <p className="text-sm font-medium text-slate-600 print:text-black">
            {divisionFullName} สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ
          </p>
        </div>

        {/* Section 1 */}
        <div className="mb-6">
          <h4 className="text-sm font-bold bg-slate-100 print:bg-slate-200 border-l-4 border-[#0a4d44] p-2 text-slate-900 print:text-black mb-3">
            ส่วนที่ {num(1)} : ข้อมูลพื้นฐานโครงการ
          </h4>
          <div className="space-y-2 text-xs leading-relaxed text-slate-800 print:text-black pl-2">
            <p><span className="font-bold">{num('1.1')} ชื่อโครงการ:</span> {project.name}</p>
            <p><span className="font-bold">{num('1.2')} รหัสโครงการ/กิจกรรม:</span> {project.code}</p>
            <p><span className="font-bold">{num('1.3')} หน่วยงานรับผิดชอบ:</span> {divisionFullName} ({project.subDivision || 'กลุ่มงานที่ได้รับมอบหมาย'})</p>
            <p><span className="font-bold">{num('1.4')} ผู้รับผิดชอบโครงการ:</span> {project.responsiblePerson?.name || '-'} | ตำแหน่ง: {project.responsiblePerson?.position || '-'} | โทร: {num(project.responsiblePerson?.phone || '-')} | อีเมล: {project.responsiblePerson?.email || '-'}</p>
            <p><span className="font-bold">{num('1.5')} แผนงานงบประมาณ:</span> {BUDGET_PROGRAMS[project.programCode]?.name || project.programCode}</p>
            <p><span className="font-bold">{num('1.6')} ประเภทงบประมาณ:</span> {project.budgetCategory || 'งบดำเนินงาน'} | <span className="font-bold">แหล่งงบประมาณ:</span> {project.budgetSource || 'งบประมาณแผ่นดินรายจ่ายประจำปี พ.ศ. ' + num(project.fiscalYear)}</p>
            <p><span className="font-bold">{num('1.7')} วิธีการดำเนินงาน:</span> {project.operationMethod || 'ดำเนินการเอง'}</p>
            <p><span className="font-bold">{num('1.8')} งบประมาณที่ได้รับจัดสรร:</span> <strong className="text-[#0a4d44] print:text-black font-bold text-sm">{curr(project.budgetAllocated)}</strong> บาท</p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mb-6">
          <h4 className="text-sm font-bold bg-slate-100 print:bg-slate-200 border-l-4 border-[#0a4d44] p-2 text-slate-900 print:text-black mb-3">
            ส่วนที่ {num(2)} : ความเชื่อมโยงยุทธศาสตร์ชาติและแผนระดับต่างๆ
          </h4>
          <div className="space-y-2 text-xs leading-relaxed text-slate-800 print:text-black pl-2">
            <p><span className="font-bold">{num('2.1')} ยุทธศาสตร์ชาติ:</span> {s2?.nationalStrategyPillar || project.nationalStrategy || '-'}</p>
            <p className="pl-4 text-slate-700 print:text-black">• <span className="font-semibold">ประเด็น:</span> {s2?.nationalStrategyIssue || '-'}</p>
            <p className="pl-4 text-slate-700 print:text-black">• <span className="font-semibold">เป้าหมาย:</span> {s2?.nationalStrategyTarget || '-'}</p>

            <p className="pt-1"><span className="font-bold">{num('2.2')} แผนแม่บทภายใต้ยุทธศาสตร์ชาติ:</span> {s2?.masterPlanSubPlan || project.masterPlan || '-'}</p>
            <p className="pl-4 text-slate-700 print:text-black">• <span className="font-semibold">เป้าหมายแผนย่อย:</span> {s2?.masterPlanSubTarget || '-'}</p>

            <p className="pt-1"><span className="font-bold">{num('2.3')} แผนการปฏิรูปประเทศ:</span> {s2?.nationalReformPlan || '-'}</p>
            <p><span className="font-bold">{num('2.4')} แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ (ฉบับที่ {num(13)}):</span> {s2?.economicDevPlanMilestone || '-'}</p>
            <p><span className="font-bold">{num('2.5')} แผนระดับที่ {num(3)} ที่เกี่ยวข้อง:</span> {s2?.level3Plan || project.relatedPlans || '-'}</p>
            <p><span className="font-bold">{num('2.6')} ยุทธศาสตร์ กสม.:</span> {pillarFullName}</p>
            <p className="pl-4 text-slate-700 print:text-black">• <span className="font-semibold">ประเด็นยุทธศาสตร์:</span> {s2?.nhrcStrategicIssue || '-'}</p>
            <p><span className="font-bold">{num('2.7')} กฎหมายที่เกี่ยวข้อง:</span> {s2?.relatedLaws || '-'}</p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="mb-6">
          <h4 className="text-sm font-bold bg-slate-100 print:bg-slate-200 border-l-4 border-[#0a4d44] p-2 text-slate-900 print:text-black mb-3">
            ส่วนที่ {num(3)} : รายละเอียดโครงการ
          </h4>
          <div className="space-y-4 text-xs leading-relaxed text-slate-800 print:text-black pl-2">
            <div>
              <h5 className="font-bold text-slate-900 print:text-black mb-1">{num('3.1')} หลักการและเหตุผล</h5>
              <p className="whitespace-pre-line text-slate-700 print:text-black">{project.rationale || '-'}</p>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 print:text-black mb-1">{num('3.2')} วัตถุประสงค์ของโครงการ</h5>
              <ol className="list-decimal pl-5 space-y-1">
                {(project.objectives || []).map((o, idx) => (
                  <li key={idx}>{o}</li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 print:bg-white p-3 rounded-lg border border-slate-200">
              <p><span className="font-bold">{num('3.3')} กลุ่มเป้าหมาย:</span> {project.targetGroup || '-'}</p>
              <p><span className="font-bold">{num('3.4')} พื้นที่ดำเนินงาน:</span> {project.targetArea || '-'}</p>
              <p><span className="font-bold">{num('3.5')} ระยะเวลาดำเนินงาน:</span> {project.timeframeText || '-'}</p>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 print:text-black mb-1">{num('3.6')} ผลผลิตของโครงการ (Outputs)</h5>
              <ul className="list-disc pl-5 space-y-1">
                {(project.expectedOutputs || []).map((o, idx) => (
                  <li key={idx}>{o}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 print:text-black mb-1">{num('3.7')} ผลลัพธ์และผลที่คาดว่าจะได้รับ (Outcomes & Benefits)</h5>
              <ul className="list-disc pl-5 space-y-1">
                {(project.expectedOutcomes || []).concat(project.expectedBenefits || []).map((o, idx) => (
                  <li key={idx}>{o}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 print:text-black mb-1.5">{num('3.8')} ตัวชี้วัดความสำเร็จของโครงการ (KPIs)</h5>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200 border-b border-slate-300">
                    <th className="border border-slate-300 p-2 w-12 text-center">ลำดับ</th>
                    <th className="border border-slate-300 p-2 text-left">ตัวชี้วัดความสำเร็จ</th>
                    <th className="border border-slate-300 p-2 w-32 text-center">เป้าหมาย</th>
                  </tr>
                </thead>
                <tbody>
                  {(project.indicators || []).map((ind, idx) => (
                    <tr key={ind.id || idx} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 text-center">{num(idx + 1)}</td>
                      <td className="border border-slate-300 p-2">{ind.title}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{ind.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 print:text-black mb-1.5">{num('3.9')} กิจกรรมการดำเนินงาน</h5>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200 border-b border-slate-300">
                    <th className="border border-slate-300 p-1.5 w-14 text-center">รหัส</th>
                    <th className="border border-slate-300 p-1.5 text-left">ชื่อกิจกรรม</th>
                    <th className="border border-slate-300 p-1.5 w-36 text-center">ระยะเวลา</th>
                    <th className="border border-slate-300 p-1.5 w-28 text-right">งบประมาณ (บาท)</th>
                  </tr>
                </thead>
                <tbody>
                  {(project.activities || []).map((act) => (
                    <tr key={act.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-1.5 text-center">{act.code || '-'}</td>
                      <td className="border border-slate-300 p-1.5">{act.name}</td>
                      <td className="border border-slate-300 p-1.5 text-center">{act.timeframe}</td>
                      <td className="border border-slate-300 p-1.5 text-right font-semibold">{curr(act.plannedBudget)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="mb-6">
          <h4 className="text-sm font-bold bg-slate-100 print:bg-slate-200 border-l-4 border-[#0a4d44] p-2 text-slate-900 print:text-black mb-3">
            ส่วนที่ {num(4)} : แผนการดำเนินงานและการใช้จ่ายงบประมาณ
          </h4>
          <div className="text-xs space-y-2 text-slate-800 print:text-black pl-2">
            <p><span className="font-bold">งบประมาณจัดสรรรวมทั้งสิ้น:</span> <strong className="text-[#0a4d44] print:text-black font-bold text-sm">{curr(project.budgetAllocated)}</strong> บาท</p>
            {project.monthlyBudgetPlan && project.monthlyBudgetPlan.length > 0 && (
              <table className="w-full border-collapse border border-slate-300 text-xs mt-2">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200">
                    <th className="border border-slate-300 p-1.5 w-20 text-center">เดือน</th>
                    <th className="border border-slate-300 p-1.5 text-left">แผนการดำเนินงาน/หมุดหมายประจำเดือน</th>
                    <th className="border border-slate-300 p-1.5 w-32 text-right">แผนงบประมาณ (บาท)</th>
                  </tr>
                </thead>
                <tbody>
                  {project.monthlyBudgetPlan.map((m) => (
                    <tr key={m.month}>
                      <td className="border border-slate-300 p-1.5 text-center font-bold">{m.monthName}</td>
                      <td className="border border-slate-300 p-1.5">{m.operationMilestone || '-'}</td>
                      <td className="border border-slate-300 p-1.5 text-right">{curr(m.plannedSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Section 5: Signatures */}
        <div className="mt-12 pt-6 border-t border-slate-200 print:border-black text-xs">
          <div className="grid grid-cols-2 gap-8 text-center">
            <div className="space-y-8">
              <p className="font-bold">ผู้เสนอโครงการ / ผู้รับผิดชอบโครงการ</p>
              <div className="space-y-1">
                <p>ลงชื่อ..........................................................</p>
                <p>({project.responsiblePerson?.name || '..........................................................'})</p>
                <p className="text-slate-600 print:text-black">ตำแหน่ง {project.responsiblePerson?.position || 'นักวิชาการสิทธิมนุษยชน'}</p>
                <p>วันที่ .......... / .................... / ..........</p>
              </div>
            </div>

            <div className="space-y-8">
              <p className="font-bold">ผู้เห็นชอบ / ผู้อำนวยการหน่วยงาน</p>
              <div className="space-y-1">
                <p>ลงชื่อ..........................................................</p>
                <p>(..........................................................)</p>
                <p className="text-slate-600 print:text-black">ผู้อำนวยการ{divisionFullName}</p>
                <p>วันที่ .......... / .................... / ..........</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
