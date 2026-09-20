import React, { useState } from 'react';
import { 
  X, FileText, Download, CheckCircle2, BookOpen, 
  Sparkles, Layers, Building2, Banknote, FileSpreadsheet
} from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { exportAnnualReportToWord, exportAnnualReportToExcel } from '../../utils/annualReportExport';
import { formatCurrency } from '../../utils/thaiNumber';

interface AnnualReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnnualReportExportModal: React.FC<AnnualReportExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { projects, reports, fiscalYear } = useProjects();
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [successWord, setSuccessWord] = useState(false);
  const [successExcel, setSuccessExcel] = useState(false);

  if (!isOpen) return null;

  const yearProjects = projects.filter(p => (p.fiscalYear || 2569) === fiscalYear);
  const totalAllocated = yearProjects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0);
  const totalSpent = yearProjects.reduce((sum, p) => sum + (p.budgetSpent || 0), 0);
  const strategicProjectsCount = yearProjects.filter(p => p.isStrategic).length;

  const handleDownloadWord = () => {
    setDownloadingWord(true);
    try {
      exportAnnualReportToWord(fiscalYear, projects, reports);
      setSuccessWord(true);
      setTimeout(() => setSuccessWord(false), 4000);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการสร้างเอกสาร Word');
    } finally {
      setDownloadingWord(false);
    }
  };

  const handleDownloadExcel = () => {
    setDownloadingExcel(true);
    try {
      exportAnnualReportToExcel(fiscalYear, projects, reports);
      setSuccessExcel(true);
      setTimeout(() => setSuccessExcel(false), 4000);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ Excel');
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0a4d44] text-white p-4 sm:p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 pr-8">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  Annual Report Dossier
                </span>
                <span className="text-xs text-white/80">ปีงบประมาณ {fiscalYear}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                ดาวน์โหลดสรุปผลงานจัดทำรายงานประจำปี กสม.
              </h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 overscroll-contain">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center">
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">โครงการทั้งหมดในแผน</div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {yearProjects.length} <span className="text-xs font-normal text-slate-500">โครงการ</span>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                เชิงยุทธศาสตร์ {strategicProjectsCount} โครงการ
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center">
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">งบประมาณจัดสรรรวม</div>
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {formatCurrency(totalAllocated, false)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">บาท</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center">
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">ผลเบิกจ่ายสะสม</div>
              <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                {formatCurrency(totalSpent, false)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                คิดเป็น {totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          {/* Features Highlights Checklist */}
          <div className="bg-emerald-50/50 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 dark:border-slate-700 space-y-2 sm:space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0a4d44] dark:text-emerald-400" />
              <span>โครงสร้างเนื้อหาที่จัดหมวดหมู่ให้อัตโนมัติในเอกสาร:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>จำแนกหมวดหมู่ตามยุทธศาสตร์ กสม. 1-4</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>ผลงานรายกิจกรรม เป้าหมาย (แผน vs ผลจริง)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>ตารางผลสัมฤทธิ์ตามตัวชี้วัด (สนย.3 ส่วนที่ 3)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>การขับเคลื่อนนโยบาย/สิทธิมนุษยชน (ส่วนที่ 4)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>ปัญหาอุปสรรคและข้อเสนอแนะเชิงนโยบาย (ส่วนที่ 5)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>ฟอนต์ TH Sarabun PSK 16pt พร้อมนำไปแก้ไขต่อ</span>
              </div>
            </div>
          </div>

          {/* Download Buttons Section */}
          <div className="space-y-2.5 sm:space-y-3 pt-0.5">
            {/* Primary Button: Word */}
            <button
              onClick={handleDownloadWord}
              disabled={downloadingWord}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0a4d44] to-[#0d5c52] hover:from-[#083b34] hover:to-[#0a4d44] text-white shadow-md hover:shadow-lg transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-white flex flex-wrap items-center gap-1.5">
                    <span>ดาวน์โหลดเอกสาร Word (.doc)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900">
                      แนะนำสำหรับทำเล่ม ⭐
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-emerald-100/80 line-clamp-1 sm:line-clamp-none">
                    เอกสารสรุปผลงานรวมทุกโครงการ จัดหมวดหมู่ 4 ยุทธศาสตร์ ฟอนต์ TH Sarabun 16pt
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold shrink-0 bg-white/10 px-3 sm:px-4 py-2 rounded-xl border border-white/20 group-hover:bg-white/20 transition-all">
                <Download className="w-4 h-4" />
                <span>{successWord ? 'ดาวน์โหลดแล้ว!' : downloadingWord ? 'กำลังสร้าง...' : 'ดาวน์โหลด Word'}</span>
              </div>
            </button>

            {/* Secondary Button: Excel */}
            <button
              onClick={handleDownloadExcel}
              disabled={downloadingExcel}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                    ดาวน์โหลดตารางสถิติ Excel (.xlsx)
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 sm:line-clamp-none">
                    สำหรับทำภาคผนวกงบประมาณและพล็อตแผนภูมิ (3 แผ่นงาน: ภาพรวม, กิจกรรม, สำนัก)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold shrink-0 bg-white dark:bg-slate-900 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-[#0a4d44] transition-all">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>{successExcel ? 'ดาวน์โหลดแล้ว!' : downloadingExcel ? 'กำลังสร้าง...' : 'ดาวน์โหลด Excel'}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-5 sm:px-6 py-3 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            ระบบติดตามแผนและงบประมาณ สำนักงาน กสม.
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
