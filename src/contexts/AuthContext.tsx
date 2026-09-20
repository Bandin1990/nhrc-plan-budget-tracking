import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, DEMO_USERS } from '../types/user';
import { Project } from '../types/project';
import { supabaseService, mapDbToUser } from '../services/supabaseService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  isAdmin: boolean;
  allUsers: User[];
  login: (usernameOrEmail: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  bypassLogin: (userId?: string) => void;
  addUser: (userData: Omit<User, 'id'>) => { success: boolean; user?: User; message: string };
  updateUser: (userData: User) => { success: boolean; message: string };
  deleteUser: (userId: string) => { success: boolean; message: string };
  canEditProject: (project: Project) => boolean;
  canDeleteProject: (project: Project) => boolean;
  canReportProgress: (project: Project) => boolean;
  canRequestTransfer: (project: Project) => boolean;
  canApproveTransfer: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nhrc_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEMO_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('nhrc_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEMO_USERS[0]; // Default: Sukanya (Admin)
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('nhrc_is_authenticated');
    return saved !== null ? saved === 'true' : true; // Default true so system is instantly accessible
  });

  // Load and sync users from Supabase
  const loadUsersFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const remoteUsers = await supabaseService.getUsers();
      if (remoteUsers && remoteUsers.length > 0) {
        setUsers(remoteUsers);
        setCurrentUser(prev => {
          const match = remoteUsers.find(u => u.id === prev.id);
          return match || prev;
        });
      }
    } catch (err) {
      console.warn('Failed to load users from Supabase:', err);
    }
  }, []);

  useEffect(() => {
    loadUsersFromSupabase();

    if (!isSupabaseConfigured) return;

    // Realtime listener for users table
    const channel = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newUser = mapDbToUser(payload.new);
            setUsers(prev => {
              if (prev.some(u => u.id === newUser.id)) return prev;
              return [...prev, newUser];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDbToUser(payload.new);
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            setCurrentUser(prev => prev.id === updated.id ? updated : prev);
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setUsers(prev => prev.filter(u => u.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadUsersFromSupabase]);

  useEffect(() => {
    localStorage.setItem('nhrc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('nhrc_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nhrc_is_authenticated', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  const login = (usernameOrEmail: string, password?: string): { success: boolean; message: string } => {
    const cleanInput = usernameOrEmail.trim().toLowerCase();
    
    // Find matching user by username, email, ID, or partial name
    let found = users.find(
      u => u.username?.toLowerCase() === cleanInput || 
           u.email.toLowerCase() === cleanInput ||
           u.id.toLowerCase() === cleanInput ||
           u.name.toLowerCase().includes(cleanInput)
    );

    // Fallback for generic test roles
    if (!found) {
      if (cleanInput === 'admin' || cleanInput === 'demo' || cleanInput === 'root') {
        found = users.find(u => u.role === 'ADMIN') || users[0];
      }
    }

    if (!found) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้งาน' };
    }

    // Password check against DB record or standard default password
    const validPasswords = ['password123', '123456', found.password].filter(Boolean);
    if (password && password.trim() !== '') {
      if (!validPasswords.includes(password)) {
        return { success: false, message: 'รหัสผ่านไม่ถูกต้อง (รหัสผ่านเริ่มต้นสำหรับทดสอบคือ: password123)' };
      }
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('nhrc_current_user', JSON.stringify(found));
      localStorage.setItem('nhrc_is_authenticated', 'true');
    } catch (e) {}

    return { success: true, message: `เข้าสู่ระบบสำเร็จในฐานะ ${found.name}` };
  };

  const bypassLogin = (userId?: string) => {
    const target = userId ? (users.find(u => u.id === userId) || users[0]) : users[0];
    setCurrentUser(target);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('nhrc_current_user', JSON.stringify(target));
      localStorage.setItem('nhrc_is_authenticated', 'true');
    } catch (e) {}
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('nhrc_is_authenticated', 'false');
    } catch (e) {}
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('nhrc_current_user', JSON.stringify(found));
        localStorage.setItem('nhrc_is_authenticated', 'true');
      } catch (e) {}
    }
  };

  const addUser = (userData: Omit<User, 'id'>): { success: boolean; user?: User; message: string } => {
    // Check duplicate username or email
    const exists = users.some(
      u => u.username?.toLowerCase() === userData.username?.toLowerCase() ||
           u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (exists) {
      return { success: false, message: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว' };
    }

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`
    };

    setUsers(prev => [...prev, newUser]);
    if (isSupabaseConfigured) {
      supabaseService.upsertUser(newUser).catch(err => {
        console.error('Failed to sync new user to Supabase:', err);
      });
    }
    return { success: true, user: newUser, message: 'เพิ่มผู้ใช้งานสำเร็จ' };
  };

  const updateUser = (userData: User): { success: boolean; message: string } => {
    setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
    if (currentUser.id === userData.id) {
      setCurrentUser(userData);
    }
    if (isSupabaseConfigured) {
      supabaseService.upsertUser(userData).catch(err => {
        console.error('Failed to update user in Supabase:', err);
      });
    }
    return { success: true, message: 'บันทึกการแก้ไขข้อมูลผู้ใช้งานเรียบร้อย' };
  };

  const deleteUser = (userId: string): { success: boolean; message: string } => {
    if (userId === currentUser.id) {
      return { success: false, message: 'ไม่สามารถลบบัญชีที่กำลังเข้าสู่ระบบอยู่ในขณะนี้ได้' };
    }

    const target = users.find(u => u.id === userId);
    if (target?.role === 'ADMIN') {
      const adminCount = users.filter(u => u.role === 'ADMIN').length;
      if (adminCount <= 1) {
        return { success: false, message: 'ไม่สามารถลบได้ เนื่องจากต้องมีผู้ดูแลระบบ (ADMIN) อย่างน้อย 1 ท่าน' };
      }
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    if (isSupabaseConfigured) {
      supabaseService.deleteUser(userId).catch(err => {
        console.error('Failed to delete user from Supabase:', err);
      });
    }
    return { success: true, message: 'ลบผู้ใช้งานสำเร็จ' };
  };

  const canEditProject = (project: Project): boolean => {
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'VIEWER' || currentUser.role === 'EXECUTIVE') return false;
    
    // Project owner check
    if (currentUser.role === 'PROJECT_OWNER') {
      const isAssigned = 
        currentUser.assignedProjectIds.includes('all') ||
        currentUser.assignedProjectIds.includes(project.id) ||
        currentUser.assignedProjectIds.includes(project.code) ||
        (project.responsiblePerson && project.responsiblePerson.name === currentUser.name) ||
        project.division === currentUser.division;

      if (!isAssigned) return false;

      // 1. Explicit per-project unlock by Admin ALWAYS allows editing regardless of window or baseline lock
      if (project.unlockedForEdit) {
        return true;
      }

      // 2. Admin Global Edit Time Window Check
      const editWindowEnabled = localStorage.getItem('nhrc_edit_window_enabled') === 'true';
      if (editWindowEnabled) {
        const start = localStorage.getItem('nhrc_edit_window_start') || '2026-01-01';
        const end = localStorage.getItem('nhrc_edit_window_end') || '2026-12-31';
        const today = new Date().toISOString().split('T')[0];
        if (today < start || today > end) {
          return false; // Outside allowed editing window
        }
      }

      // 3. Baseline lock check
      if (project.isBaselineLocked && !project.unlockedForEdit) {
        return false;
      }

      return true;
    }
    return false;
  };

  const canDeleteProject = (project: Project): boolean => {
    return currentUser.role === 'ADMIN';
  };

  const canReportProgress = (project: Project): boolean => {
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'VIEWER' || currentUser.role === 'EXECUTIVE') return false;
    if (currentUser.role === 'PROJECT_OWNER') {
      const isAssigned = 
        currentUser.assignedProjectIds.includes('all') ||
        currentUser.assignedProjectIds.includes(project.id) ||
        currentUser.assignedProjectIds.includes(project.code) ||
        (project.responsiblePerson && project.responsiblePerson.name === currentUser.name) ||
        project.division === currentUser.division;

      if (!isAssigned) return false;

      // Per-project unlock by Admin allows reporting
      if (project.unlockedForEdit) {
        return true;
      }

      // Admin Global Edit Time Window Check
      const editWindowEnabled = localStorage.getItem('nhrc_edit_window_enabled') === 'true';
      if (editWindowEnabled) {
        const start = localStorage.getItem('nhrc_edit_window_start') || '2026-01-01';
        const end = localStorage.getItem('nhrc_edit_window_end') || '2026-12-31';
        const today = new Date().toISOString().split('T')[0];
        if (today < start || today > end) {
          return false;
        }
      }

      return true;
    }
    return false;
  };

  const canRequestTransfer = (project: Project): boolean => {
    return canReportProgress(project);
  };

  const canApproveTransfer = (): boolean => {
    return currentUser.role === 'ADMIN' || currentUser.role === 'EXECUTIVE';
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin: currentUser.role === 'ADMIN',
        allUsers: users,
        login,
        logout,
        switchUser,
        bypassLogin,
        addUser,
        updateUser,
        deleteUser,
        canEditProject,
        canDeleteProject,
        canReportProgress,
        canRequestTransfer,
        canApproveTransfer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
