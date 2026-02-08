// components/settings/PushNotificationSettings.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
// Import individual functions directly from pushNotifications utility.
// Removed 'getToken' and 'messaging' imports as they are not exported.
import {
  isSupported,
  subscribeToPush,
  unsubscribeFromPush,
  hasActiveSubscription,
  getDeviceType, // This might not be strictly needed in UI, but keep if used elsewhere
  getUserDevices,
  testPushNotification,
} from '@/lib/client/pushNotifications';
import { DeviceRegistration } from '@/types/device'; // Assuming updated DeviceRegistration here
import {
  Smartphone,
  Monitor,
  Tablet,
  Bell,
  BellOff,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TestTube
} from 'lucide-react';

export function PushNotificationSettings() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<DeviceRegistration[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pushEnabledForCurrentBrowser, setPushEnabledForCurrentBrowser] = useState(false);
  const [loadingBrowserPushStatus, setLoadingBrowserPushStatus] = useState(true);

  // Load devices from backend
  const loadDevices = useCallback(async () => {
    if (!user?.id) {
      setDevices([]);
      setLoadingDevices(false);
      return;
    }

    try {
      setLoadingDevices(true);
      setMessage(null); // Clear previous messages
      const userDevices = await getUserDevices(user.id);
      setDevices(userDevices);
    } catch (error) {
      console.error('Error loading devices:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? `Failed to load devices: ${error.message}` : 'Failed to load devices from server.',
      });
      setDevices([]); // Clear devices on error to avoid stale data
    } finally {
      setLoadingDevices(false);
    }
  }, [user]);

  // Check current browser's push subscription status
  const checkCurrentBrowserPushStatus = useCallback(async () => {
    setLoadingBrowserPushStatus(true);
    if (!isSupported()) {
      setPushEnabledForCurrentBrowser(false);
      setMessage({
        type: 'error',
        text: 'Push notifications are not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.',
      });
      setLoadingBrowserPushStatus(false);
      return;
    }

    try {
      const hasSubscription = await hasActiveSubscription();
      setPushEnabledForCurrentBrowser(hasSubscription);
    } catch (error) {
      console.error('Error checking browser push status:', error);
      setMessage({ type: 'error', text: 'Failed to check browser push status.' });
      setPushEnabledForCurrentBrowser(false);
    } finally {
      setLoadingBrowserPushStatus(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
    checkCurrentBrowserPushStatus();
  }, [user, loadDevices, checkCurrentBrowserPushStatus]);


  const handleRegisterDevice = async () => {
    if (!user?.id) {
      setMessage({ type: 'error', text: 'User not authenticated.' });
      return;
    }
    if (!deviceName.trim()) {
      setMessage({ type: 'error', text: 'Device name is required.' });
      return;
    }
    if (!isSupported()) {
      setMessage({ type: 'error', text: 'Push notifications are not supported by your browser.' });
      return;
    }

    try {
      setIsRegistering(true);
      setMessage(null);

      await subscribeToPush(user.id);

      setMessage({
        type: 'success',
        text: 'Device registered successfully! You will now receive push notifications.',
      });
      await loadDevices(); // Reload devices to reflect new or updated registration
      await checkCurrentBrowserPushStatus(); // Update browser push status
      setIsAddDeviceModalOpen(false);
      setDeviceName('');
    } catch (error: any) {
      console.error('Error registering device:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to register device for notifications',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregisterDevice = async (deviceId: string) => {
    try {
      setMessage(null);
      await unsubscribeFromPush(deviceId);

      setMessage({
        type: 'success',
        text: 'Device unregistered successfully.',
      });
      await loadDevices(); // Reload devices after unregistering
      await checkCurrentBrowserPushStatus(); // Re-check browser status
    } catch (error: any) {
      console.error('Error unregistering device:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to unregister device',
      });
    }
  };

  const handleTogglePushNotifications = async (checked: boolean) => {
    if (!user?.id) {
      setMessage({ type: 'error', text: 'You must be logged in to manage push notifications.' });
      return;
    }
    if (!isSupported()) {
      setMessage({ type: 'error', text: 'Push notifications are not supported in this browser.' });
      return;
    }

    setPushEnabledForCurrentBrowser(checked); // Optimistic UI update
    setLoadingBrowserPushStatus(true);

    try {
      if (checked) {
        // When enabling, we attempt to subscribe (which is idempotent)
        await subscribeToPush(user.id);
        setMessage({ type: 'success', text: 'Push notifications enabled for this device.' });
      } else {
        // When disabling, we must first get the current browser's subscription
        const registration = await navigator.serviceWorker.ready;
        const currentSubscription = await registration.pushManager.getSubscription();

        if (currentSubscription) {
          // Since getToken is not exported from pushNotifications, we cannot directly get
          // the FCM token here to match with devices.find(d => d.fcmToken === currentToken).
          // Therefore, we perform client-side unsubscribe directly and inform the user
          // about potential need for manual backend removal.
          await currentSubscription.unsubscribe(); // This will remove the browser's push subscription

          setMessage({
            type: 'success',
            text: 'Push notifications disabled for this browser. If this device still appears in your registered devices list, please remove it manually.',
          });
        } else {
          setMessage({ type: 'success', text: 'No active browser subscription found to disable.' });
        }
      }
      await loadDevices(); // Always reload devices to reflect changes
    } catch (error: any) {
      console.error("Error toggling push notifications:", error);
      setMessage({
        type: 'error',
        text: error.message || "An unexpected error occurred while toggling notifications.",
      });
      setPushEnabledForCurrentBrowser(!checked); // Revert UI on error
    } finally {
      setLoadingBrowserPushStatus(false);
    }
  };


  const handleTestNotification = async () => {
    if (!user?.id) {
      setMessage({ type: 'error', text: 'User not authenticated.' });
      return;
    }
    if (devices.length === 0) {
      setMessage({ type: 'error', text: 'No devices registered to send a test notification.' });
      return;
    }

    try {
      setIsTesting(true);
      setMessage(null);
      await testPushNotification(user.id, "Test Notification", "This is a test push notification from Country Roof CRM!");
      setMessage({
        type: 'success',
        text: 'Test notification sent! Check your device.',
      });
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send test notification',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Helper function to get the appropriate icon for device type
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default: // Covers 'desktop' and any unknown types
        return <Monitor className="h-5 w-5" />;
    }
  };

  // Helper function to get a user-friendly label for device type
  const getDeviceTypeLabel = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return 'Mobile Device';
      case 'tablet':
        return 'Tablet';
      default: // Covers 'desktop' and any unknown types
        return 'Desktop';
    }
  };

  if (!user) return null; // Don't render if user is not authenticated

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <span>Push Notification Settings</span>
          </CardTitle>
          <CardDescription>
            Manage your devices and notification preferences for real-time alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Push Notifications Status for current browser */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {pushEnabledForCurrentBrowser ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <BellOff className="h-6 w-6 text-gray-400" />
              )}
              <div>
                <h3 className="font-medium">
                  Push Notifications {pushEnabledForCurrentBrowser ? 'Enabled' : 'Disabled'} for this Browser
                </h3>
                <p className="text-sm text-gray-600">
                  {pushEnabledForCurrentBrowser
                    ? 'This browser is currently set to receive push notifications.'
                    : 'Toggle to enable push notifications for this browser.'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={pushEnabledForCurrentBrowser}
              onCheckedChange={handleTogglePushNotifications}
              disabled={loadingBrowserPushStatus || !isSupported()}
            />
          </div>

          {/* Registered Devices List */}
          <div>
            <h3 className="font-medium mb-4">Your Registered Devices ({devices.length})</h3>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setIsAddDeviceModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!isSupported() || !user?.id}
              >
                <Plus className="h-4 w-4 mr-2" />
                Register New Device
              </Button>
            </div>
            {loadingDevices ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2">Loading devices...</span>
              </div>
            ) : devices.length > 0 ? (
              <div className="space-y-3">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-600">
                        {getDeviceIcon(device.deviceType)}
                      </div>
                      <div>
                        <h4 className="font-medium">{device.deviceName}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{getDeviceTypeLabel(device.deviceType)}</span>
                          <span>•</span>
                          <span>Registered {new Date(device.createdAt).toLocaleDateString()}</span>
                          {device.isActive && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                Active
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnregisterDevice(device.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No devices registered yet.</p>
                <p className="text-sm mt-1">Click (Register New Device) to add this browser or another device.</p>
              </div>
            )}
          </div>

          {/* Test Notification Button (moved here for better flow) */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              disabled={isTesting || devices.length === 0}
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Send Test Notification
            </Button>
          </div>

          {/* Notification Types (Static for now) */}
          <hr className="my-6" /> {/* Separator */}
          <div>
            <h3 className="font-medium mb-4">Notification Categories</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Meeting Reminders</Label>
                  <p className="text-sm text-gray-600">Get notified before scheduled meetings</p>
                </div>
                <Switch checked={true} disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Lead Updates</Label>
                  <p className="text-sm text-gray-600">Notifications when leads are assigned or updated</p>
                </div>
                <Switch checked={true} disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Task Reminders</Label>
                  <p className="text-sm text-gray-600">Reminders for upcoming tasks and follow-ups</p>
                </div>
                <Switch checked={true} disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Alerts</Label>
                  <p className="text-sm text-gray-600">Important system notifications and updates</p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </div>
          </div>

          {/* Browser Support Information */}
          {!isSupported() && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Push notifications are **not supported** in this browser. Please use a modern browser like Chrome, Firefox, or Safari to enable push notifications.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Add Device Modal */}
      <Dialog open={isAddDeviceModalOpen} onOpenChange={setIsAddDeviceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register Device for Notifications</DialogTitle>
            <DialogDescription>
              Give your device a name to identify it in your notification settings. This will register *this specific browser* to receive notifications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                placeholder="e.g., My Chrome Browser, Work Desktop"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="mt-1"
              />
            </div>
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                Your browser will ask for permission to send notifications. Please **allow** notifications to receive real-time alerts.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDeviceModalOpen(false)} disabled={isRegistering}>
              Cancel
            </Button>
            <Button
              onClick={handleRegisterDevice}
              disabled={!deviceName.trim() || isRegistering}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Register Device
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
