import React, { useState } from 'react';
import { Plus, HelpCircle, FileUp, Clock, Scale, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface FloatingActionButtonProps {
  onOpenNewProject: () => void;
  onOpenWordImport: () => void;
  onOpenNewTransfer: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onOpenNewProject,
  onOpenWordImport,
  onOpenNewTransfer,
}) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <div className="no-print fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2.5 select-none">
        {/* Expanded Speed Dial Menu */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2 mb-1 animate-fadeIn">
            <button
              onClick={() => { onOpenWordImport(); setIsOpen(false); }}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3.5 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-emerald-50 transition-all transform hover:-translate-x-1"
            >
              <span>นำเข้าแผนปฏิบัติการ (Word/AI)</span>
              <div className="w-7 h-7 rounded-full bg-amber-100 text-slate-900 flex items-center justify-center font-bold">
                <FileUp className="w-3.5 h-3.5 text-slate-800" />
              </div>
            </button>

            <button
              onClick={() => { onOpenNewTransfer(); setIsOpen(false); }}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3.5 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-emerald-50 transition-all transform hover:-translate-x-1"
            >
              <span>ขอโอน/เปลี่ยนแปลงงบ</span>
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <Scale className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              onClick={() => { onOpenNewProject(); setIsOpen(false); }}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3.5 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-emerald-50 transition-all transform hover:-translate-x-1"
            >
              <span>สร้างโครงการใหม่</span>
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            title="คู่มือการใช้งานระบบ"
            className="w-10 h-10 rounded-full bg-[#0a4d44] hover:bg-[#073b34] text-white shadow-lg flex items-center justify-center transition-all transform hover:scale-105 border border-emerald-400/40"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Main Action Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            title="สร้างรายการใหม่"
            className="flex items-center gap-2 bg-[#0a4d44] hover:bg-[#073b34] text-white px-4 py-3 rounded-full shadow-xl transition-all transform hover:scale-105 border border-emerald-400/40 font-bold text-xs"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span className="hidden sm:inline">{isOpen ? 'ปิด' : 'สร้างใหม่'}</span>
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="bg-[#0a4d44] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-300" />
                <span>คู่มือการใช้งานระบบติดตามแผนและงบประมาณ กสม.</span>
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-emerald-200 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-slate-700 dark:text-slate-300">
              <div>
                <strong className="text-[#0a4d44] dark:text-emerald-400 block mb-0.5">1. การนำเข้าแผนปฏิบัติการประจำปี (Word / AI)</strong>
                <p>ลากไฟล์แบบคำของบประมาณ (.doc/.docx) มาวาง ระบบ AI จะสกัดชื่อโครงการ สำนัก งบประมาณ วัตถุประสงค์ และกิจกรรมพร้อมกำหนดปีงบประมาณและล็อกค่าตั้งต้นให้อัตโนมัติ</p>
              </div>
              <div>
                <strong className="text-[#0a4d44] dark:text-emerald-400 block mb-0.5">2. การรายงานผลรอบ 2 เดือน (แบบ สนย.3)</strong>
                <p>เจ้าของโครงการคลิกที่ไอคอนนาฬิกา <Clock className="w-3 h-3 inline text-emerald-600" /> เพื่อบันทึกผลงาน ยอดเบิกจ่าย และพิมพ์ออกเป็นแบบฟอร์มทางการราชการ</p>
              </div>
              <div>
                <strong className="text-[#0a4d44] dark:text-emerald-400 block mb-0.5">3. การขอโอนเปลี่ยนแปลงงบประมาณ</strong>
                <p>คลิกที่ไอคอนตราชั่ง <Scale className="w-3 h-3 inline text-amber-600" /> ระบบจะวินิจฉัยอำนาจอนุมัติ (เลขาธิการ / ประธาน กสม. / กสม.) ตามระเบียบ กสม. พ.ศ. 2566 และพิมพ์บันทึกข้อความตราครุฑได้ทันที</p>
              </div>
              <div>
                <strong className="text-[#0a4d44] dark:text-emerald-400 block mb-0.5">4. สิทธิ์การแก้ไข (Row-Level Security)</strong>
                <p>ผู้ใช้ทุกคนดูภาพรวมและโครงการได้ แต่จะแก้ไขหรือรายงานผลได้เฉพาะโครงการที่ตนเองรับผิดชอบเท่านั้น (สามารถสลับบทบาททดสอบได้ที่เมนูด้านบนขวา)</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 text-right">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-1.5 bg-[#0a4d44] text-white rounded-lg font-bold"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
