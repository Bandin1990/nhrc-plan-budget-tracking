-- ==============================================================================
-- สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ (สำนักงาน กสม.)
-- ระบบติดตามแผนปฏิบัติราชการและการบริหารงบประมาณ (NHRC Plan & Budget Tracking)
-- Supabase PostgreSQL Schema Script
-- ==============================================================================

-- 1. ตารางข้อมูลโครงการ (Projects)
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
  
  -- ควบคุมการล็อกแผนตั้งต้นและปลดล็อกตามระเบียบ
  is_baseline_locked BOOLEAN DEFAULT false,
  unlocked_for_edit BOOLEAN DEFAULT false,
  unlock_reason TEXT,
  last_reminded_at TEXT,
  reminder_count INTEGER DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Index สำหรับค้นหาโครงการตามปีงบประมาณและสำนัก
CREATE INDEX IF NOT EXISTS idx_projects_fy ON public.projects (fiscal_year);
CREATE INDEX IF NOT EXISTS idx_projects_division ON public.projects (division);
CREATE INDEX IF NOT EXISTS idx_projects_code ON public.projects (code);


-- 2. ตารางรายงานผลความก้าวหน้า (Progress Reports)
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


-- 3. ตารางบันทึกข้อความขอโอน/เปลี่ยนแปลงงบประมาณ (Official Memos)
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

CREATE INDEX IF NOT EXISTS idx_memos_fy ON public.official_memos (fiscal_year);
CREATE INDEX IF NOT EXISTS idx_memos_division ON public.official_memos (division);


-- 4. ตารางประวัติการส่งอีเมลและการแจ้งเตือน (Email Logs)
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

CREATE INDEX IF NOT EXISTS idx_email_logs_fy ON public.email_logs (fiscal_year);
CREATE INDEX IF NOT EXISTS idx_email_logs_category ON public.email_logs (category);


-- 5. ตารางการแจ้งเตือนภายในแอป (App Notifications)
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


-- 6. ตารางข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง (Users & RBAC)
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


-- ==============================================================================
-- การเปิดใช้งาน Row Level Security (RLS) และกำหนดสิทธิ์การเข้าถึง
-- ==============================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- นโยบายเปิดให้ระบบ Web App เข้าถึงตารางได้ (DROP POLICY IF EXISTS ก่อนสร้างเพื่อป้องกัน Error รันซ้ำ)
DROP POLICY IF EXISTS "Allow public read access for projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public insert access for projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public update access for projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public delete access for projects" ON public.projects;
CREATE POLICY "Allow public read access for projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access for projects" ON public.projects FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access for reports" ON public.progress_reports;
DROP POLICY IF EXISTS "Allow public insert access for reports" ON public.progress_reports;
DROP POLICY IF EXISTS "Allow public update access for reports" ON public.progress_reports;
DROP POLICY IF EXISTS "Allow public delete access for reports" ON public.progress_reports;
CREATE POLICY "Allow public read access for reports" ON public.progress_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for reports" ON public.progress_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for reports" ON public.progress_reports FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access for reports" ON public.progress_reports FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access for memos" ON public.official_memos;
DROP POLICY IF EXISTS "Allow public insert access for memos" ON public.official_memos;
DROP POLICY IF EXISTS "Allow public update access for memos" ON public.official_memos;
DROP POLICY IF EXISTS "Allow public delete access for memos" ON public.official_memos;
CREATE POLICY "Allow public read access for memos" ON public.official_memos FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for memos" ON public.official_memos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for memos" ON public.official_memos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access for memos" ON public.official_memos FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access for email_logs" ON public.email_logs;
DROP POLICY IF EXISTS "Allow public insert access for email_logs" ON public.email_logs;
DROP POLICY IF EXISTS "Allow public update access for email_logs" ON public.email_logs;
CREATE POLICY "Allow public read access for email_logs" ON public.email_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for email_logs" ON public.email_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for email_logs" ON public.email_logs FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read access for notifications" ON public.app_notifications;
DROP POLICY IF EXISTS "Allow public insert access for notifications" ON public.app_notifications;
DROP POLICY IF EXISTS "Allow public update access for notifications" ON public.app_notifications;
DROP POLICY IF EXISTS "Allow public delete access for notifications" ON public.app_notifications;
CREATE POLICY "Allow public read access for notifications" ON public.app_notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for notifications" ON public.app_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for notifications" ON public.app_notifications FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access for notifications" ON public.app_notifications FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access for users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert access for users" ON public.users;
DROP POLICY IF EXISTS "Allow public update access for users" ON public.users;
DROP POLICY IF EXISTS "Allow public delete access for users" ON public.users;
CREATE POLICY "Allow public read access for users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access for users" ON public.users FOR DELETE USING (true);

-- เปิด Realtime สำหรับตาราง projects, reports, memos, notifications, users (ป้องกัน Error หากรันซ้ำ)
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.projects; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.progress_reports; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.official_memos; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.app_notifications; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.users; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ==============================================================================
-- ข้อมูลผู้ใช้งานเริ่มต้น 6 บัญชี (Initial Seed Users)
-- รหัสผ่านเริ่มต้นคือ password123 (ผู้ดูแลระบบสามารถเปลี่ยนได้ในหน้าตั้งค่าสิทธิ์)
-- ==============================================================================
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
