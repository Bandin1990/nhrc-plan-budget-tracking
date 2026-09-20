import React, { useState, useMemo } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, ArrowRight, Printer, 
  Download, Copy, Scale, Check, Building2, Sparkles, 
  Coins, FileText, Ban, CheckCircle 
} from 'lucide-react';
import { Project, NHRC_UNITS } from '../../types/project';
import { OfficialMemoData, TransferBudgetItem } from '../../types/budget';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, thaiBahtText, toThaiNumerals, getTodayThaiDate, formatMemoBookNumber } from '../../utils/thaiNumber';
import { GarudaEmblem } from '../common/GarudaEmblem';
import { generateWordDocument } from '../../utils/wordExport';
import confetti from 'canvas-confetti';

interface BudgetReturnModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (memo: OfficialMemoData) => void;
}

export const BudgetReturnModal: React.FC<BudgetReturnModalProps> = ({
  project,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { updateProject, addOfficialMemo } = useProjects();
  const { currentUser } = useAuth();

  const [returnType, setReturnType] = useState<'completed' | 'cancelled' | 'procurement_savings'>('completed');
  const [useThaiNumerals, setUseThaiNumerals] = useState<boolean>(false);
  const [bookNumber, setBookNumber] = useState<string>('สม');
  const [memoDate, setMemoDate] = useState<string>(getTodayThaiDate());
  const [customReason, setCustomReason] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  if (!isOpen || !project) return null;

  const allocated = project.budgetAllocated;
  const spent = project.budgetSpent;
  const surplusAmount = Math.max(0, allocated - spent);

  // Subject title:
  const targetYear = project.fiscalYear || 2569;
  const subjectText = `ส่งคืนงบประมาณเหลือจ่ายของ ${project.name} ประจำปีงบประมาณ พ.ศ. ${targetYear}`;

  const memoTableRows: TransferBudgetItem[] = [
    {
      id: `return_src_${Date.now()}`,
      itemType: 'source',
      programName: 'โครงการเดิม',
      programCode: project.programCode,
      itemDescription: `${project.name} [ส่งคืนงบประมาณเหลือจ่าย]`,
      activityCode: project.code,
      budgetOriginal: allocated,
      transferAmount: -surplusAmount,
      budgetNew: spent,
      actualDisbursedAndCommitted: spent,
      remainingBalance: 0,
    },
    {
      id: `return_dest_${Date.now()}`,
      itemType: 'destination',
      programName: 'งบประมาณส่วนกลาง',
      programCode: project.programCode,
      itemDescription: `งบกลางสำนักงาน กสม. (สนย. รับคืนเข้าส่วนกลาง)`,
      activityCode: 'ส่วนกลาง',
      budgetOriginal: 0,
      transferAmount: surplusAmount,
      budgetNew: surplusAmount,
      actualDisbursedAndCommitted: 0,
      remainingBalance: surplusAmount,
    }
  ];

  const returnMemo: OfficialMemoData = {
    id: `memo_return_${Date.now()}`,
    bookNumber,
    memoDate,
    division: currentUser.division,
    divisionFullName: NHRC_UNITS[currentUser.division]?.fullName || currentUser.division,
    subDivisionName: currentUser.subDivision,
    telNumber: '1380',
    subject: subjectText,
    toRecipient: 'เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ ผ่านผู้อำนวยการสำนักนโยบายและยุทธศาสตร์',
    fiscalYear: project.fiscalYear || 2569,
    section1_OriginalStory: `ตามที่สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ ได้อนุมัติจัดสรรงบประมาณรายจ่ายประจำปีงบประมาณ พ.ศ. 2569 ให้แก่ ${project.division} (${NHRC_UNITS[project.division]?.fullName}) เพื่อดำเนินงานตามแผนปฏิบัติการประจำปี โครงการ "${project.name}" รหัสโครงการ ${project.code} ได้รับจัดสรรงบประมาณจำนวน ${formatCurrency(allocated, useThaiNumerals)} บาท (${thaiBahtText(allocated)}) นั้น`,
    section2_Facts: {
      agencyRequest: returnType === 'cancelled'
        ? `สำนัก/กลุ่มงาน ขอรายงานขอยกเลิกการดำเนินโครงการดังกล่าว เนื่องจากสถานการณ์และสภาพแวดล้อมในการดำเนินงานเปลี่ยนแปลงไป ${customReason || 'จึงไม่มีความจำเป็นต้องดำเนินโครงการต่อไป'}`
        : `บัดนี้ สำนัก/กลุ่มงาน ได้ดำเนินการตามวัตถุประสงค์และตัวชี้วัดของโครงการดังกล่าวเสร็จสิ้นครบถ้วนแล้ว ${customReason || 'โดยมีการบริหารจัดการงบประมาณอย่างประหยัดและมีประสิทธิภาพ'}`,
      investigation: `จากการตรวจสอบผลการใช้จ่ายงบประมาณ พบว่าโครงการมีการเบิกจ่ายงบประมาณไปแล้วทั้งสิ้น ${formatCurrency(spent, useThaiNumerals)} บาท และมีงบประมาณเหลือจ่ายสุทธิเป็นจำนวนเงิน ${formatCurrency(surplusAmount, useThaiNumerals)} บาท (${thaiBahtText(surplusAmount)}) ซึ่งไม่มีความจำเป็นต้องก่อหนี้ผูกพันเพิ่มเติมอีก`,
      savingsSource: `สำนัก/กลุ่มงาน จึงมีความประสงค์ขอส่งคืนเงินงบประมาณเหลือจ่ายจำนวนดังกล่าวเข้าเป็นงบประมาณส่วนกลางของสำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ เพื่อให้สำนักงานนำไปบริหารจัดการในภาพรวมต่อไป`,
    },
    section3_LegalReference: `ระเบียบคณะกรรมการสิทธิมนุษยชนแห่งชาติ ว่าด้วยการงบประมาณ พ.ศ. 2566 ข้อ 12 และข้อ 13 ประกอบระเบียบการเงินการคลังของสำนักงาน กสม.`,
    section4_Proposal: `จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติการส่งคืนงบประมาณเหลือจ่ายของโครงการ "${project.name}" จำนวนเงิน ${formatCurrency(surplusAmount, useThaiNumerals)} บาท (${thaiBahtText(surplusAmount)}) เข้าเป็นงบประมาณส่วนกลางของสำนักงาน กสม. และมอบหมายสำนักนโยบายและยุทธศาสตร์ (สนย.) และกลุ่มงานคลัง สำนักบริหารกลาง ดำเนินการทางบัญชีต่อไป`,
    tableRows: memoTableRows,
    asOfDateText: `ณ วันที่ ${memoDate}`,
    proposerName: currentUser.name,
    proposerPosition: currentUser.position,
    divisionHeadRemark: 'มอบ สนย. และกลุ่มงานคลัง ดำเนินการรับคืนงบประมาณเข้าส่วนกลาง',
    deputyRemark: 'เสนอเพื่อโปรดพิจารณาอนุมัติการส่งคืนงบประมาณ',
    decisionOrder: 'APPROVED',
    approverTitle: 'เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ',
    approverName: 'นางสาวหรรษา หอมหวล',
    useThaiNumerals,
    status: 'approved',
    createdAt: new Date().toISOString(),
  };

  const handleConfirmReturn = () => {
    // 1. Update Project Status & release budget
    const updatedProj: Project = {
      ...project,
      status: 'COMPLETED',
      progressPercent: returnType === 'cancelled' ? project.progressPercent : 100,
      notes: `${project.notes || ''}\n[ส่งคืนงบประมาณเหลือจ่ายเข้าส่วนกลาง] จำนวน ${surplusAmount.toLocaleString()} บาท ตามบันทึกข้อความเลขที่ ${bookNumber} (${memoDate})`.trim(),
      updatedAt: new Date().toISOString(),
    };

    updateProject(updatedProj);
    addOfficialMemo(returnMemo);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (onSuccess) {
      onSuccess(returnMemo);
    }
    onClose();
  };

  const handleCopy = () => {
    const text = `
บันทึกข้อความ
ส่วนราชการ: ${returnMemo.divisionFullName} ${returnMemo.subDivisionName} โทร. ${returnMemo.telNumber}
ที่: ${returnMemo.bookNumber}  วันที่: ${returnMemo.memoDate}
เรื่อง: ${returnMemo.subject}
เรียน: ${returnMemo.toRecipient}

1. เรื่องเดิม
${returnMemo.section1_OriginalStory}

2. ข้อเท็จจริง
${returnMemo.section2_Facts.agencyRequest}
${returnMemo.section2_Facts.investigation}
${returnMemo.section2_Facts.savingsSource}

3. ระเบียบที่เกี่ยวข้อง
${returnMemo.section3_LegalReference}

4. ข้อพิจารณาและข้อเสนอ
${returnMemo.section4_Proposal}

(ลงชื่อ) ${returnMemo.proposerName}
${returnMemo.proposerPosition}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#0a4d44] dark:text-emerald-300 flex items-center justify-center shadow-inner">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>ส่งคืนงบประมาณเหลือจ่ายเข้าส่วนกลาง</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                  โครงการแล้วเสร็จ / เงินเหลือจ่าย
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                รวบรวมเงินเหลือจ่ายส่งคืนเข้ากองทุนงบกลางของสำนักงาน กสม. (สนย.)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Project Summary Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0a4d44] text-white mr-2">
                  {project.code}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {project.name}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  สังกัด: {project.division} ({NHRC_UNITS[project.division]?.fullName})
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">สถานะปัจจุบัน</span>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                  {project.status === 'COMPLETED' ? 'แล้วเสร็จ' : 'อยู่ระหว่างดำเนินการ'}
                </span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500">งบประมาณที่ได้รับจัดสรร</span>
                <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                  {formatCurrency(allocated)} บาท
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500">ผลเบิกจ่ายจริงสุทธิ</span>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {formatCurrency(spent)} บาท
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">ยอดเงินเหลือจ่ายส่งคืนส่วนกลาง</span>
                <p className="text-sm font-bold text-[#0a4d44] dark:text-emerald-400 mt-0.5">
                  {formatCurrency(surplusAmount)} บาท
                </p>
              </div>
            </div>
          </div>

          {/* Reason & Category Selector */}
          <div className="space-y-3">
            <label className="font-bold text-slate-800 dark:text-white text-xs">
              สาเหตุและกรณีการส่งคืนงบประมาณ:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'completed', label: 'ดำเนินโครงการเสร็จสิ้นแล้ว', desc: 'บรรลุตัวชี้วัดครบถ้วนและมีเงินเหลือจ่าย' },
                { id: 'procurement_savings', label: 'ประหยัดจากการจัดซื้อจัดจ้าง', desc: 'ได้ราคาต่ำกว่าราคากลางที่ตั้งไว้' },
                { id: 'cancelled', label: 'ขอยกเลิกโครงการ', desc: 'สถานการณ์เปลี่ยน/ซ้ำซ้อน ไม่ต้องจัดทำต่อ' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setReturnType(item.id as any)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    returnType === item.id
                      ? 'border-[#0a4d44] bg-emerald-50/70 dark:bg-emerald-950/50 text-[#0a4d44] dark:text-emerald-300 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="text-xs">{item.label}</p>
                  <span className="text-[10px] text-slate-500 font-normal block mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-slate-500">หมายเหตุเพิ่มเติม (ถ้ามี):</span>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="เช่น กิจกรรมอบรมเสร็จสิ้นแล้วในไตรมาสที่ 3 และประหยัดค่าใช้จ่ายการเดินทาง..."
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Official Memo Preview Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0a4d44]" />
                <span>ตัวอย่างบันทึกข้อความตราครุฑส่งคืนงบประมาณ (สร้างอัตโนมัติ):</span>
              </h4>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseThaiNumerals(!useThaiNumerals)}
                  className="px-2.5 py-1 rounded-md border text-[10px] font-bold bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 cursor-pointer"
                >
                  {useThaiNumerals ? 'รูปแบบเลขไทย' : 'รูปแบบเลขอาระบิก (1 2 3)'}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-semibold bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copySuccess ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => generateWordDocument(returnMemo)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-700 text-white cursor-pointer hover:bg-blue-800"
                >
                  <Download className="w-3 h-3" />
                  <span>ดาวน์โหลด Word (.doc)</span>
                </button>
              </div>
            </div>

            {/* Rendered Memo Box */}
            <div 
              className="bg-white text-black p-6 sm:p-8 rounded-xl shadow border border-slate-300 space-y-3"
              style={{ fontFamily: "'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', sans-serif" }}
            >
              <div className="relative mb-2 flex items-end">
                <div className="w-20 shrink-0">
                  <GarudaEmblem size={55} />
                </div>
                <div className="flex-1 text-center pr-20">
                  <h1 className="text-[22pt] font-bold text-black tracking-tight leading-none">
                    บันทึกข้อความ
                  </h1>
                </div>
              </div>

              <div className="space-y-0.5 text-[14pt] border-b border-black pb-2 mb-2 leading-snug">
                <p>
                  <strong className="font-bold">ส่วนราชการ</strong> {returnMemo.divisionFullName} โทร. {returnMemo.telNumber}
                </p>
                  <div className="flex justify-between">
                    <p><strong className="font-bold">ที่</strong> {formatMemoBookNumber(returnMemo.bookNumber)}</p>
                    <p><strong className="font-bold">วันที่</strong> {returnMemo.memoDate}</p>
                  </div>
                <p>
                  <strong className="font-bold">เรื่อง</strong> {returnMemo.subject}
                </p>
              </div>

              <p className="text-[14pt]">
                <strong className="font-bold">เรียน</strong> {returnMemo.toRecipient}
              </p>

              <div className="space-y-2 text-[14pt] text-justify leading-relaxed">
                <p className="indent-8">
                  <strong className="font-bold">1. เรื่องเดิม</strong> {returnMemo.section1_OriginalStory}
                </p>
                <div className="indent-8">
                  <strong className="font-bold">2. ข้อเท็จจริง</strong>
                  <p>{returnMemo.section2_Facts.agencyRequest}</p>
                  <p>{returnMemo.section2_Facts.investigation}</p>
                  <p>{returnMemo.section2_Facts.savingsSource}</p>
                </div>
                <p className="indent-8">
                  <strong className="font-bold">3. ระเบียบที่เกี่ยวข้อง</strong> {returnMemo.section3_LegalReference}
                </p>
                <p className="indent-8">
                  <strong className="font-bold">4. ข้อพิจารณาและข้อเสนอ</strong> {returnMemo.section4_Proposal}
                </p>
              </div>

              <div className="pt-4 flex justify-end text-center text-[13pt]">
                <div className="w-56 space-y-0.5">
                  <p>(ลงชื่อ)........................................................</p>
                  <p>({returnMemo.proposerName})</p>
                  <p className="text-xs text-slate-600">{returnMemo.proposerPosition}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            ยกเลิก
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold cursor-pointer hover:bg-slate-100"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์เอกสาร</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmReturn}
              className="flex items-center gap-2 bg-[#0a4d44] hover:bg-[#083b34] text-white px-5 py-2 rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยืนยันส่งคืนงบประมาณเข้าส่วนกลาง</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
