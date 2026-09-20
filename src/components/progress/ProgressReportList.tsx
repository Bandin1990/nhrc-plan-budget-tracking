import React, { useState, useMemo } from 'react';
import { 
  Clock, Plus, Printer, Edit3, Eye, Search, Filter, 
  Calendar, CheckCircle2, ChevronRight, FileText,
  Bell, Mail, AlertTriangle, Send, History, Check, User as UserIcon,
  Download, BookOpen
} from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProgressReport, ReportRound, REPORT_ROUNDS } from '../../types/progress';
import { formatCurrency, fromThaiNumerals } from '../../utils/thaiNumber';
import { EmailHistoryModal } from '../common/EmailHistoryModal';
import { AnnualReportExportModal } from '../reports/AnnualReportExportModal';

interface ProgressReportListProps {
  onOpenNewReport: (projectId?: string) => void;
  onOpenEditReport: (report: ProgressReport) => void;
  onPrintReport: (report: ProgressReport) => void;
}

export const ProgressReportList: React.FC<ProgressReportListProps> = ({
  onOpenNewReport,
  onOpenEditReport,
  onPrintReport,
}) => {
  const { 
    reports, 
    projects, 
    fiscalYear, 
    emailLogs, 
    dispatchProgressDueReminders, 
    sendReminderNudge, 
    sendBatchReminderNudge 
  } = useProjects();
  const { currentUser, canReportProgress } = useAuth();

  const [activeTab, setActiveTab] = useState<'submitted' | 'pending'>('submitted');
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [isEmailHistoryOpen, setIsEmailHistoryOpen] = useState<boolean>(false);
  const [isAnnualExportModalOpen, setIsAnnualExportModalOpen] = useState<boolean>(false);

  // Filter projects by current fiscal year
  const yearProjects = useMemo(() => {
    return projects.filter(p => (p.fiscalYear || 2569) === fiscalYear);
  }, [projects, fiscalYear]);

  // Identify submitted vs pending projects for the selected round
  const submittedProjectIds = useMemo(() => {
    const matched = reports.filter(r => 
      (r.fiscalYear || 2569) === fiscalYear && 
      (selectedRound === 'all' || r.round === selectedRound)
    );
    return new Set(matched.map(r => r.projectId));
  }, [reports, fiscalYear, selectedRound]);

  const submittedProjects = useMemo(() => {
    return yearProjects.filter(p => submittedProjectIds.has(p.id));
  }, [yearProjects, submittedProjectIds]);

  const pendingProjects = useMemo(() => {
    return yearProjects.filter(p => !submittedProjectIds.has(p.id));
  }, [yearProjects, submittedProjectIds]);

  // Filtered reports for submitted tab
  const filteredReports = reports.filter((r) => {
    if ((r.fiscalYear || 2569) !== fiscalYear) return false;
    if (selectedRound !== 'all' && r.round !== selectedRound) return false;
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      return (
        r.projectCode.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q) ||
        r.division.toLowerCase().includes(q) ||
        r.section6?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered pending projects
  const filteredPendingProjects = pendingProjects.filter((p) => {
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      return (
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.division.toLowerCase().includes(q) ||
        (p.responsiblePerson?.name && p.responsiblePerson.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-16">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-[#0a4d44] rounded-full inline-block"></span>
            <span>ทะเบียนรายงานผลการปฏิบัติงานและการใช้จ่ายงบประมาณ (แบบ สนย.3 - ปีงบฯ {fiscalYear})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            รายงานผลตามกำหนดเวลาทุก 2 เดือน / รอบ 6 เดือน พร้อมระบบพิมพ์แบบฟอร์มทางการราชการ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Annual Report Export Button */}
          <button
            type="button"
            onClick={() => setIsAnnualExportModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0a4d44] dark:text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer shadow-xs"
            title="ดาวน์โหลดเนื้อหาผลการดำเนินงานทุกโครงการสำหรับจัดทำรายงานประจำปี (Word/Excel)"
          >
            <Download className="w-4 h-4 text-[#0a4d44] dark:text-emerald-400" />
            <span>จัดทำรายงานประจำปี (Word/Excel)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (filteredReports.length > 0) {
                onPrintReport(filteredReports[0]);
              } else if (reports.length > 0) {
                onPrintReport(reports[0]);
              } else {
                alert('ยังไม่มีรายการรายงานผลที่บันทึกไว้ กรุณากดบันทึกรายงานผลของโครงการก่อนพิมพ์แบบ สนย.3');
              }
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="พิมพ์แบบรายงาน สนย.3 ของรายงานล่าสุด"
          >
            <Printer className="w-4 h-4 text-[#0a4d44] dark:text-emerald-400" />
            <span>พิมพ์แบบ สนย.3</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewReport()}
            className="flex items-center gap-1.5 bg-[#0a4d44] hover:bg-[#083b34] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกรายงานผลใหม่</span>
          </button>
        </div>
      </div>

      {/* Executive Monitoring Tracker & Reminder Hub */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0a4d44] dark:text-emerald-400" />
              <span>ศูนย์ติดตามสถานะการส่งรายงาน สนย.3 ประจำปีงบประมาณ {fiscalYear}</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ระบบตรวจสอบความก้าวหน้าการจัดส่งรายงานผลรายสำนัก พร้อมกลไกแจ้งเตือนทางอีเมลอัตโนมัติ
            </p>
          </div>

          {/* Admin Email & Reminder Actions */}
          {currentUser.role === 'ADMIN' && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => {
                  const roundLabel = selectedRound === 'all' ? 'ทุกรอบ' : (REPORT_ROUNDS[selectedRound as ReportRound]?.label || selectedRound);
                  const res = dispatchProgressDueReminders(fiscalYear, roundLabel);
                  alert(res.message);
                }}
                title="ส่งอีเมลแจ้งเตือนผู้รับผิดชอบโครงการทุกท่านถึงกำหนดเวลาส่งรายงาน สนย.3"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0a4d44] dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>ส่งอีเมลเตือนรอบรายงานผล</span>
              </button>

              {pendingProjects.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm(`ต้องการส่งอีเมลแจ้งเตือนซ้ำ (Nudge) ไปยังสำนัก/ผู้รับผิดชอบที่ยังค้างส่งรายงาน สนย.3 จำนวน ${pendingProjects.length} โครงการ ใช่หรือไม่?`)) {
                      const res = sendBatchReminderNudge(pendingProjects.map(p => p.id));
                      alert(res.message);
                    }
                  }}
                  title="ส่งอีเมลเตือนซ้ำเพื่อเร่งรัดสำนักที่ยังไม่ได้ส่งรายงาน"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold rounded-xl border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
                  <span>ส่งเตือนซ้ำสำนักค้างส่ง ({pendingProjects.length})</span>
                </button>
              )}

              <button
                onClick={() => setIsEmailHistoryOpen(true)}
                title="ดูประวัติการจัดส่งอีเมลแจ้งเตือนทั้งหมด"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>ประวัติส่งอีเมล ({emailLogs.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 font-semibold block">โครงการทั้งหมดปี {fiscalYear}</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-slate-800 dark:text-white">
                {yearProjects.length}
              </span>
              <span className="text-[11px] text-slate-400">โครงการ</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold block">ส่งรายงานผลแล้ว</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {submittedProjects.length}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {yearProjects.length > 0 ? ((submittedProjects.length / yearProjects.length) * 100).toFixed(0) : 0}% ของทั้งหมด
              </span>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border transition-colors ${
            pendingProjects.length > 0 
              ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' 
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}>
            <span className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold block">ยังไม่ส่งรายงาน / ค้างส่ง</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className={`text-xl font-bold font-mono ${pendingProjects.length > 0 ? 'text-amber-700 dark:text-amber-400 font-extrabold' : 'text-slate-400'}`}>
                {pendingProjects.length}
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                โครงการ
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('submitted')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'submitted'
                ? 'bg-[#0a4d44] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>รายงานที่ส่งแล้ว ({filteredReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ติดตามสำนักที่ยังไม่รายงาน ({filteredPendingProjects.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'submitted' ? "ค้นหารหัสโครงการ, ชื่อโครงการ, ผู้รายงาน..." : "ค้นหาโครงการหรือสำนักที่ค้างส่งรายงาน..."}
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setSelectedRound('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedRound === 'all'
                ? 'bg-[#0a4d44] text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            ทุกรอบ
          </button>
          {Object.keys(REPORT_ROUNDS).map((rk) => (
            <button
              key={rk}
              onClick={() => setSelectedRound(rk)}
              className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                selectedRound === rk
                  ? 'bg-[#0a4d44] text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {REPORT_ROUNDS[rk as ReportRound].shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table: Either Submitted Reports or Pending Projects */}
      {activeTab === 'submitted' ? (
        /* Submitted Reports Table */
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-3 w-32">รอบการรายงาน</th>
                  <th className="py-3 px-3 w-28">รหัสกิจกรรม</th>
                  <th className="py-3 px-3 min-w-[260px]">ชื่อโครงการ</th>
                  <th className="py-3 px-3 w-24">สำนัก</th>
                  <th className="py-3 px-3 w-32 text-right">งบจัดสรร (บ.)</th>
                  <th className="py-3 px-3 w-32 text-right">เบิกจ่าย (บ.)</th>
                  <th className="py-3 px-3 w-36">ผู้รายงาน</th>
                  <th className="py-3 px-4 w-28 text-center">พิมพ์ / แก้ไข</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      ไม่พบรายการรายงานผลรอบ 2 เดือน ตามเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((rep, idx) => {
                    const parentProj = projects.find(p => p.id === rep.projectId);
                    const isOwner = parentProj ? canReportProgress(parentProj) : true;
                    const totalSpent = rep.section2_1.reduce((sum, a) => sum + (a.actualSpent || 0), 0);
                    const roundInfo = REPORT_ROUNDS[rep.round];

                    return (
                      <tr key={rep.id} className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-semibold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-bold text-[#0a4d44] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" />
                            <span>{roundInfo ? roundInfo.shortLabel : rep.round}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {rep.asOfDateText}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {rep.projectCode}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800 dark:text-white">
                            {rep.projectName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {rep.section2_1.length} กิจกรรมย่อย
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {rep.division}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                          {formatCurrency(rep.section1.allocatedBudget)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(totalSpent)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-700 dark:text-slate-300 truncate max-w-[130px]" title={rep.section6?.name}>
                            {rep.section6?.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {rep.section6?.position}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Print Button */}
                            <button
                              onClick={() => onPrintReport(rep)}
                              title="ดูตัวอย่างก่อนพิมพ์แบบ สนย.3 ทางการ"
                              className="p-1.5 rounded-lg bg-[#0a4d44] hover:bg-[#083b34] text-white shadow-sm transition-all"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => onOpenEditReport(rep)}
                              disabled={!isOwner}
                              title={isOwner ? 'แก้ไขรายงาน' : 'ไม่มีสิทธิ์แก้ไข'}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Pending Projects Tracker Table */
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                รายการโครงการที่ยังไม่จัดส่งรายงานผล สนย.3 ในรอบนี้ ({filteredPendingProjects.length} โครงการ)
              </span>
            </div>
            {currentUser.role === 'ADMIN' && filteredPendingProjects.length > 0 && (
              <button
                onClick={() => {
                  const ids = filteredPendingProjects.map(p => p.id);
                  const res = sendBatchReminderNudge(ids);
                  alert(res.message);
                }}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Bell className="w-3 h-3" />
                <span>ส่งอีเมลแจ้งเตือนซ้ำทุกโครงการในหน้านี้</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-3 w-28">รหัสโครงการ</th>
                  <th className="py-3 px-3 min-w-[240px]">ชื่อโครงการ</th>
                  <th className="py-3 px-3 w-24">สำนัก</th>
                  <th className="py-3 px-3 min-w-[180px]">ผู้รับผิดชอบ / ติดต่อ</th>
                  <th className="py-3 px-3 w-28 text-right">งบจัดสรร (บ.)</th>
                  <th className="py-3 px-3 w-36 text-center">สถานะการเตือน</th>
                  <th className="py-3 px-4 w-40 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPendingProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                      ยอดเยี่ยม! ทุกโครงการได้จัดส่งรายงานผล สนย.3 ครบถ้วนแล้ว
                    </td>
                  </tr>
                ) : (
                  filteredPendingProjects.map((p, idx) => {
                    const canReport = canReportProgress(p);
                    return (
                      <tr key={p.id} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-semibold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {p.code}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800 dark:text-white leading-snug">{p.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{p.timeframeText}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {p.division}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {p.responsiblePerson?.name || '-'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {p.responsiblePerson?.email} {p.responsiblePerson?.phone ? `• โทร. ${fromThaiNumerals(p.responsiblePerson?.phone)}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                          {formatCurrency(p.budgetAllocated)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {p.lastRemindedAt ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              <Bell className="w-3 h-3" />
                              <span>เตือนแล้ว {p.reminderCount || 1} ครั้ง</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">ยังไม่เคยเตือนซ้ำ</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Send Nudge Button (Admin) */}
                            {currentUser.role === 'ADMIN' && (
                              <button
                                onClick={() => sendReminderNudge(p.id)}
                                title="ส่งอีเมลแจ้งเตือนเร่งรัดผู้รับผิดชอบโครงการนี้โดยด่วน"
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[11px] font-bold border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Bell className="w-3 h-3 text-rose-600" />
                                <span>ส่งเตือนซ้ำ</span>
                              </button>
                            )}

                            {/* Direct Report Button */}
                            <button
                              onClick={() => onOpenNewReport(p.id)}
                              disabled={!canReport}
                              title={canReport ? "บันทึกรายงานผล สนย.3 ให้โครงการนี้" : "เฉพาะผู้รับผิดชอบโครงการหรือ Admin"}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
                                canReport 
                                  ? 'bg-[#0a4d44] hover:bg-[#073b34] text-white shadow-xs cursor-pointer' 
                                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              <span>บันทึกผล</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Email Dispatch History Modal */}
      <EmailHistoryModal
        isOpen={isEmailHistoryOpen}
        onClose={() => setIsEmailHistoryOpen(false)}
      />

      {/* Annual Report Export Modal */}
      <AnnualReportExportModal
        isOpen={isAnnualExportModalOpen}
        onClose={() => setIsAnnualExportModalOpen(false)}
      />
    </div>
  );
};
