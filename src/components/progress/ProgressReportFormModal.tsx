import React, { useState, useEffect } from 'react';
import { X, Save, Clock, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Project, NHRC_UNITS, NHRCUnit } from '../../types/project';
import { 
  ProgressReport, ReportRound, REPORT_ROUNDS, 
  ProgressActivityRow, ProgressActivityDetail, ProgressObjectiveRow,
  ProgressPolicyRow, ProgressObstacleRow
} from '../../types/progress';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/thaiNumber';

interface ProgressReportFormModalProps {
  isOpen: boolean;
  project: Project | null;
  reportToEdit?: ProgressReport | null;
  onClose: () => void;
  onSuccess: (report: ProgressReport) => void;
}

export const ProgressReportFormModal: React.FC<ProgressReportFormModalProps> = ({
  isOpen,
  project,
  reportToEdit,
  onClose,
  onSuccess,
}) => {
  const { addProgressReport, updateProgressReport, fiscalYear } = useProjects();
  const { currentUser } = useAuth();

  const [round, setRound] = useState<ReportRound>('round_6');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [asOfDateText, setAsOfDateText] = useState('ณ วันที่ 28 สิงหาคม 2569');

  // 2.1 Activities
  const [activityRows, setActivityRows] = useState<ProgressActivityRow[]>([]);

  // 2.2 Activity Details
  const [activityDetails, setActivityDetails] = useState<ProgressActivityDetail[]>([]);

  // 2.3 Objectives
  const [objectives, setObjectives] = useState<ProgressObjectiveRow[]>([]);

  // 3. Policy
  const [policies, setPolicies] = useState<ProgressPolicyRow[]>([
    {
      policyTitle: 'นโยบายของ กสม. พ.ศ. 2567\n1) การติดตามและขับเคลื่อนข้อเสนอแนะต่อกฎหมายและนโยบายสำคัญตามข้อมติ\n2) การผลักดันให้เกิดการจัดทำแผนปฏิบัติการระดับชาติ (NAP)',
      progressDescription: 'ร่วมกับภาคีเครือข่ายติดตามร่าง พ.ร.บ. อากาศสะอาด และขับเคลื่อนปฏิญญาอาเซียนฯ'
    }
  ]);

  // 4/5 Obstacles
  const [obstacles, setObstacles] = useState<ProgressObstacleRow[]>([
    {
      obstacle: 'ยังไม่มีข้อจำกัดที่เป็นอุปสรรคสำคัญ',
      solution: 'ประสานงานกับหน่วยงานที่เกี่ยวข้องอย่างต่อเนื่อง'
    }
  ]);

  // Section 6: Responsible Person / Reporter
  const [respName, setRespName] = useState('');
  const [respPosition, setRespPosition] = useState('');
  const [respDivision, setRespDivision] = useState<NHRCUnit>('สนย.');
  const [respSubDivision, setRespSubDivision] = useState('');
  const [respPhone, setRespPhone] = useState('02 141 3857');
  const [respEmail, setRespEmail] = useState('');

  const getRpName = (rp: any) => (typeof rp === 'string' ? rp : rp?.name || '');
  const getRpPos = (rp: any) => (typeof rp === 'object' ? rp?.position || '' : '');
  const getRpDiv = (rp: any) => (typeof rp === 'object' ? rp?.division || '' : '');
  const getRpSubDiv = (rp: any) => (typeof rp === 'object' ? rp?.subDivision || '' : '');
  const getRpPhone = (rp: any) => (typeof rp === 'object' ? rp?.phone || '' : '');
  const getRpEmail = (rp: any) => (typeof rp === 'object' ? rp?.email || '' : '');

  useEffect(() => {
    if (reportToEdit) {
      setRound(reportToEdit.round);
      setReportDate(reportToEdit.reportDate);
      setAsOfDateText(reportToEdit.asOfDateText);
      setActivityRows(reportToEdit.section2_1 || []);
      setActivityDetails(reportToEdit.section2_2 || []);
      setObjectives(reportToEdit.section2_3 || []);
      setPolicies(reportToEdit.section3 || []);
      setObstacles(reportToEdit.section4_5 || []);
      setRespName(reportToEdit.section6?.name || getRpName(project?.responsiblePerson) || currentUser?.name || '');
      setRespPosition(reportToEdit.section6?.position || getRpPos(project?.responsiblePerson) || currentUser?.position || 'นักวิชาการสิทธิมนุษยชนชำนาญการ');
      setRespDivision((reportToEdit.section6?.division || getRpDiv(project?.responsiblePerson) || project?.division || currentUser?.division || 'สนย.') as NHRCUnit);
      setRespSubDivision(reportToEdit.section6?.subDivision || getRpSubDiv(project?.responsiblePerson) || currentUser?.subDivision || '');
      setRespPhone(reportToEdit.section6?.phone || getRpPhone(project?.responsiblePerson) || '02 141 3857');
      setRespEmail(reportToEdit.section6?.email || getRpEmail(project?.responsiblePerson) || currentUser?.email || '');
    } else if (project) {
      setRound('round_6');
      setReportDate(new Date().toISOString().split('T')[0]);
      setAsOfDateText(`ณ วันที่ ${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}`);

      setRespName(getRpName(project.responsiblePerson) || currentUser?.name || '');
      setRespPosition(getRpPos(project.responsiblePerson) || currentUser?.position || 'นักวิชาการสิทธิมนุษยชนชำนาญการ');
      setRespDivision((getRpDiv(project.responsiblePerson) || project.division || currentUser?.division || 'สนย.') as NHRCUnit);
      setRespSubDivision(getRpSubDiv(project.responsiblePerson) || currentUser?.subDivision || '');
      setRespPhone(getRpPhone(project.responsiblePerson) || '02 141 3857');
      setRespEmail(getRpEmail(project.responsiblePerson) || currentUser?.email || '');

      // Initialize activity rows from project
      setActivityRows(
        project.activities.map((a, i) => ({
          activityId: a.id,
          name: `${i + 1}. ${a.name}`,
          status: a.status,
          plannedBudget: a.plannedBudget,
          actualSpent: a.actualSpent || 0,
          asOfDateText: 'ณ วันรายงาน'
        }))
      );

      // Initialize activity details
      setActivityDetails(
        project.activities.map((a, i) => ({
          activityNumberText: `กิจกรรมที่ ${i + 1}`,
          activityTitle: a.name,
          detailDescription: a.actualResultDescription || `ดำเนินการกิจกรรมตามแผนงานในรอบการรายงาน`,
          targetPlan: a.targetDescription?.split('แผน')[1]?.split('ผล')[0]?.trim() || 'แผน 30 คน',
          targetActual: a.targetDescription?.split('ผล')[1]?.trim() || 'ผล 50 คน'
        }))
      );

      // Initialize objectives
      setObjectives([
        {
          type: 'objective',
          label: 'วัตถุประสงค์โครงการ',
          targetText: project.objectives.join('\n') || 'เพื่อขับเคลื่อนภารกิจตามแผนปฏิบัติการ',
          progressText: 'ดำเนินการบรรลุเป้าหมายตามขั้นตอนที่กำหนด'
        },
        {
          type: 'outcome',
          label: 'เป้าหมายผลลัพธ์',
          targetText: project.expectedOutcomes.join('\n') || 'ข้อเสนอแนะได้รับการตอบรับจากหน่วยงาน',
          progressText: 'อยู่ระหว่างดำเนินการติดตามผลการขับเคลื่อน'
        },
        {
          type: 'indicator',
          label: 'ตัวชี้วัดความสำเร็จ',
          targetText: project.indicators.map(ind => `${ind.title} (เป้าหมาย: ${ind.target})`).join('\n') || 'ร้อยละความสำเร็จตามแผนปฏิบัติการ',
          progressText: project.indicators.map(ind => ind.actual || 'ดำเนินการได้ตามแผน').join('\n') || 'เป็นไปตามเป้าหมาย'
        }
      ]);
    }
  }, [project, reportToEdit, isOpen]);

  if (!isOpen || !project) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const report: ProgressReport = {
      id: reportToEdit ? reportToEdit.id : `rep_${Date.now()}`,
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      fiscalYear: project.fiscalYear || fiscalYear,
      division: project.division,
      round,
      reportDate,
      asOfDateText,
      section1: {
        projectName: project.name,
        activityCode: project.code,
        allocatedBudget: project.budgetAllocated,
        timeframeText: project.timeframeText,
        divisionFullName: project.division,
      },
      section2_1: activityRows,
      section2_2: activityDetails,
      section2_3: objectives,
      section3: policies,
      section4_5: obstacles,
      section6: {
        name: respName || getRpName(project.responsiblePerson) || currentUser?.name || '',
        position: respPosition || getRpPos(project.responsiblePerson) || currentUser?.position || 'นักวิชาการสิทธิมนุษยชนชำนาญการ',
        division: respDivision || getRpDiv(project.responsiblePerson) || project.division || 'สนย.',
        subDivision: respSubDivision || getRpSubDiv(project.responsiblePerson) || currentUser?.subDivision || '',
        phone: respPhone || getRpPhone(project.responsiblePerson) || '02 141 3857',
        email: respEmail || getRpEmail(project.responsiblePerson) || currentUser?.email || '',
      },
      status: 'approved',
      createdAt: reportToEdit ? reportToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (reportToEdit) {
      updateProgressReport(report);
    } else {
      addProgressReport(report);
    }

    onSuccess(report);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0a4d44] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Clock className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">บันทึกรายงานผลการปฏิบัติงานและการใช้จ่ายงบประมาณ (แบบ สนย.3)</h3>
              <p className="text-xs text-emerald-200">{project.code} — {project.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-[#073b34]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Round & Date Selection */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">รอบการรายงาน (ทุก 2 เดือน)*</label>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value as ReportRound)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-medium"
              >
                {Object.keys(REPORT_ROUNDS).map((r) => (
                  <option key={r} value={r}>
                    {REPORT_ROUNDS[r as ReportRound].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">วันที่บันทึกรายงาน</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ข้อความระบุวันที่ (แสดงในแบบพิมพ์)</label>
              <input
                type="text"
                value={asOfDateText}
                onChange={(e) => setAsOfDateText(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Section 2.1: Activity Execution & Spent Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400 border-b pb-1 border-slate-200 dark:border-slate-800">
              2.1 ผลการดำเนินงานและการใช้จ่ายงบประมาณ (รายกิจกรรม)
            </h4>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">กิจกรรม</th>
                    <th className="py-2.5 px-3 w-40 text-center">สถานะ</th>
                    <th className="py-2.5 px-3 w-32 text-right">แผนงบประมาณ (บ.)</th>
                    <th className="py-2.5 px-3 w-36 text-right">เบิกจ่ายจริง (บ.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activityRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => {
                            const updated = [...activityRows];
                            updated[idx].name = e.target.value;
                            setActivityRows(updated);
                          }}
                          className="w-full px-2 py-1 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 font-medium"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <select
                          value={row.status}
                          onChange={(e) => {
                            const updated = [...activityRows];
                            updated[idx].status = e.target.value as any;
                            setActivityRows(updated);
                          }}
                          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1"
                        >
                          <option value="completed">✓ ดำเนินการแล้วเสร็จ</option>
                          <option value="in_progress">⋯ อยู่ระหว่างดำเนินการ</option>
                          <option value="not_started">✕ ยังไม่ดำเนินการ</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={row.plannedBudget}
                          onChange={(e) => {
                            const updated = [...activityRows];
                            updated[idx].plannedBudget = Number(e.target.value);
                            setActivityRows(updated);
                          }}
                          className="w-28 px-2 py-1 text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={row.actualSpent}
                          onChange={(e) => {
                            const updated = [...activityRows];
                            updated[idx].actualSpent = Number(e.target.value);
                            setActivityRows(updated);
                          }}
                          className="w-32 px-2 py-1 text-right bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 rounded font-mono font-bold text-[#0a4d44] dark:text-emerald-300"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2.2: Activity Summary & Targets */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400 border-b pb-1 border-slate-200 dark:border-slate-800">
              2.2 สรุปเนื้อหาผลการดำเนินงานของแต่ละกิจกรรม
            </h4>

            <div className="space-y-3">
              {activityDetails.map((act, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-white flex items-center justify-between">
                    <span>{act.activityNumberText} : {act.activityTitle}</span>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1">ผลการดำเนินงานที่ทำจริง (สรุปเนื้อหา/สถานที่/ผู้เข้าร่วม):</label>
                    <textarea
                      rows={3}
                      value={act.detailDescription}
                      onChange={(e) => {
                        const updated = [...activityDetails];
                        updated[idx].detailDescription = e.target.value;
                        setActivityDetails(updated);
                      }}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block mb-1">กลุ่มเป้าหมาย (ตามแผน):</span>
                      <input
                        type="text"
                        value={act.targetPlan}
                        onChange={(e) => {
                          const updated = [...activityDetails];
                          updated[idx].targetPlan = e.target.value;
                          setActivityDetails(updated);
                        }}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">กลุ่มเป้าหมาย (ทำได้จริง):</span>
                      <input
                        type="text"
                        value={act.targetActual}
                        onChange={(e) => {
                          const updated = [...activityDetails];
                          updated[idx].targetActual = e.target.value;
                          setActivityDetails(updated);
                        }}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4/5: Obstacles */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400 border-b pb-1 border-slate-200 dark:border-slate-800">
              ส่วนที่ 4 / 5 : ปัญหาอุปสรรค และแนวทางการแก้ไข
            </h4>

            {obstacles.map((obs, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">ปัญหาอุปสรรค หรือข้อจำกัด:</label>
                  <textarea
                    rows={2}
                    value={obs.obstacle}
                    onChange={(e) => {
                      const updated = [...obstacles];
                      updated[idx].obstacle = e.target.value;
                      setObstacles(updated);
                    }}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">แนวทางการแก้ไข หรือข้อเสนอแนะ:</label>
                  <textarea
                    rows={2}
                    value={obs.solution}
                    onChange={(e) => {
                      const updated = [...obstacles];
                      updated[idx].solution = e.target.value;
                      setObstacles(updated);
                    }}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Section 6: Responsible Person / Coordinator */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400 border-b pb-1 border-slate-200 dark:border-slate-800">
              ส่วนที่ 6 : ผู้รับผิดชอบ/ผู้ประสานงานโครงการ
            </h4>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ชื่อ-นามสกุล (ผู้รับผิดชอบ/ผู้รายงาน)*</label>
                <input
                  type="text"
                  required
                  value={respName}
                  onChange={(e) => setRespName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ตำแหน่ง*</label>
                <input
                  type="text"
                  required
                  value={respPosition}
                  onChange={(e) => setRespPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">สังกัดสำนัก/ส่วนราชการ*</label>
                <select
                  value={respDivision}
                  onChange={(e) => setRespDivision(e.target.value as NHRCUnit)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-medium"
                >
                  {Object.keys(NHRC_UNITS).map((u) => (
                    <option key={u} value={u}>
                      {u} - {NHRC_UNITS[u as NHRCUnit].fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">กลุ่มงาน/ฝ่าย</label>
                <input
                  type="text"
                  value={respSubDivision}
                  onChange={(e) => setRespSubDivision(e.target.value)}
                  placeholder="เช่น กลุ่มงานนโยบายและยุทธศาสตร์"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={respPhone}
                  onChange={(e) => setRespPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">อีเมล (E-mail)</label>
                <input
                  type="email"
                  value={respEmail}
                  onChange={(e) => setRespEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-medium"
                />
              </div>
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
              className="flex items-center gap-1.5 bg-[#0a4d44] hover:bg-[#083b34] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกแบบรายงาน สนย.3</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
