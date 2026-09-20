export type NotificationType = 'deadline' | 'budget' | 'approval' | 'system' | 'warning' | 'email';
export type NotificationSeverity = 'low' | 'medium' | 'high' | 'urgent';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
  projectId?: string;
  memoId?: string;
  division?: string;
}

export interface EmailDispatchRecord {
  id: string;
  recipientEmail: string;
  recipientName: string;
  division: string;
  subject: string;
  bodyPreview: string;
  category: 'verify_plan' | 'progress_due' | 'reminder_nudge' | 'transfer_submitted' | 'budget_returned';
  sentAt: string;
  fiscalYear: number;
  status: 'sent' | 'delivered';
  projectId?: string;
  projectCode?: string;
  projectName?: string;
}
