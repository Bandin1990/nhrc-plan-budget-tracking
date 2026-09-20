import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Project } from '../types/project';
import { ProgressReport } from '../types/progress';
import { OfficialMemoData } from '../types/budget';
import { AppNotification, EmailDispatchRecord } from '../types/notification';
import { User } from '../types/user';
import { fromThaiNumerals } from '../utils/thaiNumber';

// ==============================================================================
// Data Mappers: TypeScript camelCase <-> PostgreSQL snake_case
// ==============================================================================

export const mapProjectToDb = (p: Project) => ({
  id: p.id,
  code: p.code,
  name: p.name,
  fiscal_year: p.fiscalYear,
  program_code: p.programCode,
  division: p.division,
  sub_division: p.subDivision || '',
  responsible_person: p.responsiblePerson ? {
    ...p.responsiblePerson,
    phone: fromThaiNumerals(p.responsiblePerson.phone || ''),
  } : {},
  is_strategic: p.isStrategic,
  strategic_pillar: p.strategicPillar || null,
  budget_allocated: p.budgetAllocated,
  budget_spent: p.budgetSpent,
  budget_committed: p.budgetCommitted || 0,
  progress_percent: p.progressPercent,
  status: p.status,
  start_date: p.startDate,
  end_date: p.endDate,
  timeframe_text: p.timeframeText,
  objectives: p.objectives || [],
  expected_outputs: p.expectedOutputs || [],
  expected_outcomes: p.expectedOutcomes || [],
  indicators: p.indicators || [],
  activities: p.activities || [],
  last_report_round: p.lastReportRound || null,
  last_report_date: p.lastReportDate || null,
  is_baseline_locked: p.isBaselineLocked || false,
  unlocked_for_edit: p.unlockedForEdit || false,
  unlock_reason: p.unlockReason || null,
  last_reminded_at: p.lastRemindedAt || null,
  reminder_count: p.reminderCount || 0,
  notes: p.notes || null,
  updated_at: new Date().toISOString(),
});

export const mapDbToProject = (row: any): Project => ({
  id: row.id,
  code: row.code,
  name: row.name,
  fiscalYear: row.fiscal_year,
  programCode: row.program_code,
  division: row.division,
  subDivision: row.sub_division || '',
  responsiblePerson: row.responsible_person ? {
    ...row.responsible_person,
    phone: fromThaiNumerals(row.responsible_person.phone || ''),
  } : {
    name: '',
    position: '',
    division: row.division,
    phone: '',
    email: '',
  },
  isStrategic: row.is_strategic || false,
  strategicPillar: row.strategic_pillar || undefined,
  budgetAllocated: Number(row.budget_allocated) || 0,
  budgetSpent: Number(row.budget_spent) || 0,
  budgetCommitted: Number(row.budget_committed) || 0,
  progressPercent: Number(row.progress_percent) || 0,
  status: row.status || 'NOT_STARTED',
  startDate: row.start_date || '',
  endDate: row.end_date || '',
  timeframeText: row.timeframe_text || '',
  objectives: row.objectives || [],
  expectedOutputs: row.expected_outputs || [],
  expectedOutcomes: row.expected_outcomes || [],
  indicators: row.indicators || [],
  activities: row.activities || [],
  lastReportRound: row.last_report_round || undefined,
  lastReportDate: row.last_report_date || undefined,
  isBaselineLocked: Boolean(row.is_baseline_locked),
  unlockedForEdit: Boolean(row.unlocked_for_edit),
  unlockReason: row.unlock_reason || undefined,
  lastRemindedAt: row.last_reminded_at || undefined,
  reminderCount: row.reminder_count || 0,
  notes: row.notes || undefined,
  updatedAt: row.updated_at || new Date().toISOString(),
});

export const mapReportToDb = (r: ProgressReport) => ({
  id: r.id,
  project_id: r.projectId,
  project_code: r.projectCode,
  project_name: r.projectName,
  fiscal_year: r.fiscalYear,
  division: r.division,
  round: r.round,
  report_date: r.reportDate,
  as_of_date_text: r.asOfDateText || null,
  section1: r.section1,
  section2_1: r.section2_1,
  section2_2: r.section2_2,
  section2_3: r.section2_3,
  section3: r.section3,
  section4_5: r.section4_5,
  section6: r.section6,
  status: r.status,
  updated_at: new Date().toISOString(),
});

