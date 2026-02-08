// project/components/notification/NotificationToast.tsx

'use client';

import { ForwardRefExoticComponent, RefAttributes, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications'; 
import { Notification } from '@/types/notification';
import { Bell, X, Calendar, Clock, User, Settings, CheckCircle2, LucideProps } from 'lucide-react';

export function NotificationToast() {
  const { notifications, markAsRead } = useNotifications(); 
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  // Log notifications state from the hook
  useEffect(() => {
    console.log('[NotificationToast] Current notifications from useNotifications:', notifications);
    console.log('[NotificationToast] Current visible notifications state:', visibleNotifications);
  }, [notifications, visibleNotifications]); // Log whenever these change

  // Effect to add new high-priority unread notifications to visible toasts
  useEffect(() => {
    const newHighPriorityUnread = notifications.filter(
      n => !n.read && n.priority === 'high' && 
      !visibleNotifications.some(v => v.id === n.id) 
    );

    if (newHighPriorityUnread.length > 0) {
      console.log('[NotificationToast] Found new high-priority unread:', newHighPriorityUnread.map(n => n.id));
      setVisibleNotifications(prev => {
        const updatedVisible = [
          ...prev, 
          ...newHighPriorityUnread.slice(0, Math.max(0, 3 - prev.length)) 
        ];
        console.log('[NotificationToast] Updating visible notifications to:', updatedVisible.map(n => n.id));
        return updatedVisible;
      });
    }
  }, [notifications, visibleNotifications]); 

  const dismissNotification = (id: string) => {
    console.log(`[NotificationToast] Attempting to dismiss notification ID: ${id}`);
    // First, mark as read in the global store so it's not re-added by useEffect
    if (markAsRead) {
      markAsRead(id);
      console.log(`[NotificationToast] Called markAsRead for ID: ${id}`);
    } else {
      console.warn('[NotificationToast] markAsRead function is not available!');
    }
    // Then, remove it from local visible state
    setVisibleNotifications(prev => {
      const filtered = prev.filter(n => n.id !== id);
      console.log(`[NotificationToast] Removed ID ${id} from visible state. New visible count: ${filtered.length}`);
      return filtered;
    });
  };

  // Auto-dismiss functionality for visible toasts
  useEffect(() => {
    if (visibleNotifications.length > 0) {
      const timer = setTimeout(() => {
        const oldestNotification = visibleNotifications[0];
        if (oldestNotification) {
          console.log(`[NotificationToast] Auto-dismissing oldest notification: ${oldestNotification.id}`);
          dismissNotification(oldestNotification.id);
        }
      }, 5000); 

      return () => {
        console.log('[NotificationToast] Clearing auto-dismiss timer.');
        clearTimeout(timer);
      }
    }
  }, [visibleNotifications, dismissNotification]); 

  type NotificationType = 'meeting' | 'reminder' | 'lead_update' | 'task' | 'system' | 'calendar' | 'meeting_reminder' | 'task_reminder' | 'system_alert' | 'calendar_event'; // Added types from useNotifications mock
  interface Icons {
    [key: string]: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  }

  const icons: Icons = {
    meeting: Calendar,
    reminder: Clock,
    lead_update: User,
    task: CheckCircle2,
    system: Settings,
    calendar: Calendar, 
    meeting_reminder: Calendar, // Map new types to existing icons
    task_reminder: CheckCircle2,
    system_alert: Settings,
    calendar_event: Calendar,
  };

  const getNotificationIcon = (type: string) => {
    const Icon = icons[type] || Bell; 
    return <Icon className="h-4 w-4" />;
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification) => (
        <Card 
          key={notification.id} 
          className="w-80 bg-white shadow-lg border-l-4 border-l-red-500 animate-in slide-in-from-right duration-300"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1 text-red-600">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <Badge variant="destructive" className="text-xs">
                      {notification.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {notification.message}
                  </p>
                  {notification.actionUrl && notification.actionLabel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = notification.actionUrl!;
                        dismissNotification(notification.id); 
                      }}
                      className="text-xs"
                    >
                      {notification.actionLabel}
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="p-1 h-6 w-6 ml-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
