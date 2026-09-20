import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Building2, Target, FileText, Calendar, Paperclip, UserCheck, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import { Project, ProjectActivity, ProjectIndicator, NHRC_UNITS, BUDGET_PROGRAMS, NHRCUnit, ProgramCode, MonthlyBudgetPlan, ProjectAttachment } from '../../types/project';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { fromThaiNumerals, formatCurrency } from '../../utils/thaiNumber';
import {
  NATIONAL_STRATEGY_PILLARS,
  MASTER_PLAN_ISSUES,
  NATIONAL_REFORM_AREAS,
  FIVE_YEAR_DEV_PLAN_MILESTONES,
  NHRC_STRATEGIC_PILLARS_FULL
} from '../../constants/strategicOptions';

interface ProjectFormModalProps {
  isOpen: boolean;
  projectToEdit?: Project | null;
  onClose: () => void;
}

// 12 Months mapping (Fiscal Year starts in October)
const FISCAL_MONTHS = [
  { month: 10, name: 'ตุลาคม', quarter: 1 },
  { month: 11, name: 'พฤศจิกายน', quarter: 1 },
  { month: 12, name: 'ธันวาคม', quarter: 1 },
  { month: 1, name: 'มกราคม', quarter: 2 },
  { month: 2, name: 'กุมภาพันธ์', quarter: 2 },
  { month: 3, name: 'มีนาคม', quarter: 2 },
  { month: 4, name: 'เมษายน', quarter: 3 },
  { month: 5, name: 'พฤษภาคม', quarter: 3 },
  { month: 6, name: 'มิถุนายน', quarter: 3 },
  { month: 7, name: 'กรกฎาคม', quarter: 4 },
  { month: 8, name: 'สิงหาคม', quarter: 4 },
  { month: 9, name: 'กันยายน', quarter: 4 },
];