export const mapDbToReport = (row: any): ProgressReport => ({
  id: row.id,
  projectId: row.project_id,
  projectCode: row.project_code,
  projectName: row.project_name,
  fiscalYear: row.fiscal_year,
  division: row.division,
  round: row.round,
  reportDate: row.report_date,
  asOfDateText: row.as_of_date_text || '',
  section1: row.section1 || {},
  section2_1: row.section2_1 || [],
  section2_2: row.section2_2 || [],
  section2_3: row.section2_3 || [],
  section3: row.section3 || [],
  section4_5: row.section4_5 || [],
  section6: row.section6 || {},
  status: row.status || 'draft',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
});

export const mapMemoToDb = (m: OfficialMemoData) => ({
  id: m.id,
  book_number: m.bookNumber,
  memo_date: m.memoDate,
  division: m.division,
  division_full_name: m.divisionFullName || '',
  sub_division_name: m.subDivisionName || '',
  tel_number: m.telNumber || '',
  subject: m.subject,
  to_recipient: m.toRecipient || '',
  fiscal_year: m.fiscalYear,
  section1_original_story: m.section1_OriginalStory,
  section2_facts: m.section2_Facts,
  section3_legal_reference: m.section3_LegalReference,
  section4_proposal: m.section4_Proposal,
  table_rows: m.tableRows,
  as_of_date_text: m.asOfDateText || '',
  proposer_name: m.proposerName,
  proposer_position: m.proposerPosition,
  division_head_remark: m.divisionHeadRemark || null,
  deputy_remark: m.deputyRemark || null,
  decision_order: m.decisionOrder,
  approver_title: m.approverTitle,
  approver_name: m.approverName,
  use_thai_numerals: m.useThaiNumerals || false,
  status: m.status,
  updated_at: new Date().toISOString(),
});

export const mapDbToMemo = (row: any): OfficialMemoData => ({
  id: row.id,
  bookNumber: row.book_number,
  memoDate: row.memo_date,
  division: row.division,
  divisionFullName: row.division_full_name || '',
  subDivisionName: row.sub_division_name || '',
  telNumber: row.tel_number || '',
  subject: row.subject,
  toRecipient: row.to_recipient || '',
  fiscalYear: row.fiscal_year,
  section1_OriginalStory: row.section1_original_story || '',
  section2_Facts: row.section2_facts || { agencyRequest: '', investigation: '', savingsSource: '' },
  section3_LegalReference: row.section3_legal_reference || '',
  section4_Proposal: row.section4_proposal || '',
  tableRows: row.table_rows || [],
  asOfDateText: row.as_of_date_text || '',
  proposerName: row.proposer_name || '',
  proposerPosition: row.proposer_position || '',
  divisionHeadRemark: row.division_head_remark || undefined,
  deputyRemark: row.deputy_remark || undefined,
  decisionOrder: row.decision_order || 'PENDING',
  approverTitle: row.approver_title || '',
  approverName: row.approver_name || '',
  useThaiNumerals: Boolean(row.use_thai_numerals),
  status: row.status || 'pending_approval',
  createdAt: row.created_at || new Date().toISOString(),
});

export const mapEmailLogToDb = (e: EmailDispatchRecord) => ({
  id: e.id,
  recipient_email: e.recipientEmail,
  recipient_name: e.recipientName || '',
  division: e.division || '',
  subject: e.subject,
  body_preview: e.bodyPreview,
  category: e.category,
  sent_at: e.sentAt,
  fiscal_year: e.fiscalYear || null,
  status: e.status || 'delivered',
  project_code: e.projectCode || null,
  project_name: e.projectName || null,
});

