// components/leads/AddLeadModal.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { Lead } from "@/types/lead"
import { useAuth } from "@/hooks/useAuth"
import { PermissionService } from "@/lib/permissions"
import { budgetRanges, locations } from "@/lib/mockData"
import type { NewLeadData } from "@/hooks/useLeads"
import { toast } from "sonner"

import * as React from "react"
import { Check, ChevronsUpDown, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface AddLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddLead: (lead: NewLeadData) => Promise<Lead>
  existingLeads: Lead[]
}

export function AddLeadModal({ open, onOpenChange, onAddLead, existingLeads }: AddLeadModalProps) {
  const { user } = useAuth()
  const permissionService = PermissionService.getInstance()
  const [agents, setAgents] = useState<any[]>([])
  const [loadingAgents, setLoadingAgents] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  const [locationSelectOpen, setLocationSelectOpen] = React.useState(false)
  const [locationSearchValue, setLocationSearchValue] = React.useState("")

  const initialFormData = {
    name: "",
    primaryPhone: "",
    secondaryPhone: "",
    primaryEmail: "",
    secondaryEmail: "",
    propertyType: "Residential" as Lead["propertyType"],
    budgetRange: "",
    preferredLocations: [] as string[],
    source: "Website" as Lead["source"],
    status: "New" as Lead["status"],
    assignedAgent: "",
    notes: "",
    leadScore: "Medium" as Lead["leadScore"],
    attachments: [] as string[],
    activities: [],
    leadType: "Lead" as Lead["leadType"],
    receivedDate: new Date().toISOString().slice(0, 16), // Default to current date/time
  }

  const [formData, setFormData] = useState<NewLeadData & { receivedDate: string }>(initialFormData)

  useEffect(() => {
    if (open) {
      fetchAgents()
      setFormData({
        ...initialFormData,
        receivedDate: new Date().toISOString().slice(0, 16), // Reset to current date when modal opens
        createdBy: user?.id || "system",
        assignedAgent: user?.role === "agent" && !permissionService.canAssignLeads(user) ? user.id : "",
      })
      setModalError(null)
      setLocationSelectOpen(false)
      setLocationSearchValue("")
    }
  }, [open, user, permissionService])

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true)
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const response = await fetch("/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        const users = await response.json()
        const agentUsers = users.filter((u: any) => u.role === "agent" && u.isActive)
        setAgents(agentUsers)
      } else {
        console.error("Failed to fetch agents:", response.status, await response.json().catch(() => ""))
        setAgents([])
      }
    } catch (error) {
      console.error("Error fetching agents:", error)
      setAgents([])
    } finally {
      setLoadingAgents(false)
    }
  }

  const availableAgents = permissionService.filterAgentsForUser(agents, user)

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "")

    if (digits.startsWith("91")) {
      return `+${digits}`
    }
    if (digits.length === 10) {
      return `+91${digits}`
    }
    if (digits.length > 0 && digits.length < 10) {
      return `+91${digits}`
    }
    return digits.length > 0 ? `+${digits}` : ""
  }

  const handlePhoneChange = (field: "primaryPhone" | "secondaryPhone", value: string) => {
    setModalError(null)
    setFormData((prev) => ({ ...prev, [field]: formatPhoneNumber(value) }))
  }

  const handlePreferredLocationSelect = (selectedLocation: string) => {
    setFormData((prev) => {
      const currentLocations = prev.preferredLocations || []
      if (currentLocations.includes(selectedLocation)) {
        return {
          ...prev,
          preferredLocations: currentLocations.filter((loc) => loc !== selectedLocation),
        }
      } else {
        return {
          ...prev,
          preferredLocations: [...currentLocations, selectedLocation],
        }
      }
    })
    setLocationSearchValue("")
  }

  const removeLocationBadge = (locationToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredLocations: prev.preferredLocations.filter((loc) => loc !== locationToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (!formData.name || !formData.primaryPhone || !formData.primaryEmail) {
      const msg = "Please fill in all required fields: Full Name, Primary Phone, Primary Email."
      setModalError(msg)
      toast.error(msg)
      return
    }

    const existingLeadWithPhone = existingLeads.find((lead) => lead.primaryPhone === formData.primaryPhone)

    if (existingLeadWithPhone) {
      const msg = `A lead with the primary phone number "${formData.primaryPhone}" is already registered under "${existingLeadWithPhone.name}".`
      setModalError(msg)
      toast.error(msg)
      return
    }

    setIsSubmitting(true)
    try {
      let finalAssignedAgent = formData.assignedAgent

      if (user?.role === "agent" && !canAssignLeads) {
        finalAssignedAgent = user.id
      } else if (formData.assignedAgent === "unassigned" || formData.assignedAgent === "") {
        finalAssignedAgent = ""
      }

      const leadToSubmit: NewLeadData = {
        ...formData,
        assignedAgent: finalAssignedAgent,
        createdBy: user?.id || "system",
        receivedDate: formData.receivedDate ? new Date(formData.receivedDate) : new Date(),
      }

      await onAddLead(leadToSubmit)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add lead:", error)
      const msg = `Failed to add lead: ${(error as Error).message || "Unknown error"}. Please try again.`
      setModalError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canAssignLeads = permissionService.canAssignLeads(user)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>Create a new lead record with all the essential information.</DialogDescription>
        </DialogHeader>

        {modalError && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
            <p className="font-semibold">Error:</p>
            <p>{modalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="primaryPhone">Primary Phone *</Label>
                <Input
                  id="primaryPhone"
                  type="tel"
                  value={formData.primaryPhone}
                  onChange={(e) => handlePhoneChange("primaryPhone", e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  required
                  className={modalError && modalError.includes("phone number already exists") ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">Format: +91XXXXXXXXXX</p>
              </div>

              <div>
                <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                <Input
                  id="secondaryPhone"
                  type="tel"
                  value={formData.secondaryPhone}
                  onChange={(e) => handlePhoneChange("secondaryPhone", e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="primaryEmail">Primary Email *</Label>
                <Input
                  id="primaryEmail"
                  type="email"
                  value={formData.primaryEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, primaryEmail: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="secondaryEmail">Secondary Email</Label>
                <Input
                  id="secondaryEmail"
                  type="email"
                  value={formData.secondaryEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, secondaryEmail: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="receivedDate">Received Date *</Label>
                <Input
                  id="receivedDate"
                  type="datetime-local"
                  value={formData.receivedDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, receivedDate: e.target.value }))}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">The date when this lead was received</p>
              </div>
            </div>

            {/* Property & Assignment Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, propertyType: value as Lead["propertyType"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budgetRange">Budget Range (INR)</Label>
                <Select
                  value={formData.budgetRange}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, budgetRange: value === "none" ? "" : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select budget range</SelectItem>
                    {budgetRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="source">Lead Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, source: value as Lead["source"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Advertisement">Advertisement</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lead Type Selection */}
              <div>
                <Label htmlFor="leadType">Lead Type *</Label>
                <Select
                  value={formData.leadType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, leadType: value as Lead["leadType"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Cold-Lead">Cold Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Agent assignment - different behavior for admins vs agents */}
              {canAssignLeads && (
                <div>
                  <Label htmlFor="assignedAgent">Assigned Agent</Label>
                  <Select
                    value={formData.assignedAgent || "unassigned"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, assignedAgent: value === "unassigned" ? "" : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {loadingAgents ? (
                        <SelectItem value="loading" disabled>
                          Loading agents...
                        </SelectItem>
                      ) : (
                        availableAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {loadingAgents ? "Loading..." : `${availableAgents.length} agent(s) available from database`}
                  </p>
                </div>
              )}

              {/* For agents, show info that lead will be auto-assigned to them */}
              {user?.role === "agent" && !canAssignLeads && (
                <div>
                  <Label>Assignment</Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">This lead will be automatically assigned to you.</p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="leadScore">Lead Priority</Label>
                <Select
                  value={formData.leadScore}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, leadScore: value as Lead["leadScore"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High Priority</SelectItem>
                    <SelectItem value="Medium">Medium Priority</SelectItem>
                    <SelectItem value="Low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preferred Locations - NOW THE MULTI-SELECT SEARCHABLE COMBOBOX */}
          <div>
            <Label htmlFor="preferred-locations-search" className="text-sm font-medium">
              Preferred Locations
            </Label>
            <Popover open={locationSelectOpen} onOpenChange={setLocationSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={locationSelectOpen}
                  className="w-full justify-between mt-2 h-auto min-h-10 px-3 py-2 bg-transparent"
                >
                  <div className="flex flex-wrap gap-1 items-center">
                    {formData.preferredLocations.length > 0 ? (
                      formData.preferredLocations.map((location) => (
                        <Badge key={location} className="flex items-center gap-1 pr-1">
                          {location}
                          <XCircle
                            className="h-3 w-3 cursor-pointer text-gray-500 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeLocationBadge(location)
                            }}
                          />
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">Select locations...</span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search locations..."
                    value={locationSearchValue}
                    onValueChange={setLocationSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>No location found.</CommandEmpty>
                    <CommandGroup>
                      {locations
                        .filter((location) => location.toLowerCase().includes(locationSearchValue.toLowerCase()))
                        .map((location) => (
                          <CommandItem
                            key={location}
                            value={location}
                            onSelect={() => handlePreferredLocationSelect(location)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.preferredLocations.includes(location) ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {location}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this lead..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? "Adding Lead..." : "Add Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
