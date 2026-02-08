// hooks/useLeads.ts
"use client"

import { useState, useCallback } from "react"
import type { Lead, Activity } from "@/types/lead"

// Helper function to convert date strings to Date objects for a single Lead
const parseLeadDates = (lead: any): Lead => {
  return {
    ...lead,
    createdAt: new Date(lead.createdAt),
    updatedAt: new Date(lead.updatedAt),
    lastContacted: lead.lastContacted ? new Date(lead.lastContacted) : undefined,
    dateAssignedToSales: lead.dateAssignedToSales ? new Date(lead.dateAssignedToSales) : undefined,
    receivedDate: lead.receivedDate ? new Date(lead.receivedDate) : undefined,
    assignedDate: lead.assignedDate ? new Date(lead.assignedDate) : undefined,
    activities: lead.activities.map((activity: any) => ({
      ...activity,
      date: new Date(activity.date), // Convert activity date
    })),
  }
}

// Update parseAllLeads to handle missing budget values
const parseAllLeads = (lead: any): Lead => {
  return {
    ...lead,
    budget: lead.budget !== undefined && lead.budget !== null ? lead.budget : "Not Specified", // Default to 'Not Specified' only if budget is null or undefined
    createdAt: new Date(lead.createdAt),
    updatedAt: new Date(lead.updatedAt),
    lastContacted: lead.lastContacted ? new Date(lead.lastContacted) : undefined,
    dateAssignedToSales: lead.dateAssignedToSales ? new Date(lead.dateAssignedToSales) : undefined,
    receivedDate: lead.receivedDate ? new Date(lead.receivedDate) : undefined,
    assignedDate: lead.assignedDate ? new Date(lead.assignedDate) : undefined,
    activities: lead.activities.map((activity: any) => ({
      ...activity,
      date: new Date(activity.date), // Convert activity date
    })),
  }
}

// Define the shape of data required for adding a new lead
export type NewLeadData = Omit<
  Lead,
  "id" | "createdAt" | "updatedAt" | "activities" | "lastContacted" | "attachments"
> & {
  activities?: (Omit<Activity, "id"> & { date: Date | string })[]
  attachments?: string[]
  createdAt?: Date | string
  updatedAt?: Date | string
  lastContacted?: Date | string
  receivedDate?: Date | string
}

// Define the shape of data required for updating an existing lead
export type UpdateLeadData = Partial<Omit<Lead, "createdAt" | "updatedAt">> & {
  createdAt?: Date | string
  updatedAt?: Date | string
  lastContacted?: Date | string
  activities?: (Activity | (Omit<Activity, "id"> & { date: Date | string }))[]
}

// Extend the hook return type to include the typed fetch function
interface UseLeadsReturn {
  leads: Lead[]
  loading: boolean
  error: string | null
  fetchLeads: (leadType?: "Lead" | "Cold-Lead") => Promise<void>
  createLead: (leadData: NewLeadData) => Promise<Lead>
  updateLead: (id: string, updateData: UpdateLeadData) => Promise<Lead>
  deleteLead: (id: string) => Promise<void>
  addActivity: (leadId: string, activityData: Omit<Activity, "id"> & { date: Date | string }) => Promise<Lead>
  getLeadById: (id: string) => Promise<Lead | null>
}

