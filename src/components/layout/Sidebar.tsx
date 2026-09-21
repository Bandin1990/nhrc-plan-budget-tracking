import React from 'react';
import { 
  LayoutDashboard, TrendingUp, FolderKanban, FileUp, Target, 
  Clock, Printer, Scale, FileText, History, BarChart3, Building2, 
  Users, Cloud, Settings, ChevronLeft, ChevronRight, X, BookOpen, FileSpreadsheet
} from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { NhrcLogo } from '../common/NhrcLogo';

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
  | 'plan_revision_report'
  | 'user_permissions'
  | 'settings'
  | 'user_manual';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { isSidebarCollapsed, toggleSidebar, fiscalYear } = useProjects();
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
        { id: 'word_import', label: 'นำเข้าแผนปฏิบัติการ (Word/AI)', icon: FileUp, highlight: true },
        { id: 'project_catalog', label: 'ทะเบียนโครงการทั้งหมด', icon: FolderKanban },
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
        ...(currentUser.role === 'ADMIN' ? [{ id: 'plan_revision_report', label: 'รายงานทบทวนแผน (Excel)', icon: FileSpreadsheet }] : []),
      ]
    },
    ...(currentUser.role === 'ADMIN' ? [{
      title: 'ผู้ใช้งานและระบบ (Admin)',
      items: [
        { id: 'user_permissions', label: 'จัดการสิทธิ์โครงการ (RBAC)', icon: Users },
        { id: 'settings', label: 'ตั้งค่าระบบ & ฐานข้อมูล', icon: Settings },
        { id: 'user_manual', label: 'คู่มือการใช้งานระบบ', icon: BookOpen },
      ]
    }] : [{
      title: 'ช่วยเหลือและคู่มือ',
      items: [
        { id: 'user_manual', label: 'คู่มือการใช้งานระบบ', icon: BookOpen },
      ]
    }])
  ];

  const handleNavClick = (tabId: NavTab) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderNavContent = (isCollapsed: boolean, isMobileView: boolean) => (
    <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
      {menuGroups.map((group, gIdx) => (
        <div key={gIdx} className="space-y-1">
          {!isCollapsed && (
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
                  onClick={() => handleNavClick(item.id as NavTab)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#073b34] font-bold shadow-md'
                      : 'text-emerald-100 hover:bg-[#094c43] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0a4d44]' : (item as any).highlight ? 'text-amber-300' : 'text-emerald-300'}`} />
                  {!isCollapsed && (
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
  );

  return (
    <>
      {/* 1. Desktop Sidebar (md breakpoint and up) */}
      <aside
        className={`hidden md:flex bg-[#073b34] text-white flex-col transition-all duration-300 select-none z-30 shrink-0 border-r border-[#052c27] ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Desktop Header */}
        <div className="p-3 flex items-center justify-between border-b border-emerald-800/40">
          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'ขยายเมนู' : 'ซ่อนเมนูหลัก'}
            className="flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white bg-[#052c27] hover:bg-[#04201c] px-2 py-1.5 rounded-md border border-emerald-700/40 transition-colors w-full justify-center cursor-pointer"
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

        {/* Desktop Navigation Links */}
        {renderNavContent(isSidebarCollapsed, false)}
      </aside>

      {/* 2. Mobile Slide-Over Drawer Overlay (< md breakpoint) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Dark Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />

          {/* Drawer Container */}
          <div className="relative flex-1 max-w-xs w-full bg-[#073b34] text-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r border-[#052c27]">
            {/* Mobile Drawer Header */}
            <div className="p-4 bg-[#0a4d44] border-b border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-white/95 rounded-lg flex items-center justify-center p-1 shadow-sm shrink-0">
                  <NhrcLogo size={26} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white truncate">สำนักงาน กสม.</h3>
                  <p className="text-[10px] text-emerald-200 truncate">ปีงบประมาณ {fiscalYear}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 hover:text-white border border-emerald-600/40 transition-colors cursor-pointer"
                title="ปิดเมนู"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Drawer Navigation List */}
            {renderNavContent(false, true)}

            {/* Drawer Footer */}
            <div className="p-3 border-t border-emerald-800/40 bg-[#052c27] text-center text-[11px] text-emerald-300/80 font-medium">
              ระบบติดตามแผนและงบประมาณ กสม.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
