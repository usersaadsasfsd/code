// NotificationsPage.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PushNotificationSettings } from '@/components/notifications/PushNotificationSettings';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
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
  Filter,
  Loader2,
  Smartphone
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Define the Notification type based on your usage
// IMPORTANT: This interface MUST accurately reflect the 'type' and 'priority'
// strings that your backend actually sends.
interface Notification {
  id: string;
  title: string;
  message: string;
  // This is CRITICAL for stats and filtering.
  // Add all possible notification types returned by your backend API here.
  type: 'meeting_reminder' | 'calendar_event' | 'task_reminder' | 'lead_update' | 'lead_assignment' | 'system_alert' | string;
  priority: 'high' | 'medium' | 'low' | string;
  read: boolean;
  createdAt: string | Date; // Can be string (ISO) or Date object
  actionUrl?: string;
  actionLabel?: string; // Added from NotificationCenter for consistency
}

export default function NotificationsPage() {
  const { user } = useAuth();
  // Ensure the useNotifications hook provides the expected types
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    loading,
    error: notificationsError, // Access error state from hook
    fetchNotifications // Assuming your hook provides a way to refetch
  } = useNotifications() as { 
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    loading: boolean;
    error: string | null; // Added error type
    fetchNotifications: () => Promise<void>; // Added fetchNotifications type
  };

  type Preferences = {
    emailNotifications: boolean;
    pushNotifications: boolean;
    leadUpdates: boolean;
    taskReminders: boolean;
    meetingReminders: boolean;
    systemAlerts: boolean;
  };
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'meetings' | 'tasks' | 'system'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Notification preferences state
  // Ensure default values are based on user preferences or sensible defaults
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: user?.preferences?.notifications?.email ?? true,
    pushNotifications: user?.preferences?.notifications?.push ?? true,
    leadUpdates: user?.preferences?.notifications?.leadUpdates ?? true,
    taskReminders: user?.preferences?.notifications?.taskReminders ?? true,
    meetingReminders: user?.preferences?.notifications?.meetingReminders ?? true, // Added default
    systemAlerts: user?.preferences?.notifications?.systemAlerts ?? true,     // Added default
  });

  const [leadsPerPage, setLeadsPerPage] = useState(10); // Example, ensure this is persisted if needed

  // Filter notifications based on the selected filter type
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'meetings':
        // Ensure these type strings exactly match what your backend sends
        return notification.type === 'meeting_reminder' || notification.type === 'calendar_event';
      case 'tasks':
        // Ensure this type string exactly matches what your backend sends
        return notification.type === 'task_reminder';
      case 'system':
        // Ensure this type string exactly matches what your backend sends
        return notification.type === 'system_alert';
      default:
        return true;
    }
  });

  // Helper function to get the icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meeting_reminder':
      case 'calendar_event':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'task_reminder':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'lead_update':
      case 'lead_assignment': // Added for completeness based on NotificationCenter
        return <User className="h-5 w-5 text-green-600" />;
      case 'system_alert':
        return <Settings className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  // Helper function to get priority badge color
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

  // Improved time formatting for readability
  const formatTime = (dateInput: Date | string) => {
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

  // Handles clicking on a single notification
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  // Handles selecting/deselecting individual notifications for bulk actions
  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Handles selecting/deselecting all filtered notifications
  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  // Handles bulk deletion of selected notifications
  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications([]); // Clear selection after action
  };

  // Handles bulk marking as read for selected notifications
  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        markAsRead(id);
      }
    });
    setSelectedNotifications([]); // Clear selection after action
  };

  // --- THE CORE LOGIC FOR STATS ---
  // This calculates the counts displayed in the cards.
  // The accuracy of these numbers DEPENDS on the 'type' property
  // of the notification objects fetched by useNotifications matching
  // the string literals used here.
  const notificationStats = {
    total: notifications.length,
    unread: unreadCount, // unreadCount from useNotifications hook
    meetings: notifications.filter(n => n.type === 'meeting_reminder' || n.type === 'calendar_event').length,
    tasks: notifications.filter(n => n.type === 'task_reminder').length,
    system: notifications.filter(n => n.type === 'system_alert').length,
    // Add other relevant stats here if needed, e.g., leadUpdates
    leadUpdates: notifications.filter(n => n.type === 'lead_update' || n.type === 'lead_assignment').length,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">Manage your notifications and push notification settings</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark All Read ({unreadCount})
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6"> {/* Adjusted grid for better responsiveness */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{notificationStats.total}</p>
                  </div>
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Unread</p>
                    <p className="text-2xl font-bold text-blue-600">{notificationStats.unread}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Meetings</p>
                    <p className="text-2xl font-bold text-green-600">{notificationStats.meetings}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tasks</p>
                    <p className="text-2xl font-bold text-amber-600">{notificationStats.tasks}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">System</p>
                    <p className="text-2xl font-bold text-red-600">{notificationStats.system}</p>
                  </div>
                  <Settings className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            {/* You could add a 'Lead Updates' card here as well if you uncommented the stat calculation */}
            {/* <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lead Updates</p>
                    <p className="text-2xl font-bold text-purple-600">{notificationStats.leadUpdates}</p>
                  </div>
                  <User className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card> */}
          </div>

          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="push-settings">
                <Smartphone className="h-4 w-4 mr-2" />
                Push Notifications
              </TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-6">
              {/* Filters and Actions */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    <span>Filter & Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-4"> {/* Added flex-wrap and gap */}
                    <div className="flex items-center space-x-4">
                      <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Notifications</SelectItem>
                          <SelectItem value="unread">Unread Only</SelectItem>
                          <SelectItem value="meetings">Meetings</SelectItem>
                          <SelectItem value="tasks">Tasks & Reminders</SelectItem>
                          <SelectItem value="system">System Alerts</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0 ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    
                    {selectedNotifications.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {selectedNotifications.length} selected
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkMarkAsRead}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark Read
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkDelete}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notifications List */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>
                    {filter === 'all' ? 'All Notifications' : 
                      filter === 'unread' ? 'Unread Notifications' :
                      filter === 'meetings' ? 'Meeting Notifications' :
                      filter === 'tasks' ? 'Task Notifications' :
                      'System Notifications'}
                  </CardTitle>
                  <CardDescription>
                    Showing {filteredNotifications.length} of {notifications.length} notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <p className="ml-2 text-gray-600">Loading notifications...</p>
                    </div>
                  ) : notificationsError ? ( // Display error if present
                    <div className="flex flex-col items-center justify-center py-12 text-red-500 text-center px-4">
                      <Settings className="h-12 w-12 mx-auto mb-4 text-red-300" />
                      <h3 className="text-lg font-medium mb-2">Error loading notifications</h3>
                      <p className="text-sm">{notificationsError}</p>
                      <Button onClick={fetchNotifications} variant="outline" className="mt-4">
                          Retry
                      </Button>
                    </div>
                  ) : filteredNotifications.length > 0 ? (
                    <div className="space-y-4">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                          } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-4">
                            <input
                              type="checkbox"
                              checked={selectedNotifications.includes(notification.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectNotification(notification.id);
                              }}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            
                            <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {notification.title}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  {!notification.read && (
                                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                  )}
                                  <span className="text-sm text-gray-500">
                                    {formatTime(notification.createdAt)}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 mb-3">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between flex-wrap gap-2"> {/* Added flex-wrap and gap */}
                                <div className="flex items-center space-x-2">
                                  <Badge 
                                    variant="outline" 
                                    className={getPriorityColor(notification.priority)}
                                  >
                                    {notification.priority} priority
                                  </Badge>
                                  <Badge variant="outline" className="capitalize"> {/* Capitalize type display */}
                                    {notification.type.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {!notification.read && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                      }}
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      Mark Read
                                    </Button>
                                  )}
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                  
                                  {notification.actionUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = notification.actionUrl!;
                                      }}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-1" />
                                      View {notification.actionLabel || ""}
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
                    <div className="text-center py-12">
                      <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                      <p className="text-gray-600">
                        {filter === 'unread' 
                          ? "You're all caught up! No unread notifications."
                          : "You don't have any notifications yet for this category."} {/* Improved message */}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="push-settings" className="space-y-6">
              <PushNotificationSettings />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Notification Preferences</span>
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to be notified about updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({
                            ...prev,
                            emailNotifications: checked
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-600">Receive notifications via push notifications</p>
                      </div>
                      <Switch
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({
                            ...prev,
                            pushNotifications: checked
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Lead Updates</Label>
                        <p className="text-sm text-gray-600">Get notified when leads are updated</p>
                      </div>
                      <Switch
                        checked={preferences.leadUpdates}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({
                            ...prev,
                            leadUpdates: checked
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Task Reminders</Label>
                        <p className="text-sm text-gray-600">Receive reminders for upcoming tasks</p>
                      </div>
                      <Switch
                        checked={preferences.taskReminders}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({
                            ...prev,
                            taskReminders: checked
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Meeting Reminders</Label>
                        <p className="text-sm text-gray-600">Receive reminders for upcoming meetings</p>
                      </div>
                      <Switch
                        checked={preferences.meetingReminders}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({
                            ...prev,
                            meetingReminders: checked
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>System Alerts</Label>
                        <p className="text-sm text-gray-600">Receive system alerts</p>
                      </div>
                      <Switch
                        checked={preferences.systemAlerts}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({
                            ...prev,
                            systemAlerts: checked
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Dashboard Preferences</CardTitle>
                    <CardDescription>
                      Customize your dashboard experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="leadsPerPage">Leads per page</Label>
                      <Input
                        id="leadsPerPage"
                        type="number"
                        min="5"
                        max="50"
                        value={leadsPerPage}
                        onChange={(e) => setLeadsPerPage(Number(e.target.value))}
                        className="w-24"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
