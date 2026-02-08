'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationCenter } from './NotificationCenter'; // Ensure this path is correct for your NotificationCenter component
import { useNotifications } from '@/hooks/useNotifications'; // Ensure this path is correct for your useNotifications hook
import { Bell } from 'lucide-react';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  // Destructure 'unreadCount' directly from useNotifications
  const { unreadCount, loading: notificationsLoading } = useNotifications(); // Also get loading state for robustness

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative p-2"
        disabled={notificationsLoading} // Disable button while notifications are loading
      >
        <Bell className="h-5 w-5" />
        {/* Only show the badge if there are unread notifications and not currently loading */}
        {unreadCount > 0 && !notificationsLoading && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationCenter
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
