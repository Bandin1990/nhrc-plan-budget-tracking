export type NHRCUnit =
  | 'สบก.'   // สำนักบริหารกลาง
  | 'สบค.'   // สำนักบริหารทรัพยากรบุคคล
  | 'สนย.'   // สำนักนโยบายและยุทธศาสตร์
  | 'สสค.'   // สำนักส่งเสริมการเคารพสิทธิมนุษยชน
  | 'สรส.'   // สำนักรับเรื่องร้องเรียนและประสานการคุ้มครองสิทธิมนุษยชน
  | 'สคส.1'  // สำนักคุ้มครองสิทธิมนุษยชน 1
  | 'สคส.2'  // สำนักคุ้มครองสิทธิมนุษยชน 2
  | 'สฝป.'   // สำนักเฝ้าระวังและประเมินสถานการณ์สิทธิมนุษยชน
  | 'สรป.'   // สำนักสิทธิมนุษยชนระหว่างประเทศ
  | 'สกม.'   // สำนักกฎหมาย
  | 'สดส.'   // สำนักดิจิทัลสิทธิมนุษยชน
  | 'นตส.'   // หน่วยตรวจสอบภายใน
  | 'กตต.'   // กลุ่มงานตรวจเยี่ยมสถานที่ควบคุมตัวและการป้องกันการทรมาน
  | 'กนก.'   // กลุ่มงานนิติการ
  | 'สนง.ภาคใต้'       // สำนักงาน กสม. พื้นที่ภาคใต้
  | 'สนง.ภาคอีสาน'     // สำนักงาน กสม. พื้นที่ภาคตะวันออกเฉียงเหนือ
  | 'สนง.ภาคเหนือ'     // สำนักงาน กสม. พื้นที่ภาคเหนือ
  | 'งบบริหาร กสม.';

export interface NHRCUnitInfo {
  code: NHRCUnit;
  fullName: string;
  shortName: string;
  subDivisions: string[];
}

