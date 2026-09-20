import React from 'react';
import { Building2, Users, DollarSign, CheckCircle2, ChevronRight } from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { NHRC_UNITS, NHRCUnit } from '../../types/project';
import { formatCurrency } from '../../utils/thaiNumber';

interface UnitBreakdownViewProps {
  onSelectUnitFilter: (unitCode: string) => void;
}

export const UnitBreakdownView: React.FC<UnitBreakdownViewProps> = ({ onSelectUnitFilter }) => {
  const { projects, fiscalYear } = useProjects();

  const unitKeys = Object.keys(NHRC_UNITS) as NHRCUnit[];
  const yearProjects = projects.filter(p => (p.fiscalYear || 2569) === fiscalYear);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-[#0a4d44] rounded-full inline-block"></span>
            <span>รายงานจำแนกตามสำนัก (ปีงบประมาณ {fiscalYear})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            สรุปผลการดำเนินงานและการใช้จ่ายงบประมาณจำแนกตาม 14 สำนัก/ส่วนราชการ ตามโครงสร้างสำนักงาน กสม.
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/40 text-[#0a4d44] dark:text-emerald-300 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
          ปีงบประมาณ {fiscalYear} ({yearProjects.length} โครงการ)
        </div>
      </div>

      {/* Grid of 14 Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unitKeys.map((uKey) => {
          const info = NHRC_UNITS[uKey];
          const unitProjects = yearProjects.filter(p => p.division === uKey);
          const allocated = unitProjects.reduce((s, p) => s + (p.budgetAllocated || 0), 0);
          const spent = unitProjects.reduce((s, p) => s + (p.budgetSpent || 0), 0);
          const percent = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : '0.0';

          return (
            <div
              key={uKey}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs bg-[#0a4d44] text-white px-2 py-0.5 rounded font-mono">
                    {info.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {unitProjects.length} โครงการ
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-[#0a4d44] transition-colors leading-snug">
                  {info.fullName}
                </h3>

                <div className="mt-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-500">กลุ่มงานภายใน:</span>
                  <p className="truncate mt-0.5">{info.subDivisions.join(', ')}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">งบจัดสรร:</span>
                    <strong className="font-mono text-slate-800 dark:text-white">{formatCurrency(allocated)} บ.</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">เบิกจ่ายแล้ว:</span>
                    <strong className="font-mono text-emerald-600 font-bold">{formatCurrency(spent)} บ. ({percent}%)</strong>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className="bg-[#0a4d44] dark:bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, parseFloat(percent))}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => onSelectUnitFilter(info.code)}
                className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-[#0a4d44] dark:text-emerald-400 flex items-center justify-between hover:underline"
              >
                <span>ดูรายการโครงการของสำนักนี้</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