// Target spend rates based on Cabinet Resolution (มติ ครม. 21 ต.ค. 2568)
const CABINET_QUARTER_TARGETS = {
  1: 38, // Q1 38%
  2: 61, // Q2 61%
  3: 81, // Q3 81%
  4: 100, // Q4 100%
};

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  projectToEdit,
  onClose,
}) => {
  const { addProject, updateProject, fiscalYear: activeFiscalYear } = useProjects();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<number>(1);

  // ส่วนที่ 1: ข้อมูลโครงการ
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [fiscalYear, setFiscalYear] = useState(activeFiscalYear || 2569);
  const [programCode, setProgramCode] = useState<ProgramCode>('O');
  const [division, setDivision] = useState<NHRCUnit>('สนย.');
  const [subDivision, setSubDivision] = useState('');
  const [isStrategic, setIsStrategic] = useState(true);
  const [strategicPillar, setStrategicPillar] = useState<number>(1);
  const [operationMethod, setOperationMethod] = useState('ดำเนินการเองร่วมกับภาคีเครือข่าย');
  const [budgetSource, setBudgetSource] = useState('งบประมาณแผ่นดินประจำปี พ.ศ. 2569');
  const [budgetCategory, setBudgetCategory] = useState<'งบดำเนินงาน' | 'งบลงทุน' | 'งบบุคลากร' | 'งบอุดหนุน' | 'งบรายจ่ายอื่น'>('งบดำเนินงาน');
  const [timeframeText, setTimeframeText] = useState(`ตุลาคม ${(activeFiscalYear || 2569) - 1} ถึงกันยายน ${activeFiscalYear || 2569}`);

  // ส่วนที่ 2: ความเชื่อมโยงยุทธศาสตร์ชาติ (2.1 - 2.7)
  const [natStrategyPillar, setNatStrategyPillar] = useState(NATIONAL_STRATEGY_PILLARS[5]);
  const [natStrategyIssue, setNatStrategyIssue] = useState('การพัฒนาระบบบริหารราชการแผ่นดินและบริการประชาชน');
  const [natStrategyTarget, setNatStrategyTarget] = useState('ภาครัฐมีความโปร่งใส มีประสิทธิภาพ และตอบสนองประชาชน');

  const [mpSubPlan, setMpSubPlan] = useState(MASTER_PLAN_ISSUES[19]);
  const [mpSubTarget, setMpSubTarget] = useState('ยกระดับบริการประชาชนและการขับเคลื่อนองค์กรภาครัฐดิจิทัล');

  const [nationalReformPlan, setNationalReformPlan] = useState(NATIONAL_REFORM_AREAS[1]);
  const [econDevMilestone, setEconDevMilestone] = useState(FIVE_YEAR_DEV_PLAN_MILESTONES[12]);
  const [level3Plan, setLevel3Plan] = useState('แผนสิทธิมนุษยชนแห่งชาติ ฉบับที่ 5 (พ.ศ. 2566 - 2570)');

  const [nhrcStrategyPillarVal, setNhrcStrategyPillarVal] = useState<number>(1);
  const [nhrcStrategyIssueVal, setNhrcStrategyIssueVal] = useState('ประเด็นยุทธศาสตร์การส่งเสริมและปกป้องสิทธิมนุษยชน');
  const [relatedLawsVal, setRelatedLawsVal] = useState('พ.ร.ป. คณะกรรมการสิทธิมนุษยชนแห่งชาติ พ.ศ. 2560 และระเบียบ กสม. ว่าด้วยการงบประมาณ พ.ศ. 2566');

  // ส่วนที่ 3: รายละเอียดโครงการ
  const [rationale, setRationale] = useState('');
  const [objectives, setObjectives] = useState<string[]>(['เพื่อส่งเสริมและปกป้องสิทธิมนุษยชนให้เป็นไปตามมาตรฐานสากล']);
  const [targetGroup, setTargetGroup] = useState('ประชาชนทั่วไป องค์กรภาคเอกชน และเจ้าหน้าที่รัฐ');
  const [targetArea, setTargetArea] = useState('ทั่วประเทศ (77 จังหวัด)');
  const [expectedOutputs, setExpectedOutputs] = useState<string[]>(['รายงาน/ข้อเสนอแนะเชิงนโยบายด้านสิทธิมนุษยชน']);
  const [expectedOutcomes, setExpectedOutcomes] = useState<string[]>(['หน่วยงานที่เกี่ยวข้องนำข้อเสนอแนะไปปรับปรุงการทำงาน']);
  const [expectedBenefits, setExpectedBenefits] = useState<string[]>(['ประชาชนได้รับการคุ้มครองสิทธิมนุษยชนอย่างเท่าเทียมและเป็นธรรม']);
  const [indicators, setIndicators] = useState<ProjectIndicator[]>([
    { id: 'ind_1', title: 'ร้อยละของกิจกรรมที่บรรลุตามแผน', target: '100%', actual: '', status: 'on_track' }
  ]);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);

  // ส่วนที่ 4: แผนรายเดือน & มาตรการเร่งรัด มติ ครม. 21 ต.ค. 2568
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyBudgetPlan[]>([]);
  const [investmentCommitmentQ1, setInvestmentCommitmentQ1] = useState<number>(0);

  // ส่วนที่ 5: ผู้รับผิดชอบโครงการ
  const [respName, setRespName] = useState(currentUser.name);
  const [respPosition, setRespPosition] = useState(currentUser.position);
  const [respPhone, setRespPhone] = useState('02 141 3800');
  const [respEmail, setRespEmail] = useState(currentUser.email);

  // เอกสารแนบ
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);

  useEffect(() => {
    if (projectToEdit) {
      setCode(projectToEdit.code);
      setName(projectToEdit.name);
      setFiscalYear(projectToEdit.fiscalYear);
      setProgramCode(projectToEdit.programCode);
      setDivision(projectToEdit.division);
      setSubDivision(projectToEdit.subDivision);
      setIsStrategic(projectToEdit.isStrategic);
      setStrategicPillar(projectToEdit.strategicPillar || 1);
      setOperationMethod(projectToEdit.operationMethod || 'ดำเนินการเอง');
      setBudgetSource(projectToEdit.budgetSource || 'งบประมาณแผ่นดินประจำปี พ.ศ. 2569');
      setBudgetCategory(projectToEdit.budgetCategory || 'งบดำเนินงาน');
      setTimeframeText(projectToEdit.timeframeText);

      const sec2 = projectToEdit.strategicSection2;
      setNatStrategyPillar(sec2?.nationalStrategyPillar || projectToEdit.nationalStrategy || 'ยุทธศาสตร์ชาติด้านการปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ');
      setNatStrategyIssue(sec2?.nationalStrategyIssue || 'การพัฒนาระบบบริหารราชการแผ่นดินและบริการประชาชน');
      setNatStrategyTarget(sec2?.nationalStrategyTarget || 'ภาครัฐมีความโปร่งใส มีประสิทธิภาพ และตอบสนองประชาชน');

      setMpSubPlan(sec2?.masterPlanSubPlan || projectToEdit.masterPlan || 'ประเด็น 03 การปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ');
      setMpSubTarget(sec2?.masterPlanSubTarget || 'ยกระดับบริการประชาชนและการขับเคลื่อนองค์กรภาครัฐดิจิทัล');

      setNationalReformPlan(sec2?.nationalReformPlan || 'แผนการปฏิรูปประเทศด้านการบริหารราชการแผ่นดิน');
      setEconDevMilestone(sec2?.economicDevPlanMilestone || 'หมุดหมายที่ 13 ภาครัฐมีความทันสมัย มีประสิทธิภาพสูง และตอบสนองประชาชน');
      setLevel3Plan(sec2?.level3Plan || 'แผนสิทธิมนุษยชนแห่งชาติ ฉบับที่ 5 (พ.ศ. 2566 - 2570)');

      setNhrcStrategyPillarVal(sec2?.nhrcStrategicPillar || projectToEdit.strategicPillar || 1);
      setNhrcStrategyIssueVal(sec2?.nhrcStrategicIssue || 'ประเด็นยุทธศาสตร์การส่งเสริมและปกป้องสิทธิมนุษยชน');
      setRelatedLawsVal(sec2?.relatedLaws || 'พ.ร.ป. คณะกรรมการสิทธิมนุษยชนแห่งชาติ พ.ศ. 2560');

      setRationale(projectToEdit.rationale || '');
      setObjectives(projectToEdit.objectives?.length ? projectToEdit.objectives : ['']);
      setTargetGroup(projectToEdit.targetGroup || 'ประชาชนทั่วไป องค์กรภาคเอกชน และเจ้าหน้าที่รัฐ');
      setTargetArea(projectToEdit.targetArea || 'ทั่วประเทศ (77 จังหวัด)');
      setExpectedOutputs(projectToEdit.expectedOutputs?.length ? projectToEdit.expectedOutputs : ['']);
      setExpectedOutcomes(projectToEdit.expectedOutcomes?.length ? projectToEdit.expectedOutcomes : ['']);
      setExpectedBenefits(projectToEdit.expectedBenefits?.length ? projectToEdit.expectedBenefits : ['']);
      setIndicators(projectToEdit.indicators || []);
      setActivities(projectToEdit.activities || []);

      setRespName(projectToEdit.responsiblePerson?.name || '');
      setRespPosition(projectToEdit.responsiblePerson?.position || '');
      setRespPhone(fromThaiNumerals(projectToEdit.responsiblePerson?.phone || ''));
      setRespEmail(projectToEdit.responsiblePerson?.email || '');

      setAttachments(projectToEdit.attachments || []);
      setInvestmentCommitmentQ1(projectToEdit.investmentCommitmentQ1 || 0);

      // Initialize monthly plan
      if (projectToEdit.monthlyBudgetPlan && projectToEdit.monthlyBudgetPlan.length === 12) {
        setMonthlyPlan(projectToEdit.monthlyBudgetPlan);
      } else {
        initDefaultMonthlyPlan(projectToEdit.budgetAllocated || 200000);
      }
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
      setStrategicPillar(1);
      setOperationMethod('ดำเนินการเองร่วมกับภาคีเครือข่าย');
      setBudgetSource(`งบประมาณแผ่นดินประจำปี พ.ศ. ${year}`);
      setBudgetCategory('งบดำเนินงาน');
      setTimeframeText(`ตุลาคม ${year - 1} ถึงกันยายน ${year}`);

      setNatStrategyPillar('ยุทธศาสตร์ชาติด้านการปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ');
      setNatStrategyIssue('การพัฒนาระบบบริหารราชการแผ่นดินและบริการประชาชน');
      setNatStrategyTarget('ภาครัฐมีความโปร่งใส มีประสิทธิภาพ และตอบสนองประชาชน');

      setMpSubPlan('ประเด็น 03 การปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ');
      setMpSubTarget('ยกระดับบริการประชาชนและการขับเคลื่อนองค์กรภาครัฐดิจิทัล');

      setNationalReformPlan('แผนการปฏิรูปประเทศด้านการบริหารราชการแผ่นดิน');
      setEconDevMilestone('หมุดหมายที่ 13 ภาครัฐมีความทันสมัย มีประสิทธิภาพสูง และตอบสนองประชาชน');
      setLevel3Plan('แผนสิทธิมนุษยชนแห่งชาติ ฉบับที่ 5 (พ.ศ. 2566 - 2570)');

      setNhrcStrategyPillarVal(1);
      setNhrcStrategyIssueVal('ประเด็นยุทธศาสตร์การส่งเสริมและปกป้องสิทธิมนุษยชน');
      setRelatedLawsVal('พ.ร.ป. คณะกรรมการสิทธิมนุษยชนแห่งชาติ พ.ศ. 2560 และระเบียบ กสม. ว่าด้วยการงบประมาณ พ.ศ. 2566');

      setRationale('เพื่อขับเคลื่อนภารกิจตามพระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยคณะกรรมการสิทธิมนุษยชนแห่งชาติ พ.ศ. 2560 และแผนปฏิบัติการประจำปี');
      setObjectives(['เพื่อส่งเสริมและปกป้องสิทธิมนุษยชนให้เป็นไปตามมาตรฐานสากล']);
      setExpectedOutputs(['รายงาน/ข้อเสนอแนะเชิงนโยบายด้านสิทธิมนุษยชน']);
      setExpectedOutcomes(['หน่วยงานที่เกี่ยวข้องนำข้อเสนอแนะไปปรับปรุงการทำงาน']);
      setIndicators([
        { id: 'ind_1', title: 'ร้อยละของกิจกรรมที่บรรลุตามเป้าหมายแผนปฏิบัติการ', target: '100%', actual: '', status: 'on_track' }
      ]);

      const initialActivities: ProjectActivity[] = [
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
      ];
      setActivities(initialActivities);

      setRespName(currentUser.name);
      setRespPosition(currentUser.position);
      setRespPhone('02 141 3800');
      setRespEmail(currentUser.email);

      setAttachments([
        {
          id: 'att_1',
          type: 'BUDGET_REQUEST_FORM',
          fileName: 'แบบฟอร์มขอรับการจัดสรรงบประมาณ.docx',
          fileSize: '1.2 MB',
          uploadedAt: new Date().toLocaleDateString('th-TH')
        },
        {
          id: 'att_2',
          type: 'STRATEGIC_PROPOSAL_FORM',
          fileName: 'แบบฟอร์มข้อเสนอโครงการเชิงยุทธศาสตร์.pdf',
          fileSize: '850 KB',
          uploadedAt: new Date().toLocaleDateString('th-TH')
        }
      ]);

      initDefaultMonthlyPlan(200000);
    }
  }, [projectToEdit, isOpen, currentUser]);

  const initDefaultMonthlyPlan = (totalBudget: number) => {
    // Distribute budget according to Cabinet Resolution targets (Q1: 38%, Q2: 23%, Q3: 20%, Q4: 19%)
    const q1Total = totalBudget * 0.38;
    const q2Total = totalBudget * 0.23;
    const q3Total = totalBudget * 0.20;
    const q4Total = totalBudget * 0.19;

    const newPlan: MonthlyBudgetPlan[] = FISCAL_MONTHS.map(m => {
      let allocated = 0;
      if (m.quarter === 1) allocated = Math.round(q1Total / 3);
      else if (m.quarter === 2) allocated = Math.round(q2Total / 3);
      else if (m.quarter === 3) allocated = Math.round(q3Total / 3);
      else allocated = Math.round(q4Total / 3);

      return {
        month: m.month,
        monthName: m.name,
        quarter: m.quarter as 1 | 2 | 3 | 4,
        plannedSpent: allocated,
        plannedCommitted: m.quarter === 1 ? Math.round(totalBudget * 0.5 / 3) : 0,
      };
    });
    setMonthlyPlan(newPlan);
  };

  const [contractSigningMonth, setContractSigningMonth] = useState<number>(11); // Default November (Q1)

  // 2.1 Auto-calculate & apply Cabinet Resolution targets (Q1 38%, Q2 61%, Q3 81%, Q4 100%)
  const handleApplyCabinetTargets = () => {
    const total = totalCalculatedBudget || 200000;
    const q1Spent = total * 0.38;
    const q2Spent = total * 0.23; // 61% - 38%
    const q3Spent = total * 0.20; // 81% - 61%
    const q4Spent = total * 0.19; // 100% - 81%

    const updatedPlan = monthlyPlan.map((m) => {
      let monthlyVal = 0;
      if (m.quarter === 1) monthlyVal = Math.round(q1Spent / 3);
      else if (m.quarter === 2) monthlyVal = Math.round(q2Spent / 3);
      else if (m.quarter === 3) monthlyVal = Math.round(q3Spent / 3);
      else monthlyVal = Math.round(q4Spent / 3);

      return {
        ...m,
        plannedSpent: monthlyVal
      };
    });

    setMonthlyPlan(updatedPlan);
  };

  // 2.2 Apply Investment Commitment in Q1 (ต.ค. - ธ.ค.)
  const handleApplyInvestmentQ1Commitment = () => {
    const total = totalCalculatedBudget || 200000;
    const updatedPlan = monthlyPlan.map((m) => {
      if (m.month === contractSigningMonth || (m.quarter === 1 && m.month === 11)) {
        return { ...m, plannedCommitted: total };
      } else {
        return { ...m, plannedCommitted: 0 };
      }
    });
    setMonthlyPlan(updatedPlan);
  };

  // 2.3 Apply Full Spending in Expected Contract Signing Month
  const handleApplyContractSigningMonthPlan = () => {
    const total = totalCalculatedBudget || 200000;
    const updatedPlan = monthlyPlan.map((m) => {
      if (m.month === contractSigningMonth) {
        return { ...m, plannedSpent: total, plannedCommitted: total };
      } else {
        return { ...m, plannedSpent: 0, plannedCommitted: 0 };
      }
    });
    setMonthlyPlan(updatedPlan);
  };

  if (!isOpen) return null;

  const totalCalculatedBudget = activities.reduce((sum, a) => sum + (Number(a.plannedBudget) || 0), 0);
  const totalMonthlyPlannedSpent = monthlyPlan.reduce((sum, m) => sum + (Number(m.plannedSpent) || 0), 0);

  // Calculate Cumulative Quarterly Percentages
  const getQuarterCumulativePercent = (q: 1 | 2 | 3 | 4) => {
    if (totalCalculatedBudget === 0) return 0;
    const qSpentSum = monthlyPlan
      .filter(m => m.quarter <= q)
      .reduce((sum, m) => sum + (Number(m.plannedSpent) || 0), 0);
    return Number(((qSpentSum / totalCalculatedBudget) * 100).toFixed(1));
  };

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

  const handleAddFileUpload = (type: 'BUDGET_REQUEST_FORM' | 'STRATEGIC_PROPOSAL_FORM') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.doc,.docx,.pdf,.xlsx';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setAttachments(prev => [
          ...prev.filter(a => a.type !== type),
          {
            id: `att_${Date.now()}`,
            type,
            fileName: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            uploadedAt: new Date().toLocaleDateString('th-TH')
          }
        ]);
      }
    };
    input.click();
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('กรุณาระบุชื่อโครงการ');
      return;
    }

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
      strategicPillar,
      operationMethod,
      budgetSource,
      budgetCategory,
      nationalStrategy: natStrategyPillar,
      masterPlan: mpSubPlan,
      relatedPlans: level3Plan,
      strategicSection2: {
        nationalStrategyPillar: natStrategyPillar,
        nationalStrategyIssue: natStrategyIssue,
        nationalStrategyTarget: natStrategyTarget,
        masterPlanSubPlan: mpSubPlan,
        masterPlanSubTarget: mpSubTarget,
        nationalReformPlan: nationalReformPlan,
        economicDevPlanMilestone: econDevMilestone,
        level3Plan: level3Plan,
        nhrcStrategicPillar: nhrcStrategyPillarVal,
        nhrcStrategicIssue: nhrcStrategyIssueVal,
        relatedLaws: relatedLawsVal,
      },
      rationale,
      budgetAllocated: totalCalculatedBudget || (projectToEdit?.budgetAllocated ?? 200000),
      budgetSpent: projectToEdit ? projectToEdit.budgetSpent : 0,
      progressPercent: projectToEdit ? projectToEdit.progressPercent : 0,
      status: projectToEdit ? projectToEdit.status : 'NOT_STARTED',
      startDate: projectToEdit ? projectToEdit.startDate : '2025-10-01',
      endDate: projectToEdit ? projectToEdit.endDate : '2026-09-30',
      timeframeText,
      objectives: objectives.filter(o => o.trim().length > 0),
      targetGroup: targetGroup.trim(),
      targetArea: targetArea.trim(),
      expectedOutputs: expectedOutputs.filter(o => o.trim().length > 0),
      expectedOutcomes: expectedOutcomes.filter(o => o.trim().length > 0),
      expectedBenefits: expectedBenefits.filter(o => o.trim().length > 0),
      indicators,
      activities,
      monthlyBudgetPlan: monthlyPlan,
      investmentCommitmentQ1,
      attachments,
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-[#0a4d44] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-300" />
              <span>{projectToEdit ? `แก้ไขโครงการ (${projectToEdit.code})` : 'สร้างแบบเสนอโครงการตามแผนปฏิบัติการ (สำนักงาน กสม.)'}</span>
            </h3>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              จัดเก็บข้อมูลตามโครงสร้าง 5 ส่วนหลัก และตรวจสอบเกณฑ์เร่งรัดเบิกจ่ายตามมติ ครม. (21 ต.ค. 2568)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1.5 rounded-xl hover:bg-[#073b34] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab(1)}
            className={`px-4 py-3 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all ${
              activeTab === 1
                ? 'border-[#0a4d44] text-[#0a4d44] dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>ส่วนที่ 1: ข้อมูลโครงการ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(2)}
            className={`px-4 py-3 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all ${
              activeTab === 2
                ? 'border-[#0a4d44] text-[#0a4d44] dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>ส่วนที่ 2: ยุทธศาสตร์ชาติ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(3)}
            className={`px-4 py-3 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all ${
              activeTab === 3
                ? 'border-[#0a4d44] text-[#0a4d44] dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ส่วนที่ 3: รายละเอียดโครงการ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(4)}
            className={`px-4 py-3 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all ${
              activeTab === 4
                ? 'border-[#0a4d44] text-[#0a4d44] dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>ส่วนที่ 4: แผนรายเดือน & ครม.</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(5)}
            className={`px-4 py-3 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all ${
              activeTab === 5
                ? 'border-[#0a4d44] text-[#0a4d44] dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>ส่วนที่ 5 & เอกสารแนบ</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* TAB 1: ข้อมูลโครงการ */}
          {activeTab === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400">
                  ส่วนที่ 1 : ข้อมูลพื้นฐานโครงการ (Basic Project Information)
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">ปีงบประมาณ พ.ศ. {fiscalYear}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">รหัสกิจกรรม/โครงการ*</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="เช่น 69O1-13314"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-[#0a4d44] dark:text-emerald-400 text-sm"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ชื่อโครงการ*</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ระบุชื่อโครงการตามแผนปฏิบัติการประจำปี"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">สำนัก/ส่วนราชการรับผิดชอบ*</label>
                  <select
                    value={division}
                    onChange={(e) => {
                      const d = e.target.value as NHRCUnit;
                      setDivision(d);
                      setSubDivision(NHRC_UNITS[d]?.subDivisions[0] || 'กลุ่มงานทั่วไป');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">แผนงานงบประมาณ (6 แผนงาน)*</label>
                  <select
                    value={programCode}
                    onChange={(e) => setProgramCode(e.target.value as ProgramCode)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                  >
                    {Object.keys(BUDGET_PROGRAMS).map((p) => (
                      <option key={p} value={p}>
                        {p}: {BUDGET_PROGRAMS[p as ProgramCode].shortName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">วิธีการดำเนินงาน*</label>
                  <input
                    type="text"
                    value={operationMethod}
                    onChange={(e) => setOperationMethod(e.target.value)}
                    placeholder="เช่น ดำเนินการเอง / จ้างเหมา / ประชุมสัมมนา"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">แหล่งงบประมาณ*</label>
                  <input
                    type="text"
                    value={budgetSource}
                    onChange={(e) => setBudgetSource(e.target.value)}
                    placeholder="เช่น งบประมาณแผ่นดินรายจ่ายประจำปี"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ประเภทงบประมาณ*</label>
                  <select
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                  >
                    <option value="งบดำเนินงาน">งบดำเนินงาน</option>
                    <option value="งบลงทุน">งบลงทุน (ต้องวางแผนก่อหนี้ผูกพัน Q1)</option>
                    <option value="งบบุคลากร">งบบุคลากร</option>
                    <option value="งบอุดหนุน">งบอุดหนุน</option>
                    <option value="งบรายจ่ายอื่น">งบรายจ่ายอื่น</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ประเภทเชิงยุทธศาสตร์</label>
                  <div className="flex items-center gap-4 py-2">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="isStrategic"
                        checked={isStrategic}
                        onChange={() => setIsStrategic(true)}
                        className="text-[#0a4d44] focus:ring-[#0a4d44]"
                      />
                      <span>โครงการเชิงยุทธศาสตร์</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="isStrategic"
                        checked={!isStrategic}
                        onChange={() => setIsStrategic(false)}
                        className="text-[#0a4d44] focus:ring-[#0a4d44]"
                      />
                      <span>โครงการตามภารกิจประจำ/พื้นฐาน</span>
                    </label>
                  </div>
                </div>

                {isStrategic && (
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ยุทธศาสตร์ กสม. (4 ด้าน)</label>
                    <select
                      value={strategicPillar}
                      onChange={(e) => setStrategicPillar(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-medium"
                    >
                      <option value={1}>ยุทธศาสตร์ที่ 1: การส่งเสริมและคุ้มครองสิทธิมนุษยชน</option>
                      <option value={2}>ยุทธศาสตร์ที่ 2: การพัฒนาความร่วมมือกับภาคีเครือข่าย</option>
                      <option value={3}>ยุทธศาสตร์ที่ 3: การศึกษาวิจัยและขับเคลื่อนข้อเสนอแนะเชิงนโยบาย</option>
                      <option value={4}>ยุทธศาสตร์ที่ 4: การพัฒนาระบบบริหารจัดการองค์กรสู่ความเป็นเลิศ</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ความเชื่อมโยงยุทธศาสตร์ชาติ (2.1 - 2.7) */}
          {activeTab === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b pb-2 border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400">
                  ส่วนที่ 2 : ความเชื่อมโยงยุทธศาสตร์ชาติและแผนระดับต่าง ๆ (2.1 - 2.7)
                </h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  เชื่อมโยงยุทธศาสตร์ชาติ 20 ปี, แผนแม่บท, แผนปฏิรูปประเทศ, แผนพัฒนาเศรษฐกิจฯ ฉบับที่ 13, แผนระดับที่ 3, ยุทธศาสตร์ กสม. และกฎหมายที่เกี่ยวข้อง
                </p>
              </div>

              <div className="space-y-5 text-xs">
                {/* 2.1 ยุทธศาสตร์ชาติ */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h5 className="font-bold text-xs text-[#0a4d44] dark:text-emerald-400 flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    <span>2.1 ยุทธศาสตร์ชาติ</span>
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ยุทธศาสตร์ที่ (6 ด้าน)*</label>
                      <select
                        value={natStrategyPillar}
                        onChange={(e) => setNatStrategyPillar(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                      >
                        {NATIONAL_STRATEGY_PILLARS.map((p, idx) => (
                          <option key={idx} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ประเด็น*</label>
                      <input
                        type="text"
                        value={natStrategyIssue}
                        onChange={(e) => setNatStrategyIssue(e.target.value)}
                        placeholder="เช่น การพัฒนาระบบการบริหารราชการแผ่นดินและบริการประชาชน"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">เป้าหมาย*</label>
                      <input
                        type="text"
                        value={natStrategyTarget}
                        onChange={(e) => setNatStrategyTarget(e.target.value)}
                        placeholder="เช่น ภาครัฐมีความโปร่งใส มีประสิทธิภาพ และเปิดกว้าง"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* 2.2 แผนแม่บทภายใต้ยุทธศาสตร์ชาติ */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h5 className="font-bold text-xs text-[#0a4d44] dark:text-emerald-400">
                    2.2 แผนแม่บทภายใต้ยุทธศาสตร์ชาติ (23 ประเด็น)
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ประเด็นแผนแม่บท (23 ประเด็น)*</label>
                      <select
                        value={mpSubPlan}
                        onChange={(e) => setMpSubPlan(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                      >
                        {MASTER_PLAN_ISSUES.map((issue, idx) => (
                          <option key={idx} value={issue}>{issue}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">เป้าหมายแผนย่อย*</label>
                      <input
                        type="text"
                        value={mpSubTarget}
                        onChange={(e) => setMpSubTarget(e.target.value)}
                        placeholder="เช่น ยกระดับบริการประชาชนและการขับเคลื่อนองค์กรภาครัฐดิจิทัล"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* 2.3 & 2.4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 2.3 แผนการปฏิรูปประเทศ */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h5 className="font-bold text-xs text-[#0a4d44] dark:text-emerald-400">
                      2.3 แผนการปฏิรูปประเทศ (13 ด้าน)
                    </h5>
                    <select
                      value={nationalReformPlan}
                      onChange={(e) => setNationalReformPlan(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                    >
                      {NATIONAL_REFORM_AREAS.map((reform, idx) => (
                        <option key={idx} value={reform}>{reform}</option>
                      ))}
                    </select>
                  </div>

                  {/* 2.4 แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h5 className="font-bold text-xs text-[#0a4d44] dark:text-emerald-400">
                      2.4 แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ ฉบับที่ 13 (13 หมุดหมาย)
                    </h5>
                    <select
                      value={econDevMilestone}
                      onChange={(e) => setEconDevMilestone(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                    >
                      {FIVE_YEAR_DEV_PLAN_MILESTONES.map((m, idx) => (
                        <option key={idx} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2.5 & 2.6 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 2.5 แผนระดับที่ 3 ที่เกี่ยวข้อง */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h5 className="font-bold text-xs text-[#0a4d44] dark:text-emerald-400">
                      2.5 แผนระดับที่ 3 ที่เกี่ยวข้อง
                    </h5>
                    <input
                      type="text"
                      value={level3Plan}
                      onChange={(e) => setLevel3Plan(e.target.value)}
                      placeholder="เช่น แผนสิทธิมนุษยชนแห่งชาติ ฉบับที่ 5 (พ.ศ. 2566 - 2570)"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  {/* 2.6 ยุทธศาสตร์ กสม. */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h5 className="font-bold text-xs text-[#0a4d44] dark:text-emerald-400">
                      2.6 ยุทธศาสตร์ กสม. (ยุทธศาสตร์ที่และชื่อยุทธศาสตร์)
                    </h5>
                    <div className="space-y-2">
                      <select
                        value={nhrcStrategyPillarVal}
                        onChange={(e) => setNhrcStrategyPillarVal(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                      >
                        {[1, 2, 3, 4].map((num) => (
                          <option key={num} value={num}>
                            {NHRC_STRATEGIC_PILLARS_FULL[num]}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={nhrcStrategyIssueVal}
                        onChange={(e) => setNhrcStrategyIssueVal(e.target.value)}
                        placeholder="ประเด็นยุทธศาสตร์ กสม. ที่เกี่ยวข้อง"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* 2.7 กฎหมายที่เกี่ยวข้อง */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <h5 className="font-bold text-xs text-[#0a4d44] dark:text-emerald-400">
                    2.7 กฎหมายที่เกี่ยวข้อง
                  </h5>
                  <input
                    type="text"
                    value={relatedLawsVal}
                    onChange={(e) => setRelatedLawsVal(e.target.value)}
                    placeholder="เช่น พ.ร.ป. คณะกรรมการสิทธิมนุษยชนแห่งชาติ พ.ศ. 2560 และระเบียบ กสม. ว่าด้วยการงบประมาณ พ.ศ. 2566"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: รายละเอียดโครงการ */}
          {activeTab === 3 && (
            <div className="space-y-5 animate-fadeIn text-xs">
              <div className="border-b pb-2 border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400">
                  ส่วนที่ 3 : รายละเอียดโครงการ (Rationale, Objectives, Targets, Indicators)
                </h4>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">หลักการและเหตุผล (Rationale & Background)</label>
                <textarea
                  rows={3}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="อธิบายความเป็นมา สภาพปัญหา ความจำเป็น และเหตุผลในการจัดทำโครงการ"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl leading-relaxed text-xs"
                />
              </div>

              {/* Objectives */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">วัตถุประสงค์โครงการ</label>
                {objectives.map((obj, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => {
                        const newObjs = [...objectives];
                        newObjs[idx] = e.target.value;
                        setObjectives(newObjs);
                      }}
                      placeholder={`วัตถุประสงค์ ข้อที่ ${idx + 1}`}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                    {objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setObjectives(objectives.filter((_, i) => i !== idx))}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setObjectives([...objectives, ''])}
                  className="text-xs font-bold text-[#0a4d44] dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> เพิ่มวัตถุประสงค์
                </button>
              </div>

              {/* Target Group, Target Area & Timeframe */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">กลุ่มเป้าหมาย*</label>
                  <input
                    type="text"
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    placeholder="เช่น ประชาชนทั่วไป องค์กรภาคเอกชน และเจ้าหน้าที่รัฐ"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">พื้นที่ดำเนินงาน*</label>
                  <input
                    type="text"
                    value={targetArea}
                    onChange={(e) => setTargetArea(e.target.value)}
                    placeholder="เช่น ทั่วประเทศ (77 จังหวัด) หรือ สงขลา"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ระยะเวลาการดำเนินโครงการ*</label>
                  <input
                    type="text"
                    value={timeframeText}
                    onChange={(e) => setTimeframeText(e.target.value)}
                    placeholder="เช่น ตุลาคม 2568 ถึงกันยายน 2569"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Expected Outputs, Outcomes & Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ผลผลิตของโครงการ (Outputs)</label>
                  <textarea
                    rows={3}
                    value={expectedOutputs.join('\n')}
                    onChange={(e) => setExpectedOutputs(e.target.value.split('\n'))}
                    placeholder="ระบุผลผลิตเชิงปริมาณหรือคุณภาพ"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl leading-relaxed text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ผลลัพธ์ของโครงการ (Outcomes)</label>
                  <textarea
                    rows={3}
                    value={expectedOutcomes.join('\n')}
                    onChange={(e) => setExpectedOutcomes(e.target.value.split('\n'))}
                    placeholder="ระบุผลลัพธ์ระยะยาว ประโยชน์ที่เกิดจากโครงการ"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl leading-relaxed text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ผลที่คาดว่าจะเกิดขึ้นหรือได้รับ</label>
                  <textarea
                    rows={3}
                    value={expectedBenefits.join('\n')}
                    onChange={(e) => setExpectedBenefits(e.target.value.split('\n'))}
                    placeholder="ระบุผลประโยชน์ต่อประชาชน หรือหน่วยงาน"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl leading-relaxed text-xs"
                  />
                </div>
              </div>

              {/* Activities List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b pb-1 border-slate-200 dark:border-slate-800">
                  <h5 className="font-bold text-xs text-[#0a4d44] dark:text-emerald-400">
                    รายการกิจกรรมและงบประมาณย่อย
                  </h5>
                  <button
                    type="button"
                    onClick={handleAddActivity}
                    className="flex items-center gap-1 text-xs font-bold text-[#0a4d44] dark:text-emerald-300 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มกิจกรรม</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {activities.map((act, index) => (
                    <div key={act.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={act.name}
                          onChange={(e) => handleActivityChange(act.id, 'name', e.target.value)}
                          placeholder={`กิจกรรมที่ ${index + 1}`}
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-xs"
                          required
                        />
                        {activities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(act.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
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
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">สัดส่วนแผน (%):</span>
                          <input
                            type="number"
                            value={act.plannedPercent || 0}
                            onChange={(e) => handleActivityChange(act.id, 'plannedPercent', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">งบกิจกรรม (บาท):</span>
                          <input
                            type="number"
                            value={act.plannedBudget || 0}
                            onChange={(e) => handleActivityChange(act.id, 'plannedBudget', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-[#0a4d44]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-between font-bold text-xs">
                  <span className="text-[#0a4d44] dark:text-emerald-300">งบประมาณรวมทั้งโครงการ:</span>
                  <span className="text-sm font-mono text-[#0a4d44] dark:text-emerald-300">
                    {totalCalculatedBudget.toLocaleString()} บาท
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: แผนรายเดือน & มาตรการเร่งรัด ครม. */}
          {activeTab === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b pb-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400">
                    ส่วนที่ 2 : รายละเอียดแผนการใช้จ่ายงบประมาณ (มติ ครม. 21 ต.ค. 2568)
                  </h4>
                  <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[11px] px-2.5 py-1 rounded-full border border-amber-300">
                    มติ ครม. 21 ต.ค. 2568
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">
                  วางแผนการเบิกจ่ายให้เป็นไปตามมาตรการเร่งรัดการเบิกจ่ายงบประมาณประจำปี (สะสม: Q1 38%, Q2 61%, Q3 81%, Q4 100%)
                </p>
              </div>

              {/* Cabinet Targets KPI Summary Bar (2.1) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((qNum) => {
                  const qVal = qNum as 1 | 2 | 3 | 4;
                  const currentRate = getQuarterCumulativePercent(qVal);
                  const targetRate = CABINET_QUARTER_TARGETS[qVal];
                  const isPass = currentRate >= targetRate;

                  return (
                    <div
                      key={qNum}
                      className={`p-3 rounded-xl border ${
                        isPass
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                          : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span>ไตรมาสที่ {qNum}</span>
                        <span>เป้าหมาย {targetRate}%</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-bold font-mono">{currentRate}%</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPass ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                          {isPass ? '✓ ตามเป้า' : '⚠️ ต่ำกว่าเป้า'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Automated Tools Toolbar for 2.1, 2.2, 2.3 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>เครื่องมือจัดทำแผนงบประมาณอัตโนมัติ (สอดคล้อง มติ ครม. 21 ต.ค. 2568)</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {/* 2.1 Auto Cabinet targets */}
                  <button
                    type="button"
                    onClick={handleApplyCabinetTargets}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-xl font-bold text-xs text-left transition-all cursor-pointer flex flex-col justify-between gap-1 shadow-xs"
                  >
                    <span className="flex items-center gap-1 text-[#0a4d44] dark:text-emerald-300 font-bold">
                      <span>2.1 คำนวณแผนตาม มติ ครม.</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-normal">
                      ปรับรายเดือนอัตโนมัติให้เข้าเกณฑ์ Q1 38% | Q2 61% | Q3 81% | Q4 100%
                    </span>
                  </button>

                  {/* 2.2 Q1 Investment commitment */}
                  <button
                    type="button"
                    onClick={handleApplyInvestmentQ1Commitment}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800 rounded-xl font-bold text-xs text-left transition-all cursor-pointer flex flex-col justify-between gap-1 shadow-xs"
                  >
                    <span className="flex items-center gap-1 text-blue-900 dark:text-blue-300 font-bold">
                      <span>2.2 งบลงทุน: วางแผนก่อหนี้ Q1</span>
                    </span>
                    <span className="text-[10px] text-blue-700 dark:text-blue-400 font-normal">
                      ตั้งวงเงินสัญญาผูกพัน PO เต็มวงเงินในไตรมาสที่ 1 (ต.ค. - ธ.ค.)
                    </span>
                  </button>

                  {/* 2.3 Contract month spending */}
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 text-purple-950 dark:text-purple-200 border border-purple-300 dark:border-purple-800 rounded-xl text-xs flex flex-col justify-between gap-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">2.3 เลือกเดือนสัญญาจัดจ้าง:</span>
                      <select
                        value={contractSigningMonth}
                        onChange={(e) => setContractSigningMonth(Number(e.target.value))}
                        className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded font-bold text-[10px] text-purple-900 dark:text-purple-200 outline-none"
                      >
                        {FISCAL_MONTHS.map(m => (
                          <option key={m.month} value={m.month}>
                            {m.name} (Q{m.quarter})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyContractSigningMonthPlan}
                      className="w-full mt-0.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      วางแผนเต็มวงเงินในเดือนสัญญา
                    </button>
                  </div>
                </div>
              </div>

              {/* Investment Commitment Alert */}
              {budgetCategory === 'งบลงทุน' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-200 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <p className="font-bold text-xs mb-0.5">ข้อกำหนดงบประมาณรายจ่ายลงทุน (มติ ครม.)</p>
                    <p>งบประมาณรายจ่ายลงทุน ต้องวางแผนการใช้จ่ายและจัดทำแผนก่อหนี้ผูกพัน (PO/สัญญา) ให้เสร็จสิ้นภายใน <b>ไตรมาสที่ 1 (ต.ค. - ธ.ค. 2568)</b></p>
                  </div>
                </div>
              )}

              {/* Monthly Plan Grid */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200">
                      <th className="p-2">เดือน</th>
                      <th className="p-2">ไตรมาส</th>
                      <th className="p-2">แผนการดำเนินงานรายเดือน</th>
                      <th className="p-2 text-right">แผนใช้จ่ายจริง (บาท)</th>
                      {budgetCategory === 'งบลงทุน' && <th className="p-2 text-right">แผนก่อหนี้ PO (บาท)</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {monthlyPlan.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2 font-bold text-slate-800 dark:text-white whitespace-nowrap">
                          {m.monthName}
                        </td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-bold">
                            Q{m.quarter}
                          </span>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={m.operationMilestone || ''}
                            onChange={(e) => {
                              const updated = [...monthlyPlan];
                              updated[idx].operationMilestone = e.target.value;
                              setMonthlyPlan(updated);
                            }}
                            placeholder="รายละเอียดกิจกรรมในเดือนนี้"
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            value={m.plannedSpent}
                            onChange={(e) => {
                              const updated = [...monthlyPlan];
                              updated[idx].plannedSpent = Number(e.target.value);
                              setMonthlyPlan(updated);
                            }}
                            className="w-28 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-right font-mono font-bold text-[#0a4d44]"
                          />
                        </td>
                        {budgetCategory === 'งบลงทุน' && (
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={m.plannedCommitted || 0}
                              onChange={(e) => {
                                const updated = [...monthlyPlan];
                                updated[idx].plannedCommitted = Number(e.target.value);
                                setMonthlyPlan(updated);
                              }}
                              className="w-28 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-right font-mono text-blue-700 font-bold"
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between font-bold text-xs">
                <span>รวมแผนใช้จ่ายรายเดือน 12 เดือน:</span>
                <span className="font-mono text-sm text-[#0a4d44] dark:text-emerald-400">
                  {totalMonthlyPlannedSpent.toLocaleString()} บาท (งบจัดสรรรวม {totalCalculatedBudget.toLocaleString()} บาท)
                </span>
              </div>
            </div>
          )}

          {/* TAB 5: ผู้รับผิดชอบ & เอกสารแนบ */}
          {activeTab === 5 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Officer Section */}
              <div className="space-y-3">
                <div className="border-b pb-2 border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>ส่วนที่ 5 : ผู้รับผิดชอบ/ผู้ประสานงานโครงการ</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ชื่อ-นามสกุล ผู้รับผิดชอบ*</label>
                    <input
                      type="text"
                      value={respName}
                      onChange={(e) => setRespName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">ตำแหน่ง*</label>
                    <input
                      type="text"
                      value={respPosition}
                      onChange={(e) => setRespPosition(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                    <input
                      type="text"
                      value={respPhone}
                      onChange={(e) => setRespPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">อีเมลผู้รับผิดชอบ</label>
                    <input
                      type="email"
                      value={respEmail}
                      onChange={(e) => setRespEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-3 pt-2">
                <div className="border-b pb-2 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#0a4d44] dark:text-emerald-400 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4" />
                    <span>เอกสารแนบประกอบโครงการ (Attachments)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">แนบไฟล์ .docx, .pdf, .xlsx</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File 1: Budget Request Form */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-white">
                        (1) แบบฟอร์มขอรับการจัดสรรงบประมาณ
                      </span>
                      {attachments.some(a => a.type === 'BUDGET_REQUEST_FORM') ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> แนบไฟล์แล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                          จำเป็น
                        </span>
                      )}
                    </div>

                    {attachments.filter(a => a.type === 'BUDGET_REQUEST_FORM').map(att => (
                      <div key={att.id} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-4 h-4 text-[#0a4d44]" />
                          <span className="truncate font-medium">{att.fileName}</span>
                          <span className="text-[10px] text-slate-400">({att.fileSize})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddFileUpload('BUDGET_REQUEST_FORM')}
                      className="w-full py-2 px-3 border border-dashed border-[#0a4d44] dark:border-emerald-500 text-[#0a4d44] dark:text-emerald-400 font-bold text-xs rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>แนบไฟล์แบบฟอร์มขอรับจัดสรรงบประมาณ</span>
                    </button>
                  </div>

                  {/* File 2: Strategic Proposal Form */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-white">
                        (2) แบบฟอร์มข้อเสนอโครงการเชิงยุทธศาสตร์
                      </span>
                      {attachments.some(a => a.type === 'STRATEGIC_PROPOSAL_FORM') ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> แนบไฟล์แล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                          จำเป็น
                        </span>
                      )}
                    </div>

                    {attachments.filter(a => a.type === 'STRATEGIC_PROPOSAL_FORM').map(att => (
                      <div key={att.id} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-4 h-4 text-[#0a4d44]" />
                          <span className="truncate font-medium">{att.fileName}</span>
                          <span className="text-[10px] text-slate-400">({att.fileSize})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddFileUpload('STRATEGIC_PROPOSAL_FORM')}
                      className="w-full py-2 px-3 border border-dashed border-[#0a4d44] dark:border-emerald-500 text-[#0a4d44] dark:text-emerald-400 font-bold text-xs rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>แนบไฟล์ข้อเสนอโครงการเชิงยุทธศาสตร์</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeTab > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  ← ส่วนก่อนหน้า
                </button>
              )}
              {activeTab < 5 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab + 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0a4d44]/10 dark:bg-emerald-950 text-[#0a4d44] dark:text-emerald-400 hover:bg-[#0a4d44]/20"
                >
                  ส่วนถัดไป →
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-[#0a4d44] hover:bg-[#083b34] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกโครงการ</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
