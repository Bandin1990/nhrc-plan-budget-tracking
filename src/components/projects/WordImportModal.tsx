import React, { useState, useMemo } from 'react';
import { 
  FileUp, X, CheckCircle2, AlertCircle, FileText, ArrowRight, 
  Loader2, Sparkles, Key, ShieldAlert, Edit3, Check, RefreshCw, Lock
} from 'lucide-react';
import { parseProjectWordFile, ParsedProjectResult } from '../../services/wordParser';
import { extractProjectWithGemini, extractProjectFromPdfWithGemini, getStoredGeminiApiKey, setStoredGeminiApiKey } from '../../services/aiWordExtractor';
import { parsePdfOperationalPlan } from '../../services/pdfPlanExtractor';
import { Project, NHRC_UNITS, NHRCUnit } from '../../types/project';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, fromThaiNumerals } from '../../utils/thaiNumber';
import confetti from 'canvas-confetti';

interface WordImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export const WordImportModal: React.FC<WordImportModalProps> = ({
  isOpen,
  onClose,
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

  // AI Configuration State
  const [apiKey, setApiKey] = useState<string>(getStoredGeminiApiKey());
  const [isAiEnabled, setIsAiEnabled] = useState<boolean>(() => Boolean(getStoredGeminiApiKey()));
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);

  // Editable Preview State
  const [isEditingPreview, setIsEditingPreview] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editDivision, setEditDivision] = useState<NHRCUnit>('สนย.');
  const [editSubDivision, setEditSubDivision] = useState<string>('');
  const [editBudget, setEditBudget] = useState<number>(0);
  const [editRespName, setEditRespName] = useState<string>('');
  const [editRespPhone, setEditRespPhone] = useState<string>('');
  const [editRespEmail, setEditRespEmail] = useState<string>('');

  if (!isOpen) return null;

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    setStoredGeminiApiKey(key);
    if (key.trim()) {
      setIsAiEnabled(true);
      setShowApiKeyInput(false);
    }
  };

  // Duplicate Check against existing projects in selected fiscal year
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
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      setParsingStepText('กำลังสแกนโครงสร้างเอกสาร PDF (ค้นหาตารางแผนปฏิบัติการ)...');

      // Try local plan parser first
      try {
        const planRes = await parsePdfOperationalPlan(file, selectedFiscalYear);
        if (planRes.projects && planRes.projects.length > 0) {
          const firstProj = planRes.projects[0];
          setParsedData({
            project: {
              ...firstProj,
              fiscalYear: planRes.fiscalYear,
              isBaselineLocked: isBaselineLocked
            },
            projects: planRes.projects,
            isMultiProject: planRes.isMultiProject,
            planTitle: planRes.planTitle,
            extractedActivities: firstProj.activities || [],
            rawText: '',
            sourceType: 'pdf_plan'
          });
          setAiSuccessBadge(true);
          initEditFields(firstProj);
          setIsParsing(false);
          setParsingStepText('');
          return;
        }
      } catch (localErr) {
        console.warn('Local plan parser error in modal:', localErr);
      }

      if (!apiKey.trim()) {
        setShowApiKeyInput(true);
        setErrorMsg('การนำเข้าข้อมูลจากไฟล์ PDF จำเป็นต้องใช้ Google Gemini API Key กรุณาระบุ API Key ด้านล่างเพื่อให้ระบบสกัดข้อมูลโครงการให้ท่าน');
        setIsParsing(false);
        setParsingStepText('');
        return;
      }

      setParsingStepText('กำลังส่งไฟล์ PDF ให้ AI (Google Gemini) วิเคราะห์โครงสร้างและสกัดตารางกิจกรรม...');
      try {
        const aiRes = await extractProjectFromPdfWithGemini(file, selectedFiscalYear, apiKey);
        if (aiRes.success && (aiRes.project || (aiRes.projects && aiRes.projects.length > 0))) {
          const proj = aiRes.project || aiRes.projects![0];
          setParsedData({
            project: {
              ...proj,
              fiscalYear: selectedFiscalYear,
              isBaselineLocked: isBaselineLocked
            },
            projects: aiRes.projects,
            isMultiProject: aiRes.isMultiProject,
            extractedActivities: aiRes.extractedActivities || proj.activities || [],
            rawText: '',
            sourceType: 'pdf_ai'
          });
          setAiSuccessBadge(true);
          initEditFields(proj);
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

    // Confetti effect
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    onSuccess(finalProject);
    onClose();
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
      alert(`อัปเดตข้อมูลโครงการ "${duplicateProject.name}" เรียบร้อยแล้ว`);
      onSuccess(updated);
      onClose();
    }
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#0a4d44] dark:text-emerald-300 flex items-center justify-center shadow-xs">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>นำเข้าแผนปฏิบัติการจากไฟล์ Word / PDF</span>
                {aiSuccessBadge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    AI Extracted
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                รองรับไฟล์ข้อเสนอโครงการ (.docx / .doc) และไฟล์เล่มแผน (.pdf) ด้วย AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Target Fiscal Year & Baseline Setup */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700 dark:text-slate-200">
                ปีงบประมาณเป้าหมาย:
              </label>
              <select
                value={selectedFiscalYear}
                onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5 font-bold text-[#0a4d44] dark:text-emerald-400 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value={2570}>ปีงบประมาณ 2570 (แผนใหม่)</option>
                <option value={2569}>ปีงบประมาณ 2569 (ปัจจุบัน)</option>
                <option value={2568}>ปีงบประมาณ 2568</option>
                <option value={2571}>ปีงบประมาณ 2571</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isBaselineLocked}
                onChange={(e) => setIsBaselineLocked(e.target.checked)}
                className="w-4 h-4 rounded text-[#0a4d44] focus:ring-emerald-500 cursor-pointer"
              />
              <span className="flex items-center gap-1 font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>ล็อกเป็นแผนตั้งต้น (Baseline Locked)</span>
              </span>
            </label>
          </div>

          {/* AI Smart Extraction Bar */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20 border border-purple-200/70 dark:border-purple-800/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-purple-950 dark:text-purple-200">
                  สกัดข้อมูลอัจฉริยะด้วย AI (Google Gemini)
                </p>
                <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80">
                  {apiKey.trim() 
                    ? 'เชื่อมต่อ Gemini API เรียบร้อยแล้ว (สกัดตารางกิจกรรมและข้อมูลอัตโนมัติ)'
                    : 'แนะนำ: ระบุ API Key เพื่อให้ AI ช่วยสกัดตารางกิจกรรมและฟิลด์ทั้งหมดได้ครบถ้วน 100%'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 shadow-xs hover:bg-purple-50 transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{apiKey.trim() ? 'เปลี่ยน API Key' : 'ตั้งค่า API Key'}</span>
              </button>

              <label className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-200 cursor-pointer">
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

          {/* Gemini API Key Configuration Input */}
          {showApiKeyInput && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 space-y-2 animate-fadeIn shadow-sm">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>Google Gemini API Key:</span>
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-purple-600 hover:underline"
                >
                  รับ API Key ฟรี &rarr;
                </a>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="วางคีย์ AIzaSy..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => handleSaveApiKey(apiKey)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-xs"
                >
                  บันทึกคีย์
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 border border-rose-200 flex flex-col gap-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMsg}</span>
              </div>

              {(errorMsg.includes('denied access') || errorMsg.includes('ระงับ') || errorMsg.includes('API Key') || errorMsg.includes('สิทธิ์')) && (
                <div className="mt-1 p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-rose-200 dark:border-rose-800 text-slate-700 dark:text-slate-300 space-y-1.5 shadow-xs">
                  <p className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-600" />
                    <span>คำแนะนำการแก้ไขปัญหา API Key:</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-xs">
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
                      กดปุ่ม <strong>"Create API key"</strong> และเลือก <strong>"Create API key in new project"</strong> (สร้างในโปรเจกต์ใหม่)
                    </li>
                    <li>
                      นำคีย์ใหม่มาวางในกล่องด้านบน แล้วกด <strong>"บันทึกคีย์"</strong>
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Upload Dropzone */}
          {!parsedData && (
            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-[#0a4d44] bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-slate-50/40 dark:bg-slate-800/20'
              }`}
            >
              {isParsing ? (
                <div className="space-y-3 py-6">
                  <Loader2 className="w-10 h-10 text-[#0a4d44] dark:text-emerald-400 animate-spin mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-200">
                    {parsingStepText || 'กำลังประมวลผลเอกสาร...'}
                  </p>
                  <p className="text-slate-400 text-xs">ระบบกำลังสกัดข้อความ วัตถุประสงค์ และตารางกิจกรรม</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-[#0a4d44] dark:text-emerald-300 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                      ลากไฟล์ Word (.docx / .doc) หรือ PDF (.pdf) มาวางที่นี่
                    </h4>
                    <p className="text-slate-400 mt-1 text-xs">
                      รองรับไฟล์โครงการ .docx, .doc และไฟล์ PDF เล่มแผนปฏิบัติการ กสม.
                    </p>
                  </div>

                  <input
                    type="file"
                    accept=".docx,.doc,.pdf,application/pdf"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                    id="word-upload-input"
                  />
                  <label
                    htmlFor="word-upload-input"
                    className="inline-block bg-[#0a4d44] hover:bg-[#073b34] text-white px-5 py-2.5 rounded-xl font-bold shadow-md cursor-pointer transition-all"
                  >
                    เลือกไฟล์เอกสารโครงการ (.docx / .pdf)
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Parsed Result & Duplicate Warning Box */}
          {parsedData && (
            <div className="space-y-4 animate-fadeIn">
              {/* Duplicate Alert Banner */}
              {duplicateProject ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>ตรวจพบโครงการนี้มีอยู่ในระบบแล้ว (ปีงบประมาณ {selectedFiscalYear})</span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 pl-7 leading-relaxed">
                    ระบบพบโครงการ <strong>"{duplicateProject.name}"</strong> (รหัส: <code className="font-mono bg-amber-200/60 dark:bg-amber-900 px-1 py-0.5 rounded">{duplicateProject.code}</code>) 
                    สังกัดสำนัก <strong>{duplicateProject.division}</strong> มีอยู่ในฐานข้อมูลแล้ว 
                    <br />
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      * เพื่อป้องกันข้อมูลซ้ำซ้อน ระบบไม่อนุญาตให้นำเข้าเป็นโครงการใหม่
                    </span>
                  </p>
                  <div className="pl-7 pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUpdateExisting}
                      className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>อัปเดตข้อมูลทับโครงการเดิม ({duplicateProject.code})</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ไม่พบโครงการซ้ำ — สามารถนำเข้าเป็นโครงการใหม่ได้</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingPreview(!isEditingPreview)}
                    className="text-xs font-bold text-[#0a4d44] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingPreview ? 'ปิดโหมดแก้ไข' : 'แก้ไขข้อมูลก่อนบันทึก'}</span>
                  </button>
                </div>
              )}

              {/* Editable Fields or Read-only Card */}
              {isEditingPreview ? (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-[#0a4d44]" />
                    <span>แก้ไขข้อมูลก่อนบันทึก</span>
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-slate-500 font-bold block mb-1">ชื่อโครงการ:</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-500 font-bold block mb-1">สำนัก/หน่วยงาน:</label>
                        <select
                          value={editDivision}
                          onChange={(e) => setEditDivision(e.target.value as NHRCUnit)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold"
                        >
                          {Object.keys(NHRC_UNITS).map((uKey) => (
                            <option key={uKey} value={uKey}>{uKey} - {NHRC_UNITS[uKey as NHRCUnit].fullName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-500 font-bold block mb-1">งบประมาณ (บาท):</label>
                        <input
                          type="number"
                          value={editBudget}
                          onChange={(e) => setEditBudget(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-500 font-bold block mb-1">ผู้รับผิดชอบ:</label>
                        <input
                          type="text"
                          value={editRespName}
                          onChange={(e) => setEditRespName(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-bold block mb-1">เบอร์โทรศัพท์ (เลขอารบิก):</label>
                        <input
                          type="text"
                          value={editRespPhone}
                          onChange={(e) => setEditRespPhone(fromThaiNumerals(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Read-only Extracted Summary */
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#0a4d44] text-white">
                      {parsedData.project.code || `${String(selectedFiscalYear).substring(2)}O1-NEW`}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      ปีงบประมาณ {selectedFiscalYear} ({isBaselineLocked ? 'แผนตั้งต้น' : 'แผนปรับปรุง'})
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-snug">
                    {editName || parsedData.project.name}
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400 block">สำนัก/หน่วยงาน:</span>
                      <strong>{editDivision || parsedData.project.division} ({editSubDivision || parsedData.project.subDivision || '-'})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">งบประมาณที่ขอรับจัดสรร:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                        {formatCurrency(editBudget || parsedData.project.budgetAllocated || 0)} บาท
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">ผู้รับผิดชอบ:</span>
                      <strong>
                        {editRespName || parsedData.project.responsiblePerson?.name} ({fromThaiNumerals(editRespPhone || parsedData.project.responsiblePerson?.phone || '')})
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">ระยะเวลาดำเนินโครงการ:</span>
                      <span>{parsedData.project.timeframeText || `ปีงบประมาณ ${selectedFiscalYear}`}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Activities Extracted Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    กิจกรรมย่อยที่ตรวจพบ ({parsedData.project.activities?.length || 0} รายการ):
                  </h5>
                  <span className="text-[11px] text-slate-400">
                    รวมงบกิจกรรม: {formatCurrency(parsedData.project.activities?.reduce((s, a) => s + a.plannedBudget, 0) || 0)} บาท
                  </span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {parsedData.project.activities?.map((act, i) => (
                    <div
                      key={act.id || i}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {act.code || i + 1}
                        </span>
                        <span className="truncate text-slate-700 dark:text-slate-200">{act.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-slate-500 font-mono text-[11px]">
                        <span>{act.plannedPercent}%</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(act.plannedBudget)} บ.</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Objectives summary */}
              {parsedData.project.objectives && parsedData.project.objectives.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 text-xs space-y-1">
                  <span className="font-bold text-slate-600 dark:text-slate-300 block">วัตถุประสงค์ที่สกัดได้:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                    {parsedData.project.objectives.slice(0, 3).map((o, idx) => (
                      <li key={idx} className="line-clamp-1">{o}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          {parsedData ? (
            <button
              type="button"
              onClick={() => { setParsedData(null); setIsEditingPreview(false); }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer font-medium"
            >
              &larr; เลือกไฟล์ใหม่
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              ยกเลิก
            </button>

            {parsedData && (
              duplicateProject ? (
                <button
                  type="button"
                  onClick={handleUpdateExisting}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>อัปเดตทับโครงการเดิม</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="bg-[#0a4d44] hover:bg-[#073b34] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>ยืนยันนำเข้าแผนตั้งต้นปี {selectedFiscalYear}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
