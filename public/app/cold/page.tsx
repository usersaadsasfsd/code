// app/cold-leads/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLeads, NewLeadData } from '@/hooks/useLeads';
import { Lead, LeadFilters as Filters } from '@/types/lead';
import { LeadCard } from '@/components/leads/LeadCard';
import { LeadListItem } from '@/components/leads/LeadListItem'; // Import LeadListItem
import { LeadFilters } from '@/components/leads/LeadFilters';
import { AddLeadModal } from '@/components/leads/AddLeadModal';
import { LeadExportModal } from '@/components/leads/LeadExportModal';
import { LeadImportModal } from '@/components/leads/LeadImportModal';
import { LeadNotesModal } from '@/components/leads/LeadNotesModal';
import { LeadTasksModal } from '@/components/leads/LeadTasksModal';
import { Button } from '@/components/ui/button';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Upload, Download, Filter as FilterIcon, Building2, Loader2, Database, MoreHorizontal, FileText, CheckSquare, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PermissionService } from '@/lib/permissions';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { toast } from 'sonner';


type SortOption = 'created-desc' | 'created-asc' | 'name-asc' | 'name-desc' | 'score-high' | 'score-low';
type ViewMode = 'card' | 'list'; // Define ViewMode type consistent with HomePage

export default function ColdLeadsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { leads, loading, error, fetchLeads, createLead, updateLead } = useLeads();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [selectedLeadIdForModal, setSelectedLeadIdForModal] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('created-desc');
  const [filters, setFilters] = useState<Filters>({});
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // Initialize with 'card' view

  const permissionService = PermissionService.getInstance();

  const memoizedFetchLeads = useCallback(() => {
    fetchLeads('Cold-Lead'); // Explicitly fetch only cold leads
  }, [fetchLeads]);

  useEffect(() => {
    memoizedFetchLeads();
  }, [memoizedFetchLeads]);

  const userFilteredLeads = useMemo(() => {
    // Filter by leadType here to ensure only 'Cold-Lead' are considered initially
    return permissionService.filterLeadsForUser(leads, user).filter(lead => lead.leadType === 'Cold-Lead');
  }, [leads, user]);

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = userFilteredLeads.filter(lead => {
      // The userFilteredLeads already filters for 'Cold-Lead', so no need to re-check lead.leadType here
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${lead.name} ${lead.primaryEmail} ${lead.primaryPhone} ${lead.companyName || ''}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(lead.status)) return false;
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
      return true;
    });

    type LeadScore = 'High' | 'Medium' | 'Low';
    const scoreOrder: Record<LeadScore, number> = { High: 3, Medium: 2, Low: 1 };

    filtered.sort((a, b) => {
      const scoreA = a.leadScore as LeadScore;
      const scoreB = b.leadScore as LeadScore;
      switch (sortBy) {
        case 'created-desc': return b.createdAt.getTime() - a.createdAt.getTime();
        case 'created-asc': return a.createdAt.getTime() - b.createdAt.getTime();
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'score-high': return scoreOrder[scoreB] - scoreOrder[scoreA];
        case 'score-low': return scoreOrder[scoreA] - scoreOrder[scoreB];
        default: return 0;
      }
    });
    return filtered;
  }, [userFilteredLeads, filters, sortBy]);

  const leadCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    // Only count cold leads
    userFilteredLeads.forEach(lead => {
      counts[lead.status] = (counts[lead.status] || 0) + 1;
    });
    return counts;
  }, [userFilteredLeads]);

  const handleAddLead = async (newLeadData: NewLeadData): Promise<Lead> => {
    try {
      // Ensure leadType is set to 'Cold-Lead' for this page
      const createdLead = await createLead({ ...newLeadData, leadType: 'Cold-Lead' });
      toast.success('Cold Lead created successfully!');
      memoizedFetchLeads(); // Refresh cold leads after creation
      return createdLead;
    } catch (error) {
      console.error('Failed to create cold lead:', error);
      toast.error('Failed to create cold lead.');
      throw error;
    }
  };

  const handleLeadUpdateFromModal = useCallback(() => {
    memoizedFetchLeads(); // Refresh cold leads after modal update
  }, [memoizedFetchLeads]);

  const handleStatusUpdate = useCallback(async (leadId: string, newStatus: Lead['status']) => {
    try {
      const leadToUpdate = leads.find(l => l.id === leadId && l.leadType === 'Cold-Lead');
      if (!leadToUpdate) {
        throw new Error("Cold Lead not found for status update.");
      }

      if (!permissionService.canEditLead(user, leadToUpdate.assignedAgent, leadToUpdate.createdBy)) {
        toast.error("You don't have permission to change the status of this cold lead.");
        return;
      }

      await updateLead(leadId, { status: newStatus });
      toast.success(`Cold Lead status updated for ${leadToUpdate.name}`);
    } catch (error: any) {
      console.error('Failed to update cold lead status:', error);
      toast.error(`Failed to update status: ${error.message || 'Unknown error'}`);
      memoizedFetchLeads(); // Re-fetch to ensure UI consistency
    }
  }, [leads, updateLead, user, permissionService, memoizedFetchLeads]);


  const handleViewDetails = (lead: Lead) => {
    if (permissionService.canAccessLead(user, lead.assignedAgent)) {
      router.push(`/leads/${lead.id}`);
    } else {
      toast.error('You do not have permission to view this lead.');
    }
  };

  const handleEditLead = (lead: Lead) => {
    if (permissionService.canEditLead(user, lead.assignedAgent, lead.createdBy)) {
      router.push(`/leads/${lead.id}`);
    } else {
      toast.error('You do not have permission to edit this lead.');
    }
  };

  const handleLeadAction = (lead: Lead, action: string) => {
    if (!permissionService.canAccessLead(user, lead.assignedAgent)) {
      toast.error("You don't have permission to perform actions on this cold lead.");
      return;
    }
    setSelectedLeadIdForModal(lead.id);
    switch (action) {
      case 'notes':
        setIsNotesModalOpen(true);
        break;
      case 'tasks':
        setIsTasksModalOpen(true);
        break;
      case 'edit':
        handleEditLead(lead);
        break;
      case 'view': // Added view action for consistency with HomePage LeadCard dropdown
        handleViewDetails(lead);
        break;
      default:
        break;
    }
  };

  const handleImportComplete = (importedCount: number) => {
    toast.success(`${importedCount} cold leads imported successfully!`);
    memoizedFetchLeads();
    setIsImportModalOpen(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading cold leads from database...</span>
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
              <Button onClick={() => memoizedFetchLeads()}>
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
                <h1 className="text-3xl font-bold text-gray-900">Cold Leads</h1>
                <p className="text-gray-600">Manage your cold real estate prospects</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle (Copied from HomePage) */}
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
                  Add New Cold Lead
                </Button>
              )}
            </div>
          </div>

          {/* Dashboard Metrics */}
          <DashboardMetrics leadTypeFilter="Cold-Lead" />

          {/* Filters */}
          <LeadFilters
            filters={filters}
            onFiltersChange={setFilters}
            leadCounts={leadCounts}
          />

          {/* Sort and Results */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedLeads.length} of {userFilteredLeads.length} cold leads
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

          {/* Leads Display - Conditional Rendering */}
          {filteredAndSortedLeads.length > 0 ? (
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
                  {userFilteredLeads.length === 0 ? 'No cold leads in database' : 'No cold leads found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {userFilteredLeads.length === 0
                    ? user?.role === 'agent'
                      ? "You don't have any cold leads assigned to you yet. Contact your admin or start adding leads."
                      : "Your cold leads database is empty. Start by adding your first cold lead to begin managing your real estate prospects."
                    : Object.keys(filters).length > 0 || filters.search
                      ? "Try adjusting your filters to find cold leads."
                      : "No cold leads match your current criteria."}
                </p>
                {permissionService.hasPermission(user, 'leads', 'create') && (
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {userFilteredLeads.length === 0 ? 'Add Your First Cold Lead' : 'Add New Cold Lead'}
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
                leads={filteredAndSortedLeads}
              />
            </>
          )}

          {selectedLeadIdForModal && (
            <>
              <LeadNotesModal
                open={isNotesModalOpen}
                onOpenChange={setIsNotesModalOpen}
                leadId={selectedLeadIdForModal}
                onLeadUpdate={handleLeadUpdateFromModal}
              />

              {/* <LeadTasksModal
                open={isTasksModalOpen}
                onOpenChange={setIsTasksModalOpen}
                leadId={selectedLeadIdForModal}
                onLeadUpdate={handleLeadUpdateFromModal}
              /> */}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
