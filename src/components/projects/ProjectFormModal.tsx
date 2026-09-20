import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Building2 } from 'lucide-react';
import { Project, ProjectActivity, NHRC_UNITS, BUDGET_PROGRAMS, NHRCUnit, ProgramCode } from '../../types/project';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { fromThaiNumerals } from '../../utils/thaiNumber';

interface ProjectFormModalProps {
  isOpen: boolean;
  projectToEdit?: Project | null;
  onClose: () => void;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  projectToEdit,
  onClose,
}) => {
  const { addProject, updateProject, fiscalYear: activeFiscalYear } = useProjects();
  const { currentUser } = useAuth();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [fiscalYear, setFiscalYear] = useState(activeFiscalYear || 2569);
  const [programCode, setProgramCode] = useState<ProgramCode>('O');
  const [division, setDivision] = useState<NHRCUnit>('สนย.');
  const [subDivision, setSubDivision] = useState('');
  const [isStrategic, setIsStrategic] = useState(true);
  const [timeframeText, setTimeframeText] = useState(`ตุลาคม ${(activeFiscalYear || 2569) - 1} ถึงกันยายน ${activeFiscalYear || 2569}`);
  
  // Responsible Person
  const [respName, setRespName] = useState(currentUser.name);
  const [respPosition, setRespPosition] = useState(currentUser.position);
  const [respPhone, setRespPhone] = useState('02 141 3800');
  const [respEmail, setRespEmail] = useState(currentUser.email);

  // Objectives
  const [objectives, setObjectives] = useState<string[]>(['']);

  // Activities
  const [activities, setActivities] = useState<ProjectActivity[]>([]);

  useEffect(() => {
    if (projectToEdit) {
      setCode(projectToEdit.code);
      setName(projectToEdit.name);
      setFiscalYear(projectToEdit.fiscalYear);
      setProgramCode(projectToEdit.programCode);
      setDivision(projectToEdit.division);
      setSubDivision(projectToEdit.subDivision);
      setIsStrategic(projectToEdit.isStrategic);
      setTimeframeText(projectToEdit.timeframeText);
      setRespName(projectToEdit.responsiblePerson?.name || '');
      setRespPosition(projectToEdit.responsiblePerson?.position || '');
      setRespPhone(fromThaiNumerals(projectToEdit.responsiblePerson?.phone || ''));
      setRespEmail(projectToEdit.responsiblePerson?.email || '');
      setObjectives(projectToEdit.objectives?.length ? projectToEdit.objectives : ['']);
      setActivities(projectToEdit.activities || []);
    } else {
      // New project default
      const year = activeFiscalYear || 2569;
      const yy = year.toString().slice(-2);
      const divCode = currentUser.division || 'สนย.';
      setCode(`${yy}${divCode.replace(/[^A-Za-z0-9]/g, '') || 'O'}-${Math.floor(10000 + Math.random() * 90000)}`);
      setName('');
      setFiscalYear(year);
      setProgramCode('O');
      setDivision(divCode);
      setSubDivision(NHRC_UNITS[divCode]?.subDivisions[0] || 'กลุ่มงานทั่วไป');
      setIsStrategic(true);
      setTimeframeText(`ตุลาคม ${year - 1} ถึงกันยายน ${year}`);
      setRespName(currentUser.name);
      setRespPosition(currentUser.position);
      setRespPhone('02 141 3800');
      setRespEmail(currentUser.email);
      setObjectives(['เพื่อขับเคลื่อนภารกิจตามแผนปฏิบัติการประจำปี']);
      setActivities([
        {
          id: `act_${Date.now()}_1`,
          code: '1',
          name: 'กิจกรรมที่ 1 : ดำเนินการตามวัตถุประสงค์โครงการ',
          plannedPercent: 100,
          timeframe: `ต.ค. ${(year - 1).toString().slice(-2)} - ก.ย. ${yy}`,
          plannedBudget: 200000,
          actualSpent: 0,
          status: 'not_started'
        }
      ]);
    }
  }, [projectToEdit, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleAddActivity = () => {
    setActivities(prev => [
      ...prev,
      {
        id: `act_${Date.now()}_${prev.length + 1}`,
        code: `${prev.length + 1}`,
        name: `กิจกรรมที่ ${prev.length + 1} : `,
        plannedPercent: 0,
        timeframe: 'ต.ค. 68 - ก.ย. 69',
        plannedBudget: 50000,
        actualSpent: 0,
        status: 'not_started'
      }
    ]);
  };

  const handleRemoveActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const handleActivityChange = (id: string, field: keyof ProjectActivity, val: any) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: val } : a));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('กรุณาระบุชื่อโครงการ');
      return;
    }

    const calculatedTotalBudget = activities.reduce((sum, a) => sum + (Number(a.plannedBudget) || 0), 0);

    const projectData: Project = {
      id: projectToEdit ? projectToEdit.id : `proj_${Date.now()}`,
      code: code || `69O1-${Math.floor(10000 + Math.random() * 90000)}`,
      name,
      fiscalYear,
      programCode,
      division,
      subDivision,
      responsiblePerson: {
        name: respName,
        position: respPosition,
        division,
        subDivision,
        phone: fromThaiNumerals(respPhone),
        email: respEmail,
      },
      isStrategic,
      budgetAllocated: calculatedTotalBudget || (projectToEdit?.budgetAllocated ?? 200000),
      budgetSpent: projectToEdit ? projectToEdit.budgetSpent : 0,
      progressPercent: projectToEdit ? projectToEdit.progressPercent : 0,
      status: projectToEdit ? projectToEdit.status : 'NOT_STARTED',
      startDate: projectToEdit ? projectToEdit.startDate : '2025-10-01',
      endDate: projectToEdit ? projectToEdit.endDate : '2026-09-30',
      timeframeText,
      objectives: objectives.filter(o => o.trim().length > 0),
      expectedOutputs: projectToEdit?.expectedOutputs || ['ผลผลิตตามที่ระบุในแผนปฏิบัติการ'],
      expectedOutcomes: projectToEdit?.expectedOutcomes || ['ผลลัพธ์เพื่อประโยชน์ด้านสิทธิมนุษยชน'],
      indicators: projectToEdit?.indicators || [],
      activities,
      updatedAt: new Date().toISOString()
    };

    if (projectToEdit) {
      updateProject(projectData);
    } else {
      addProject(projectData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0a4d44] text-white px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-base">
            {projectToEdit ? `แก้ไขโครงการ (${projectToEdit.code})` : 'สร้างโครงการใหม่ตามแผนปฏิบัติการ กสม.'}
          </h3>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-[#073b34]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Section 1: Basic Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400 border-b pb-1 border-slate-200 dark:border-slate-800">
              ส่วนที่ 1 : ข้อมูลพื้นฐานโครงการ
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">รหัสกิจกรรม/โครงการ*</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="เช่น 68O1-13314"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-[#0a4d44] dark:text-emerald-400"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ชื่อโครงการ*</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ระบุชื่อโครงการตามแผนปฏิบัติการ"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">สำนัก/สังกัด (14 สำนัก)*</label>
                <select
                  value={division}
                  onChange={(e) => {
                    const d = e.target.value as NHRCUnit;
                    setDivision(d);
                    setSubDivision(NHRC_UNITS[d]?.subDivisions[0] || 'กลุ่มงานทั่วไป');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                >
                  {Object.keys(NHRC_UNITS).map((u) => (
                    <option key={u} value={u}>
                      {u} - {NHRC_UNITS[u as NHRCUnit].fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">กลุ่มงานภายใน</label>
                <input
                  type="text"
                  value={subDivision}
                  onChange={(e) => setSubDivision(e.target.value)}
                  placeholder="เช่น กลุ่มงานนโยบายและยุทธศาสตร์"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">แผนงานงบประมาณ (6 แผนงาน)*</label>
                <select
                  value={programCode}
                  onChange={(e) => setProgramCode(e.target.value as ProgramCode)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                >
                  {Object.keys(BUDGET_PROGRAMS).map((p) => (
                    <option key={p} value={p}>
                      {p}: {BUDGET_PROGRAMS[p as ProgramCode].shortName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ช่วงเวลาดำเนินงานในแผน</label>
              <input
                type="text"
                value={timeframeText}
                onChange={(e) => setTimeframeText(e.target.value)}
                placeholder="เช่น เดือนธันวาคม 2568 ถึงกันยายน 2569"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Section 2: Officer */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400 border-b pb-1 border-slate-200 dark:border-slate-800">
              ส่วนที่ 2 : ผู้รับผิดชอบโครงการ (Project Owner)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={respName}
                  onChange={(e) => setRespName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ตำแหน่ง</label>
                <input
                  type="text"
                  value={respPosition}
                  onChange={(e) => setRespPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={respPhone}
                  onChange={(e) => setRespPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">อีเมล</label>
                <input
                  type="email"
                  value={respEmail}
                  onChange={(e) => setRespEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Activities & Budget Breakdown */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b pb-1 border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400">
                ส่วนที่ 3 : แผนกิจกรรมและงบประมาณย่อย
              </h4>
              <button
                type="button"
                onClick={handleAddActivity}
                className="flex items-center gap-1 text-xs font-bold text-[#0a4d44] dark:text-emerald-300 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มกิจกรรม</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {activities.map((act, index) => (
                <div key={act.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={act.name}
                      onChange={(e) => handleActivityChange(act.id, 'name', e.target.value)}
                      placeholder={`กิจกรรมที่ ${index + 1}`}
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-medium"
                      required
                    />
                    {activities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(act.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block mb-0.5">ช่วงเวลา:</span>
                      <input
                        type="text"
                        value={act.timeframe}
                        onChange={(e) => handleActivityChange(act.id, 'timeframe', e.target.value)}
                        placeholder="เช่น ม.ค. - มิ.ย. 69"
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">ร้อยละของแผน (%):</span>
                      <input
                        type="number"
                        value={act.plannedPercent || 0}
                        onChange={(e) => handleActivityChange(act.id, 'plannedPercent', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">งบประมาณที่จะใช้ (บาท):</span>
                      <input
                        type="number"
                        value={act.plannedBudget || 0}
                        onChange={(e) => handleActivityChange(act.id, 'plannedBudget', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono font-bold text-[#0a4d44]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-between font-bold">
              <span className="text-[#0a4d44] dark:text-emerald-300">งบประมาณรวมทั้งโครงการ:</span>
              <span className="text-sm font-mono text-[#0a4d44] dark:text-emerald-300">
                {activities.reduce((s, a) => s + (Number(a.plannedBudget) || 0), 0).toLocaleString()} บาท
              </span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#0a4d44] hover:bg-[#083b34] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกโครงการ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
