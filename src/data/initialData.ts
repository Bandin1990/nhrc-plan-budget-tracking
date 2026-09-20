import { Project } from '../types/project';
import { ProgressReport } from '../types/progress';
import { OfficialMemoData } from '../types/budget';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_68O1_13314',
    code: '68O1-13314',
    name: 'โครงการติดตามข้อมติสมัชชาสิทธิมนุษยชนของปีงบประมาณ พ.ศ. 2568 ประเด็นสิทธิในสิ่งแวดล้อมที่ดี',
    fiscalYear: 2569,
    programCode: 'O',
    division: 'สนย.',
    subDivision: 'กลุ่มวิจัยและวิชาการสิทธิมนุษยชน',
    responsiblePerson: {
      name: 'นายบัณฑิต หอมเกษ',
      position: 'นักวิชาการสิทธิมนุษยชนชำนาญการ',
      division: 'สนย.',
      subDivision: 'กลุ่มวิจัยและวิชาการสิทธิมนุษยชน',
      phone: '02 141 3857',
      email: 'bandit.nhrc@gmail.com'
    },
    isStrategic: true,
    strategicPillar: 3,
    budgetAllocated: 260000,
    budgetSpent: 41400,
    progressPercent: 85,
    status: 'IN_PROGRESS',
    startDate: '2025-12-01',
    endDate: '2026-09-30',
    timeframeText: 'เดือนธันวาคม 2568 ถึงกันยายน 2569',
    objectives: [
      'เพื่อติดตามและขับเคลื่อนข้อเสนอแนะตามมติสมัชชาสิทธิมนุษยชน ประเด็นสิทธิในสิ่งแวดล้อมที่ดี',
      'เพื่อผลิตและเผยแพร่องค์ความรู้ด้านสิทธิในสิ่งแวดล้อมที่ดี',
      'เพื่อสร้างพื้นที่การมีส่วนร่วมของภาคส่วนต่าง ๆ ในการขับเคลื่อนปฏิญญาอาเซียนว่าด้วยสิทธิในสิ่งแวดล้อมที่ปลอดภัย สะอาด ดีต่อสุขภาพ และยั่งยืน'
    ],
    expectedOutputs: [
      'สื่อความรู้ในรูปแบบหนังสืออิเล็กทรอนิกส์ (e-book) ด้านสิทธิในสิ่งแวดล้อมที่ดี เสร็จสมบูรณ์และเผยแพร่ออนไลน์อย่างน้อย 1 เรื่อง/เล่ม',
      'ร่างกรอบแนวทางหรือข้อเสนอแนะเชิงเนื้อหาสำหรับการจัดทำแผนปฏิบัติการระดับชาติตามปฏิญญาอาเซียนฯ 1 ฉบับ'
    ],
    expectedOutcomes: [
      'ข้อเสนอแนะตามมติสมัชชาสิทธิมนุษยชนได้รับการผลักดันเข้าสู่กระบวนการพิจารณาของรัฐสภาและหน่วยงานที่เกี่ยวข้อง'
    ],
    indicators: [
      {
        id: 'ind_1',
        title: 'ข้อเสนอแนะได้รับการบรรจุเข้าสู่วาระการพิจารณาของรัฐสภา/คณะทำงาน',
        target: 'อย่างน้อย 2 เรื่อง (พรบ.อากาศสะอาด และ กม.ทรัพยากรน้ำ)',
        actual: 'พรบ.อากาศสะอาด ผ่านวุฒิสภา 145 เสียงแล้ว',
        status: 'achieved'
      },
      {
        id: 'ind_2',
        title: 'สื่อความรู้ e-book เผยแพร่ออนไลน์',
        target: 'อย่างน้อย 1 เล่ม',
        actual: 'e-book การบริหารจัดการทรัพยากรน้ำ เผยแพร่แล้ว',
        status: 'achieved'
      }
    ],
    activities: [
      {
        id: 'act_1',
        code: '1',
        name: 'การประชุม/สัมมนาเพื่อขับเคลื่อนข้อเสนอแนะตามมติสมัชชาสิทธิมนุษยชน ประเด็นสิทธิในสิ่งแวดล้อมที่ดี',
        timeframe: 'ธ.ค. 68',
        plannedBudget: 21500,
        actualSpent: 11500,
        status: 'completed',
        targetDescription: 'แผน 30 คน ผล 50 คน',
        actualResultDescription: 'จัดสัมมนา "ลมหายใจคือชีวิต: ปลดล็อกความเข้าใจผิดร่าง พ.ร.บ.อากาศสะอาด" ณ คณะนิติศาสตร์ จุฬาฯ'
      },
      {
        id: 'act_2',
        code: '2',
        name: 'การผลิตสื่อหรือเอกสารความรู้เพื่อสนับสนุนการขับเคลื่อนมติสมัชชาฯ (e-book)',
        timeframe: 'ม.ค. - เม.ย. 69',
        plannedBudget: 30000,
        actualSpent: 29900,
        status: 'completed',
        targetDescription: 'แผน 1 เรื่อง ผล 1 เรื่อง',
        actualResultDescription: 'จัดทำ e-book เรื่อง “สิทธิในสิ่งแวดล้อมที่ดี: การบริหารจัดการทรัพยากรน้ำ” เผยแพร่ผ่านระบบออนไลน์'
      },
      {
        id: 'act_3',
        code: '3',
        name: 'การประชุมเชิงปฏิบัติการเพื่อขับเคลื่อนแผนปฏิบัติการตามปฏิญญาอาเซียนว่าด้วยสิทธิในสิ่งแวดล้อมฯ',
        timeframe: 'ก.พ. - ส.ค. 69',
        plannedBudget: 157500,
        actualSpent: 0,
        status: 'in_progress',
        targetDescription: 'แผน 45 คน ผลอยู่ระหว่างรวบรวม',
        actualResultDescription: 'จัดประชุมร่วมกับ ทส., ผู้แทนไทยใน AICHR และ OHCHR วันที่ 20-21 สิงหาคม 2569 ณ โรงแรม ที.เค. พาเลซ'
      }
    ],
    lastReportRound: 'รอบ 6 (ส.ค. - ก.ย. 69)',
    lastReportDate: '2026-08-28',
    updatedAt: '2026-08-28T10:30:00Z'
  },
  {
    id: 'proj_hrep_69',
    code: '69M1-13101',
    name: 'โครงการสร้างเสริมความตระหนักด้านสิทธิมนุษยชนสำหรับนักบริหารระดับสูง (Human Rights Executive Program: HREP)',
    fiscalYear: 2569,
    programCode: 'M_T',
    division: 'สสค.',
    subDivision: 'กลุ่มงานส่งเสริมสิทธิมนุษยชน',
    responsiblePerson: {
      name: 'นายสมเกียรติ สิทธิคุณ',
      position: 'นักวิชาการสิทธิมนุษยชนชำนาญการพิเศษ',
      division: 'สสค.',
      subDivision: 'กลุ่มงานส่งเสริมสิทธิมนุษยชน',
      phone: '02 141 3920',
      email: 'somkiat.nhrc@gmail.com'
    },
    isStrategic: true,
    strategicPillar: 1,
    budgetAllocated: 4800000,
    budgetSpent: 4800000,
    progressPercent: 100,
    status: 'COMPLETED',
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    timeframeText: 'ตุลาคม 2568 ถึงกันยายน 2569',
    objectives: [
      'สร้างความตระหนักและองค์ความรู้ด้านสิทธิมนุษยชนแก่ผู้บริหารระดับสูงภาครัฐและเอกชน'
    ],
    expectedOutputs: ['นักบริหารระดับสูงผ่านการอบรม 60 คน'],
    expectedOutcomes: ['หน่วยงานระดับกระทรวงนำหลักสิทธิมนุษยชนไปประยุกต์ใช้นโยบายองค์กร'],
    indicators: [
      {
        id: 'ind_hrep_1',
        title: 'จำนวนผู้บริหารระดับสูงที่ผ่านการอบรม',
        target: '60 คน',
        actual: '64 คน',
        status: 'achieved'
      }
    ],
    activities: [
      {
        id: 'act_hrep_1',
        name: 'การจัดฝึกอบรมหลักสูตร HREP รุ่นที่ 4',
        timeframe: 'ม.ค. - ส.ค. 69',
        plannedBudget: 4800000,
        actualSpent: 4800000,
        status: 'completed',
        targetDescription: '60 คน',
        actualResultDescription: 'ดำเนินการอบรมครบทั้ง 12 สัปดาห์ และจัดพิธีมอบประกาศนียบัตร'
      }
    ],
    lastReportRound: 'รอบ 5 (มิ.ย. - ก.ค. 69)',
    lastReportDate: '2026-07-25',
    updatedAt: '2026-07-25T14:00:00Z'
  },
  {
    id: 'proj_zoom_conf',
    code: '69M4-71006',
    name: 'ค่าเช่าบริการโปรแกรม Zoom Video Conference',
    fiscalYear: 2569,
    programCode: 'M_T',
    division: 'สดส.',
    subDivision: 'กลุ่มงานคอมพิวเตอร์และระบบเครือข่าย',
    responsiblePerson: {
      name: 'นายฉัตรชัย นวัตกรรม',
      position: 'นักวิชาการคอมพิวเตอร์ชำนาญการ',
      division: 'สดส.',
      subDivision: 'กลุ่มงานคอมพิวเตอร์และระบบเครือข่าย',
      phone: '02 141 3811',
      email: 'chatchai.nhrc@gmail.com'
    },
    isStrategic: false,
    budgetAllocated: 193135, // เดิม 160,000 + รับโอน 33,135
    budgetSpent: 160000,
    progressPercent: 90,
    status: 'IN_PROGRESS',
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    timeframeText: 'ตุลาคม 2568 ถึงกันยายน 2569',
    objectives: [
      'เพื่อสนับสนุนการเข้าร่วมประชุมหรือการสัมมนาของ กสม. ผู้บริหาร และเจ้าหน้าที่สำนักงาน กสม. ผ่านระบบออนไลน์'
    ],
    expectedOutputs: ['ห้องประชุมออนไลน์ Zoom เพิ่มเติมรองรับ 4 สำนักใหม่'],
    expectedOutcomes: ['การสื่อสารทางไกลมีประสิทธิภาพ ไม่สะดุด'],
    indicators: [
      {
        id: 'ind_zoom_1',
        title: 'ความพร้อมใช้งานของห้องประชุมออนไลน์',
        target: '100%',
        actual: '100%',
        status: 'achieved'
      }
    ],
    activities: [
      {
        id: 'act_zoom_1',
        name: 'จัดเช่าบริการ Zoom Video Conference รายปี และขยายห้องประชุมรองรับส่วนราชการใหม่',
        timeframe: 'ต.ค. 68 - ก.ย. 69',
        plannedBudget: 193135,
        actualSpent: 160000,
        status: 'in_progress',
        actualResultDescription: 'จัดซื้อส่วนเสริม License เพิ่ม 4 ห้องประชุมสำหรับสำนักใหม่'
      }
    ],
    notes: 'ได้รับโอนงบประมาณเพิ่มเติม 33,135.00 บาท ตามบันทึก สม 0302/2351',
    updatedAt: '2026-07-22T09:00:00Z'
  },
  {
    id: 'proj_cleaning_guard',
    code: '69T4-71016',
    name: 'ค่าจ้างเหมาบริการงานอาคารสถานที่ (รักษาความสะอาดและรักษาความปลอดภัย)',
    fiscalYear: 2569,
    programCode: 'M_T',
    division: 'สบก.',
    subDivision: 'กลุ่มงานบริหารทั่วไป',
    responsiblePerson: {
      name: 'นางวรรณี ปฏิบัติงาน',
      position: 'เจ้าพนักงานธุรการอาวุโส',
      division: 'สบก.',
      subDivision: 'กลุ่มงานบริหารทั่วไป',
      phone: '02 141 3701',
      email: 'wannee.nhrc@gmail.com'
    },
    isStrategic: false,
    budgetAllocated: 4206937, // เดิม 4,240,072 - โอนออก 33,135
    budgetSpent: 3624000,
    progressPercent: 88,
    status: 'IN_PROGRESS',
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    timeframeText: 'ตุลาคม 2568 ถึงกันยายน 2569',
    objectives: [
      'เพื่อดูแลรักษาความสะอาดและความปลอดภัยของอาคารสำนักงาน กสม.'
    ],
    expectedOutputs: ['บริการรักษาความปลอดภัย 24 ชม. และทำความสะอาดเรียบร้อย'],
    expectedOutcomes: ['สภาพแวดล้อมปลอดภัย ถูกสุขลักษณะ'],
    indicators: [],
    activities: [
      {
        id: 'act_clean_1',
        name: 'จ้างเหมาบริการรักษาความปลอดภัยและทำความสะอาดรายเดือน',
        timeframe: 'ต.ค. 68 - ก.ย. 69',
        plannedBudget: 4206937,
        actualSpent: 3624000,
        status: 'in_progress',
        actualResultDescription: 'เบิกจ่ายตามงวดสัญญาจ้างทุกสิ้นเดือน'
      }
    ],
    notes: 'โอนงบเหลือจ่ายจากการก่อหนี้ผูกพัน 33,135.00 บาท ไปยัง Zoom สดส.',
    updatedAt: '2026-07-22T09:00:00Z'
  },
  {
    id: 'proj_south_border',
    code: '69S1-13101',
    name: 'โครงการสร้างเสริมความเข้มแข็งและความตระหนักถึงความสำคัญของสิทธิมนุษยชนในพื้นที่จังหวัดชายแดนภาคใต้',
    fiscalYear: 2569,
    programCode: 'S1',
    division: 'สนง.ภาคใต้',
    subDivision: 'กลุ่มงานส่งเสริมและเฝ้าระวังสถานการณ์สิทธิมนุษยชน',
    responsiblePerson: {
      name: 'นายอับดุลเลาะห์ สมานมิตร',
      position: 'นักวิชาการสิทธิมนุษยชนชำนาญการ',
      division: 'สนง.ภาคใต้',
      subDivision: 'กลุ่มงานส่งเสริมและเฝ้าระวังสถานการณ์สิทธิมนุษยชน',
      phone: '074 311 222',
      email: 'abdullah.south@nhrc.or.th'
    },
    isStrategic: true,
    strategicPillar: 1,
    budgetAllocated: 2630000,
    budgetSpent: 1780000,
    progressPercent: 75,
    status: 'IN_PROGRESS',
    startDate: '2025-11-01',
    endDate: '2026-09-30',
    timeframeText: 'พฤศจิกายน 2568 ถึงกันยายน 2569',
    objectives: [
      'เสริมสร้างสันติสุขและความเข้าใจในหลักสิทธิมนุษยชนแก่เจ้าหน้าที่รัฐและเครือข่ายพุทธ-มุสลิมในพื้นที่ชายแดนใต้'
    ],
    expectedOutputs: ['เจ้าหน้าที่รัฐและผู้นำชุมชนได้รับการอบรม 300 คน'],
    expectedOutcomes: ['ลดเรื่องร้องเรียนการละเมิดสิทธิในพื้นที่'],
    indicators: [
      {
        id: 'ind_south_1',
        title: 'ตัวแทนภาคประชาชนและเจ้าหน้าที่รัฐได้รับความรู้สิทธิมนุษยชน',
        target: '300 คน',
        actual: '245 คน',
        status: 'on_track'
      }
    ],
    activities: [
      {
        id: 'act_s_1',
        name: 'สร้างมาตรฐานการปฏิบัติงานตามหลักสิทธิมนุษยชนให้กับเจ้าหน้าที่รัฐ',
        timeframe: 'ธ.ค. 68 - ส.ค. 69',
        plannedBudget: 1780000,
        actualSpent: 1330000,
        status: 'in_progress'
      },
      {
        id: 'act_s_2',
        name: 'พัฒนาศักยภาพเครือข่ายพุทธศาสนิกชนและผู้นำชุมชนในพื้นที่',
        timeframe: 'มี.ค. - ก.ค. 69',
        plannedBudget: 850000,
        actualSpent: 450000,
        status: 'in_progress'
      }
    ],
    lastReportRound: 'รอบ 4 (เม.ย. - พ.ค. 69)',
    lastReportDate: '2026-05-30',
    updatedAt: '2026-05-30T16:00:00Z'
  },
  {
    id: 'proj_data_gov',
    code: '69D2-23403',
    name: 'โครงการบริหารจัดการข้อมูลของสำนักงาน กสม. ตามหลักธรรมาภิบาลข้อมูลภาครัฐ (Data Governance)',
    fiscalYear: 2569,
    programCode: 'D2',
    division: 'สดส.',
    subDivision: 'กลุ่มงานพัฒนาระบบสารสนเทศและฐานข้อมูล',
    responsiblePerson: {
      name: 'นายฉัตรชัย นวัตกรรม',
      position: 'นักวิชาการคอมพิวเตอร์ชำนาญการ',
      division: 'สดส.',
      subDivision: 'กลุ่มงานพัฒนาระบบสารสนเทศและฐานข้อมูล',
      phone: '02 141 3811',
      email: 'chatchai.nhrc@gmail.com'
    },
    isStrategic: true,
    strategicPillar: 4,
    budgetAllocated: 2000000,
    budgetSpent: 2000000,
    progressPercent: 100,
    status: 'COMPLETED',
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    timeframeText: 'ตุลาคม 2568 ถึงกันยายน 2569',
    objectives: [
      'จัดทำกรอบธรรมาภิบาลข้อมูลและจัดหมวดหมู่ชุดข้อมูลเปิดภาครัฐของ กสม.'
    ],
    expectedOutputs: ['เอกสารนโยบาย Data Governance และ Data Catalog 1 ระบบ'],
    expectedOutcomes: ['ยกระดับคะแนนการประเมินองค์กรดิจิทัล'],
    indicators: [
      {
        id: 'ind_dg_1',
        title: 'ความสำเร็จในการประกาศใช้นโยบายธรรมาภิบาลข้อมูล',
        target: '100%',
        actual: '100%',
        status: 'achieved'
      }
    ],
    activities: [
      {
        id: 'act_dg_1',
        name: 'จัดจ้างที่ปรึกษาจัดทำกรอบ Data Governance และจัดทำบัญชีข้อมูล (Data Catalog)',
        timeframe: 'ต.ค. 68 - มิ.ย. 69',
        plannedBudget: 2000000,
        actualSpent: 2000000,
        status: 'completed'
      }
    ],
    lastReportRound: 'รอบ 5 (มิ.ย. - ก.ค. 69)',
    lastReportDate: '2026-07-20',
    updatedAt: '2026-07-20T11:00:00Z'
  },
  {
    id: 'proj_opcat',
    code: '69O1-13312',
    name: 'โครงการพัฒนากลไกการตรวจเยี่ยมเชิงป้องกันตามมาตรฐาน OPCAT',
    fiscalYear: 2569,
    programCode: 'O',
    division: 'สรส.',
    subDivision: 'กลุ่มงานตรวจเยี่ยมสถานที่ควบคุมตัวและการป้องกันการทรมาน',
    responsiblePerson: {
      name: 'พันตำรวจโท สุรศักดิ์ คุ้มครอง',
      position: 'นักวิชาการสิทธิมนุษยชนชำนาญการพิเศษ',
      division: 'สรส.',
      subDivision: 'กลุ่มงานตรวจเยี่ยมสถานที่ควบคุมตัวและการป้องกันการทรมาน',
      phone: '02 141 3888',
      email: 'surasak.opcat@nhrc.or.th'
    },
    isStrategic: true,
    strategicPillar: 3,
    budgetAllocated: 8500000,
    budgetSpent: 5776000,
    progressPercent: 70,
    status: 'IN_PROGRESS',
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    timeframeText: 'ตุลาคม 2568 ถึงกันยายน 2569',
    objectives: [
      'ตรวจเยี่ยมสถานที่ควบคุมตัว 15 แห่งเพื่อป้องกันการทรมานตามมาตรฐานอนุสัญญา CAT/OPCAT'
    ],
    expectedOutputs: ['รายงานการตรวจเยี่ยมสถานที่ควบคุมตัวและข้อเสนอแนะเชิงนโยบาย'],
    expectedOutcomes: ['สถานที่ควบคุมตัวปฏิบัติตามมาตรฐานสากล'],
    indicators: [
      {
        id: 'ind_opcat_1',
        title: 'การตรวจเยี่ยมสถานที่ควบคุมตัว',
        target: '15 แห่ง',
        actual: '11 แห่ง',
        status: 'on_track'
      }
    ],
    activities: [
      {
        id: 'act_opcat_1',
        name: 'การตรวจเยี่ยมเชิงป้องกันตามกลุ่มเป้าหมาย (เรือนจำ สถานกักขัง สถานีตำรวจ)',
        timeframe: 'ต.ค. 68 - ก.ย. 69',
        plannedBudget: 2454750,
        actualSpent: 1800000,
        status: 'in_progress'
      },
      {
        id: 'act_opcat_2',
        name: 'การฝึกอบรมเชิงปฏิบัติการเจ้าหน้าที่ผู้ปฏิบัติงานในพื้นที่',
        timeframe: 'ก.พ. - ส.ค. 69',
        plannedBudget: 3321600,
        actualSpent: 2500000,
        status: 'in_progress'
      }
    ],
    lastReportRound: 'รอบ 4 (เม.ย. - พ.ค. 69)',
    lastReportDate: '2026-05-28',
    updatedAt: '2026-05-28T15:00:00Z'
  },
  {
    id: 'proj_law_reform',
    code: '69O3-33301',
    name: 'โครงการจัดทำข้อเสนอแนะมาตรการหรือแนวทางในการส่งเสริมและคุ้มครองสิทธิมนุษยชน และแก้ไขปรับปรุงกฎหมาย',
    fiscalYear: 2569,
    programCode: 'O',
    division: 'สกม.',
    subDivision: 'กลุ่มงานเสนอแนะ/การแก้ไขปรับปรุงกฎหมาย 1',
    responsiblePerson: {
      name: 'นายกิตติศักดิ์ นิติกรรม',
      position: 'นิติกรชำนาญการพิเศษ',
      division: 'สกม.',
      subDivision: 'กลุ่มงานเสนอแนะ/การแก้ไขปรับปรุงกฎหมาย 1',
      phone: '02 141 3830',
      email: 'kittisak.law@nhrc.or.th'
    },
    isStrategic: true,
    strategicPillar: 3,
    budgetAllocated: 7105000,
    budgetSpent: 4200000,
    progressPercent: 65,
    status: 'IN_PROGRESS',
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    timeframeText: 'ตุลาคม 2568 ถึงกันยายน 2569',
    objectives: [
      'ศึกษา วิจัย และยกร่างข้อเสนอแนะแก้ไขกฎหมายที่กระทบต่อสิทธิและเสรีภาพของประชาชน'
    ],
    expectedOutputs: ['ข้อเสนอแนะต่อรัฐสภาและคณะรัฐมนตรีอย่างน้อย 7 เรื่อง'],
    expectedOutcomes: ['กฎหมายได้รับการแก้ไขปรับปรุงให้สอดคล้องกับหลักสิทธิมนุษยชน'],
    indicators: [
      {
        id: 'ind_law_1',
        title: 'จำนวนข้อเสนอแนะในการแก้ไขปรับปรุงกฎหมาย',
        target: '7 เรื่อง',
        actual: '5 เรื่อง',
        status: 'on_track'
      }
    ],
    activities: [
      {
        id: 'act_law_1',
        name: 'การประชุมรับฟังความคิดเห็นจากผู้มีส่วนได้ส่วนเสียและนักวิชาการ',
        timeframe: 'ต.ค. 68 - ก.ย. 69',
        plannedBudget: 3336000,
        actualSpent: 2100000,
        status: 'in_progress'
      }
    ],
    lastReportRound: 'รอบ 4 (เม.ย. - พ.ค. 69)',
    lastReportDate: '2026-05-25',
    updatedAt: '2026-05-25T14:30:00Z'
  },
  {
    id: 'proj_tqa_69',
    code: '69D2-23402',
    name: 'โครงการพัฒนาคุณภาพระบบงานของสำนักงาน กสม. สู่ความเป็นเลิศ (TQA)',
    fiscalYear: 2569,
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
    strategicPillar: 4,
    budgetAllocated: 200000,
    budgetSpent: 100000,
    progressPercent: 50,
    status: 'IN_PROGRESS',
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    timeframeText: 'ตุลาคม 2568 ถึงกันยายน 2569',
    objectives: [
      'สมัครเข้ารับการประเมินคุณภาพองค์กรตามเกณฑ์ TQA Smart-EX และจัดประชุมถ่ายทอดผลประเมิน'
    ],
    expectedOutputs: ['รายงานการประเมินตนเอง (SAR) และรายงานผลป้อนกลับจากคณะกรรมการ TQA'],
    expectedOutcomes: ['องค์กรมีระบบบริหารจัดการเทียบเคียงมาตรฐานสากล'],
    indicators: [
      {
        id: 'ind_tqa_1',
        title: 'ระดับความสำเร็จการพัฒนาองค์กรตามเกณฑ์ TQA',
        target: 'ระดับ 4',
        actual: 'อยู่ระหว่างตรวจประเมิน',
        status: 'on_track'
      }
    ],
    activities: [
      {
        id: 'act_tqa_1',
        name: 'สมัครเข้ารับการตรวจประเมินองค์กร TQA smart – EX: Intermediate',
        timeframe: 'ต.ค. 68 - ธ.ค. 68',
        plannedBudget: 150000,
        actualSpent: 100000,
        status: 'completed'
      },
      {
        id: 'act_tqa_2',
        name: 'จัดประชุมถ่ายทอดผลการประเมินองค์กรและแนวทางพัฒนาในอนาคต',
        timeframe: 'ก.ค. 69 - ก.ย. 69',
        plannedBudget: 50000,
        actualSpent: 0,
        status: 'not_started'
      }
    ],
    lastReportRound: 'รอบ 2 (ธ.ค. - ม.ค. 69)',
    lastReportDate: '2026-01-30',
    updatedAt: '2026-01-30T10:00:00Z'
  },
  {
    id: 'proj_esan_69',
    code: '69A2-23101',
    name: 'โครงการส่งเสริมสิทธิมนุษยชนเพื่อสร้างสรรค์วัฒนธรรมการเคารพสิทธิมนุษยชนในพื้นที่ภาคตะวันออกเฉียงเหนือ',
    fiscalYear: 2569,
    programCode: 'A',
    division: 'สนง.ภาคอีสาน',
    subDivision: 'กลุ่มงานส่งเสริมและเฝ้าระวังสถานการณ์สิทธิมนุษยชน',
    responsiblePerson: {
      name: 'นายประสิทธิ์ ภูมิลำเนา',
      position: 'นักวิชาการสิทธิมนุษยชนชำนาญการ',
      division: 'สนง.ภาคอีสาน',
      subDivision: 'กลุ่มงานส่งเสริมและเฝ้าระวังสถานการณ์สิทธิมนุษยชน',
      phone: '043 241 111',
      email: 'prasit.esan@nhrc.or.th'
    },
    isStrategic: true,
    strategicPillar: 1,
    budgetAllocated: 1115900,
    budgetSpent: 650000,
    progressPercent: 60,
    status: 'IN_PROGRESS',
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    timeframeText: 'ตุลาคม 2568 ถึงกันยายน 2569',
    objectives: [
      'ส่งเสริมวัฒนธรรมสิทธิมนุษยชนและจัดกิจกรรม กสม. อีสานสัญจร'
    ],
    expectedOutputs: ['เวทีสัญจร 1 ครั้ง และประกวดสื่อสร้างสรรค์ 1 โครงการ'],
    expectedOutcomes: ['ประชาชนใน 20 จังหวัดภาคอีสานตระหนักถึงสิทธิชุมชน'],
    indicators: [],
    activities: [
      {
        id: 'act_es_1',
        name: 'สัมมนาเชิงปฏิบัติการเพื่อขับเคลื่อนและแก้ปัญหา (กสม. อีสานสัญจร)',
        timeframe: 'เม.ย. - ส.ค. 69',
        plannedBudget: 452100,
        actualSpent: 452100,
        status: 'completed'
      },
      {
        id: 'act_es_2',
        name: 'ประกวดสื่อสร้างสรรค์เพื่อความตระหนักด้านสิทธิมนุษยชน',
        timeframe: 'มิ.ย. - ก.ย. 69',
        plannedBudget: 50000,
        actualSpent: 0,
        status: 'in_progress'
      }
    ],
    lastReportRound: 'รอบ 4 (เม.ย. - พ.ค. 69)',
    lastReportDate: '2026-05-20',
    updatedAt: '2026-05-20T10:00:00Z'
  },
  // ===================== โครงการปีงบประมาณ พ.ศ. 2570 (คำของบประมาณล่วงหน้า) =====================
  {
    id: 'proj_70O1_10001',
    code: '70O1-10001',
    name: 'โครงการพัฒนานวัตกรรมระบบดิจิทัลเพื่อการรับเรื่องร้องเรียนและการคุ้มครองสิทธิมนุษยชน',
    fiscalYear: 2570,
    programCode: 'O',
    division: 'สนย.',
    subDivision: 'กลุ่มงานพัฒนาระบบบริหารและติดตามประเมินผล',
    responsiblePerson: {
      name: 'นายเฉลิมชัย ระบบสารสนเทศ',
      position: 'นักวิชาการคอมพิวเตอร์ชำนาญการ',
      division: 'สนย.',
      subDivision: 'กลุ่มงานพัฒนาระบบบริหารและติดตามประเมินผล',
      phone: '02 141 3801',
      email: 'chalermchai.it@nhrc.or.th'
    },
    isStrategic: true,
    strategicPillar: 1,
    budgetAllocated: 1850000,
    budgetSpent: 0,
    progressPercent: 0,
    status: 'NOT_STARTED',
    startDate: '2026-10-01',
    endDate: '2027-09-30',
    timeframeText: 'ตุลาคม 2569 ถึงกันยายน 2570',
    objectives: [
      'เพื่อพัฒนาระบบบริหารจัดการเรื่องร้องเรียนออนไลน์รองรับประชาชนทั่วประเทศ',
      'เพื่อยกระดับความมั่นคงปลอดภัยสารสนเทศตามเกณฑ์มาตรฐานสากล'
    ],
    expectedOutputs: ['ระบบรับเรื่องร้องเรียนเวอร์ชันใหม่ 1 ระบบ'],
    expectedOutcomes: ['ประชาชนเข้าถึงการร้องเรียนละเมิดสิทธิได้สะดวกรวดเร็วขึ้น'],
    indicators: [
      {
        id: 'ind_70_1',
        title: 'ระบบเปิดใช้งานได้ตามกำหนดการ',
        target: '1 ระบบ',
        actual: 'อยู่ระหว่างตั้งคำของบประมาณ',
        status: 'on_track'
      }
    ],
    activities: [
      {
        id: 'act_70_1',
        code: '1',
        name: 'กิจกรรมที่ 1 : ศึกษา ออกแบบ และจัดทำสถาปัตยกรรมระบบดิจิทัล',
        plannedPercent: 40,
        timeframe: 'ต.ค. 69 - ก.พ. 70',
        plannedBudget: 750000,
        actualSpent: 0,
        status: 'not_started'
      },
      {
        id: 'act_70_2',
        code: '2',
        name: 'กิจกรรมที่ 2 : จัดซื้อจัดจ้างและพัฒนาระบบรับเรื่องร้องเรียนออนไลน์',
        plannedPercent: 60,
        timeframe: 'มี.ค. 70 - ส.ค. 70',
        plannedBudget: 1100000,
        actualSpent: 0,
        status: 'not_started'
      }
    ],
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'proj_70A1_10002',
    code: '70A1-10002',
    name: 'โครงการส่งเสริมและพัฒนาเครือข่ายเยาวชนเพื่อการขับเคลื่อนสิทธิมนุษยชนในระดับภูมิภาค',
    fiscalYear: 2570,
    programCode: 'A',
    division: 'สสค.',
    subDivision: 'กลุ่มงานส่งเสริมสิทธิมนุษยชน',
    responsiblePerson: {
      name: 'นางสาวพิมพา สมัชชาชน',
      position: 'นักวิชาการสิทธิมนุษยชนปฏิบัติการ',
      division: 'สสค.',
      subDivision: 'กลุ่มงานส่งเสริมสิทธิมนุษยชน',
      phone: '02 141 3855',
      email: 'pimpa.youth@nhrc.or.th'
    },
    isStrategic: true,
    strategicPillar: 2,
    budgetAllocated: 920000,
    budgetSpent: 0,
    progressPercent: 0,
    status: 'NOT_STARTED',
    startDate: '2026-11-01',
    endDate: '2027-08-31',
    timeframeText: 'พฤศจิกายน 2569 ถึงสิงหาคม 2570',
    objectives: [
      'เพื่อขยายเครือข่ายเยาวชนผู้นำการเปลี่ยนแปลงด้านสิทธิมนุษยชน 4 ภูมิภาค'
    ],
    expectedOutputs: ['เยาวชนแกนนำผ่านการอบรมไม่น้อยกว่า 200 คน'],
    expectedOutcomes: ['เครือข่ายเยาวชนมีส่วนร่วมเฝ้าระวังและส่งเสริมสิทธิมนุษยชนในพื้นที่'],
    indicators: [],
    activities: [
      {
        id: 'act_70_2_1',
        code: '1',
        name: 'จัดประชุมเชิงปฏิบัติการแกนนำเยาวชน 4 ภูมิภาค',
        plannedPercent: 100,
        timeframe: 'ธ.ค. 69 - ก.ค. 70',
        plannedBudget: 920000,
        actualSpent: 0,
        status: 'not_started'
      }
    ],
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'proj_70B1_10003',
    code: '70B1-10003',
    name: 'โครงการขับเคลื่อนแผนปฏิบัติการระดับชาติว่าด้วยธุรกิจกับสิทธิมนุษยชน (NAP) ระยะที่ 3',
    fiscalYear: 2570,
    programCode: 'M_T',
    division: 'สฝป.',
    subDivision: 'กลุ่มงานขับเคลื่อนนโยบายสิทธิมนุษยชน',
    responsiblePerson: {
      name: 'นายกานต์ ธุรกิจสิทธิชน',
      position: 'นักวิชาการสิทธิมนุษยชนชำนาญการพิเศษ',
      division: 'สฝป.',
      subDivision: 'กลุ่มงานขับเคลื่อนนโยบายสิทธิมนุษยชน',
      phone: '02 141 3860',
      email: 'karn.nap@nhrc.or.th'
    },
    isStrategic: true,
    strategicPillar: 3,
    budgetAllocated: 1200000,
    budgetSpent: 0,
    progressPercent: 0,
    status: 'NOT_STARTED',
    startDate: '2026-10-01',
    endDate: '2027-09-30',
    timeframeText: 'ตุลาคม 2569 ถึงกันยายน 2570',
    objectives: [
      'เพื่อยกระดับการปฏิบัติตามหลักการชี้แนะแห่งสหประชาชาติว่าด้วยธุรกิจกับสิทธิมนุษยชน (UNGPs)'
    ],
    expectedOutputs: ['คู่มือการประเมินผลกระทบด้านสิทธิมนุษยชนอย่างรอบด้าน (HRDD) 1 ฉบับ'],
    expectedOutcomes: ['รัฐวิสาหกิจและภาคธุรกิจนำหลัก HRDD ไปปรับใช้'],
    indicators: [],
    activities: [
      {
        id: 'act_70_3_1',
        code: '1',
        name: 'สัมมนาระดมความคิดเห็นภาครัฐและเอกชนเพื่อจัดทำร่างคู่มือ HRDD',
        plannedPercent: 50,
        timeframe: 'ม.ค. 70 - เม.ย. 70',
        plannedBudget: 600000,
        actualSpent: 0,
        status: 'not_started'
      },
      {
        id: 'act_70_3_2',
        code: '2',
        name: 'เผยแพร่และจัดฝึกอบรมเชิงลึกแก่ผู้ประกอบการนำร่อง',
        plannedPercent: 50,
        timeframe: 'พ.ค. 70 - ส.ค. 70',
        plannedBudget: 600000,
        actualSpent: 0,
        status: 'not_started'
      }
    ],
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'proj_70C1_10004',
    code: '70C1-10004',
    name: 'โครงการประเมินสถานการณ์สิทธิมนุษยชนแห่งชาติและจัดทำข้อเสนอแนะเชิงนโยบาย',
    fiscalYear: 2570,
    programCode: 'O',
    division: 'สกม.',
    subDivision: 'กลุ่มงานนโยบายและมาตรการคุ้มครอง',
    responsiblePerson: {
      name: 'นางวราภรณ์ คุ้มครองสิทธิ',
      position: 'นักวิชาการสิทธิมนุษยชนชำนาญการ',
      division: 'สกม.',
      subDivision: 'กลุ่มงานนโยบายและมาตรการคุ้มครอง',
      phone: '02 141 3870',
      email: 'varaporn.eval@nhrc.or.th'
    },
    isStrategic: false,
    budgetAllocated: 780000,
    budgetSpent: 0,
    progressPercent: 0,
    status: 'NOT_STARTED',
    startDate: '2026-10-01',
    endDate: '2027-09-30',
    timeframeText: 'ตุลาคม 2569 ถึงกันยายน 2570',
    objectives: [
      'เพื่อติดตามและประเมินผลกระทบด้านสิทธิมนุษยชนจากนโยบายสาธารณะ'
    ],
    expectedOutputs: ['รายงานประเมินสถานการณ์ประจำปี 1 เล่ม'],
    expectedOutcomes: ['หน่วยงานของรัฐนำข้อเสนอแนะไปปรับปรุงการปฏิบัติหน้าที่'],
    indicators: [],
    activities: [
      {
        id: 'act_70_4_1',
        code: '1',
        name: 'รวบรวมข้อมูลและจัดเวทีรับฟังความคิดเห็นผู้ได้รับผลกระทบ',
        plannedPercent: 100,
        timeframe: 'พ.ย. 69 - ก.ค. 70',
        plannedBudget: 780000,
        actualSpent: 0,
        status: 'not_started'
      }
    ],
    updatedAt: '2026-09-01T08:00:00Z'
  },
  // ===================== โครงการปีงบประมาณ พ.ศ. 2568 (ปีที่ผ่านมา - ดำเนินการเสร็จสิ้น) =====================
  {
    id: 'proj_68O1_09001',
    code: '68O1-09001',
    name: 'โครงการจัดทำรายงานผลการประเมินสถานการณ์ด้านสิทธิมนุษยชนของประเทศไทย ประจำปี 2567',
    fiscalYear: 2568,
    programCode: 'O',
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
    strategicPillar: 1,
    budgetAllocated: 1450000,
    budgetSpent: 1420000,
    progressPercent: 100,
    status: 'COMPLETED',
    startDate: '2024-10-01',
    endDate: '2025-09-30',
    timeframeText: 'ตุลาคม 2567 ถึงกันยายน 2568',
    objectives: [
      'เพื่อประเมินสถานการณ์สิทธิมนุษยชนของประเทศไทยตามมาตรฐานสากล'
    ],
    expectedOutputs: ['รายงานผลการประเมินสถานการณ์ 1 เล่ม'],
    expectedOutcomes: ['รายงานได้รับการเผยแพร่ต่อสาธารณะและส่งให้คณะรัฐมนตรี'],
    indicators: [],
    activities: [
      {
        id: 'act_68_1_1',
        code: '1',
        name: 'จัดทำร่างรายงานและสัมมนารับฟังความคิดเห็น',
        plannedPercent: 100,
        timeframe: 'ต.ค. 67 - ก.ย. 68',
        plannedBudget: 1450000,
        actualSpent: 1420000,
        status: 'completed'
      }
    ],
    updatedAt: '2025-09-30T10:00:00Z'
  },
  {
    id: 'proj_68A1_09002',
    code: '68A1-09002',
    name: 'โครงการสมัชชาสิทธิมนุษยชนระดับชาติ ประจำปี 2568',
    fiscalYear: 2568,
    programCode: 'A',
    division: 'สสค.',
    subDivision: 'กลุ่มงานส่งเสริมสิทธิมนุษยชน',
    responsiblePerson: {
      name: 'นายสิทธิชัย ประชาชน',
      position: 'นักวิชาการสิทธิมนุษยชนชำนาญการ',
      division: 'สสค.',
      subDivision: 'กลุ่มงานส่งเสริมสิทธิมนุษยชน',
      phone: '02 141 3850',
      email: 'sittichai.assembly@nhrc.or.th'
    },
    isStrategic: true,
    strategicPillar: 2,
    budgetAllocated: 2100000,
    budgetSpent: 2085000,
    progressPercent: 100,
    status: 'COMPLETED',
    startDate: '2024-11-01',
    endDate: '2025-09-30',
    timeframeText: 'พฤศจิกายน 2567 ถึงกันยายน 2568',
    objectives: [
      'เพื่อจัดสมัชชาสิทธิมนุษยชนระดับชาติและระดมข้อเสนอเชิงนโยบาย'
    ],
    expectedOutputs: ['ข้อเสนอมติสมัชชาสิทธิมนุษยชน 1 ฉบับ'],
    expectedOutcomes: ['เกิดการขับเคลื่อนข้อเสนอเชิงนโยบายร่วมกับภาคประชาสังคม'],
    indicators: [],
    activities: [
      {
        id: 'act_68_2_1',
        code: '1',
        name: 'จัดงานสมัชชาสิทธิมนุษยชนระดับชาติ',
        plannedPercent: 100,
        timeframe: 'พ.ย. 67 - ก.ย. 68',
        plannedBudget: 2100000,
        actualSpent: 2085000,
        status: 'completed'
      }
    ],
    updatedAt: '2025-09-30T10:00:00Z'
  }
];

