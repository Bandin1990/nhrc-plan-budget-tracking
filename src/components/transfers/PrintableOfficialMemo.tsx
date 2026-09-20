import React, { useState } from 'react';
import { Printer, ArrowLeft, ToggleLeft, ToggleRight, ZoomIn, ZoomOut, CheckCircle } from 'lucide-react';
import { OfficialMemoData } from '../../types/budget';
import { GarudaEmblem } from '../common/GarudaEmblem';
import { toThaiNumerals, fromThaiNumerals, formatCurrency, thaiBahtText, formatMemoBookNumber, getMemoDisplayDate } from '../../utils/thaiNumber';

interface PrintableOfficialMemoProps {
  memo: OfficialMemoData;
  onBack: () => void;
}

export const PrintableOfficialMemo: React.FC<PrintableOfficialMemoProps> = ({ memo, onBack }) => {
  // Default to Arabic numbers across system, but allow 1-click toggle to Thai numbers for official print
  const [useThaiNumerals, setUseThaiNumerals] = useState<boolean>(memo.useThaiNumerals ?? false);
  const [scale, setScale] = useState(100);

  const num = (val: string | number | undefined | null): string => {
    if (val === null || val === undefined) return '';
    const str = val.toString();
    return useThaiNumerals ? toThaiNumerals(str) : fromThaiNumerals(str);
  };

  const curr = (val: number): string => {
    return formatCurrency(val, useThaiNumerals);
  };

  const handlePrint = () => {
    window.print();
  };

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
                ตัวอย่างก่อนพิมพ์: บันทึกข้อความขออนุมัติโอนเปลี่ยนแปลงงบประมาณ ({num(memo.bookNumber)})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                แบบเอกสารบันทึกข้อความตราครุฑ สำนักงาน กสม. (ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ)
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
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {useThaiNumerals ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
              <span>{useThaiNumerals ? 'กำลังใช้เลขไทย (๑ ๒ ๓)' : 'กำลังใช้เลขอารบิก (1 2 3)'}</span>
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
              <span>พิมพ์บันทึกข้อความ (Print / PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* A4 Paper Container */}
      <div 
        className="mt-6 mx-auto bg-white text-black shadow-2xl p-10 sm:p-14 transition-all print-container rounded-sm"
        style={{
          width: '210mm',
          minHeight: '297mm',
          fontFamily: "'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', sans-serif",
          transform: scale !== 100 ? `scale(${scale / 100})` : undefined,
          transformOrigin: 'top center'
        }}
      >
        {/* PAGE 1 */}
        <div className="relative pb-8 text-[16pt] leading-[1.35]">
          {/* Official Memo Header with Garuda Emblem */}
          <div className="relative mb-4 flex items-end">
            <div className="w-28 shrink-0">
              <GarudaEmblem size={65} />
            </div>
            <div className="flex-1 text-center pr-28">
              <h1 className="text-[29pt] font-bold tracking-tight text-black leading-none">
                บันทึกข้อความ
              </h1>
            </div>
          </div>

          {/* Government Meta Headers */}
          <div className="space-y-1 text-[16pt] border-b border-black pb-2 mb-3">
            <p>
              <strong className="font-bold">ส่วนราชการ</strong> {memo.divisionFullName} {memo.subDivisionName} โทร. {num(memo.telNumber)}
            </p>
            <div className="flex justify-between">
              <p>
                <strong className="font-bold">ที่</strong> {formatMemoBookNumber(memo.bookNumber)}
              </p>
              <p>
                <strong className="font-bold">วันที่</strong> {num(getMemoDisplayDate(memo))}
              </p>
            </div>
            <p>
              <strong className="font-bold">เรื่อง</strong> {num(memo.subject)}
            </p>
          </div>

          {/* Recipient */}
          <div className="text-[16pt] mb-3">
            <p>
              <strong className="font-bold">เรียน</strong> {memo.toRecipient}
            </p>
          </div>

          {/* 1. เรื่องเดิม */}
          <div className="text-[16pt] leading-relaxed text-justify mb-3">
            <p className="indent-8">
              <strong className="font-bold">{num(1)}. เรื่องเดิม</strong>
            </p>
            <p className="indent-8 text-justify">
              {num(memo.section1_OriginalStory)}
            </p>
          </div>

          {/* 2. ข้อเท็จจริง */}
          <div className="text-[16pt] leading-relaxed text-justify mb-3 space-y-2">
            <p className="indent-8">
              <strong className="font-bold">{num(2)}. ข้อเท็จจริง</strong>
            </p>
            <p className="indent-8 text-justify">
              <strong className="font-bold">{num('2.1')}</strong> {num(memo.section2_Facts.agencyRequest)}
            </p>
            <p className="indent-8 text-justify">
              <strong className="font-bold">{num('2.2')}</strong> {num(memo.section2_Facts.investigation)}
            </p>
            <p className="indent-8 text-justify">
              <strong className="font-bold">{num('2.3')}</strong> {num(memo.section2_Facts.savingsSource)}
            </p>
          </div>

          <div className="text-right text-[13pt] text-slate-500 pt-4">
            /{num(3)}. ระเบียบ...
          </div>
        </div>

        {/* Page Break */}
        <div className="page-break my-8 border-t border-dashed border-slate-300 no-print"></div>

        {/* PAGE 2 */}
        <div className="relative pt-4 pb-8 text-[16pt] leading-[1.35]">
          <div className="text-center text-[14pt] text-slate-700 mb-2">
            - {num(2)} -
          </div>

          {/* 3. ระเบียบที่เกี่ยวข้อง */}
          <div className="text-[16pt] leading-relaxed text-justify mb-4">
            <p className="indent-8">
              <strong className="font-bold">{num(3)}. ระเบียบที่เกี่ยวข้อง</strong>
            </p>
            <p className="indent-8 text-justify">
              {num(memo.section3_LegalReference)}
            </p>
          </div>

          {/* 4. ข้อเสนอเพื่อพิจารณา */}
          <div className="text-[16pt] leading-relaxed text-justify mb-3">
            <p className="indent-8">
              <strong className="font-bold">{num(4)}. ข้อเสนอเพื่อพิจารณา</strong>
            </p>
            <p className="indent-8 text-justify">
              {num(memo.section4_Proposal)}
            </p>
          </div>

          {/* 7-Column Budget Transfer Table (Official NHRC Reallocation Structure) */}
          <div className="my-4">
            <table className="w-full text-[13pt] border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-black p-2 w-[24%]">รายการ</th>
                  <th className="border border-black p-2 w-[16%]">รหัสกิจกรรม</th>
                  <th className="border border-black p-2 w-[12%]">งบประมาณ<br/>(เดิม)</th>
                  <th className="border border-black p-2 w-[12%]">โอนออก /<br/>รับโอน</th>
                  <th className="border border-black p-2 w-[12%]">งบประมาณ<br/>(ใหม่)</th>
                  <th className="border border-black p-2 w-[12%]">ผลเบิกจ่าย+ก่อหนี้<br/>{num(memo.asOfDateText)}</th>
                  <th className="border border-black p-2 w-[12%]">คงเหลือใช้จ่าย</th>
                </tr>
              </thead>
              <tbody>
                {memo.tableRows.map((row, idx) => {
                  const isSource = row.itemType === 'source';
                  return (
                    <tr key={idx} className={isSource ? 'bg-white' : 'bg-emerald-50/20'}>
                      <td className="border border-black p-2 align-top">
                        <span className="font-semibold">{num(row.itemDescription)}</span>
                      </td>
                      <td className="border border-black p-2 align-top text-center">
                        {num(row.activityCode)}
                      </td>
                      <td className="border border-black p-2 align-top text-right">
                        {curr(row.budgetOriginal)}
                      </td>
                      <td className={`border border-black p-2 align-top text-right font-bold ${row.transferAmount < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                        {row.transferAmount < 0 ? `- ${curr(Math.abs(row.transferAmount))}` : `+ ${curr(row.transferAmount)}`}
                      </td>
                      <td className="border border-black p-2 align-top text-right font-bold">
                        {curr(row.budgetNew)}
                      </td>
                      <td className="border border-black p-2 align-top text-right">
                        {curr(row.actualDisbursedAndCommitted)}
                      </td>
                      <td className="border border-black p-2 align-top text-right font-bold">
                        {curr(row.remainingBalance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="indent-8 text-[16pt] mt-4 mb-6">
            จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ
          </p>

          {/* Proposer Signature */}
          <div className="flex justify-end text-[16pt] pt-8">
            <div className="text-center w-72">
              <div className="h-16"></div>
              <p className="font-bold">({memo.proposerName})</p>
              <p className="text-[14pt] text-slate-700 mt-1">{memo.proposerPosition}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
