// project/components/notification/NotificationToast.tsx

'use client';

import { ForwardRefExoticComponent, RefAttributes, useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications'; 
import { Notification } from '@/types/notification';
import { Bell, X, Calendar, Clock, User, Settings, CheckCircle2, LucideCrop as LucideProps } from 'lucide-react';

export function NotificationToast() {
  const { notifications, markAsRead } = useNotifications(); 
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  // Use ref to track shown IDs without causing re-renders
  const shownNotificationIdsRef = useRef<Set<string>>(new Set());

  // Effect to add new high-priority unread notifications to visible toasts
  useEffect(() => {
    const newHighPriorityUnread = notifications.filter(
      n => !n.read && n.priority === 'high' && !shownNotificationIdsRef.current.has(n.id)
    );

    if (newHighPriorityUnread.length > 0) {
      // Add new notifications to shown IDs ref
      newHighPriorityUnread.forEach(n => shownNotificationIdsRef.current.add(n.id));
      
      setVisibleNotifications(prev => {
        // Only add up to 3 total visible notifications
        const toAdd = newHighPriorityUnread.slice(0, Math.max(0, 3 - prev.length));
        if (toAdd.length === 0) return prev;
        return [...prev, ...toAdd];
      });
    }
  }, [notifications]);

  const dismissNotification = useCallback((id: string) => {
    if (markAsRead) {
      markAsRead(id);
    }
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
  }, [markAsRead]);

  // Auto-dismiss functionality for visible toasts
  useEffect(() => {
    if (visibleNotifications.length > 0) {
      const timer = setTimeout(() => {
        const oldestNotification = visibleNotifications[0];
        if (oldestNotification) {
          dismissNotification(oldestNotification.id);
        }
      }, 5000); 

      return () => clearTimeout(timer);
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