export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper to get authorization headers
  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }, [])

  // Debugging: Log raw and parsed data to verify budget field
  const fetchLeads = useCallback(
    async (leadType?: "Lead" | "Cold-Lead") => {
      try {
        setLoading(true)
        setError(null)

        const url = leadType ? `/api/leads?leadType=${leadType}` : "/api/leads"
        console.log("Fetching leads from:", url)

        const response = await fetch(url, {
          method: "GET",
          headers: getAuthHeaders(),
        })

        console.log("Response status:", response.status)
        if (response.ok) {
          const data = await response.json()
          console.log("Fetched leads data (raw):", data)
          const parsedLeads = Array.isArray(data) ? data.map(leadType === "Lead" ? parseAllLeads : parseLeadDates) : []
          console.log("Parsed leads data:", parsedLeads)
          setLeads(parsedLeads)
        } else {
          const errorData = await response.json().catch(() => ({ message: "Failed to fetch leads" }))
          console.error("Fetch error:", errorData)
          throw new Error(errorData.message || "Failed to fetch leads")
        }
      } catch (err) {
        console.error("Error fetching leads:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch leads")
        setLeads([])
      } finally {
        setLoading(false)
      }
    },
    [getAuthHeaders],
  )

  const getLeadById = useCallback(
    async (id: string): Promise<Lead | null> => {
      try {
        const response = await fetch(`/api/leads/${id}`, {
          method: "GET",
          headers: getAuthHeaders(),
        })

        if (response.ok) {
          const lead = await response.json()
          return parseLeadDates(lead)
        } else if (response.status === 404) {
          return null
        } else {
          const errorData = await response.json().catch(() => ({ message: "Failed to fetch lead by ID" }))
          console.error(`Failed to fetch lead ${id}:`, response.status, errorData)
          throw new Error(errorData.message || "Failed to fetch lead")
        }
      } catch (err) {
        console.error(`Error fetching lead ${id}:`, err)
        throw err
      }
    },
    [getAuthHeaders],
  )

  const createLead = useCallback(
    async (leadData: NewLeadData): Promise<Lead> => {
      if (!leadData.leadType) {
        throw new Error("leadType is required to create a new lead.")
      }

      const dataToSend: { [key: string]: any } = { ...leadData }

      if (dataToSend.createdAt instanceof Date) {
        dataToSend.createdAt = dataToSend.createdAt.toISOString()
      }
      if (dataToSend.updatedAt instanceof Date) {
        dataToSend.updatedAt = dataToSend.updatedAt.toISOString()
      }
      if (dataToSend.lastContacted instanceof Date) {
        dataToSend.lastContacted = dataToSend.lastContacted.toISOString()
      }
      if (dataToSend.receivedDate instanceof Date) {
        dataToSend.receivedDate = dataToSend.receivedDate.toISOString()
      }
      if (dataToSend.assignedDate instanceof Date) {
        dataToSend.assignedDate = dataToSend.assignedDate.toISOString()
      }

      if (dataToSend.activities) {
        dataToSend.activities = dataToSend.activities.map((activity: { date: Date | string }) => ({
          ...activity,
          date: activity.date instanceof Date ? activity.date.toISOString() : activity.date,
        }))
      }

      try {
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(dataToSend),
        })

        if (response.ok) {
          const newLead = await response.json()
          const parsedNewLead = parseLeadDates(newLead)
          setLeads((prev) => [parsedNewLead, ...prev])
          return parsedNewLead
        } else {
          const errorData = await response.json().catch(() => ({ message: "Failed to create lead" }))
          console.error("Create failed:", response.status, errorData)
          throw new Error(errorData.message || "Failed to create lead")
        }
      } catch (err) {
        console.error("Error creating lead:", err)
        throw err
      }
    },
    [getAuthHeaders],
  )

  const updateLead = useCallback(
    async (id: string, updateData: UpdateLeadData): Promise<Lead> => {
      const dataToSend: { [key: string]: any } = { ...updateData }

      if (dataToSend.lastContacted instanceof Date) {
        dataToSend.lastContacted = dataToSend.lastContacted.toISOString()
      }
      if (dataToSend.createdAt instanceof Date) {
        dataToSend.createdAt = dataToSend.createdAt.toISOString()
      }
      if (dataToSend.updatedAt instanceof Date) {
        dataToSend.updatedAt = dataToSend.updatedAt.toISOString()
      }
      if (dataToSend.receivedDate instanceof Date) {
        dataToSend.receivedDate = dataToSend.receivedDate.toISOString()
      }
      if (dataToSend.assignedDate instanceof Date) {
        dataToSend.assignedDate = dataToSend.assignedDate.toISOString()
      }
      if (dataToSend.activities) {
        dataToSend.activities = dataToSend.activities.map((activity: { date: Date | string }) => ({
          ...activity,
          date: activity.date instanceof Date ? activity.date.toISOString() : activity.date,
        }))
      }

      try {
        console.log("Attempting to update lead with ID:", id, "Data being sent:", dataToSend)

        const response = await fetch(`/api/leads/${id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(dataToSend),
        })

        console.log("Update API response status:", response.status)

        if (response.ok) {
          const updatedLead = await response.json()
          const parsedUpdatedLead = parseLeadDates(updatedLead)
          setLeads((prev) => prev.map((lead) => (lead.id === id ? parsedUpdatedLead : lead)))
          console.log("Lead updated successfully, received data:", parsedUpdatedLead)
          return parsedUpdatedLead
        } else {
          let errorDetails = "Unknown error"
          try {
            const errorData = await response.json()
            errorDetails = errorData.message || JSON.stringify(errorData)
          } catch (jsonError) {
            errorDetails = `Server responded with status ${response.status}, but body was not valid JSON. Response text: ${await response.text()}`
            console.error("Failed to parse error response JSON:", jsonError)
          }

          console.error("Update failed. Status:", response.status, "Details:", errorDetails)
          throw new Error(`Failed to update lead: ${errorDetails}`)
        }
      } catch (err) {
        console.error("Error caught in updateLead hook:", err)
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during lead update."
        throw new Error(errorMessage)
      }
    },
    [getAuthHeaders],
  )

  const deleteLead = useCallback(
    async (id: string): Promise<void> => {
      try {
        const response = await fetch(`/api/leads/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        })

        if (response.ok) {
          setLeads((prev) => prev.filter((lead) => lead.id !== id))
        } else {
          const errorData = await response.json().catch(() => ({ message: "Failed to delete lead" }))
          console.error("Delete failed:", response.status, errorData)
          throw new Error(errorData.message || "Failed to delete lead")
        }
      } catch (err) {
        console.error("Error deleting lead:", err)
        throw err
      }
    },
    [getAuthHeaders],
  )

  const addActivity = useCallback(
    async (leadId: string, activityData: Omit<Activity, "id"> & { date: Date | string }): Promise<Lead> => {
      // Prepare dataToSend for an activity, ensuring 'date' is a Date object as required by Activity interface.
      const dataToSend: Omit<Activity, "id"> = {
        ...activityData,
        date: activityData.date instanceof Date ? activityData.date : new Date(activityData.date),
      }

      try {
        const response = await fetch(`/api/leads/${leadId}/activities`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(dataToSend),
        })

        if (response.ok) {
          const updatedLead = await response.json()
          const parsedUpdatedLead = parseLeadDates(updatedLead)
          setLeads((prev) => prev.map((lead) => (lead.id === leadId ? parsedUpdatedLead : lead)))
          return parsedUpdatedLead
        } else {
          const errorData = await response.json().catch(() => ({ message: "Failed to add activity" }))
          console.error("Add activity failed:", response.status, errorData)
          throw new Error(errorData.message || "Failed to add activity")
        }
      } catch (err) {
        console.error("Error adding activity:", err)
        throw err
      }
    },
    [getAuthHeaders],
  )

  return {
    leads,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    addActivity,
    getLeadById,
  }
}