export const INITIAL_PROGRESS_REPORTS: ProgressReport[] = [
  {
    id: 'rep_env_round6',
    projectId: 'proj_68O1_13314',
    projectCode: '68O1-13314',
    projectName: 'โครงการติดตามข้อมติสมัชชาสิทธิมนุษยชนของปีงบประมาณ พ.ศ. 2568 ประเด็นสิทธิในสิ่งแวดล้อมที่ดี',
    fiscalYear: 2569,
    division: 'สนย.',
    round: 'round_6',
    reportDate: '2026-08-28',
    asOfDateText: 'ณ วันที่ 28 สิงหาคม 2569',
    section1: {
      projectName: 'โครงการติดตามข้อมติสมัชชาสิทธิมนุษยชนของปีงบประมาณ พ.ศ. 2568 ประเด็นสิทธิในสิ่งแวดล้อมที่ดี',
      activityCode: '68O1-13314',
      allocatedBudget: 260000,
      timeframeText: 'เดือนธันวาคม 2568 ถึงกันยายน 2569',
      divisionFullName: 'สำนักนโยบายและยุทธศาสตร์'
    },
    section2_1: [
      {
        activityId: 'act_1',
        name: '1. การประชุม/สัมมนาเพื่อขับเคลื่อนข้อเสนอแนะตามมติสมัชชาสิทธิมนุษยชน ประเด็นสิทธิในสิ่งแวดล้อมที่ดี',
        status: 'completed',
        plannedBudget: 21500,
        actualSpent: 11500,
        asOfDateText: 'ณ วันที่ 28 สิงหาคม'
      },
      {
        activityId: 'act_2',
        name: '2. การผลิตสื่อหรือเอกสารความรู้เพื่อสนับสนุนการขับเคลื่อนมติสมัชชาสิทธิมนุษยชน (จัดจ้างจัดทำ e-book)',
        status: 'completed',
        plannedBudget: 30000,
        actualSpent: 29900,
        asOfDateText: 'ณ วันที่ 28 สิงหาคม'
      },
      {
        activityId: 'act_3',
        name: '3. การประชุมเชิงปฏิบัติการเพื่อขับเคลื่อนแผนปฏิบัติการตามปฏิญญาอาเซียนว่าด้วยสิทธิในสิ่งแวดล้อมที่ปลอดภัย สะอาด ดีต่อสุขภาพ และยั่งยืน',
        status: 'completed',
        plannedBudget: 157500,
        actualSpent: 0,
        asOfDateText: 'ณ วันที่ 28 สิงหาคม'
      }
    ],
    section2_2: [
      {
        activityNumberText: 'กิจกรรมที่ 1',
        activityTitle: 'การประชุม/สัมมนาเพื่อขับเคลื่อนข้อเสนอแนะตามมติสมัชชาสิทธิมนุษยชน ประเด็นสิทธิในสิ่งแวดล้อมที่ดี',
        detailDescription: 'การสัมมนาเชิงวิชาการเรื่อง "ลมหายใจคือชีวิต: ปลดล็อกความเข้าใจผิดร่าง พ.ร.บ.อากาศสะอาด สู่มาตรฐานสิทธิมนุษยชนสากล" ในวันพฤหัสบดีที่ 11 ธันวาคม 2568 เวลา 08.00 - 13.00 น. ณ คณะนิติศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย',
        targetPlan: 'แผน 30 คน',
        targetActual: 'ผล 50 คน'
      },
      {
        activityNumberText: 'กิจกรรมที่ 2',
        activityTitle: 'การผลิตสื่อหรือเอกสารความรู้เพื่อสนับสนุนการขับเคลื่อนมติสมัชชาสิทธิมนุษยชน (จัดจ้างจัดทำหนังสืออิเล็กทรอนิกส์ e-book)',
        detailDescription: 'ดำเนินการจัดจ้างทำหนังสืออิเล็กทรอนิกส์ (E-book) เรื่อง “สิทธิในสิ่งแวดล้อมที่ดี: การบริหารจัดการทรัพยากรน้ำ” เพื่อเผยแพร่ความรู้ด้านสิทธิในสิ่งแวดล้อมที่ดีแล้วเสร็จ และเผยแพร่ผ่านช่องทางออนไลน์แล้ว (https://online.pubhtml5.com/tzmtl/zkto/)',
        targetPlan: 'แผน 1 เรื่อง',
        targetActual: 'ผล 1 เรื่อง'
      },
      {
        activityNumberText: 'กิจกรรมที่ 3',
        activityTitle: 'การประชุมเชิงปฏิบัติการเพื่อขับเคลื่อนแผนปฏิบัติการตามปฏิญญาอาเซียนว่าด้วยสิทธิในสิ่งแวดล้อมที่ปลอดภัย สะอาด ดีต่อสุขภาพ และยั่งยืน',
        detailDescription: 'ประชุมหารือร่วมกับกระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม ผู้แทนไทยใน AICHR และ OHCHR วันที่ 20-21 สิงหาคม 2569 ณ โรงแรม ที.เค. พาเลซ แอนด์ คอนเวนชั่น แจ้งวัฒนะ กรุงเทพมหานคร เพื่อจัดทำข้อมูลประเทศไทยส่ง Call for Inputs',
        targetPlan: 'แผน 45 คน',
        targetActual: 'ผล 48 คน'
      }
    ],
    section2_3: [
      {
        type: 'objective',
        label: 'วัตถุประสงค์โครงการ',
        targetText: '1) เพื่อติดตามและขับเคลื่อนข้อเสนอแนะตามมติสมัชชาสิทธิมนุษยชน ประเด็นสิทธิในสิ่งแวดล้อมที่ดี\n2) เพื่อผลิตและเผยแพร่องค์ความรู้ด้านสิทธิในสิ่งแวดล้อมที่ดี\n3) เพื่อสร้างพื้นที่การมีส่วนร่วมของภาคส่วนต่าง ๆ ในการขับเคลื่อนปฏิญญาอาเซียน',
        progressText: '1) ดำเนินการจัดทำเนื้อหาสื่อความรู้ในรูปแบบหนังสืออิเล็กทรอนิกส์ (e-book) แล้วเสร็จ\n2) สนย. ร่วมกับนางสาวศยามล ไกยูรวงศ์ และสำนักที่เกี่ยวข้อง ประชุมหารือกับกระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม\n3) จัดประชุมเชิงปฏิบัติการระดมความเห็นภาคประชาสังคมและภาครัฐ'
      },
      {
        type: 'outcome',
        label: 'เป้าหมายผลลัพธ์',
        targetText: 'ข้อเสนอแนะตามมติสมัชชาฯ ได้รับการตอบรับ โดยการบรรจุเข้าสู่วาระการพิจารณาของคณะกรรมาธิการรัฐสภา หรือคณะทำงานของหน่วยงานที่รับผิดชอบ',
        progressText: 'อยู่ระหว่างดำเนินการ (ข้อมูล ณ เดือนสิงหาคม 2569)\n1) ร่าง พ.ร.บ. บริหารจัดการเพื่ออากาศสะอาด พ.ศ. .... ผ่านการพิจารณาของวุฒิสภาแล้ว เมื่อวันที่ 9 กรกฎาคม 2569 ด้วยคะแนนเห็นชอบ 145 เสียง\n2) ร่าง พ.ร.บ. การเปลี่ยนแปลงสภาพภูมิอากาศ พ.ศ. .... ครม. มีมติเห็นชอบในหลักการแล้ว อยู่ระหว่างกฤษฎีกาตรวจร่าง\n3) ร่าง พ.ร.บ. ส่งเสริมและรักษาคุณภาพสิ่งแวดล้อมแห่งชาติ พ.ศ. .... กสม. ส่งข้อเสนอแนะไปยัง ทส. แล้ว'
      },
      {
        type: 'indicator',
        label: 'ตัวชี้วัดความสำเร็จ',
        targetText: '1) ข้อเสนอแนะตามมติสมัชชาฯ ได้รับการตอบรับบรรจุเข้าสู่วาระพิจารณาอย่างน้อย 2 เรื่อง\n2) ได้สื่อความรู้ e-book อย่างน้อย 1 เรื่อง/เล่ม\n3) ได้ร่างกรอบแนวทางแผนปฏิบัติการระดับชาติตามปฏิญญาอาเซียนฯ 1 ฉบับ',
        progressText: '1) อยู่ระหว่างติดตามร่าง พ.ร.บ. อากาศสะอาด, ร่าง พ.ร.บ. การเปลี่ยนแปลงสภาพภูมิอากาศ และ ร่าง พ.ร.บ. สิ่งแวดล้อมแห่งชาติ\n2) e-book เรื่องการบริหารจัดการทรัพยากรน้ำ ดำเนินการแล้วเสร็จเผยแพร่ออนไลน์แล้ว 1 เรื่อง\n3) อยู่ระหว่างสังเคราะห์ข้อมูลเพื่อยกร่างข้อเสนอแนะกรอบแนวทาง'
      }
    ],
    section3: [
      {
        policyTitle: 'นโยบายของ กสม. พ.ศ. 2567\n1) การติดตามและขับเคลื่อนข้อเสนอแนะต่อกฎหมายและนโยบายสำคัญตามข้อมติ\n2) การผลักดันให้เกิดการจัดทำแผนปฏิบัติการระดับชาติ (NAP) เพื่อรองรับปฏิญญาอาเซียน',
        progressDescription: 'กสม. ร่วมกับภาคีเครือข่ายติดตามร่าง พ.ร.บ. อากาศสะอาด อย่างต่อเนื่อง โดยร่วมกับสมาคมเครือข่ายอากาศสะอาดเพื่อสุขภาพจัดเวทีวิชาการ และร่วมมือกับ ทส., ผู้แทนไทยใน AICHR และ OHCHR จัดทำกรอบแผนระดับชาติ'
      }
    ],
    section4_5: [
      {
        obstacle: 'การประสานงานระหว่างหน่วยงานภาครัฐหลายหน่วยงานต้องใช้เวลาในการตรวจพิจารณาข้อกฎหมาย',
        solution: 'จัดเวทีสัมมนาเชิงวิชาการร่วมและส่งข้อเสนอแนะของ กสม. ไปยังกรรมาธิการของรัฐสภาโดยตรงเพื่อเร่งรัดกระบวนการ'
      }
    ],
    section6: {
      name: 'นายบัณฑิต หอมเกษ',
      position: 'นักวิชาการสิทธิมนุษยชนชำนาญการ',
      division: 'สนย.',
      subDivision: 'กลุ่มวิจัยและวิชาการสิทธิมนุษยชน',
      phone: '02 141 3857',
      email: 'bandit.nhrc@gmail.com'
    },
    status: 'approved',
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-08-28T14:30:00Z'
  }
];