export const mapDbToEmailLog = (row: any): EmailDispatchRecord => ({
  id: row.id,
  recipientEmail: row.recipient_email,
  recipientName: row.recipient_name || '',
  division: row.division || undefined,
  subject: row.subject,
  bodyPreview: row.body_preview,
  category: row.category,
  sentAt: row.sent_at,
  fiscalYear: row.fiscal_year || undefined,
  status: row.status || 'delivered',
  projectCode: row.project_code || undefined,
  projectName: row.project_name || undefined,
});

export const mapNotificationToDb = (n: AppNotification) => ({
  id: n.id,
  title: n.title,
  message: n.message,
  timestamp: n.timestamp,
  is_read: n.isRead,
  type: n.type || 'system',
  severity: n.severity || 'low',
  division: n.division || null,
  project_id: n.projectId || null,
  memo_id: n.memoId || null,
  link_tab: n.linkTab || null,
});

export const mapDbToNotification = (row: any): AppNotification => ({
  id: row.id,
  title: row.title,
  message: row.message,
  timestamp: row.timestamp,
  isRead: Boolean(row.is_read),
  type: row.type || 'system',
  severity: row.severity || 'low',
  division: row.division || undefined,
  projectId: row.project_id || undefined,
  memoId: row.memo_id || undefined,
  linkTab: row.link_tab || undefined,
});

export const mapUserToDb = (u: User) => ({
  id: u.id,
  name: u.name,
  username: u.username,
  password: u.password || 'password123',
  position: u.position || '',
  division: u.division,
  sub_division: u.subDivision || '',
  email: u.email,
  role: u.role,
  avatar: u.avatar || null,
  assigned_project_ids: u.assignedProjectIds || [],
  updated_at: new Date().toISOString(),
});

export const mapDbToUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  username: row.username,
  password: row.password || 'password123',
  position: row.position || '',
  division: row.division,
  subDivision: row.sub_division || '',
  email: row.email,
  role: row.role,
  avatar: row.avatar || undefined,
  assignedProjectIds: Array.isArray(row.assigned_project_ids) ? row.assigned_project_ids : [],
});


// ==============================================================================
// Database Operations Service
// ==============================================================================

