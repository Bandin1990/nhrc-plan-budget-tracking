import React, { useState } from 'react';
import { 
  Users, Shield, ShieldCheck, Lock, UserCheck, Key, Plus, 
  Trash2, Edit, Check, X, Search, Filter, AlertCircle, Save, ShieldAlert, Database, Upload, Camera
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectContext';
import { User, UserRole } from '../../types/user';
import { NHRC_UNITS, NHRCUnit } from '../../types/project';
import { supabaseService } from '../../services/supabaseService';

export const UserPermissionManagement: React.FC = () => {
  const { allUsers, currentUser, switchUser, addUser, updateUser, deleteUser } = useAuth();
  const { projects } = useProjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

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

      {/* Roles Legend */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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

          <div className="flex items-center gap-2">
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
                <th className="py-3 px-3 text-center">สลับใช้งาน (Switch)</th>
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
                    <td className="py-3 px-3 text-center">
                      {isCurrent ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full">
                          กำลังใช้งาน
                        </span>
                      ) : (
                        <button
                          onClick={() => switchUser(u.id)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#0a4d44] hover:text-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold transition-colors"
                        >
                          สลับเป็นผู้ใช้นี้
                        </button>
                      )}
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
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    มอบหมายโครงการที่รับผิดชอบ (เลือกได้หลายโครงการ)
                  </label>
                  <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                    {projects.map((p) => {
                      const isSelected = formData.assignedProjectIds.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer">
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
                            className="rounded text-[#0a4d44]"
                          />
                          <span className="text-[11px] truncate text-slate-700 dark:text-slate-200">
                            [{p.code}] {p.name}
                          </span>
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
