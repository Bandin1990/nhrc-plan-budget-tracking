import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Search, Filter, Clock, Building2, ExternalLink, RefreshCw } from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { EmailDispatchRecord } from '../../types/notification';

interface EmailHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailHistoryModal: React.FC<EmailHistoryModalProps> = ({ isOpen, onClose }) => {
  const { emailLogs, fiscalYear } = useProjects();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEmail, setSelectedEmail] = useState<EmailDispatchRecord | null>(null);

  if (!isOpen) return null;

  const filteredLogs = emailLogs.filter((log) => {
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.recipientName.toLowerCase().includes(q) ||
        log.recipientEmail.toLowerCase().includes(q) ||
        log.subject.toLowerCase().includes(q) ||
        log.division.toLowerCase().includes(q) ||
        (log.projectCode && log.projectCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCategoryBadge = (cat: EmailDispatchRecord['category']) => {
    switch (cat) {
      case 'verify_plan':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">ตรวจสอบแผนตั้งต้น</span>;
      case 'progress_due':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">เตือนส่งรายงาน สนย.3</span>;
      case 'reminder_nudge':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">แจ้งเตือนซ้ำ (Nudge)</span>;
      case 'transfer_submitted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">ขอโอนเปลี่ยนแปลงงบ</span>;
      case 'budget_returned':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">ส่งคืนงบเหลือจ่าย</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0a4d44]/10 text-[#0a4d44] dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>บันทึกประวัติการส่งอีเมลระบบและการแจ้งเตือน (Email Dispatch Logs)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-normal">
                  {emailLogs.length} ฉบับ
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ประวัติการจัดส่งอีเมลแจ้งเตือนรอบการทำงาน, การตรวจสอบแผน, และแจ้งเตือนเร่งรัดการรายงานผล
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 text-xs">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้รับ, อีเมล, สำนัก, หรือหัวข้อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0a4d44]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">ทุกประเภทอีเมล (ทั้งหมด)</option>
              <option value="verify_plan">ตรวจสอบแผนตั้งต้น</option>
              <option value="progress_due">เตือนส่งรายงาน สนย.3</option>
              <option value="reminder_nudge">แจ้งเตือนซ้ำ (Nudge)</option>
              <option value="transfer_submitted">แจ้งคำขอโอนงบประมาณ</option>
            </select>
          </div>
        </div>

        {/* Content Area (Split list & preview) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Email List */}
          <div className="overflow-y-auto max-h-[55vh] divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                ไม่พบประวัติการส่งอีเมลตามเงื่อนไข
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isSelected = selectedEmail?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedEmail(log)}
                    className={`p-3.5 hover:bg-emerald-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-[#0a4d44]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        {getCategoryBadge(log.category)}
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                          {log.recipientName} ({log.division})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.sentAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 dark:text-white line-clamp-1">
                      {log.subject}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {log.bodyPreview}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Email Preview Pane */}
          <div className="p-5 overflow-y-auto max-h-[55vh] bg-slate-50/40 dark:bg-slate-900/40 text-xs">
            {selectedEmail ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0a4d44] dark:text-emerald-400 flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      <span>รายละเอียดการส่งอีเมลระบบราชการ</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>จัดส่งสำเร็จ (Delivered)</span>
                    </span>
                  </div>

                  <div className="text-[11px] space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    <div><strong>ถึง:</strong> {selectedEmail.recipientName} &lt;{selectedEmail.recipientEmail}&gt;</div>
                    <div><strong>หน่วยงาน:</strong> {selectedEmail.division}</div>
                    <div><strong>วันเวลาส่ง:</strong> {new Date(selectedEmail.sentAt).toLocaleString('th-TH')}</div>
                    <div><strong>หัวข้อ:</strong> <span className="font-semibold text-slate-800 dark:text-white">{selectedEmail.subject}</span></div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">เนื้อหาข้อความในอีเมล</p>
                  <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                    {selectedEmail.bodyPreview}
                    {'\n\n'}
                    ------------------------------------------------{'\n'}
                    สำนักนโยบายและยุทธศาสตร์ (สนย. กสม.){'\n'}
                    สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ{'\n'}
                    ระบบติดตามแผนปฏิบัติการและการใช้จ่ายงบประมาณ (กสม.)
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
                <Mail className="w-10 h-10 stroke-[1.5] text-slate-300 dark:text-slate-600" />
                <p>เลือกรายการอีเมลจากด้านซ้ายเพื่อดูตัวอย่างเนื้อหา</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 text-xs">
          <span className="text-slate-500">
            ระบบส่งต่อข้อมูลผ่าน SMTP & In-App Notification กสม.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-200 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
