// hooks/useNotifications.ts

import { useState, useCallback, useEffect } from 'react';
import { Notification } from '@/types/notification';
// Import the push notification utility (assuming this is where your FCM client logic resides)
import { subscribeToPush, onPushMessageReceived } from '@/lib/client/pushNotifications';
import { useAuth } from './useAuth'; // Assuming you can get the current user from useAuth

interface CreateNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: Notification['type'];
  priority: Notification['priority'];
  actionUrl?: string;
  actionLabel?: string;
}

export function useNotifications() {
  const { user, isLoading: authLoading } = useAuth(); // Get current user from useAuth
  const currentUserId = user?.id; // Get the ID of the currently logged-in user

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false); // Manages loading state for all operations
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async (userId?: string) => {
    setLoading(true); // Set loading true for the fetch operation
    setError(null); // Clear any previous errors
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      // If userId is provided, fetch for that user, otherwise assume current logged-in user (backend handles it)
      const targetUserId = userId || currentUserId; // Use provided userId or current logged-in user's ID
      if (!targetUserId) {
          console.warn('Cannot fetch notifications: No user ID available.');
          return;
      }

      const url = `/api/notifications?userId=${targetUserId}`; // Explicitly send userId to backend for fetching
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`, // Assuming auth token is used
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }

      const fetchedNotifications: Notification[] = await response.json();
      setNotifications(prev => {
        // Sort fetched notifications by createdAt in descending order
        const sortedFetched = fetchedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Check if the new data is identical to the previous data to prevent unnecessary updates
        if (prev.length === sortedFetched.length && prev.every((val, index) => val.id === sortedFetched[index].id && val.read === sortedFetched[index].read)) {
          return prev; // No change, return previous state
        }
        return sortedFetched; // Update with sorted new data
      });
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'An unexpected error occurred while fetching notifications');
    } finally {
      setLoading(false); // Always set loading to false when done
    }
  }, [currentUserId]); // Dependency on currentUserId to re-fetch if user changes

  // Initialize Firebase Push Notifications and listen for foreground messages
  useEffect(() => {
    if (currentUserId && !authLoading) {
      // 1. Setup Firebase messaging, request permission, get token, and send to backend
      // subscribeToPush(currentUserId);

      // 2. Subscribe to foreground messages and update in-app notifications
      const unsubscribe = onPushMessageReceived((payload) => {
        console.log('Foreground FCM Message received in useNotifications hook:', payload);
        // Add the new notification to the state for immediate display
        // You might need to transform the FCM payload to your Notification type
        const newInAppNotification: Notification = {
          id: payload.data?.notificationId || Date.now().toString(), // Use actual ID from payload if available, else generate
          userId: payload.data?.userId || currentUserId,
          title: payload.notification?.title || 'New Message',
          message: payload.notification?.body || 'You have a new notification.',
          type: (payload.data?.type as Notification['type']) || 'general',
          priority: (payload.data?.priority as Notification['priority']) || 'normal',
          read: false, // Newly received notifications are unread
          createdAt: new Date().toISOString(), // Use current time or payload's timestamp if available
          actionUrl: payload.data?.actionUrl,
          actionLabel: payload.data?.actionLabel,
        };

        setNotifications(prev => [newInAppNotification, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

        // Optionally, you can also trigger a visual toast/alert here using a global toast system
        // e.g., if you have a `useToast` hook or similar
        // import { toast } from '@/components/ui/use-toast'; // Example toast import
        // toast({
        //   title: newInAppNotification.title,
        //   description: newInAppNotification.message,
        //   // action: <ToastAction altText="View">View</ToastAction>, // If your toast supports actions
        // });
      });

      // Cleanup subscription on component unmount
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [currentUserId, authLoading]); // Re-run when current user changes or auth state resolves

  // This useEffect ensures fetchNotifications is called automatically when the hook mounts.
  // This is crucial for NotificationsPage to get its initial data.
  useEffect(() => {
    // Only fetch notifications if the user is logged in and auth is not loading
    if (currentUserId && !authLoading) {
      fetchNotifications();
    }
  }, [fetchNotifications, currentUserId, authLoading]); // Add currentUserId and authLoading to dependencies

  const createNotification = useCallback(
    async (payload: CreateNotificationPayload) => {
      setLoading(true); // Keep this if you want the global loading indicator to show during creation
      setError(null);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('Authentication token not found. Please log in.');
        }

        // Send notification data to your backend API
        const response = await fetch('/api/notifications/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create notification');
        }

        const newNotification: Notification = await response.json();
        // Optimistically add the new notification to the state
        // Sort to ensure the latest notification appears at the top
        setNotifications(prev => [newNotification, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        return newNotification;
      } catch (err: any) {
        console.error('Error creating notification:', err);
        setError(err.message || 'An unexpected error occurred during creation');
        throw err; // Re-throw to allow caller to handle creation specific errors
      } finally {
        setLoading(false); // Always set loading to false when done
      }
    },
    [] // No dependencies means this function is stable
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Optimistically update UI first
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );

      const token = localStorage.getItem('auth_token');
      if (!token) {
          throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark notification as read');
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      setError(err.message || 'An unexpected error occurred while marking as read');
      // Revert optimistic update if API call fails
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: false } : n))
      );
    }
  }, []); // No dependencies for this useCallback

  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistically update UI first
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));

      const token = localStorage.getItem('auth_token');
      if (!token) {
          throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark all notifications as read');
      }
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      setError(err.message || 'An unexpected error occurred while marking all as read');
      // If error, you might want to re-fetch to ensure state consistency
      if (currentUserId) { // Only re-fetch if a user ID is available
          fetchNotifications(currentUserId);
      }
    }
  }, [fetchNotifications, currentUserId]); // Dependency on fetchNotifications and currentUserId to re-fetch on error

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      // Optimistically update UI first
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      const token = localStorage.getItem('auth_token');
      if (!token) {
          throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete notification');
      }
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      setError(err.message || 'An unexpected error occurred while deleting');
      // If error, re-fetch to ensure state consistency
      if (currentUserId) { // Only re-fetch if a user ID is available
          fetchNotifications(currentUserId);
      }
    }
  }, [fetchNotifications, currentUserId]); // Dependency on fetchNotifications and currentUserId to re-fetch on error

  return {
    notifications,
    unreadCount,
    loading,
    error,
    createNotification,
    fetchNotifications, // Expose fetchNotifications so ClientLayout or other components can trigger it manually
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
