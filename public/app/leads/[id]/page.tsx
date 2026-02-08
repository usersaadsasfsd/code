// app/leads/[id]/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { LeadProfile } from "@/components/leads/LeadProfile"
import { useState, useEffect } from "react"
import type { Lead } from "@/types/lead"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface LeadDetailPageProps {
  params: {
    id: string
  }
}

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
  const router = useRouter()
  const { id } = params
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLead = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leads/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch lead: ${response.statusText}`)
      }
      const data: Lead = await response.json()
      if (data.createdAt) data.createdAt = new Date(data.createdAt)
      if (data.updatedAt) data.updatedAt = new Date(data.updatedAt)
      if (data.lastContacted) data.lastContacted = new Date(data.lastContacted)
      if (data.receivedDate) data.receivedDate = new Date(data.receivedDate)
      if (data.assignedDate) data.assignedDate = new Date(data.assignedDate)
      data.activities =
        data.activities?.map((activity) => ({
          ...activity,
          date: new Date(activity.date),
        })) || []

      data.preferredLocations = Array.isArray(data.preferredLocations) ? data.preferredLocations : []

      setLead(data)
    } catch (error) {
      console.error("Error fetching lead:", error)
      toast.error("Failed to load lead details.")
      setLead(null)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLead = async (updatedLead: Lead) => {
    const oldLead = lead

    try {
      const response = await fetch(`/api/leads/${updatedLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(updatedLead),
      })
      if (!response.ok) {
        throw new Error(`Failed to update lead: ${response.statusText}`)
      }
      const data: Lead = await response.json()
      if (data.createdAt) data.createdAt = new Date(data.createdAt)
      if (data.updatedAt) data.updatedAt = new Date(data.updatedAt)
      if (data.lastContacted) data.lastContacted = new Date(data.lastContacted)
      if (data.receivedDate) data.receivedDate = new Date(data.receivedDate)
      if (data.assignedDate) data.assignedDate = new Date(data.assignedDate)
      data.activities =
        data.activities?.map((activity) => ({
          ...activity,
          date: new Date(activity.date),
        })) || []

      data.preferredLocations = Array.isArray(data.preferredLocations) ? data.preferredLocations : []

      setLead(data)
      toast.success("Lead updated successfully!")

      if (oldLead) {
        const changes: string[] = []

        if (oldLead.name !== data.name) changes.push(`Name from "${oldLead.name}" to "${data.name}"`)
        if (oldLead.primaryPhone !== data.primaryPhone)
          changes.push(`Primary Phone from "${oldLead.primaryPhone}" to "${data.primaryPhone}"`)
        if (oldLead.secondaryPhone !== data.secondaryPhone)
          changes.push(`Secondary Phone from "${oldLead.secondaryPhone || "N/A"}" to "${data.secondaryPhone || "N/A"}"`)
        if (oldLead.primaryEmail !== data.primaryEmail)
          changes.push(`Primary Email from "${oldLead.primaryEmail}" to "${data.primaryEmail}"`)
        if (oldLead.secondaryEmail !== data.secondaryEmail)
          changes.push(`Secondary Email from "${oldLead.secondaryEmail || "N/A"}" to "${data.secondaryEmail || "N/A"}"`)
        if (oldLead.propertyType !== data.propertyType)
          changes.push(`Property Type from "${oldLead.propertyType}" to "${data.propertyType}"`)
        if (oldLead.budgetRange !== data.budgetRange)
          changes.push(`Budget Range from "${oldLead.budgetRange}" to "${data.budgetRange}"`)

        const oldPreferredLocations = Array.isArray(oldLead.preferredLocations) ? oldLead.preferredLocations.sort() : []
        const newPreferredLocations = Array.isArray(data.preferredLocations) ? data.preferredLocations.sort() : []

        if (JSON.stringify(oldPreferredLocations) !== JSON.stringify(newPreferredLocations)) {
          changes.push(
            `Preferred Locations from "[${oldPreferredLocations.join(", ")}]" to "[${newPreferredLocations.join(", ")}]"`,
          )
        }

        if (oldLead.source !== data.source) changes.push(`Source from "${oldLead.source}" to "${data.source}"`)
        if (oldLead.status !== data.status) changes.push(`Status from "${oldLead.status}" to "${data.status}"`)
        if (oldLead.assignedAgent !== data.assignedAgent)
          changes.push(
            `Assigned Agent from "${oldLead.assignedAgent || "Unassigned"}" to "${data.assignedAgent || "Unassigned"}"`,
          )
        if (oldLead.notes !== data.notes) changes.push(`Notes updated`)
        if (oldLead.leadScore !== data.leadScore)
          changes.push(`Lead Score from "${oldLead.leadScore}" to "${data.leadScore}"`)
        if (oldLead.leadType !== data.leadType)
          changes.push(`Lead Type from "${oldLead.leadType}" to "${data.leadType}"`)

        let activityMessage = "Lead updated."
        if (changes.length > 0) {
          activityMessage = `Lead details updated: ${changes.join("; ")}.`
        }

        const activity = {
          type: "Status Change",
          description: activityMessage,
          date: new Date().toISOString(),
          agent: "System",
        }

        try {
          const activityResponse = await fetch(`/api/leads/${updatedLead.id}/activities`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify(activity),
          })

          if (!activityResponse.ok) {
            console.error("Failed to log activity:", await activityResponse.text())
          } else {
            fetchLead()
          }
        } catch (activityError) {
          console.error("Error sending activity:", activityError)
        }
      }
    } catch (error) {
      console.error("Error updating lead:", error)
      toast.error("Failed to update lead.")
    }
  }

  const handleBack = () => {
    router.push("/leads")
  }

  useEffect(() => {
    if (id) {
      fetchLead()
    }
  }, [id])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-gray-500">
        <h2 className="text-2xl font-semibold mb-4">Lead Not Found</h2>
        <p className="mb-6">The lead you are looking for does not exist or you do not have access.</p>
        <Button onClick={handleBack}>Go to Leads List</Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <LeadProfile lead={lead} onBack={handleBack} onUpdateLead={handleUpdateLead} onLeadRefresh={fetchLead} />
    </div>
  )
}
