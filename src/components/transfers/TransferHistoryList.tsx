import React, { useState, useMemo } from 'react';
import { 
  Scale, Printer, Plus, FileText, CheckCircle2, ChevronRight, 
  Search, Filter, Calendar, Building2, Banknote, Clock, 
  AlertTriangle, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { OfficialMemoData } from '../../types/budget';
import { formatCurrency, fromThaiNumerals } from '../../utils/thaiNumber';
import { NHRC_UNITS, NHRCUnit } from '../../types/project';

interface TransferHistoryListProps {
  onOpenNewTransfer: () => void;
  onPrintMemo: (memo: OfficialMemoData) => void;
}

export const TransferHistoryList: React.FC<TransferHistoryListProps> = ({
  onOpenNewTransfer,
  onPrintMemo,
}) => {
  const { memos, fiscalYear } = useProjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedMemoId, setExpandedMemoId] = useState<string | null>(null);

  // Filter memos for current fiscal year
  const yearMemos = useMemo(() => {
    return memos.filter(m => (m.fiscalYear || 2569) === fiscalYear);
  }, [memos, fiscalYear]);

  // Available divisions
  const availableDivisions = useMemo(() => {
    const divs = new Set<string>();
    yearMemos.forEach(m => {
      if (m.division) divs.add(m.division);
    });
    return Array.from(divs).sort();
  }, [yearMemos]);

  // Filtered memos
  const filteredMemos = useMemo(() => {
    return yearMemos.filter(m => {
      // Division filter
      if (selectedDivision !== 'all' && m.division !== selectedDivision) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && m.status !== selectedStatus) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const book = fromThaiNumerals(m.bookNumber || '').toLowerCase();
        const subj = fromThaiNumerals(m.subject || '').toLowerCase();
        const div = (m.division || '').toLowerCase();
        const apprv = fromThaiNumerals(m.approverTitle || '').toLowerCase();
        return book.includes(q) || subj.includes(q) || div.includes(q) || apprv.includes(q);
      }
      return true;
    });
  }, [yearMemos, selectedDivision, selectedStatus, searchTerm]);

  // KPI Calculations
  const stats = useMemo(() => {
    const totalCount = yearMemos.length;
    const approvedCount = yearMemos.filter(m => m.status === 'approved').length;
    let totalTransferBudget = 0;

    yearMemos.forEach(m => {
      if (m.tableRows && m.tableRows.length > 0) {
        const posAmount = m.tableRows
          .filter(r => r.transferAmount > 0)
          .reduce((sum, r) => sum + r.transferAmount, 0);
        totalTransferBudget += posAmount;
      }
    });

    const uniqueDivisions = new Set(yearMemos.map(m => m.division)).size;

    return {
      totalCount,
      approvedCount,
      totalTransferBudget,
      uniqueDivisions,
    };
  }, [yearMemos]);

  // Helper to compute transfer total for a single memo
  const getMemoTotalAmount = (memo: OfficialMemoData): number => {
    if (!memo.tableRows || memo.tableRows.length === 0) return 0;
    return memo.tableRows
      .filter(r => r.transferAmount > 0)
      .reduce((sum, r) => sum + r.transferAmount, 0);
  };

  const toggleExpand = (memoId: string) => {
    setExpandedMemoId(prev => prev === memoId ? null : memoId);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-[#0a4d44] rounded-full inline-block"></span>
            <span>ประวัติการโอนเปลี่ยนแปลงงบประมาณ (ปีงบประมาณ {fiscalYear})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ทะเบียนบันทึกข้อความขออนุมัติโอนงบประมาณตราครุฑ พร้อมตารางแสดงรายการโอน 7 คอลัมน์ (ระเบียบ กสม. พ.ศ. 2566)
          </p>
        </div>

        <button
          onClick={onOpenNewTransfer}
          className="flex items-center gap-1.5 bg-[#0a4d44] hover:bg-[#083b34] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ขอโอนเปลี่ยนแปลงงบประมาณ</span>
        </button>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Total Requests */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0a4d44] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">คำขอโอนทั้งหมด</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {stats.totalCount} <span className="text-xs font-normal text-slate-500">ฉบับ</span>
            </div>
          </div>
        </div>

        {/* Total Transferred Amount */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
            <Banknote className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">รวมวงเงินที่ขอโอน</div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              {formatCurrency(stats.totalTransferBudget, false)} <span className="text-xs font-normal text-slate-500">บาท</span>
            </div>
          </div>
        </div>

        {/* Approved Count */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-800">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">อนุมัติแล้ว</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.approvedCount} <span className="text-xs font-normal text-slate-500">ฉบับ</span>
            </div>
          </div>
        </div>

        {/* Participating Divisions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-800">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">สำนักที่ดำเนินการ</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {stats.uniqueDivisions} <span className="text-xs font-normal text-slate-500">สำนัก</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขที่หนังสือ, เรื่อง, สำนัก, หรือผู้มีอำนาจอนุมัติ..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0a4d44]/30"
            />
          </div>

          {/* Division Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4d44]/30 cursor-pointer"
            >
              <option value="all">ทุกสำนัก ({availableDivisions.length})</option>
              {availableDivisions.map((div) => (
                <option key={div} value={div}>
                  {div} - {NHRC_UNITS[div as NHRCUnit]?.fullName || div}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4d44]/30 cursor-pointer"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="pending_approval">รอการพิจารณา</option>
              <option value="draft">ร่างเอกสาร</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          แสดง {filteredMemos.length} จาก {yearMemos.length} รายการ
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-3 w-36">เลขที่หนังสือ</th>
                <th className="py-3.5 px-3 w-32">วันที่บันทึก</th>
                <th className="py-3.5 px-3 min-w-[280px]">เรื่อง / รายละเอียดคำขอ</th>
                <th className="py-3.5 px-3 w-28 text-center">สำนัก</th>
                <th className="py-3.5 px-3 w-36 text-right">วงเงินที่ขอโอน</th>
                <th className="py-3.5 px-3 w-40">ผู้มีอำนาจอนุมัติ</th>
                <th className="py-3.5 px-3 w-32 text-center">สถานะ</th>
                <th className="py-3.5 px-4 w-20 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMemos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 dark:text-slate-500">
                    <Scale className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                    <p className="font-semibold text-sm">ไม่พบรายการคำขอโอนเปลี่ยนแปลงงบประมาณ</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm || selectedDivision !== 'all' || selectedStatus !== 'all'
                        ? 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองด้านบน'
                        : `ยังไม่มีประวัติการโอนสำหรับปีงบประมาณ ${fiscalYear}`}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMemos.map((m, idx) => {
                  const isExpanded = expandedMemoId === m.id;
                  const totalAmount = getMemoTotalAmount(m);
                  const isApproved = m.status === 'approved';

                  return (
                    <React.Fragment key={m.id}>
                      <tr 
                        className={`hover:bg-emerald-50/30 dark:hover:bg-slate-800/50 transition-colors ${
                          isExpanded ? 'bg-slate-50/60 dark:bg-slate-800/40' : ''
                        }`}
                      >
                        {/* Index */}
                        <td className="py-3.5 px-4 text-center text-slate-400 font-semibold text-xs">
                          {idx + 1}
                        </td>

                        {/* Book Number (Always Arabic Numerals) */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#0a4d44] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                              {fromThaiNumerals(m.bookNumber || '')}
                            </span>
                          </div>
                        </td>

                        {/* Memo Date (Always Arabic Numerals) */}
                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{fromThaiNumerals(m.memoDate || '')}</span>
                          </div>
                        </td>

                        {/* Subject & Subtitle */}
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                            {fromThaiNumerals(m.subject || '')}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                              <Scale className="w-3 h-3 text-[#0a4d44] dark:text-emerald-400" />
                              ตาราง {m.tableRows?.length || 0} รายการ
                            </span>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => toggleExpand(m.id)}
                              className="text-[#0a4d44] dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                            >
                              <span>{isExpanded ? 'ซ่อนรายละเอียด 7 คอลัมน์' : 'ดูรายละเอียด 7 คอลัมน์'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Division */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                            {m.division}
                          </span>
                        </td>

                        {/* Transfer Amount (Bold Arabic Numerals) */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                            {formatCurrency(totalAmount, false)}
                          </div>
                          <div className="text-[10px] text-slate-400">บาท</div>
                        </td>

                        {/* Approver Title */}
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                            {fromThaiNumerals(m.approverTitle || '')}
                          </div>
                          {m.approverName && (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                              {fromThaiNumerals(m.approverName)}
                            </div>
                          )}
                        </td>

                        {/* Status Badge (Clean Text Only, No Symbols/Icons) */}
                        <td className="py-3.5 px-3 text-center">
                          {isApproved ? (
                            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                              อนุมัติแล้ว
                            </span>
                          ) : m.status === 'draft' ? (
                            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              ร่างเอกสาร
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                              รอการพิจารณา
                            </span>
                          )}
                        </td>

                        {/* Actions (Icon Button Only - Consistent with rest of system) */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => onPrintMemo(m)}
                            className="p-1.5 rounded-lg bg-[#0a4d44] hover:bg-[#083b34] text-white shadow-xs transition-all cursor-pointer inline-flex items-center justify-center"
                            title="พิมพ์บันทึกข้อความตราครุฑ (Print / PDF)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable 7-Column Table Details */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-700 animate-in fade-in duration-200">
                          <td colSpan={9} className="p-4 sm:p-5">
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                  <FileText className="w-4 h-4 text-[#0a4d44] dark:text-emerald-400" />
                                  <span>ตารางแสดงรายละเอียดการโอนเปลี่ยนแปลงงบประมาณ 7 คอลัมน์ (ตามระเบียบ กสม. พ.ศ. 2566)</span>
                                </h4>
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {fromThaiNumerals(m.bookNumber || '')} • {fromThaiNumerals(m.memoDate || '')}
                                </span>
                              </div>

                              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                <table className="w-full text-left border-collapse text-[11px]">
                                  <thead>
                                    <tr className="bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                      <th className="p-2.5 w-10 text-center">ลำดับ</th>
                                      <th className="p-2.5">รายการ / กิจกรรม</th>
                                      <th className="p-2.5 w-24 text-center">ประเภท</th>
                                      <th className="p-2.5 text-right w-28">งบประมาณเดิม</th>
                                      <th className="p-2.5 text-right w-28">จำนวนที่ขอโอน</th>
                                      <th className="p-2.5 text-right w-28">งบประมาณใหม่</th>
                                      <th className="p-2.5 text-right w-28">เบิกจ่าย/ผูกพันแล้ว</th>
                                      <th className="p-2.5 text-right w-28">คงเหลือสุทธิ</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {m.tableRows && m.tableRows.length > 0 ? (
                                      m.tableRows.map((row, rIdx) => {
                                        const isSource = row.itemType === 'source' || row.transferAmount < 0;
                                        return (
                                          <tr key={row.id || rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="p-2.5 text-center text-slate-400 font-medium">
                                              {rIdx + 1}
                                            </td>
                                            <td className="p-2.5">
                                              <div className="font-semibold text-slate-800 dark:text-white">
                                                {fromThaiNumerals(row.itemDescription || '')}
                                              </div>
                                              <div className="text-[10px] text-slate-400 font-mono">
                                                {fromThaiNumerals(row.activityCode || '')}
                                              </div>
                                            </td>
                                            <td className="p-2.5 text-center">
                                              {isSource ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
                                                  <ArrowDownLeft className="w-3 h-3" />
                                                  โอนลด
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                                                  <ArrowUpRight className="w-3 h-3" />
                                                  โอนเพิ่ม
                                                </span>
                                              )}
                                            </td>
                                            <td className="p-2.5 text-right font-mono text-slate-600 dark:text-slate-300">
                                              {formatCurrency(row.budgetOriginal, false)}
                                            </td>
                                            <td className={`p-2.5 text-right font-mono font-bold ${
                                              isSource ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                                            }`}>
                                              {row.transferAmount > 0 ? `+${formatCurrency(row.transferAmount, false)}` : formatCurrency(row.transferAmount, false)}
                                            </td>
                                            <td className="p-2.5 text-right font-mono font-bold text-slate-800 dark:text-white">
                                              {formatCurrency(row.budgetNew, false)}
                                            </td>
                                            <td className="p-2.5 text-right font-mono text-slate-500">
                                              {formatCurrency(row.actualDisbursedAndCommitted, false)}
                                            </td>
                                            <td className="p-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                                              {formatCurrency(row.remainingBalance, false)}
                                            </td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr>
                                        <td colSpan={8} className="p-4 text-center text-slate-400">
                                          ไม่มีข้อมูลรายการ 7 คอลัมน์
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
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
      </div>
    </div>
  );
};
