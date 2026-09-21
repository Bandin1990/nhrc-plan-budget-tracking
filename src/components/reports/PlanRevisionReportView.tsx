import React from 'react';
import { ArrowLeft, Download, FileSpreadsheet, ShieldCheck, WalletCards } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectContext';
import { exportPlanRevisionReport, getPlanRevisionReportStats } from '../../utils/planRevisionExport';
import { formatCurrency } from '../../utils/thaiNumber';

interface PlanRevisionReportViewProps {
  onBack: () => void;
}

export const PlanRevisionReportView: React.FC<PlanRevisionReportViewProps> = ({ onBack }) => {
  const { fiscalYear, projects } = useProjects();
  const { isAdmin } = useAuth();
  const stats = getPlanRevisionReportStats(fiscalYear, projects);

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
        <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">รายงานนี้สำหรับผู้ดูแลระบบ</h2>
        <p className="text-sm text-slate-500 mt-2">โปรดเข้าสู่ระบบด้วยสิทธิ์ Admin เพื่อดาวน์โหลดรายงานทบทวนแผน</p>
        <button onClick={onBack} className="mt-5 text-sm font-bold text-[#0a4d44] dark:text-emerald-400 hover:underline cursor-pointer">ย้อนกลับ</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#0a4d44] dark:hover:text-emerald-400 cursor-pointer mb-5">
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#0a4d44] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">รายงานทบทวนแผน</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-[#0a4d44] dark:text-emerald-300">ADMIN</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">แบบรายงานสำหรับเสนอวาระทบทวนแผนปฏิบัติการ ปีงบประมาณ {fiscalYear}</p>
            </div>
          </div>
          <button
            onClick={() => exportPlanRevisionReport(fiscalYear, projects)}
            className="flex items-center justify-center gap-2 bg-[#0a4d44] hover:bg-[#083b34] text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด Excel สำหรับพิมพ์</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><WalletCards className="w-4 h-4 text-amber-600" /> รายการขอส่งคืนงบประมาณ</div>
          <div className="mt-3 flex items-baseline gap-2"><strong className="text-2xl text-slate-900 dark:text-white">{stats.returnCount}</strong><span className="text-xs text-slate-500">รายการ</span></div>
          <p className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-400">{formatCurrency(stats.returnAmount, false)} บาท</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><WalletCards className="w-4 h-4 text-emerald-600" /> รายการขอเพิ่มงบประมาณ</div>
          <div className="mt-3 flex items-baseline gap-2"><strong className="text-2xl text-slate-900 dark:text-white">{stats.increaseCount}</strong><span className="text-xs text-slate-500">รายการ</span></div>
          <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(stats.increaseAmount, false)} บาท</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">เนื้อหาในไฟล์ Excel</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            ['แนบ 1 อำนาจรับคืน', `${stats.returnCount} รายการ พร้อมยอดจัดสรร ผลใช้จ่าย และเหตุผล`],
            ['แนบ 1 อำนาจให้เพิ่ม', `${stats.increaseCount} รายการ พร้อมยอดจัดสรร ผลใช้จ่าย และเหตุผล`],
            ['สรุปยกเลิก-ปรับแผน', `ยกเลิก ${stats.cancelledCount} รายการ และปรับแผน ${stats.revisedCount} รายการ`],
          ].map(([title, description]) => (
            <div key={title} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
              <p className="font-bold text-slate-800 dark:text-white">{title}</p>
              <p className="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
