import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, Moon, Sun, Bell, 
  Check, ChevronDown, ShieldCheck, LogOut, Users,
  X, FolderKanban, ArrowRight, Sparkles, Building2, Clock, Scale,
  FileUp, LayoutDashboard, Target, TrendingUp, BarChart3, Database, Menu, BookOpen
} from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationPopover } from '../common/NotificationPopover';
import { NhrcLogo } from '../common/NhrcLogo';
import { NavTab } from './Sidebar';
import { formatCurrency } from '../../utils/thaiNumber';

interface NavbarProps {
  onOpenQuickSearch: () => void;
  onNavigate?: (tab: NavTab) => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickSearch, onNavigate, onToggleMobileMenu }) => {
  const { 
    fiscalYear, setFiscalYear, 
    isDarkMode, toggleDarkMode, 
    fontScale, setFontScale,
    searchQuery, setSearchQuery,
    projects,
    supabaseStatus,
    notifications, unreadNotificationsCount,
    markNotificationAsRead, markAllNotificationsAsRead,
    clearAllNotifications
  } = useProjects();

  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  // Spotlight / Command Palette Search Modal State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Keyboard shortcut Ctrl+K to open search dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
        setShowUserMenu(false);
        setShowYearMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFontChange = (delta: number) => {
    const newScale = Math.min(130, Math.max(80, fontScale + delta));
    setFontScale(newScale);
  };

  // Filtered Search Results
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const isSearching = trimmedSearch.length > 0;

  // Filter Projects (Matching code, name, division, responsible person)
  const filteredProjects = isSearching
    ? projects.filter(p => 
        p.name.toLowerCase().includes(trimmedSearch) ||
        p.code.toLowerCase().includes(trimmedSearch) ||
        p.division.toLowerCase().includes(trimmedSearch) ||
        (p.subDivision && p.subDivision.toLowerCase().includes(trimmedSearch)) ||
        (p.responsiblePerson?.name && p.responsiblePerson.name.toLowerCase().includes(trimmedSearch))
      ).slice(0, 6)
    : [];

  // Searchable System Pages / Workflows
  const SYSTEM_MENUS = [
    { tab: 'dashboard' as NavTab, label: 'หน้าหลัก & แดชบอร์ดสรุปผล', desc: 'ภาพรวมงบประมาณและสถานะโครงการทั้งหมด', icon: LayoutDashboard, category: 'ภาพรวม' },
    { tab: 'word_import' as NavTab, label: 'นำเข้าแผนปฏิบัติการประจำปี (Word/AI)', desc: 'แปลงไฟล์เอกสารคำของบประมาณเข้าสู่ระบบและตั้งเป็นแผนประจำปี', icon: FileUp, category: 'แผนงาน' },
    { tab: 'project_catalog' as NavTab, label: 'ทะเบียนโครงการทั้งหมด', desc: 'ค้นหา กรอง และจัดการโครงการประจำปี', icon: FolderKanban, category: 'แผนงาน' },
    { tab: 'strategic_projects' as NavTab, label: 'โครงการเชิงยุทธศาสตร์', desc: 'โครงการสำคัญขับเคลื่อนยุทธศาสตร์สิทธิมนุษยชน', icon: Target, category: 'แผนงาน' },
    { tab: 'progress_reports' as NavTab, label: 'รายงานผลรอบ 2 เดือน (สนย.3)', desc: 'บันทึกผลการดำเนินงานและปัญหาอุปสรรค', icon: Clock, category: 'รายงานผล' },
    { tab: 'print_snyo3' as NavTab, label: 'พิมพ์แบบรายงาน สนย.3', desc: 'จัดพิมพ์เอกสารแบบรายงานผลตามแบบราชการ', icon: Clock, category: 'รายงานผล' },
    { tab: 'budget_transfers' as NavTab, label: 'ขอโอน/เปลี่ยนแปลงงบ', desc: 'ยื่นคำขอโอนเปลี่ยนแปลงงบประมาณตามระเบียบ 2566', icon: Scale, category: 'งบประมาณ' },
    { tab: 'print_memo' as NavTab, label: 'พิมพ์บันทึกข้อความตราครุฑ', desc: 'พิมพ์เอกสารขออนุมัติโอนงบประมาณราชการ', icon: Scale, category: 'งบประมาณ' },
    { tab: 'transfer_history' as NavTab, label: 'ประวัติการโอนงบประมาณ', desc: 'ตรวจสอบรายการโอนเปลี่ยนแปลงงบประมาณ', icon: Scale, category: 'งบประมาณ' },
    { tab: 'budget_comparison' as NavTab, label: 'เปรียบเทียบแผน vs ผลการใช้จ่าย', desc: 'วิเคราะห์อัตราการเบิกจ่ายงบประมาณ', icon: TrendingUp, category: 'วิเคราะห์' },
    { tab: 'unit_breakdown' as NavTab, label: 'รายงานจำแนกตามสำนัก', desc: 'สรุปงบประมาณและผลการดำเนินงานจำแนกตามสำนัก/หน่วยงาน', icon: Building2, category: 'วิเคราะห์' },
    ...(currentUser.role === 'ADMIN' ? [
      { tab: 'user_permissions' as NavTab, label: 'จัดการสิทธิ์ผู้ใช้งาน (RBAC)', desc: 'กำหนดสิทธิ์โครงการและบทบาทผู้ใช้งาน', icon: Users, category: 'ระบบ' },
    ] : []),
    { tab: 'user_manual' as NavTab, label: 'คู่มือการใช้งานระบบ (User Manual)', desc: 'ขั้นตอนการใช้งานระบบ การสกัดไฟล์ Word และคำถามที่พบบ่อย', icon: BookOpen, category: 'ช่วยเหลือ' },
  ];

  const filteredMenus = isSearching
    ? SYSTEM_MENUS.filter(m => m.label.toLowerCase().includes(trimmedSearch) || m.desc.toLowerCase().includes(trimmedSearch) || m.category.toLowerCase().includes(trimmedSearch)).slice(0, 4)
    : [];

  const handleSelectProject = (projectName: string) => {
    setSearchQuery(projectName);
    setIsSearchModalOpen(false);
    if (onNavigate) {
      onNavigate('project_catalog');
    }
  };

  const handleSelectMenu = (tab: NavTab) => {
    setIsSearchModalOpen(false);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Supported fiscal years
  const FISCAL_YEARS = [2572, 2571, 2570, 2569, 2568, 2567];

  return (
    <header className="sticky top-0 z-40 bg-[#0a4d44] text-white shadow-md select-none border-b border-[#083b34]">
      {/* Top Main Bar */}
      <div className="flex items-center justify-between px-2.5 sm:px-4 lg:px-6 h-16 gap-2 sm:gap-3">
        {/* Left: Branding & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Menu Hamburger Button */}
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl bg-[#073b34] hover:bg-[#052c27] text-emerald-200 hover:text-white border border-emerald-600/40 transition-colors cursor-pointer shrink-0"
              title="เปิดเมนูการใช้งาน"
            >
              <Menu className="w-5 h-5 text-emerald-300" />
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/95 rounded-xl flex items-center justify-center p-1 shadow-md shrink-0 border border-white/20">
              <NhrcLogo size={32} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-base lg:text-lg font-bold tracking-tight text-white truncate">
                  ระบบติดตามแผนและงบประมาณ
                </h1>
                <span className="hidden xl:inline-block text-xs font-bold bg-[#126b5f] text-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-400/30 shrink-0">
                  สำนักงาน กสม.
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-200/90 font-medium truncate">
                สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ
              </p>
            </div>
          </div>
        </div>

        {/* Center: Spacious Search Trigger Button */}
        <div className="flex-1 max-w-md hidden md:flex items-center justify-center px-2">
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-2 bg-[#073b34]/90 hover:bg-[#073b34] text-emerald-200/80 hover:text-white rounded-xl border border-emerald-500/40 shadow-inner transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="h-4 w-4 text-emerald-300 group-hover:text-white shrink-0" />
              <span className="text-xs sm:text-sm text-emerald-100/70 group-hover:text-white truncate">
                {searchQuery ? searchQuery : "ค้นหาโครงการ, รหัส, สำนัก, หรือเมนู..."}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {searchQuery && (
                <span 
                  onClick={(e) => { e.stopPropagation(); handleClearSearch(); }}
                  className="p-0.5 hover:bg-emerald-800/80 rounded-full text-emerald-300 hover:text-white"
                  title="ล้างคำค้นหา"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              )}
              <kbd className="hidden lg:inline-block text-[11px] bg-emerald-950/70 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700/50 font-semibold shadow-xs">
                Ctrl K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Icon Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="md:hidden p-2 rounded-xl bg-[#073b34] hover:bg-[#052c27] text-emerald-200 hover:text-white border border-emerald-600/40 transition-colors cursor-pointer"
            title="ค้นหา"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Fiscal Year Selector */}
          <div className="relative">
            <button
              onClick={() => setShowYearMenu(!showYearMenu)}
              className="flex items-center gap-1.5 text-xs font-bold bg-[#073b34] hover:bg-[#052c27] text-white px-3 py-1.5 rounded-xl border border-emerald-600/40 transition-colors shadow-xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              <span>ปีงบฯ {fiscalYear}</span>
              <ChevronDown className="w-3 h-3 text-emerald-300" />
            </button>

            {showYearMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/10" 
                  onClick={() => setShowYearMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                    เลือกปีงบประมาณ
                  </div>
                  {FISCAL_YEARS.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => {
                        setFiscalYear(yr);
                        setShowYearMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                        fiscalYear === yr 
                          ? 'font-bold text-[#0a4d44] dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40' 
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>ปีงบประมาณ พ.ศ. {yr}</span>
                        {yr === 2569 && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">ปัจจุบัน</span>
                        )}
                      </span>
                      {fiscalYear === yr && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Font Scale Adjuster */}
          <div className="hidden sm:flex items-center bg-[#073b34] rounded-xl border border-emerald-600/40 text-xs px-2 py-0.5 shadow-xs">
            <button
              title="ลดขนาดตัวอักษร"
              onClick={() => handleFontChange(-5)}
              className="px-1.5 py-1 text-emerald-200 hover:text-white transition-colors cursor-pointer font-bold"
            >
              A-
            </button>
            <span className="text-xs px-1.5 font-bold text-emerald-300">
              {fontScale}%
            </span>
            <button
              title="เพิ่มขนาดตัวอักษร"
              onClick={() => handleFontChange(5)}
              className="px-1.5 py-1 text-emerald-200 hover:text-white transition-colors cursor-pointer font-bold"
            >
              A+
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            title="สลับโหมดมืด/สว่าง"
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-[#073b34] hover:bg-[#052c27] text-emerald-200 hover:text-white border border-emerald-600/40 transition-colors cursor-pointer shadow-xs"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              title="การแจ้งเตือนและรายการรอติดตาม"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative p-2 rounded-xl border transition-colors cursor-pointer shadow-xs ${
                isNotificationsOpen 
                  ? 'bg-emerald-800 text-white border-emerald-400' 
                  : 'bg-[#073b34] hover:bg-[#052c27] text-emerald-200 hover:text-white border-emerald-600/40'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-amber-400 text-slate-900 font-extrabold text-[10px] rounded-full flex items-center justify-center leading-none shadow-sm animate-pulse">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            <NotificationPopover
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              notifications={notifications}
              unreadCount={unreadNotificationsCount}
              onMarkAsRead={markNotificationAsRead}
              onMarkAllAsRead={markAllNotificationsAsRead}
              onClearAll={clearAllNotifications}
              onNavigate={onNavigate}
            />
          </div>

          {/* Current User Profile Button */}
          <div className="relative ml-1">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-[#073b34] hover:bg-[#052c27] pl-1.5 pr-2.5 py-1 rounded-full border border-emerald-500/40 transition-all text-left cursor-pointer"
            >
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-7 h-7 rounded-full object-cover border border-emerald-300/40"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold border border-emerald-300/30">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="hidden xl:flex flex-col">
                <span className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">
                  {currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1]?.charAt(0)}.
                </span>
                <span className="text-[10px] text-emerald-300 font-medium">
                  {currentUser.division} ({currentUser.role})
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-emerald-300" />
            </button>

            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px]" 
                  onClick={() => setShowUserMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 z-50 animate-in fade-in zoom-in-95">
                  {/* User Profile Avatar & Header */}
                  <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative mb-3">
                      {currentUser.avatar ? (
                        <img 
                          src={currentUser.avatar} 
                          alt={currentUser.name} 
                          className="w-20 h-20 rounded-full object-cover border-3 border-emerald-500 shadow-md mx-auto"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0a4d44] to-emerald-500 text-white flex items-center justify-center text-2xl font-bold border-3 border-emerald-500 shadow-md mx-auto">
                          {currentUser.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs" title="เข้าสู่ระบบผ่าน NHRC Single Sign-On แล้ว">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-800 dark:text-white leading-snug">
                      {currentUser.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {currentUser.position}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                      <span>สำนัก: {currentUser.division}</span>
                      <span>•</span>
                      <span>{currentUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : currentUser.role === 'PROJECT_OWNER' ? 'ผู้รับผิดชอบโครงการ' : currentUser.role === 'EXECUTIVE' ? 'ผู้บริหาร' : 'ผู้ตรวจ/ผู้ใช้งาน'}</span>
                    </div>
                  </div>

                  {/* Profile Details (Read-only, no management) */}
                  <div className="py-3.5 space-y-2.5 text-xs border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400">ชื่อผู้ใช้งาน (SSO):</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">@{currentUser.username || 'user'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400">อีเมลราชการ:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{currentUser.email}</span>
                    </div>
                    {currentUser.subDivision && (
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="text-slate-400 shrink-0">กลุ่มงาน/ฝ่าย:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 text-right truncate max-w-[180px]">{currentUser.subDivision}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400">การยืนยันตัวตน:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        NHRC Single Sign-On
                      </span>
                    </div>
                  </div>

                  {/* Single Sign-Out Button - Strictly no other management options */}
                  <div className="pt-3">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ (Sign Out)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>


      {/* ========================================================================= */}
      {/* ENTERPRISE COMMAND PALETTE / SPOTLIGHT SEARCH MODAL DIALOG (650px Wide) */}
      {/* ========================================================================= */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-4 animate-in fade-in duration-150">
          {/* Backdrop click to dismiss */}
          <div 
            className="fixed inset-0 pointer-events-auto" 
            onClick={() => setIsSearchModalOpen(false)} 
          />

          {/* Centered Modal Content Card (Roomy, Wide, Never Squished) */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[82vh]">
            {/* Modal Search Header Input */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/70 dark:bg-slate-800/50">
              <Search className="w-6 h-6 text-[#0a4d44] dark:text-emerald-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="พิมพ์ชื่อโครงการ, รหัสกิจกรรม, สำนัก, หรือเมนูที่ต้องการค้นหา..."
                className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-slate-900 dark:text-white placeholder-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="ล้างข้อความ"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <kbd 
                onClick={() => setIsSearchModalOpen(false)}
                className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold cursor-pointer hover:bg-slate-300 transition-colors"
                title="กด Esc หรือคลิกเพื่อปิด"
              >
                ESC
              </kbd>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isSearching ? (
                <>
                  {/* Matching Projects */}
                  {filteredProjects.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <FolderKanban className="w-4 h-4 text-[#0a4d44] dark:text-emerald-400" />
                          <span>โครงการที่ตรงกับคำค้นหา</span>
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{filteredProjects.length} โครงการ</span>
                      </div>
                      <div className="space-y-1.5 mt-1.5">
                        {filteredProjects.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectProject(p.name)}
                            className="w-full text-left p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all flex items-start gap-3 group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-[#0a4d44] dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                              <FolderKanban className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-bold text-[#0a4d44] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                  {p.code}
                                </span>
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-semibold text-slate-700 dark:text-slate-300">
                                  {p.division}
                                </span>
                                {p.responsiblePerson?.name && (
                                  <span className="text-xs text-slate-400 truncate">
                                    • ผู้รับผิดชอบ: {p.responsiblePerson.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-900 dark:text-white font-bold group-hover:text-[#0a4d44] dark:group-hover:text-emerald-300 leading-snug">
                                {p.name}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <span>งบจัดสรร: <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(p.budgetAllocated)}</strong> บาท</span>
                                <span>เบิกจ่าย: <strong className="text-emerald-600">{formatCurrency(p.budgetSpent)}</strong> บาท</span>
                                <span>ความก้าวหน้า: <strong className="text-blue-600">{p.progressPercent}%</strong></span>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#0a4d44] dark:group-hover:text-emerald-400 shrink-0 self-center transition-transform group-hover:translate-x-1" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Menus & Pages */}
                  {filteredMenus.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>เมนูระบบและหน้างาน</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                        {filteredMenus.map((m) => {
                          const Icon = m.icon;
                          return (
                            <button
                              key={m.tab}
                              type="button"
                              onClick={() => handleSelectMenu(m.tab)}
                              className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:text-[#0a4d44]">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0a4d44] truncate">
                                    {m.label}
                                  </p>
                                  <p className="text-[11px] text-slate-400 truncate">{m.desc}</p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0a4d44] shrink-0 ml-2" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty state if nothing matches */}
                  {filteredProjects.length === 0 && filteredMenus.length === 0 && (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="text-base font-bold text-slate-600 dark:text-slate-300">
                        ไม่พบข้อมูลที่ตรงกับ "{searchQuery}"
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        ลองค้นหาด้วยรหัสกิจกรรม (เช่น 69M1_12002), ชื่อโครงการ หรือชื่อสำนัก (เช่น สนย., สสค., สดส.)
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* When search is empty: show popular quick shortcuts & helpful jump links */
                <div className="space-y-4 py-2">
                  <div>
                    <div className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>ทางลัดด่วนยอดนิยม (Quick Access)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectMenu('project_catalog')}
                        className="p-3 text-left rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700/80 border border-slate-100 dark:border-slate-700 transition-colors flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#0a4d44] dark:text-emerald-300 flex items-center justify-center shrink-0">
                          <FolderKanban className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0a4d44]">
                            ทะเบียนโครงการทั้งหมด
                          </p>
                          <p className="text-[11px] text-slate-400">ค้นหา กรอง และตรวจสอบสถานะ</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectMenu('strategic_projects')}
                        className="p-3 text-left rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700/80 border border-slate-100 dark:border-slate-700 transition-colors flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0a4d44]">
                            โครงการเชิงยุทธศาสตร์
                          </p>
                          <p className="text-[11px] text-slate-400">โครงการสำคัญขับเคลื่อน กสม.</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectMenu('progress_reports')}
                        className="p-3 text-left rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700/80 border border-slate-100 dark:border-slate-700 transition-colors flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0a4d44]">
                            รายงานผลรอบ 2 เดือน (สนย.3)
                          </p>
                          <p className="text-[11px] text-slate-400">บันทึกผลงานและพิมพ์แบบ สนย.3</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectMenu('budget_transfers')}
                        className="p-3 text-left rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700/80 border border-slate-100 dark:border-slate-700 transition-colors flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                          <Scale className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0a4d44]">
                            ขอโอน/เปลี่ยนแปลงงบ
                          </p>
                          <p className="text-[11px] text-slate-400">ยื่นคำขอและพิมพ์บันทึกตราครุฑ</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Search Hint */}
                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>เคล็ดลับ:</strong> พิมพ์ชื่อสำนัก เช่น <em>สนย.</em>, <em>สสค.</em> หรือ <em>สดส.</em> เพื่อค้นหาโครงการของหน่วยงานนั้น ๆ ได้ทันที</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Status Footer */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>กดปุ่ม</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-[10px] font-semibold">ESC</kbd>
                <span>เพื่อปิดหน้าต่างค้นหา</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSearchModalOpen(false);
                  if (onNavigate) onNavigate('project_catalog');
                }}
                className="font-bold text-[#0a4d44] dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>เปิดดูทะเบียนโครงการทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
