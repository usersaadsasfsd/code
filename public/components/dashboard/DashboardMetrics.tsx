// components/dashboard/DashboardMetrics.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Calendar, DollarSign, BarChart3, ArrowRight, Loader2 } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsService } from '@/lib/analyticsService';
import Link from 'next/link';
import { ReportFilters } from '@/types/analytics';
import { useEffect } from 'react';

interface DashboardMetricsProps {
  leadTypeFilter?: string; // New prop to filter leads by type
}

export function DashboardMetrics({ leadTypeFilter }: DashboardMetricsProps) {
  const { leads, loading, error, fetchLeads } = useLeads();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch leads based on the leadTypeFilter prop, or 'Lead' as a default
    fetchLeads((leadTypeFilter as 'Lead' | 'Cold-Lead' | undefined) || 'Lead');
  }, [fetchLeads, leadTypeFilter]); // Add leadTypeFilter to dependency array

  // Debugging logs
  console.log('DashboardMetrics - Loading:', loading);
  console.log('DashboardMetrics - Leads:', leads);
  console.log('DashboardMetrics - User:', user);

  const analyticsService = AnalyticsService.getInstance();

  // Create filters for analytics service, including the leadTypeFilter
  const filters: ReportFilters = { leadType: leadTypeFilter || 'Lead' }; // Use leadTypeFilter here

  const dashboardMetrics = analyticsService.generateDashboardMetrics(leads, user, filters); // Pass filters to ensure correct lead type calculation
  const leadSourceAnalytics = analyticsService.generateLeadSourceAnalytics(leads, filters, user); // Pass filters here too

  console.log('DashboardMetrics - analyticsService:', analyticsService);
  console.log('DashboardMetrics - dashboardMetrics:', dashboardMetrics);
  console.log('DashboardMetrics - leadSourceAnalytics:', leadSourceAnalytics);

  // Check if dashboardMetrics is defined
  if (!dashboardMetrics) {
    console.error('Dashboard metrics could not be generated.');
    // Optionally render a more user-friendly loading/error state if metrics are null initially
    return (
      <div className="text-center py-10 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Calculating dashboard metrics...</p>
      </div>
    );
  }

  const topSource = leadSourceAnalytics.length > 0 ? leadSourceAnalytics[0] : null;

  // Show different labels for agents vs admins
  const getMetricLabel = (baseLabel: string) => {
    if (user?.role === 'agent') {
      return `My ${baseLabel}`;
    }
    return baseLabel;
  };

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {getMetricLabel('Total Leads')}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dashboardMetrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{dashboardMetrics.newLeadsToday}</span> new today
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {getMetricLabel('Conversion Rate')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dashboardMetrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {dashboardMetrics.convertedLeads} converted leads
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Time to Convert
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dashboardMetrics.averageTimeToConvert}d</div>
            <p className="text-xs text-muted-foreground">
              Average conversion time
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {getMetricLabel('Active Leads')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dashboardMetrics.activeLeads}</div>
            <p className="text-xs text-muted-foreground">
              Currently in pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>{getMetricLabel('Top Lead Source')}</span>
              </span>
              <Link href="/analytics">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topSource ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{topSource.source}</span>
                  <Badge variant="default">{topSource.conversionRate}% conversion</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{topSource.totalLeads}</div>
                    <div className="text-gray-600">Total Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">{topSource.convertedLeads}</div>
                    <div className="text-600">Converted</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">{topSource.averageTimeToConvert}d</div>
                    <div className="text-gray-600">Avg. Time</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No lead source data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>{getMetricLabel('Recent Activity')}</span>
              </span>
              <Link href="/analytics">
                <Button variant="ghost" size="sm">
                  View Report <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="font-bold">{dashboardMetrics.recentActivities} activities</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Leads</span>
                <span className="font-bold text-blue-600">+{dashboardMetrics.newLeadsThisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Qualified Leads</span>
                <span className="font-bold text-green-600">{dashboardMetrics.qualifiedLeads}</span>
              </div>
              <div className="pt-2 border-t">
                <Link href="/analytics">
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View {user?.role === 'agent' ? 'My' : 'Full'} Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
