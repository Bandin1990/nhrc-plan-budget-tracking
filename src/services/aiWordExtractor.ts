import { Project, ProjectActivity, NHRCUnit, ProgramCode } from '../types/project';
import { fromThaiNumerals } from '../utils/thaiNumber';
import { extractLinesFromPdf } from './pdfPlanExtractor';

export type AiProvider = 'gemini' | 'openai';

const GEMINI_API_KEY_STORAGE_KEY = 'nhrc_gemini_api_key';
const OPENAI_API_KEY_STORAGE_KEY = 'nhrc_openai_api_key';
const AI_PROVIDER_STORAGE_KEY = 'nhrc_ai_provider';

export function getStoredGeminiApiKey(): string {
  return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function setStoredGeminiApiKey(apiKey: string): void {
  if (apiKey.trim()) {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, apiKey.trim());
  } else {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  }
}

export function getStoredOpenAiApiKey(): string {
  return localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY) || import.meta.env.VITE_OPENAI_API_KEY || '';
}

export function setStoredOpenAiApiKey(apiKey: string): void {
  if (apiKey.trim()) {
    localStorage.setItem(OPENAI_API_KEY_STORAGE_KEY, apiKey.trim());
  } else {
    localStorage.removeItem(OPENAI_API_KEY_STORAGE_KEY);
  }
}

export function getStoredAiProvider(): AiProvider {
  const provider = localStorage.getItem(AI_PROVIDER_STORAGE_KEY);
  if (provider === 'openai' || provider === 'gemini') return provider;
  const openAiKey = getStoredOpenAiApiKey();
  if (openAiKey.startsWith('sk-')) return 'openai';
  return 'gemini';
}

export function setStoredAiProvider(provider: AiProvider): void {
  localStorage.setItem(AI_PROVIDER_STORAGE_KEY, provider);
}

export interface AiExtractionResponse {
  success: boolean;
  isMultiProject?: boolean;
  planTitle?: string;
  project?: Partial<Project>;
  projects?: Partial<Project>[];
  totalBudget?: number;
  extractedActivities?: ProjectActivity[];
  rawAiOutput?: string;
  usedProvider?: string;
  usedModel?: string;
  error?: string;
}

/**
 * Convert a File object to base64 string (without the data URL prefix)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Common system prompt to extract structured Thai NHRC project data (Single or Multi-Project Plan)
 */
