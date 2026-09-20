import React, { useState } from 'react';
import { X, Unlock, Lock, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types/project';
import { useProjects } from '../../contexts/ProjectContext';

interface UnlockProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UnlockProjectModal: React.FC<UnlockProjectModalProps> = ({ project, isOpen, onClose }) => {
  const { unlockProjectForEdit, relockProject } = useProjects();
  const [reason, setReason] = useState<string>('ได้รับอนุมัติโอนเปลี่ยนแปลงงบประมาณตามระเบียบ กสม. พ.ศ. 2566');

  if (!isOpen || !project) return null;

  const isCurrentlyUnlocked = project.unlockedForEdit;

  const handleConfirmUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('กรุณาระบุเลขที่หนังสืออนุมัติหรือเหตุผลในการปลดล็อก');
      return;
    }
    unlockProjectForEdit(project.id, reason.trim());
    onClose();
  };

  const handleRelock = () => {
    relockProject(project.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 text-xs">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isCurrentlyUnlocked 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-emerald-100 text-[#0a4d44] dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              {isCurrentlyUnlocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                {isCurrentlyUnlocked ? 'ล็อกข้อมูลโครงการตั้งต้น' : 'เปิดสิทธิ์ปลดล็อกให้แก้ไขโครงการ (Admin Only)'}
              </h2>
              <p className="text-[11px] text-slate-500">
                รหัส: {project.code} • {project.division}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700">
            <p className="font-bold text-slate-800 dark:text-white line-clamp-2">{project.name}</p>
            <p className="text-[11px] text-slate-500 mt-1">ผู้รับผิดชอบ: {project.responsiblePerson?.name || '-'}</p>
          </div>

          {isCurrentlyUnlocked ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
                <span>โครงการนี้กำลังอยู่ในสถานะปลดล็อกให้แก้ไข</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                เหตุผลเดิม: {project.unlockReason || 'อนุมัติตามระเบียบ'}
              </p>
              <p className="text-[11px] text-slate-500">
                หากผู้รับผิดชอบดำเนินการปรับปรุงข้อมูลเสร็จสิ้นแล้ว ท่านสามารถกดล็อกโครงการกลับคืนเพื่อป้องกันการแก้ไขข้อมูลโดยไม่ได้รับอนุญาต
              </p>
            </div>
          ) : (
            <form onSubmit={handleConfirmUnlock} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ระบุเลขที่หนังสืออนุมัติ / มติ / เหตุผลตามระเบียบ กสม. พ.ศ. 2566 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="เช่น บันทึกข้อความ สม 0302/2401 ลงวันที่ 20 ก.ค. 2569 อนุมัติโอนงบประมาณ"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0a4d44]"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ผลของการปลดล็อก:</span>
                </p>
                <p>1. ผู้รับผิดชอบโครงการ ({project.responsiblePerson?.name || project.division}) จะได้รับสิทธิ์ในการแก้ไขรายละเอียดโครงการ</p>
                <p>2. ระบบจะบันทึกประวัติและแจ้งเตือนผู้รับผิดชอบโครงการทางระบบโดยอัตโนมัติ</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0a4d44] hover:bg-[#073b34] text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>ยืนยันปลดล็อกโครงการ</span>
                </button>
              </div>
            </form>
          )}

          {isCurrentlyUnlocked && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors"
              >
                ปิด
              </button>
              <button
                type="button"
                onClick={handleRelock}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>ล็อกข้อมูลโครงการกลับคืน</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
