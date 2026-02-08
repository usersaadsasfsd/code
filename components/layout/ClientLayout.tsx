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

  // Effect for displaying in-app toasts for new notifications - only show for truly new ones
  useEffect(() => {
    if (isAuthenticated && notifications.length > 0) {
      // Only process the most recent notification to avoid duplicates
      const recentUnread = notifications.filter(n => !n.read && !toastedNotificationIds.current.has(n.id));
      
      // Limit to only show the most recent unread notification to prevent spam
      if (recentUnread.length > 0) {
        const mostRecent = recentUnread[0]; // Already sorted by createdAt descending
        
        // Check if notification was created within the last 30 seconds (truly new)
        const notificationAge = Date.now() - new Date(mostRecent.createdAt).getTime();
        const isRecentlyCreated = notificationAge < 30000; // 30 seconds
        
        if (isRecentlyCreated) {
          showToast({
            title: mostRecent.title,
            description: mostRecent.message,
            variant: mostRecent.priority === 'high' ? 'destructive' : 'default',
            action: mostRecent.actionUrl ? (
              <ToastAction
                altText={mostRecent.actionLabel || 'View'}
                onClick={() => {
                  if (mostRecent.actionUrl) {
                    router.push(mostRecent.actionUrl);
                    markAsRead(mostRecent.id);
                  }
                }}
              >
                {mostRecent.actionLabel || 'View'}
              </ToastAction>
            ) : undefined,
          });
        }
        
        // Mark all unread as toasted to prevent future duplicates
        recentUnread.forEach(n => toastedNotificationIds.current.add(n.id));
      }
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
