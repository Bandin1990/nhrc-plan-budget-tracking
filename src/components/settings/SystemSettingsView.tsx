import React, { useState } from 'react';
import { Settings, RefreshCcw, Download, Upload, CheckCircle2, ShieldAlert, Database, Copy, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';

interface SystemSettingsViewProps {}

const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ (สำนักงาน กสม.)
-- ระบบติดตามแผนปฏิบัติราชการและการบริหารงบประมาณ (NHRC Plan & Budget Tracking)
-- Supabase PostgreSQL Schema Script
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  program_code TEXT NOT NULL,
  division TEXT NOT NULL,
  sub_division TEXT DEFAULT '',
  responsible_person JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_strategic BOOLEAN DEFAULT false,
  strategic_pillar INTEGER,
  budget_allocated NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  budget_spent NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  budget_committed NUMERIC(15, 2) DEFAULT 0.00,
  progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  start_date TEXT,
  end_date TEXT,
  timeframe_text TEXT,
  objectives JSONB DEFAULT '[]'::jsonb,
  expected_outputs JSONB DEFAULT '[]'::jsonb,
  expected_outcomes JSONB DEFAULT '[]'::jsonb,
  indicators JSONB DEFAULT '[]'::jsonb,
  activities JSONB DEFAULT '[]'::jsonb,
  last_report_round TEXT,
  last_report_date TEXT,
  is_baseline_locked BOOLEAN DEFAULT false,
  unlocked_for_edit BOOLEAN DEFAULT false,
  unlock_reason TEXT,
  last_reminded_at TEXT,
  reminder_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_projects_fy ON public.projects (fiscal_year);
CREATE INDEX IF NOT EXISTS idx_projects_division ON public.projects (division);

CREATE TABLE IF NOT EXISTS public.progress_reports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  project_code TEXT NOT NULL,
  project_name TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  division TEXT NOT NULL,
  round TEXT NOT NULL,
  report_date TEXT NOT NULL,
  as_of_date_text TEXT,
  section1 JSONB DEFAULT '{}'::jsonb,
  section2_1 JSONB DEFAULT '[]'::jsonb,
  section2_2 JSONB DEFAULT '[]'::jsonb,
  section2_3 JSONB DEFAULT '[]'::jsonb,
  section3 JSONB DEFAULT '[]'::jsonb,
  section4_5 JSONB DEFAULT '[]'::jsonb,
  section6 JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_reports_project_id ON public.progress_reports (project_id);
CREATE INDEX IF NOT EXISTS idx_reports_fy ON public.progress_reports (fiscal_year);

CREATE TABLE IF NOT EXISTS public.official_memos (
  id TEXT PRIMARY KEY,
  book_number TEXT NOT NULL,
  memo_date TEXT NOT NULL,
  division TEXT NOT NULL,
  division_full_name TEXT,
  sub_division_name TEXT,
  tel_number TEXT,
  subject TEXT NOT NULL,
  to_recipient TEXT,
  fiscal_year INTEGER NOT NULL,
  section1_original_story TEXT,
  section2_facts JSONB DEFAULT '{}'::jsonb,
  section3_legal_reference TEXT,
  section4_proposal TEXT,
  table_rows JSONB DEFAULT '[]'::jsonb,
  as_of_date_text TEXT,
  proposer_name TEXT,
  proposer_position TEXT,
  division_head_remark TEXT,
  deputy_remark TEXT,
  decision_order TEXT DEFAULT 'PENDING',
  approver_title TEXT,
  approver_name TEXT,
  use_thai_numerals BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending_approval',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.email_logs (
  id TEXT PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  division TEXT,
  subject TEXT NOT NULL,
  body_preview TEXT,
  category TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  fiscal_year INTEGER,
  status TEXT DEFAULT 'delivered',
  project_code TEXT,
  project_name TEXT
);

CREATE TABLE IF NOT EXISTS public.app_notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  is_read BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'system',
  severity TEXT DEFAULT 'low',
  division TEXT,
  project_id TEXT,
  memo_id TEXT,
  link_tab TEXT
);

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL DEFAULT 'password123',
  position TEXT DEFAULT '',
  division TEXT NOT NULL,
  sub_division TEXT DEFAULT '',
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'PROJECT_OWNER',
  avatar TEXT,
  assigned_project_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_division ON public.users (division);

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access for projects" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Allow public read access for reports" ON public.progress_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for reports" ON public.progress_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for reports" ON public.progress_reports FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access for reports" ON public.progress_reports FOR DELETE USING (true);

CREATE POLICY "Allow public read access for memos" ON public.official_memos FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for memos" ON public.official_memos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for memos" ON public.official_memos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access for memos" ON public.official_memos FOR DELETE USING (true);