function buildExtractionPrompt(targetFiscalYear: number): string {
  return `คุณคือผู้เชี่ยวชาญด้านการวิเคราะห์และสกัดข้อมูลเอกสารข้อเสนอโครงการ/แผนปฏิบัติราชการประจำปีของสำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ (สำนักงาน กสม.)

กรุณาวิเคราะห์เนื้อหาเอกสารต่อไปนี้ และสกัดข้อมูลออกมาเป็น JSON ตามข้อกำหนดอย่างครบถ้วน ถูกต้องตามระเบียบราชการ:

[เป้าหมายปีงบประมาณที่ต้องการ]: พ.ศ. ${targetFiscalYear}

[คำแนะนำสำคัญสำหรับการสกัดข้อมูล]:
1. หากเอกสารนี้เป็น "เล่มแผนปฏิบัติการประจำปี" หรือมี "ตารางบัญชีโครงการ/โครงการเชิงยุทธศาสตร์หลายโครงการ" (เช่น มี 20-30 โครงการ):
   - ให้สกัด "โครงการทั้งหมดในแผน" ออกมาเป็น Array ในคีย์ "projects"
   - ห้ามตัดทอนหรือส่งกลับเพียงโครงการเดียว ให้ดึงทุกโครงการที่ปรากฏในตาราง/บทที่เกี่ยวข้อง
   - ตั้งค่า "isMultiProject": true
2. หากเอกสารนี้เป็น "แบบข้อเสนอโครงการเดี่ยว (1 โครงการ)":
   - ให้ส่งกลับ Array "projects" ที่มี 1 โครงการ และตั้งค่า "isMultiProject": false

[ข้อกำหนดฟิลด์สำหรับแต่ละโครงการ]:
- name: ชื่อโครงการ (ชื่อเต็ม ตัด '1. โครงการ' หรือคำนำหน้าออก)
- code: รหัสโครงการ เช่น '${String(targetFiscalYear).substring(2)}O1-00001'
- fiscalYear: ${targetFiscalYear}
- division: หนึ่งใน 14 สำนักของ กสม. ('สสค.', 'สดส.', 'สฝป.', 'สรส.', 'สคส.1', 'สคส.2', 'สรป.', 'สกม.', 'สนย.', 'สบก.', 'สบค.', 'สนง.ภาคใต้', 'สนง.ภาคอีสาน', 'สนง.ภาคเหนือ')
- budgetAllocated: วงเงินงบประมาณรวมของโครงการ (ตัวเลขจำนวนเต็มหรือทศนิยม)
- isStrategic: true
- strategicPillar: เสาหลักยุทธศาสตร์ (1, 2, 3 หรือ 4)
- activities: รายการกิจกรรมย่อย Array of { id, code, name, plannedBudget, timeframe, plannedPercent, actualSpent: 0, status: 'not_started' }

ตอบกลับด้วย JSON object รูปแบบนี้เท่านั้น ห้ามใส่ markdown หรือข้อความอื่น:
{
  "isMultiProject": true,
  "planTitle": "แผนปฏิบัติการประจำปีงบประมาณ พ.ศ. ${targetFiscalYear}",
  "totalBudget": 0,
  "projects": [
    {
      "name": "...",
      "code": "${String(targetFiscalYear).substring(2)}O1-00001",
      "fiscalYear": ${targetFiscalYear},
      "programCode": "O",
      "division": "สนย.",
      "subDivision": "กลุ่มงาน...",
      "budgetAllocated": 0,
      "timeframeText": "ตุลาคม ${targetFiscalYear - 1} ถึงกันยายน ${targetFiscalYear}",
      "responsiblePerson": {
        "name": "ผู้รับผิดชอบโครงการ",
        "position": "นักวิชาการสิทธิมนุษยชน",
        "division": "สนย.",
        "subDivision": "กลุ่มงาน...",
        "phone": "02 141 3800",
        "email": "contact@nhrc.or.th"
      },
      "isStrategic": true,
      "strategicPillar": 1,
      "objectives": ["..."],
      "expectedOutputs": ["..."],
      "expectedOutcomes": ["..."],
      "indicators": [
        { "id": "ind_1", "title": "ร้อยละความสำเร็จตามแผน", "target": "100%", "actual": "0%", "status": "on_track" }
      ],
      "activities": [
        {
          "id": "act_1",
          "code": "1",
          "name": "...",
          "plannedBudget": 0,
          "timeframe": "...",
          "plannedPercent": 100,
          "actualSpent": 0,
          "status": "not_started"
        }
      ]
    }
  ]
}`;
}

/**
 * Sanitize and validate AI raw JSON into a typed Project object
 */
