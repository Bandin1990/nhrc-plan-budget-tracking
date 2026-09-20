import React, { useState, useMemo } from 'react';
import { 
  FileUp, CheckCircle2, AlertCircle, FileText, 
  Loader2, Sparkles, Key, ShieldAlert, Edit3, Check, RefreshCw, Lock,
  ArrowLeft, Upload, CheckCircle, Database, CheckSquare, Square, Layers, Eye, X, ListOrdered
} from 'lucide-react';
import { parseProjectWordFile, ParsedProjectResult } from '../../services/wordParser';
import { 
  extractProjectWithGemini, 
  extractProjectFromPdfWithGemini, 
  getStoredGeminiApiKey, 
  setStoredGeminiApiKey 
} from '../../services/aiWordExtractor';
import { parsePdfOperationalPlan, STRATEGIC_PILLARS } from '../../services/pdfPlanExtractor';
import { Project, NHRC_UNITS, NHRCUnit, BUDGET_PROGRAMS, ProgramCode } from '../../types/project';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, fromThaiNumerals } from '../../utils/thaiNumber';
import confetti from 'canvas-confetti';

interface WordImportViewProps {
  onBack?: () => void;
  onSuccess?: (project: Project) => void;
}

export const WordImportView: React.FC<WordImportViewProps> = ({
  onBack,
  onSuccess,
}) => {
  const { addProject, addProjects, updateProject, projects, fiscalYear: activeFiscalYear } = useProjects();
  const { currentUser } = useAuth();

  // Target Fiscal Year (e.g. 2570 for upcoming plan, 2569, 2571)
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(activeFiscalYear || 2570);
  const [isBaselineLocked, setIsBaselineLocked] = useState<boolean>(true);

  // Parsing State
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStepText, setParsingStepText] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedProjectResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiSuccessBadge, setAiSuccessBadge] = useState<boolean>(false);
  const [successSavedProject, setSuccessSavedProject] = useState<Project | null>(null);

  // Multi-Project Batch State
  const [multiProjects, setMultiProjects] = useState<Partial<Project>[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [batchSuccessCount, setBatchSuccessCount] = useState<number | null>(null);
  const [subActivitiesModalProject, setSubActivitiesModalProject] = useState<Partial<Project> | null>(null);

  // AI Configuration State
  const [apiKey, setApiKey] = useState<string>(getStoredGeminiApiKey());
  const [isAiEnabled, setIsAiEnabled] = useState<boolean>(() => Boolean(getStoredGeminiApiKey()));
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);

  // Editable Preview State (for single project)
  const [isEditingPreview, setIsEditingPreview] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editDivision, setEditDivision] = useState<NHRCUnit>('สนย.');
  const [editSubDivision, setEditSubDivision] = useState<string>('');
  const [editBudget, setEditBudget] = useState<number>(0);
  const [editRespName, setEditRespName] = useState<string>('');
  const [editRespPhone, setEditRespPhone] = useState<string>('');
  const [editRespEmail, setEditRespEmail] = useState<string>('');

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    setStoredGeminiApiKey(key);
    if (key.trim()) {
      setIsAiEnabled(true);
      setShowApiKeyInput(false);
    }
  };

  // Duplicate Check against existing projects in selected fiscal year (for single project)
  const duplicateProject = useMemo(() => {
    if (!parsedData?.project?.name) return null;
    const cleanName = parsedData.project.name.trim().toLowerCase();
    const cleanCode = parsedData.project.code?.trim().toLowerCase();

    return projects.find(p => {
      const matchYear = (p.fiscalYear || 2569) === selectedFiscalYear;
      if (!matchYear) return false;

      const sameName = p.name.trim().toLowerCase() === cleanName;
      const sameCode = cleanCode && p.code.trim().toLowerCase() === cleanCode;
      return sameName || sameCode;
    });
  }, [parsedData, projects, selectedFiscalYear]);

  // Duplicate helper for multi-projects
  const getProjectDuplicate = (proj: Partial<Project>) => {
    const cleanName = (proj.name || '').trim().toLowerCase();
    const cleanCode = (proj.code || '').trim().toLowerCase();
    return projects.find(p => {
      const matchYear = (p.fiscalYear || 2569) === selectedFiscalYear;
      if (!matchYear) return false;
      const sameName = p.name.trim().toLowerCase() === cleanName;
      const sameCode = cleanCode && p.code.trim().toLowerCase() === cleanCode;
      return sameName || sameCode;
    });
  };

  const multiProjectsWithDup = useMemo(() => {
    return multiProjects.map(p => ({
      ...p,
      existingProject: getProjectDuplicate(p)
    }));
  }, [multiProjects, projects, selectedFiscalYear]);

  const newCount = useMemo(() => {
    return multiProjectsWithDup.filter(p => !p.existingProject).length;
  }, [multiProjectsWithDup]);

  const existingCount = useMemo(() => {
    return multiProjectsWithDup.filter(p => !!p.existingProject).length;
  }, [multiProjectsWithDup]);

  const totalMultiBudget = useMemo(() => {
    return multiProjects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0);
  }, [multiProjects]);

  const selectedBudget = useMemo(() => {
    return multiProjects
      .filter(p => selectedProjectIds.has(p.id || p.code || ''))
      .reduce((sum, p) => sum + (p.budgetAllocated || 0), 0);
  }, [multiProjects, selectedProjectIds]);

  const initEditFields = (proj: Partial<Project>) => {
    setEditName(proj.name || '');
    setEditDivision((proj.division as NHRCUnit) || 'สนย.');
    setEditSubDivision(proj.subDivision || '');
    setEditBudget(proj.budgetAllocated || 0);
    setEditRespName(proj.responsiblePerson?.name || '');
    setEditRespPhone(fromThaiNumerals(proj.responsiblePerson?.phone || ''));
    setEditRespEmail(proj.responsiblePerson?.email || '');
  };

  const handleFile = async (file: File) => {
    setIsParsing(true);
    setErrorMsg(null);
    setAiSuccessBadge(false);
    setSuccessSavedProject(null);
    setBatchSuccessCount(null);
    setMultiProjects([]);
    setSelectedProjectIds(new Set());

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      setParsingStepText('กำลังสแกนโครงสร้างเอกสาร PDF (ค้นหาตารางแผนปฏิบัติการและบัญชีโครงการ)...');

      // Step 1: Run Local High-Speed PDF Plan Parser (handles Table 6 / Chapter 3 master plan offline instantly)
      try {
        const planRes = await parsePdfOperationalPlan(file, selectedFiscalYear);
        if (planRes.isMultiProject && planRes.projects.length > 0) {
          setMultiProjects(planRes.projects);
          setSelectedProjectIds(new Set(planRes.projects.map(p => p.id || p.code || '')));
          setSelectedFiscalYear(planRes.fiscalYear);
          setParsedData({
            isMultiProject: true,
            planTitle: planRes.planTitle,
            totalBudget: planRes.totalBudget,
            projects: planRes.projects,
            extractedActivities: [],
            rawText: '',
            sourceType: 'pdf_plan'
          });
          setAiSuccessBadge(true);
          setIsParsing(false);
          setParsingStepText('');
          return;
        }
      } catch (localErr) {
        console.warn('Local PDF plan parser skipped or error:', localErr);
      }

      // Step 2: If not detected by local parser, try Gemini AI
      if (!apiKey.trim()) {
        setShowApiKeyInput(true);
        setErrorMsg('ไม่พบตารางแผนปฏิบัติการอัตโนมัติในเอกสาร หากต้องการให้ AI สกัดข้อมูล กรุณาระบุ Google Gemini API Key ด้านล่าง');
        setIsParsing(false);
        setParsingStepText('');
        return;
      }

      setParsingStepText('กำลังส่งไฟล์ PDF ให้ AI (Google Gemini) วิเคราะห์โครงสร้างโครงการทั้งหมด...');
      try {
        const aiRes = await extractProjectFromPdfWithGemini(file, selectedFiscalYear, apiKey);
        if (aiRes.success) {
          if (aiRes.isMultiProject && aiRes.projects && aiRes.projects.length > 0) {
            setMultiProjects(aiRes.projects);
            setSelectedProjectIds(new Set(aiRes.projects.map(p => p.id || p.code || '')));
            setParsedData({
              isMultiProject: true,
              planTitle: aiRes.planTitle || 'แผนปฏิบัติการประจำปี',
              totalBudget: aiRes.totalBudget || 0,
              projects: aiRes.projects,
              extractedActivities: [],
              rawText: '',
              sourceType: 'pdf_ai'
            });
            setAiSuccessBadge(true);
          } else if (aiRes.project) {
            setParsedData({
              project: {
                ...aiRes.project,
                fiscalYear: selectedFiscalYear,
                isBaselineLocked: isBaselineLocked
              },
              extractedActivities: aiRes.extractedActivities || [],
              rawText: '',
              sourceType: 'pdf_ai'
            });
            setAiSuccessBadge(true);
            initEditFields(aiRes.project);
          }
        } else {
          const err = aiRes.error || 'ไม่สามารถสกัดข้อมูลจากไฟล์ PDF ได้ กรุณาตรวจสอบความถูกต้องของเอกสาร';
          setErrorMsg(err);
          if (err.includes('API Key') || err.includes('denied') || err.includes('ระงับ') || err.includes('สิทธิ์')) {
            setShowApiKeyInput(true);
          }
        }
      } catch (err: any) {
        const msg = `เกิดข้อผิดพลาดในการอ่านไฟล์ PDF: ${err.message || 'ไม่ทราบสาเหตุ'}`;
        setErrorMsg(msg);
        if (msg.includes('API Key') || msg.includes('denied') || msg.includes('ระงับ') || msg.includes('สิทธิ์')) {
          setShowApiKeyInput(true);
        }
      } finally {
        setIsParsing(false);
        setParsingStepText('');
      }
      return;
    }

    setParsingStepText('กำลังอ่านไฟล์เอกสาร Word (.docx/.doc)...');

    try {
      // Step 1: Client-side docx parsing via mammoth
      const offlineResult = await parseProjectWordFile(file, selectedFiscalYear);
      
      // Step 2: If AI is enabled and API Key is set, try Gemini Smart Extraction
      if (isAiEnabled && apiKey.trim() && offlineResult.rawText && offlineResult.rawText.length > 50) {
        setParsingStepText('กำลังใช้ AI (Google Gemini) วิเคราะห์โครงสร้างโครงการและตารางกิจกรรม...');
        const aiRes = await extractProjectWithGemini(offlineResult.rawText, selectedFiscalYear, apiKey);
        
        if (aiRes.success && aiRes.project) {
          setParsedData({
            project: {
              ...aiRes.project,
              fiscalYear: selectedFiscalYear,
              isBaselineLocked: isBaselineLocked
            },
            extractedActivities: aiRes.extractedActivities || [],
            rawText: offlineResult.rawText,
            sourceType: 'xml_docx'
          });
          setAiSuccessBadge(true);
          initEditFields(aiRes.project);
          setIsParsing(false);
          return;
        } else {
          console.warn('AI Extraction error, fallback to offline parser:', aiRes.error);
        }
      }

      // Step 3: Offline Mammoth / Rule-based Fallback
      setParsedData({
        ...offlineResult,
        project: {
          ...offlineResult.project,
          fiscalYear: selectedFiscalYear,
          isBaselineLocked: isBaselineLocked
        }
      });
      initEditFields(offlineResult.project);
    } catch (err: any) {
      setErrorMsg(`ไม่สามารถอ่านไฟล์ได้: ${err.message || 'รูปแบบไฟล์ไม่ถูกต้อง'}`);
    } finally {
      setIsParsing(false);
      setParsingStepText('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const applyEditsToProject = (): Project => {
    if (!parsedData?.project) throw new Error('No parsed project');
    const base = parsedData.project;
    return {
      ...base,
      name: editName.trim() || base.name || 'โครงการนำเข้า',
      fiscalYear: selectedFiscalYear,
      division: editDivision,
      subDivision: editSubDivision.trim(),
      budgetAllocated: editBudget,
      isBaselineLocked: isBaselineLocked,
      unlockedForEdit: false,
      responsiblePerson: {
        ...base.responsiblePerson,
        name: editRespName.trim() || 'ผู้รับผิดชอบโครงการ',
        position: base.responsiblePerson?.position || 'นักวิชาการสิทธิมนุษยชน',
        division: editDivision,
        subDivision: editSubDivision.trim(),
        phone: fromThaiNumerals(editRespPhone.trim() || '02 141 3800'),
        email: editRespEmail.trim() || 'contact@nhrc.or.th',
      }
    } as Project;
  };

  // Confirm Import as New Project
  const handleConfirmImport = () => {
    if (!parsedData?.project) return;
    if (duplicateProject) {
      alert('ไม่สามารถนำเข้าเป็นโครงการใหม่ได้ เนื่องจากตรวจพบโครงการซ้ำในระบบ กรุณาใช้ตัวเลือก "อัปเดตข้อมูลโครงการเดิม" แทน');
      return;
    }

    const finalProject = applyEditsToProject();
    addProject(finalProject);
    setSuccessSavedProject(finalProject);

    // Confetti effect
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    if (onSuccess) {
      onSuccess(finalProject);
    }
  };

  // Update existing project with imported data
  const handleUpdateExisting = () => {
    if (!duplicateProject || !parsedData?.project) return;
    
    if (confirm(`คุณต้องการอัปเดตข้อมูลโครงการเดิม "${duplicateProject.name}" (รหัส: ${duplicateProject.code}) ด้วยข้อมูลจากเอกสารนี้ใช่หรือไม่?`)) {
      const finalProject = applyEditsToProject();
      const updated: Project = {
        ...duplicateProject,
        ...finalProject,
        id: duplicateProject.id,
        code: duplicateProject.code,
        fiscalYear: duplicateProject.fiscalYear,
        updatedAt: new Date().toISOString()
      };
      
      updateProject(updated);
      setSuccessSavedProject(updated);
      alert(`อัปเดตข้อมูลโครงการ "${duplicateProject.name}" เรียบร้อยแล้ว`);
      if (onSuccess) {
        onSuccess(updated);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedProjectIds.size === multiProjects.length) {
      setSelectedProjectIds(new Set());
    } else {
      setSelectedProjectIds(new Set(multiProjects.map(p => p.id || p.code || '')));
    }
  };

  const handleToggleProject = (idOrCode: string) => {
    setSelectedProjectIds(prev => {
      const next = new Set(prev);
      if (next.has(idOrCode)) {
        next.delete(idOrCode);
      } else {
        next.add(idOrCode);
      }
      return next;
    });
  };

  const handleBatchImport = () => {
    if (!multiProjects || multiProjects.length === 0) return;
    const selectedList = multiProjects.filter(p => selectedProjectIds.has(p.id || p.code || ''));
    if (selectedList.length === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 โครงการเพื่อนำเข้า');
      return;
    }

    let addedCount = 0;
    let updatedCount = 0;
    const toAdd: Project[] = [];

    for (const proj of selectedList) {
      const existing = projects.find(p => 
        (p.fiscalYear || 2569) === selectedFiscalYear &&
        (p.name.trim().toLowerCase() === (proj.name || '').trim().toLowerCase() ||
         (proj.code && p.code.trim().toLowerCase() === proj.code.trim().toLowerCase()))
      );

      const finalProj: Project = {
        id: existing ? existing.id : (proj.id || `proj_batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
        code: existing ? existing.code : (proj.code || `${String(selectedFiscalYear).slice(-2)}O1-00001`),
        name: proj.name || 'โครงการนำเข้า',
        fiscalYear: selectedFiscalYear,
        division: (proj.division as NHRCUnit) || 'สนย.',
        subDivision: proj.subDivision || 'กลุ่มงานที่ได้รับมอบหมาย',
        budgetAllocated: proj.budgetAllocated || 0,
        budgetSpent: existing ? existing.budgetSpent : 0,
        progressPercent: existing ? existing.progressPercent : 0,
        status: existing ? existing.status : 'NOT_STARTED',
        startDate: existing ? existing.startDate : `${selectedFiscalYear - 543 - 1}-10-01`,
        endDate: existing ? existing.endDate : `${selectedFiscalYear - 543}-09-30`,
        programCode: proj.programCode || 'O',
        isStrategic: proj.isStrategic ?? true,
        strategicPillar: proj.strategicPillar || 1,
        isBaselineLocked: isBaselineLocked,
        unlockedForEdit: false,
        timeframeText: proj.timeframeText || `ตุลาคม ${selectedFiscalYear - 1} ถึงกันยายน ${selectedFiscalYear}`,
        responsiblePerson: proj.responsiblePerson || {
          name: `ผู้รับผิดชอบงานยุทธศาสตร์ (${proj.division || 'สนย.'})`,
          position: 'นักวิชาการสิทธิมนุษยชนชำนาญการพิเศษ',
          division: (proj.division as NHRCUnit) || 'สนย.',
          subDivision: 'กลุ่มงานที่ได้รับมอบหมาย',
          phone: '02 141 3800',
          email: 'contact@nhrc.or.th'
        },
        objectives: proj.objectives || [`เพื่อขับเคลื่อนยุทธศาสตร์ตามแผนปฏิบัติการ`],
        expectedOutputs: proj.expectedOutputs || [`ผลผลิตตามแผนของ ${proj.name}`],
        expectedOutcomes: proj.expectedOutcomes || ['ส่งเสริมและคุ้มครองสิทธิมนุษยชน'],
        indicators: proj.indicators || [
          {
            id: `ind_${Date.now()}_1`,
            title: 'ร้อยละความสำเร็จตามแผนปฏิบัติการ',
            target: '100%',
            actual: '0%',
            status: 'on_track'
          }
        ],
        activities: proj.activities && proj.activities.length > 0 ? proj.activities : [
          {
            id: `act_${Date.now()}_1`,
            code: '1',
            name: `ดำเนินงานตาม ${proj.name}`,
            plannedBudget: proj.budgetAllocated || 0,
            timeframe: `ต.ค. ${selectedFiscalYear - 1} - ก.ย. ${selectedFiscalYear}`,
            plannedPercent: 100,
            actualSpent: 0,
            status: 'not_started'
          }
        ],
        updatedAt: new Date().toISOString()
      };

      if (existing) {
        updateProject(finalProj);
        updatedCount++;
      } else {
        toAdd.push(finalProj);
        addedCount++;
      }
    }

    if (toAdd.length > 0) {
      addProjects(toAdd);
    }

    setBatchSuccessCount(selectedList.length);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleLoadSample = () => {
    const sampleProj: Partial<Project> = {
      id: `proj_sample_${Date.now()}`,
      code: `${String(selectedFiscalYear).substring(2)}D2-23402`,
      name: 'โครงการพัฒนาคุณภาพระบบงานของสำนักงาน กสม. สู่ความเป็นเลิศ (TQA)',
      fiscalYear: selectedFiscalYear,
      programCode: 'D2',
      division: 'สนย.',
      subDivision: 'กลุ่มงานพัฒนาระบบบริหารและติดตามประเมินผล',
      responsiblePerson: {
        name: 'นางสาวจารุวรรณ ประเมินผล',
        position: 'นักวิเคราะห์นโยบายและแผนชำนาญการ',
        division: 'สนย.',
        subDivision: 'กลุ่มงานพัฒนาระบบบริหารและติดตามประเมินผล',
        phone: '02 141 3755',
        email: 'jaruwan.tqa@nhrc.or.th'
      },
      isStrategic: true,
      budgetAllocated: 200000,
      budgetSpent: 0,
      progressPercent: 0,
      status: 'NOT_STARTED',
      startDate: `${selectedFiscalYear - 543 - 1}-10-01`,
      endDate: `${selectedFiscalYear - 543}-09-30`,
      timeframeText: `ตุลาคม ${selectedFiscalYear - 1} ถึงกันยายน ${selectedFiscalYear}`,
      objectives: [
        'สมัครเข้ารับการตรวจประเมินคุณภาพการบริหารจัดการองค์กร ตามเกณฑ์ TQA',
        'จัดประชุมเชิงปฏิบัติการเพื่อรวบรวมข้อมูลสำหรับการตรวจประเมินองค์กร',
        'จัดประชุมเพื่อถ่ายทอดผลการประเมินองค์กรตามเกณฑ์ TQA และแนวทางการพัฒนาองค์กร'
      ],
      expectedOutputs: ['รายงานผลการตรวจประเมินองค์กรตามเกณฑ์ TQA 1 ฉบับ'],
      expectedOutcomes: ['องค์กรได้รับการรับรองคุณภาพตามเกณฑ์ TQA'],
      indicators: [
        { id: 'ind_1', title: 'ร้อยละความสำเร็จตามแผนปฏิบัติการ', target: '100%', actual: '0%', status: 'on_track' }
      ],
      activities: [
        {
          id: 'act_1',
          code: '1',
          name: 'กิจกรรมที่ 1 สมัครเข้ารับการตรวจประเมินองค์กร TQA smart – EX',
          plannedPercent: 40,
          timeframe: `ต.ค. ${selectedFiscalYear - 1} - ธ.ค. ${selectedFiscalYear - 1}`,
          plannedBudget: 120000,
          actualSpent: 0,
          status: 'not_started'
        },
        {
          id: 'act_2',
          code: '2',
          name: 'กิจกรรมที่ 2 จัดประชุมเชิงปฏิบัติการเพื่อรวบรวมข้อมูลสำหรับการตรวจประเมินองค์กร',
          plannedPercent: 60,
          timeframe: `ม.ค. ${selectedFiscalYear} - ส.ค. ${selectedFiscalYear}`,
          plannedBudget: 80000,
          actualSpent: 0,
          status: 'not_started'
        }
      ],
      isBaselineLocked: isBaselineLocked
    };

    setParsedData({
      project: sampleProj,
      extractedActivities: sampleProj.activities || [],
      rawText: '',
      sourceType: 'html_doc'
    });
    initEditFields(sampleProj);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              title="ย้อนกลับ"
              className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-[#0a4d44]/10 dark:bg-emerald-950/60 text-[#0a4d44] dark:text-emerald-300 flex items-center justify-center shadow-xs shrink-0">
            <FileUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                นำเข้าแผนปฏิบัติการประจำปี (Word / PDF / AI)
              </h2>
              {aiSuccessBadge && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Extracted
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <label className="font-bold text-slate-600 dark:text-slate-300">
              ปีงบประมาณเป้าหมาย:
            </label>
            <select
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-1 font-bold text-[#0a4d44] dark:text-emerald-400 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value={2570}>ปีงบประมาณ 2570 (แผนใหม่)</option>
              <option value={2569}>ปีงบประมาณ 2569 (ปัจจุบัน)</option>
              <option value={2568}>ปีงบประมาณ 2568</option>
              <option value={2571}>ปีงบประมาณ 2571</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <input
              type="checkbox"
              checked={isBaselineLocked}
              onChange={(e) => setIsBaselineLocked(e.target.checked)}
              className="w-4 h-4 rounded text-[#0a4d44] focus:ring-emerald-500 cursor-pointer"
            />
            <span className="flex items-center gap-1 font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>ล็อกแผนตั้งต้น</span>
            </span>
          </label>
        </div>
      </div>

      {/* Success Notification if imported */}
      {successSavedProject && (
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                นำเข้าและบันทึกโครงการ "{successSavedProject.name}" สำเร็จแล้ว!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                รหัสโครงการ: <code className="font-mono font-bold bg-emerald-100 dark:bg-emerald-900 px-1 rounded">{successSavedProject.code}</code> • สังกัด: {successSavedProject.division} • งบประมาณ: {formatCurrency(successSavedProject.budgetAllocated)} บาท
              </p>
            </div>
          </div>
          {onSuccess && (
            <button
              onClick={() => onSuccess(successSavedProject)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer shrink-0"
            >
              ไปที่ทะเบียนโครงการ &rarr;
            </button>
          )}
        </div>
      )}

      {/* AI Smart Extraction Bar */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20 border border-purple-200/70 dark:border-purple-800/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-purple-950 dark:text-purple-200">
              ระบบสกัดข้อมูลอัจฉริยะด้วย AI (Google Gemini)
            </p>
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80 mt-0.5">
              {apiKey.trim() 
                ? 'เชื่อมต่อ Gemini API เรียบร้อยแล้ว (สกัดตารางกิจกรรม, งบประมาณแต่ละขั้น, วัตถุประสงค์ และผู้รับผิดชอบอัตโนมัติ)'
                : 'ระบุ Gemini API Key เพื่อให้ AI อ่านตารางกิจกรรมและฟิลด์ทั้งหมดได้อย่างแม่นยำ 100%'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 shadow-xs hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{apiKey.trim() ? 'เปลี่ยน API Key' : 'ตั้งค่า API Key'}</span>
          </button>

          <label className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-200 cursor-pointer bg-white/60 dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700">
            <input
              type="checkbox"
              checked={isAiEnabled}
              onChange={(e) => {
                if (e.target.checked && !apiKey.trim()) {
                  setShowApiKeyInput(true);
                }
                setIsAiEnabled(e.target.checked);
              }}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <span>เปิดใช้ AI</span>
          </label>
        </div>
      </div>

      {/* Gemini API Key Configuration Box */}
      {showApiKeyInput && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 space-y-3 animate-in fade-in shadow-sm">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs">
              <Key className="w-4 h-4 text-purple-600" />
              <span>Google Gemini API Key:</span>
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-purple-600 hover:underline font-bold"
            >
              รับ API Key ฟรี &rarr;
            </a>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="วางคีย์ AIzaSy..."
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono outline-hidden focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => handleSaveApiKey(apiKey)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              บันทึกคีย์
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-3xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 border border-rose-200 flex flex-col gap-2.5 text-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>

          {(errorMsg.includes('denied access') || errorMsg.includes('ระงับ') || errorMsg.includes('API Key') || errorMsg.includes('สิทธิ์')) && (
            <div className="mt-1 p-3.5 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-rose-200 dark:border-rose-800 text-slate-700 dark:text-slate-300 space-y-2 shadow-xs">
              <p className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-purple-600" />
                <span>คำแนะนำการแก้ไขปัญหา API Key:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                <li>
                  เปิดไปที่หน้า{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 dark:text-purple-400 underline font-bold"
                  >
                    Google AI Studio (aistudio.google.com) &rarr;
                  </a>
                </li>
                <li>
                  กดปุ่ม <strong>"Create API key"</strong> และเลือก <strong>"Create API key in new project"</strong> (สร้างในโปรเจกต์ใหม่ เพื่อหลีกเลี่ยงโปรเจกต์เดิมที่ถูกระงับสิทธิ์)
                </li>
                <li>
                  คัดลอกรหัสคีย์ที่ขึ้นต้นด้วย <code>AIzaSy...</code> นำมาวางในกล่อง <strong>"Google Gemini API Key"</strong> ด้านบน แล้วกด <strong>"บันทึกคีย์"</strong>
                </li>
                <li className="text-slate-500 dark:text-slate-400 italic">
                  <strong>ทางเลือกสำรอง:</strong> หากมีไฟล์ต้นฉบับเป็น Word (.docx) หรือแปลง PDF เป็น Word ท่านสามารถอัปโหลดไฟล์ Word ได้ทันที โดยระบบมีตัวอ่านเอกสารแบบออฟไลน์โดยไม่ต้องใช้ API Key ครับ
                </li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Main Upload Dropzone */}
      {!parsedData && (
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-3 border-dashed rounded-3xl p-12 text-center transition-all bg-white dark:bg-slate-900 shadow-sm ${
            dragActive
              ? 'border-[#0a4d44] bg-emerald-50 dark:bg-emerald-950/30 ring-4 ring-emerald-100'
              : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500'
          }`}
        >
          {isParsing ? (
            <div className="space-y-4 py-8">
              <Loader2 className="w-12 h-12 text-[#0a4d44] dark:text-emerald-400 animate-spin mx-auto" />
              <p className="font-bold text-slate-800 dark:text-slate-200 text-base">
                {parsingStepText || 'กำลังประมวลผลเอกสาร...'}
              </p>
              <p className="text-slate-400 text-xs">
                ระบบกำลังอ่านตารางกิจกรรม งบประมาณ และวัตถุประสงค์จากเอกสารข้อเสนอโครงการ
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0a4d44] dark:text-emerald-300 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900 shadow-inner">
                <FileText className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                  ลากและวางไฟล์ Word (.docx / .doc) หรือ PDF (.pdf) คำของบประมาณที่นี่
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs max-w-md mx-auto">
                  รองรับทั้งไฟล์ Word คำของบประมาณ และไฟล์ PDF เล่มแผนปฏิบัติการ / ข้อเสนอโครงการของสำนักงาน กสม.
                </p>
              </div>

              <div className="pt-2">
                <input
                  type="file"
                  accept=".docx,.doc,.pdf,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                  id="word-upload-input-view"
                />
                <label
                  htmlFor="word-upload-input-view"
                  className="inline-flex items-center gap-2 bg-[#0a4d44] hover:bg-[#073b34] text-white px-6 py-3 rounded-2xl font-bold shadow-md cursor-pointer transition-all hover:scale-105 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>เลือกไฟล์เอกสารโครงการ (.docx / .pdf)</span>
                </label>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-slate-500 hover:text-[#0a4d44] dark:hover:text-emerald-400 text-xs font-semibold underline cursor-pointer"
                >
                  หรือทดลองโหลดตัวอย่างเอกสารโครงการ (TQA กสม. ปี {selectedFiscalYear})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Parsed Result & Duplicate Warning Box */}
      {parsedData && (
        parsedData.isMultiProject && multiProjects.length > 0 ? (
          /* BATCH MULTI-PROJECT VIEW */
          <div className="space-y-6 animate-in fade-in">
            {/* Batch Success Banner */}
            {batchSuccessCount !== null && (
              <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-base text-emerald-950 dark:text-emerald-100">
                      นำเข้าและบันทึกโครงการสำเร็จ {batchSuccessCount} โครงการ เรียบร้อยแล้ว!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                      ระบบได้บันทึกโครงการทั้งหมดเข้าสู่แผนปฏิบัติการประจำปีงบประมาณ {selectedFiscalYear} พร้อมบันทึกกิจกรรมย่อยและล็อกแผนตั้งต้น (Baseline Locked)
                    </p>
                  </div>
                </div>
                {onSuccess && (
                  <button
                    onClick={() => onSuccess(projects[0] as Project)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer shrink-0"
                  >
                    ไปที่ทะเบียนโครงการ &rarr;
                  </button>
                )}
              </div>
            )}

            {/* Plan Overview Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">โครงการในเล่มแผน</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-2">
                  {multiProjects.length} <span className="text-xs font-normal text-slate-500">โครงการ</span>
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">งบประมาณรวมทั้งสิ้น</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-800 dark:text-emerald-400 mt-2">
                  {formatCurrency(totalMultiBudget)} <span className="text-xs font-normal text-slate-500">บาท</span>
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">โครงการใหม่ / ซ้ำ</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                    ใหม่ {newCount}
                  </span>
                  {existingCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
                      ซ้ำ {existingCount}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">เลือกที่จะนำเข้า</span>
                  <div className="w-8 h-8 rounded-xl bg-[#0a4d44]/10 dark:bg-emerald-950/60 text-[#0a4d44] dark:text-emerald-300 flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#0a4d44] dark:text-emerald-400 mt-2">
                  {selectedProjectIds.size} <span className="text-xs font-normal text-slate-500">/ {multiProjects.length}</span>
                </p>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  {selectedProjectIds.size === multiProjects.length ? (
                    <>
                      <Square className="w-4 h-4" />
                      <span>ยกเลิกการเลือกทั้งหมด</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4 text-[#0a4d44] dark:text-emerald-400" />
                      <span>เลือกทั้งหมด ({multiProjects.length} โครงการ)</span>
                    </>
                  )}
                </button>
                <span className="text-xs text-slate-400">
                  ยอดงบที่เลือก: <strong>{formatCurrency(selectedBudget)}</strong> บาท
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setParsedData(null);
                    setMultiProjects([]);
                    setSelectedProjectIds(new Set());
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  เลือกไฟล์ใหม่
                </button>

                <button
                  type="button"
                  onClick={handleBatchImport}
                  disabled={selectedProjectIds.size === 0}
                  className="inline-flex items-center gap-2 bg-[#0a4d44] hover:bg-[#073b34] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold shadow-md cursor-pointer transition-all hover:scale-102 text-xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>นำเข้าโครงการที่เลือกทั้งหมด ({selectedProjectIds.size} โครงการ)</span>
                </button>
              </div>
            </div>

            {/* Multi-Project Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-xs">
                  <ListOrdered className="w-4 h-4 text-[#0a4d44] dark:text-emerald-400" />
                  <span>บัญชีโครงการเชิงยุทธศาสตร์ตามแผนปฏิบัติการ ({parsedData.planTitle || 'ตารางที่ 6'})</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ปีงบประมาณเป้าหมาย: พ.ศ. {selectedFiscalYear}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-xs">
                  <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3.5 w-12 text-center whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProjectIds.size === multiProjects.length && multiProjects.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded text-[#0a4d44] focus:ring-emerald-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-3.5 w-44 whitespace-nowrap">ยุทธศาสตร์ กสม.</th>
                      <th className="p-3.5 w-36 whitespace-nowrap">แผนงานงบประมาณ</th>
                      <th className="p-3.5 w-28 whitespace-nowrap">รหัสโครงการ</th>
                      <th className="p-3.5 min-w-[280px]">ชื่อโครงการ</th>
                      <th className="p-3.5 w-24 text-center whitespace-nowrap">สำนัก</th>
                      <th className="p-3.5 w-32 text-right whitespace-nowrap">วงเงินงบประมาณ</th>
                      <th className="p-3.5 w-28 text-center whitespace-nowrap">กิจกรรมย่อย</th>
                      <th className="p-3.5 w-28 text-center whitespace-nowrap">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {multiProjectsWithDup.map((proj, idx) => {
                      const isSelected = selectedProjectIds.has(proj.id || proj.code || '');
                      const isExisting = Boolean(proj.existingProject);
                      const pillarNum = proj.strategicPillar || 1;
                      const pillarName = STRATEGIC_PILLARS[pillarNum] || `ยุทธศาสตร์ที่ ${pillarNum}`;
                      const progCode = (proj.programCode || 'O') as ProgramCode;
                      const progInfo = BUDGET_PROGRAMS[progCode];

                      return (
                        <tr
                          key={proj.id || proj.code || idx}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                            isSelected ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                          }`}
                        >
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleProject(proj.id || proj.code || '')}
                              className="w-4 h-4 rounded text-[#0a4d44] focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5">
                            <div>
                              <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold text-[11px]">
                                ยุทธศาสตร์ที่ {pillarNum}
                              </span>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-tight" title={pillarName}>
                                {pillarName}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="inline-block px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold text-[10px]" title={progInfo?.name || progCode}>
                              {progInfo?.shortName || progCode} ({progCode})
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-[#0a4d44] dark:text-emerald-400">
                            {proj.code}
                          </td>
                          <td className="p-3.5 font-bold text-[15px] text-slate-900 dark:text-white leading-snug">
                            {proj.name}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                              {proj.division || 'สนย.'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(proj.budgetAllocated || 0)} <span className="text-[10px] font-normal text-slate-400">บ.</span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => setSubActivitiesModalProject(proj)}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{proj.activities?.length || 1} กิจกรรม</span>
                            </button>
                          </td>
                          <td className="p-3.5 text-center whitespace-nowrap">
                            {isExisting ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] whitespace-nowrap border border-amber-200 dark:border-amber-800">
                                มีในระบบแล้ว
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] whitespace-nowrap border border-emerald-200 dark:border-emerald-800">
                                โครงการใหม่
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : parsedData.project ? (
          /* SINGLE PROJECT VIEW */
          <div className="space-y-6 animate-in fade-in">
            {/* Duplicate Alert Banner */}
            {duplicateProject ? (
              <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 space-y-3">
                <div className="flex items-center gap-3 text-amber-900 dark:text-amber-200 font-bold">
                  <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
                  <span className="text-base">ตรวจพบโครงการนี้มีอยู่ในระบบแล้ว (ปีงบประมาณ {selectedFiscalYear})</span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 pl-9 leading-relaxed">
                  ระบบพบโครงการ <strong>"{duplicateProject.name}"</strong> (รหัส: <code className="font-mono bg-amber-200/60 dark:bg-amber-900 px-1 py-0.5 rounded">{duplicateProject.code}</code>) 
                  สังกัดสำนัก <strong>{duplicateProject.division}</strong> มีอยู่ในฐานข้อมูลแล้ว
                  <br />
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    * เพื่อป้องกันข้อมูลซ้ำซ้อน ระบบไม่อนุญาตให้นำเข้าเป็นโครงการใหม่ซ้ำซ้อน
                  </span>
                </p>
                <div className="pl-9 pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleUpdateExisting}
                    className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>อัปเดตข้อมูลทับโครงการเดิม ({duplicateProject.code})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setParsedData(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                  >
                    เลือกไฟล์อื่น
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>ไม่พบโครงการซ้ำ — สามารถนำเข้าเป็นโครงการแผนตั้งต้นใหม่ได้ทันที</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingPreview(!isEditingPreview)}
                  className="text-xs font-bold text-[#0a4d44] dark:text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingPreview ? 'ปิดโหมดแก้ไข' : 'แก้ไขข้อมูลก่อนบันทึก'}</span>
                </button>
              </div>
            )}

            {/* Project Details Box (Editable or Read-only) */}
            {isEditingPreview ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
                  <Edit3 className="w-4 h-4 text-[#0a4d44]" />
                  <span>แก้ไขรายละเอียดโครงการก่อนบันทึก</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300">ชื่อโครงการ:</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">สำนักเจ้าของโครงการ:</label>
                    <select
                      value={editDivision}
                      onChange={(e) => setEditDivision(e.target.value as NHRCUnit)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                    >
                      {Object.keys(NHRC_UNITS).map((u) => (
                        <option key={u} value={u}>{u} - {NHRC_UNITS[u as NHRCUnit].fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">กลุ่มงานย่อย:</label>
                    <input
                      type="text"
                      value={editSubDivision}
                      onChange={(e) => setEditSubDivision(e.target.value)}
                      placeholder="เช่น กลุ่มงานนโยบายและยุทธศาสตร์"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">งบประมาณที่ขอรับจัดสรร (บาท):</label>
                    <input
                      type="number"
                      value={editBudget}
                      onChange={(e) => setEditBudget(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold font-mono text-emerald-700 dark:text-emerald-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">ชื่อผู้รับผิดชอบ:</label>
                    <input
                      type="text"
                      value={editRespName}
                      onChange={(e) => setEditRespName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">เบอร์โทรศัพท์ติดต่อ:</label>
                    <input
                      type="text"
                      value={editRespPhone}
                      onChange={(e) => setEditRespPhone(fromThaiNumerals(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">อีเมลติดต่อ:</label>
                    <input
                      type="email"
                      value={editRespEmail}
                      onChange={(e) => setEditRespEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      รหัสโครงการ: {parsedData.project.code || `${String(selectedFiscalYear).slice(-2)}O1-XXXXX`}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                      {parsedData.project.name || 'ไม่มีชื่อโครงการ'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                      {parsedData.project.division || 'สนย.'}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono">
                      {formatCurrency(parsedData.project.budgetAllocated || 0)} บาท
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">ปีงบประมาณ:</span>
                    <p className="font-bold text-slate-700 dark:text-slate-200">พ.ศ. {selectedFiscalYear}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">กลุ่มงาน:</span>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{parsedData.project.subDivision || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">ผู้รับผิดชอบ:</span>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{parsedData.project.responsiblePerson?.name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">เบอร์โทร:</span>
                    <p className="font-bold text-slate-700 dark:text-slate-200 font-mono">{fromThaiNumerals(parsedData.project.responsiblePerson?.phone || '-')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Activities List */}
            {parsedData.extractedActivities && parsedData.extractedActivities.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
                    <Database className="w-4 h-4 text-[#0a4d44]" />
                    <span>ตารางกิจกรรมย่อยและแผนการใช้จ่ายงบประมาณ ({parsedData.extractedActivities.length} กิจกรรม)</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    รวม {formatCurrency(parsedData.extractedActivities.reduce((s, a) => s + a.plannedBudget, 0))} บาท
                  </span>
                </div>

                <div className="space-y-2">
                  {parsedData.extractedActivities.map((act, idx) => (
                    <div
                      key={act.id || idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#0a4d44] dark:text-emerald-400">
                            {act.code || idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {act.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          ช่วงเวลา: {act.timeframe} • สัดส่วนน้ำหนัก: {act.plannedPercent}%
                        </p>
                      </div>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 shrink-0">
                        {formatCurrency(act.plannedBudget)} บาท
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Objectives & Indicators */}
            {parsedData.project.objectives && parsedData.project.objectives.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm text-xs">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  วัตถุประสงค์โครงการที่สกัดได้:
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  {parsedData.project.objectives.map((obj, idx) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Confirmation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => { setParsedData(null); setIsEditingPreview(false); }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer font-bold flex items-center gap-1.5"
              >
                &larr; ยกเลิกและเลือกไฟล์ใหม่
              </button>

              <div className="flex items-center gap-3">
                {duplicateProject ? (
                  <button
                    type="button"
                    onClick={handleUpdateExisting}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>อัปเดตทับโครงการเดิม ({duplicateProject.code})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    className="bg-[#0a4d44] hover:bg-[#073b34] text-white px-7 py-3 rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>ยืนยันนำเข้าเป็นแผนตั้งต้นประจำปี {selectedFiscalYear}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null
      )}

      {/* Sub-activities Preview Modal */}
      {subActivitiesModalProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                  {subActivitiesModalProject.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  รหัส: {subActivitiesModalProject.code} • สำนัก: {subActivitiesModalProject.division} • งบประมาณรวม: {formatCurrency(subActivitiesModalProject.budgetAllocated || 0)} บาท
                </p>
              </div>
              <button
                onClick={() => setSubActivitiesModalProject(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              <h5 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>รายการกิจกรรมย่อยและแผนการใช้จ่ายงบประมาณ:</span>
              </h5>
              {subActivitiesModalProject.activities && subActivitiesModalProject.activities.length > 0 ? (
                <div className="space-y-2">
                  {subActivitiesModalProject.activities.map((act, i) => (
                    <div
                      key={act.id || i}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                            {act.code}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {act.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          ช่วงเวลา: {act.timeframe} • น้ำหนักงาน: {act.plannedPercent}%
                        </p>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                        {formatCurrency(act.plannedBudget)} บาท
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">ไม่มีกิจกรรมย่อยแยกต่างหาก (ดำเนินงานตามโครงการเต็มจำนวน)</p>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
              <button
                onClick={() => setSubActivitiesModalProject(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
