import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NhrcLogo } from '../common/NhrcLogo';

export const LoginView: React.FC = () => {
  const { login } = useAuth();

  // Credentials State - default to bandit_h as requested
  const [username, setUsername] = useState('bandit_h');
  const [password, setPassword] = useState('•••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim();
    if (!cleanUser) {
      setError('กรุณาระบุชื่อผู้ใช้งาน');
      return;
    }

    setIsLoading(true);

    // Single Sign-On (SSO) authentication verification
    setTimeout(() => {
      setIsLoading(false);
      const res = login(cleanUser, password === '•••••••••' ? 'password123' : password);
      if (!res.success) {
        setError(res.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-4 bg-[#0a192f] bg-radial from-[#1e3a5f] to-[#0a192f]">
      {/* Compact SSO Login Card */}
      <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-2xl px-7 py-6 sm:px-8 sm:py-7 border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Official NHRC Emblem - Compact Height */}
        <div className="mb-3 flex flex-col items-center">
          <NhrcLogo className="w-28 h-28 sm:w-30 sm:h-30 object-contain drop-shadow-xs" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          
          {/* Username Field */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
              ชื่อผู้ใช้งาน
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="เช่น bandit_h หรือ admin"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#eef4fc] border border-[#cddff4] text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#234975]/30 focus:border-[#234975] focus:bg-white transition-all"
              required
              autoFocus
            />
          </div>

          {/* Password Field with Eye Toggle */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
              รหัสผ่าน
            </label>
            <div className="flex items-stretch rounded-xl bg-[#eef4fc] border border-[#cddff4] overflow-hidden focus-within:ring-2 focus-within:ring-[#234975]/30 focus-within:border-[#234975] focus-within:bg-white transition-all">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => {
                  if (password === '•••••••••') setPassword('');
                }}
                className="flex-1 px-3.5 py-2.5 bg-transparent text-sm text-slate-800 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="bg-white px-3 flex items-center justify-center border-l border-[#cddff4] text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-0.5 select-none">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#234975] focus:ring-[#234975] cursor-pointer"
            />
            <label htmlFor="remember-me" className="text-xs sm:text-[13px] font-bold text-slate-800 cursor-pointer">
              จดจำการเข้าสู่ระบบ
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 text-center animate-in fade-in">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#234975] hover:bg-[#1a385b] active:bg-[#142d4a] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังตรวจสอบสิทธิ์...</span>
                </>
              ) : (
                <span>เข้าสู่ระบบ</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
