import React from 'react';
import { 
  LayoutDashboard, TrendingUp, FolderKanban, FileUp, Target, 
  Clock, Printer, Scale, FileText, History, BarChart3, Building2, 
  Users, Cloud, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';

export type NavTab = 
  | 'dashboard'
  | 'budget_comparison'
  | 'project_catalog'
  | 'word_import'
  | 'strategic_projects'
  | 'progress_reports'
  | 'print_snyo3'
  | 'budget_transfers'
  | 'print_memo'
  | 'transfer_history'
  | 'executive_summary'
  | 'unit_breakdown'
  | 'user_permissions'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { isSidebarCollapsed, toggleSidebar, projects, fiscalYear } = useProjects();
  const { currentUser } = useAuth();

  const menuGroups = [
    {
      title: 'ภาพรวม',
      items: [
        { id: 'dashboard', label: 'หน้าหลัก & แดชบอร์ด', icon: LayoutDashboard },
        { id: 'budget_comparison', label: 'แผน vs ผลการใช้จ่าย', icon: TrendingUp },
      ]
    },
    {
      title: `แผนงานและโครงการ (ปีงบฯ ${fiscalYear})`,
      items: [
        { id: 'project_catalog', label: 'ทะเบียนโครงการทั้งหมด', icon: FolderKanban },
        { id: 'word_import', label: 'นำเข้าแผนปฏิบัติการ (Word/AI)', icon: FileUp, highlight: true },
        { id: 'strategic_projects', label: 'โครงการเชิงยุทธศาสตร์', icon: Target },
      ]
    },
    {
      title: 'การติดตามและรายงานผล',
      items: [
        { id: 'progress_reports', label: 'รายงานผลรอบ 2 เดือน (สนย.3)', icon: Clock },
      ]
    },
    {
      title: 'การบริหารงบประมาณ',
      items: [
        { id: 'budget_transfers', label: 'ขอโอน/เปลี่ยนแปลงงบ', icon: Scale },
        { id: 'transfer_history', label: 'ประวัติการโอนงบประมาณ', icon: History },
      ]
    },
    {
      title: 'รายงานผู้บริหาร',
      items: [
        { id: 'executive_summary', label: 'สรุปภาพรวมผู้บริหาร', icon: BarChart3 },
        { id: 'unit_breakdown', label: 'รายงานจำแนกตามสำนัก', icon: Building2 },
      ]
    },
    ...(currentUser.role === 'ADMIN' ? [{
      title: 'ผู้ใช้งานและระบบ (Admin)',
      items: [
        { id: 'user_permissions', label: 'จัดการสิทธิ์โครงการ (RBAC)', icon: Users },
        { id: 'settings', label: 'ตั้งค่าระบบ & ฐานข้อมูล', icon: Settings },
      ]
    }] : [])
  ];

  return (
    <aside
      className={`bg-[#073b34] text-white flex flex-col transition-all duration-300 select-none z-30 shrink-0 border-r border-[#052c27] ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Header */}
      <div className="p-3 flex items-center justify-between border-b border-emerald-800/40">
        {!isSidebarCollapsed && (
          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            เมนูการปฏิบัติงาน
          </span>
        )}
        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? 'ขยายเมนู' : 'ซ่อนเมนูหลัก'}
          className="flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white bg-[#052c27] hover:bg-[#04201c] px-2 py-1.5 rounded-md border border-emerald-700/40 transition-colors w-full justify-center"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>ซ่อนเมนูหลัก</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-2.5 text-[11px] font-bold text-emerald-300/70 tracking-wider uppercase">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id as NavTab)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-[#073b34] font-bold shadow-sm'
                        : 'text-emerald-100 hover:bg-[#094c43] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0a4d44]' : (item as any).highlight ? 'text-amber-300' : 'text-emerald-300'}`} />
                    {!isSidebarCollapsed && (
                      <>
                        <span className="truncate text-left leading-snug flex-1">{item.label}</span>
                        {(item as any).highlight && (
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ${
                            isActive ? 'bg-[#0a4d44] text-white' : 'bg-amber-400 text-slate-900 shadow-xs'
                          }`}>
                            ตั้งต้นแผน
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
