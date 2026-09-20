import { NHRCUnit, ResponsiblePerson } from './project';

export type ReportRound =
  | 'round_1' // รอบที่ 1: ต.ค. - พ.ย.
  | 'round_2' // รอบที่ 2: ธ.ค. - ม.ค.
  | 'round_3' // รอบที่ 3: ก.พ. - มี.ค. (รอบ 6 เดือนแรก)
  | 'round_4' // รอบที่ 4: เม.ย. - พ.ค.
  | 'round_5' // รอบที่ 5: มิ.ย. - ก.ค.
  | 'round_6'; // รอบที่ 6: ส.ค. - ก.ย. (สิ้นปีงบประมาณ)

export interface ReportRoundInfo {
  code: ReportRound;
  label: string;
  shortLabel: string;
  periodText: string;
  dueMonthText: string;
}

export const REPORT_ROUNDS: Record<ReportRound, ReportRoundInfo> = {
  round_1: {
    code: 'round_1',
    label: 'รอบที่ 1 (ตุลาคม - พฤศจิกายน)',
    shortLabel: 'รอบ 1 (ต.ค.-พ.ย.)',
    periodText: '1 ตุลาคม ถึง 30 พฤศจิกายน',
    dueMonthText: 'ภายในวันที่ 5 ธันวาคม'
  },
  round_2: {
    code: 'round_2',
    label: 'รอบที่ 2 (ธันวาคม - มกราคม)',
    shortLabel: 'รอบ 2 (ธ.ค.-ม.ค.)',
    periodText: '1 ธันวาคม ถึง 31 มกราคม',
    dueMonthText: 'ภายในวันที่ 5 กุมภาพันธ์'
  },
  round_3: {
    code: 'round_3',
    label: 'รอบที่ 3 (กุมภาพันธ์ - มีนาคม / รอบ 6 เดือน)',
    shortLabel: 'รอบ 3 (ก.พ.-มี.ค.)',
    periodText: '1 ตุลาคม ถึง 31 มีนาคม',
    dueMonthText: 'ภายในวันที่ 5 เมษายน'
  },
  round_4: {
    code: 'round_4',
    label: 'รอบที่ 4 (เมษายน - พฤษภาคม)',
    shortLabel: 'รอบ 4 (เม.ย.-พ.ค.)',
    periodText: '1 เมษายน ถึง 31 พฤษภาคม',
    dueMonthText: 'ภายในวันที่ 5 มิถุนายน'
  },
  round_5: {
    code: 'round_5',
    label: 'รอบที่ 5 (มิถุนายน - กรกฎาคม)',
    shortLabel: 'รอบ 5 (มิ.ย.-ก.ค.)',
    periodText: '1 มิถุนายน ถึง 31 กรกฎาคม',
    dueMonthText: 'ภายในวันที่ 5 สิงหาคม'
  },
  round_6: {
    code: 'round_6',
    label: 'รอบที่ 6 (สิงหาคม - กันยายน / สิ้นปีงบประมาณ)',
    shortLabel: 'รอบ 6 (ส.ค.-ก.ย.)',
    periodText: '1 ตุลาคม ถึง 30 กันยายน',
    dueMonthText: 'ภายในวันที่ 5 ตุลาคม'
  }
};

export interface ProgressActivityRow {
  activityId: string;
  name: string;
  status: 'completed' | 'in_progress' | 'not_started';
  plannedBudget: number;
  actualSpent: number;
  asOfDateText: string; // e.g. 'ณ วันที่ 28 สิงหาคม'
}

export interface ProgressActivityDetail {
  activityNumberText: string; // เช่น 'กิจกรรมที่ 1'
  activityTitle: string;
  detailDescription: string;
  targetPlan: string; // เช่น '30 คน'
  targetActual: string; // เช่น '50 คน'
}

export interface ProgressObjectiveRow {
  type: 'objective' | 'output' | 'outcome' | 'expected_benefit' | 'indicator';
  label: string; // เช่น 'วัตถุประสงค์โครงการ' หรือ 'เป้าหมายผลผลิต'
  targetText: string;
  progressText: string;
}

export interface ProgressPolicyRow {
  policyTitle: string; // เช่น 'นโยบายของ กสม. พ.ศ. 2567'
  progressDescription: string;
}

export interface ProgressObstacleRow {
  obstacle: string;
  solution: string;
}

export interface ProgressReport {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  fiscalYear: number; // 2569
  division: NHRCUnit;
  round: ReportRound;
  reportDate: string; // e.g. '2026-08-28'
  asOfDateText: string; // e.g. 'ณ วันที่ 28 สิงหาคม 2569'
  
  // ส่วนที่ 1 : ข้อมูลพื้นฐานโครงการเชิงยุทธศาสตร์
  section1: {
    projectName: string;
    activityCode: string;
    allocatedBudget: number;
    timeframeText: string;
    divisionFullName: string;
  };

  // ส่วนที่ 2 : ผลสัมฤทธิ์จากการดำเนินงาน
  // 2.1 ผลการดำเนินงานและการใช้จ่ายงบประมาณ
  section2_1: ProgressActivityRow[];
  
  // 2.2 ผลการดำเนินงานของแต่ละกิจกรรม
  section2_2: ProgressActivityDetail[];
  
  // 2.3 ผลการดำเนินการตามวัตถุประสงค์และผลสัมฤทธิ์เปรียบเทียบกับเป้าหมาย
  section2_3: ProgressObjectiveRow[];

  // ส่วนที่ 3 : การดำเนินงานตามนโยบายของ กสม.
  section3: ProgressPolicyRow[];

  // ส่วนที่ 4 / 5 : ปัญหาอุปสรรค หรือข้อจำกัด และแนวทางการแก้ไข หรือข้อเสนอแนะ
  section4_5: ProgressObstacleRow[];

  // ส่วนที่ 6 : ผู้รับผิดชอบ/ผู้ประสานงาน
  section6: ResponsiblePerson;

  status: 'draft' | 'submitted' | 'approved';
  createdAt: string;
  updatedAt: string;
}