export const NHRC_UNITS: Record<NHRCUnit, NHRCUnitInfo> = {
  'สบก.': {
    code: 'สบก.',
    fullName: 'สำนักบริหารกลาง',
    shortName: 'บริหารกลาง',
    subDivisions: ['กลุ่มงานบริหารทั่วไป', 'กลุ่มงานคลัง', 'กลุ่มงานพัสดุ', 'ฝ่ายช่วยอำนวยการ']
  },
  'สบค.': {
    code: 'สบค.',
    fullName: 'สำนักบริหารทรัพยากรบุคคล',
    shortName: 'บุคคล',
    subDivisions: ['กลุ่มงานบริหารงานบุคคล', 'กลุ่มงานพัฒนาทรัพยากรบุคคล']
  },
  'สนย.': {
    code: 'สนย.',
    fullName: 'สำนักนโยบายและยุทธศาสตร์',
    shortName: 'นโยบายและยุทธศาสตร์',
    subDivisions: ['ฝ่ายช่วยอำนวยการ', 'กลุ่มงานอำนวยการกิจการ กสม.', 'กลุ่มงานนโยบายและยุทธศาสตร์', 'กลุ่มงานวิจัยและวิชาการสิทธิมนุษยชน', 'กลุ่มงานพัฒนาระบบบริหารและติดตามประเมินผล']
  },
  'สสค.': {
    code: 'สสค.',
    fullName: 'สำนักส่งเสริมการเคารพสิทธิมนุษยชน',
    shortName: 'ส่งเสริมสิทธิฯ',
    subDivisions: ['ฝ่ายช่วยอำนวยการ', 'กลุ่มงานส่งเสริมสิทธิมนุษยชน', 'กลุ่มงานพัฒนาความร่วมมือเครือข่าย 1', 'กลุ่มงานพัฒนาความร่วมมือเครือข่าย 2', 'กลุ่มงานสื่อสารองค์กร']
  },
  'สรส.': {
    code: 'สรส.',
    fullName: 'สำนักรับเรื่องร้องเรียนและประสานการคุ้มครองสิทธิมนุษยชน',
    shortName: 'รับเรื่องร้องเรียนฯ',
    subDivisions: ['ฝ่ายช่วยอำนวยการ', 'กลุ่มงานกลั่นกรองรับเรื่องร้องเรียน', 'กลุ่มงานประสานการคุ้มครองสิทธิมนุษยชน', 'กลุ่มงานศูนย์ข้อมูลและสารสนเทศสำนวน']
  },
  'สคส.1': {
    code: 'สคส.1',
    fullName: 'สำนักคุ้มครองสิทธิมนุษยชน 1',
    shortName: 'คุ้มครอง 1',
    subDivisions: ['ฝ่ายช่วยอำนวยการ', 'กลุ่มงานคุ้มครองสิทธิมนุษยชน 1', 'กลุ่มงานคุ้มครองสิทธิมนุษยชน 2', 'กลุ่มงานคุ้มครองสิทธิมนุษยชน 3', 'กลุ่มงานคุ้มครองสิทธิมนุษยชน 4']
  },
  'สคส.2': {
    code: 'สคส.2',
    fullName: 'สำนักคุ้มครองสิทธิมนุษยชน 2',
    shortName: 'คุ้มครอง 2',
    subDivisions: ['ฝ่ายช่วยอำนวยการ', 'กลุ่มงานคุ้มครองสิทธิมนุษยชน 1', 'กลุ่มงานคุ้มครองสิทธิมนุษยชน 2', 'กลุ่มงานคุ้มครองสิทธิมนุษยชน 3']
  },
  'สฝป.': {
    code: 'สฝป.',
    fullName: 'สำนักเฝ้าระวังและประเมินสถานการณ์สิทธิมนุษยชน',
    shortName: 'เฝ้าระวังฯ',
    subDivisions: ['ฝ่ายช่วยอำนวยการ', 'กลุ่มงานเฝ้าระวังและประเมินสถานการณ์สิทธิมนุษยชน 1', 'กลุ่มงานเฝ้าระวังและประเมินสถานการณ์สิทธิมนุษยชน 2', 'กลุ่มงานเฝ้าระวังและประเมินสถานการณ์สิทธิมนุษยชน 3']
  },
  'สรป.': {
    code: 'สรป.',
    fullName: 'สำนักสิทธิมนุษยชนระหว่างประเทศ',
    shortName: 'ระหว่างประเทศ',
    subDivisions: ['ฝ่ายช่วยอำนวยการ', 'กลุ่มงานความร่วมมือสิทธิมนุษยชนระหว่างประเทศ', 'กลุ่มงานพันธกรณีและมาตรฐานสิทธิมนุษยชนระหว่างประเทศ']
  },
  'สกม.': {
    code: 'สกม.',
    fullName: 'สำนักกฎหมาย',
    shortName: 'กฎหมาย',
    subDivisions: ['ฝ่ายช่วยอำนวยการ', 'กลุ่มงานเสนอแนะ/การแก้ไขปรับปรุงกฎหมาย 1', 'กลุ่มงานเสนอแนะ/การแก้ไขปรับปรุงกฎหมาย 2', 'กลุ่มงานเสนอแนะ/การแก้ไขปรับปรุงกฎหมาย 3']
  },
  'สดส.': {
    code: 'สดส.',
    fullName: 'สำนักดิจิทัลสิทธิมนุษยชน',
    shortName: 'ดิจิทัลสิทธิฯ',
    subDivisions: ['ฝ่ายช่วยอำนวยการ', 'กลุ่มงานพัฒนาระบบสารสนเทศและฐานข้อมูล', 'กลุ่มงานคอมพิวเตอร์และระบบเครือข่าย', 'กลุ่มงานสารสนเทศ']
  },
  'กตต.': {
    code: 'กตต.',
    fullName: 'กลุ่มงานตรวจเยี่ยมสถานที่ควบคุมตัวและการป้องกันการทรมาน',
    shortName: 'ตรวจเยี่ยม/OPCAT',
    subDivisions: ['งานพัฒนาความร่วมมือและตรวจเยี่ยม NPM', 'งานติดตามและช่วยเหลือผู้ถูกละเมิด']
  },
  'กนก.': {
    code: 'กนก.',
    fullName: 'กลุ่มงานนิติการ',
    shortName: 'นิติการ',
    subDivisions: ['งานความเห็นทางกฎหมายและนิติกรรมสัญญา', 'งานคดีและข้อพิพาท']
  },
  'นตส.': {
    code: 'นตส.',
    fullName: 'หน่วยตรวจสอบภายใน',
    shortName: 'ตรวจสอบภายใน',
    subDivisions: ['งานตรวจสอบการเงินและงบประมาณ', 'งานตรวจสอบการดำเนินงาน']
  },
  'สนง.ภาคใต้': {
    code: 'สนง.ภาคใต้',
    fullName: 'สำนักงาน กสม. พื้นที่ภาคใต้ (สงขลา)',
    shortName: 'กสม. ภาคใต้',
    subDivisions: ['กลุ่มงานบริหารทั่วไป', 'กลุ่มงานคุ้มครองสิทธิมนุษยชน', 'กลุ่มงานส่งเสริมและเฝ้าระวังสถานการณ์สิทธิมนุษยชน']
  },
  'สนง.ภาคอีสาน': {
    code: 'สนง.ภาคอีสาน',
    fullName: 'สำนักงาน กสม. พื้นที่ภาคตะวันออกเฉียงเหนือ (ขอนแก่น)',
    shortName: 'กสม. อีสาน',
    subDivisions: ['กลุ่มงานบริหารทั่วไป', 'กลุ่มงานคุ้มครองสิทธิมนุษยชน', 'กลุ่มงานส่งเสริมและเฝ้าระวังสถานการณ์สิทธิมนุษยชน']
  },
  'สนง.ภาคเหนือ': {
    code: 'สนง.ภาคเหนือ',
    fullName: 'สำนักงาน กสม. พื้นที่ภาคเหนือ (เชียงใหม่)',
    shortName: 'กสม. ภาคเหนือ',
    subDivisions: ['กลุ่มงานบริหารทั่วไป', 'กลุ่มงานคุ้มครองสิทธิมนุษยชน', 'กลุ่มงานส่งเสริมและเฝ้าระวังสถานการณ์สิทธิมนุษยชน']
  },
  'งบบริหาร กสม.': {
    code: 'งบบริหาร กสม.',
    fullName: 'งบบริหาร กสม. / สำนักงาน กสม.',
    shortName: 'งบบริหาร',
    subDivisions: ['งานประชุม กสม./ผู้บริหาร', 'งานคณะอนุกรรมการ/ทำงาน', 'งานสนับสนุนผู้บริหารระดับสูง']
  }
};

