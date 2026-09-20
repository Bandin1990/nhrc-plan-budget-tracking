import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, CheckCircle2, Clock, AlertTriangle, FileCheck, Info, 
  Trash2, Check, ExternalLink, X 
} from 'lucide-react';
import { AppNotification } from '../../types/notification';
import { NavTab } from '../layout/Sidebar';

interface NotificationPopoverProps {
  notifications: AppNotification[];
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigate?: (tab: NavTab) => void;
  onSelectProject?: (projectId: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  notifications,
  unreadCount,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'urgent') return n.severity === 'urgent' || n.severity === 'high';
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'deadline':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'approval':
        return <FileCheck className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'system':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: AppNotification['severity']) => {
    switch (severity) {
      case 'urgent':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">ด่วนมาก</span>;
      case 'high':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">รออนุมัติ</span>;
      case 'medium':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">ข้อสังเกต</span>;
      default:
        return null;
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffHours < 1) return 'เมื่อสักครู่';
      if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'เมื่อวานนี้';
      if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
      return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    } catch {
      return 'เมื่อไม่นานนี้';
    }
  };

  const handleItemClick = (n: AppNotification) => {
    if (!n.isRead) {
      onMarkAsRead(n.id);
    }
    if (n.linkTab && onNavigate) {
      onNavigate(n.linkTab as NavTab);
      onClose();
    }
  };

  return (
    <div 
      ref={popoverRef}
      className="absolute top-12 right-1 sm:right-4 w-[92vw] sm:w-96 max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden flex flex-col text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
      style={{ maxHeight: 'calc(100vh - 80px)' }}
    >
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-[#0a4d44] to-[#073b34] text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/10 text-emerald-300">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-none">การแจ้งเตือนและรายการรอติดตาม</h3>
            <p className="text-[11px] text-emerald-200/80 mt-0.5">
              {unreadCount > 0 ? `มี ${unreadCount} รายการที่ยังไม่ได้อ่าน` : 'ไม่มีรายการค้างอ่าน'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          title="ปิด"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs & Quick Actions */}
      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-[#0a4d44] dark:text-emerald-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            ทั้งหมด ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              filter === 'unread'
                ? 'bg-white dark:bg-slate-700 text-[#0a4d44] dark:text-emerald-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            ยังไม่อ่าน ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              filter === 'urgent'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            ด่วน
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              title="ทำเครื่องหมายว่าอ่านแล้วทั้งหมด"
              className="p-1 rounded text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700 flex items-center gap-0.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>อ่านหมด</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              title="ล้างรายการแจ้งเตือนทั้งหมด"
              className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto max-h-[380px] divide-y divide-slate-100 dark:divide-slate-800/80">
        {filteredNotifications.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              ไม่มีการแจ้งเตือนในขณะนี้
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ทุกแผนงานและคำขอโอนงบประมาณอยู่ในสถานะปกติ
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                n.isRead
                  ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900'
                  : 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40'
              }`}
            >
              <div className="mt-0.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-bold ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-[#0a4d44] dark:text-emerald-300'}`}>
                      {n.title}
                    </span>
                    {getSeverityBadge(n.severity)}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatTimestamp(n.timestamp)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>

                {n.division && (
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      หน่วยงาน: {n.division}
                    </span>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    คลิกเพื่อดูรายละเอียด
                    <ExternalLink className="w-3 h-3 inline" />
                  </span>
                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(n.id);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="ทำเครื่องหมายว่าอ่านแล้ว"
                    >
                      ทำเครื่องหมายว่าอ่านแล้ว
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
        ระบบติดตามแผนปฏิบัติการประจำปี พ.ศ. 2569 — สนย. กสม.
      </div>
    </div>
  );
};
