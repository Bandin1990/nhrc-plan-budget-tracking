import React, { useState } from 'react';
import { 
  Users, Shield, ShieldCheck, Lock, Unlock, UserCheck, Key, Plus, 
  Trash2, Edit, Check, X, Search, Filter, AlertCircle, Save, ShieldAlert, Database, Upload, Camera,
  Calendar, Clock, Sliders, CheckSquare, Square, FileText, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectContext';
import { User, UserRole } from '../../types/user';
import { NHRC_UNITS, NHRCUnit } from '../../types/project';
import { supabaseService } from '../../services/supabaseService';

export const UserPermissionManagement: React.FC = () => {
  const { allUsers, currentUser, switchUser, addUser, updateUser, deleteUser } = useAuth();
  const { projects, unlockProjectForEdit, relockProject } = useProjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Fiscal Year Filter & Search for Project Assignment in Modal
  const [assignFiscalYearFilter, setAssignFiscalYearFilter] = useState<string>('all');
  const [assignSearchTerm, setAssignSearchTerm] = useState<string>('');

  // Admin Global System Edit Window Settings
  const [editWindowEnabled, setEditWindowEnabled] = useState<boolean>(() => {
    return localStorage.getItem('nhrc_edit_window_enabled') === 'true';
  });
  const [editWindowStart, setEditWindowStart] = useState<string>(() => {
    return localStorage.getItem('nhrc_edit_window_start') || `${new Date().getFullYear() + 543 - 543}-09-01`;
  });
  const [editWindowEnd, setEditWindowEnd] = useState<string>(() => {
    return localStorage.getItem('nhrc_edit_window_end') || `${new Date().getFullYear() + 543 - 543}-10-31`;
  });
  const [editWindowNote, setEditWindowNote] = useState<string>(() => {
    return localStorage.getItem('nhrc_edit_window_note') || 'เปิดระบบให้บันทึกรายงานผลรอบ 6 เดือน และปรับปรุงรายละเอียดโครงการประจำปีงบประมาณ 2569';
  });

  // Per-Project Unlock Filter
  const [unlockFilterYear, setUnlockFilterYear] = useState<string>('all');
  const [unlockFilterSearch, setUnlockFilterSearch] = useState<string>('');

  // Active Sub-Tab view inside Permission Management ("users", "window_settings", "project_unlocks")
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'window_settings' | 'project_unlocks'>('users');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    position: '',
    division: 'สนย.' as NHRCUnit,
    subDivision: '',
    email: '',
    role: 'PROJECT_OWNER' as UserRole,
    avatar: '',
    assignedProjectIds: [] as string[]
  });

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'กรุณาเลือกไฟล์รูปภาพเท่านั้น (.jpg, .png, .webp ฯลฯ)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({ ...prev, avatar: dataUrl }));
          showFeedback('success', 'แนบรูปภาพโปรไฟล์เรียบร้อยแล้ว');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
            ท่านกำลังเข้าสู่ระบบในฐานะ <strong>{currentUser.name} ({currentUser.role})</strong> ซึ่งไม่มีสิทธิ์เข้าถึงระบบจัดการผู้ใช้งานและสิทธิ์การเข้าถึง (User Management & RBAC)
          </p>
        </div>
        <div className="pt-2 text-xs text-slate-400">
          กรุณาติดต่อผู้ดูแลระบบหลักของสำนักนโยบายและยุทธศาสตร์
        </div>
      </div>
    );
  }

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: 'password123',
      position: 'นักวิชาการสิทธิมนุษยชนปฏิบัติการ',
      division: 'สนย.',
      subDivision: 'กลุ่มงานนโยบายและยุทธศาสตร์',
      email: '',
      role: 'PROJECT_OWNER',
      avatar: '',
      assignedProjectIds: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username || user.email.split('@')[0],
      password: user.password || 'password123',
      position: user.position,
      division: user.division,
      subDivision: user.subDivision,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      assignedProjectIds: [...user.assignedProjectIds]
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) {
      showFeedback('error', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    if (editingUser) {
      // Update existing
      const res = updateUser({
        ...editingUser,
        name: formData.name,
        username: formData.username,
        password: formData.password,
        position: formData.position,
        division: formData.division,
        subDivision: formData.subDivision,
        email: formData.email,
        role: formData.role,
        avatar: formData.avatar || undefined,
        assignedProjectIds: formData.role === 'ADMIN' ? ['all'] : formData.assignedProjectIds
      });
      if (res.success) {
        showFeedback('success', res.message);
        setIsModalOpen(false);
      } else {
        showFeedback('error', res.message);
      }
    } else {
      // Add new
      const res = addUser({
        name: formData.name,
        username: formData.username,
        password: formData.password,
        position: formData.position,
        division: formData.division,
        subDivision: formData.subDivision,
        email: formData.email,
        role: formData.role,
        avatar: formData.avatar || undefined,
        assignedProjectIds: formData.role === 'ADMIN' ? ['all'] : formData.assignedProjectIds
      });
      if (res.success) {
        showFeedback('success', res.message);
        setIsModalOpen(false);
      } else {
        showFeedback('error', res.message);
      }
    }
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`คุณต้องการลบผู้ใช้งาน "${name}" ออกจากระบบใช่หรือไม่?`)) {
      const res = deleteUser(userId);
      if (res.success) {
        showFeedback('success', res.message);
      } else {
        showFeedback('error', res.message);
      }
    }
  };

  const handleSyncUsersToSupabase = async () => {
    setIsSyncingUsers(true);
    try {
      await supabaseService.upsertUsersBatch(allUsers);
      showFeedback('success', `ซิงค์บัญชีผู้ใช้งาน ${allUsers.length} ท่านไปยังฐานข้อมูล Supabase สำเร็จ`);
    } catch (err: any) {
      showFeedback('error', `ไม่สามารถซิงค์ไปยัง Supabase ได้: ${err.message}`);
    } finally {
      setIsSyncingUsers(false);
    }
  };

  const handleSaveWindowConfig = () => {
    localStorage.setItem('nhrc_edit_window_enabled', editWindowEnabled ? 'true' : 'false');
    localStorage.setItem('nhrc_edit_window_start', editWindowStart);
    localStorage.setItem('nhrc_edit_window_end', editWindowEnd);
    localStorage.setItem('nhrc_edit_window_note', editWindowNote);
    showFeedback('success', 'บันทึกการตั้งค่าช่วงเวลาเปิดสิทธิ์แก้ไขและรายงานผลเรียบร้อยแล้ว');
  };

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-16 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-[#0a4d44] rounded-full inline-block"></span>
            <span>ระบบจัดการผู้ใช้งานและสิทธิ์การเข้าถึง (User Management & RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            จัดการบัญชีเจ้าหน้าที่ กำหนดบทบาท และมอบหมายสิทธิ์การแก้ไขโครงการ (Row-Level Security)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncUsersToSupabase}
            disabled={isSyncingUsers}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl font-bold shadow-sm transition-all cursor-pointer"
            title="ซิงค์ข้อมูลผู้ใช้งานทั้งหมดขึ้นฐานข้อมูล Supabase"
          >
            <Database className="w-4 h-4" />
            <span>{isSyncingUsers ? 'กำลังซิงค์...' : 'ซิงค์บัญชีไป Supabase'}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-[#0a4d44] hover:bg-[#073b34] text-white px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มผู้ใช้งานใหม่</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span className="font-semibold">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-[#0a4d44] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>รายชื่อผู้ใช้งานและสิทธิ์ ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('window_settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'window_settings'
              ? 'bg-[#0a4d44] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>กำหนดช่วงเวลาเปิดระบบแก้ไข & รายงานผล</span>
          {editWindowEnabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('project_unlocks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'project_unlocks'
              ? 'bg-[#0a4d44] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Unlock className="w-4 h-4 text-amber-400" />
          <span>อนุมัติปลดล็อกสิทธิ์รายโครงการ</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
            {projects.filter(p => p.unlockedForEdit).length} ปลดล็อกอยู่
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: USERS & ROLES */}
      {activeSubTab === 'users' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Roles Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 font-bold text-[#0a4d44] dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
                <span>ADMIN (ผู้ดูแลแผน)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                สิทธิ์สูงสุด จัดการ เพิ่ม แก้ไข ลบ ทุกโครงการ และอนุมัติรายงานผล สนย.3
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300">
                <UserCheck className="w-4 h-4" />
                <span>PROJECT_OWNER</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                แก้ไขและบันทึกรายงานผลรอบ 2 เดือน ได้เฉพาะโครงการที่ตนเองรับผิดชอบ
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300">
                <Shield className="w-4 h-4" />
                <span>EXECUTIVE (ผู้บริหาร)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                ดูภาพรวมระดับองค์กร อนุมัติการขอโอนงบ และพิมพ์รายงานสรุปผู้บริหาร
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                <Lock className="w-4 h-4" />
                <span>VIEWER (ผู้ตรวจ/ทั่วไป)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                ดูภาพรวม แดชบอร์ด และเอกสารรายงานผลทั้งหมด (Read-Only)
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            {/* Table Filter Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-white">
                  รายชื่อผู้ใช้งานทั้งหมด ({filteredUsers.length} ท่าน)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ค้นหาชื่อ, สังกัด, ตำแหน่ง..."
                    className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#0a4d44]"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="all">ทุกบทบาท (All Roles)</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="PROJECT_OWNER">PROJECT_OWNER</option>
                  <option value="EXECUTIVE">EXECUTIVE</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">ชื่อ - นามสกุล / ชื่อผู้ใช้</th>
                    <th className="py-3 px-3">ตำแหน่ง</th>
                    <th className="py-3 px-3">สำนัก / สังกัด</th>
                    <th className="py-3 px-3">สิทธิ์ในระบบ (Role)</th>
                    <th className="py-3 px-3">โครงการที่รับผิดชอบ</th>
                    <th className="py-3 px-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => {
                    const isCurrent = currentUser.id === u.id;
                    const assignedCount = u.assignedProjectIds?.includes('all') 
                      ? 'ทุกโครงการ (Admin)' 
                      : `${u.assignedProjectIds?.length || 0} โครงการ`;

                    return (
                      <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isCurrent ? 'bg-emerald-50/50 dark:bg-emerald-950/30' : ''}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {u.avatar ? (
                              <img 
                                src={u.avatar} 
                                alt={u.name} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {u.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-800 dark:text-white">{u.name}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-emerald-700 dark:text-emerald-400">@{u.username || u.email.split('@')[0]}</span>
                                <span>•</span>
                                <span>{u.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{u.position}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                            {u.division === 'งบบริหาร กสม.' ? 'ผู้บริหาร' : u.division}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' :
                            u.role === 'PROJECT_OWNER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300' :
                            u.role === 'EXECUTIVE' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300' : 
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {assignedCount}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              title="แก้ไขข้อมูลผู้ใช้"
                              className="p-1.5 text-slate-500 hover:text-[#0a4d44] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              disabled={isCurrent}
                              title={isCurrent ? 'ไม่สามารถลบบัญชีที่กำลังใช้งานได้' : 'ลบผู้ใช้'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isCurrent
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GLOBAL EDIT TIME WINDOW CONTROL */}
      {activeSubTab === 'window_settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-[#0a4d44] dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  กำหนดช่วงเวลาเปิดสิทธิ์แก้ไขรายละเอียดโครงการและรายงานผล (Admin Window Control)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  กำหนดวันเริ่มต้น-สิ้นสุด สำหรับให้เจ้าของโครงการ (Project Owner) แก้ไขและบันทึกรายงานผลรอบ 2 เดือน
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
              <input
                type="checkbox"
                checked={editWindowEnabled}
                onChange={(e) => setEditWindowEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-[#0a4d44] focus:ring-emerald-500 cursor-pointer"
              />
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {editWindowEnabled ? 'เปิดใช้งานการจำกัดช่วงเวลา' : 'ปิดใช้งาน (ไม่จำกัดช่วงเวลา)'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0a4d44] dark:text-emerald-400" />
                <span>วันเริ่มต้นเปิดระบบ (Start Date)</span>
              </label>
              <input
                type="date"
                value={editWindowStart}
                onChange={(e) => setEditWindowStart(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0a4d44]"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>วันสิ้นสุดปิดระบบ (End Date)</span>
              </label>
              <input
                type="date"
                value={editWindowEnd}
                onChange={(e) => setEditWindowEnd(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0a4d44]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              ข้อความแจ้งเตือนผู้ใช้งาน (คำชี้แจงรอบรายงานผล)
            </label>
            <input
              type="text"
              value={editWindowNote}
              onChange={(e) => setEditWindowNote(e.target.value)}
              placeholder="เช่น เปิดระบบให้บันทึกรายงานผลรอบ 6 เดือน และปรับปรุงรายละเอียดโครงการประจำปีงบประมาณ 2569"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0a4d44]"
            />
          </div>

          {/* Presets Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-bold text-xs">ปุ่มลัดช่วงเวลา:</span>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const startStr = today.toISOString().split('T')[0];
                  const endDate = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
                  const endStr = endDate.toISOString().split('T')[0];
                  setEditWindowStart(startStr);
                  setEditWindowEnd(endStr);
                  setEditWindowEnabled(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-colors"
              >
                เปิด 15 วันนับจากวันนี้
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const startStr = today.toISOString().split('T')[0];
                  const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                  const endStr = endDate.toISOString().split('T')[0];
                  setEditWindowStart(startStr);
                  setEditWindowEnd(endStr);
                  setEditWindowEnabled(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold text-xs hover:bg-blue-100 transition-colors"
              >
                เปิด 30 วันนับจากวันนี้
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveWindowConfig}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0a4d44] hover:bg-[#073b34] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่าช่วงเวลา</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PER-PROJECT UNLOCK PERMISSIONS */}
      {activeSubTab === 'project_unlocks' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Unlock className="w-5 h-5 text-amber-500" />
                <span>อนุญาตสิทธิ์แก้ไขรายโครงการ (Per-Project Unlock Permissions)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Admin สามารถอนุญาตให้เจ้าของโครงการแก้ไขข้อมูลโครงการเฉพาะรายโครงการได้ แม้ว่าจะอยู่ในหรือนอกช่วงเวลากำหนดการ
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">กรองตามปีงบประมาณ:</label>
              <select
                value={unlockFilterYear}
                onChange={(e) => setUnlockFilterYear(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-[#0a4d44] dark:text-emerald-400 outline-none"
              >
                <option value="all">ทุกปีงบประมาณ</option>
                <option value="2570">ปีงบประมาณ 2570</option>
                <option value="2569">ปีงบประมาณ 2569</option>
                <option value="2568">ปีงบประมาณ 2568</option>
                <option value="2571">ปีงบประมาณ 2571</option>
              </select>
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={unlockFilterSearch}
                onChange={(e) => setUnlockFilterSearch(e.target.value)}
                placeholder="ค้นหาชื่อ หรือรหัสโครงการ..."
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0a4d44]"
              />
            </div>
          </div>

          {/* Projects Unlock List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
            {projects
              .filter(p => {
                const matchYear = unlockFilterYear === 'all' || String(p.fiscalYear || 2569) === unlockFilterYear;
                const matchSearch = p.name.toLowerCase().includes(unlockFilterSearch.toLowerCase()) || p.code.toLowerCase().includes(unlockFilterSearch.toLowerCase());
                return matchYear && matchSearch;
              })
              .map((p) => {
                const isUnlocked = Boolean(p.unlockedForEdit);
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isUnlocked
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            ปี {p.fiscalYear || 2569}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {p.division}
                          </span>
                          <span className="font-mono text-slate-500">[{p.code}]</span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                          isUnlocked
                            ? 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {isUnlocked ? (
                            <>
                              <Unlock className="w-3 h-3 text-amber-600" />
                              <span>ปลดล็อกสิทธิ์แก้ไขแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>ล็อกตามระเบียบ</span>
                            </>
                          )}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-800 dark:text-white line-clamp-2">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        ผู้รับผิดชอบ: {p.responsiblePerson?.name || p.division}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400">
                        {isUnlocked ? `เหตุผล: ${p.unlockReason || 'อนุมัติโดย Admin'}` : 'สถานะปกติ'}
                      </span>

                      {isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => {
                            relockProject(p.id);
                            showFeedback('success', `ล็อกข้อมูลโครงการ "${p.code}" กลับคืนเรียบร้อย`);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>ล็อกคืนสิทธิ์</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            unlockProjectForEdit(p.id, 'อนุมัติสิทธิ์แก้ไขเป็นรายโครงการโดยผู้ดูแลระบบ');
                            showFeedback('success', `อนุมัติปลดล็อกสิทธิ์แก้ไขโครงการ "${p.code}" สำเร็จ`);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>อนุมัติปลดล็อกแก้ไข</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* User Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden my-8">
            <div className="p-4 bg-gradient-to-r from-[#0a4d44] to-[#073b34] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>{editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-emerald-200 hover:text-white rounded-md hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    ชื่อ - นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น นายมานะ สิทธิคุณ"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0a4d44]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    ชื่อผู้ใช้ (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="เช่น mana.s"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0a4d44]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    อีเมล (Email) *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="mana@nhrc.or.th"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0a4d44]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    รหัสผ่าน (Password)
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="password123"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0a4d44]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    สำนัก / สังกัด
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value as NHRCUnit })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    {Object.keys(NHRC_UNITS).map((key) => (
                      <option key={key} value={key}>
                        {key === 'งบบริหาร กสม.' ? 'ผู้บริหาร' : `${key} - ${NHRC_UNITS[key as NHRCUnit].fullName}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    ตำแหน่ง
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="นักวิชาการสิทธิมนุษยชนชำนาญการ"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  กลุ่มงาน / ฝ่าย
                </label>
                <input
                  type="text"
                  value={formData.subDivision}
                  onChange={(e) => setFormData({ ...formData, subDivision: e.target.value })}
                  placeholder="กลุ่มงานนโยบายและยุทธศาสตร์"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  รูปถ่ายโปรไฟล์ (แนบรูปภาพหรือระบุ URL)
                </label>
                <div className="flex items-center gap-3">
                  {formData.avatar ? (
                    <div className="relative group shrink-0">
                      <img 
                        src={formData.avatar} 
                        alt="Avatar Preview" 
                        className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow-xs" 
                        onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: '' })}
                        className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 transition-colors cursor-pointer"
                        title="ลบรูปภาพ"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-5 h-5 text-slate-400" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        id="user-avatar-file-input"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="user-avatar-file-input"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>แนบภาพจากเครื่อง</span>
                      </label>
                    </div>

                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="หรือวาง URL รูปภาพ (https://...)"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  บทบาทและสิทธิ์ในระบบ (Role)
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-[#0a4d44] dark:text-emerald-300"
                >
                  <option value="ADMIN">ADMIN - ผู้ดูแลระบบ (แก้ไขได้ทุกโครงการ)</option>
                  <option value="PROJECT_OWNER">PROJECT_OWNER - เจ้าของโครงการ (แก้ไขเฉพาะโครงการที่ระบุ)</option>
                  <option value="EXECUTIVE">EXECUTIVE - ผู้บริหาร (ดูภาพรวม / อนุมัติการโอน)</option>
                  <option value="VIEWER">VIEWER - ผู้ตรวจดู / ทั่วไป (ดูภาพรวมได้อย่างเดียว)</option>
                </select>
              </div>

              {formData.role === 'PROJECT_OWNER' && (
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold">
                      มอบหมายโครงการที่รับผิดชอบ (เลือกได้หลายโครงการ)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={assignFiscalYearFilter}
                        onChange={(e) => setAssignFiscalYearFilter(e.target.value)}
                        className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-[#0a4d44] dark:text-emerald-400 outline-none"
                      >
                        <option value="all">ทุกปีงบประมาณ</option>
                        <option value="2570">ปีงบประมาณ 2570</option>
                        <option value="2569">ปีงบประมาณ 2569</option>
                        <option value="2568">ปีงบประมาณ 2568</option>
                        <option value="2571">ปีงบประมาณ 2571</option>
                      </select>
                    </div>
                  </div>

                  {/* Search and Quick Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="relative flex-1 min-w-[180px]">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={assignSearchTerm}
                        onChange={(e) => setAssignSearchTerm(e.target.value)}
                        placeholder="ค้นด้วยรหัส หรือชื่อโครงการ..."
                        className="w-full pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#0a4d44]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = projects.filter(p => {
                            const matchYear = assignFiscalYearFilter === 'all' || String(p.fiscalYear || 2569) === assignFiscalYearFilter;
                            const matchSearch = p.name.toLowerCase().includes(assignSearchTerm.toLowerCase()) || p.code.toLowerCase().includes(assignSearchTerm.toLowerCase());
                            return matchYear && matchSearch;
                          }).map(p => p.id);
                          const combined = Array.from(new Set([...formData.assignedProjectIds, ...filtered]));
                          setFormData({ ...formData, assignedProjectIds: combined });
                        }}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 cursor-pointer"
                      >
                        เลือกทั้งหมดที่กรอง
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, assignedProjectIds: [] })}
                        className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg border border-rose-200 cursor-pointer"
                      >
                        ล้างการเลือก
                      </button>
                    </div>
                  </div>

                  {/* Project Checklist Box */}
                  <div className="max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                    {projects
                      .filter(p => {
                        const matchYear = assignFiscalYearFilter === 'all' || String(p.fiscalYear || 2569) === assignFiscalYearFilter;
                        const matchSearch = p.name.toLowerCase().includes(assignSearchTerm.toLowerCase()) || p.code.toLowerCase().includes(assignSearchTerm.toLowerCase());
                        return matchYear && matchSearch;
                      })
                      .map((p) => {
                        const isSelected = formData.assignedProjectIds.includes(p.id);
                        return (
                          <label key={p.id} className="flex items-start gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    assignedProjectIds: [...formData.assignedProjectIds, p.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    assignedProjectIds: formData.assignedProjectIds.filter(id => id !== p.id)
                                  });
                                }
                              }}
                              className="rounded text-[#0a4d44] mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                                  ปี {p.fiscalYear || 2569}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold">
                                  {p.division}
                                </span>
                                <span className="font-mono font-bold text-slate-500">[{p.code}]</span>
                              </div>
                              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                                {p.name}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0a4d44] hover:bg-[#073b34] text-white font-bold shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
