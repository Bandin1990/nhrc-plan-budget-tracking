import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scale, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, 
  HelpCircle, Plus, Trash2, FileText, Check, ShieldAlert, 
  FolderKanban, Sparkles, Building2, Landmark, Printer,
  Download, Copy, Users, Calendar, ArrowDownRight, Layers,
  ListChecks, ChevronRight, Info, RefreshCw, BookOpen, GitFork
} from 'lucide-react';
import { 
  WorkflowState, DiagnosisResult, TransferBudgetItem, 
  OfficialMemoData, ApproverAuthority, ChangeScope, IntraChangeType 
} from '../../types/budget';
import { Project, BUDGET_PROGRAMS, ProgramCode, NHRC_UNITS, NHRCUnit, ProjectActivity } from '../../types/project';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, thaiBahtText, toThaiNumerals, getTodayThaiDate, formatMemoBookNumber } from '../../utils/thaiNumber';
import { GarudaEmblem } from '../common/GarudaEmblem';
import { generateWordDocument } from '../../utils/wordExport';
import { FullRegulationModal } from './FullRegulationModal';
import { TransferWorkflowModal } from './TransferWorkflowModal';
import confetti from 'canvas-confetti';

interface BudgetTransferWizardProps {
  initialProject?: Project | null;
  onSuccess: (memo: OfficialMemoData) => void;
  onCancel: () => void;
}

