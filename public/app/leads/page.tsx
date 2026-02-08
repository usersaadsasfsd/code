'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { LeadCard } from '@/components/leads/LeadCard';
import { LeadListItem } from '@/components/leads/LeadListItem';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { AddLeadModal } from '@/components/leads/AddLeadModal';
import { LeadImportModal } from '@/components/leads/LeadImportModal';
import { LeadExportModal } from '@/components/leads/LeadExportModal';
import { LeadNotesModal } from '@/components/leads/LeadNotesModal';
import { LeadTasksModal } from '@/components/leads/LeadTasksModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Lead, LeadFilters as Filters } from '@/types/lead'; // No need to import LeadStatus separately here
import { NewLeadData, useLeads } from '@/hooks/useLeads';
import { useAgents } from '@/hooks/useAgents';
import { useAuth } from '@/hooks/useAuth';
import { PermissionService } from '@/lib/permissions';
import { Plus, Building2, Filter, Loader2, Database, Upload, Download, FileText, CheckSquare, MoreHorizontal, LayoutGrid, List } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type SortOption = 'created-desc' | 'created-asc' | 'name-asc' | 'name-desc' | 'score-high' | 'score-low';
type ViewMode = 'card' | 'list';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { leads, loading, error, createLead, fetchLeads, updateLead } = useLeads();
  const { agents } = useAgents();
  const [filters, setFilters] = useState<Filters>({});
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('created-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const permissionService = PermissionService.getInstance();

  useEffect(() => {
    fetchLeads('Lead');
  }, [fetchLeads]);

  const userFilteredLeads = useMemo(() => {
    return permissionService.filterLeadsForUser(leads, user);
  }, [leads, user]);

  useEffect(() => {
    const handleOpenAddLeadModal = () => {
      if (permissionService.hasPermission(user, 'leads', 'create')) {
        setIsAddModalOpen(true);
      }
    };
    window.addEventListener('openAddLeadModal', handleOpenAddLeadModal);
    return () => {
      window.removeEventListener('openAddLeadModal', handleOpenAddLeadModal);
    };
  }, [user]);

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = userFilteredLeads.filter(lead => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${lead.name} ${lead.primaryEmail} ${lead.primaryPhone}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }
      if (filters.status && filters.status.length > 0) {
        // Ensure type compatibility here by casting filter status to Lead['status']
        if (!filters.status.includes(lead.status as Lead['status'])) return false;
      }
      if (filters.assignedAgent && lead.assignedAgent !== filters.assignedAgent) {
        return false;
      }
      if (filters.source && filters.source.length > 0) {
        if (!filters.source.includes(lead.source)) return false;
      }
      if (filters.propertyType && filters.propertyType.length > 0) {
        if (!filters.propertyType.includes(lead.propertyType)) return false;
      }
      if (filters.budgetRange && lead.budgetRange !== filters.budgetRange) {
        return false;
      }
      if (filters.leadScore && filters.leadScore.length > 0) {
        if (!filters.leadScore.includes(lead.leadScore)) return false;
      }
      if (lead.leadType !== 'Lead') {
        return false;
      }
      return true;
    });

    type LeadScore = 'High' | 'Medium' | 'Low';
    const scoreOrder: Record<LeadScore, number> = {
      High: 3,
      Medium: 2,
      Low: 1,
    };

    filtered.sort((a, b) => {
      const scoreA = a.leadScore as LeadScore;
      const scoreB = b.leadScore as LeadScore;
      switch (sortBy) {
        case 'created-desc':
          return b.createdAt.getTime() - a.createdAt.getTime(); // Direct use of Date object
        case 'created-asc':
          return a.createdAt.getTime() - b.createdAt.getTime(); // Direct use of Date object
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'score-high':
          return scoreOrder[scoreB] - scoreOrder[scoreA];
        case 'score-low':
          return scoreOrder[scoreA] - scoreOrder[scoreB];
        default:
          return 0;
      }
    });
    return filtered;
  }, [userFilteredLeads, filters, sortBy]);

  const leadCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    userFilteredLeads.forEach(lead => {
      counts[lead.status] = (counts[lead.status] || 0) + 1;
    });
    return counts;
  }, [userFilteredLeads]);

  const handleAddLead = async (newLeadData: NewLeadData): Promise<Lead> => {
    try {
      const createdLead = await createLead(newLeadData);
      console.log('CLIENT: Lead created successfully:', createdLead);
      toast.success('Lead created successfully!');
      fetchLeads('Lead');
      return createdLead;
    } catch (error: any) {
      console.error('CLIENT: Failed to create lead:', error);
      toast.error(`Failed to create lead: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const handleLeadUpdateFromModal = useCallback((updatedLead: Lead) => {
    console.log('Lead updated from modal, refreshing list:', updatedLead);
    fetchLeads('Lead');
  }, [fetchLeads]);

  // NEW: Handle status update from LeadListItem
  const handleStatusUpdate = useCallback(async (leadId: string, newStatus: Lead['status']) => { // <--- HERE
    try {
      const leadToUpdate = leads.find(l => l.id === leadId);
      if (!leadToUpdate) {
        throw new Error("Lead not found for status update.");
      }

      if (!permissionService.canEditLead(user, leadToUpdate.assignedAgent, leadToUpdate.createdBy)) {
        toast.error("You don't have permission to change the status of this lead.");
        return;
      }

      // No need to cast newStatus here, as it's already correctly typed
      await updateLead(leadId, { status: newStatus });
      toast.success(`Lead status updated for ${leadToUpdate.name}`);
    } catch (error: any) {
      console.error('Failed to update lead status from home page:', error);
      toast.error(`Failed to update status: ${error.message || 'Unknown error'}`);
      fetchLeads('Lead');
    }
  }, [leads, updateLead, user]);

  const handleViewDetails = useCallback((lead: Lead) => {
    if (permissionService.canAccessLead(user, lead.assignedAgent)) {
      router.push(`/leads/${lead.id}`);
    } else {
      toast.error("You don't have permission to view details for this lead.");
    }
  }, [router, user]);

  const handleEditLead = useCallback((lead: Lead) => {
    if (permissionService.hasPermission(user, 'leads', 'update') &&
      permissionService.canAccessLead(user, lead.assignedAgent)) {
      router.push(`/leads/${lead.id}`);
    } else {
      toast.error("You don't have permission to edit this lead.");
    }
  }, [router, user]);

  const handleLeadAction = (lead: Lead, action: string) => {
    if (!permissionService.canAccessLead(user, lead.assignedAgent)) {
      toast.error("You don't have permission to perform actions on this lead.");
      return;
    }
    switch (action) {
      case 'notes':
        setSelectedLeadId(lead.id);
        setIsNotesModalOpen(true);
        break;
      case 'tasks':
        setSelectedLeadId(lead.id);
        setIsTasksModalOpen(true);
        break;
      case 'edit':
        handleEditLead(lead);
        break;
      case 'view':
        handleViewDetails(lead);
        break;
    }
  };

  const handleImportComplete = (importedCount: number) => {
    if (importedCount > 0) {
      toast.success(`${importedCount} leads imported successfully!`);
    } else {
      toast.info('No new leads were imported.');
    }
    fetchLeads('Lead');
    setIsImportModalOpen(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading leads from database...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="border-0 shadow-md max-w-md">
            <CardContent className="text-center py-8">
              <Database className="h-16 w-16 mx-auto mb-4 text-red-300" />
              <div className="text-red-600 mb-4">Database Connection Error</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchLeads('Lead')}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.role === 'agent' ? 'My Leads' : 'Leads Management'}
                </h1>
                <p className="text-gray-600">
                  {user?.role === 'agent'
                    ? 'Manage your assigned leads and track conversions'
                    : 'Manage your real estate leads and track conversions'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex rounded-md shadow-sm" role="group">
                <Button
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  onClick={() => setViewMode('card')}
                  size="sm"
                  className={`${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-r-none`}
                >
                  <LayoutGrid className="h-4 w-4 mr-1" /> Card View
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                  size="sm"
                  className={`${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-l-none border-l-0`}
                >
                  <List className="h-4 w-4 mr-1" /> List View
                </Button>
              </div>

              {/* Import/Export Actions */}
              {permissionService.hasPermission(user, 'leads', 'create') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="font-medium">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsImportModalOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Leads
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsExportModalOpen(true)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Leads
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {permissionService.hasPermission(user, 'leads', 'create') && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Lead
                </Button>
              )}
            </div>
          </div>

          {/* Dashboard Metrics */}
          <DashboardMetrics />

          {/* Filters */}
          <LeadFilters
            filters={filters}
            onFiltersChange={setFilters}
            leadCounts={leadCounts}
          />

          {/* Sort and Results */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedLeads.length} of {userFilteredLeads.length} leads
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created-desc">Newest First</SelectItem>
                  <SelectItem value="created-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="score-high">High Priority First</SelectItem>
                  <SelectItem value="score-low">Low Priority First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Leads Grid/List */}
          {filteredAndSortedLeads.length > 0 ? (
            // Conditional Rendering based on viewMode
            viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedLeads.map(lead => (
                  <div key={lead.id} className="relative group">
                    <LeadCard
                      lead={lead}
                      onViewDetails={handleViewDetails}
                      onEditLead={handleEditLead}
                    />
                    {/* Quick Actions Overlay (Card View Specific) */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="bg-white shadow-md">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleLeadAction(lead, 'view')}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleLeadAction(lead, 'notes')}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Notes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleLeadAction(lead, 'tasks')}>
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Manage Tasks
                          </DropdownMenuItem>
                          {permissionService.canEditLead(user, lead.assignedAgent, lead.createdBy) && (
                            <DropdownMenuItem onClick={() => handleLeadAction(lead, 'edit')}>
                              <Building2 className="h-4 w-4 mr-2" />
                              Edit Lead
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : ( // List View
              <div className="flex flex-col gap-3">
                {filteredAndSortedLeads.map(lead => (
                  <LeadListItem
                    key={lead.id}
                    lead={lead}
                    onViewDetails={handleViewDetails}
                    onEditLead={handleEditLead}
                    onStatusChange={handleStatusUpdate}
                  />
                ))}
              </div>
            )
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="text-center py-12">
                <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {userFilteredLeads.length === 0 ? 'No leads in database' : 'No leads found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {userFilteredLeads.length === 0
                    ? user?.role === 'agent'
                      ? "You don't have any leads assigned to you yet. Contact your admin or start adding leads."
                      : "Your database is empty. Start by adding your first lead to begin managing your real estate prospects."
                    : Object.keys(filters).length > 0 || filters.search
                      ? "Try adjusting your filters to find leads."
                      : "No leads match your current criteria."}
                </p>
                {permissionService.hasPermission(user, 'leads', 'create') && (
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {userFilteredLeads.length === 0 ? 'Add Your First Lead' : 'Add New Lead'}
                    </Button>
                    {userFilteredLeads.length === 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setIsImportModalOpen(true)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Leads
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Modals */}
          {permissionService.hasPermission(user, 'leads', 'create') && (
            <>
              <AddLeadModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onAddLead={handleAddLead}
                existingLeads={userFilteredLeads}
              />

              <LeadImportModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                onImportComplete={handleImportComplete}
              />

              <LeadExportModal
                open={isExportModalOpen}
                onOpenChange={setIsExportModalOpen}
                leads={userFilteredLeads}
              />
            </>
          )}

          {selectedLeadId && (
            <>
              <LeadNotesModal
                open={isNotesModalOpen}
                onOpenChange={setIsNotesModalOpen}
                leadId={selectedLeadId}
                onLeadUpdate={handleLeadUpdateFromModal}
              />

              {/* <LeadTasksModal
                open={isTasksModalOpen}
                onOpenChange={setIsTasksModalOpen}
                leadId={selectedLeadId}
                onLeadUpdate={handleLeadUpdateFromModal}
              /> */}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