export const INITIAL_OFFICIAL_MEMOS: OfficialMemoData[] = [
  {
    id: 'memo_zoom_2569',
    bookNumber: 'สม',
    memoDate: '22 กรกฎาคม 2569',
    division: 'สนย.',
    divisionFullName: 'สำนักนโยบายและยุทธศาสตร์',
    subDivisionName: 'กลุ่มงานนโยบายและยุทธศาสตร์',
    telNumber: '1380',
    subject: 'ขออนุมัติโอนเปลี่ยนแปลงงบประมาณเพื่อจัดสรรให้กับค่าเช่าบริการโปรแกรม Zoom Video Conference',
    toRecipient: 'เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ ผ่านรองเลขาธิการ กสม.',
    fiscalYear: 2569,
    section1_OriginalStory: 'แผนปฏิบัติการประจำปีงบประมาณ พ.ศ. 2569 ภายใต้แผนงานพื้นฐานด้านการปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ ได้จัดสรรงบประมาณให้กับค่าเช่าบริการโปรแกรม Zoom Video Conference รหัสกิจกรรม 69M4-71006 (งบดำเนินงาน) วงเงินงบประมาณ 160,000 บาท เพื่อสนับสนุนการเข้าประชุมหรือการสัมมนาของ กสม. ผู้บริหาร และเจ้าหน้าที่สำนักงาน กสม. ผ่านระบบออนไลน์ จำนวน 15 ห้องประชุม',
    section2_Facts: {
      agencyRequest: 'สำนักดิจิทัลสิทธิมนุษยชน (สดส.) ได้มีบันทึกข้อความ ที่ สม 1100/2162 ลงวันที่ 15 กรกฎาคม 2569 ขอรับการจัดสรรงบประมาณสำหรับค่าเช่าบริการโปรแกรม Zoom Video Conference รหัสกิจกรรม 69M4-71006 เพิ่มเติมจำนวน 33,135 บาท เนื่องจากการปรับปรุงส่วนราชการภายในและขอบเขตหน้าที่และอำนาจ (ฉบับที่ 3) พ.ศ. 2569 มีการจัดตั้งสำนัก/หน่วยงานใหม่ ทำให้จำนวนห้องประชุมหลักไม่เพียงพอ',
      investigation: 'สำนักนโยบายและยุทธศาสตร์ (สนย.) ได้ตรวจสอบข้อเท็จจริงและประสานขอข้อมูลเพิ่มเติมแล้ว พบว่ามีความจำเป็นต้องเพิ่มห้องประชุมจำนวน 4 ห้อง เพื่อรองรับภารกิจของส่วนราชการที่จัดตั้งขึ้นใหม่',
      savingsSource: 'สำนักงาน กสม. มีงบประมาณที่เหลือจ่ายจากการดำเนินการก่อหนี้ผูกพันแล้วเสร็จ ภายใต้แผนงานพื้นฐานด้านการปรับสมดุลฯ คือ รายการค่าจ้างเหมาบริการงานอาคารสถานที่ รหัสกิจกรรม 69T4-71016 ซึ่งสามารถโอนเปลี่ยนแปลงงบประมาณไปจัดสรรให้กับรายการที่ไม่เพียงพอได้ โดยเป็นงบประมาณภายใต้แผนงานเดียวกันและไม่กระทบต่อเป้าหมายหลัก'
    },
    section3_LegalReference: 'ระเบียบคณะกรรมการสิทธิมนุษยชนแห่งชาติว่าด้วยการงบประมาณ พ.ศ. 2566 ข้อ 13 ให้เลขาธิการมีหน้าที่และอำนาจจัดสรรและรับผิดชอบในการจ่ายเงินหรือก่อหนี้ผูกพันให้เป็นไปตามแผนปฏิบัติการประจำปี และข้อ 15 วรรคหนึ่ง การเปลี่ยนแปลงรายการหรือจำนวนเงินต่างไปจากแผนปฏิบัติการประจำปีโดยไม่เพิ่มวงเงินรวมของงบประมาณรายจ่ายประจำปีและไม่กระทบต่อแผนการปฏิบัติงานที่คณะกรรมการให้ความเห็นชอบ ให้เลขาธิการเป็นผู้อนุมัติ',
    section4_Proposal: 'เพื่อให้สำนักงาน กสม. มีงบประมาณเพียงพอสำหรับค่าเช่าบริการโปรแกรม Zoom Video Conference รองรับการปฏิบัติงานของส่วนราชการที่จัดตั้งขึ้นใหม่ และเป็นไปตามระเบียบ กสม. ว่าด้วยการงบประมาณ พ.ศ. 2566 ข้อ 13 และข้อ 15 วรรคหนึ่ง เห็นควรพิจารณาโอนเปลี่ยนแปลงงบประมาณจากค่าจ้างเหมาบริการงานอาคารสถานที่ ไปสมทบให้กับค่าเช่าบริการโปรแกรม Zoom Video Conference จำนวน 33,135 บาท',
    tableRows: [
      {
        id: 't_row_1',
        itemType: 'source',
        programName: 'แผนงานพื้นฐานด้านการปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ',
        programCode: 'M_T',
        itemDescription: 'ค่าจ้างเหมาบริการงานอาคารสถานที่ (โอนงบประมาณออก)',
        activityCode: '69T4-71016 (งบดำเนินงาน)',
        budgetOriginal: 4240072.00,
        transferAmount: -33135.00,
        budgetNew: 4206937.00,
        actualDisbursedAndCommitted: 3624000.00,
        remainingBalance: 582937.00
      },
      {
        id: 't_row_2',
        itemType: 'destination',
        programName: 'แผนงานพื้นฐานด้านการปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ',
        programCode: 'M_T',
        itemDescription: 'ค่าเช่าบริการโปรแกรม Zoom Video Conference (รับโอนงบประมาณ)',
        activityCode: '69M4-71006 (งบดำเนินงาน)',
        budgetOriginal: 160000.00,
        transferAmount: 33135.00,
        budgetNew: 193135.00,
        actualDisbursedAndCommitted: 0.00,
        remainingBalance: 193135.00
      }
    ],
    asOfDateText: 'ณ วันที่ 22 กรกฎาคม 2569',
    proposerName: 'นางสาวสุกัญญา ตันสายเพชร',
    proposerPosition: 'ผู้อำนวยการสำนักนโยบายและยุทธศาสตร์',
    divisionHeadRemark: 'มอบ สนย. ดำเนินการ',
    deputyRemark: 'เสนอเพื่อโปรดพิจารณาอนุมัติ',
    decisionOrder: 'APPROVED',
    approverTitle: 'เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ',
    approverName: 'นางสาวหรรษา หอมหวล',
    useThaiNumerals: false,
    status: 'approved',
    createdAt: '2026-07-22T08:30:00Z'
  },
  {
    id: 'memo_return_sample_01',
    bookNumber: 'สม',
    memoDate: '15 กรกฎาคม 2569',
    division: 'สสค.',
    divisionFullName: 'สำนักส่งเสริมการเคารพสิทธิมนุษยชน',
    subDivisionName: 'กลุ่มงานส่งเสริมสิทธิมนุษยชน',
    telNumber: '1380',
    subject: 'ส่งคืนงบประมาณเหลือจ่ายของ โครงการสัมมนาวิชาการระดับชาติด้านสิทธิมนุษยชน ประจำปีงบประมาณ พ.ศ. 2569',
    toRecipient: 'เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ ผ่านผู้อำนวยการสำนักนโยบายและยุทธศาสตร์',
    fiscalYear: 2569,
    section1_OriginalStory: 'ตามที่สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ ได้อนุมัติจัดสรรงบประมาณรายจ่ายประจำปีงบประมาณ พ.ศ. 2569 ให้แก่ สสค. เพื่อดำเนินโครงการสัมมนาวิชาการระดับชาติด้านสิทธิมนุษยชน จำนวน 1,200,000 บาท นั้น',
    section2_Facts: {
      agencyRequest: 'บัดนี้ สำนักส่งเสริมการเคารพสิทธิมนุษยชน ได้ดำเนินกิจกรรมตามโครงการดังกล่าวเสร็จสิ้นครบถ้วนตามเป้าหมายและตัวชี้วัดแล้ว',
      investigation: 'โดยมีการเบิกจ่ายงบประมาณไปแล้วทั้งสิ้น 1,151,500 บาท มีงบประมาณคงเหลือจ่ายสุทธิเป็นจำนวนเงิน 48,500 บาท',
      savingsSource: 'สำนักจึงขอส่งคืนเงินงบประมาณเหลือจ่ายดังกล่าวเข้าเป็นงบประมาณส่วนกลางของสำนักงาน กสม. เพื่อให้สำนักงานนำไปบริหารจัดการในภาพรวมต่อไป'
    },
    section3_LegalReference: 'ระเบียบคณะกรรมการสิทธิมนุษยชนแห่งชาติ ว่าด้วยการงบประมาณ พ.ศ. 2566 ข้อ 12',
    section4_Proposal: 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติส่งคืนงบประมาณเหลือจ่ายจำนวน 48,500 บาท เพื่อส่งคืนเข้าเป็นงบประมาณส่วนกลางของสำนักงาน กสม.',
    tableRows: [
      {
        id: 'ret_row_1',
        itemType: 'source',
        programName: 'แผนงานยุทธศาสตร์',
        programCode: 'M_T',
        itemDescription: 'โครงการสัมมนาวิชาการระดับชาติด้านสิทธิมนุษยชน [ส่งคืนงบเหลือจ่าย]',
        activityCode: '69M_T-71001',
        budgetOriginal: 1200000,
        transferAmount: -48500,
        budgetNew: 1151500,
        actualDisbursedAndCommitted: 1151500,
        remainingBalance: 0
      },
      {
        id: 'ret_row_2',
        itemType: 'destination',
        programName: 'งบประมาณส่วนกลาง',
        programCode: 'M_T',
        itemDescription: 'งบกลางสำนักงาน กสม. (สนย. รับคืนเข้าส่วนกลาง)',
        activityCode: 'ส่วนกลาง',
        budgetOriginal: 0,
        transferAmount: 48500,
        budgetNew: 48500,
        actualDisbursedAndCommitted: 0,
        remainingBalance: 48500
      }
    ],
    asOfDateText: 'ณ วันที่ 15 กรกฎาคม 2569',
    proposerName: 'นายพิทยา ประธาน',
    proposerPosition: 'ผู้อำนวยการสำนักส่งเสริมการเคารพสิทธิมนุษยชน',
    decisionOrder: 'APPROVED',
    approverTitle: 'เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ',
    approverName: 'นางสาวหรรษา หอมหวล',
    useThaiNumerals: false,
    status: 'approved',
    createdAt: '2026-07-15T10:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-001',
    title: 'ครบกำหนดส่งรายงาน สนย.3 รอบที่ 2',
    message: 'ครบกำหนดส่งรายงานผลการดำเนินงานและการใช้จ่ายงบประมาณรอบ 4 เดือน (ต.ค. 68 - ม.ค. 69) ตามแบบ สนย.3 ภายในวันที่ 15 กุมภาพันธ์ 2569',
    type: 'deadline' as const,
    severity: 'urgent' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    isRead: false,
    linkTab: 'progress_reports',
    division: 'ทุกสำนัก/กลุ่มงาน'
  },
  {
    id: 'NOTIF-002',
    title: 'คำขอโอนงบประมาณรออนุมัติ (ข้อ 14)',
    message: 'บันทึก สม 0302/ว 14 โครงการส่งเสริมเครือข่ายสิทธิฯ รอการเสนอคณะกรรมการ กสม. พิจารณาให้ความเห็นชอบ',
    type: 'approval' as const,
    severity: 'high' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    isRead: false,
    linkTab: 'transfer_history',
    memoId: 'MEMO-2569-001',
    division: 'สสค.'
  },
  {
    id: 'NOTIF-003',
    title: 'แจ้งเตือนอัตราการเบิกจ่ายต่ำกว่าเป้าหมาย',
    message: 'โครงการส่งเสริมการเคารพสิทธิมนุษยชนฯ (สสค.) มียอดเบิกจ่าย 35% ยังต่ำกว่าเกณฑ์สะสมไตรมาส 2 ที่กำหนดไว้ 50%',
    type: 'warning' as const,
    severity: 'medium' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    isRead: false,
    linkTab: 'project_catalog',
    division: 'สสค.'
  },
  {
    id: 'NOTIF-004',
    title: 'สำรองข้อมูลและเชื่อมโยงระบบสมบูรณ์',
    message: 'ระบบได้บันทึกโครงการปี 2569 จำนวน 7 โครงการหลัก พร้อมโครงสร้างงบประมาณ 14 สำนัก/กลุ่มงาน และแบบ สนย.3 ในหน่วยความจำเรียบร้อยแล้ว',
    type: 'system' as const,
    severity: 'low' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    isRead: true,
    linkTab: 'settings'
  }
];