export function sanitizeAndValidateAiProject(
  parsed: any,
  targetFiscalYear: number
): { project: Partial<Project>; activities: ProjectActivity[] } {
  const timestamp = Date.now();
  const validatedActivities: ProjectActivity[] = Array.isArray(parsed.activities)
    ? parsed.activities.map((a: any, idx: number) => ({
        id: a.id || `act_ai_${timestamp}_${idx + 1}`,
        code: String(a.code || idx + 1),
        name: String(a.name || `กิจกรรมที่ ${idx + 1}`),
        plannedBudget: Number(a.plannedBudget) || 0,
        timeframe: String(a.timeframe || `ต.ค. ${targetFiscalYear - 1} - ก.ย. ${targetFiscalYear}`),
        plannedPercent: Number(a.plannedPercent) || 0,
        actualSpent: 0,
        status: 'not_started' as const
      }))
    : [];

  const actTotalBudget = validatedActivities.reduce((s, a) => s + a.plannedBudget, 0);
  const finalAllocated = Number(parsed.budgetAllocated) || actTotalBudget || 200000;

  const validatedProject: Partial<Project> = {
    id: `proj_ai_${timestamp}`,
    code: parsed.code || `${String(targetFiscalYear).substring(2)}O1-${Math.floor(10000 + Math.random() * 90000)}`,
    name: parsed.name || 'โครงการนำเข้าผ่าน AI',
    fiscalYear: targetFiscalYear,
    programCode: (parsed.programCode as ProgramCode) || 'O',
    division: (parsed.division as NHRCUnit) || 'สนย.',
    subDivision: parsed.subDivision || '',
    responsiblePerson: {
      name: parsed.responsiblePerson?.name || 'ผู้รับผิดชอบโครงการ',
      position: parsed.responsiblePerson?.position || 'นักวิชาการสิทธิมนุษยชน',
      division: (parsed.responsiblePerson?.division as NHRCUnit) || (parsed.division as NHRCUnit) || 'สนย.',
      subDivision: parsed.responsiblePerson?.subDivision || parsed.subDivision || '',
      phone: fromThaiNumerals(parsed.responsiblePerson?.phone || '02 141 3800'),
      email: parsed.responsiblePerson?.email || 'contact@nhrc.or.th'
    },
    isStrategic: parsed.isStrategic !== undefined ? Boolean(parsed.isStrategic) : true,
    strategicPillar: parsed.strategicPillar || 1,
    budgetAllocated: finalAllocated,
    budgetSpent: 0,
    progressPercent: 0,
    status: 'NOT_STARTED',
    startDate: `${targetFiscalYear - 543 - 1}-10-01`,
    endDate: `${targetFiscalYear - 543}-09-30`,
    timeframeText: parsed.timeframeText || `ตุลาคม ${targetFiscalYear - 1} ถึงกันยายน ${targetFiscalYear}`,
    objectives: Array.isArray(parsed.objectives) && parsed.objectives.length > 0
      ? parsed.objectives
      : ['เพื่อขับเคลื่อนภารกิจตามแผนปฏิบัติการ กสม.'],
    expectedOutputs: Array.isArray(parsed.expectedOutputs) && parsed.expectedOutputs.length > 0
      ? parsed.expectedOutputs
      : ['ผลผลิตตามรายละเอียดโครงการ'],
    expectedOutcomes: Array.isArray(parsed.expectedOutcomes) && parsed.expectedOutcomes.length > 0
      ? parsed.expectedOutcomes
      : ['ผลลัพธ์ตามเป้าหมายของสำนักงาน กสม.'],
    indicators: Array.isArray(parsed.indicators) && parsed.indicators.length > 0
      ? parsed.indicators
      : [
          {
            id: `ind_ai_${timestamp}_1`,
            title: 'ร้อยละความสำเร็จตามแผนปฏิบัติการ',
            target: '100%',
            actual: '0%',
            status: 'on_track'
          }
        ],
    activities: validatedActivities.length > 0 ? validatedActivities : [
      {
        id: `act_ai_${timestamp}_1`,
        code: '1',
        name: `ดำเนินงานตาม ${parsed.name || 'โครงการ'}`,
        plannedBudget: finalAllocated,
        timeframe: `ต.ค. ${targetFiscalYear - 1} - ก.ย. ${targetFiscalYear}`,
        plannedPercent: 100,
        actualSpent: 0,
        status: 'not_started'
      }
    ],
    isBaselineLocked: true,
    unlockedForEdit: false
  };

  return {
    project: validatedProject,
    activities: validatedProject.activities || []
  };
}

// In-memory cache of the working model for the current session
let cachedWorkingModel: string | null = null;

/**
 * Dynamically queries Google Generative Language ModelService (ListModels)
 * to discover the exact models supported by the provided API key.
 */
