// project/app/communications/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarEventModal } from '@/components/communication/CalendarEventModal';
import { WhatsAppModal } from '@/components/communication/WhatsAppModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { PermissionService } from '@/lib/permissions';
import { MessageCircle, Calendar, Mail, Phone, Send, Users, Clock } from 'lucide-react';

// Define the shape of communication stats for clarity
interface CommunicationStats {
  totalMessages: number;
  scheduledEvents: number;
  emailsSent: number;
  callsMade: number;
}

// Define the shape of recent activities for clarity
interface RecentActivity {
  id: string;
  type: 'whatsapp' | 'calendar' | 'email' | 'call';
  message: string;
  timestamp: Date;
  leadName?: string;
}

export default function CommunicationsPage() {
  const { user } = useAuth(); // Get the logged-in user (including user.id and user.role)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  
  // States for fetched data and loading/error
  const [communicationStats, setCommunicationStats] = useState<CommunicationStats>({
    totalMessages: 0,
    scheduledEvents: 0,
    emailsSent: 0,
    callsMade: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  const [loadingActivities, setLoadingActivities] = useState(true);
  const [errorActivities, setErrorActivities] = useState<string | null>(null);

  const permissionService = PermissionService.getInstance();

  // Fetch communication stats on component mount, dependent on user.id and user.role
  useEffect(() => {
    const fetchStats = async () => {
      // Ensure user object and its properties are available before fetching
      if (!user?.id || !user?.role) { 
        setLoadingStats(false);
        return;
      }

      setLoadingStats(true);
      setErrorStats(null);

      // Construct query URL based on user role
      let queryUrl = `/api/communications/stats?userId=${user.id}&userRole=${user.role}`;

      try {
        const response = await fetch(queryUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stats: CommunicationStats = await response.json();
        setCommunicationStats(stats);
      } catch (error: any) {
        console.error('Failed to fetch communication stats:', error);
        setErrorStats(error.message);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user?.id, user?.role]); // Re-run when user.id or user.role changes

  // Fetch all recent activities on component mount, dependent on user.id and user.role
  useEffect(() => {
    const fetchRecentActivities = async () => {
      // Ensure user object and its properties are available before fetching
      if (!user?.id || !user?.role) { 
        setLoadingActivities(false);
        return;
      }

      setLoadingActivities(true);
      setErrorActivities(null);

      // Construct query URL based on user role
      let queryUrl = `/api/communications/all-activities?userId=${user.id}&userRole=${user.role}`;

      try {
        const response = await fetch(queryUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const activities: RecentActivity[] = await response.json();
        setRecentActivities(activities);
      } catch (error: any) {
        console.error('Failed to fetch recent activities:', error);
        setErrorActivities(error.message);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchRecentActivities();
  }, [user?.id, user?.role]); // Re-run when user.id or user.role changes

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Communications Overview</h2>
          <div className="flex items-center space-x-2">
            {permissionService.hasPermission(user, 'calendar', 'create') && (
              <Button onClick={() => setIsCalendarModalOpen(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
            )}
            {permissionService.hasPermission(user, 'communications', 'create') && (
              <Button onClick={() => setIsWhatsAppModalOpen(true)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Send WhatsApp
              </Button>
            )}
          </div>
        </div>

        {/* Communication Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? 'Loading...' : communicationStats.totalMessages}
              </div>
              {errorStats && <p className="text-xs text-red-500">Error: {errorStats}</p>}
              {!loadingStats && !errorStats && <p className="text-xs text-muted-foreground">(Live data)</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? 'Loading...' : communicationStats.scheduledEvents}
              </div>
              {errorStats && <p className="text-xs text-red-500">Error: {errorStats}</p>}
              {!loadingStats && !errorStats && <p className="text-xs text-muted-foreground">(Live data)</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? 'Loading...' : communicationStats.emailsSent}
              </div>
              {errorStats && <p className="text-xs text-red-500">Error: {errorStats}</p>}
              {!loadingStats && !errorStats && <p className="text-xs text-muted-foreground">(Live data)</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calls Made</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? 'Loading...' : communicationStats.callsMade}
              </div>
              {errorStats && <p className="text-xs text-red-500">Error: {errorStats}</p>}
              {!loadingStats && !errorStats && <p className="text-xs text-muted-foreground">(Live data)</p>}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingActivities ? (
                  <p className="text-center text-gray-500 py-6">Loading activities...</p>
                ) : errorActivities ? (
                  <p className="text-center text-red-500 py-6">Error loading activities: {errorActivities}</p>
                ) : recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="mt-1">
                          {activity.type === 'whatsapp' && (
                            <MessageCircle className="h-5 w-5 text-green-500" />
                          )}
                          {activity.type === 'calendar' && (
                            <Calendar className="h-5 w-5 text-blue-500" />
                          )}
                          {activity.type === 'email' && (
                            <Mail className="h-5 w-5 text-purple-500" />
                          )}
                          {activity.type === 'call' && (
                            <Phone className="h-5 w-5 text-orange-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-gray-500">
                            {activity.leadName && `Lead: ${activity.leadName} - `}
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-6">No recent activities found for this user.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="templates" className="space-y-4">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Communication Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Create and manage reusable message templates for efficient communication
                  </p>
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Manage Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {permissionService.hasPermission(user, 'calendar', 'create') && (
          <CalendarEventModal
            open={isCalendarModalOpen}
            onOpenChange={setIsCalendarModalOpen}
          />
        )}

        {permissionService.hasPermission(user, 'communications', 'create') && (
          <WhatsAppModal
            open={isWhatsAppModalOpen}
            onOpenChange={setIsWhatsAppModalOpen}
            lead={{
              id: 'sample',
              name: 'Sample Lead',
              primaryPhone: '+1-555-0123',
              primaryEmail: 'sample@email.com',
              propertyType: 'Residential',
              budgetRange: '$300,000 - $500,000',
              preferredLocations: ['Downtown'],
              source: 'Website',
              status: 'New',
              notes: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              leadScore: 'Medium',
              activities: [],
              attachments: [],
              leadType: 'Cold-Lead',
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
