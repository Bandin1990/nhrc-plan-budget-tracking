import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, Plus, FileUp, Download, Eye, Edit3, Trash2, 
  Clock, Scale, ChevronDown, ChevronUp, LayoutGrid, List as ListIcon,
  CheckCircle2, AlertCircle, ShieldAlert, Lock, Unlock, Mail, User as UserIcon,
  MoreVertical
} from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { Project, NHRC_UNITS, BUDGET_PROGRAMS, NHRCUnit, ProgramCode } from '../../types/project';
import { formatCurrency, fromThaiNumerals } from '../../utils/thaiNumber';
import { WorkflowStepper } from '../common/WorkflowStepper';
import { UnlockProjectModal } from './UnlockProjectModal';
import { EmailHistoryModal } from '../common/EmailHistoryModal';
import { STRATEGIC_PILLARS } from '../../services/pdfPlanExtractor';
import * as XLSX from 'xlsx';

interface ProjectListProps {
  onOpenNewProject: () => void;
  onOpenWordImport: () => void;
  onOpenEditProject: (project: Project) => void;
  onOpenReportProgress: (project: Project) => void;
  onOpenBudgetTransfer: (project: Project) => void;
  onViewProjectDetails: (project: Project) => void;
  strategicOnly?: boolean;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  onOpenNewProject,
  onOpenWordImport,
  onOpenEditProject,
  onOpenReportProgress,
  onOpenBudgetTransfer,
  onViewProjectDetails,
  strategicOnly = false
}) => {
  const { 
    projects, deleteProject, viewMode, setViewMode,
    searchQuery, setSearchQuery,
    selectedDivision, setSelectedDivision,
    selectedProgram, setSelectedProgram,
    selectedStatus, setSelectedStatus,
    fiscalYear,
    emailLogs,
    lockAllProjectsBaseline,
    dispatchPlanVerificationEmails
  } = useProjects();

  const { currentUser, canEditProject, canDeleteProject } = useAuth();
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [selectedStrategicPillar, setSelectedStrategicPillar] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [projectToUnlock, setProjectToUnlock] = useState<Project | null>(null);
  const [isEmailHistoryOpen, setIsEmailHistoryOpen] = useState<boolean>(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Close dropdown menu on click outside
  useEffect(() => {
    const handleGlobalClick = () => {
      if (openActionMenuId) setOpenActionMenuId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [openActionMenuId]);

  // Filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Fiscal Year filter
      if ((p.fiscalYear || 2569) !== fiscalYear) return false;

      if (strategicOnly && !p.isStrategic) return false;

      // Strategic Pillar filter
      if (selectedStrategicPillar !== 'all' && String(p.strategicPillar || '') !== selectedStrategicPillar) return false;

      // Division filter
      if (selectedDivision !== 'all' && p.division !== selectedDivision) return false;

      // Program filter
      if (selectedProgram !== 'all' && p.programCode !== selectedProgram) return false;

      // Status filter
      if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = p.code.toLowerCase().includes(q);
        const matchName = p.name.toLowerCase().includes(q);
        const matchDiv = p.division.toLowerCase().includes(q);
        const matchResp = p.responsiblePerson?.name?.toLowerCase().includes(q) || false;
        if (!matchCode && !matchName && !matchDiv && !matchResp) return false;
      }

      return true;
    });
  }, [projects, fiscalYear, strategicOnly, selectedStrategicPillar, selectedDivision, selectedProgram, selectedStatus, searchQuery]);

  // Pagination
  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleExpand = (id: string) => {
    setExpandedProjectId(prev => prev === id ? null : id);
  };

  const handleExportExcel = () => {
    const data = filteredProjects.map((p, idx) => ({
      'ลำดับ': idx + 1,
      'รหัสกิจกรรม': p.code,
      'ชื่อโครงการ': p.name,
      'สำนัก/หน่วยงาน': p.division,
      'กลุ่มงาน': p.subDivision,
      'แผนงาน': BUDGET_PROGRAMS[p.programCode]?.name || p.programCode,
      'งบประมาณที่จัดสรร (บาท)': p.budgetAllocated,
      'เบิกจ่ายจริง (บาท)': p.budgetSpent,
      'คงเหลือ (บาท)': p.budgetAllocated - p.budgetSpent,
      'ร้อยละความก้าวหน้า': `${p.progressPercent}%`,
      'สถานะ': p.status,
      'ผู้รับผิดชอบ': p.responsiblePerson?.name || '',
      'เบอร์ติดต่อ': fromThaiNumerals(p.responsiblePerson?.phone || ''),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `โครงการ_กสม_${fiscalYear}`);
    XLSX.writeFile(wb, `รายงานโครงการ_กสม_${fiscalYear}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDelete = (p: Project) => {
    if (!canDeleteProject(p)) {
      alert('ท่านไม่มีสิทธิ์ในการลบโครงการนี้ (เฉพาะผู้ดูแลระบบ Admin)');
      return;
    }
    if (confirm(`ยืนยันการลบโครงการ "${p.name}" หรือไม่?`)) {
      deleteProject(p.id);
    }
  };

  const yearTotalProjects = useMemo(() => {
    return projects.filter(p => (p.fiscalYear || 2569) === fiscalYear).length;
  }, [projects, fiscalYear]);

  return (
    <div className="space-y-4 pb-16">
      {/* Header Title Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-5 bg-[#0a4d44] rounded-full inline-block"></span>
              <span>{strategicOnly ? `ทะเบียนโครงการเชิงยุทธศาสตร์ กสม. (ปีงบฯ ${fiscalYear})` : `ทะเบียนโครงการทั้งหมดตามแผนปฏิบัติการ กสม. (ปีงบฯ ${fiscalYear})`}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              แสดง {filteredProjects.length} จากทั้งหมด {yearTotalProjects} โครงการ (ปีงบประมาณ {fiscalYear}) • สิทธิ์ของคุณ: <strong className="text-[#0a4d44] dark:text-emerald-400">{currentUser.role} ({currentUser.division})</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 font-bold shadow-sm text-[#0a4d44] dark:text-white' : 'text-slate-500'}`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>ตาราง</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-slate-900 font-bold shadow-sm text-[#0a4d44] dark:text-white' : 'text-slate-500'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>การ์ด</span>
              </button>
            </div>

            {/* Admin Lifecycle Actions */}
            {currentUser.role === 'ADMIN' && (
              <>
                <button
                  onClick={() => {
                    const res = dispatchPlanVerificationEmails(fiscalYear);
                    alert(res.message);
                  }}
                  title="ส่งอีเมลแจ้งสำนัก/ผู้รับผิดชอบโครงการ เพื่อตรวจสอบความถูกต้องของแผนปฏิบัติการ"
                  className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>ส่งอีเมลแจ้งตรวจสอบแผน</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`ยืนยันการล็อกข้อมูลโครงการตั้งต้นประจำปีงบประมาณ ${fiscalYear} ทั้งหมดหรือไม่?\nเมื่อล็อกแล้ว สำนักจะไม่สามารถแก้ไขข้อมูลตั้งต้นได้ เว้นแต่ได้รับอนุมัติตามระเบียบและให้ Admin ปลดล็อก`)) {
                      lockAllProjectsBaseline(fiscalYear);
                    }
                  }}
                  title="ล็อกข้อมูลโครงการตั้งต้นเพื่อเตรียมเข้าสู่รอบการปฏิบัติงาน"
                  className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  <span>ล็อกแผนตั้งต้นปี {fiscalYear}</span>
                </button>

                <button
                  onClick={() => setIsEmailHistoryOpen(true)}
                  title="ดูประวัติการจัดส่งอีเมลและการแจ้งเตือนระบบ"
                  className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>ประวัติส่งอีเมล ({emailLogs.length})</span>
                </button>
              </>
            )}

            {/* Actions */}
            <button
              onClick={onOpenWordImport}
              title="นำเข้าแผนปฏิบัติการประจำปี (ไฟล์ Word คำของบประมาณ พร้อมระบบ AI วิเคราะห์ข้อมูล)"
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-amber-300" />
              <span>นำเข้าแผนปฏิบัติการ (Word/AI)</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>ส่งออก Excel</span>
            </button>

            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-1.5 text-xs font-bold bg-[#0a4d44] hover:bg-[#083b34] text-white px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มโครงการ</span>
            </button>
          </div>
        </div>

        {/* Filter Bar (Pills + Dropdowns) */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโครงการ, รหัส, ผู้รับผิดชอบ..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Division Filter */}
          <select
            value={selectedDivision}
            onChange={(e) => { setSelectedDivision(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">สำนัก/หน่วยงาน (ทั้งหมด)</option>
            {Object.keys(NHRC_UNITS).map((key) => (
              <option key={key} value={key}>
                {key} - {NHRC_UNITS[key as NHRCUnit].fullName}
              </option>
            ))}
          </select>

          {/* Program Filter */}
          <select
            value={selectedProgram}
            onChange={(e) => { setSelectedProgram(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">แผนงาน (ทั้งหมด 6 แผนงาน)</option>
            {Object.keys(BUDGET_PROGRAMS).map((key) => (
              <option key={key} value={key}>
                {key}: {BUDGET_PROGRAMS[key as ProgramCode].shortName}
              </option>
            ))}
          </select>

          {/* Strategic Pillar Filter */}
          <select
            value={selectedStrategicPillar}
            onChange={(e) => { setSelectedStrategicPillar(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">ยุทธศาสตร์ กสม. (ทั้งหมด 4 ยุทธศาสตร์)</option>
            {Object.entries(STRATEGIC_PILLARS).map(([num, name]) => (
              <option key={num} value={num}>
                ยุทธศาสตร์ที่ {num}: {name.length > 35 ? name.substring(0, 35) + '...' : name}
              </option>
            ))}
          </select>

          {/* Status Pills */}
          <div className="flex items-center gap-1 ml-auto">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'IN_PROGRESS', label: 'กำลังดำเนินการ' },
              { id: 'COMPLETED', label: 'เสร็จสิ้น' },
              { id: 'NOT_STARTED', label: 'ยังไม่เริ่ม' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => { setSelectedStatus(st.id); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedStatus === st.id
                    ? 'bg-[#0a4d44] text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-2 w-8 text-center whitespace-nowrap">#</th>
                  <th className="py-2.5 px-2 w-24 whitespace-nowrap">รหัสกิจกรรม</th>
                  <th className="py-2.5 px-3 min-w-[340px]">ชื่อโครงการ / รายการ</th>
                  <th className="py-2.5 px-2 w-28 text-center whitespace-nowrap">สำนัก / ผู้รับผิดชอบ</th>
                  <th className="py-2.5 px-2 w-24 text-right whitespace-nowrap">งบจัดสรร (บ.)</th>
                  <th className="py-2.5 px-2 w-24 text-right whitespace-nowrap">เบิกจ่าย (บ.)</th>
                  <th className="py-2.5 px-2 w-24 text-center whitespace-nowrap">ก้าวหน้า</th>
                  <th className="py-2.5 px-2 w-24 text-center whitespace-nowrap">สถานะ</th>
                  <th className="py-2.5 px-2 w-28 text-center whitespace-nowrap">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {paginatedProjects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      ไม่พบโครงการตามเงื่อนไขที่กำหนด
                    </td>
                  </tr>
                ) : (
                  paginatedProjects.map((p, idx) => {
                    const isOwner = canEditProject(p);
                    const isExpanded = expandedProjectId === p.id;
                    const remaining = p.budgetAllocated - p.budgetSpent;
                    const percentNumber = p.progressPercent || 0;

                    return (
                      <React.Fragment key={p.id}>
                        <tr className={`hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 transition-colors ${isExpanded ? 'bg-emerald-50/60 dark:bg-slate-800/80' : ''}`}>
                          <td className="py-2.5 px-2 text-center font-semibold text-slate-400">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="py-2.5 px-2 font-mono font-bold text-[#0a4d44] dark:text-emerald-400 whitespace-nowrap text-[11px]">
                            {p.code}
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              type="button"
                              onClick={() => onViewProjectDetails(p)}
                              className="text-left font-bold text-slate-900 dark:text-slate-100 hover:text-[#0a4d44] dark:hover:text-emerald-400 transition-colors flex items-center gap-2 flex-wrap leading-snug group cursor-pointer"
                            >
                              <span className="group-hover:underline text-[15px] sm:text-base font-bold text-slate-800 dark:text-white tracking-tight leading-snug">
                                {p.name}
                              </span>
                              {p.isStrategic && (
                                <span 
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold shrink-0"
                                  title={p.strategicPillar && STRATEGIC_PILLARS[p.strategicPillar as keyof typeof STRATEGIC_PILLARS] ? `ยุทธศาสตร์ที่ ${p.strategicPillar}: ${STRATEGIC_PILLARS[p.strategicPillar as keyof typeof STRATEGIC_PILLARS]}` : 'โครงการยุทธศาสตร์'}
                                >
                                  {p.strategicPillar ? `ยุทธศาสตร์ที่ ${p.strategicPillar}` : 'ยุทธศาสตร์'}
                                </span>
                              )}
                              {p.isBaselineLocked && !p.unlockedForEdit && (
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-0.5 shrink-0" title="โครงการถูกล็อกข้อมูลตั้งต้นตามระเบียบ">
                                  <Lock className="w-2.5 h-2.5" /> แผนตั้งต้นล็อก
                                </span>
                              )}
                              {p.unlockedForEdit && (
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-0.5 shrink-0" title={`Admin ปลดล็อกให้แก้ไข: ${p.unlockReason || 'อนุมัติตามระเบียบ'}`}>
                                  <Unlock className="w-2.5 h-2.5" /> ปลดล็อกแก้ไขได้
                                </span>
                              )}
                            </button>
                            {p.timeframeText && (
                              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                {p.timeframeText}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {p.division}
                            </span>
                            {p.responsiblePerson?.name && p.responsiblePerson.name !== '-' && (
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[110px]" title={p.responsiblePerson.name}>
                                {p.responsiblePerson.name}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap text-[11px]">
                            {formatCurrency(p.budgetAllocated)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap text-[11px]">
                            {formatCurrency(p.budgetSpent)}
                          </td>
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="w-14 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-500 ${
                                    percentNumber >= 100 ? 'bg-emerald-500' : percentNumber > 50 ? 'bg-blue-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${percentNumber}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-7 text-right">
                                {percentNumber}%
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border ${
                              p.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60'
                                : p.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/60'
                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}>
                              {p.status === 'COMPLETED' ? 'แล้วเสร็จ' : p.status === 'IN_PROGRESS' ? 'กำลังดำเนินการ' : 'ยังไม่เริ่ม'}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1 whitespace-nowrap relative">
                              {/* 1. ดูรายละเอียด */}
                              <button
                                onClick={() => onViewProjectDetails(p)}
                                title="ดูรายละเอียดโครงการ"
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-400 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* 2. รายงานผล สนย.3 */}
                              <button
                                onClick={() => onOpenReportProgress(p)}
                                disabled={!canEditProject(p) && currentUser.role !== 'ADMIN'}
                                title="รายงานผลรอบ 2 เดือน (สนย.3)"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#0a4d44] dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                <Clock className="w-3.5 h-3.5" />
                              </button>

                              {/* 3. แก้ไขข้อมูล */}
                              <button
                                onClick={() => onOpenEditProject(p)}
                                disabled={!isOwner}
                                title={isOwner ? 'แก้ไขข้อมูลโครงการ' : (p.isBaselineLocked && !p.unlockedForEdit ? 'โครงการถูกล็อกข้อมูลตั้งต้นตามระเบียบ' : 'ไม่มีสิทธิ์แก้ไข')}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isOwner 
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-400 cursor-pointer' 
                                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                }`}
                              >
                                {isOwner ? <Edit3 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>

                              {/* 4. เมนูเพิ่มเติม (...) */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenActionMenuId(openActionMenuId === p.id ? null : p.id);
                                  }}
                                  title="ตัวเลือกเพิ่มเติม"
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {openActionMenuId === p.id && (
                                  <div 
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-30 text-left text-xs"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => { toggleExpand(p.id); setOpenActionMenuId(null); }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                                    >
                                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                                      <span>{isExpanded ? 'ซ่อนขั้นตอนไทม์ไลน์' : 'แสดงขั้นตอนไทม์ไลน์'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => { onOpenBudgetTransfer(p); setOpenActionMenuId(null); }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                                    >
                                      <Scale className="w-3.5 h-3.5 text-amber-600" />
                                      <span>ขอโอนงบประมาณ</span>
                                    </button>

                                    {currentUser.role === 'ADMIN' && (
                                      <button
                                        type="button"
                                        onClick={() => { setProjectToUnlock(p); setOpenActionMenuId(null); }}
                                        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                                      >
                                        {p.unlockedForEdit ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                                        <span>{p.unlockedForEdit ? 'ล็อกข้อมูลตั้งต้น' : 'ปลดล็อกสิทธิ์แก้ไข'}</span>
                                      </button>
                                    )}

                                    {canDeleteProject(p) && (
                                      <button
                                        type="button"
                                        onClick={() => { handleDelete(p); setOpenActionMenuId(null); }}
                                        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 cursor-pointer border-t border-slate-100 dark:border-slate-700 mt-1"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                        <span>ลบโครงการ</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Workflow Timeline Stepper */}
                        {isExpanded && (
                          <tr className="bg-slate-900 text-white">
                            <td colSpan={9} className="p-4">
                              <WorkflowStepper 
                                project={p} 
                                onOpenReport={() => onOpenReportProgress(p)}
                                onOpenTransfer={() => onOpenBudgetTransfer(p)}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              แสดง {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} จาก {totalItems} รายการ
            </div>

            <div className="flex items-center gap-2">
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs"
              >
                <option value={5}>5 รายการ / หน้า (พอดีจอเล็ก)</option>
                <option value={8}>8 รายการ / หน้า</option>
                <option value={10}>10 รายการ / หน้า</option>
                <option value={20}>20 รายการ / หน้า</option>
              </select>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#0a4d44] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProjects.map((p) => {
            const isOwner = canEditProject(p);
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#0a4d44] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                        {p.code}
                      </span>
                      {p.isStrategic && (
                        <span 
                          className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold shrink-0"
                          title={p.strategicPillar && STRATEGIC_PILLARS[p.strategicPillar as keyof typeof STRATEGIC_PILLARS] ? `ยุทธศาสตร์ที่ ${p.strategicPillar}: ${STRATEGIC_PILLARS[p.strategicPillar as keyof typeof STRATEGIC_PILLARS]}` : 'โครงการยุทธศาสตร์'}
                        >
                          {p.strategicPillar ? `ยุทธศาสตร์ที่ ${p.strategicPillar}` : 'ยุทธศาสตร์'}
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border ${
                      p.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60'
                        : p.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/60'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}>
                      {p.status === 'COMPLETED' ? 'แล้วเสร็จ' : p.status === 'IN_PROGRESS' ? 'กำลังดำเนินการ' : 'ยังไม่เริ่ม'}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onViewProjectDetails(p)}
                    className="text-base font-bold text-slate-800 dark:text-white leading-snug line-clamp-2 cursor-pointer hover:text-[#0a4d44] dark:hover:text-emerald-400 transition-colors"
                  >
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {p.division} • {p.responsiblePerson?.name}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline text-xs">
                    <span className="text-slate-500">งบจัดสรร:</span>
                    <span className="font-bold text-slate-800 dark:text-white font-mono">
                      {formatCurrency(p.budgetAllocated)} บ.
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs mt-1">
                    <span className="text-slate-500">เบิกจ่ายแล้ว:</span>
                    <span className="font-bold text-emerald-600 font-mono">
                      {formatCurrency(p.budgetSpent)} บ. ({p.progressPercent}%)
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onViewProjectDetails(p)}
                    className="text-xs font-bold text-[#0a4d44] hover:underline"
                  >
                    ดูรายละเอียด &rarr;
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenReportProgress(p)}
                      disabled={!isOwner}
                      className="p-1.5 rounded-lg bg-emerald-50 text-[#0a4d44] hover:bg-emerald-100 disabled:opacity-40"
                      title="รายงานผล สนย.3"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenBudgetTransfer(p)}
                      disabled={!isOwner}
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40"
                      title="โอนงบประมาณ"
                    >
                      <Scale className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unlock Project Modal */}
      <UnlockProjectModal
        isOpen={!!projectToUnlock}
        project={projectToUnlock}
        onClose={() => setProjectToUnlock(null)}
      />

      {/* Email Dispatch History Modal */}
      <EmailHistoryModal
        isOpen={isEmailHistoryOpen}
        onClose={() => setIsEmailHistoryOpen(false)}
      />
    </div>
  );
};