export const supabaseService = {
  async testConnection(): Promise<{ connected: boolean; tablesCreated: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { connected: false, tablesCreated: false, error: 'Supabase configuration missing' };
    }
    try {
      const { data, error } = await supabase.from('projects').select('id').limit(1);
      if (error) {
        // Error code 42P01: relation does not exist
        if (error.code === '42P01') {
          return { connected: true, tablesCreated: false, error: 'ตาราง projects ยังไม่ถูกสร้างใน Supabase' };
        }
        return { connected: false, tablesCreated: false, error: error.message };
      }
      return { connected: true, tablesCreated: true };
    } catch (err: any) {
      return { connected: false, tablesCreated: false, error: err.message };
    }
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('fiscal_year', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbToProject);
  },

  async upsertProject(project: Project): Promise<void> {
    if (!isSupabaseConfigured) return;
    const dbRecord = mapProjectToDb(project);
    const { error } = await supabase.from('projects').upsert(dbRecord);
    if (error) throw error;
  },

  async upsertProjectsBatch(projectsList: Project[]): Promise<void> {
    if (!isSupabaseConfigured || projectsList.length === 0) return;
    const records = projectsList.map(mapProjectToDb);
    const { error } = await supabase.from('projects').upsert(records);
    if (error) throw error;
  },

  async deleteProject(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },

  // Progress Reports
  async getReports(): Promise<ProgressReport[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('progress_reports')
      .select('*')
      .order('report_date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbToReport);
  },

  async upsertReport(report: ProgressReport): Promise<void> {
    if (!isSupabaseConfigured) return;
    const dbRecord = mapReportToDb(report);
    const { error } = await supabase.from('progress_reports').upsert(dbRecord);
    if (error) throw error;
  },

  async upsertReportsBatch(reportsList: ProgressReport[]): Promise<void> {
    if (!isSupabaseConfigured || reportsList.length === 0) return;
    const records = reportsList.map(mapReportToDb);
    const { error } = await supabase.from('progress_reports').upsert(records);
    if (error) throw error;
  },

  // Official Memos (การโอนงบ)
  async getMemos(): Promise<OfficialMemoData[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('official_memos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbToMemo);
  },

  async upsertMemo(memo: OfficialMemoData): Promise<void> {
    if (!isSupabaseConfigured) return;
    const dbRecord = mapMemoToDb(memo);
    const { error } = await supabase.from('official_memos').upsert(dbRecord);
    if (error) throw error;
  },

  async upsertMemosBatch(memosList: OfficialMemoData[]): Promise<void> {
    if (!isSupabaseConfigured || memosList.length === 0) return;
    const records = memosList.map(mapMemoToDb);
    const { error } = await supabase.from('official_memos').upsert(records);
    if (error) throw error;
  },

  // Email Logs
  async getEmailLogs(): Promise<EmailDispatchRecord[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbToEmailLog);
  },

  async insertEmailLog(log: EmailDispatchRecord): Promise<void> {
    if (!isSupabaseConfigured) return;
    const record = mapEmailLogToDb(log);
    const { error } = await supabase.from('email_logs').upsert(record);
    if (error) throw error;
  },

  async insertEmailLogsBatch(logs: EmailDispatchRecord[]): Promise<void> {
    if (!isSupabaseConfigured || logs.length === 0) return;
    const records = logs.map(mapEmailLogToDb);
    const { error } = await supabase.from('email_logs').upsert(records);
    if (error) throw error;
  },

  // App Notifications
  async getNotifications(): Promise<AppNotification[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('app_notifications')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbToNotification);
  },

  async upsertNotification(n: AppNotification): Promise<void> {
    if (!isSupabaseConfigured) return;
    const record = mapNotificationToDb(n);
    const { error } = await supabase.from('app_notifications').upsert(record);
    if (error) throw error;
  },

  async upsertNotificationsBatch(notifs: AppNotification[]): Promise<void> {
    if (!isSupabaseConfigured || notifs.length === 0) return;
    const records = notifs.map(mapNotificationToDb);
    const { error } = await supabase.from('app_notifications').upsert(records);
    if (error) throw error;
  },

  // Users Management (Option C: Supabase Direct Auth & User Directory)
  async getUsers(): Promise<User[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');
      if (error) {
        // If table doesn't exist yet, return empty list gracefully
        console.warn('Could not fetch users from Supabase (table might not exist yet):', error.message);
        return [];
      }
      return (data || []).map(mapDbToUser);
    } catch (err: any) {
      console.warn('Error fetching users from Supabase:', err.message);
      return [];
    }
  },

  async upsertUser(user: User): Promise<void> {
    if (!isSupabaseConfigured) return;
    const record = mapUserToDb(user);
    const { error } = await supabase.from('users').upsert(record);
    if (error) throw error;
  },

  async upsertUsersBatch(users: User[]): Promise<void> {
    if (!isSupabaseConfigured || users.length === 0) return;
    const records = users.map(mapUserToDb);
    const { error } = await supabase.from('users').upsert(records);
    if (error) throw error;
  },

  async deleteUser(userId: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
  },

  // Seed All Data (Initial Mock/Local data -> Supabase)
  async seedAllData(
    projects: Project[],
    reports: ProgressReport[],
    memos: OfficialMemoData[],
    notifications: AppNotification[],
    emailLogs: EmailDispatchRecord[],
    users?: User[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (projects.length > 0) await this.upsertProjectsBatch(projects);
      if (reports.length > 0) await this.upsertReportsBatch(reports);
      if (memos.length > 0) await this.upsertMemosBatch(memos);
      if (notifications.length > 0) await this.upsertNotificationsBatch(notifications);
      if (emailLogs.length > 0) await this.insertEmailLogsBatch(emailLogs);
      if (users && users.length > 0) await this.upsertUsersBatch(users);
      return { success: true, message: 'นำเข้าข้อมูลเข้าสู่ Supabase สำเร็จเรียบร้อยแล้ว' };
    } catch (err: any) {
      console.error('Failed to seed Supabase data:', err);
      return { success: false, message: `เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ${err.message}` };
    }
  }
};
