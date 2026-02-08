// types/notification.ts
export interface Notification {
  id: string;
  userId: string;
  type: 'meeting_reminder' | 'reminder' | 'lead_update' | 'task_reminder' | 'system_alert' | 'calendar_event' | 'lead_assignment' | 'general' | 'error'; // Added 'general' as a common fallback
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string; // <-- CHANGE THIS FROM Date TO string
  scheduledFor?: string; // <-- Change this to string as well if you store it as ISO string
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  meetingReminders: boolean;
  leadUpdates: boolean;
  taskReminders: boolean;
  systemAlerts: boolean;
  reminderTiming: number; // minutes before event
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  recent: Notification[];
}
