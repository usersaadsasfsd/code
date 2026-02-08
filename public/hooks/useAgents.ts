'use client';

import { useState, useEffect } from 'react';
import { User, RegisterData } from '@/types/auth'; // Import User and RegisterData from auth types

export function useAgents() {
  const [agents, setAgents] = useState<User[]>([]); // agents now store User objects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users with role 'agent' from the users API
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const users: User[] = await response.json(); // Expecting an array of User objects
        // Filter users to only include those with role 'agent' and who are active
        const agentUsers = users.filter(user => user.role === 'agent' && user.isActive);

        setAgents(agentUsers); // Set the filtered User objects directly
      } else {
        throw new Error('Failed to fetch agents');
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch agents');
      setAgents([]); // Clear agents on error
    } finally {
      setLoading(false);
    }
  };

  // The type for agentData here should align with what's expected for creating a user
  // We'll use RegisterData from types/auth and omit 'id' which is backend generated
  const createAgent = async (userData: Omit<RegisterData, 'role'>): Promise<User> => {
    try {
      // Since agents are now users, we create them through the users API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          ...userData,
          role: 'agent', // Explicitly set role to 'agent'
          // A password is required for user creation. In a real app,
          // you might prompt for it, or have a robust default/reset mechanism.
          // For now, keeping the placeholder as in the original code.
          password: userData.password || 'defaultPassword123', // Ensure password is provided or has a default
        }),
      });

      if (response.ok) {
        const newUser: User = await response.json(); // Expect the created User object
        setAgents(prev => [...prev, newUser]); // Add the new User to the agents list
        return newUser;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create agent');
      }
    } catch (err) {
      console.error('Error creating agent:', err);
      throw err;
    }
  };

  // Add an update agent function
  const updateAgent = async (id: string, updateData: Partial<User>): Promise<User> => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser: User = await response.json();
        setAgents(prev => prev.map(agent => (agent.id === updatedUser.id ? updatedUser : agent)));
        return updatedUser;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update agent');
      }
    } catch (err) {
      console.error(`Error updating agent ${id}:`, err);
      throw err;
    }
  };

  // Add a delete agent function (soft delete by setting isActive to false)
  const deleteAgent = async (id: string): Promise<boolean> => {
    try {
      // Assuming your API handles soft delete by setting isActive to false
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT', // Using PUT for soft delete to update a field
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ isActive: false }), // Soft delete
      });

      if (response.ok) {
        // Optimistically update the UI: filter out the deactivated agent
        setAgents(prev => prev.filter(agent => agent.id !== id));
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete agent');
      }
    } catch (err) {
      console.error(`Error deleting agent ${id}:`, err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []); // Empty dependency array means this runs once on mount

  return {
    agents,
    loading,
    error,
    fetchAgents,
    createAgent,
    updateAgent, // Expose updateAgent
    deleteAgent, // Expose deleteAgent
  };
}
