// components/leads/LeadNotesModal.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Avatar/AvatarFallback might not be used anymore, can be removed if not.
import { Lead, Activity } from '@/types/lead';
import { useAuth } from '@/hooks/useAuth';
import { useLeads } from '@/hooks/useLeads'; // Import useLeads hook
import { FileText, Plus, Clock, User, Tag, Loader2, CalendarDays, Info } from 'lucide-react'; // Added Loader2, CalendarDays, Info
import { toast } from 'sonner'; // For toasts

interface LeadNotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string; // Changed from 'lead: Lead' to 'leadId: string'
  onLeadUpdate: (updatedLead: Lead) => void; // Callback when the lead is updated (e.g., note added)
}

export function LeadNotesModal({ open, onOpenChange, leadId, onLeadUpdate }: LeadNotesModalProps) {
  const { user } = useAuth();
  const { getLeadById, addActivity } = useLeads(); // Destructure getLeadById and addActivity
  const [lead, setLead] = useState<Lead | null>(null);
  const [loadingLead, setLoadingLead] = useState(true);
  const [newNoteContent, setNewNoteContent] = useState(''); // Renamed for clarity
  const [activityType, setActivityType] = useState<Activity['type']>('Note'); // Default activity type
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noteTypes: Activity['type'][] = ['Note', 'Call', 'Email', 'Meeting', 'Status Change', 'Property Shown']; // Added 'Other' for flexibility

  // Function to fetch the lead data
  const fetchLead = useCallback(async () => {
    if (!leadId) {
      setLead(null);
      setLoadingLead(false);
      return;
    }
    setLoadingLead(true);
    setError(null);
    try {
      const fetchedLead = await getLeadById(leadId);
      if (fetchedLead) {
        setLead(fetchedLead);
      } else {
        setError("Lead not found or inaccessible.");
      }
    } catch (err: any) {
      console.error("Failed to fetch lead for notes modal:", err);
      setError(err.message || "Failed to load lead details.");
    } finally {
      setLoadingLead(false);
    }
  }, [leadId, getLeadById]);

  // Fetch lead when modal opens or leadId changes
  useEffect(() => {
    if (open) { // Only fetch when modal opens
      fetchLead();
    } else {
      // Reset state when modal closes
      setLead(null);
      setNewNoteContent('');
      setActivityType('Note');
      setPriority('Medium');
      setSubmittingNote(false);
      setError(null);
    }
  }, [open, leadId, fetchLead]);

  const handleAddNote = async () => {
    if (!lead || !newNoteContent.trim()) {
      toast.error("Note content cannot be empty.");
      return;
    }

    setSubmittingNote(true);
    setError(null);
    try {
      const activityData: Omit<Activity, 'id'> = {
        type: activityType,
        description: newNoteContent.trim(),
        date: new Date(),
        agent: user?.name || 'System', // Use current user's name or 'System'
        metadata: {
          priority,
          addedBy: user?.id,
        },
      };

      console.log("Adding activity:", activityData);
      const updatedLead = await addActivity(lead.id, activityData); // Use addActivity from useLeads

      onLeadUpdate(updatedLead); // Notify parent of updated lead
      setNewNoteContent(''); // Clear textarea
      setActivityType('Note'); // Reset activity type
      setPriority('Medium'); // Reset priority
      setLead(updatedLead); // Update local lead state with the new activities
      toast.success("Note added successfully!");
    } catch (err: any) {
      console.error('Failed to add note:', err);
      setError(err.message || 'Failed to add note.');
      toast.error(`Failed to add note: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmittingNote(false);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    const icons = {
      'Call': '📞',
      'Email': '📧',
      'Meeting': '🤝',
      'Note': '📝',
      'Status Change': '🔄',
      'Property Shown': '🏠',
      'Other': '🔗', // Icon for 'Other'
    };
    return icons[type] || '📝';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-amber-100 text-amber-800',
      'Low': 'bg-green-100 text-green-800',
    };
    return colors[priority as keyof typeof colors] || colors.Medium;
  };

  // Helper to get color for lead type badge
  const getLeadTypeColor = (type: 'Lead' | 'Cold-Lead') => {
    switch (type) {
      case 'Lead': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cold-Lead': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (date: Date | string) => { // Accept Date or string
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // Sort activities by date (newest first)
  const sortedActivities = lead?.activities
    ? [...lead.activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Notes & Activities - {lead?.name || 'Loading...'}</span>
            {lead?.leadType && (
              <Badge variant="outline" className={`text-xs ${getLeadTypeColor(lead.leadType)}`}>
                {lead.leadType.replace('-', ' ')}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            View all notes and activities for this lead
          </DialogDescription>
        </DialogHeader>

        {loadingLead ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading lead notes...</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center py-8 text-red-600">
            Error: {error}
          </div>
        ) : !lead ? (
          <div className="flex-1 flex items-center justify-center py-8 text-gray-600">
            No lead data available. Please select a lead.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Note */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-4 flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add New Note</span>
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Activity Type</Label>
                      <Select value={activityType} onValueChange={(value: Activity['type']) => setActivityType(value)} disabled={submittingNote}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {noteTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              <span className="flex items-center space-x-2">
                                <span>{getActivityIcon(type)}</span>
                                <span>{type}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Priority</Label>
                      <Select value={priority} onValueChange={(value: 'Low' | 'Medium' | 'High') => setPriority(value)} disabled={submittingNote}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Note Content</Label>
                    <Textarea
                      placeholder="Type your note or activity description here..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      rows={4}
                      className="mt-1"
                      disabled={submittingNote}
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>} {/* Display error for adding note */}

                  <Button
                    onClick={handleAddNote}
                    disabled={submittingNote || !newNoteContent.trim() || !lead}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {submittingNote ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Lead Summary */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Lead Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="outline">{lead.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type:</span>
                    <span>{lead.propertyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span>{lead.budgetRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Source:</span>
                    <span>{lead.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Activities:</span>
                    <span className="font-medium">{lead.activities.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activities Timeline */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Activity Timeline ({sortedActivities.length})</span>
              </h3>

              <div className="max-h-96 overflow-y-auto space-y-3 pr-2"> {/* Added pr-2 for scrollbar spacing */}
                {sortedActivities.length > 0 ? sortedActivities.map((activity) => (
                  <div key={activity.id || `${activity.date}-${activity.description.substring(0,10)}`} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getActivityIcon(activity.type)}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                        {activity.metadata?.priority && (
                          <Badge className={`text-xs ${getPriorityColor(activity.metadata.priority)}`}>
                            {activity.metadata.priority}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center space-x-1">
                        <CalendarDays className="h-3 w-3" />
                        <span>{formatDate(activity.date)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-900 mb-2 whitespace-pre-wrap">{activity.description}</p> {/* Added whitespace-pre-wrap */}

                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>by {activity.agent || 'Unknown Agent'}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No activities recorded yet</p>
                    <p className="text-sm mt-1">Add your first note to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submittingNote}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
