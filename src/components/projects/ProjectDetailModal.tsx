import React from 'react';
import { 
  X, Calendar, Building2, User as UserIcon, DollarSign, 
  TrendingUp, Clock, Scale, Printer, CheckCircle2, AlertCircle, Edit3, Coins
} from 'lucide-react';
import { Project, BUDGET_PROGRAMS, NHRC_UNITS } from '../../types/project';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, fromThaiNumerals } from '../../utils/thaiNumber';
import { WorkflowStepper } from '../common/WorkflowStepper';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReportProgress: (project: Project) => void;
  onOpenBudgetTransfer: (project: Project) => void;
  onOpenBudgetReturn?: (project: Project) => void;
  onOpenEditProject: (project: Project) => void;
  onPrintReport: (reportId: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  onOpenReportProgress,
  onOpenBudgetTransfer,
  onOpenBudgetReturn,
  onOpenEditProject,
  onPrintReport,
}) => {
  const { getReportsForProject, memos } = useProjects();
  const { canEditProject } = useAuth();

  if (!isOpen || !project) return null;

  const isOwner = canEditProject(project);
  const projectReports = getReportsForProject(project.id);
  const projectMemos = memos.filter(m => 
    m.tableRows.some(r => r.activityCode.includes(project.code) || r.itemDescription.includes(project.name))
  );

  const remaining = project.budgetAllocated - project.budgetSpent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0a4d44] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded">
                {project.code}
              </span>
              {project.isStrategic && (
                <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                  โครงการเชิงยุทธศาสตร์
                </span>
              )}
            </div>
            <h3 className="font-bold text-base mt-1 text-white">
              {project.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-[#073b34]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Stepper */}
          <WorkflowStepper
            project={project}
            onOpenReport={() => onOpenReportProgress(project)}
            onOpenTransfer={() => onOpenBudgetTransfer(project)}
          />

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[11px]">งบประมาณจัดสรร</span>
              <strong className="text-sm font-bold font-mono text-slate-800 dark:text-white">
                {formatCurrency(project.budgetAllocated)} บ.
              </strong>
            </div>

            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <span className="text-emerald-700 dark:text-emerald-300 block text-[11px]">เบิกจ่ายแล้ว</span>
              <strong className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {formatCurrency(project.budgetSpent)} บ. ({project.progressPercent}%)
              </strong>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[11px]">งบประมาณคงเหลือ</span>
              <strong className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300">
                {formatCurrency(remaining)} บ.
              </strong>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[11px]">สถานะโครงการ</span>
              <strong className="text-xs font-bold text-[#0a4d44] dark:text-emerald-400">
                {project.status === 'COMPLETED' ? '✓ แล้วเสร็จ' : project.status === 'IN_PROGRESS' ? '● กำลังทำ' : '✕ ยังไม่เริ่ม'}
              </strong>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: General & Officer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-xs">
                <Building2 className="w-3.5 h-3.5 text-[#0a4d44]" />
                <span>ข้อมูลหน่วยงานและผู้รับผิดชอบ</span>
              </h4>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300 pt-1">
                <p><span className="text-slate-400">สำนัก:</span> {NHRC_UNITS[project.division]?.fullName || project.division}</p>
                <p><span className="text-slate-400">กลุ่มงาน:</span> {project.subDivision}</p>
                <p><span className="text-slate-400">แผนงาน:</span> {BUDGET_PROGRAMS[project.programCode]?.name}</p>
                <p><span className="text-slate-400">ช่วงเวลา:</span> {project.timeframeText}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p><span className="text-slate-400">ผู้รับผิดชอบ:</span> <strong className="text-slate-800 dark:text-white">{project.responsiblePerson?.name}</strong></p>
                  <p><span className="text-slate-400">ตำแหน่ง:</span> {project.responsiblePerson?.position}</p>
                  <p><span className="text-slate-400">เบอร์โทรศัพท์:</span> {fromThaiNumerals(project.responsiblePerson?.phone || '')}</p>
                  <p><span className="text-slate-400">อีเมล:</span> {project.responsiblePerson?.email}</p>
                </div>
              </div>
            </div>

            {/* Right: Objectives & Expected outputs */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs">
                วัตถุประสงค์และตัวชี้วัดความสำเร็จ
              </h4>
              <div className="space-y-2 pt-1">
                <div>
                  <span className="text-slate-400 font-bold block mb-1">วัตถุประสงค์:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    {project.objectives.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>

                {project.indicators.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-bold block mb-1">ตัวชี้วัดความสำเร็จ:</span>
                    {project.indicators.map((ind, i) => (
                      <div key={i} className="text-slate-700 dark:text-slate-300">
                        • {ind.title}: <strong className="text-emerald-600">{ind.actual || ind.target}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activities Breakdown */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-white text-xs">
              กิจกรรมและแผนการใช้จ่ายงบประมาณ ({project.activities.length} กิจกรรม)
            </h4>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">กิจกรรม</th>
                    <th className="py-2.5 px-3 w-32">ช่วงเวลา</th>
                    <th className="py-2.5 px-3 w-28 text-right">แผนงบ (บ.)</th>
                    <th className="py-2.5 px-3 w-28 text-right">เบิกจ่าย (บ.)</th>
                    <th className="py-2.5 px-3 w-28 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {project.activities.map((a, i) => (
                    <tr key={i}>
                      <td className="p-3 font-medium">{a.name}</td>
                      <td className="p-3 text-slate-500">{a.timeframe}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(a.plannedBudget)}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">{formatCurrency(a.actualSpent)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {a.status === 'completed' ? 'แล้วเสร็จ' : 'กำลังทำ'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reports History */}
          {projectReports.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs flex items-center justify-between">
                <span>ประวัติรายงานผลรอบ 2 เดือน (แบบ สนย.3)</span>
                <span className="text-[11px] text-slate-400">{projectReports.length} ฉบับ</span>
              </h4>
              <div className="space-y-1.5">
                {projectReports.map((rep) => (
                  <div key={rep.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between border border-slate-100 dark:border-slate-700">
                    <div>
                      <strong className="text-slate-800 dark:text-white">{rep.asOfDateText}</strong>
                      <span className="text-[11px] text-slate-400 block">โดย {rep.section6?.name}</span>
                    </div>
                    <button
                      onClick={() => onPrintReport(rep.id)}
                      className="flex items-center gap-1 bg-[#0a4d44] hover:bg-[#083b34] text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>พิมพ์แบบ สนย.3</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            ปิด
          </button>

          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => onOpenEditProject(project)}
                className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>แก้ไขโครงการ</span>
              </button>
            )}

            <button
              onClick={() => onOpenReportProgress(project)}
              disabled={!isOwner}
              className="flex items-center gap-1.5 bg-[#0a4d44] hover:bg-[#083b34] text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>บันทึกรายงานผล 2 เดือน (สนย.3)</span>
            </button>

            <button
              onClick={() => onOpenBudgetTransfer(project)}
              disabled={!isOwner}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>ขอโอน/เปลี่ยนแปลงงบ</span>
            </button>

            {onOpenBudgetReturn && (project.budgetAllocated - project.budgetSpent > 0) && (
              <button
                onClick={() => onOpenBudgetReturn(project)}
                disabled={!isOwner}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer shadow-xs"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>ส่งคืนงบเหลือจ่ายเข้าส่วนกลาง</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