CREATE POLICY "Allow public read access for email_logs" ON public.email_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for email_logs" ON public.email_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for email_logs" ON public.email_logs FOR UPDATE USING (true);

CREATE POLICY "Allow public read access for notifications" ON public.app_notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for notifications" ON public.app_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for notifications" ON public.app_notifications FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access for notifications" ON public.app_notifications FOR DELETE USING (true);

CREATE POLICY "Allow public read access for users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access for users" ON public.users FOR DELETE USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.progress_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.official_memos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Initial Seed Users
INSERT INTO public.users (id, name, username, password, position, division, sub_division, email, role, avatar, assigned_project_ids)
VALUES
  ('user_admin', 'นางสาวสุกัญญา ตันสายเพชร', 'admin', 'password123', 'ผู้อำนวยการสำนักนโยบายและยุทธศาสตร์', 'สนย.', 'กลุ่มงานนโยบายและยุทธศาสตร์', 'sukanya.nhrc@gmail.com', 'ADMIN', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80', '["all"]'::jsonb),
  ('user_bandit', 'นายบัณฑิต หอมเกษ', 'bandit_h', 'password123', 'นักวิชาการสิทธิมนุษยชนชำนาญการ', 'สนย.', 'กลุ่มวิจัยและวิชาการสิทธิมนุษยชน', 'bandit.nhrc@gmail.com', 'PROJECT_OWNER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80', '["proj_68O1_13314", "proj_69M1_12002"]'::jsonb),
  ('user_sask', 'นายสมเกียรติ สิทธิคุณ', 'somkiat', 'password123', 'นักวิชาการสิทธิมนุษยชนชำนาญการพิเศษ', 'สสค.', 'กลุ่มงานส่งเสริมสิทธิมนุษยชน', 'somkiat.nhrc@gmail.com', 'PROJECT_OWNER', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80', '["proj_hrep_69", "proj_training_5levels", "proj_hack_rights"]'::jsonb),
  ('user_sds', 'นายฉัตรชัย นวัตกรรม', 'chatchai', 'password123', 'นักวิชาการคอมพิวเตอร์ชำนาญการ', 'สดส.', 'กลุ่มงานพัฒนาระบบสารสนเทศและฐานข้อมูล', 'chatchai.nhrc@gmail.com', 'PROJECT_OWNER', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80', '["proj_zoom_conf", "proj_it_security", "proj_data_gov"]'::jsonb),
  ('user_exec', 'นางสาวหรรษา หอมหวล', 'hansa', 'password123', 'เลขาธิการคณะกรรมการสิทธิมนุษยชนแห่งชาติ', 'งบบริหาร กสม.', 'สำนักงาน กสม.', 'hansa.secgen@nhrc.or.th', 'EXECUTIVE', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80', '["all"]'::jsonb),
  ('user_viewer', 'นายธวัชชัย ตรวจการ', 'thawatchai', 'password123', 'ผู้ตรวจสอบภายในชำนาญการ', 'นตส.', 'หน่วยตรวจสอบภายใน', 'thawatchai.audit@nhrc.or.th', 'VIEWER', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80', '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  position = EXCLUDED.position,
  division = EXCLUDED.division,
  sub_division = EXCLUDED.sub_division,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  avatar = EXCLUDED.avatar,
  assigned_project_ids = EXCLUDED.assigned_project_ids,
  updated_at = NOW();
`;

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = () => {
  const { 
    resetToDefaultData, 
    projects, 
    reports, 
    memos,
    supabaseStatus,
    supabaseErrorMsg,
    syncDataToSupabase,
    reloadFromSupabase
  } = useProjects();
  const { currentUser } = useAuth();

  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  // Strict Admin-Only Guard
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg mx-auto my-12 text-center shadow-lg border border-slate-200/80 dark:border-slate-800 space-y-4 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            จำกัดสิทธิ์เฉพาะผู้ดูแลระบบ (Admin Only)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            ท่านกำลังเข้าสู่ระบบในฐานะ <strong>{currentUser.name} ({currentUser.role})</strong> ซึ่งไม่มีสิทธิ์เข้าถึงระบบตั้งค่าและการจัดการสำรองข้อมูล
          </p>
        </div>
        <div className="pt-2 text-xs text-slate-400">
          กรุณาติดต่อผู้ดูแลระบบหลักของสำนักนโยบายและยุทธศาสตร์
        </div>
      </div>
    );
  }

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncDataToSupabase();
      setSyncResult(res);
    } catch (err: any) {
      setSyncResult({ success: false, message: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportBackup = () => {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projects,
      reports,
      memos
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_nhrc_plan_budget_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นข้อมูลตั้งต้นปี 2569 ของ กสม. หรือไม่? ข้อมูลที่เพิ่มใหม่จะถูกลบ')) {
      resetToDefaultData();
      alert('รีเซ็ตข้อมูลเรียบร้อยแล้ว');
    }
  };

  return (
    <div className="space-y-6 pb-16 text-xs max-w-3xl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="w-2 h-5 bg-[#0a4d44] rounded-full inline-block"></span>
          <span>ตั้งค่าระบบและฐานข้อมูล (System & Database Settings)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          การบริหารจัดการฐานข้อมูลคลาวด์ Supabase (PostgreSQL) และการสำรองข้อมูล
        </p>
      </div>

      {/* Supabase Cloud Database Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  ฐานข้อมูล Supabase PostgreSQL (Cloud Database)
                </h3>
                {supabaseStatus === 'connected' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    เชื่อมต่อแล้ว (Online)
                  </span>
                )}
                {supabaseStatus === 'missing_tables' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-3 h-3" />
                    เชื่อมต่อได้ แต่ยังไม่สร้างตาราง
                  </span>
                )}
                {supabaseStatus === 'error' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                    เกิดข้อผิดพลาด
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                URL: <code className="text-emerald-700 dark:text-emerald-400 font-mono">https://xbsvfntolicebbobrjfb.supabase.co</code>
              </p>
            </div>
          </div>

          <button
            onClick={() => reloadFromSupabase()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            title="ตรวจสอบการเชื่อมต่อใหม่"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>ตรวจสอบใหม่</span>
          </button>
        </div>

        {/* Missing tables guide banner */}
        {supabaseStatus === 'missing_tables' && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  ขั้นตอนง่ายๆ: นำ SQL Schema ไปรันใน Supabase เพื่อสร้างตาราง
                </p>
                <ol className="text-[11px] text-amber-800 dark:text-amber-300 mt-1.5 space-y-1 list-decimal list-inside">
                  <li>
                    กดปุ่ม <strong>"คัดลอก SQL Script"</strong> ด้านล่าง
                  </li>
                  <li>
                    เปิดหน้า <a href="https://supabase.com/dashboard/project/xbsvfntolicebbobrjfb/sql/new" target="_blank" rel="noreferrer" className="underline font-bold text-amber-900 dark:text-amber-100 inline-flex items-center gap-1">Supabase SQL Editor <ExternalLink className="w-3 h-3" /></a>
                  </li>
                  <li>
                    วางโค้ดลงในช่องคิวรี่ แล้วกดปุ่ม <strong>Run</strong>
                  </li>
                  <li>
                    กลับมากดปุ่ม <strong>"ตรวจสอบใหม่"</strong> หรือ <strong>"ซิงค์ข้อมูลทั้งหมดเข้าสู่ Supabase"</strong>
                  </li>
                </ol>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'คัดลอก SQL แล้ว!' : 'คัดลอก SQL Script'}</span>
              </button>

              <a
                href="https://supabase.com/dashboard/project/xbsvfntolicebbobrjfb/sql/new"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
              >
                <ExternalLink className="w-4 h-4" />
                <span>เปิด Supabase SQL Editor</span>
              </a>
            </div>
          </div>
        )}

        {/* Sync actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500">
            ระบบรองรับการซิงค์ข้อมูลโครงการ 2569/2570 รายงาน สนย.3 และประวัติการโอนงบสู่ Cloud อัตโนมัติ
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'คัดลอกแล้ว' : 'คัดลอก SQL'}</span>
            </button>
            <button
              onClick={handleSyncToSupabase}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors disabled:opacity-50 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลเข้าสู่ Supabase'}</span>
            </button>
          </div>
        </div>

        {syncResult && (
          <div className={`p-3 rounded-xl text-xs font-semibold ${syncResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'}`}>
            {syncResult.message}
          </div>
        )}
      </div>

      {/* Backup & Restore */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white">
          การสำรองข้อมูล (Backup & Restore)
        </h3>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-200">ส่งออกข้อมูลสำรอง (JSON Backup)</p>
            <p className="text-[11px] text-slate-500">ดาวน์โหลดฐานข้อมูลโครงการและรายงานผลทั้งหมดเก็บไว้ในเครื่อง</p>
          </div>
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 font-bold"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด Backup</span>
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
          <div>
            <p className="font-bold text-red-800 dark:text-red-300">รีเซ็ตข้อมูลตั้งต้น (Reset Master Seed)</p>
            <p className="text-[11px] text-red-600/80 dark:text-red-400/80">ล้างข้อมูลที่แก้ไข และโหลดชุดข้อมูลจริงของ กสม. ปี 2569 กลับคืนมา</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>รีเซ็ตเป็นค่าเริ่มต้น</span>
          </button>
        </div>
      </div>
    </div>
  );
};