export type ProgramCode = 'P1' | 'M_T' | 'S1' | 'A' | 'D2' | 'O';

export interface BudgetProgram {
  code: ProgramCode;
  name: string;
  shortName: string;
  totalBudget: number;
}

export const BUDGET_PROGRAMS: Record<ProgramCode, BudgetProgram> = {
  P1: {
    code: 'P1',
    name: 'แผนงานบุคลากรภาครัฐ',
    shortName: 'บุคลากรภาครัฐ',
    totalBudget: 212005000.00
  },
  M_T: {
    code: 'M_T',
    name: 'แผนงานพื้นฐานด้านการปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ',
    shortName: 'พื้นฐานปรับสมดุลภาครัฐ',
    totalBudget: 88722950.94
  },
  S1: {
    code: 'S1',
    name: 'แผนงานยุทธศาสตร์ป้องกันและแก้ไขปัญหาที่มีผลกระทบต่อความมั่นคง',
    shortName: 'ความมั่นคง',
    totalBudget: 2630000.00
  },
  A: {
    code: 'A',
    name: 'แผนงานยุทธศาสตร์ส่งเสริมความสัมพันธ์ระหว่างประเทศ',
    shortName: 'ความสัมพันธ์ระหว่างประเทศ',
    totalBudget: 14792100.00
  },
  D2: {
    code: 'D2',
    name: 'แผนงานยุทธศาสตร์พัฒนาบริการประชาชนและการพัฒนาประสิทธิภาพภาครัฐ',
    shortName: 'พัฒนาบริการและประสิทธิภาพ',
    totalBudget: 13700000.00
  },
  O: {
    code: 'O',
    name: 'แผนงานยุทธศาสตร์สร้างหลักประกันทางสังคม',
    shortName: 'สร้างหลักประกันทางสังคม',
    totalBudget: 38625700.00
  }
};

