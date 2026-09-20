import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project } from '../types/project';
import { ProgressReport } from '../types/progress';
import { OfficialMemoData } from '../types/budget';
import { AppNotification, EmailDispatchRecord } from '../types/notification';
import { INITIAL_PROJECTS, INITIAL_PROGRESS_REPORTS, INITIAL_OFFICIAL_MEMOS, INITIAL_NOTIFICATIONS } from '../data/initialData';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { formatCurrency, fromThaiNumerals } from '../utils/thaiNumber';

export type SupabaseStatus = 'connected' | 'missing_tables' | 'connecting' | 'error' | 'disconnected';

interface ProjectContextType {
  projects: Project[];
  reports: ProgressReport[];
  memos: OfficialMemoData[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  emailLogs: EmailDispatchRecord[];
  fiscalYear: number;
  setFiscalYear: (yr: number) => void;

  // Supabase Cloud State
  supabaseStatus: SupabaseStatus;
  supabaseErrorMsg?: string;
  syncDataToSupabase: () => Promise<{ success: boolean; message: string }>;
  reloadFromSupabase: () => Promise<void>;
  
  // UI & Theming
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDivision: string;
  setSelectedDivision: (div: string) => void;
  selectedProgram: string;
  setSelectedProgram: (prog: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;

  // CRUD Operations
  addProject: (project: Project) => void;
  addProjects: (projects: Project[]) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  
  addProgressReport: (report: ProgressReport) => void;
  updateProgressReport: (report: ProgressReport) => void;
  getReportById: (id: string) => ProgressReport | undefined;
  getReportsForProject: (projectId: string) => ProgressReport[];

  addOfficialMemo: (memo: OfficialMemoData) => void;
  updateOfficialMemo: (memo: OfficialMemoData) => void;
  getMemoById: (id: string) => OfficialMemoData | undefined;

  // Baseline Lock & Regulations Approval Workflow
  lockAllProjectsBaseline: (fiscalYear: number) => void;
  unlockProjectForEdit: (projectId: string, reason: string) => void;
  relockProject: (projectId: string) => void;

  // Email Notifications & Reminder Hub Workflow
  dispatchPlanVerificationEmails: (targetFiscalYear: number) => { count: number; message: string };
  dispatchProgressDueReminders: (targetFiscalYear: number, roundText: string) => { count: number; message: string };
  sendReminderNudge: (projectId: string, reason?: string) => void;
  sendBatchReminderNudge: (projectIds: string[]) => { count: number; message: string };

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;

  resetToDefaultData: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fiscalYear, setFiscalYear] = useState<number>(2569);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('nhrc_dark_mode') === 'true';
  });
  const [fontScale, setFontScale] = useState<number>(() => {
    const saved = localStorage.getItem('nhrc_font_scale');
    if (saved) {
      const parsed = parseInt(saved, 10);
      return parsed < 110 ? 115 : parsed;
    }
    return 115;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Core Data
  const sanitizeProjects = (list: Project[]): Project[] => {
    return list.map(p => {
      if (p.responsiblePerson && p.responsiblePerson.phone) {
        const cleanPhone = fromThaiNumerals(p.responsiblePerson.phone);
        if (cleanPhone !== p.responsiblePerson.phone) {
          return {
            ...p,
            responsiblePerson: {
              ...p.responsiblePerson,
              phone: cleanPhone
            }
          };
        }
      }
      return p;
    });
  };

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('nhrc_projects');
    if (saved) {
      try { 
        const parsed: Project[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(p => p.id));
        const missing = INITIAL_PROJECTS.filter(p => !existingIds.has(p.id));
        const combined = missing.length > 0 ? [...parsed, ...missing] : parsed;
        return sanitizeProjects(combined);
      } catch (e) {}
    }
    return sanitizeProjects(INITIAL_PROJECTS);
  });

  const sanitizeMemo = (m: OfficialMemoData): OfficialMemoData => ({
    ...m,
    bookNumber: fromThaiNumerals(m.bookNumber || ''),
    memoDate: fromThaiNumerals(m.memoDate || ''),
    subject: fromThaiNumerals(m.subject || ''),
    telNumber: fromThaiNumerals(m.telNumber || ''),
    asOfDateText: m.asOfDateText ? fromThaiNumerals(m.asOfDateText) : undefined,
    proposerName: fromThaiNumerals(m.proposerName || ''),
    proposerPosition: fromThaiNumerals(m.proposerPosition || ''),
    approverTitle: fromThaiNumerals(m.approverTitle || ''),
    approverName: fromThaiNumerals(m.approverName || ''),
  });

  const [reports, setReports] = useState<ProgressReport[]>(() => {
    const saved = localStorage.getItem('nhrc_reports');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_PROGRESS_REPORTS;
  });

  const [memos, setMemos] = useState<OfficialMemoData[]>(() => {
    const saved = localStorage.getItem('nhrc_memos');
    if (saved) {
      try { 
        const parsed: OfficialMemoData[] = JSON.parse(saved);
        return parsed.map(sanitizeMemo);
      } catch (e) {}
    }
    return INITIAL_OFFICIAL_MEMOS.map(sanitizeMemo);
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('nhrc_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const [emailLogs, setEmailLogs] = useState<EmailDispatchRecord[]>(() => {
    const saved = localStorage.getItem('nhrc_email_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'email_init_1',
        recipientEmail: 'somchai.su@nhrc.or.th',
        recipientName: 'นายสมชาย ยุติธรรม',
        division: 'สนย.',
        subject: '[กสม. สนย.] ขอความอนุเคราะห์ตรวจสอบและยืนยันข้อมูลแผนปฏิบัติการ ประจำปีงบประมาณ 2569 (69สนย-10001)',
        bodyPreview: 'เรียน นายสมชาย ยุติธรรม, สำนักนโยบายและยุทธศาสตร์ได้จัดเตรียมแผนปฏิบัติการ ประจำปีงบประมาณ 2569 โครงการ "โครงการขับเคลื่อนภารกิจด้านสิทธิมนุษยชนเชิงรุก" ขอความอนุเคราะห์ตรวจสอบความถูกต้องก่อนการล็อกแผนตั้งต้น',
        category: 'verify_plan',
        sentAt: '2025-10-01T09:00:00Z',
        fiscalYear: 2569,
        status: 'delivered',
        projectCode: '69สนย-10001',
        projectName: 'โครงการขับเคลื่อนภารกิจด้านสิทธิมนุษยชนเชิงรุก'
      }
    ];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('nhrc_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('nhrc_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('nhrc_memos', JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    localStorage.setItem('nhrc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('nhrc_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  useEffect(() => {
    localStorage.setItem('nhrc_dark_mode', isDarkMode ? 'true' : 'false');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('nhrc_font_scale', fontScale.toString());
    document.documentElement.style.setProperty('--font-scale', `${fontScale}%`);
  }, [fontScale]);

  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>('connecting');
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState<string>();

  // Check Supabase and load data
  const reloadFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSupabaseStatus('disconnected');
      return;
    }
    try {
      const conn = await supabaseService.testConnection();
      if (!conn.connected) {
        setSupabaseStatus('error');
        setSupabaseErrorMsg(conn.error);
        return;
      }
      if (!conn.tablesCreated) {
        setSupabaseStatus('missing_tables');
        setSupabaseErrorMsg(conn.error);
        return;
      }

      setSupabaseStatus('connected');
      setSupabaseErrorMsg(undefined);

      const [remoteProjects, remoteReports, remoteMemos, remoteLogs, remoteNotifs] = await Promise.all([
        supabaseService.getProjects(),
        supabaseService.getReports(),
        supabaseService.getMemos(),
        supabaseService.getEmailLogs(),
        supabaseService.getNotifications()
      ]);

      if (remoteProjects && remoteProjects.length > 0) {
        setProjects(sanitizeProjects(remoteProjects));
      } else {
        // Table exists but is empty -> seed initial data into Supabase
        await supabaseService.seedAllData(projects, reports, memos, notifications, emailLogs);
      }

      if (remoteReports && remoteReports.length > 0) setReports(remoteReports);
      if (remoteMemos && remoteMemos.length > 0) setMemos(remoteMemos);
      if (remoteLogs && remoteLogs.length > 0) setEmailLogs(remoteLogs);
      if (remoteNotifs && remoteNotifs.length > 0) setNotifications(remoteNotifs);
    } catch (e: any) {
      console.error('Supabase load error:', e);
      setSupabaseStatus('error');
      setSupabaseErrorMsg(e.message);
    }
  }, [projects, reports, memos, notifications, emailLogs]);

  useEffect(() => {
    reloadFromSupabase();
  }, []);

  const syncDataToSupabase = async () => {
    try {
      const res = await supabaseService.seedAllData(projects, reports, memos, notifications, emailLogs);
      if (res.success) {
        setSupabaseStatus('connected');
        setSupabaseErrorMsg(undefined);
      }
      return res;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // CRUD Projects
  const addProject = (project: Project) => {
    setProjects(prev => [project, ...prev]);
    if (supabaseStatus === 'connected') {
      supabaseService.upsertProject(project).catch(console.error);
    }
  };

  const addProjects = (newProjects: Project[]) => {
    setProjects(prev => [...newProjects, ...prev]);
    if (supabaseStatus === 'connected') {
      newProjects.forEach(p => supabaseService.upsertProject(p).catch(console.error));
    }
  };

  const updateProject = (project: Project) => {
    const updated = { ...project, updatedAt: new Date().toISOString() };
    setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
    if (supabaseStatus === 'connected') {
      supabaseService.upsertProject(updated).catch(console.error);
    }
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (supabaseStatus === 'connected') {
      supabaseService.deleteProject(id).catch(console.error);
    }
  };

  const getProjectById = (id: string) => {
    return projects.find(p => p.id === id);
  };

  // CRUD Reports
  const addProgressReport = (report: ProgressReport) => {
    setReports(prev => [report, ...prev]);
    // update parent project progress and last report date
    setProjects(prev => prev.map(p => {
      if (p.id === report.projectId) {
        // Calculate updated spent from activities
        const totalSpent = report.section2_1.reduce((sum, a) => sum + (a.actualSpent || 0), 0);
        return {
          ...p,
          budgetSpent: Math.max(p.budgetSpent, totalSpent),
          lastReportRound: report.round,
          lastReportDate: report.reportDate,
          progressPercent: Math.min(100, p.progressPercent + 15),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    // Auto notification to Admin
    addNotification({
      title: `ได้รับรายงานผล สนย.3 ใหม่ (${report.division})`,
      message: `${report.division} ได้ส่งรายงานผลโครงการ "${report.projectName}" (${report.round}) เรียบร้อยแล้ว`,
      type: 'system',
      severity: 'medium',
      linkTab: 'progress_reports',
      projectId: report.projectId,
      division: report.division
    });

    // Auto simulated email log to Admin
    const adminLog: EmailDispatchRecord = {
      id: `email_admin_rep_${Date.now()}`,
      recipientEmail: 'admin.plan@nhrc.or.th',
      recipientName: 'ผู้ดูแลระบบและกลุ่มงานติดตามประเมินผล สนย.',
      division: report.division,
      subject: `[แจ้งเตือน Admin] ได้รับรายงานผล สนย.3 ใหม่: ${report.projectName} (${report.division})`,
      bodyPreview: `เรียน Admin, สำนัก ${report.division} ได้ทำการบันทึกและส่งแบบรายงานผล สนย.3 โครงการ "${report.projectName}" เข้าสู่ระบบแล้ว`,
      category: 'progress_due',
      sentAt: new Date().toISOString(),
      fiscalYear: report.fiscalYear || 2569,
      status: 'delivered',
      projectId: report.projectId,
      projectCode: report.projectCode,
      projectName: report.projectName
    };
    setEmailLogs(prev => [adminLog, ...prev]);
  };

  const updateProgressReport = (report: ProgressReport) => {
    setReports(prev => prev.map(r => r.id === report.id ? report : r));
  };

  const getReportById = (id: string) => {
    return reports.find(r => r.id === id);
  };

  const getReportsForProject = (projectId: string) => {
    return reports.filter(r => r.projectId === projectId);
  };

  // CRUD Memos
  const addOfficialMemo = (memo: OfficialMemoData) => {
    const cleanMemo = sanitizeMemo(memo);
    setMemos(prev => [cleanMemo, ...prev]);

    // Auto notification to Admin
    addNotification({
      title: `มีคำขอโอน/เปลี่ยนแปลงงบประมาณใหม่ (${cleanMemo.division})`,
      message: `${cleanMemo.division} ได้ยื่นบันทึกข้อความขออนุมัติ: "${cleanMemo.subject}" (เลขที่ ${cleanMemo.bookNumber})`,
      type: 'approval',
      severity: 'high',
      linkTab: 'transfer_history',
      division: cleanMemo.division,
      memoId: cleanMemo.id
    });

    // Auto email log to Admin
    const adminMemoEmail: EmailDispatchRecord = {
      id: `email_admin_memo_${Date.now()}`,
      recipientEmail: 'admin.plan@nhrc.or.th',
      recipientName: 'ผู้ดูแลระบบและผู้อำนวยการ สนย.',
      division: cleanMemo.division,
      subject: `[แจ้งเตือน Admin รออนุมัติ] บันทึกข้อความขอโอน/เปลี่ยนแปลงงบประมาณ: ${cleanMemo.subject}`,
      bodyPreview: `เรียน Admin, สำนัก ${cleanMemo.division} ได้จัดส่งบันทึกข้อความเลขที่ ${cleanMemo.bookNumber} เรื่อง "${cleanMemo.subject}" เข้าสู่ระบบเพื่อรอพิจารณาอนุมัติตามระเบียบ`,
      category: 'transfer_submitted',
      sentAt: new Date().toISOString(),
      fiscalYear: cleanMemo.fiscalYear || 2569,
      status: 'delivered'
    };
    setEmailLogs(prev => [adminMemoEmail, ...prev]);
  };

  const updateOfficialMemo = (memo: OfficialMemoData) => {
    const cleanMemo = sanitizeMemo(memo);
    setMemos(prev => prev.map(m => m.id === cleanMemo.id ? cleanMemo : m));
  };

  const getMemoById = (id: string) => {
    return memos.find(m => m.id === id);
  };

  // Baseline Locking Workflow
  const lockAllProjectsBaseline = (targetFiscalYear: number) => {
    setProjects(prev => prev.map(p => {
      if ((p.fiscalYear || 2569) === targetFiscalYear) {
        return {
          ...p,
          isBaselineLocked: true,
          unlockedForEdit: false,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    addNotification({
      title: `ล็อกข้อมูลโครงการตั้งต้นปี ${targetFiscalYear}`,
      message: `ระบบได้ทำการล็อกข้อมูลโครงการตั้งต้นของปีงบประมาณ ${targetFiscalYear} เรียบร้อยแล้ว (ไม่สามารถแก้ไขได้เว้นแต่ได้รับอนุมัติตามระเบียบ)`,
      type: 'system',
      severity: 'medium',
      linkTab: 'project_catalog'
    });
  };

  const unlockProjectForEdit = (projectId: string, reason: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          unlockedForEdit: true,
          unlockReason: reason,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    const proj = projects.find(p => p.id === projectId);
    addNotification({
      title: `อนุมัติเปิดสิทธิ์แก้ไขโครงการ`,
      message: `Admin ได้เปิดสิทธิ์ให้แก้ไขข้อมูลโครงการ "${proj?.name || projectId}" เนื่องจาก: ${reason}`,
      type: 'approval',
      severity: 'high',
      linkTab: 'project_catalog',
      projectId
    });
  };

  const relockProject = (projectId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          unlockedForEdit: false,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));
  };

  // Email Notifications & Reminder Hub
  const dispatchPlanVerificationEmails = (targetFiscalYear: number) => {
    const targetProjects = projects.filter(p => (p.fiscalYear || 2569) === targetFiscalYear);
    if (targetProjects.length === 0) {
      return { count: 0, message: `ไม่พบโครงการในปีงบประมาณ ${targetFiscalYear}` };
    }

    const newLogs: EmailDispatchRecord[] = targetProjects.map(p => ({
      id: `email_verify_${p.id}_${Date.now()}`,
      recipientEmail: p.responsiblePerson?.email || `${p.division.toLowerCase()}@nhrc.or.th`,
      recipientName: p.responsiblePerson?.name || p.division,
      division: p.division,
      subject: `[กสม. สนย.] ขอความอนุเคราะห์ตรวจสอบความถูกต้องของแผนปฏิบัติการ ประจำปีงบประมาณ ${targetFiscalYear} (${p.code})`,
      bodyPreview: `เรียน ${p.responsiblePerson?.name || p.division}, สำนักนโยบายและยุทธศาสตร์ได้นำเข้าข้อมูลแผนปฏิบัติการ ประจำปีงบประมาณ ${targetFiscalYear} โครงการ "${p.name}" (วงเงิน ${formatCurrency(p.budgetAllocated)} บาท) ขอความอนุเคราะห์เข้าสู่ระบบเพื่อตรวจสอบความถูกต้องและปรับปรุงข้อมูลให้ครบถ้วน ก่อนการล็อกโครงการตั้งต้น`,
      category: 'verify_plan',
      sentAt: new Date().toISOString(),
      fiscalYear: targetFiscalYear,
      status: 'delivered',
      projectId: p.id,
      projectCode: p.code,
      projectName: p.name
    }));

    setEmailLogs(prev => [...newLogs, ...prev]);

    addNotification({
      title: `จัดส่งอีเมลแจ้งตรวจสอบแผนปี ${targetFiscalYear} แล้ว`,
      message: `ระบบได้ส่งอีเมลแจ้งเตือนไปยังผู้รับผิดชอบโครงการจำนวน ${targetProjects.length} โครงการ เพื่อให้ตรวจสอบข้อมูลแผนตั้งต้น`,
      type: 'email',
      severity: 'medium',
      linkTab: 'project_catalog'
    });

    return { 
      count: targetProjects.length, 
      message: `ส่งอีเมลแจ้งเตือนผู้รับผิดชอบโครงการปีงบประมาณ ${targetFiscalYear} สำเร็จ ${targetProjects.length} ฉบับ` 
    };
  };

  const dispatchProgressDueReminders = (targetFiscalYear: number, roundText: string) => {
    const targetProjects = projects.filter(p => (p.fiscalYear || 2569) === targetFiscalYear);
    const newLogs: EmailDispatchRecord[] = targetProjects.map(p => ({
      id: `email_due_${p.id}_${Date.now()}`,
      recipientEmail: p.responsiblePerson?.email || `${p.division.toLowerCase()}@nhrc.or.th`,
      recipientName: p.responsiblePerson?.name || p.division,
      division: p.division,
      subject: `[กสม. สนย.] แจ้งเตือนการรายงานผลการปฏิบัติงานและการใช้จ่ายงบประมาณ (แบบ สนย.3) ${roundText}`,
      bodyPreview: `เรียน ${p.responsiblePerson?.name || p.division}, ถึงกำหนดการรายงานผลการปฏิบัติงานและการใช้จ่ายงบประมาณ (แบบ สนย.3) ${roundText} โครงการ "${p.name}" ขอให้เข้าระบบเพื่อรายงานผลภายในระยะเวลาที่กำหนด`,
      category: 'progress_due',
      sentAt: new Date().toISOString(),
      fiscalYear: targetFiscalYear,
      status: 'delivered',
      projectId: p.id,
      projectCode: p.code,
      projectName: p.name
    }));

    setEmailLogs(prev => [...newLogs, ...prev]);

    addNotification({
      title: `ส่งอีเมลแจ้งเตือนรอบรายงานผล ${roundText}`,
      message: `ระบบได้ส่งอีเมลแจ้งเตือนถึงผู้รับผิดชอบโครงการ ${targetProjects.length} โครงการเรียบร้อยแล้ว`,
      type: 'email',
      severity: 'medium',
      linkTab: 'progress_reports'
    });

    return {
      count: targetProjects.length,
      message: `ส่งอีเมลแจ้งเตือนรอบรายงานผล ${roundText} สำเร็จ ${targetProjects.length} ฉบับ`
    };
  };

  const sendReminderNudge = (projectId: string, reason?: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    const newCount = (proj.reminderCount || 0) + 1;
    const nowIso = new Date().toISOString();

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          lastRemindedAt: nowIso,
          reminderCount: newCount
        };
      }
      return p;
    }));

    const emailLog: EmailDispatchRecord = {
      id: `email_nudge_${projectId}_${Date.now()}`,
      recipientEmail: proj.responsiblePerson?.email || `${proj.division.toLowerCase()}@nhrc.or.th`,
      recipientName: proj.responsiblePerson?.name || proj.division,
      division: proj.division,
      subject: `[ด่วน - แจ้งเตือนซ้ำ ครั้งที่ ${newCount}] ขอความอนุเคราะห์เร่งรัดการรายงานผล สนย.3 โครงการ ${proj.code}`,
      bodyPreview: `เรียน ${proj.responsiblePerson?.name || proj.division}, ตามที่ครบกำหนดส่งรายงานผล สนย.3 ปรากฏว่าโครงการ "${proj.name}" ยังมิได้จัดส่งรายงานผลในระบบ ขอความอนุเคราะห์เร่งรัดรายงานผลเพื่อนำเสนอผู้บริหาร กสม. ต่อไป ${reason ? `(หมายเหตุเพิ่มเติม: ${reason})` : ''}`,
      category: 'reminder_nudge',
      sentAt: nowIso,
      fiscalYear: proj.fiscalYear || 2569,
      status: 'delivered',
      projectId: proj.id,
      projectCode: proj.code,
      projectName: proj.name
    };

    setEmailLogs(prev => [emailLog, ...prev]);

    addNotification({
      title: `ส่งอีเมลแจ้งเตือนซ้ำสำเร็จ (${proj.division})`,
      message: `ส่งอีเมลเตือนเร่งรัดรายงานผลโครงการ "${proj.name}" ถึง ${proj.responsiblePerson?.name || proj.division} เรียบร้อยแล้ว (ครั้งที่ ${newCount})`,
      type: 'email',
      severity: 'high',
      linkTab: 'progress_reports',
      projectId: proj.id,
      division: proj.division
    });
  };

  const sendBatchReminderNudge = (projectIds: string[]) => {
    projectIds.forEach(id => sendReminderNudge(id));
    return {
      count: projectIds.length,
      message: `ส่งอีเมลแจ้งเตือนซ้ำไปยังสำนักที่ยังไม่รายงานสำเร็จ ${projectIds.length} โครงการ`
    };
  };

  // Notification Operations
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notification,
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const resetToDefaultData = () => {
    setProjects(INITIAL_PROJECTS);
    setReports(INITIAL_PROGRESS_REPORTS);
    setMemos(INITIAL_OFFICIAL_MEMOS);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.removeItem('nhrc_projects');
    localStorage.removeItem('nhrc_reports');
    localStorage.removeItem('nhrc_memos');
    localStorage.removeItem('nhrc_notifications');
    localStorage.removeItem('nhrc_email_logs');
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        reports,
        memos,
        notifications,
        unreadNotificationsCount,
        emailLogs,
        fiscalYear,
        setFiscalYear,
        supabaseStatus,
        supabaseErrorMsg,
        syncDataToSupabase,
        reloadFromSupabase,
        isDarkMode,
        toggleDarkMode,
        fontScale,
        setFontScale,
        isSidebarCollapsed,
        toggleSidebar,
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        selectedDivision,
        setSelectedDivision,
        selectedProgram,
        setSelectedProgram,
        selectedStatus,
        setSelectedStatus,
        addProject,
        addProjects,
        updateProject,
        deleteProject,
        getProjectById,
        addProgressReport,
        updateProgressReport,
        getReportById,
        getReportsForProject,
        addOfficialMemo,
        updateOfficialMemo,
        getMemoById,
        lockAllProjectsBaseline,
        unlockProjectForEdit,
        relockProject,
        dispatchPlanVerificationEmails,
        dispatchProgressDueReminders,
        sendReminderNudge,
        sendBatchReminderNudge,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        addNotification,
        resetToDefaultData
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
