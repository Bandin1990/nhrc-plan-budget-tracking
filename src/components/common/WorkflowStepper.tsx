import React from 'react';
import { CheckCircle2, Circle, Clock, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { Project } from '../../types/project';

interface WorkflowStepperProps {
  project: Project;
  onOpenReport?: () => void;
  onOpenTransfer?: () => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ 
  project, 
  onOpenReport, 
  onOpenTransfer 
}) => {
  const steps = [
    {
      id: 1,
      title: 'จัดทำคำขอและแผนงาน',
      dateText: project.startDate || '1 ต.ค. 68',
      status: 'completed',
      detail: 'ผ่านความเห็นชอบ กสม.'
    },
    {
      id: 2,
      title: 'เริ่มดำเนินการกิจกรรม',
      dateText: project.timeframeText.split('ถึง')[0].replace('เดือน', '').trim() || 'ธ.ค. 68',
      status: project.progressPercent > 10 ? 'completed' : 'in_progress',
      detail: `${project.activities.length} กิจกรรมย่อย`
    },
    {
      id: 3,
      title: 'รายงานผลรอบ 2 เดือน (สนย.3)',
      dateText: project.lastReportDate || 'รอรอบรายงาน',
      status: project.lastReportRound ? 'completed' : (project.progressPercent > 20 ? 'in_progress' : 'pending'),
      detail: project.lastReportRound || 'รอบที่ 6'
    },
    {
      id: 4,
      title: 'เบิกจ่ายงบประมาณ',
      dateText: `${((project.budgetSpent / project.budgetAllocated) * 100).toFixed(0)}%`,
      status: project.budgetSpent >= project.budgetAllocated ? 'completed' : (project.budgetSpent > 0 ? 'in_progress' : 'pending'),
      detail: `เบิกแล้ว ${project.budgetSpent.toLocaleString()} บ.`
    },
    {
      id: 5,
      title: 'ประเมินผลสำเร็จโครงการ',
      dateText: project.endDate || '30 ก.ย. 69',
      status: project.status === 'COMPLETED' ? 'completed' : 'pending',
      detail: project.status === 'COMPLETED' ? 'บรรลุตัวชี้วัด' : 'อยู่ระหว่างดำเนินการ'
    }
  ];

  return (
    <div className="bg-slate-900/90 dark:bg-slate-950 text-white rounded-xl p-4 my-2 border border-slate-700/60 shadow-inner">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-400">
            เส้นทางความก้าวหน้าโครงการ — {project.code}
          </span>
          <span className="text-[11px] text-slate-400">
            ({project.name})
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="text-emerald-300 hover:text-white flex items-center gap-1 hover:underline text-[11px]"
            >
              <span>เปิดบันทึกรายงานผล สนย.3</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Stepper Track */}
      <div className="relative px-2 pt-3 pb-2">
        {/* Node Circles Row with Centered Connector Line */}
        <div className="relative flex items-center justify-between mb-3 px-4">
          {/* Connector Line - Exactly centered vertically behind circles */}
          <div className="absolute top-1/2 -translate-y-1/2 left-8 right-8 h-1.5 bg-slate-800 rounded-full z-0 overflow-hidden border border-slate-700/50">
            <div 
              className="h-full bg-emerald-500 transition-all duration-700 rounded-full shadow-sm"
              style={{ width: `${Math.min(100, Math.max(8, project.progressPercent))}%` }}
            ></div>
          </div>

          {steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-md ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-300 text-white shadow-emerald-950/60'
                      : isInProgress
                      ? 'bg-amber-500 border-amber-200 text-white ring-4 ring-amber-500/30 animate-pulse'
                      : 'bg-slate-800 border-slate-600 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : isInProgress ? (
                    <Clock className="w-5 h-5 text-white" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Labels Row - 5 Columns Grid matching the nodes */}
        <div className="grid grid-cols-5 gap-1.5 text-center">
          {steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';
            return (
              <div key={step.id} className="flex flex-col items-center px-0.5">
                <span className={`text-xs sm:text-sm font-bold leading-snug ${isInProgress ? 'text-amber-300' : isCompleted ? 'text-emerald-300' : 'text-slate-200'}`}>
                  {step.title}
                </span>
                <span className="text-xs font-semibold text-emerald-400/90 font-mono mt-1">{step.dateText}</span>
                <span className="text-[11px] font-medium text-slate-300/90 mt-0.5">{step.detail}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
