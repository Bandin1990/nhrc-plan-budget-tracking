import React from 'react';
import { TrendingUp, DollarSign, Calendar, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { BUDGET_PROGRAMS, NHRC_UNITS, ProgramCode, NHRCUnit } from '../../types/project';
import { formatCurrency } from '../../utils/thaiNumber';

export const BudgetComparisonView: React.FC = () => {
  const { projects, fiscalYear } = useProjects();

  const yearProjects = projects.filter(p => (p.fiscalYear || 2569) === fiscalYear);
  const totalAllocated = yearProjects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0);
  const totalSpent = yearProjects.reduce((sum, p) => sum + (p.budgetSpent || 0), 0);
  const spentPercent = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : '0.0';

  const programKeys = Object.keys(BUDGET_PROGRAMS) as ProgramCode[];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-[#0a4d44] rounded-full inline-block"></span>
            <span>แผน vs ผลการใช้จ่ายงบประมาณ สำนักงาน กสม. ประจำปี พ.ศ. {fiscalYear}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            วิเคราะห์เปรียบเทียบวงเงินที่ได้รับจัดสรรตาม พ.ร.บ. งบประมาณ กับ ยอดเบิกจ่ายจริงตามรอบระยะเวลา
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">อัตราเบิกจ่ายภาพรวม</span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {spentPercent}%
          </span>
        </div>
      </div>

      {/* Program Breakdown Cards */}
      <div className="space-y-4">
        {programKeys.map((pKey) => {
          const prog = BUDGET_PROGRAMS[pKey];
          const progProjects = yearProjects.filter(p => p.programCode === pKey);
          const allocated = progProjects.reduce((s, p) => s + (p.budgetAllocated || 0), 0);
          const spent = progProjects.reduce((s, p) => s + (p.budgetSpent || 0), 0);
          const rate = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : '0.0';

          return (
            <div key={pKey} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-[#0a4d44] text-white px-2 py-0.5 rounded">
                      {prog.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                      {prog.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    มี {progProjects.length} โครงการ/รายการย่อยภายใต้แผนงานนี้
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">งบจัดสรร:</span>
                    <strong className="font-mono text-slate-800 dark:text-white">{formatCurrency(allocated)} บ.</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">เบิกจ่ายแล้ว:</span>
                    <strong className="font-mono text-emerald-600 font-bold">{formatCurrency(spent)} บ.</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">ร้อยละ:</span>
                    <span className="font-bold text-slate-800 dark:text-white font-mono">{rate}%</span>
                  </div>
                </div>
              </div>

              {/* Multi-tier Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#0a4d44] dark:bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, parseFloat(rate))}%` }}
                ></div>
              </div>

              {/* Projects in this program */}
              {progProjects.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  {progProjects.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-slate-600 dark:text-slate-300 py-1">
                      <span className="truncate max-w-md">
                        • <strong className="font-mono text-slate-700 dark:text-slate-200">{p.code}:</strong> {p.name}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-slate-500">{formatCurrency(p.budgetAllocated)} บ.</span>
                        <span className="font-bold text-emerald-600">{p.progressPercent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
