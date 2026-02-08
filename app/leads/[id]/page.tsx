// app/leads/[id]/page.tsx
'use client'; // This component needs to be a client component to use hooks like useRouter, useState, useEffect

import { useRouter } from 'next/navigation'; // Correct import for Next.js 13+ App Router navigation
import { LeadProfile } from '@/components/leads/LeadProfile'; // Adjust path if necessary
import { useState, useEffect } from 'react';
import { Lead } from '@/types/lead'; // Ensure your Lead type is correctly defined here
import { Skeleton } from '@/components/ui/skeleton'; // Assuming you have a skeleton component for loading state
import { Button } from '@/components/ui/button'; // Assuming you have a button component
import { toast } from 'sonner'; // Using sonner for toasts/notifications

interface LeadDetailPageProps {
  params: {
    id: string; // The dynamic part of the URL, e.g., '123' for /leads/123
  };
}

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
  const router = useRouter();
  const { id } = params;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch lead details from your API route
  const fetchLead = async () => {
    try {
      setLoading(true);
      // Calls your new API route at /api/leads/[id]
      const response = await fetch(`/api/leads/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Ensure token is sent
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch lead: ${response.statusText}`);
      }
      const data: Lead = await response.json();
      // Convert date strings back to Date objects if your API returns strings
      if (data.createdAt) data.createdAt = new Date(data.createdAt);
      if (data.updatedAt) data.updatedAt = new Date(data.updatedAt);
      if (data.lastContacted) data.lastContacted = new Date(data.lastContacted);
      data.activities = data.activities?.map(activity => ({
        ...activity,
        date: new Date(activity.date)
      })) || [];

      // Ensure preferredLocations is an array
      data.preferredLocations = Array.isArray(data.preferredLocations) ? data.preferredLocations : [];

      setLead(data);
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to load lead details.');
      setLead(null); // Clear lead state on error
    } finally {
      setLoading(false);
    }
  };

  // Function to update lead details via your API route
  const handleUpdateLead = async (updatedLead: Lead) => {
    // Store the current lead state before the update
    const oldLead = lead; 

    try {
      // Calls your new API route at /api/leads/[id] with a PUT request
      const response = await fetch(`/api/leads/${updatedLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(updatedLead),
      });
      if (!response.ok) {
        throw new Error(`Failed to update lead: ${response.statusText}`);
      }
      const data: Lead = await response.json();
      // Ensure dates are correctly parsed after update as well
      if (data.createdAt) data.createdAt = new Date(data.createdAt);
      if (data.updatedAt) data.updatedAt = new Date(data.updatedAt);
      if (data.lastContacted) data.lastContacted = new Date(data.lastContacted);
      data.activities = data.activities?.map(activity => ({
        ...activity,
        date: new Date(activity.date)
      })) || [];

      // Ensure preferredLocations is an array
      data.preferredLocations = Array.isArray(data.preferredLocations) ? data.preferredLocations : [];

      setLead(data); // Update local state with the latest data from the server
      toast.success('Lead updated successfully!');

      // --- Activity Logging for Lead Update ---
      if (oldLead) {
        let changes: string[] = [];
        
        // Compare individual fields for changes
        if (oldLead.name !== data.name) changes.push(`Name from "${oldLead.name}" to "${data.name}"`);
        if (oldLead.primaryPhone !== data.primaryPhone) changes.push(`Primary Phone from "${oldLead.primaryPhone}" to "${data.primaryPhone}"`);
        if (oldLead.secondaryPhone !== data.secondaryPhone) changes.push(`Secondary Phone from "${oldLead.secondaryPhone || 'N/A'}" to "${data.secondaryPhone || 'N/A'}"`);
        if (oldLead.primaryEmail !== data.primaryEmail) changes.push(`Primary Email from "${oldLead.primaryEmail}" to "${data.primaryEmail}"`);
        if (oldLead.secondaryEmail !== data.secondaryEmail) changes.push(`Secondary Email from "${oldLead.secondaryEmail || 'N/A'}" to "${data.secondaryEmail || 'N/A'}"`);
        if (oldLead.propertyType !== data.propertyType) changes.push(`Property Type from "${oldLead.propertyType}" to "${data.propertyType}"`);
        if (oldLead.budgetRange !== data.budgetRange) changes.push(`Budget Range from "${oldLead.budgetRange}" to "${data.budgetRange}"`);
        
        // For arrays like preferredLocations, compare their stringified versions or content
        // Safely ensure preferredLocations are arrays before sorting for comparison
        const oldPreferredLocations = Array.isArray(oldLead.preferredLocations) ? oldLead.preferredLocations.sort() : [];
        const newPreferredLocations = Array.isArray(data.preferredLocations) ? data.preferredLocations.sort() : [];

        if (JSON.stringify(oldPreferredLocations) !== JSON.stringify(newPreferredLocations)) {
          changes.push(`Preferred Locations from "[${oldPreferredLocations.join(', ')}]" to "[${newPreferredLocations.join(', ')}]"`);
        }
        
        if (oldLead.source !== data.source) changes.push(`Source from "${oldLead.source}" to "${data.source}"`);
        if (oldLead.status !== data.status) changes.push(`Status from "${oldLead.status}" to "${data.status}"`);
        if (oldLead.assignedAgent !== data.assignedAgent) changes.push(`Assigned Agent from "${oldLead.assignedAgent || 'Unassigned'}" to "${data.assignedAgent || 'Unassigned'}"`);
        if (oldLead.notes !== data.notes) changes.push(`Notes updated`); // Detail changes if necessary, or just note update
        if (oldLead.leadScore !== data.leadScore) changes.push(`Lead Score from "${oldLead.leadScore}" to "${data.leadScore}"`);
        if (oldLead.leadType !== data.leadType) changes.push(`Lead Type from "${oldLead.leadType}" to "${data.leadType}"`);

        let activityMessage = 'Lead updated.';
        if (changes.length > 0) {
          activityMessage = `Lead details updated: ${changes.join('; ')}.`;
        }

        const activity = {
          type: 'Status Change', // Using 'Status Change' or create a specific 'Lead Update' type
          description: activityMessage,
          date: new Date().toISOString(), // Ensure date is ISO string
          agent: 'System' // Or actual agent name if you have it from auth context
        };

        try {
          const activityResponse = await fetch(`/api/leads/${updatedLead.id}/activities`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify(activity),
          });

          if (!activityResponse.ok) {
            console.error('Failed to log activity:', await activityResponse.text());
          } else {
            // Optionally re-fetch lead to show new activity immediately
            fetchLead(); 
          }
        } catch (activityError) {
          console.error('Error sending activity:', activityError);
        }
      }
      // --- End Activity Logging ---

    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead.');
    }
  };

  // Define the onBack function to navigate to /leads/home
  const handleBack = () => {
    router.push('/leads'); // Redirect to the specified path
  };

  // Fetch lead data when the component mounts or ID changes
  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]); // Dependency array includes 'id' to refetch if the ID changes

  // Loading state UI
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" /> {/* Placeholder for title/header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full" /> {/* Placeholder for contact info */}
            <Skeleton className="h-40 w-full" /> {/* Placeholder for property preferences */}
            <Skeleton className="h-60 w-full" /> {/* Placeholder for activities/notes */}
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-[500px] w-full" /> {/* Placeholder for communication panel */}
          </div>
        </div>
      </div>
    );
  }

  // Handle case where lead is not found after loading
  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-gray-500">
        <h2 className="text-2xl font-semibold mb-4">Lead Not Found</h2>
        <p className="mb-6">The lead you are looking for does not exist or you do not have access.</p>
        <Button onClick={handleBack}>Go to Leads List</Button> {/* Button to go back */}
      </div>
    );
  }

  // Render LeadProfile component when lead data is available
  return (
    <div className="p-6">
      <LeadProfile
        lead={lead}
        onBack={handleBack} // Pass the navigation function
        onUpdateLead={handleUpdateLead} // Pass the update function
        onLeadRefresh={fetchLead} // Pass the fetch function for refreshing
      />
    </div>
  );
}
