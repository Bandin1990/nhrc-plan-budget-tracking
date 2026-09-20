import { NHRCUnit, ProgramCode } from './project';

export type TransferCategory = 'annual_budget' | 'multi_year_commitment';

export type ApproverAuthority = 
  | 'SECRETARY_GENERAL' // เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ
  | 'COMMISSION_CHAIR'  // ประธานกรรมการสิทธิมนุษยชนแห่งชาติ
  | 'COMMISSION_BOARD'  // คณะกรรมการสิทธิมนุษยชนแห่งชาติ (กสม.)
  | 'CABINET';          // คณะรัฐมนตรี

export interface DiagnosisResult {
  approver: ApproverAuthority;
  approverTitle: string;
  approverSubtitle?: string;
  ruleClause: string; // เช่น 'ระเบียบ กสม. ว่าด้วยการงบประมาณ พ.ศ. 2566 ข้อ 15 วรรคหนึ่ง'
  ruleDescription: string;
  actionSummary: string;
  severityColor: 'emerald' | 'blue' | 'amber' | 'rose';
  nextSteps: string[];
}

export type ChangeScope = 'intra_project' | 'inter_project';
export type IntraChangeType = 'between_activities' | 'new_activity' | 'target_change' | 'cancel_activity';

export interface WorkflowState {
  category: TransferCategory;
  changeScope: ChangeScope;
  intraChangeType: IntraChangeType;
  isCrossProgram: boolean | null; // ข้อ 14
  impactsPlan: boolean | null;    // ข้อ 15 วรรคท้าย
  impactChecklist: {
    activityChanged: boolean;
    targetsChanged: boolean;
    scopeChanged: boolean;
    timeframeDelayed: boolean;
    totalBudgetIncreased: boolean;
  };
  targetAdjustment: {
    isChanged: boolean;
    original: string;
    adjusted: string;
  };
  frequencyAdjustment: {
    isChanged: boolean;
    original: string;
    adjusted: string;
  };
  isAssetOrConstruction: boolean | null; // ข้อ 15 วรรคสอง-สาม
  itemType: 'equipment' | 'construction' | 'other';
  isIncreaseWithin10Percent: boolean | null; // ข้อ 15 วรรคสี่
  isWithinThreshold: boolean | null; // ครุภัณฑ์ <= 1ลบ., สิ่งก่อสร้าง <= 10ลบ.
  unitPrice: number;

  // ก่อหนี้ผูกพันข้ามปี (ข้อ 16)
  multiYearCase: '1_detail_no_increase' | '2_extend_time_no_increase' | '3_change_item_or_increase' | null;
}

export interface TransferBudgetItem {
  id: string;
  itemType: 'source' | 'destination'; // รายการโอนออก (-) หรือ รับโอน (+)
  programName: string;
  programCode: ProgramCode;
  itemDescription: string;
  activityCode: string; // e.g. 69T4-71016 หรือ 69M4-71006
  budgetOriginal: number; // งบประมาณเดิม
  transferAmount: number; // จำนวนเงินที่โอนออก หรือรับโอน
  budgetNew: number; // งบประมาณใหม่
  actualDisbursedAndCommitted: number; // ผลเบิกจ่าย+ก่อหนี้ ณ วันที่
  remainingBalance: number; // คงเหลือใช้จ่าย
}

export interface OfficialMemoData {
  id: string;
  bookNumber: string; // เช่น 'สม 0302/2351'
  memoDate: string; // เช่น '22 กรกฎาคม 2569'
  division: NHRCUnit;
  divisionFullName: string;
  subDivisionName: string;
  telNumber: string; // เช่น '1380'
  subject: string; // เช่น 'ขออนุมัติโอนเปลี่ยนแปลงงบประมาณเพื่อจัดสรรให้กับค่าเช่าบริการโปรแกรม Zoom Video Conference'
  toRecipient: string; // เช่น 'เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ ผ่านรองเลขาธิการ กสม.'
  fiscalYear: number; // 2569
  
  // เนื้อหา 4 ข้อตามระเบียบ กสม.
  section1_OriginalStory: string; // 1. เรื่องเดิม
  section2_Facts: {               // 2. ข้อเท็จจริง
    agencyRequest: string;       // 2.1 บันทึกขอรับจัดสรรของสำนัก...
    investigation: string;       // 2.2 สนย. ได้ตรวจสอบข้อเท็จจริง...
    savingsSource: string;       // 2.3 งบประมาณที่เหลือจ่ายจากการก่อหนี้ผูกพันแล้วเสร็จ...
  };
  section3_LegalReference: string; // 3. ระเบียบที่เกี่ยวข้อง
  section4_Proposal: string;       // 4. ข้อเสนอเพื่อพิจารณา
  
  // ตาราง 7 คอลัมน์
  tableRows: TransferBudgetItem[];
  asOfDateText: string; // เช่น 'ณ วันที่ 22 ก.ค. 69'

  // ผู้เสนอและคำสั่งอนุมัติ
  proposerName: string; // เช่น 'นางสาวสุกัญญา ตันสายเพชร'
  proposerPosition: string; // เช่น 'ผู้อำนวยการสำนักนโยบายและยุทธศาสตร์'
  divisionHeadRemark?: string; // ความเห็นหัวหน้ากลุ่มงาน
  deputyRemark?: string; // ความเห็นรองเลขาธิการ กสม.
  decisionOrder: 'APPROVED' | 'PENDING' | 'REJECTED';
  approverTitle: string; // เช่น 'เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ'
  approverName: string; // เช่น 'นางสาวหรรษา หอมหวล'
  useThaiNumerals: boolean;
  status: 'draft' | 'pending_approval' | 'approved';
  createdAt: string;
}