export type ProjectStatus = 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'DELAYED';

export type ActivityStatus = 'completed' | 'in_progress' | 'not_started';

export interface ProjectActivity {
  id: string;
  code?: string;
  name: string;
  plannedPercent?: number; // เช่น 30%
  timeframe: string; // เช่น 'ต.ค. 68 - ธ.ค. 68'
  plannedBudget: number;
  actualSpent: number;
  status: ActivityStatus;
  targetDescription?: string; // เช่น 'แผน 30 คน ผล 50 คน'
  actualResultDescription?: string; // สรุปงานที่ทำจริง
}

export interface ProjectIndicator {
  id: string;
  title: string;
  target: string;
  actual?: string;
  status?: 'achieved' | 'on_track' | 'at_risk';
}

export interface ResponsiblePerson {
  name: string;
  position: string;
  division: NHRCUnit;
  subDivision?: string;
  phone: string;
  email: string;
}

export interface MonthlyBudgetPlan {
  month: number; // 1-12 (หรือ 10=ต.ค. ถึง 9=ก.ย.)
  monthName: string; // 'ต.ค.', 'พ.ย.', 'ธ.ค.', etc.
  quarter: 1 | 2 | 3 | 4;
  plannedSpent: number; // งบประมาณที่จะเบิกจ่ายจริง
  plannedCommitted?: number; // งบลงทุน: แผนก่อหนี้ผูกพัน (PO/สัญญา) ในไตรมาสที่ 1
  operationMilestone?: string; // แผนการดำเนินงานรายเดือน
}

export interface ProjectAttachment {
  id: string;
  type: 'BUDGET_REQUEST_FORM' | 'STRATEGIC_PROPOSAL_FORM' | 'OTHER';
  fileName: string;
  fileSize?: string;
  uploadedAt: string;
  fileUrl?: string;
}

export interface StrategicSection2 {
  // 2.1 ยุทธศาสตร์ชาติ
  nationalStrategyPillar?: string; // ยุทธศาสตร์ที่ (1-6)
  nationalStrategyIssue?: string; // ประเด็น
  nationalStrategyTarget?: string; // เป้าหมาย

  // 2.2 แผนแม่บทภายใต้ยุทธศาสตร์ชาติ
  masterPlanSubPlan?: string; // แผนย่อย
  masterPlanSubTarget?: string; // เป้าหมายแผนย่อย

  // 2.3 แผนการปฏิรูปประเทศ
  nationalReformPlan?: string; // แผนการปฏิรูปประเทศ

  // 2.4 แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ
  economicDevPlanMilestone?: string; // หมุดหมายที่ (เช่น หมุดหมายที่ 13 ภาครัฐที่มีความทันสมัย มีประสิทธิภาพสูง)

  // 2.5 แผนระดับที่ 3 ที่เกี่ยวข้อง
  level3Plan?: string; // แผนระดับที่ 3 ที่เกี่ยวข้อง (เช่น แผนสิทธิมนุษยชนแห่งชาติ ฉบับที่ 5)

  // 2.6 ยุทธศาสตร์ กสม.
  nhrcStrategicPillar?: number; // ยุทธศาสตร์ที่ (1, 2, 3, 4)
  nhrcStrategicIssue?: string; // ประเด็นยุทธศาสตร์ที่

  // 2.7 กฎหมายที่เกี่ยวข้อง
  relatedLaws?: string; // กฎหมายที่เกี่ยวข้อง (เช่น พ.ร.ป. กสม. พ.ศ. 2560)
}

export interface Project {
  id: string;
  code: string; // e.g. '68O1-13314'
  name: string;
  fiscalYear: number; // e.g. 2569
  programCode: ProgramCode;
  division: NHRCUnit;
  subDivision: string;
  responsiblePerson: ResponsiblePerson;
  isStrategic: boolean; // เป็นโครงการเชิงยุทธศาสตร์หรือไม่
  strategicPillar?: number; // 1, 2, 3, 4 (ยุทธศาสตร์ กสม.)
  
