// components/notification/NotificationCenter.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from '@/types/notification'; // Ensure this path is correct
import { useNotifications } from '@/hooks/useNotifications'; // Ensure this path is correct
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  User,
  Settings,
  Check,
  ExternalLink,
  Loader2, // Added for loading indicator
  // --- ADD AlertTriangle or similar icon for errors ---
  AlertTriangle // You might need to import this from 'lucide-react'
} from 'lucide-react';

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading: notificationsLoading, // Renamed to avoid confusion with local 'loading' state if any
    error: notificationsError, // Added error state from hook
    fetchNotifications // Assuming your hook provides a way to refetch
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'meetings' | 'tasks'>('all');

  // FIX: Uncomment this useEffect to fetch notifications when the component opens
  useEffect(() => {
    if (open) {
      fetchNotifications(); // Fetch latest notifications when the panel opens
    }
  }, [open, fetchNotifications]);


  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'meetings':
        // Assuming your NotificationType includes these specific types
        return notification.type === 'meeting_reminder' || notification.type === 'calendar_event';
      case 'tasks':
        // Assuming your NotificationType includes this specific type
        return notification.type === 'task_reminder';
      default:
        return true;
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meeting_reminder':
      case 'calendar_event':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'task_reminder':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'lead_update':
      case 'lead_assignment':
        return <User className="h-4 w-4 text-green-600" />;
      case 'system_alert':
        return <Settings className="h-4 w-4 text-red-600" />;
      // --- START OF SUGGESTED ADDITION ---
      case 'error': // Handle the new 'error' type
        return <AlertTriangle className="h-4 w-4 text-rose-500" />; // Or any other suitable icon/color
      // --- END OF SUGGESTED ADDITION ---
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}y ago`;
    if (months > 0) return `${months}mo ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20" onClick={() => onOpenChange(false)}>
      <div
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="h-full border-0 rounded-none flex flex-col">
          <CardHeader className="border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>

            <div className="flex items-center justify-between mt-4">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="meetings">Meetings</SelectItem>
                  <SelectItem value="tasks">Tasks & Reminders</SelectItem>
                </SelectContent>
              </Select>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark All Read
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-grow">
            <ScrollArea className="h-full">
              {notificationsLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <p>Loading notifications...</p>
                </div>
              ) : notificationsError ? (
                <div className="flex flex-col items-center justify-center py-8 text-red-500 text-center px-4">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-red-300" />
                    <h3 className="text-lg font-medium mb-2">Error loading notifications</h3>
                    <p className="text-sm">{notificationsError}</p>
                    <Button onClick={() => fetchNotifications()} variant="outline" className="mt-4">
                      Retry
                    </Button>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                                  title="Mark as Read"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                title="Delete Notification"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>

                              {notification.actionUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = notification.actionUrl!;
                                  }}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                                  title={notification.actionLabel || "View Details"}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600">
                    {filter === 'unread'
                      ? "You're all caught up! No unread notifications."
                      : "You don't have any notifications matching this filter."}
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