export const BudgetTransferWizard: React.FC<BudgetTransferWizardProps> = ({
  initialProject,
  onSuccess,
  onCancel,
}) => {
  const { projects, addOfficialMemo, addProject, updateProject } = useProjects();
  const { currentUser } = useAuth();

  // Wizard Step: 1 = เลือกโครงการและดูสถานะ, 2 = เช็คลิสต์เงื่อนไขตามระเบียบ 2566, 3 = กรอกรายละเอียดการเปลี่ยนแปลง, 4 = บันทึกข้อความตราครุฑ
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isRegulationModalOpen, setIsRegulationModalOpen] = useState<boolean>(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);

  // ----------------------------------------------------
  // STEP 1 STATE: Selected Project (โครงการที่จะดำเนินการ)
  // ----------------------------------------------------
  const [sourceProjectId, setSourceProjectId] = useState<string>(() => {
    if (initialProject) return initialProject.id;
    const p = projects.find(proj => (proj.budgetAllocated - proj.budgetSpent) > 0) || projects[0];
    return p ? p.id : '';
  });
  const sourceProject = useMemo(() => projects.find(p => p.id === sourceProjectId) || projects[0], [projects, sourceProjectId]);

  // ----------------------------------------------------
  // STEP 2 STATE: Regulatory Diagnostic Checklist
  // ----------------------------------------------------
  const [changeScope, setChangeScope] = useState<ChangeScope>('intra_project');
  const [intraChangeType, setIntraChangeType] = useState<IntraChangeType>('between_activities');

  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    category: 'annual_budget',
    changeScope: 'intra_project',
    intraChangeType: 'between_activities',
    isCrossProgram: false,
    impactsPlan: false,
    impactChecklist: {
      activityChanged: false,
      targetsChanged: false,
      scopeChanged: false,
      timeframeDelayed: false,
      totalBudgetIncreased: false,
    },
    targetAdjustment: {
      isChanged: false,
      original: '200 คน',
      adjusted: '150 คน',
    },
    frequencyAdjustment: {
      isChanged: false,
      original: '2 ครั้ง',
      adjusted: '4 ครั้ง',
    },
    isAssetOrConstruction: false,
    itemType: 'other',
    isIncreaseWithin10Percent: true,
    isWithinThreshold: true,
    unitPrice: 0,
    multiYearCase: null,
  });

  // ----------------------------------------------------
  // STEP 3 STATE: Dynamic Details
  // ----------------------------------------------------
  // Source Activity in project
  const [sourceActivityId, setSourceActivityId] = useState<string>('');
  const sourceActivity = useMemo(() => {
    if (!sourceProject || !sourceProject.activities) return null;
    return sourceProject.activities.find(a => a.id === sourceActivityId) || sourceProject.activities[0] || null;
  }, [sourceProject, sourceActivityId]);

  // Destination Activity (Intra-Project)
  const [destActivityMode, setDestActivityMode] = useState<'existing' | 'new'>('existing');
  const [destActivityId, setDestActivityId] = useState<string>('');
  const [newActivityName, setNewActivityName] = useState<string>('กิจกรรมจัดทำสื่ออินโฟกราฟิกและคู่มือสิทธิมนุษยชนดิจิทัล');
  const [newActivityTimeframe, setNewActivityTimeframe] = useState<string>('ก.ค. - ก.ย. 69');

  // Inter-Project Destination State
  const [destMode, setDestMode] = useState<'existing' | 'new'>('existing');
  const [destProjectId, setDestProjectId] = useState<string>(() => {
    const other = projects.find(p => p.id !== sourceProjectId);
    return other ? other.id : (projects[1]?.id || projects[0]?.id || '');
  });
  const destProject = useMemo(() => projects.find(p => p.id === destProjectId) || projects[1] || projects[0], [projects, destProjectId]);

  // New Project Fields (if Inter-Project & New Project)
  const [newProjectName, setNewProjectName] = useState<string>('โครงการพัฒนาระบบเฝ้าระวังสถานการณ์สิทธิมนุษยชนแบบดิจิทัล');
  const [newProjectDivision, setNewProjectDivision] = useState<NHRCUnit>('สดส.');
  const [newProjectProgram, setNewProjectProgram] = useState<ProgramCode>('M_T');
  const [newProjectActivityName, setNewProjectActivityName] = useState<string>('ค่าพัฒนาระบบคลาวด์และโปรแกรมประยุกต์');
  const [newProjectObjective, setNewProjectObjective] = useState<string>('เพื่อรองรับการเชื่อมโยงฐานข้อมูลการร้องเรียนและการประเมินสถานการณ์สิทธิมนุษยชนในระดับพื้นที่อย่างมีประสิทธิภาพ');

  // Transfer Amount & Descriptions
  const [transferAmount, setTransferAmount] = useState<number>(33135);
  const [reason, setReason] = useState<string>(
    'เนื่องจากมีความจำเป็นต้องปรับแผนการใช้จ่ายงบประมาณให้สอดคล้องกับภารกิจเร่งด่วน โดยมีงบประมาณเหลือจ่ายจากการดำเนินงานที่แล้วเสร็จ'
  );

  // ----------------------------------------------------
  // STEP 4 STATE: Official Memo & Export
  // ----------------------------------------------------
  const [bookNumber, setBookNumber] = useState<string>('สม');
  const [memoDate, setMemoDate] = useState<string>(getTodayThaiDate());
  const [subject, setSubject] = useState<string>('');
  const [useThaiNumerals, setUseThaiNumerals] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Initialize source activity when project changes
  useEffect(() => {
    if (sourceProject && sourceProject.activities && sourceProject.activities.length > 0) {
      setSourceActivityId(sourceProject.activities[0].id);
      if (sourceProject.activities.length > 1) {
        setDestActivityId(sourceProject.activities[1].id);
      }
    }
  }, [sourceProject]);

  // Sync cross-program when Inter-Project is selected
  useEffect(() => {
    if (changeScope === 'intra_project') {
      setWorkflowState(prev => ({ ...prev, isCrossProgram: false, changeScope: 'intra_project' }));
    } else {
      if (sourceProject) {
        const sourceProg = sourceProject.programCode;
        const destProg = destMode === 'new' ? newProjectProgram : (destProject ? destProject.programCode : sourceProg);
        const isCross = sourceProg !== destProg;
        setWorkflowState(prev => ({ ...prev, isCrossProgram: isCross, changeScope: 'inter_project' }));
      }
    }
  }, [changeScope, sourceProject, destProject, destMode, newProjectProgram]);

  // Sync impactChecklist changes to workflowState.impactsPlan
  useEffect(() => {
    const hasImpact = 
      workflowState.impactChecklist.activityChanged ||
      workflowState.impactChecklist.targetsChanged ||
      workflowState.impactChecklist.scopeChanged ||
      workflowState.impactChecklist.timeframeDelayed ||
      workflowState.impactChecklist.totalBudgetIncreased;
    
    setWorkflowState(prev => ({ ...prev, impactsPlan: hasImpact }));
  }, [workflowState.impactChecklist]);

  // Update default subject
  useEffect(() => {
    if (changeScope === 'intra_project') {
      const destName = destActivityMode === 'new' ? `กิจกรรมใหม่: ${newActivityName}` : (sourceProject?.activities?.find(a => a.id === destActivityId)?.name || 'กิจกรรมภายในโครงการ');
      setSubject(`ขออนุมัติเปลี่ยนแปลงงบประมาณภายในโครงการ ${sourceProject?.name || ''} เพื่อจัดสรรให้กับ ${destName}`);
    } else {
      const targetName = destMode === 'new' ? `โครงการใหม่: ${newProjectName}` : (destProject ? destProject.name : 'โครงการปลายทาง');
      setSubject(`ขออนุมัติโอนเปลี่ยนแปลงงบประมาณรายจ่ายประจำปีเพื่อจัดสรรให้กับ ${targetName}`);
    }
  }, [changeScope, destActivityMode, newActivityName, destActivityId, destMode, newProjectName, destProject, sourceProject]);

  // Calculations for financial balances
  const sourceAllocated = sourceProject ? sourceProject.budgetAllocated : 0;
  const sourceSpent = sourceProject ? sourceProject.budgetSpent : 0;
  const sourceRemaining = sourceAllocated - sourceSpent;

  // Source Activity Financials
  const srcActPlanned = sourceActivity ? sourceActivity.plannedBudget : 0;
  const srcActSpent = sourceActivity ? sourceActivity.actualSpent : 0;
  const srcActRemaining = srcActPlanned - srcActSpent;

  // Destination Activity Financials (Intra)
  const destAct = useMemo(() => {
    if (destActivityMode === 'new' || !sourceProject?.activities) return null;
    return sourceProject.activities.find(a => a.id === destActivityId) || null;
  }, [destActivityMode, sourceProject, destActivityId]);

  const destActPlanned = destAct ? destAct.plannedBudget : 0;
  const destActSpent = destAct ? destAct.actualSpent : 0;

  // ----------------------------------------------------
  // DIAGNOSIS ENGINE (ตามระเบียบ กสม. หมวด 2 ข้อ 12-16)
  // ----------------------------------------------------
  const diagnosis = useMemo<DiagnosisResult>(() => {
    // 1. Cross Program (ข้อ 14) -> คณะกรรมการ กสม.
    if (workflowState.isCrossProgram === true) {
      return {
        approver: 'COMMISSION_BOARD',
        approverTitle: 'คณะกรรมการสิทธิมนุษยชนแห่งชาติ (กสม.)',
        approverSubtitle: 'เนื่องจากเป็นการโอนข้ามแผนงาน ต้องเสนอขออนุมัติต่อที่ประชุม กสม. ด้านบริหาร',
        ruleClause: 'ระเบียบ กสม. ว่าด้วยการงบประมาณ พ.ศ. 2566 ข้อ 14',
        ruleDescription: 'การโอนหรือเปลี่ยนแปลงงบประมาณรายจ่ายประจำปีข้ามแผนงานจะกระทำมิได้ เว้นแต่จะได้รับอนุมัติจากคณะกรรมการ',
        actionSummary: 'จัดทำวาระเสนอที่ประชุมคณะกรรมการสิทธิมนุษยชนแห่งชาติ (กสม.) พิจารณาอนุมัติ',
        severityColor: 'rose',
        nextSteps: ['จัดทำบันทึกผ่านเลขาธิการ กสม.', 'บรรจุเข้าสู่วาระการประชุม กสม. ด้านบริหาร', 'แจ้งสำนักงบประมาณทราบ']
      };
    }

    // 2. Impacts Approved Plan (ข้อ 15 วรรคท้าย) -> คณะกรรมการ กสม.
    if (workflowState.impactsPlan === true) {
      return {
        approver: 'COMMISSION_BOARD',
        approverTitle: 'คณะกรรมการสิทธิมนุษยชนแห่งชาติ (กสม.)',
        approverSubtitle: 'เนื่องจากกระทบต่อแผนการปฏิบัติงานที่ กสม. ให้ความเห็นชอบไว้ (ปรับเป้าหมาย/ยกเลิกกิจกรรม/โครงการใหม่)',
        ruleClause: 'ระเบียบ กสม. ว่าด้วยการงบประมาณ พ.ศ. 2566 ข้อ 15 วรรคท้าย',
        ruleDescription: 'การเปลี่ยนแปลงรายการที่กระทบต่อแผนการปฏิบัติงานที่คณะกรรมการให้ความเห็นชอบไว้ ให้เสนอต่อคณะกรรมการเพื่อพิจารณาอนุมัติ',
        actionSummary: 'เสนอขอความเห็นชอบและอนุมัติจากคณะกรรมการ กสม.',
        severityColor: 'amber',
        nextSteps: ['รายงานผลกระทบต่อเป้าหมายและตัวชี้วัด', 'เสนอ กสม. พิจารณาให้ความเห็นชอบการปรับปรุงแผน']
      };
    }

    // 3. Equipment or Construction (ข้อ 15 วรรคสอง-สาม-สี่)
    if (workflowState.isAssetOrConstruction === true) {
      // If increase within 10% (ข้อ 15 วรรคสี่) -> เลขาธิการ กสม.
      if (workflowState.isIncreaseWithin10Percent === true) {
        return {
          approver: 'SECRETARY_GENERAL',
          approverTitle: 'เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ',
          approverSubtitle: 'เพิ่มวงเงินครุภัณฑ์/สิ่งก่อสร้างแต่ละหน่วยไม่เกินร้อยละ 10 ของวงเงินเดิม',
          ruleClause: 'ระเบียบ กสม. ว่าด้วยการงบประมาณ พ.ศ. 2566 ข้อ 15 วรรคสี่',
          ruleDescription: 'การเพิ่มวงเงินรายการค่าครุภัณฑ์ หรือค่าที่ดินและสิ่งก่อสร้าง แต่ละหน่วยไม่เกินร้อยละสิบของวงเงินที่ได้รับความเห็นชอบแล้ว ให้เลขาธิการเป็นผู้อนุมัติ',
          actionSummary: 'เสนอเลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ เพื่อโปรดพิจารณาอนุมัติ',
          severityColor: 'emerald',
          nextSteps: ['จัดทำบันทึกข้อความตราครุฑเสนอตามสายงานบังคับบัญชา', 'เลขาธิการ กสม. ลงนามอนุมัติ']
        };
      }

      // If exceeds threshold (> 1MB equipment or > 10MB land/construction) (ข้อ 15 วรรคสาม) -> ประธาน กสม.
      if (workflowState.isWithinThreshold === false) {
        return {
          approver: 'COMMISSION_CHAIR',
          approverTitle: 'ประธานกรรมการสิทธิมนุษยชนแห่งชาติ',
          approverSubtitle: 'ค่าครุภัณฑ์เกิน 1 ล้านบาท/หน่วย หรือค่าที่ดิน-สิ่งก่อสร้างเกิน 10 ล้านบาท/รายการ',
          ruleClause: 'ระเบียบ กสม. ว่าด้วยการงบประมาณ พ.ศ. 2566 ข้อ 15 วรรคสาม',
          ruleDescription: 'กรณีเปลี่ยนแปลงรายการค่าครุภัณฑ์เกินหนึ่งล้านบาท หรือที่ดินสิ่งก่อสร้างเกินสิบล้านบาท ให้กระทำได้ต่อเมื่อได้รับความเห็นชอบจากประธานกรรมการสิทธิมนุษยชนแห่งชาติ',
          actionSummary: 'เสนอเพื่อโปรดพิจารณาให้ความเห็นชอบจากประธาน กสม.',
          severityColor: 'blue',
          nextSteps: ['ตรวจสอบคุณลักษณะเฉพาะ (TOR) และราคากลาง', 'เสนอผ่านเลขาธิการ กสม. ไปยังประธาน กสม.']
        };
      }
    }

    // 4. Default: Standard change within program (ข้อ 13 และข้อ 15 วรรคหนึ่ง) -> เลขาธิการ กสม.
    return {
      approver: 'SECRETARY_GENERAL',
      approverTitle: 'เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ',
      approverSubtitle: 'เปลี่ยนแปลงรายการหรือจำนวนเงินภายในแผนงาน โดยไม่เพิ่มวงเงินรวมและไม่กระทบแผน',
      ruleClause: 'ระเบียบ กสม. ว่าด้วยการงบประมาณ พ.ศ. 2566 ข้อ 13 และข้อ 15 วรรคหนึ่ง',
      ruleDescription: 'การเปลี่ยนแปลงรายการหรือจำนวนเงินต่างไปจากแผนปฏิบัติการประจำปีโดยไม่เพิ่มวงเงินรวม และไม่กระทบต่อแผนการปฏิบัติงานที่คณะกรรมการให้ความเห็นชอบ ให้เลขาธิการเป็นผู้อนุมัติ',
      actionSummary: 'เสนอเลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ เพื่อโปรดพิจารณาอนุมัติ',
      severityColor: 'emerald',
      nextSteps: ['จัดทำบันทึกข้อความตราครุฑเสนอตามสายงานบังคับบัญชา', 'ผ่านความเห็นชอบของกองคลัง/สนย.', 'เลขาธิการ กสม. ลงนามอนุมัติ']
    };
  }, [workflowState]);

  // Construct 7-column table rows
  const memoTableRows = useMemo<TransferBudgetItem[]>(() => {
    if (!sourceProject) return [];

    if (changeScope === 'intra_project') {
      const srcName = sourceActivity ? sourceActivity.name : `${sourceProject.name} (กิจกรรมเดิม)`;
      const srcBudget = srcActPlanned > 0 ? srcActPlanned : sourceAllocated;
      const srcRow: TransferBudgetItem = {
        id: `src_${Date.now()}`,
        itemType: 'source',
        programName: BUDGET_PROGRAMS[sourceProject.programCode].name,
        programCode: sourceProject.programCode,
        itemDescription: `${srcName} [โอนลด]`,
        activityCode: sourceProject.code,
        budgetOriginal: srcBudget,
        transferAmount: -Math.abs(transferAmount),
        budgetNew: Math.max(0, srcBudget - transferAmount),
        actualDisbursedAndCommitted: srcActSpent,
        remainingBalance: Math.max(0, srcActRemaining - transferAmount),
      };

      const destName = destActivityMode === 'new' 
        ? `${newActivityName} (กิจกรรมใหม่)` 
        : (destAct ? destAct.name : 'กิจกรรมปลายทาง');
      const destOrig = destActivityMode === 'new' ? 0 : destActPlanned;
      const destSpentVal = destActivityMode === 'new' ? 0 : destActSpent;
      const destRow: TransferBudgetItem = {
        id: `dest_${Date.now()}`,
        itemType: 'destination',
        programName: BUDGET_PROGRAMS[sourceProject.programCode].name,
        programCode: sourceProject.programCode,
        itemDescription: `${destName} [โอนเพิ่ม]`,
        activityCode: sourceProject.code,
        budgetOriginal: destOrig,
        transferAmount: Math.abs(transferAmount),
        budgetNew: destOrig + transferAmount,
        actualDisbursedAndCommitted: destSpentVal,
        remainingBalance: (destOrig + transferAmount) - destSpentVal,
      };

      return [srcRow, destRow];
    } else {
      // Inter-project
      const srcRow: TransferBudgetItem = {
        id: `src_${Date.now()}`,
        itemType: 'source',
        programName: BUDGET_PROGRAMS[sourceProject.programCode].name,
        programCode: sourceProject.programCode,
        itemDescription: `${sourceProject.name} [โอนออก]`,
        activityCode: sourceProject.code,
        budgetOriginal: sourceAllocated,
        transferAmount: -Math.abs(transferAmount),
        budgetNew: Math.max(0, sourceAllocated - transferAmount),
        actualDisbursedAndCommitted: sourceSpent,
        remainingBalance: Math.max(0, sourceRemaining - transferAmount),
      };

      const destProgCode = destMode === 'new' ? newProjectProgram : (destProject ? destProject.programCode : 'M_T');
      const destAlloc = destMode === 'new' ? 0 : (destProject ? destProject.budgetAllocated : 0);
      const destSp = destMode === 'new' ? 0 : (destProject ? destProject.budgetSpent : 0);
      const destName = destMode === 'new' ? `${newProjectName} (โครงการใหม่)` : (destProject ? destProject.name : 'โครงการปลายทาง');

      const destRow: TransferBudgetItem = {
        id: `dest_${Date.now()}`,
        itemType: 'destination',
        programName: BUDGET_PROGRAMS[destProgCode].name,
        programCode: destProgCode,
        itemDescription: `${destName} [รับโอน]`,
        activityCode: destMode === 'new' ? 'โครงการใหม่' : (destProject ? destProject.code : ''),
        budgetOriginal: destAlloc,
        transferAmount: Math.abs(transferAmount),
        budgetNew: destAlloc + transferAmount,
        actualDisbursedAndCommitted: destSp,
        remainingBalance: (destAlloc + transferAmount) - destSp,
      };

      return [srcRow, destRow];
    }
  }, [
    changeScope, sourceProject, sourceActivity, srcActPlanned, srcActSpent, srcActRemaining,
    sourceAllocated, sourceSpent, sourceRemaining, transferAmount,
    destActivityMode, newActivityName, destAct, destActPlanned, destActSpent,
    destMode, newProjectProgram, destProject, newProjectName
  ]);

  // Generated Official Memo Object
  const currentMemo = useMemo<OfficialMemoData>(() => {
    const isIntra = changeScope === 'intra_project';
    const sourceTitle = isIntra 
      ? (sourceActivity ? sourceActivity.name : sourceProject.name)
      : sourceProject.name;
    const destTitle = isIntra
      ? (destActivityMode === 'new' ? `[กิจกรรมใหม่] ${newActivityName}` : (destAct ? destAct.name : 'กิจกรรมปลายทาง'))
      : (destMode === 'new' ? `[โครงการใหม่] ${newProjectName}` : (destProject ? destProject.name : 'โครงการปลายทาง'));

    let factsAgency = '';
    if (isIntra) {
      if (destActivityMode === 'new') {
        factsAgency = `สำนัก/กลุ่มงาน มีความจำเป็นต้องจัดตั้งกิจกรรมใหม่ ได้แก่ "${newActivityName}" ภายใน ${sourceProject.name} โดยต้องใช้งบประมาณ ${formatCurrency(transferAmount)} บาท`;
      } else {
        factsAgency = `สำนัก/กลุ่มงาน มีความจำเป็นต้องปรับแผนการใช้จ่ายงบประมาณเพื่อสนับสนุน "${destTitle}" จำนวน ${formatCurrency(transferAmount)} บาท`;
      }
      if (workflowState.targetAdjustment.isChanged) {
        factsAgency += ` พร้อมทั้งขอปรับกลุ่มเป้าหมายจากเดิม ${workflowState.targetAdjustment.original} เป็น ${workflowState.targetAdjustment.adjusted}`;
      }
      if (workflowState.frequencyAdjustment.isChanged) {
        factsAgency += ` และปรับจำนวนครั้งที่จัดจากเดิม ${workflowState.frequencyAdjustment.original} เป็น ${workflowState.frequencyAdjustment.adjusted}`;
      }
    } else {
      factsAgency = destMode === 'new'
        ? `สำนัก/กลุ่มงาน มีความจำเป็นต้องจัดตั้งโครงการใหม่ ได้แก่ "${newProjectName}" เพื่อ${newProjectObjective} วงเงิน ${formatCurrency(transferAmount)} บาท`
        : `สำนัก/กลุ่มงาน มีความจำเป็นต้องจัดสรรงบประมาณเพิ่มให้แก่ "${destProject?.name}" จำนวน ${formatCurrency(transferAmount)} บาท`;
    }

    return {
      id: `memo_${Date.now()}`,
      bookNumber,
      memoDate,
      division: currentUser.division,
      divisionFullName: NHRC_UNITS[currentUser.division]?.fullName || currentUser.division,
      subDivisionName: currentUser.subDivision,
      telNumber: '1380',
      subject,
      toRecipient: `${diagnosis.approverTitle} ผ่านรองเลขาธิการ กสม.`,
      fiscalYear: 2569,
      section1_OriginalStory: `ตามที่สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ ได้รับจัดสรรงบประมาณรายจ่ายประจำปี เพื่อดำเนินงานตามแผนปฏิบัติการประจำปี โดยในส่วนของ "${sourceProject.name}" ได้รับจัดสรรงบประมาณจำนวน ${formatCurrency(sourceAllocated)} บาท นั้น`,
      section2_Facts: {
        agencyRequest: factsAgency,
        investigation: `สำนักนโยบายและยุทธศาสตร์ (สนย.) ได้ตรวจสอบความสอดคล้องกับแผนการปฏิบัติงานและความจำเป็นเร่งด่วนแล้ว เห็นควรสนับสนุนการดำเนินงานดังกล่าวเพื่อให้ภารกิจของสำนักงาน กสม. บรรลุผลสัมฤทธิ์อย่างมีประสิทธิภาพ`,
        savingsSource: `จากการตรวจสอบพบว่า รายการ "${sourceTitle}" มีงบประมาณเหลือจ่ายจากการดำเนินงานที่แล้วเสร็จ เป็นจำนวนเงิน ${formatCurrency(transferAmount)} บาท (${thaiBahtText(transferAmount)}) ซึ่งสามารถนำมาโอนเปลี่ยนแปลงได้`,
      },
      section3_LegalReference: `${diagnosis.ruleClause} กำหนดว่า "${diagnosis.ruleDescription}"`,
      section4_Proposal: `จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติการเปลี่ยนแปลงงบประมาณจาก "${sourceTitle}" ไปจัดสรรให้แก่ "${destTitle}" เป็นจำนวนเงิน ${formatCurrency(transferAmount)} บาท (${thaiBahtText(transferAmount)}) ตามตารางรายละเอียดแนบท้ายนี้`,
      tableRows: memoTableRows,
      asOfDateText: `ณ วันที่ ${memoDate}`,
      proposerName: currentUser.name,
      proposerPosition: currentUser.position,
      divisionHeadRemark: 'มอบ สนย. ดำเนินการตามระเบียบต่อไป',
      deputyRemark: 'เสนอเพื่อโปรดพิจารณาอนุมัติ',
      decisionOrder: 'APPROVED',
      approverTitle: diagnosis.approverTitle,
      approverName: diagnosis.approver === 'SECRETARY_GENERAL' ? 'นางสาวหรรษา หอมหวล' : 'ประธานกรรมการสิทธิมนุษยชนแห่งชาติ',
      useThaiNumerals: useThaiNumerals,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
  }, [
    bookNumber, memoDate, currentUser, subject, diagnosis, sourceProject, sourceAllocated,
    changeScope, sourceActivity, destActivityMode, newActivityName, destAct, destMode,
    newProjectName, newProjectObjective, destProject, transferAmount, workflowState,
    memoTableRows, useThaiNumerals
  ]);

  // Complete and Submit Handler
  const handleFinish = () => {
    // 1. If intra-project transfer, update project activities and targets in state
    if (changeScope === 'intra_project' && sourceProject) {
      const updatedActivities = [...(sourceProject.activities || [])];
      
      // Reduce from source activity
      const srcIdx = updatedActivities.findIndex(a => a.id === sourceActivityId);
      if (srcIdx >= 0) {
        updatedActivities[srcIdx] = {
          ...updatedActivities[srcIdx],
          plannedBudget: Math.max(0, updatedActivities[srcIdx].plannedBudget - transferAmount),
          actualResultDescription: `${updatedActivities[srcIdx].actualResultDescription || ''} (โอนออก ${transferAmount.toLocaleString()} บาท)`.trim()
        };
      }

      // Add to destination activity
      if (destActivityMode === 'existing') {
        const destIdx = updatedActivities.findIndex(a => a.id === destActivityId);
        if (destIdx >= 0) {
          updatedActivities[destIdx] = {
            ...updatedActivities[destIdx],
            plannedBudget: updatedActivities[destIdx].plannedBudget + transferAmount,
            actualResultDescription: `${updatedActivities[destIdx].actualResultDescription || ''} (รับโอน ${transferAmount.toLocaleString()} บาท)`.trim()
          };
        }
      } else if (destActivityMode === 'new') {
        const newAct: ProjectActivity = {
          id: `act_new_${Date.now()}`,
          name: newActivityName,
          timeframe: newActivityTimeframe,
          plannedBudget: transferAmount,
          actualSpent: 0,
          status: 'not_started',
          actualResultDescription: 'กิจกรรมใหม่ที่ได้รับจัดสรรจากการโอนเปลี่ยนแปลงงบประมาณภายในโครงการ'
        };
        updatedActivities.push(newAct);
      }

      // Updated Project Object
      const updatedProj: Project = {
        ...sourceProject,
        activities: updatedActivities,
        notes: `${sourceProject.notes || ''}\n[โอนเปลี่ยนแปลงงบประมาณ] บันทึกเลขที่ ${bookNumber} เมื่อ ${memoDate}`.trim(),
        updatedAt: new Date().toISOString()
      };
      updateProject(updatedProj);
    } 
    // 2. If inter-project transfer to a brand new project
    else if (changeScope === 'inter_project' && destMode === 'new') {
      const generatedNewProj: Project = {
        id: `proj_new_${Date.now()}`,
        code: `69${newProjectProgram}-NEW`,
        name: newProjectName,
        fiscalYear: 2569,
        programCode: newProjectProgram,
        isStrategic: newProjectProgram === 'M_T',
        division: newProjectDivision,
        subDivision: 'กลุ่มงานที่ได้รับมอบหมาย',
        responsiblePerson: {
          name: currentUser.name,
          position: currentUser.position,
          division: newProjectDivision,
          email: `${currentUser.username}@nhrc.or.th`,
          phone: '1380'
        },
        budgetAllocated: transferAmount,
        budgetSpent: 0,
        progressPercent: 0,
        status: 'NOT_STARTED',
        startDate: '2025-10-01',
        endDate: '2026-09-30',
        objectives: [newProjectObjective],
        expectedOutputs: ['ผลผลิตตามกิจกรรมโครงการใหม่'],
        expectedOutcomes: ['ผลลัพธ์เพื่อสนับสนุนภารกิจ กสม.'],
        indicators: [
          {
            id: `ind_${Date.now()}`,
            title: 'ความสำเร็จในการดำเนินงานตามกิจกรรมที่กำหนด',
            target: '100%',
            actual: '0%',
            status: 'on_track'
          }
        ],
        timeframeText: 'ตุลาคม 2568 ถึงกันยายน 2569',
        activities: [
          {
            id: `act_${Date.now()}`,
            name: newProjectActivityName,
            timeframe: 'ต.ค. 68 - ก.ย. 69',
            plannedBudget: transferAmount,
            actualSpent: 0,
            status: 'not_started',
            actualResultDescription: 'โครงการใหม่ที่ได้รับการจัดสรรจากการโอนเปลี่ยนแปลงงบประมาณ'
          }
        ],
        notes: `ได้รับโอนงบประมาณจาก ${sourceProject.name} จำนวน ${transferAmount.toLocaleString()} บาท`,
        updatedAt: new Date().toISOString()
      };
      addProject(generatedNewProj);
    }

    // Save official memo to context
    addOfficialMemo(currentMemo);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onSuccess(currentMemo);
  };

  const handleCopyMemo = () => {
    const text = `
บันทึกข้อความ
ส่วนราชการ: ${currentMemo.divisionFullName} ${currentMemo.subDivisionName} โทร. ${currentMemo.telNumber}
ที่: ${currentMemo.bookNumber}  วันที่: ${currentMemo.memoDate}
เรื่อง: ${currentMemo.subject}
เรียน: ${currentMemo.toRecipient}

1. เรื่องเดิม
${currentMemo.section1_OriginalStory}

2. ข้อเท็จจริง
${currentMemo.section2_Facts.agencyRequest}
${currentMemo.section2_Facts.investigation}
${currentMemo.section2_Facts.savingsSource}

3. ระเบียบที่เกี่ยวข้อง
${currentMemo.section3_LegalReference}

4. ข้อพิจารณาและข้อเสนอ
${currentMemo.section4_Proposal}

(ลงชื่อ) ${currentMemo.proposerName}
${currentMemo.proposerPosition}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6 max-w-5xl mx-auto text-xs">
      {/* Header Wizard Title */}
      <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#0a4d44] dark:text-emerald-300 flex items-center justify-center shadow-inner">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              ขออนุมัติโอนเปลี่ยนแปลงงบประมาณ
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Full Regulation Button */}
          <button
            type="button"
            onClick={() => setIsRegulationModalOpen(true)}
            className="text-xs font-semibold text-[#0a4d44] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer shadow-2xs"
            title="คลิกดูระเบียบ กสม. ว่าด้วยการงบประมาณ พ.ศ. ๒๕๖๖ ฉบับเต็ม (หมวด ๒ ข้อ ๑๒ - ๑๖)"
          >
            <span>ดูระเบียบฉบับเต็ม</span>
          </button>

          {/* View Workflow Button */}
          <button
            type="button"
            onClick={() => setIsWorkflowModalOpen(true)}
            className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shadow-2xs"
            title="คลิกดูแผนผังขั้นตอนและ Workflow การวินิจฉัยอำนาจอนุมัติ"
          >
            <span>ดู Workflow การพิจารณา</span>
          </button>

          <button
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
        </div>
      </div>

      {/* Stepper Progress Header: 4 Clean Steps */}
      <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60">
        {[
          { step: 1, title: 'เลือกโครงการและดูสถานะ', subtitle: 'ตรวจสอบสถานะปัจจุบัน' },
          { step: 2, title: 'เช็คลิสต์เงื่อนไขระเบียบ', subtitle: 'วินิจฉัยอำนาจอนุมัติ' },
          { step: 3, title: 'กรอกรายละเอียดการเปลี่ยน', subtitle: 'ระบุกิจกรรม/เป้าหมาย/เงิน' },
          { step: 4, title: 'จัดทำบันทึกข้อความตราครุฑ', subtitle: 'พิมพ์ / ดาวน์โหลด Word' },
        ].map((s) => (
          <button
            key={s.step}
            type="button"
            onClick={() => {
              // Allow navigating backward or forward only if project exists
              if (s.step < currentStep || (sourceProject && s.step <= 4)) {
                setCurrentStep(s.step);
              }
            }}
            className={`p-2 rounded-lg text-left transition-all flex items-start gap-2.5 ${
              currentStep === s.step
                ? 'bg-white dark:bg-slate-800 shadow-sm border border-emerald-500/40'
                : currentStep > s.step
                ? 'hover:bg-white/60 dark:hover:bg-slate-800/60 opacity-90'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
              currentStep === s.step
                ? 'bg-[#0a4d44] text-white shadow'
                : currentStep > s.step
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {currentStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
            </div>
            <div className="min-w-0">
              <p className={`font-bold truncate text-[11px] ${
                currentStep === s.step ? 'text-[#0a4d44] dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
              }`}>
                {s.title}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{s.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: เลือกโครงการที่จะทำการขอโอน เปลี่ยนแปลง (Read-only Overview) */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-4 pt-1">
          {/* Project Selector Box */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-xs">
                <FolderKanban className="w-4 h-4 text-[#0a4d44] dark:text-emerald-400" />
                <span>เลือกโครงการที่จะทำการขอโอน / เปลี่ยนแปลงงบประมาณ:</span>
              </label>
              <span className="text-[11px] text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                พบทั้งหมด {projects.length} โครงการ
              </span>
            </div>

            <select
              value={sourceProjectId}
              onChange={(e) => setSourceProjectId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-[#0a4d44]"
            >
              {projects.map((p) => {
                const rem = p.budgetAllocated - p.budgetSpent;
                return (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} — (คงเหลือ: {formatCurrency(rem)} บาท | {p.division})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Project Profile & Live Status Overview (Read-only, no inputs!) */}
          {sourceProject && (
            <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-xs">
              {/* Project Meta Banner */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0a4d44] text-white">
                      รหัส: {sourceProject.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {BUDGET_PROGRAMS[sourceProject.programCode]?.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950 text-[#0a4d44] dark:text-emerald-300">
                      สังกัด: {sourceProject.division} ({NHRC_UNITS[sourceProject.division]?.fullName})
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {sourceProject.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ผู้รับผิดชอบ: {sourceProject.responsiblePerson.name} ({sourceProject.responsiblePerson.position})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">สถานะการดำเนินงาน</span>
                  <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] mt-0.5 ${
                    sourceProject.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    sourceProject.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    sourceProject.status === 'DELAYED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {sourceProject.status === 'COMPLETED' ? 'แล้วเสร็จ' :
                     sourceProject.status === 'IN_PROGRESS' ? 'อยู่ระหว่างดำเนินการ' :
                     sourceProject.status === 'DELAYED' ? 'ล่าช้ากว่าแผน' : 'ยังไม่เริ่ม'}
                  </span>
                </div>
              </div>

              {/* Budget Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[11px] text-slate-500">งบประมาณที่ได้รับจัดสรร</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                    {formatCurrency(sourceAllocated)} บาท
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[11px] text-slate-500">ผลเบิกจ่ายจริง</p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {formatCurrency(sourceSpent)} บาท
                  </p>
                </div>
                <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">งบประมาณคงเหลือจริง</p>
                  <p className="text-sm font-bold text-[#0a4d44] dark:text-emerald-400 mt-1">
                    {formatCurrency(sourceRemaining)} บาท
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[11px] text-slate-500">อัตราการเบิกจ่าย</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
                    {sourceAllocated > 0 ? ((sourceSpent / sourceAllocated) * 100).toFixed(2) : '0.00'}%
                  </p>
                </div>
              </div>

              {/* Activity List in this Project */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>รายการกิจกรรมและงบประมาณภายใต้โครงการนี้ ({sourceProject.activities?.length || 0} กิจกรรม):</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    *สามารถนำไปใช้โอนเปลี่ยนแปลงระหว่างกิจกรรม หรือเพิ่มกิจกรรมใหม่ได้ในขั้นตอนที่ 3
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="py-2 px-3">ที่</th>
                        <th className="py-2 px-3">ชื่อกิจกรรม</th>
                        <th className="py-2 px-3">ระยะเวลา</th>
                        <th className="py-2 px-3 text-right">งบตามแผน (บาท)</th>
                        <th className="py-2 px-3 text-right">เบิกจ่ายแล้ว (บาท)</th>
                        <th className="py-2 px-3 text-right">งบคงเหลือ (บาท)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sourceProject.activities && sourceProject.activities.length > 0 ? (
                        sourceProject.activities.map((act, i) => {
                          const actRem = act.plannedBudget - act.actualSpent;
                          return (
                            <tr key={act.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="py-2 px-3 text-slate-500 text-center">{i + 1}</td>
                              <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                                {act.name}
                              </td>
                              <td className="py-2 px-3 text-slate-500">{act.timeframe || '-'}</td>
                              <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatCurrency(act.plannedBudget)}
                              </td>
                              <td className="py-2 px-3 text-right text-blue-600 dark:text-blue-400">
                                {formatCurrency(act.actualSpent)}
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                                {formatCurrency(actRem)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-3 text-center text-slate-500">
                            ไม่มีรายการกิจกรรมย่อย (ใช้วงเงินรวมของโครงการ)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Informative Guidance Banner */}
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl p-3 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-blue-800 dark:text-blue-300">
                  <strong className="font-bold">คำแนะนำ:</strong> ในขั้นตอนนี้เป็นการดึงข้อมูลโครงการและสถานะปัจจุบันมาเพื่อตรวจสอบความพร้อม โดยยังไม่มีการแก้ไขข้อมูลใด ๆ เมื่อตรวจสอบความถูกต้องของโครงการเรียบร้อยแล้ว ให้คลิกปุ่ม <strong>"ถัดไป: เช็คลิสต์เงื่อนไขตามระเบียบ กสม. 2566"</strong> ด้านล่าง
                </div>
              </div>
            </div>
          )}

          {/* Navigation Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={!sourceProject}
              className="flex items-center gap-2 bg-[#0a4d44] hover:bg-[#083b34] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <span>ถัดไป: เช็คลิสต์เงื่อนไขตามระเบียบ กสม. 2566</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: เช็คลิสต์เงื่อนไขตามระเบียบ กสม. 2566 (ตาม Draw.io Flow Chart) */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-4 pt-1">
          {/* Scope Selector: Intra-Project vs Inter-Project */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-[#0a4d44] text-white flex items-center justify-center text-[10px]">1</span>
              <span>ขอบเขตของการเปลี่ยนแปลงงบประมาณ (Scope of Transfer):</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
              <button
                type="button"
                onClick={() => setChangeScope('intra_project')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  changeScope === 'intra_project'
                    ? 'border-[#0a4d44] bg-emerald-50/60 dark:bg-emerald-950/40 text-[#0a4d44] dark:text-emerald-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="w-4 h-4" />
                  <p className="text-xs">เปลี่ยนแปลง "ภายในโครงการเดียวกัน"</p>
                </div>
                <span className="text-[11px] font-normal text-slate-500 block">
                  โอนระหว่างกิจกรรมเดิม / จัดตั้งกิจกรรมใหม่ในโครงการ / ปรับกลุ่มเป้าหมายหรือจำนวนครั้งที่จัด (แผนงานเดิม 100%)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setChangeScope('inter_project')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  changeScope === 'inter_project'
                    ? 'border-[#0a4d44] bg-emerald-50/60 dark:bg-emerald-950/40 text-[#0a4d44] dark:text-emerald-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ArrowRight className="w-4 h-4" />
                  <p className="text-xs">โอน "ข้ามโครงการ" หรือ "จัดตั้งโครงการใหม่"</p>
                </div>
                <span className="text-[11px] font-normal text-slate-500 block">
                  นำเงินเหลือจ่ายไปจัดสรรให้โครงการอื่น หรือขอจัดตั้งโครงการใหม่นอกแผนปฏิบัติการ
                </span>
              </button>
            </div>
          </div>

          {/* Decision 1: ข้ามแผนงานหรือไม่ (ข้อ 14) */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="font-bold text-slate-800 dark:text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0a4d44] text-white flex items-center justify-center text-[10px]">2</span>
                <span>เป็นการโอน/เปลี่ยนแปลง "ข้ามแผนงาน" หรือไม่? (ระเบียบฯ ข้อ 14)</span>
              </div>
              <span className="text-[10px] text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {changeScope === 'intra_project' ? 'ตรวจสอบอัตโนมัติ: แผนงานเดียวกัน' : 'ขึ้นอยู่กับโครงการปลายทาง'}
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3 pl-7">
              <button
                type="button"
                onClick={() => setWorkflowState(prev => ({ ...prev, isCrossProgram: false }))}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  workflowState.isCrossProgram === false
                    ? 'border-[#0a4d44] bg-emerald-50/50 dark:bg-emerald-950/40 text-[#0a4d44] dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <p>ไม่ใช่ (แผนงานเดียวกัน)</p>
                <span className="text-[10px] font-normal text-slate-500 block">
                  อยู่ภายใต้ {BUDGET_PROGRAMS[sourceProject.programCode]?.name}
                </span>
              </button>

              <button
                type="button"
                disabled={changeScope === 'intra_project'}
                onClick={() => setWorkflowState(prev => ({ ...prev, isCrossProgram: true }))}
                className={`p-3 rounded-xl border text-left transition-all ${
                  changeScope === 'intra_project'
                    ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
                    : workflowState.isCrossProgram === true
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-950/40 text-red-700 font-bold cursor-pointer'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer'
                }`}
              >
                <p>ใช่ (ข้ามแผนงาน)</p>
                <span className="text-[10px] font-normal text-slate-500 block">
                  {changeScope === 'intra_project' ? 'โครงการเดียวกันไม่สามารถข้ามแผนงานได้' : 'ต้องเสนอขออนุมัติต่อที่ประชุม กสม.'}
                </span>
              </button>
            </div>
          </div>

          {/* Decision 2: กระทบต่อแผนการปฏิบัติงานหรือไม่ (ข้อ 15 วรรคท้าย) - ตามเช็กลิสต์ 5 ข้อใน XML (n31) */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="font-bold text-slate-800 dark:text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0a4d44] text-white flex items-center justify-center text-[10px]">3</span>
                <span>การเปลี่ยนแปลงนั้น "กระทบต่อแผนการปฏิบัติงานที่คณะกรรมการให้ความเห็นชอบไว้" หรือไม่? (ข้อ 15 วรรคท้าย)</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                workflowState.impactsPlan ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {workflowState.impactsPlan ? 'มีผลกระทบต่อแผนงาน -> เสนอ กสม.' : 'ไม่กระทบต่อแผนงานหลัก'}
              </span>
            </label>

            <div className="pl-7 space-y-2">
              <p className="text-[11px] text-slate-500">
                เช็คลิสต์ตรวจสอบ (หากเข้าข่ายข้อใดข้อหนึ่งต่อไปนี้ ถือว่ากระทบต่อแผนงาน ต้องเสนอคณะกรรมการ กสม. พิจารณาอนุมัติ):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: 'activityChanged', label: 'กิจกรรม/ผลผลิต/โครงการ เปลี่ยนไปจากที่เสนอขอความเห็นชอบไว้ (รวมถึงยกเลิกกิจกรรม)' },
                  { key: 'targetsChanged', label: 'เป้าหมายเชิงปริมาณหรือคุณภาพ (ตัวชี้วัด) เปลี่ยนแปลงไป' },
                  { key: 'scopeChanged', label: 'ขอบเขตหรือกลุ่มเป้าหมายของโครงการเปลี่ยนแปลงไป' },
                  { key: 'timeframeDelayed', label: 'กำหนดเวลาดำเนินงานคลาดเคลื่อนไปจากแผนอย่างมีนัยสำคัญ' },
                  { key: 'totalBudgetIncreased', label: 'วงเงินรวมของงบประมาณรายจ่ายประจำปีเพิ่มขึ้น' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      workflowState.impactChecklist[item.key as keyof typeof workflowState.impactChecklist]
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 font-semibold text-amber-900 dark:text-amber-200'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={workflowState.impactChecklist[item.key as keyof typeof workflowState.impactChecklist]}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setWorkflowState(prev => ({
                          ...prev,
                          impactChecklist: {
                            ...prev.impactChecklist,
                            [item.key]: checked,
                          }
                        }));
                      }}
                      className="mt-0.5 rounded text-[#0a4d44] focus:ring-[#0a4d44]"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Decision 3 & 4: เป็นรายการครุภัณฑ์หรือที่ดินสิ่งก่อสร้างหรือไม่ (ข้อ 15 วรรคสอง-สาม-สี่) */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-[#0a4d44] text-white flex items-center justify-center text-[10px]">4</span>
              <span>เป็นการเปลี่ยนแปลงรายการ "ค่าครุภัณฑ์ หรือค่าที่ดินและสิ่งก่อสร้าง" หรือไม่? (ข้อ 15 วรรคสอง-สาม)</span>
            </label>

            <div className="grid grid-cols-2 gap-3 pl-7">
              <button
                type="button"
                onClick={() => setWorkflowState(prev => ({ ...prev, isAssetOrConstruction: false }))}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  workflowState.isAssetOrConstruction === false
                    ? 'border-[#0a4d44] bg-emerald-50/50 dark:bg-emerald-950/40 text-[#0a4d44] dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <p>ไม่ใช่ (เป็นงบดำเนินงาน / ค่าใช้สอย / สัมมนา / วัสดุ)</p>
                <span className="text-[10px] font-normal text-slate-500 block">
                  เข้าเกณฑ์ทั่วไป อนุมัติโดยเลขาธิการ กสม.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setWorkflowState(prev => ({ ...prev, isAssetOrConstruction: true }))}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  workflowState.isAssetOrConstruction === true
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <p>ใช่ (ครุภัณฑ์ หรือที่ดินสิ่งก่อสร้าง)</p>
                <span className="text-[10px] font-normal text-slate-500 block">
                  ต้องพิจารณาเกณฑ์วงเงินและร้อยละ 10
                </span>
              </button>
            </div>

            {/* Sub-questions for Asset/Construction */}
            {workflowState.isAssetOrConstruction && (
              <div className="pl-7 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                    เป็นการเพิ่มวงเงินรายการนั้นแต่ละหน่วย ไม่เกินร้อยละ 10 ของวงเงินเดิม ใช่หรือไม่? (ข้อ 15 วรรคสี่)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWorkflowState(prev => ({ ...prev, isIncreaseWithin10Percent: true }))}
                      className={`px-3 py-1 rounded-lg border text-xs cursor-pointer ${
                        workflowState.isIncreaseWithin10Percent === true ? 'bg-emerald-600 text-white font-bold' : 'bg-white dark:bg-slate-800'
                      }`}
                    >
                      ใช่ (ไม่เกิน 10%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkflowState(prev => ({ ...prev, isIncreaseWithin10Percent: false }))}
                      className={`px-3 py-1 rounded-lg border text-xs cursor-pointer ${
                        workflowState.isIncreaseWithin10Percent === false ? 'bg-amber-600 text-white font-bold' : 'bg-white dark:bg-slate-800'
                      }`}
                    >
                      ไม่ใช่ (เกิน 10% / รายการใหม่)
                    </button>
                  </div>
                </div>

                {!workflowState.isIncreaseWithin10Percent && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      วงเงินอยู่ในเกณฑ์ (ครุภัณฑ์ไม่เกิน 1 ล้านบาท / ที่ดินสิ่งก่อสร้างไม่เกิน 10 ล้านบาท) หรือไม่? (ข้อ 15 วรรคสอง)
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWorkflowState(prev => ({ ...prev, isWithinThreshold: true }))}
                        className={`px-3 py-1 rounded-lg border text-xs cursor-pointer ${
                          workflowState.isWithinThreshold === true ? 'bg-emerald-600 text-white font-bold' : 'bg-white dark:bg-slate-800'
                        }`}
                      >
                        อยู่ในเกณฑ์
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkflowState(prev => ({ ...prev, isWithinThreshold: false }))}
                        className={`px-3 py-1 rounded-lg border text-xs cursor-pointer ${
                          workflowState.isWithinThreshold === false ? 'bg-red-600 text-white font-bold' : 'bg-white dark:bg-slate-800'
                        }`}
                      >
                        เกินเกณฑ์ (ต้องเสนอประธาน กสม.)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Diagnosis Live Result Card */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-500/50 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>ผลการวินิจฉัยอำนาจการอนุมัติตามระเบียบ กสม. พ.ศ. 2566:</span>
              </span>
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-[#0a4d44] text-white">
                {diagnosis.ruleClause}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 space-y-1.5">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#0a4d44] dark:text-emerald-400 shrink-0" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  ผู้มีอำนาจอนุมัติ: <span className="text-[#0a4d44] dark:text-emerald-400">{diagnosis.approverTitle}</span>
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-7">
                {diagnosis.approverSubtitle}
              </p>
              <p className="text-[11px] text-slate-500 pl-7 italic">
                "{diagnosis.ruleDescription}"
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับ: ขั้นตอนที่ 1</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 bg-[#0a4d44] hover:bg-[#083b34] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>ถัดไป: ขั้นตอนที่ 3 (กรอกรายละเอียดการเปลี่ยนแปลง)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: กรอกรายละเอียดการเปลี่ยนแปลงตามเงื่อนไขที่เลือก (Dynamic Form) */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-4 pt-1">
          {/* Dynamic Banner: Intra-Project vs Inter-Project Form */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0a4d44] dark:text-emerald-400" />
                  <span>
                    {changeScope === 'intra_project' 
                      ? `แบบฟอร์มการเปลี่ยนแปลงภายในโครงการ: ${sourceProject.name}`
                      : 'แบบฟอร์มการโอนงบประมาณข้ามโครงการ / จัดตั้งโครงการใหม่'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ระบบปรับแต่งช่องกรอกข้อมูลให้สอดคล้องกับเงื่อนไขการวินิจฉัยโดยอัตโนมัติ
                </p>
              </div>

              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#0a4d44] text-white">
                ผู้อนุมัติ: {diagnosis.approverTitle}
              </span>
            </div>

            {/* SCENARIO A: Intra-Project Details */}
            {changeScope === 'intra_project' ? (
              <div className="space-y-4">
                {/* 1. Intra Change Nature Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                    1. ลักษณะการเปลี่ยนแปลงภายในโครงการ:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'between_activities', label: 'โอนระหว่างกิจกรรมเดิม', desc: 'ตัดงบจากกิจกรรมหนึ่งไปเพิ่มอีกกิจกรรมหนึ่ง' },
                      { id: 'new_activity', label: 'จัดตั้งกิจกรรมใหม่ในโครงการ', desc: 'นำเงินเหลือจ่ายไปดำเนินกิจกรรมใหม่' },
                      { id: 'target_change', label: 'ปรับกลุ่มเป้าหมาย / จำนวนครั้ง', desc: 'ปรับเปลี่ยนปริมาณหรือความถี่ในการจัด' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setIntraChangeType(item.id as IntraChangeType);
                          if (item.id === 'new_activity') setDestActivityMode('new');
                          if (item.id === 'between_activities') setDestActivityMode('existing');
                        }}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          intraChangeType === item.id
                            ? 'border-[#0a4d44] bg-emerald-50 dark:bg-emerald-950/40 text-[#0a4d44] dark:text-emerald-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <p className="text-xs">{item.label}</p>
                        <span className="text-[10px] text-slate-500 block font-normal">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Source Activity (โอนลด) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between">
                      <span>2. กิจกรรมต้นทาง (โอนลด / มีงบเหลือจ่าย):</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        คงเหลือ: {formatCurrency(srcActRemaining)} บาท
                      </span>
                    </label>
                    <select
                      value={sourceActivityId}
                      onChange={(e) => setSourceActivityId(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-medium"
                    >
                      {sourceProject.activities?.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (งบตามแผน: {formatCurrency(a.plannedBudget)} | คงเหลือ: {formatCurrency(a.plannedBudget - a.actualSpent)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Destination Activity (โอนเพิ่ม) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        3. กิจกรรมปลายทาง (รับโอนงบประมาณ):
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDestActivityMode('existing')}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                            destActivityMode === 'existing' ? 'bg-[#0a4d44] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                          }`}
                        >
                          กิจกรรมเดิม
                        </button>
                        <button
                          type="button"
                          onClick={() => setDestActivityMode('new')}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                            destActivityMode === 'new' ? 'bg-[#0a4d44] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                          }`}
                        >
                          + กิจกรรมใหม่
                        </button>
                      </div>
                    </div>

                    {destActivityMode === 'existing' ? (
                      <select
                        value={destActivityId}
                        onChange={(e) => setDestActivityId(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-medium"
                      >
                        {sourceProject.activities
                          ?.filter((a) => a.id !== sourceActivityId)
                          .map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name} (งบปัจจุบัน: {formatCurrency(a.plannedBudget)})
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newActivityName}
                          onChange={(e) => setNewActivityName(e.target.value)}
                          placeholder="ชื่อกิจกรรมใหม่ในโครงการ..."
                          className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs"
                        />
                        <input
                          type="text"
                          value={newActivityTimeframe}
                          onChange={(e) => setNewActivityTimeframe(e.target.value)}
                          placeholder="ระยะเวลาดำเนินการ เช่น ก.ค. - ก.ย. 69"
                          className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Target & Frequency Adjustments */}
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0a4d44]" />
                    <span>การปรับปรุงกลุ่มเป้าหมายหรือจำนวนครั้งที่จัดกิจกรรม (ถ้ามี):</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Target Adjustment */}
                    <div className="space-y-1.5 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={workflowState.targetAdjustment.isChanged}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setWorkflowState(prev => ({
                              ...prev,
                              targetAdjustment: { ...prev.targetAdjustment, isChanged: val },
                              impactChecklist: { ...prev.impactChecklist, targetsChanged: val }
                            }));
                          }}
                          className="rounded text-[#0a4d44] focus:ring-[#0a4d44]"
                        />
                        <span>ปรับจำนวนกลุ่มเป้าหมายผู้เข้าร่วม</span>
                      </label>
                      {workflowState.targetAdjustment.isChanged && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-[10px] text-slate-500">เป้าหมายเดิม</span>
                            <input
                              type="text"
                              value={workflowState.targetAdjustment.original}
                              onChange={(e) => setWorkflowState(prev => ({
                                ...prev,
                                targetAdjustment: { ...prev.targetAdjustment, original: e.target.value }
                              }))}
                              className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500">เป้าหมายใหม่</span>
                            <input
                              type="text"
                              value={workflowState.targetAdjustment.adjusted}
                              onChange={(e) => setWorkflowState(prev => ({
                                ...prev,
                                targetAdjustment: { ...prev.targetAdjustment, adjusted: e.target.value }
                              }))}
                              className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 font-bold text-[#0a4d44]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Frequency Adjustment */}
                    <div className="space-y-1.5 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={workflowState.frequencyAdjustment.isChanged}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setWorkflowState(prev => ({
                              ...prev,
                              frequencyAdjustment: { ...prev.frequencyAdjustment, isChanged: val },
                              impactChecklist: { ...prev.impactChecklist, scopeChanged: val }
                            }));
                          }}
                          className="rounded text-[#0a4d44] focus:ring-[#0a4d44]"
                        />
                        <span>ปรับจำนวนครั้ง / ความถี่ในการจัดกิจกรรม</span>
                      </label>
                      {workflowState.frequencyAdjustment.isChanged && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-[10px] text-slate-500">จำนวนครั้งเดิม</span>
                            <input
                              type="text"
                              value={workflowState.frequencyAdjustment.original}
                              onChange={(e) => setWorkflowState(prev => ({
                                ...prev,
                                frequencyAdjustment: { ...prev.frequencyAdjustment, original: e.target.value }
                              }))}
                              className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500">จำนวนครั้งใหม่</span>
                            <input
                              type="text"
                              value={workflowState.frequencyAdjustment.adjusted}
                              onChange={(e) => setWorkflowState(prev => ({
                                ...prev,
                                frequencyAdjustment: { ...prev.frequencyAdjustment, adjusted: e.target.value }
                              }))}
                              className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 font-bold text-[#0a4d44]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SCENARIO B: Inter-Project Details */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                      1. รูปแบบโครงการปลายทางที่ขอรับโอน:
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDestMode('existing')}
                        className={`flex-1 p-2 rounded-lg border text-xs font-bold cursor-pointer ${
                          destMode === 'existing'
                            ? 'bg-[#0a4d44] text-white border-[#0a4d44]'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        โครงการเดิมที่มีอยู่
                      </button>
                      <button
                        type="button"
                        onClick={() => setDestMode('new')}
                        className={`flex-1 p-2 rounded-lg border text-xs font-bold cursor-pointer ${
                          destMode === 'new'
                            ? 'bg-[#0a4d44] text-white border-[#0a4d44]'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        + ขอจัดตั้งโครงการใหม่
                      </button>
                    </div>
                  </div>

                  {destMode === 'existing' ? (
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        2. เลือกโครงการที่จะรับโอนงบประมาณ:
                      </label>
                      <select
                        value={destProjectId}
                        onChange={(e) => setDestProjectId(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-medium"
                      >
                        {projects
                          .filter((p) => p.id !== sourceProjectId)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              [{p.code}] {p.name} ({p.division})
                            </option>
                          ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        2. แผนงานของโครงการใหม่:
                      </label>
                      <select
                        value={newProjectProgram}
                        onChange={(e) => setNewProjectProgram(e.target.value as ProgramCode)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-medium"
                      >
                        <option value="M_T">แผนงานยุทธศาสตร์ (M_T)</option>
                        <option value="O_F">แผนงานพื้นฐาน (O_F)</option>
                        <option value="P_S">แผนงานบุคลากรภาครัฐ (P_S)</option>
                      </select>
                    </div>
                  )}
                </div>

                {destMode === 'new' && (
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="ชื่อโครงการใหม่..."
                      className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
                    />
                    <textarea
                      rows={2}
                      value={newProjectObjective}
                      onChange={(e) => setNewProjectObjective(e.target.value)}
                      placeholder="วัตถุประสงค์และความจำเป็นเร่งด่วนของโครงการใหม่..."
                      className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 5. Transfer Amount & Financial Preview */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-white text-xs flex items-center justify-between">
                    <span>จำนวนเงินที่ขอโอนเปลี่ยนแปลง (บาท):</span>
                    <span className="text-[10px] text-slate-500">
                      วงเงินไม่เกิน: {formatCurrency(changeScope === 'intra_project' ? srcActRemaining : sourceRemaining)} บาท
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={changeScope === 'intra_project' ? srcActRemaining : sourceRemaining}
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(Number(e.target.value))}
                      className="w-full p-2.5 pl-3 pr-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-bold text-[#0a4d44] dark:text-emerald-400"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">บาท</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    ({thaiBahtText(transferAmount)})
                  </p>
                </div>

                {/* Reason */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-white text-xs">
                    เหตุผลความจำเป็นในการขอโอนเปลี่ยนแปลง:
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับ: ขั้นตอนที่ 2</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 bg-[#0a4d44] hover:bg-[#083b34] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>ถัดไป: ขั้นตอนที่ 4 (จัดทำบันทึกข้อความตราครุฑ)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: จัดทำบันทึกข้อความตราครุฑ พิมพ์ และดาวน์โหลด Word (.doc) */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-4 pt-1">
          {/* Action Toolbar */}
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUseThaiNumerals(!useThaiNumerals)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  useThaiNumerals
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-[#0a4d44] dark:text-emerald-300 border-emerald-300'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{useThaiNumerals ? 'กำลังใช้เลขไทย (1 2 3)' : 'กำลังใช้เลขอาระบิก (1 2 3)'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Copy Memo */}
              <button
                type="button"
                onClick={handleCopyMemo}
                className="flex items-center gap-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copySuccess ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความ'}</span>
              </button>

              {/* Download Word Document */}
              <button
                type="button"
                onClick={() => generateWordDocument(currentMemo)}
                className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-1.5 rounded-lg font-bold shadow-xs cursor-pointer"
                title="ดาวน์โหลดเป็นไฟล์ Microsoft Word (.doc) เพื่อนำไปแก้ไขต่อ"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลดเป็น Word (.doc)</span>
              </button>

              {/* Print */}
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-black text-white px-3.5 py-1.5 rounded-lg font-bold shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์เอกสารตราครุฑ</span>
              </button>
            </div>
          </div>

          {/* Official Memo Preview (Standard Thai Government Paper) */}
          <div 
            className="bg-white text-black p-8 sm:p-12 rounded-xl shadow-md border border-slate-300 mx-auto print-container space-y-4"
            style={{
              fontFamily: "'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', sans-serif",
              maxWidth: '850px'
            }}
          >
            {/* Header with Authentic Garuda Emblem */}
            <div className="relative mb-3 flex items-end">
              <div className="w-24 shrink-0">
                <GarudaEmblem size={65} />
              </div>
              <div className="flex-1 text-center pr-24">
                <h1 className="text-[26pt] font-bold text-black tracking-tight leading-none">
                  บันทึกข้อความ
                </h1>
              </div>
            </div>

            {/* Government Memo Metadata */}
            <div className="space-y-1 text-[15pt] border-b border-black pb-2 mb-3 leading-snug">
              <p>
                <strong className="font-bold">ส่วนราชการ</strong> {currentMemo.divisionFullName} {currentMemo.subDivisionName} โทร. {currentMemo.telNumber}
              </p>
              <div className="flex justify-between">
                <p>
                  <strong className="font-bold">ที่</strong> {formatMemoBookNumber(currentMemo.bookNumber)}
                </p>
                <p>
                  <strong className="font-bold">วันที่</strong> {currentMemo.memoDate}
                </p>
              </div>
              <p>
                <strong className="font-bold">เรื่อง</strong> {currentMemo.subject}
              </p>
            </div>

            {/* Recipient */}
            <div className="text-[15pt] mb-2">
              <p>
                <strong className="font-bold">เรียน</strong> {currentMemo.toRecipient}
              </p>
            </div>

            {/* 4 Official Sections */}
            <div className="space-y-3 text-[15pt] leading-relaxed text-justify">
              <p className="indent-10">
                <strong className="font-bold">1. เรื่องเดิม</strong> {currentMemo.section1_OriginalStory}
              </p>

              <div className="indent-10">
                <strong className="font-bold">2. ข้อเท็จจริง</strong>
                <p className="mt-1">
                  2.1 {currentMemo.section2_Facts.agencyRequest}
                </p>
                <p className="mt-1">
                  2.2 {currentMemo.section2_Facts.savingsSource}
                </p>
                <p className="mt-1">
                  2.3 {currentMemo.section2_Facts.investigation}
                </p>
              </div>

              <p className="indent-10">
                <strong className="font-bold">3. ระเบียบที่เกี่ยวข้อง</strong> {currentMemo.section3_LegalReference}
              </p>

              <p className="indent-10">
                <strong className="font-bold">4. ข้อพิจารณาและข้อเสนอ</strong> {currentMemo.section4_Proposal}
              </p>
            </div>

            {/* 7-Column Table */}
            <div className="pt-2">
              <p className="text-[13pt] font-bold mb-1">
                รายละเอียดการโอนเปลี่ยนแปลงงบประมาณรายจ่ายประจำปี {currentMemo.asOfDateText}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-black border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-black p-1.5 w-8">ที่</th>
                      <th className="border border-black p-1.5">แผนงาน / โครงการ / กิจกรรม</th>
                      <th className="border border-black p-1.5 text-right w-24">งบเดิม (บาท)</th>
                      <th className="border border-black p-1.5 text-right w-20 text-red-700">โอนลด (-)</th>
                      <th className="border border-black p-1.5 text-right w-20 text-emerald-700">โอนเพิ่ม (+)</th>
                      <th className="border border-black p-1.5 text-right w-24">งบใหม่ (บาท)</th>
                      <th className="border border-black p-1.5 text-right w-24">คงเหลือจริง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memoTableRows.map((row, idx) => (
                      <tr key={row.id}>
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5">
                          <span className="font-bold">{row.itemDescription}</span>
                          <span className="block text-[10px] text-slate-600">{row.programName} ({row.activityCode})</span>
                        </td>
                        <td className="border border-black p-1.5 text-right">{formatCurrency(row.budgetOriginal)}</td>
                        <td className="border border-black p-1.5 text-right text-red-700 font-semibold">
                          {row.itemType === 'source' ? formatCurrency(Math.abs(row.transferAmount)) : '-'}
                        </td>
                        <td className="border border-black p-1.5 text-right text-emerald-700 font-semibold">
                          {row.itemType === 'destination' ? formatCurrency(Math.abs(row.transferAmount)) : '-'}
                        </td>
                        <td className="border border-black p-1.5 text-right font-bold">{formatCurrency(row.budgetNew)}</td>
                        <td className="border border-black p-1.5 text-right">{formatCurrency(row.remainingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-6 flex justify-end text-center text-[14pt]">
              <div className="w-64 space-y-1">
                <p>(ลงชื่อ)........................................................</p>
                <p>({currentMemo.proposerName})</p>
                <p className="text-slate-600 text-xs">{currentMemo.proposerPosition}</p>
              </div>
            </div>
          </div>

          {/* Submission & Confirmation Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับ: ขั้นตอนที่ 3</span>
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 bg-[#0a4d44] hover:bg-[#083b34] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>ยืนยันและส่งบันทึกขออนุมัติเข้าสู่ระบบ</span>
            </button>
          </div>
        </div>
      )}

      {/* Full Regulation Modal */}
      <FullRegulationModal
        isOpen={isRegulationModalOpen}
        onClose={() => setIsRegulationModalOpen(false)}
      />

      {/* Transfer Workflow Modal */}
      <TransferWorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
      />
    </div>
  );
};
