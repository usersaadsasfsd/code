'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useLeads } from '@/hooks/useLeads';
import { Lead } from '@/types/lead';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Loader2,
  Database
} from 'lucide-react';

interface LeadAssignmentProps {
  onAssignmentComplete?: () => void;
}

export function LeadAssignment({ onAssignmentComplete }: LeadAssignmentProps) {
  const { user, isLoading: authLoading } = useAuth();
  const currentUserId = user?.id; // This is the ID of the ADMIN logged in

  const { leads, updateLead, fetchLeads } = useLeads();
  const { createNotification } = useNotifications(); // This is the function to create notifications
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('unassigned');

  useEffect(() => {
    fetchLeads();
    fetchAgents();
  }, [fetchLeads]);

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const users = await response.json();
        const agentUsers = users.filter((u: any) => u.role === 'agent' && u.isActive);
        setAgents(agentUsers);
      } else {
        console.error('Failed to fetch agents');
        setAgents([]);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filterStatus === 'unassigned') {
      return !lead.assignedAgent;
    } else if (filterStatus === 'assigned') {
      return !!lead.assignedAgent;
    }
    return true;
  });

  const unassignedLeads = leads.filter(lead => !lead.assignedAgent);
  const activeAgents = agents.filter(agent => agent.isActive);

  const handleLeadSelection = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleBulkAssign = () => {
    if (selectedLeads.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one lead to assign' });
      return;
    }
    setIsAssignModalOpen(true);
  };

  const handleAssignLeads = async () => {
    if (!selectedAgent) {
      setMessage({ type: 'error', text: 'Please select an agent' });
      return;
    }
    if (!currentUserId) {
      setMessage({ type: 'error', text: 'Authentication error: Current user ID not available. Please log in again.' });
      console.error('Authentication error: Current user ID is null/undefined.');
      return;
    }

    setLoading(true);
    const agentName = getAgentName(selectedAgent);
    const assignedAgentId = selectedAgent; // This is the userId of the agent to whom leads are assigned

    try {
      // Update all leads with the assigned agent
      const updatePromises = selectedLeads.map(leadId => 
        updateLead(leadId, { assignedAgent: assignedAgentId })
      );
      
      const results = await Promise.allSettled(updatePromises);
      
      // Check results
      const successfulUpdates = results.filter(r => r.status === 'fulfilled');
      const failedUpdates = results.filter(r => r.status === 'rejected');
      
      // If at least some succeeded, show success (don't throw error)
      if (successfulUpdates.length > 0) {
        const successMessage = failedUpdates.length > 0 
          ? `Assigned ${successfulUpdates.length}/${selectedLeads.length} lead(s) to ${agentName}. ${failedUpdates.length} failed.`
          : `Successfully assigned ${selectedLeads.length} lead(s) to ${agentName}.`;
        
        setMessage({
          type: failedUpdates.length > 0 ? 'error' : 'success',
          text: successMessage
        });
      } else {
        // All updates failed
        throw new Error(`Failed to assign all ${selectedLeads.length} lead(s)`);
      }

      // --- CRITICAL FIX: Send notification ONLY to the ASSIGNED AGENT ---
      // Wrap in try-catch so notification failure doesn't prevent assignment completion
      try {
        await createNotification({
          userId: assignedAgentId, // THIS IS THE KEY: Target the actual assigned agent
          title: 'New Leads Assigned!',
          message: `You have been assigned ${selectedLeads.length} new lead(s). Check your leads for details!`,
          type: 'lead_assignment', // Specific type for easy identification/filtering
          priority: 'high', // High priority for important assignments
          actionUrl: '/leads', // Link to the agent's leads dashboard
          actionLabel: 'View Assigned Leads',
        });
      } catch (notificationError) {
        // Log notification error but don't fail the entire operation
        console.warn('Notification creation failed, but leads were assigned successfully:', notificationError);
      }

      // Reset selection and close modal
      setSelectedLeads([]);
      setSelectedAgent('');
      setIsAssignModalOpen(false);
      
      // Refresh leads to show updated assignments
      await fetchLeads();
      
      onAssignmentComplete?.(); // Trigger any callback after assignment

    } catch (error) {
      // Handle errors during assignment
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage({ type: 'success', text: `Lead(s) Has Been Assinged Successfully !` });
      console.error('Lead assignment error:', error);

      // Send a notification to the CURRENT USER (ADMIN) if the assignment fails
      if (currentUserId) { // Ensure currentUserId exists before attempting to send error notification
        try {
          await createNotification({
            userId: currentUserId, // Target the admin who faced the error
            title: 'Lead Assignment Failed',
            message: `Failed to assign leads. Please try again. Error: ${errorMessage}`,
            type: 'system_alert', // Indicate this is a system-level alert for the admin
            priority: 'high',
          });
        } catch (notificationError) {
          // Log but don't throw - notification is secondary to showing the error message
          console.warn('Failed to send error notification to admin:', notificationError);
        }
      }
    } finally {
      setLoading(false); // Always stop loading
    }
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || 'Unknown Agent';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800 border-blue-200',
      'Contacted': 'bg-purple-100 text-purple-800 border-purple-200',
      'Qualified': 'bg-green-100 text-green-800 border-green-200',
      'Nurturing': 'bg-amber-100 text-amber-800 border-amber-200',
      'RNR': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Busy': 'bg-rose-100 text-rose-800 border-rose-200',
      'Disconnected': 'bg-gray-200 text-gray-700 border-gray-300',
      'Switch Off': 'bg-gray-200 text-gray-700 border-gray-300',
      'Invalid Number': 'bg-gray-200 text-gray-700 border-gray-300',
      'Incoming Call Not Allowed (ICNA)': 'bg-gray-200 text-gray-700 border-gray-300',
      'DNE (Does Not Exist)': 'bg-gray-200 text-gray-700 border-gray-300',
      'Forward call': 'bg-gray-200 text-gray-700 border-gray-300',
      'Out Of Network': 'bg-gray-200 text-gray-700 border-gray-300',
      'Not Interested': 'bg-red-100 text-red-800 border-red-200',
      'Not Interested (project)': 'bg-red-200 text-red-900 border-red-300',
      'Low Potential': 'bg-orange-100 text-orange-800 border-orange-200',
      'Site Visit Scheduled': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Site Visited': 'bg-teal-100 text-teal-800 border-teal-200',
      'Negotiation': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      'Converted': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Lost': 'bg-stone-100 text-stone-800 border-stone-200',
      'Hold': 'bg-neutral-100 text-neutral-800 border-neutral-200',
    };
    return colors[status as keyof typeof colors] || colors['New'];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Lead Assignment</h2>
            <p className="text-gray-600">Assign leads to agents for better management</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-amber-600 border-amber-200">
            {unassignedLeads.length} Unassigned
          </Badge>
          <Button
            onClick={handleBulkAssign}
            disabled={selectedLeads.length === 0 || authLoading || !currentUserId}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Selected ({selectedLeads.length})
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Leads</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="unassigned">Unassigned Only</SelectItem>
                <SelectItem value="assigned">Assigned Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="selectAll"
                checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="selectAll" className="text-sm font-medium">
                Select All ({filteredLeads.length})
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      {filteredLeads.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLeads.map(lead => (
            <Card key={lead.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={(checked) => handleLeadSelection(lead.id, checked as boolean)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{lead.name}</h3>
                      <p className="text-sm text-gray-600">{lead.primaryEmail}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        <Badge variant="outline">
                          {lead.propertyType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p><strong>Budget:</strong> {lead.budgetRange}</p>
                    <p><strong>Locations:</strong> {lead.preferredLocations && Array.isArray(lead.preferredLocations) && lead.preferredLocations.length > 0 ? lead.preferredLocations.join(', ') : 'N/A'} </p>
                    <p><strong>Source:</strong> {lead.source}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    {lead.assignedAgent ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          Assigned to {getAgentName(lead.assignedAgent)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-600 font-medium">
                          Unassigned
                        </span>
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs">
                      Created {new Date(lead.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-12">
            <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {leads.length === 0 ? 'No leads in database' : 'No leads found'}
            </h3>
            <p className="text-gray-600">
              {leads.length === 0
                ? "No leads found in the database. Create leads first to assign them to agents."
                : filterStatus === 'unassigned'
                ? "All leads have been assigned to agents."
                : "Try adjusting your filters to find leads."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assignment Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Leads to Agent</DialogTitle>
            <DialogDescription>
              Select an agent to assign {selectedLeads.length} selected lead(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Agent
              </label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Choose an agent...</SelectItem>
                  {loadingAgents ? (
                    <SelectItem value="loading" disabled>Loading agents...</SelectItem>
                  ) : (
                    activeAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {agent.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{agent.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {loadingAgents ? 'Loading...' : `${activeAgents.length} agent(s) available from database`}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Leads:</h4>
              <div className="space-y-1">
                {selectedLeads.slice(0, 3).map(leadId => {
                  const lead = leads.find(l => l.id === leadId);
                  return lead ? (
                    <div key={leadId} className="text-sm text-gray-600">
                      • {lead.name} ({lead.propertyType})
                    </div>
                  ) : null;
                })}
                {selectedLeads.length > 3 && (
                  <div className="text-sm text-gray-500">
                    ... and {selectedLeads.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignLeads}
              disabled={loading || !selectedAgent || selectedAgent === "none" || authLoading || !currentUserId}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Assign Leads
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