async function getCandidateModels(apiKey: string): Promise<string[]> {
  const fallbackList = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro'
  ];

  if (cachedWorkingModel) {
    return [cachedWorkingModel, ...fallbackList.filter(m => m !== cachedWorkingModel)];
  }

  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      if (Array.isArray(listData.models)) {
        const supported = listData.models
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace(/^models\//, ''));

        // Prioritize: 2.0 / 2.5 Flash -> 1.5 Flash -> Pro -> Others
        const flash2 = supported.filter((m: string) => m.includes('2.0') || m.includes('2.5'));
        const flash15 = supported.filter((m: string) => m.includes('1.5-flash') || m.includes('flash'));
        const pro = supported.filter((m: string) => m.includes('pro'));
        const others = supported.filter((m: string) => !m.includes('flash') && !m.includes('pro'));

        const prioritized = [...flash2, ...flash15, ...pro, ...others];
        if (prioritized.length > 0) {
          return prioritized;
        }
      }
    }
  } catch (err) {
    console.warn('ListModels failed, falling back to default candidate list:', err);
  }

  return fallbackList;
}

/**
 * Executes a Gemini generateContent request with multi-model fallback.
 * Automatically tries available models until one succeeds.
 */
async function callGeminiApiWithFallback(
  contents: any[],
  apiKey: string
): Promise<{ text: string; usedModel: string }> {
  const models = await getCandidateModels(apiKey);
  let lastErrorMessage = '';

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          cachedWorkingModel = model;
          return { text: candidate, usedModel: model };
        }
      } else {
        const errJson = await response.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${response.status} ${response.statusText}`;
        lastErrorMessage = errMsg;

        // If it's a 404 or model not supported, continue trying next model in list
        if (response.status === 404 || errMsg.includes('not found') || errMsg.includes('not supported')) {
          console.warn(`Gemini model "${model}" is not available (${errMsg}), trying next candidate...`);
          continue;
        } else if (response.status === 400 && (errMsg.includes('API key') || errMsg.includes('API_KEY_INVALID'))) {
          throw new Error(`Google Gemini API Key ไม่ถูกต้อง: ${errMsg}`);
        } else if (response.status === 403) {
          if (errMsg.includes('denied access') || errMsg.includes('denied')) {
            throw new Error(`Google ระงับสิทธิ์โปรเจกต์ของ API Key นี้ (${errMsg}): แนะนำให้สร้าง API Key ใหม่ที่ aistudio.google.com/app/apikey โดยเลือก "Create API key in new project" (สร้างในโปรเจกต์ใหม่) หรือเปลี่ยนไปใช้บัญชี Google อื่น`);
          }
          throw new Error(`ไม่มีสิทธิ์ใช้งาน หรือ API Key ถูกระงับ: ${errMsg}`);
        } else {
          continue;
        }
      }
    } catch (err: any) {
      if (err.message?.includes('API Key')) {
        throw err;
      }
      lastErrorMessage = err.message || String(err);
      continue;
    }
  }

  throw new Error(`ไม่พบโมเดล Gemini ที่สามารถใช้งานได้กับ API Key นี้ (${lastErrorMessage})`);
}

/**
 * Calls Google Gemini API to parse raw text/HTML from a Thai government Word document
 */
export async function extractProjectWithGemini(
  documentText: string,
  targetFiscalYear: number = 2570,
  customApiKey?: string
): Promise<AiExtractionResponse> {
  const apiKey = customApiKey?.trim() || getStoredGeminiApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'กรุณาระบุ Google Gemini API Key เพื่อเปิดใช้งานระบบสกัดข้อมูลอัจฉริยะด้วย AI'
    };
  }

  const prompt = `${buildExtractionPrompt(targetFiscalYear)}

[เนื้อหาเอกสารโครงการ]:
"""
${documentText.substring(0, 45000)}
"""`;

  try {
    const contents = [
      {
        parts: [{ text: prompt }]
      }
    ];

    const { text: candidate, usedModel } = await callGeminiApiWithFallback(contents, apiKey);
    console.log(`Successfully extracted Word project using Gemini model: ${usedModel}`);

    const cleanJsonStr = candidate.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJsonStr);

    if (Array.isArray(parsed.projects) && parsed.projects.length > 0) {
      const validatedList: Partial<Project>[] = [];
      for (const p of parsed.projects) {
        const { project } = sanitizeAndValidateAiProject(p, targetFiscalYear);
        validatedList.push(project);
      }
      return {
        success: true,
        isMultiProject: true,
        planTitle: parsed.planTitle || `แผนปฏิบัติการประจำปีงบประมาณ พ.ศ. ${targetFiscalYear}`,
        projects: validatedList,
        totalBudget: validatedList.reduce((s, p) => s + (p.budgetAllocated || 0), 0),
        rawAiOutput: cleanJsonStr
      };
    }

    const { project, activities } = sanitizeAndValidateAiProject(parsed, targetFiscalYear);

    return {
      success: true,
      isMultiProject: false,
      project,
      extractedActivities: activities,
      rawAiOutput: cleanJsonStr
    };
  } catch (err: any) {
    console.error('Gemini Word extraction error:', err);
    return {
      success: false,
      error: `เกิดข้อผิดพลาดในการประมวลผลด้วย AI: ${err.message}`
    };
  }
}

/**
 * Calls Google Gemini API with multimodal PDF inlineData to extract Thai NHRC project data directly from PDF
 */
export async function extractProjectFromPdfWithGemini(
  pdfFile: File,
  targetFiscalYear: number = 2570,
  customApiKey?: string
): Promise<AiExtractionResponse> {
  const apiKey = customApiKey?.trim() || getStoredGeminiApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'การนำเข้าไฟล์ PDF จำเป็นต้องใช้ Google Gemini API Key กรุณาระบุ API Key เพื่อดำเนินการ'
    };
  }

  // Size limit check (25MB)
  if (pdfFile.size > 25 * 1024 * 1024) {
    return {
      success: false,
      error: 'ไฟล์ PDF มีขนาดใหญ่เกิน 25MB กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 25MB'
    };
  }

  try {
    const base64Data = await fileToBase64(pdfFile);
    const prompt = buildExtractionPrompt(targetFiscalYear);

    const contents = [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      }
    ];

    const { text: candidate, usedModel } = await callGeminiApiWithFallback(contents, apiKey);
    console.log(`Successfully extracted PDF project using Gemini model: ${usedModel}`);

    const cleanJsonStr = candidate.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJsonStr);

    if (Array.isArray(parsed.projects) && parsed.projects.length > 0) {
      const validatedList: Partial<Project>[] = [];
      for (const p of parsed.projects) {
        const { project } = sanitizeAndValidateAiProject(p, targetFiscalYear);
        validatedList.push(project);
      }
      return {
        success: true,
        isMultiProject: true,
        planTitle: parsed.planTitle || `แผนปฏิบัติการประจำปีงบประมาณ พ.ศ. ${targetFiscalYear}`,
        projects: validatedList,
        totalBudget: validatedList.reduce((s, p) => s + (p.budgetAllocated || 0), 0),
        rawAiOutput: cleanJsonStr
      };
    }

    const { project, activities } = sanitizeAndValidateAiProject(parsed, targetFiscalYear);

    return {
      success: true,
      isMultiProject: false,
      project,
      extractedActivities: activities,
      rawAiOutput: cleanJsonStr,
      usedProvider: 'Google Gemini',
      usedModel: usedModel
    };
  } catch (err: any) {
    console.error('Gemini PDF extraction error:', err);
    return {
      success: false,
      error: `เกิดข้อผิดพลาดในการประมวลผลไฟล์ PDF ด้วย AI: ${err.message}`
    };
  }
}

/**
 * Calls OpenAI API (gpt-4o / gpt-4o-mini) to extract Thai NHRC project data from text
 */
export async function extractProjectWithOpenAI(
  documentText: string,
  targetFiscalYear: number = 2570,
  customApiKey?: string,
  model: string = 'gpt-4o-mini'
): Promise<AiExtractionResponse> {
  const apiKey = customApiKey?.trim() || getStoredOpenAiApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'กรุณาระบุ OpenAI API Key (เริ่มต้นด้วย sk-...) เพื่อใช้ AI ในการสกัดข้อมูล'
    };
  }

  const prompt = `${buildExtractionPrompt(targetFiscalYear)}

[เนื้อหาเอกสารโครงการ]:
"""
${documentText.substring(0, 100000)}
"""`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      const errMsg = errJson?.error?.message || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    const candidate = data?.choices?.[0]?.message?.content;
    if (!candidate) {
      throw new Error('ไม่ได้รับข้อความตอบกลับจาก OpenAI');
    }

    const cleanJsonStr = candidate.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJsonStr);

    if (Array.isArray(parsed.projects) && parsed.projects.length > 0) {
      const validatedList: Partial<Project>[] = [];
      for (const p of parsed.projects) {
        const { project } = sanitizeAndValidateAiProject(p, targetFiscalYear);
        validatedList.push(project);
      }
      return {
        success: true,
        isMultiProject: true,
        planTitle: parsed.planTitle || `แผนปฏิบัติการประจำปีงบประมาณ พ.ศ. ${targetFiscalYear}`,
        projects: validatedList,
        totalBudget: validatedList.reduce((s, p) => s + (p.budgetAllocated || 0), 0),
        rawAiOutput: cleanJsonStr,
        usedProvider: 'OpenAI',
        usedModel: model
      };
    }

    const { project, activities } = sanitizeAndValidateAiProject(parsed, targetFiscalYear);

    return {
      success: true,
      isMultiProject: false,
      project,
      extractedActivities: activities,
      rawAiOutput: cleanJsonStr,
      usedProvider: 'OpenAI',
      usedModel: model
    };
  } catch (err: any) {
    console.error('OpenAI Word extraction error:', err);
    return {
      success: false,
      error: `เกิดข้อผิดพลาดในการประมวลผลด้วย OpenAI: ${err.message}`
    };
  }
}

/**
 * Calls OpenAI API (gpt-4o / gpt-4o-mini) to extract Thai NHRC project data from PDF text lines
 */
export async function extractProjectFromPdfWithOpenAI(
  pdfFile: File,
  targetFiscalYear: number = 2570,
  customApiKey?: string,
  model: string = 'gpt-4o-mini'
): Promise<AiExtractionResponse> {
  const apiKey = customApiKey?.trim() || getStoredOpenAiApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'กรุณาระบุ OpenAI API Key (เริ่มต้นด้วย sk-...) เพื่อใช้ AI ในการสกัดข้อมูล'
    };
  }

  try {
    const pageData = await extractLinesFromPdf(pdfFile);
    const pdfTextLines: string[] = [];
    for (const p of pageData) {
      pdfTextLines.push(`--- หน้า ${p.page} ---`);
      pdfTextLines.push(...p.lines);
    }
    const fullPdfText = pdfTextLines.join('\n');

    return await extractProjectWithOpenAI(fullPdfText, targetFiscalYear, apiKey, model);
  } catch (err: any) {
    console.error('OpenAI PDF extraction error:', err);
    return {
      success: false,
      error: `เกิดข้อผิดพลาดในการอ่านและประมวลผลไฟล์ PDF ด้วย OpenAI: ${err.message}`
    };
  }
}

/**
 * Unified AI project extractor (dispatches to OpenAI or Google Gemini based on Key prefix or settings)
 */
export async function extractProjectWithAi(
  documentText: string,
  targetFiscalYear: number = 2570,
  customApiKey?: string
): Promise<AiExtractionResponse> {
  const key = customApiKey?.trim() || getStoredOpenAiApiKey() || getStoredGeminiApiKey();
  const provider = getStoredAiProvider();

  if (key.startsWith('sk-') || provider === 'openai') {
    return extractProjectWithOpenAI(documentText, targetFiscalYear, key);
  } else {
    return extractProjectWithGemini(documentText, targetFiscalYear, key);
  }
}

/**
 * Unified AI PDF project extractor (dispatches to OpenAI or Google Gemini based on Key prefix or settings)
 */
export async function extractProjectFromPdfWithAi(
  pdfFile: File,
  targetFiscalYear: number = 2570,
  customApiKey?: string
): Promise<AiExtractionResponse> {
  const key = customApiKey?.trim() || getStoredOpenAiApiKey() || getStoredGeminiApiKey();
  const provider = getStoredAiProvider();

  if (key.startsWith('sk-') || provider === 'openai') {
    return extractProjectFromPdfWithOpenAI(pdfFile, targetFiscalYear, key);
  } else {
    return extractProjectFromPdfWithGemini(pdfFile, targetFiscalYear, key);
  }
}
