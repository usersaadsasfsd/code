// components/layout/ClientLayout.tsx

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { toast as showToast } from '@/hooks/use-toast'; // Correctly imports the exported toast function
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';
// Updated imports: import functions directly instead of a PushNotificationService class
import {
  onPushMessageReceived,
  hasActiveSubscription, // <--- NEW: Import hasActiveSubscription
  // getDeviceType is not directly used in the auto-subscription logic here, but can be kept if needed elsewhere
} from '@/lib/client/pushNotifications';
import { ToastAction } from '@/components/ui/toast'; // IMPORTANT: Import ToastAction component
import { ForegroundMessagePayload } from '@/lib/client/pushNotifications'; // Import the payload type
// --- FIX: Alias Notification from types/notification to avoid conflict with browser's Notification API ---
import { Notification as AppNotificationType } from '@/types/notification';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Destructure notifications, fetchNotifications, and markAsRead from the hook
  const { notifications, fetchNotifications, markAsRead } = useNotifications();

  // Ref to keep track of notification IDs that have already been shown as a toast
  const toastedNotificationIds = useRef(new Set<string>());

  // NEW: Ref to track if we've already attempted push notification subscription
  // This prevents redundant checks/calls on every re-render.
  const isPushSubscriptionAttempted = useRef(false);

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Effect for authentication redirection
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  // Effect for handling foreground push messages
  useEffect(() => {
    // Only set up message listener if authenticated
    if (isAuthenticated) {
      const unsubscribe = onPushMessageReceived((payload: ForegroundMessagePayload) => {
        console.log('Foreground push message received:', payload);
        const notificationData = payload.notification;
        const customData = payload.data;

        if (notificationData) {
          showToast({
            title: notificationData.title || 'New Notification',
            description: notificationData.body || 'You have a new message.',
            variant: customData?.priority === 'high' ? 'destructive' : 'default', // Example: use 'destructive' for high priority
            action: customData?.actionUrl ? (
              <ToastAction
                altText={customData.actionLabel || 'View'}
                onClick={() => {
                  if (customData.actionUrl) {
                    router.push(customData.actionUrl);
                  }
                }}
              >
                {customData.actionLabel || 'View'}
              </ToastAction>
            ) : undefined,
          });
          // After showing toast, consider fetching latest notifications
          fetchNotifications(); // Refresh notifications in NotificationCenter
        }
      });

      return () => {
        unsubscribe(); // Clean up the listener on unmount or re-run
      };
    }
  }, [isAuthenticated, fetchNotifications, showToast, router]);

  // Effect for displaying in-app toasts for new notifications
  useEffect(() => {
    if (isAuthenticated && notifications.length > 0) {
      notifications.forEach((n) => {
        // Only show toast for unread notifications and if not already toasted in this session
        if (!n.read && !toastedNotificationIds.current.has(n.id)) {
          console.log('Showing toast for notification:', n.id);
          showToast({
            title: n.title,
            description: n.message,
            variant: n.priority === 'high' ? 'destructive' : 'default', // Example conditional variant
            action: n.actionUrl ? (
              <ToastAction
                altText={n.actionLabel || 'View'}
                onClick={() => {
                  if (n.actionUrl) {
                    router.push(n.actionUrl);
                    markAsRead(n.id); // Mark as read when action is clicked
                  }
                }}
              >
                {n.actionLabel || 'View'}
              </ToastAction>
            ) : undefined,
          });
          // Add the notification ID to the ref to prevent it from being toasted again
          toastedNotificationIds.current.add(n.id);
        }
      });
    }
  }, [notifications, user?.id, isAuthenticated, markAsRead, router]);


  // Show a loading spinner while the authentication status is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Render content for public routes (e.g., login, register) without the sidebar
  if (isPublicRoute) {
    return (
      <>
        {children}
        <Toaster /> {/* Toaster should be available for public routes too */}
      </>
    );
  }

  // If not authenticated and not a public route, return null (handled by router.push in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Render the main authenticated layout with sidebar and content
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
