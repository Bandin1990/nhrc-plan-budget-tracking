import React, { useState } from 'react';
import { Printer, Download, ArrowLeft, ToggleLeft, ToggleRight, Building2, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { NHRC_UNITS, BUDGET_PROGRAMS, NHRCUnit, ProgramCode } from '../../types/project';
import { toThaiNumerals, formatCurrency } from '../../utils/thaiNumber';

interface ExecutivePrintReportProps {
  onBack: () => void;
}

export const ExecutivePrintReport: React.FC<ExecutivePrintReportProps> = ({ onBack }) => {
  const { projects, fiscalYear } = useProjects();
  const [useThaiNumerals, setUseThaiNumerals] = useState(false);
  const [filterScope, setFilterScope] = useState<'all' | 'strategic'>('all');

  const num = (val: string | number) => {
    return useThaiNumerals ? toThaiNumerals(val) : val.toString();
  };

  const curr = (val: number) => {
    return formatCurrency(val, useThaiNumerals);
  };

  const rawYearProjects = projects.filter(p => (p.fiscalYear || 2569) === fiscalYear);
  const strategicYearProjects = rawYearProjects.filter(p => p.isStrategic);
  const yearProjects = filterScope === 'strategic' ? strategicYearProjects : rawYearProjects;

  const totalProjects = yearProjects.length;
  const totalAllocated = yearProjects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0);
  const totalSpent = yearProjects.reduce((sum, p) => sum + (p.budgetSpent || 0), 0);
  const remaining = totalAllocated - totalSpent;
  const spentPercent = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : '0.0';

  const completed = yearProjects.filter(p => p.status === 'COMPLETED').length;
  const inProgress = yearProjects.filter(p => p.status === 'IN_PROGRESS').length;
  const delayed = yearProjects.filter(p => p.status === 'DELAYED' || (p.progressPercent < 40 && p.status === 'IN_PROGRESS')).length;

  // Breakdown by 6 Programs
  const programKeys = Object.keys(BUDGET_PROGRAMS) as ProgramCode[];
  const programStats = programKeys.map((pKey) => {
    const projs = yearProjects.filter(p => p.programCode === pKey);
    const allocated = projs.reduce((s, p) => s + (p.budgetAllocated || 0), 0);
    const spent = projs.reduce((s, p) => s + (p.budgetSpent || 0), 0);
    return {
      code: pKey,
      name: BUDGET_PROGRAMS[pKey].name,
      shortName: BUDGET_PROGRAMS[pKey].shortName,
      projectCount: projs.length,
      allocated,
      spent,
      percent: allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : '0.0'
    };
  }).filter(p => p.allocated > 0);

  // Breakdown by Units
  const unitKeys = Object.keys(NHRC_UNITS) as NHRCUnit[];
  const unitStats = unitKeys.map((uKey) => {
    const projs = yearProjects.filter(p => p.division === uKey);
    const allocated = projs.reduce((s, p) => s + (p.budgetAllocated || 0), 0);
    const spent = projs.reduce((s, p) => s + (p.budgetSpent || 0), 0);
    return {
      code: uKey,
      name: NHRC_UNITS[uKey].fullName,
      projectCount: projs.length,
      allocated,
      spent,
      percent: allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : '0.0'
    };
  }).filter(u => u.allocated > 0)
    .sort((a, b) => b.allocated - a.allocated);

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
                ตัวอย่างก่อนพิมพ์: รายงานสรุปผลการดำเนินงานสำหรับผู้บริหาร (ปี {fiscalYear})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                รายงานภาพรวมงบประมาณรายจ่ายและการดำเนินงาน จำแนกตามยุทธศาสตร์และสำนัก
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Scope Filter Switcher */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl text-xs border border-slate-200 dark:border-slate-700 shadow-xs">
              <button
                onClick={() => setFilterScope('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterScope === 'all'
                    ? 'bg-slate-100 dark:bg-slate-700 text-[#0a4d44] dark:text-emerald-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                โครงการทั้งหมด ({rawYearProjects.length})
              </button>
              <button
                onClick={() => setFilterScope('strategic')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterScope === 'strategic'
                    ? 'bg-slate-100 dark:bg-slate-700 text-[#0a4d44] dark:text-emerald-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                เฉพาะเชิงยุทธศาสตร์ ({strategicYearProjects.length})
              </button>
            </div>

            <button
              onClick={() => setUseThaiNumerals(!useThaiNumerals)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                useThaiNumerals
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-[#0a4d44] dark:text-emerald-300 border-emerald-300'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {useThaiNumerals ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
              <span>{useThaiNumerals ? 'กำลังใช้เลขไทย' : 'กำลังใช้เลขอารบิก'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-[#0a4d44] hover:bg-[#083b34] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์รายงาน (Print / PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* A4 Document Printable Canvas */}
      <div 
        className="mt-6 mx-auto bg-white text-black shadow-2xl p-10 sm:p-14 print-container rounded-sm"
        style={{
          width: '210mm',
          minHeight: '297mm',
          fontFamily: "'Sarabun', 'TH Sarabun New', sans-serif",
          fontSize: '14pt',
          lineHeight: '1.35'
        }}
      >
        {/* Title Header */}
        <div className="text-center pb-4 border-b-2 border-slate-800 mb-6">
          <h1 className="text-[19pt] font-bold tracking-tight">
            รายงานสรุปผลการดำเนินงานและการใช้จ่ายงบประมาณสำหรับผู้บริหาร
          </h1>
          <h2 className="text-[16pt] font-semibold text-slate-800">
            ตามแผนปฏิบัติการประจำปีงบประมาณ พ.ศ. {num(fiscalYear)}
            {filterScope === 'strategic' ? ' (เฉพาะโครงการเชิงยุทธศาสตร์)' : ''}
          </h2>
          <p className="text-[13pt] text-slate-600 mt-1">
            สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ (สำนักนโยบายและยุทธศาสตร์)
          </p>
          <p className="text-[12pt] text-slate-500">
            ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Executive Highlights Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6 text-center text-[13pt]">
          <div className="p-3 border border-slate-300 rounded bg-slate-50">
            <span className="text-slate-500 block text-[11pt]">โครงการทั้งหมด</span>
            <strong className="text-[17pt] text-slate-900 block">{num(totalProjects)}</strong>
            <span className="text-[11pt] text-slate-500">โครงการ</span>
          </div>

          <div className="p-3 border border-slate-300 rounded bg-slate-50">
            <span className="text-slate-500 block text-[11pt]">งบประมาณจัดสรร</span>
            <strong className="text-[15pt] text-slate-900 block font-mono">{curr(totalAllocated)}</strong>
            <span className="text-[11pt] text-slate-500">บาท</span>
          </div>

          <div className="p-3 border border-slate-300 rounded bg-emerald-50 border-emerald-300">
            <span className="text-emerald-800 block text-[11pt]">เบิกจ่ายจริงแล้ว</span>
            <strong className="text-[15pt] text-emerald-700 block font-mono">{curr(totalSpent)}</strong>
            <span className="text-[11pt] text-emerald-800 font-bold">({num(spentPercent)}%)</span>
          </div>

          <div className="p-3 border border-slate-300 rounded bg-slate-50">
            <span className="text-slate-500 block text-[11pt]">งบประมาณคงเหลือ</span>
            <strong className="text-[15pt] text-slate-800 block font-mono">{curr(remaining)}</strong>
            <span className="text-[11pt] text-slate-500">บาท</span>
          </div>
        </div>

        {/* 1. Summary by 6 Programs */}
        <div className="mb-6">
          <h3 className="text-[15pt] font-bold text-slate-900 mb-2">
            {num(1)}. สรุปการใช้จ่ายงบประมาณจำแนกตาม 6 แผนงานหลัก
          </h3>

          <table className="w-full text-[12pt] border-collapse border border-black">
            <thead>
              <tr className="bg-slate-100 text-center font-bold">
                <th className="border border-black p-1.5 w-10">ลำดับ</th>
                <th className="border border-black p-1.5 text-left">แผนงาน</th>
                <th className="border border-black p-1.5 w-20">โครงการ</th>
                <th className="border border-black p-1.5 w-32 text-right">งบจัดสรร (บาท)</th>
                <th className="border border-black p-1.5 w-32 text-right">เบิกจ่ายแล้ว (บาท)</th>
                <th className="border border-black p-1.5 w-24 text-center">ร้อยละ (%)</th>
              </tr>
            </thead>
            <tbody>
              {programStats.map((p, idx) => (
                <tr key={p.code}>
                  <td className="border border-black p-1.5 text-center font-mono">{num(idx + 1)}</td>
                  <td className="border border-black p-1.5 font-semibold">{p.name}</td>
                  <td className="border border-black p-1.5 text-center">{num(p.projectCount)}</td>
                  <td className="border border-black p-1.5 text-right font-mono">{curr(p.allocated)}</td>
                  <td className="border border-black p-1.5 text-right font-mono font-bold text-emerald-700">{curr(p.spent)}</td>
                  <td className="border border-black p-1.5 text-center font-bold">{num(p.percent)}%</td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={2} className="border border-black p-1.5 text-right">รวมทั้งสิ้น</td>
                <td className="border border-black p-1.5 text-center">{num(totalProjects)}</td>
                <td className="border border-black p-1.5 text-right font-mono">{curr(totalAllocated)}</td>
                <td className="border border-black p-1.5 text-right font-mono text-emerald-700">{curr(totalSpent)}</td>
                <td className="border border-black p-1.5 text-center">{num(spentPercent)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Summary by 14 Units */}
        <div className="mb-6">
          <h3 className="text-[15pt] font-bold text-slate-900 mb-2">
            {num(2)}. สรุปการใช้จ่ายงบประมาณจำแนกตามส่วนราชการ (14 สำนัก)
          </h3>

          <table className="w-full text-[12pt] border-collapse border border-black">
            <thead>
              <tr className="bg-slate-100 text-center font-bold">
                <th className="border border-black p-1.5 w-10">ลำดับ</th>
                <th className="border border-black p-1.5 text-left">สำนัก / ส่วนราชการ</th>
                <th className="border border-black p-1.5 w-20">โครงการ</th>
                <th className="border border-black p-1.5 w-32 text-right">งบจัดสรร (บาท)</th>
                <th className="border border-black p-1.5 w-32 text-right">เบิกจ่ายแล้ว (บาท)</th>
                <th className="border border-black p-1.5 w-24 text-center">ร้อยละ (%)</th>
              </tr>
            </thead>
            <tbody>
              {unitStats.slice(0, 10).map((u, idx) => (
                <tr key={u.code}>
                  <td className="border border-black p-1.5 text-center font-mono">{num(idx + 1)}</td>
                  <td className="border border-black p-1.5">
                    <strong>{u.code}</strong> - {u.name}
                  </td>
                  <td className="border border-black p-1.5 text-center">{num(u.projectCount)}</td>
                  <td className="border border-black p-1.5 text-right font-mono">{curr(u.allocated)}</td>
                  <td className="border border-black p-1.5 text-right font-mono font-bold text-emerald-700">{curr(u.spent)}</td>
                  <td className="border border-black p-1.5 text-center font-bold">{num(u.percent)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Sign-off */}
        <div className="pt-8 text-center text-[13pt] flex justify-end">
          <div className="w-72">
            <div className="h-10"></div>
            <p className="font-bold">(นางสาวสุกัญญา ตันสายเพชร)</p>
            <p className="text-slate-700">ผู้อำนวยการสำนักนโยบายและยุทธศาสตร์</p>
            <p className="text-slate-500">สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
