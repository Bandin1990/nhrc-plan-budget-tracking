import { NHRCUnit } from './project';

export type UserRole = 
  | 'ADMIN'         // เจ้าหน้าที่ฝ่ายแผนและงบประมาณ (สนย./สบก.) มีสิทธิ์สูงสุด แก้ไขได้ทุกโครงการ
  | 'PROJECT_OWNER' // เจ้าหน้าที่ผู้รับผิดชอบโครงการ แก้ไข/รายงานผล/โอนงบได้เฉพาะโครงการที่ตนรับผิดชอบ
  | 'EXECUTIVE'     // ผู้บริหาร กสม. / เลขาธิการ / ประธาน กสม. ดูภาพรวม อนุมัติ และพิมพ์รายงาน
  | 'VIEWER';       // เจ้าหน้าที่ทั่วไป / ผู้ตรวจ ดูภาพรวมและโครงการทั้งหมด (Read-only)

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  position: string;
  division: NHRCUnit;
  subDivision: string;
  email: string;
  role: UserRole;
  avatar?: string;
  assignedProjectIds: string[]; // รายการ ID โครงการที่รับผิดชอบ (สำหรับสิทธิ์ Row-level edit)
}

export const DEMO_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'นางสาวสุกัญญา ตันสายเพชร',
    username: 'admin',
    password: 'password123',
    position: 'ผู้อำนวยการสำนักนโยบายและยุทธศาสตร์',
    division: 'สนย.',
    subDivision: 'กลุ่มงานนโยบายและยุทธศาสตร์',
    email: 'sukanya.nhrc@gmail.com',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    assignedProjectIds: ['all']
  },
  {
    id: 'user_bandit',
    name: 'นายบัณฑิต หอมเกษ',
    username: 'bandit_h',
    password: 'password123',
    position: 'นักวิชาการสิทธิมนุษยชนชำนาญการ',
    division: 'สนย.',
    subDivision: 'กลุ่มวิจัยและวิชาการสิทธิมนุษยชน',
    email: 'bandit.nhrc@gmail.com',
    role: 'PROJECT_OWNER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    assignedProjectIds: ['proj_68O1_13314', 'proj_69M1_12002']
  },
  {
    id: 'user_sask',
    name: 'นายสมเกียรติ สิทธิคุณ',
    username: 'somkiat',
    password: 'password123',
    position: 'นักวิชาการสิทธิมนุษยชนชำนาญการพิเศษ',
    division: 'สสค.',
    subDivision: 'กลุ่มงานส่งเสริมสิทธิมนุษยชน',
    email: 'somkiat.nhrc@gmail.com',
    role: 'PROJECT_OWNER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    assignedProjectIds: ['proj_hrep_69', 'proj_training_5levels', 'proj_hack_rights']
  },
  {
    id: 'user_sds',
    name: 'นายฉัตรชัย นวัตกรรม',
    username: 'chatchai',
    password: 'password123',
    position: 'นักวิชาการคอมพิวเตอร์ชำนาญการ',
    division: 'สดส.',
    subDivision: 'กลุ่มงานพัฒนาระบบสารสนเทศและฐานข้อมูล',
    email: 'chatchai.nhrc@gmail.com',
    role: 'PROJECT_OWNER',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
    assignedProjectIds: ['proj_zoom_conf', 'proj_it_security', 'proj_data_gov']
  },
  {
    id: 'user_exec',
    name: 'นางสาวหรรษา หอมหวล',
    username: 'hansa',
    password: 'password123',
    position: 'เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ',
    division: 'งบบริหาร กสม.',
    subDivision: 'สำนักงาน กสม.',
    email: 'hansa.secgen@nhrc.or.th',
    role: 'EXECUTIVE',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
    assignedProjectIds: ['all']
  },
  {
    id: 'user_viewer',
    name: 'นายธวัชชัย ตรวจการ',
    username: 'thawatchai',
    password: 'password123',
    position: 'ผู้ตรวจสอบภายในชำนาญการ',
    division: 'นตส.',
    subDivision: 'หน่วยตรวจสอบภายใน',
    email: 'thawatchai.audit@nhrc.or.th',
    role: 'VIEWER',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
    assignedProjectIds: []
  }
];