  // ส่วนที่ 1: ข้อมูลโครงการเพิ่มเติม
  operationMethod?: string; // วิธีการดำเนินงาน (เช่น ดำเนินการเอง / จัดซื้อจัดจ้าง / จ้างเหมา / ประชุมสัมมนา)
  budgetSource?: string; // แหล่งงบประมาณ (เช่น งบประมาณแผ่นดินรายจ่ายประจำปี พ.ศ. 2569)
  budgetCategory?: 'งบดำเนินงาน' | 'งบลงทุน' | 'งบบุคลากร' | 'งบอุดหนุน' | 'งบรายจ่ายอื่น'; // ประเภทงบประมาณ
  
  // ส่วนที่ 2: ความเชื่อมโยงยุทธศาสตร์ชาติ (2.1 ถึง 2.7)
  nationalStrategy?: string; // ยุทธศาสตร์ชาติ (ข้อความรวม/สรุป)
  masterPlan?: string; // แผนแม่บท (ข้อความรวม/สรุป)
  relatedPlans?: string; // แผนระดับต่าง ๆ ที่เกี่ยวข้อง (ข้อความรวม/สรุป)
  strategicSection2?: StrategicSection2; // รายละเอียดเจาะจง 2.1 - 2.7

  // ส่วนที่ 3: รายละเอียดโครงการ
  rationale?: string; // หลักการและเหตุผล
  objectives: string[]; // วัตถุประสงค์
  targetGroup?: string; // กลุ่มเป้าหมาย
  targetArea?: string; // พื้นที่ดำเนินงาน
  expectedOutputs: string[]; // ผลผลิตของโครงการ
  expectedOutcomes: string[]; // ผลลัพธ์ของโครงการ
  expectedBenefits?: string[]; // ผลที่คาดว่าจะเกิดขึ้นหรือได้รับ
  indicators: ProjectIndicator[]; // ตัวชี้วัดความสำเร็จของโครงการ
  activities: ProjectActivity[];

  // ส่วนที่ 4: แผนการดำเนินงานและการใช้จ่ายงบประมาณ (มาตรการเร่งรัด มติ ครม. 21 ต.ค. 2568)
  monthlyBudgetPlan?: MonthlyBudgetPlan[]; // แผนรายเดือน (Q1=38%, Q2=61%, Q3=81%, Q4=100%)
  investmentCommitmentQ1?: number; // แผนก่อหนี้ผูกพันงบลงทุนในไตรมาสที่ 1
  
  budgetAllocated: number; // งบที่ได้รับจัดสรร
  budgetSpent: number; // งบเบิกจ่ายจริง
  budgetCommitted?: number; // ก่อหนี้ผูกพัน (PO/สัญญา)
  
  progressPercent: number; // 0 - 100
  status: ProjectStatus;
  startDate: string; // e.g. '2025-10-01'
  endDate: string; // e.g. '2026-09-30'
  timeframeText: string; // e.g. 'ธันวาคม 2568 ถึงกันยายน 2569'
  
  lastReportRound?: string; // e.g. 'รอบ 2 เดือน (ก.พ. - มี.ค. 69)'
  lastReportDate?: string;
  
  // Baseline Lock & Regulations Approval Control
  isBaselineLocked?: boolean; // ล็อกข้อมูลโครงการตั้งต้นตามแผนปฏิบัติการที่ได้รับความเห็นชอบ
  unlockedForEdit?: boolean; // ปลดล็อกให้แก้ไขเมื่อได้รับอนุมัติตามระเบียบ
  unlockReason?: string; // เลขที่หนังสืออนุมัติหรือเหตุผลที่ Admin เปิดสิทธิ์
  lastRemindedAt?: string; // วันที่ส่งแจ้งเตือนรายงานผลล่าสุด
  reminderCount?: number; // จำนวนครั้งที่ส่งแจ้งเตือนซ้ำ

  // เอกสารแนบ ( (1) แบบฟอร์มขอรับการจัดสรรงบประมาณ (2) แบบฟอร์มข้อเสนอโครงการเชิงยุทธศาสตร์ )
  attachments?: ProjectAttachment[];

  // Tag / Notes
  notes?: string;
  updatedAt: string;
}

