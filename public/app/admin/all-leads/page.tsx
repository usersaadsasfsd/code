"use client";

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useLeads } from '@/hooks/useLeads';
import { useAgents } from '@/hooks/useAgents';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LeadExportModal } from '@/components/leads/LeadExportModal';
import { LeadImportModal } from '@/components/leads/LeadImportModal';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

export default function AllLeadsPage() {
  const { leads, fetchLeads, loading } = useLeads();
  const { agents, fetchAgents } = useAgents();
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add state variables for new filters
  const [leadNameFilter, setLeadNameFilter] = useState('');
  const [contactInfoFilter, setContactInfoFilter] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('');
  const [lastCommentFilter, setLastCommentFilter] = useState('');

  // Add state variables for dropdown filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateReceivedFilter, setDateReceivedFilter] = useState('');
  const [dateAssignedFilter, setDateAssignedFilter] = useState('');

  // Add state variables for Budget Range filter
  const [budgetRange, setBudgetRange] = useState({ min: '', max: '' });

  useEffect(() => {
    console.log('Fetching leads...');
    fetchLeads();
    fetchAgents();
  }, []); // Run only once on component mount

  // Debugging: Log date filters to verify their values
  useEffect(() => {
    console.log('Date Received Filter:', dateReceivedFilter);
    console.log('Date Assigned Filter:', dateAssignedFilter);
  }, [dateReceivedFilter, dateAssignedFilter]);

  const getAgentName = (agentId?: string) => {
    if (!agentId) return 'Unassigned';
    const a = agents.find(x => x.id === agentId);
    return a ? a.name : agentId;
  };

  const lastCommentText = (lead: any) => {
    if (!lead.activities || lead.activities.length === 0) return '';
    const last = lead.activities[lead.activities.length - 1];
    return `${last.description} — ${last.agent || 'Unknown'} (${format(new Date(last.date), 'dd MMM yyyy, h:mm a')})`;
  };

  const formatDateAssigned = (date: Date | string | undefined) => {
    return date ? format(new Date(date), 'dd MMM yyyy, h:mm a') : '—';
  };

  // Sort leads by Date Received (recent to older)
  const sortedLeads = [...leads].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Sort descending
  });

  // Apply sorting before filtering
  const filteredLeads = sortedLeads.filter(lead => {
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(leadNameFilter.toLowerCase()) &&
      (lead.primaryPhone.toLowerCase().includes(contactInfoFilter.toLowerCase()) ||
       lead.primaryEmail.toLowerCase().includes(contactInfoFilter.toLowerCase())) &&
      getAgentName(lead.assignedAgent).toLowerCase().includes(salespersonFilter.toLowerCase()) &&
      lastCommentText(lead).toLowerCase().includes(lastCommentFilter.toLowerCase()) &&
      (statusFilter === '' || lead.status === statusFilter) &&
      (dateReceivedFilter === '' || (lead.createdAt && format(new Date(lead.createdAt), 'yyyy-MM-dd') === dateReceivedFilter)) &&
      (dateAssignedFilter === '' || (lead.dateAssignedToSales && format(new Date(lead.dateAssignedToSales), 'yyyy-MM-dd') === dateAssignedFilter)) &&
      (budgetRange.min === '' || (lead.budget && lead.budget >= parseFloat(budgetRange.min))) &&
      (budgetRange.max === '' || (lead.budget && lead.budget <= parseFloat(budgetRange.max))) &&
      lead.status.toLowerCase().includes(query)
    );
  });

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">All Leads</h1>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setImportOpen(true)} className="bg-blue-600 hover:bg-blue-700">Import Leads</Button>
              <Button onClick={() => setExportOpen(true)} className="bg-green-600 hover:bg-green-700">Export Leads</Button>
            </div>
          </div>

          {/* Add input fields for new filters in the UI */}
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Filter by Lead Name"
              value={leadNameFilter}
              onChange={e => setLeadNameFilter(e.target.value)}
              className="w-64"
            />
            <Input
              placeholder="Filter by Contact Info"
              value={contactInfoFilter}
              onChange={e => setContactInfoFilter(e.target.value)}
              className="w-64"
            />
            <Input
              placeholder="Filter by Salesperson"
              value={salespersonFilter}
              onChange={e => setSalespersonFilter(e.target.value)}
              className="w-64"
            />
            <Input
              placeholder="Filter by Last Comment"
              value={lastCommentFilter}
              onChange={e => setLastCommentFilter(e.target.value)}
              className="w-64"
            />
          </div>

          {/* Add dropdown fields for new filters in the UI */}
          <div className="flex items-center space-x-2 mb-4">
            <div className='w-full'>
                <label className='w-full' htmlFor="">Status</label>
                <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full border rounded-md p-2"
                >
                    <option value="">All Statuses</option>
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                </select>
            </div>
            <div className='w-full'>
                <label htmlFor="">Date Received</label>
                <Input
                type="date"
                value={dateReceivedFilter}
                onChange={e => setDateReceivedFilter(e.target.value)}
                className="border rounded-md p-2"
                />
            </div>
            <div className='w-full'>
                <label htmlFor="">Date Assigned</label>
                <Input
                type="date"
                value={dateAssignedFilter}
                onChange={e => setDateAssignedFilter(e.target.value)}
                className="border rounded-md p-2"
                />
            </div>
          </div>

          {/* Add Budget Range filter inputs in the UI */}
          <div className="flex items-center space-x-2 mb-4">
            <Input
              type="number"
              placeholder="Min Budget"
              value={budgetRange.min}
              onChange={e => setBudgetRange({ ...budgetRange, min: e.target.value })}
              className="border rounded-md p-2"
            />
            <Input
              type="number"
              placeholder="Max Budget"
              value={budgetRange.max}
              onChange={e => setBudgetRange({ ...budgetRange, max: e.target.value })}
              className="border rounded-md p-2"
            />
          </div>

          <div className="bg-white border rounded-md shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Salesperson</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Comment</TableHead>
                  <TableHead>Date Received</TableHead>
                  <TableHead>Date Assigned</TableHead>
                  <TableHead>Budget Range</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8}>Loading...</TableCell>
                  </TableRow>
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>No leads found</TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map(lead => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-700">{lead.primaryPhone}</div>
                        <div className="text-sm text-gray-500">{lead.primaryEmail}</div>
                      </TableCell>
                      <TableCell>{getAgentName(lead.assignedAgent)}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell className="text-sm text-gray-700">{lastCommentText(lead)}</TableCell>
                      <TableCell>{lead.createdAt ? format(new Date(lead.createdAt), 'dd MMM yyyy') : ''}</TableCell>
                      <TableCell>{lead.dateAssignedToSales ? formatDateAssigned(lead.dateAssignedToSales) : '—'}</TableCell>
                      <TableCell>{lead.budget ? `$${lead.budget}` : '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <LeadExportModal open={exportOpen} onOpenChange={setExportOpen} leads={leads} />
          <LeadImportModal open={importOpen} onOpenChange={setImportOpen} onImportComplete={() => fetchLeads()} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
