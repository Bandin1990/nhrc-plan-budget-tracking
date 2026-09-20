import React, { useState } from 'react';
import { Printer, Download, ArrowLeft, ToggleLeft, ToggleRight, ZoomIn, ZoomOut } from 'lucide-react';
import { ProgressReport } from '../../types/progress';
import { NHRC_UNITS } from '../../types/project';
import { toThaiNumerals, fromThaiNumerals, formatCurrency } from '../../utils/thaiNumber';

interface PrintableSnYo3Props {
  report: ProgressReport;
  onBack: () => void;
}

export const PrintableSnYo3: React.FC<PrintableSnYo3Props> = ({ report, onBack }) => {
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

  const divisionName = NHRC_UNITS[report.division]?.fullName || report.section1.divisionFullName || 'สำนักนโยบายและยุทธศาสตร์';

  const totalPlanned = report.section2_1.reduce((sum, a) => sum + (a.plannedBudget || 0), 0);
  const totalActual = report.section2_1.reduce((sum, a) => sum + (a.actualSpent || 0), 0);

  return (
    <div className="space-y-6 pb-24">
      {/* Edge-to-Edge Sticky Top Action Bar (Hidden on print) */}
      <div className="no-print sticky top-0 z-30 bg-[#f3f6f5] dark:bg-slate-950 -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-3 border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#0a4d44] bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                ตัวอย่างก่อนพิมพ์: แบบ สนย.3 ({report.projectCode})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                จัดหน้าตามแบบฟอร์มรายงานผลการปฏิบัติงานและการใช้จ่ายงบประมาณของ กสม.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Thai Numeral Toggle */}
            <button
              onClick={() => setUseThaiNumerals(!useThaiNumerals)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                useThaiNumerals
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-[#0a4d44] dark:text-emerald-300 border-emerald-300'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {useThaiNumerals ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
              <span>{useThaiNumerals ? 'แสดงเลขไทย (๑ ๒ ๓)' : 'แสดงเลขอารบิก (1 2 3)'}</span>
            </button>

            {/* Zoom */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-xs">
              <button
                onClick={() => setScale(Math.max(70, scale - 10))}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white cursor-pointer"
                title="ย่อขนาด"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-bold text-slate-700 dark:text-slate-300">{scale}%</span>
              <button
                onClick={() => setScale(Math.min(130, scale + 10))}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white cursor-pointer"
                title="ขยายขนาด"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#0a4d44] hover:bg-[#083b34] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์แบบรายงาน (Print / Save as PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* A4 Paper Document Container */}
      <div 
        className="mx-auto bg-white text-black shadow-2xl p-8 sm:p-14 transition-all print-container rounded-sm mt-6"
        style={{
          width: '210mm',
          minHeight: '297mm',
          fontFamily: "'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', sans-serif",
          transform: scale !== 100 ? `scale(${scale / 100})` : undefined,
          transformOrigin: 'top center'
        }}
      >
        {/* PAGE 1 */}
        <div className="relative pb-10">
          <div className="text-right text-[15pt] font-bold text-slate-900 mb-2">
            แบบ สนย.{num(3)}
          </div>

          <div className="text-center font-bold text-[16pt] leading-snug mb-6">
            <div>แบบรายงานผลการปฏิบัติงานและการใช้จ่ายงบประมาณ</div>
            <div>โครงการเชิงยุทธศาสตร์และการดำเนินงานตามมติสมัชชาสิทธิมนุษยชน</div>
            <div>ประจำปีงบประมาณ พ.ศ. {num(report.fiscalYear || 2569)}</div>
            <div>{divisionName}</div>
          </div>

          {/* ส่วนที่ 1 */}
          <div className="bg-amber-100/70 p-2 text-[15pt] font-bold border-l-4 border-amber-500 mb-3">
            ส่วนที่ {num(1)} : ข้อมูลพื้นฐานโครงการเชิงยุทธศาสตร์
          </div>

          <div className="text-[15pt] space-y-1.5 pl-2 mb-6">
            <p>
              <span className="font-bold">{num('1.1')} ชื่อโครงการ</span> {report.section1.projectName || report.projectName}
            </p>
            <p>
              <span className="font-bold">{num('1.2')} รหัสกิจกรรม</span> {report.section1.activityCode || report.projectCode}
            </p>
            <p>
              <span className="font-bold">{num('1.3')} งบประมาณที่ได้รับการจัดสรร</span> {curr(report.section1.allocatedBudget)} บาท
            </p>
            <p>
              <span className="font-bold">{num('1.4')} ช่วงเวลาดำเนินงานที่กำหนดในแผน (ระหว่างเดือน)</span> {report.section1.timeframeText}
            </p>
          </div>

          {/* ส่วนที่ 2 */}
          <div className="bg-amber-100/70 p-2 text-[15pt] font-bold border-l-4 border-amber-500 mb-3">
            ส่วนที่ {num(2)} : ผลสัมฤทธิ์จากการดำเนินงาน
          </div>

          <p className="text-[15pt] font-bold pl-2 mb-2">
            {num('2.1')} ผลการดำเนินงานและการใช้จ่ายงบประมาณ
          </p>

          {/* Table 2.1 */}
          <table className="w-full text-[14pt] border-collapse border border-black mb-8">
            <thead>
              <tr className="bg-slate-50 text-center font-bold">
                <th rowSpan={2} className="border border-black p-2 w-[42%]">
                  ขั้นตอน/กิจกรรม<br/>ที่ระบุไว้ในแผนการดำเนินโครงการ
                </th>
                <th colSpan={3} className="border border-black p-1">
                  ผลการดำเนินงาน*
                </th>
                <th rowSpan={2} className="border border-black p-2 w-[16%]">
                  แผนการใช้จ่าย<br/>งบประมาณ<br/>(บาท)
                </th>
                <th rowSpan={2} className="border border-black p-2 w-[18%]">
                  งบประมาณ<br/>เบิกจ่ายจริง<br/>{report.asOfDateText}<br/>(บาท)
                </th>
              </tr>
              <tr className="bg-slate-50 text-center font-bold text-[13pt]">
                <th className="border border-black p-1 w-[8%]">ดำเนินการ<br/>แล้วเสร็จ</th>
                <th className="border border-black p-1 w-[8%]">อยู่ระหว่าง<br/>ดำเนินการ</th>
                <th className="border border-black p-1 w-[8%]">ยังไม่<br/>ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {report.section2_1.map((row, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2 align-top">
                    {row.name}
                  </td>
                  <td className="border border-black p-1 text-center align-top font-bold">
                    {row.status === 'completed' ? '/' : ''}
                  </td>
                  <td className="border border-black p-1 text-center align-top font-bold">
                    {row.status === 'in_progress' ? '/' : ''}
                  </td>
                  <td className="border border-black p-1 text-center align-top font-bold">
                    {row.status === 'not_started' ? '/' : ''}
                  </td>
                  <td className="border border-black p-2 text-right align-top">
                    {curr(row.plannedBudget)}
                  </td>
                  <td className="border border-black p-2 text-right align-top">
                    {row.actualSpent > 0 ? curr(row.actualSpent) : '-'}
                  </td>
                </tr>
              ))}
              <tr className="font-bold bg-slate-50">
                <td colSpan={4} className="border border-black p-2 text-right">
                  รวม
                </td>
                <td className="border border-black p-2 text-right">
                  {curr(totalPlanned)}
                </td>
                <td className="border border-black p-2 text-right">
                  {curr(totalActual)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-center text-[13pt] text-slate-700 absolute bottom-0 left-0 right-0">
            {num(1)}
          </div>
        </div>

        {/* Page Break */}
        <div className="page-break my-8 border-t border-dashed border-slate-300 no-print"></div>

        {/* PAGE 2: 2.2 ผลการดำเนินงานของแต่ละกิจกรรม */}
        <div className="relative pb-10 pt-4">
          <p className="text-[15pt] font-bold pl-2 mb-2">
            {num('2.2')} ผลการดำเนินงาน
          </p>
          <p className="text-[15pt] font-bold pl-2 mb-3">
            ผลการดำเนินงานของแต่ละกิจกรรม :
          </p>

          <div className="space-y-4 pl-2 text-[15pt]">
            {report.section2_2.map((act, idx) => (
              <div key={idx} className="space-y-1">
                <p className="font-bold">
                  {act.activityNumberText} {act.activityTitle}
                </p>
                <p className="pl-4 leading-relaxed text-justify indent-6">
                  {act.detailDescription}
                </p>
                <p className="pl-4">
                  จำนวนกลุ่มเป้าหมายที่เข้าร่วม : แผน {act.targetPlan} ผล {act.targetActual}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center text-[13pt] text-slate-700 absolute bottom-0 left-0 right-0">
            {num(2)}
          </div>
        </div>

        {/* Page Break */}
        <div className="page-break my-8 border-t border-dashed border-slate-300 no-print"></div>

        {/* PAGE 3-5: 2.3 ผลการดำเนินการตามวัตถุประสงค์ และตัวชี้วัดความสำเร็จ */}
        <div className="relative pb-10 pt-4">
          <p className="text-[15pt] font-bold pl-2 mb-3">
            {num('2.3')} ผลการดำเนินการตามวัตถุประสงค์ และผลสัมฤทธิ์เปรียบเทียบกับเป้าหมาย (ผลผลิต/ผลลัพธ์) ผลที่คาดว่าจะได้รับ และตัวชี้วัดความสำเร็จ
          </p>

          <table className="w-full text-[14pt] border-collapse border border-black mb-6">
            <thead>
              <tr className="bg-slate-50 text-center font-bold">
                <th className="border border-black p-2 w-[45%]">
                  วัตถุประสงค์ เป้าหมาย (ผลผลิต/ผลลัพธ์)<br/>
                  ผลที่คาดว่าจะได้รับ และตัวชี้วัดความสำเร็จ
                </th>
                <th className="border border-black p-2 w-[55%]">
                  ความก้าวหน้าผลการดำเนินงานตามวัตถุประสงค์<br/>
                  เป้าหมาย (ผลผลิต/ผลลัพธ์) ผลที่คาดว่าจะได้รับ<br/>
                  และตัวชี้วัดความสำเร็จ
                </th>
              </tr>
            </thead>
            <tbody>
              {report.section2_3.map((objRow, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-3 align-top">
                    <p className="font-bold underline mb-1">{objRow.label}</p>
                    <p className="whitespace-pre-line leading-relaxed">{objRow.targetText}</p>
                  </td>
                  <td className="border border-black p-3 align-top whitespace-pre-line leading-relaxed text-justify">
                    {objRow.progressText}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ส่วนที่ 3 : การดำเนินงานตามนโยบายของ กสม. */}
          <div className="bg-amber-100/70 p-2 text-[15pt] font-bold border-l-4 border-amber-500 mb-3 mt-6">
            ส่วนที่ {num(3)} : การดำเนินงานตามนโยบายของ กสม.
          </div>

          <table className="w-full text-[14pt] border-collapse border border-black mb-6">
            <thead>
              <tr className="bg-slate-50 text-center font-bold">
                <th className="border border-black p-2 w-[45%]">นโยบายของ กสม. พ.ศ. {num(2567)}</th>
                <th className="border border-black p-2 w-[55%]">ความก้าวหน้าผลการดำเนินงาน/ผลสัมฤทธิ์</th>
              </tr>
            </thead>
            <tbody>
              {report.section3.map((pol, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-3 align-top whitespace-pre-line leading-relaxed">
                    {pol.policyTitle}
                  </td>
                  <td className="border border-black p-3 align-top whitespace-pre-line leading-relaxed text-justify">
                    {pol.progressDescription}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ส่วนที่ 4 / 5 : ปัญหาอุปสรรค และแนวทางการแก้ไข */}
          <div className="bg-amber-100/70 p-2 text-[15pt] font-bold border-l-4 border-amber-500 mb-3 mt-6">
            ส่วนที่ {num(4)} / {num(5)} : ปัญหาอุปสรรค หรือข้อจำกัด และแนวทางการแก้ไข หรือข้อเสนอแนะ
          </div>

          <table className="w-full text-[14pt] border-collapse border border-black mb-6">
            <thead>
              <tr className="bg-slate-50 text-center font-bold">
                <th className="border border-black p-2 w-[50%]">ปัญหาอุปสรรค หรือข้อจำกัด</th>
                <th className="border border-black p-2 w-[50%]">แนวทางการแก้ไข หรือข้อเสนอแนะ</th>
              </tr>
            </thead>
            <tbody>
              {report.section4_5.map((obs, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-3 align-top leading-relaxed">
                    {obs.obstacle || '-'}
                  </td>
                  <td className="border border-black p-3 align-top leading-relaxed">
                    {obs.solution || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ส่วนที่ 6 : ผู้รับผิดชอบ/ผู้ประสานงาน */}
          <div className="bg-amber-100/70 p-2 text-[15pt] font-bold border-l-4 border-amber-500 mb-3 mt-6">
            ส่วนที่ {num(6)} : ผู้รับผิดชอบ/ผู้ประสานงาน
          </div>

          <table className="w-full text-[14pt] border-collapse border border-black mb-8 max-w-lg">
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold w-[35%]">ชื่อ-นามสกุล</td>
                <td className="border border-black p-2">{report.section6.name}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">ตำแหน่ง</td>
                <td className="border border-black p-2">{report.section6.position}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">สังกัด</td>
                <td className="border border-black p-2">
                  {report.section6.subDivision ? `${report.section6.subDivision} ` : ''}
                  {NHRC_UNITS[report.section6.division]?.fullName || report.section6.division}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">เบอร์โทรศัพท์</td>
                <td className="border border-black p-2">{num(report.section6.phone)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">e-Mail</td>
                <td className="border border-black p-2 font-mono">{report.section6.email}</td>
              </tr>
            </tbody>
          </table>

          <div className="text-center text-[13pt] text-slate-700 absolute bottom-0 left-0 right-0">
            {num(3)}
          </div>
        </div>
      </div>
    </div>
  );
};
