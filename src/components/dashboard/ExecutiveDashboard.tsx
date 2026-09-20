import React, { useState } from 'react';
import { 
  FolderKanban, DollarSign, CheckCircle2, AlertTriangle, 
  TrendingUp, Building2, Plus, FileUp, Clock, Scale, ArrowUpRight, ChevronRight, BarChart3, Coins,
  Download, BookOpen
} from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { NHRC_UNITS, NHRCUnit } from '../../types/project';
import { formatCurrency } from '../../utils/thaiNumber';
import { NavTab } from '../layout/Sidebar';
import { AnnualReportExportModal } from '../reports/AnnualReportExportModal';

interface ExecutiveDashboardProps {
  onNavigate: (tab: NavTab) => void;
  onOpenNewProject: () => void;
  onOpenWordImport: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onNavigate,
  onOpenNewProject,
  onOpenWordImport,
}) => {
  const { projects, fiscalYear, memos } = useProjects();
  const { currentUser } = useAuth();
  const [isAnnualExportModalOpen, setIsAnnualExportModalOpen] = useState(false);

  // Filter projects by selected fiscalYear
  const yearProjects = projects.filter(p => (p.fiscalYear || 2569) === fiscalYear);

  // Metrics
  const totalProjects = yearProjects.length;
  const totalAllocated = yearProjects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0);
  const totalSpent = yearProjects.reduce((sum, p) => sum + (p.budgetSpent || 0), 0);
  const remainingBudget = totalAllocated - totalSpent;
  const spentRate = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : '0.0';

  // Returned Budget Calculation for this fiscalYear (เงินเหลือจ่ายส่งคืนเข้าส่วนกลาง)
  const returnedMemos = memos ? memos.filter(m => 
    ((m.fiscalYear || 2569) === fiscalYear) &&
    (m.subject?.includes('ส่งคืนงบประมาณ') || m.id?.startsWith('memo_return_'))
  ) : [];

  const memoReturnedAmount = returnedMemos.reduce((sum, m) => {
    const retRow = m.tableRows?.find(r => r.itemType === 'destination' || r.transferAmount > 0);
    return sum + (retRow ? Math.abs(retRow.transferAmount) : 0);
  }, 0);

  const returnedProjects = yearProjects.filter(p => p.notes?.includes('ส่งคืนงบประมาณเหลือจ่าย'));
  const totalReturnedBudget = memoReturnedAmount > 0 ? memoReturnedAmount : (fiscalYear === 2569 && returnedProjects.length > 0 ? 48500 : 0);
  const totalReturnedCount = returnedMemos.length > 0 ? returnedMemos.length : (fiscalYear === 2569 && returnedProjects.length > 0 ? returnedProjects.length : 0);

  const remainingRate = totalAllocated > 0 ? ((remainingBudget / totalAllocated) * 100).toFixed(1) : '0.0';

  const completedProjects = yearProjects.filter(p => p.status === 'COMPLETED').length;
  const inProgressProjects = yearProjects.filter(p => p.status === 'IN_PROGRESS').length;
  const delayedProjects = yearProjects.filter(p => p.status === 'DELAYED' || (p.progressPercent < 40 && p.status === 'IN_PROGRESS')).length;

  // Breakdown by NHRC 14 Units for this fiscalYear
  const unitKeys = Object.keys(NHRC_UNITS) as NHRCUnit[];
  const unitStats = unitKeys.map((uKey) => {
    const unitProjects = yearProjects.filter(p => p.division === uKey);
    const allocated = unitProjects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0);
    const spent = unitProjects.reduce((sum, p) => sum + (p.budgetSpent || 0), 0);
    const percent = allocated > 0 ? (spent / allocated) * 100 : 0;
    return {
      code: uKey,
      name: NHRC_UNITS[uKey].fullName,
      shortName: NHRC_UNITS[uKey].shortName,
      projectCount: unitProjects.length,
      allocated,
      spent,
      percent,
    };
  }).filter(u => u.allocated > 0 || u.projectCount > 0)
    .sort((a, b) => b.allocated - a.allocated);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Greetings */}
      <div className="bg-gradient-to-r from-[#0a4d44] via-[#0d594e] to-[#126b5f] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg border border-emerald-700/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          {/* Left: Titles & Greetings */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white/15 text-emerald-100 border border-white/20 whitespace-nowrap shadow-2xs">
                ประจำปีงบประมาณ พ.ศ. {fiscalYear}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-200/90 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                สถานะ: สรุปภาพรวมระดับสำนักงาน กสม.
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white pt-0.5">
              แดชบอร์ดติดตามผลการดำเนินงานและการใช้จ่ายงบประมาณ
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-emerald-200/80">ยินดีต้อนรับ</span>
              <span className="font-bold text-white underline decoration-emerald-400/50 underline-offset-2">
                {currentUser.name}
              </span>
              <span className="text-emerald-200/70">
                ({currentUser.position})
              </span>
            </p>
          </div>

          {/* Right: Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1 xl:pt-0">
            {/* Annual Report Export Button */}
            <button
              onClick={() => setIsAnnualExportModalOpen(true)}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold border border-white/25 shadow-xs transition-all cursor-pointer whitespace-nowrap hover:scale-[1.02]"
              title="ดาวน์โหลดสรุปผลงานโครงการทั้งหมดสำหรับจัดทำรายงานประจำปี (Word/Excel)"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>จัดทำรายงานประจำปี (Word/Excel)</span>
            </button>

            {/* Word/AI Import Button */}
            <button
              onClick={onOpenWordImport}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer whitespace-nowrap hover:scale-[1.02]"
              title="นำเข้าแผนปฏิบัติการประจำปีจากไฟล์ Word (คำของบประมาณ) พร้อมระบบ AI ช่วยอ่านข้อมูล"
            >
              <FileUp className="w-4 h-4 text-slate-950" />
              <span>นำเข้าแผนปฏิบัติการ (Word/AI)</span>
            </button>

            {/* New Project Button */}
            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-1.5 bg-emerald-600/60 hover:bg-emerald-600/80 active:bg-emerald-700/80 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold border border-emerald-400/40 shadow-xs transition-all cursor-pointer whitespace-nowrap hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 text-emerald-200" />
              <span>สร้างโครงการใหม่</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty Year Notice Banner (if no projects found for this fiscal year) */}
      {totalProjects === 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                ยังไม่มีข้อมูลโครงการสำหรับปีงบประมาณ พ.ศ. {fiscalYear}
              </h4>
              <p className="text-xs text-amber-700/90 dark:text-amber-300/90 mt-0.5">
                ท่านสามารถสร้างโครงการใหม่ หรือนำเข้าแผนปฏิบัติการจากไฟล์ Word เพื่อเริ่มต้นแผนงานประจำปีงบประมาณนี้
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenWordImport}
              className="px-3.5 py-1.5 bg-[#0a4d44] hover:bg-[#083b34] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileUp className="w-3.5 h-3.5 text-amber-300" />
              <span>นำเข้าแผนปฏิบัติการปี {fiscalYear} (Word/AI)</span>
            </button>
            <button
              onClick={onOpenNewProject}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              + สร้างโครงการปี {fiscalYear}
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: 4 Budget Summary Cards (Grouped Together) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
            <DollarSign className="w-4 h-4 text-[#0a4d44] dark:text-emerald-400" />
            <span>สถานะงบประมาณประจำปี (4 กล่องงบประมาณ)</span>
          </h3>
          <span className="text-xs text-slate-400">หน่วย: บาท (THB)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Budget Card 1: Total Allocated Budget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0a4d44]"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                1. งบประมาณทั้งหมด (จัดสรร)
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0a4d44] dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(totalAllocated)}
              </span>
              <span className="text-xs font-semibold text-slate-500">บาท</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>สัดส่วนงบจัดสรร:</span>
              <span className="font-bold text-[#0a4d44] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                100.0%
              </span>
            </div>
          </div>

          {/* Budget Card 2: Actual Spent / Disbursed */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                2. งบเบิกจ่ายจริง (สะสม)
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-xs font-semibold text-slate-500">บาท</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>อัตราการเบิกจ่ายสะสม:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                {spentRate}%
              </span>
            </div>
          </div>

          {/* Budget Card 3: Remaining Budget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-sky-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                3. งบประมาณคงเหลือสุทธิ
              </span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/50 dark:border-sky-800">
                <Scale className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400 tracking-tight">
                {formatCurrency(remainingBudget)}
              </span>
              <span className="text-xs font-semibold text-slate-500">บาท</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>คงเหลือใช้จ่ายได้อีก:</span>
              <span className="font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/80 px-2 py-0.5 rounded-full">
                {remainingRate}%
              </span>
            </div>
          </div>

          {/* Budget Card 4: Returned Budget to Central Pool */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                4. ส่งคืนเข้าส่วนกลาง (เงินเหลือ)
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-800">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-400 tracking-tight">
                {formatCurrency(totalReturnedBudget)}
              </span>
              <span className="text-xs font-semibold text-slate-500">บาท</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>เงินเหลือจ่ายสะสม:</span>
              <span className="font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full text-[11px]">
                {totalReturnedCount} รายการ (เข้ากองกลาง)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: 4 Project Status Cards (Grouped Together) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
            <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>สถานะความก้าวหน้าโครงการ (4 สถานะหลัก)</span>
          </h3>
          <span className="text-xs text-slate-400">หน่วย: โครงการ</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Project Card 1: Total Projects */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                โครงการทั้งหมด
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {totalProjects}
              </span>
              <span className="text-xs font-medium text-slate-500">โครงการ</span>
            </div>
            <p className="mt-2 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 truncate">
              รวมทุกแผนงานและยุทธศาสตร์
            </p>
          </div>

          {/* Project Card 2: Completed Projects */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                โครงการที่แล้วเสร็จ
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {completedProjects}
              </span>
              <span className="text-xs font-medium text-slate-500">โครงการ</span>
            </div>
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-100 dark:border-slate-800 truncate font-medium">
              บรรลุเป้าหมายตามตัวชี้วัด 100%
            </p>
          </div>

          {/* Project Card 3: In Progress Projects */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                อยู่ระหว่างดำเนินการ
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400">
                {inProgressProjects}
              </span>
              <span className="text-xs font-medium text-slate-500">โครงการ</span>
            </div>
            <p className="mt-2 text-xs text-sky-600 dark:text-sky-400 pt-2 border-t border-slate-100 dark:border-slate-800 truncate font-medium">
              ดำเนินงานตามงวดแผนปฏิบัติการ
            </p>
          </div>

          {/* Project Card 4: Delayed Projects */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                โครงการที่ล่าช้า / เร่งรัด
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                {delayedProjects}
              </span>
              <span className="text-xs font-medium text-slate-500">โครงการ</span>
            </div>
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 pt-2 border-t border-slate-100 dark:border-slate-800 truncate font-medium">
              ความก้าวหน้าต่ำกว่าเกณฑ์ 40%
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Budget by Department & Fast Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Budget Breakdown by Department (Exact match to screenshot) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0a4d44]" />
                <span>งบประมาณจำแนกตามสำนัก / ส่วนราชการ (14 สำนัก)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เปรียบเทียบวงเงินที่ได้รับจัดสรร (100%) กับ ยอดเบิกจ่ายจริง
              </p>
            </div>
            <button
              onClick={() => onNavigate('unit_breakdown')}
              className="text-xs text-[#0a4d44] hover:text-emerald-700 font-bold flex items-center gap-1"
            >
              <span>ดูแบบละเอียด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {unitStats.slice(0, 8).map((u) => (
              <div key={u.code} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0 w-12 sm:w-16">
                      {u.code}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 truncate">
                      {u.name} ({u.projectCount} โครงการ)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-xs font-bold text-slate-500">
                      {u.percent.toFixed(1)}%
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 w-24 sm:w-28 text-right">
                      {formatCurrency(u.allocated)} บ.
                    </span>
                  </div>
                </div>

                {/* Progress Bar (Multi-layer) */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                  <div
                    className="bg-[#0a4d44] dark:bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, u.percent)}%` }}
                    title={`เบิกจ่ายแล้ว ${formatCurrency(u.spent)} บ.`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0a4d44]"></span>
                <span>เบิกจ่ายแล้ว (% เทียบงบจัดสรร)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                <span>งบประมาณคงเหลือ</span>
              </span>
            </div>
            <button
              onClick={() => onNavigate('budget_comparison')}
              className="text-[#0a4d44] font-semibold hover:underline"
            >
              ไปหน้าแผนงบประมาณ &rarr;
            </button>
          </div>
        </div>

        {/* Right 1 Col: Quick Workflow Actions & Recent Highlights */}
        <div className="space-y-6">
          {/* Quick Access Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              ทางลัดการทำงานด่วน
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('progress_reports')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-100 dark:border-slate-700 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-[#0a4d44] dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-[#0a4d44]">
                      รายงานผลรอบ 2 เดือน (แบบ สนย.3)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      บันทึกความก้าวหน้าและผลการใช้จ่าย
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0a4d44]" />
              </button>

              <button
                onClick={() => onNavigate('budget_transfers')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-100 dark:border-slate-700 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-700">
                      ขอโอนเปลี่ยนแปลงงบประมาณ
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      วินิจฉัยอำนาจตามระเบียบ กสม. 2566
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700" />
              </button>

              <button
                onClick={() => onNavigate('executive_summary')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-100 dark:border-slate-700 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-amber-700">
                      รายงานสรุปผู้บริหารพร้อมพิมพ์
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Executive Summary จัดหน้า A4
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Annual Report Export Modal */}
      <AnnualReportExportModal
        isOpen={isAnnualExportModalOpen}
        onClose={() => setIsAnnualExportModalOpen(false)}
      />
    </div>
  );
};
