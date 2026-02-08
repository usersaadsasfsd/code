// components/leads/LeadProfile.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CommunicationPanel } from "@/components/communication/CommunicationPanel"
import type { Lead, Activity } from "@/types/lead"
import type { CommunicationActivity } from "@/types/communication"
import { useAuth } from "@/hooks/useAuth"
import { PermissionService } from "@/lib/permissions"
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  User,
  Building,
  FileText,
  Clock,
  CheckCircle2,
  MessageCircle,
  CalendarCheck,
} from "lucide-react"
import { toast } from "sonner"

interface LeadProfileProps {
  lead: Lead
  onBack: () => void
  onUpdateLead: (lead: Lead) => Promise<void>
  onLeadRefresh: () => Promise<void>
}

export function LeadProfile({ lead, onBack, onUpdateLead, onLeadRefresh }: LeadProfileProps) {
  type StatusType =
    | "New"
    | "Contacted"
    | "Qualified"
    | "Nurturing"
    | "Site Visit Scheduled"
    | "Site Visited"
    | "Negotiation"
    | "Converted"
    | "Lost"
    | "Hold"
  type ScoreType = "High" | "Medium" | "Low"

  const { user } = useAuth()
  const permissionService = PermissionService.getInstance()
  const [agents, setAgents] = useState<any[]>([])
  const [loadingAgents, setLoadingAgents] = useState(false)

  const [newNote, setNewNote] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<StatusType>(lead.status as StatusType)
  const [selectedScore, setSelectedScore] = useState<ScoreType>(lead.leadScore as ScoreType)
  const [selectedAgent, setSelectedAgent] = useState(lead.assignedAgent || "unassigned")
  const [communicationActivities, setCommunicationActivities] = useState<CommunicationActivity[]>([])
  const [isEditMode, setIsEditMode] = useState(false)

  const [editFields, setEditFields] = useState({
    name: lead.name,
    primaryPhone: lead.primaryPhone,
    secondaryPhone: lead.secondaryPhone || "",
    primaryEmail: lead.primaryEmail,
    secondaryEmail: lead.secondaryEmail || "",
    propertyType: lead.propertyType,
    budgetRange: lead.budgetRange,
    budget: lead.budget ?? "",
    preferredLocations: (lead.preferredLocations || []).join(", "),
    source: lead.source,
    notes: lead.notes || "",
    createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString().slice(0, 16) : "",
    receivedDate: lead.receivedDate ? new Date(lead.receivedDate).toISOString().slice(0, 16) : "",
    assignedDate: lead.assignedDate ? new Date(lead.assignedDate).toISOString().slice(0, 16) : "",
  })

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true)
        const response = await fetch("/api/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        })

        if (response.ok) {
          const users = await response.json()
          const agentUsers = users.filter((u: any) => u.role === "agent" && u.isActive)
          setAgents(agentUsers)
        } else {
          console.error("Failed to fetch agents")
          toast.error("Failed to fetch agents.")
          setAgents([])
        }
      } catch (error) {
        console.error("Error fetching agents:", error)
        toast.error("Error fetching agents.")
        setAgents([])
      } finally {
        setLoadingAgents(false)
      }
    }
    fetchAgents()
  }, [])

  const assignedAgent = agents.find((agent) => agent.id === lead.assignedAgent)

  const canEditLead = permissionService.canEditLead(user, lead.assignedAgent, lead.createdBy)
  const canAssignLeads = permissionService.canAssignLeads(user)
  const isAdmin = user?.role === "admin"

  const getStatusColor = (status: string) => {
    const colors = {
      New: "bg-blue-100 text-blue-800 border-blue-200",
      Contacted: "bg-purple-100 text-purple-800 border-purple-200",
      Qualified: "bg-green-100 text-green-800 border-green-200",
      Nurturing: "bg-amber-100 text-amber-800 border-amber-200",
      RNR: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Busy: "bg-rose-100 text-rose-800 border-rose-200",
      Disconnected: "bg-gray-200 text-gray-700 border-gray-300",
      "Switch Off": "bg-gray-200 text-gray-700 border-gray-300",
      "Invalid Number": "bg-gray-200 text-gray-700 border-gray-300",
      "Incoming Call Not Allowed (ICNA)": "bg-gray-200 text-gray-700 border-gray-300",
      "DNE (Does Not Exist)": "bg-gray-200 text-gray-700 border-gray-300",
      "Forward call": "bg-gray-200 text-gray-700 border-gray-300",
      "Out Of Network": "bg-gray-200 text-gray-700 border-gray-300",
      "Not Interested": "bg-red-100 text-red-800 border-red-200",
      "Not Interested (project)": "bg-red-200 text-red-900 border-red-300",
      "Low Potential": "bg-orange-100 text-orange-800 border-orange-200",
      "Site Visit Scheduled": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Site Visited": "bg-teal-100 text-teal-800 border-teal-200",
      Negotiation: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
      Converted: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Lost: "bg-stone-100 text-stone-800 border-stone-200",
      Hold: "bg-neutral-100 text-neutral-800 border-neutral-200",
    }
    return colors[status as keyof typeof colors] || colors["New"]
  }

  const getLeadTypeColor = (type: "Lead" | "Cold-Lead") => {
    switch (type) {
      case "Lead":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Cold-Lead":
        return "bg-gray-100 text-gray-700 border-gray-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const handleSaveChanges = useCallback(async () => {
    if (!canEditLead) {
      toast.error("You do not have permission to edit this lead")
      return
    }

    const mergedLead: any = {
      ...lead,
      name: editFields.name,
      primaryPhone: editFields.primaryPhone,
      secondaryPhone: editFields.secondaryPhone || undefined,
      primaryEmail: editFields.primaryEmail,
      secondaryEmail: editFields.secondaryEmail || undefined,
      propertyType: editFields.propertyType as Lead["propertyType"],
      budgetRange: editFields.budgetRange,
      budget:
        editFields.budget === "" ? undefined : isNaN(Number(editFields.budget)) ? undefined : Number(editFields.budget),
      preferredLocations: editFields.preferredLocations
        ? editFields.preferredLocations
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      source: editFields.source as Lead["source"],
      notes: editFields.notes,
      status: selectedStatus as Lead["status"],
      leadScore: selectedScore as Lead["leadScore"],
      assignedAgent: selectedAgent === "unassigned" ? undefined : selectedAgent,
      updatedAt: new Date(),
    }

    if (isAdmin && editFields.createdAt) {
      try {
        mergedLead.createdAt = new Date(editFields.createdAt)
      } catch (e) {
        // ignore invalid date
      }
    }

    if (editFields.receivedDate) {
      try {
        mergedLead.receivedDate = new Date(editFields.receivedDate)
      } catch (e) {
        // ignore invalid date
      }
    }

    if (isAdmin && editFields.assignedDate) {
      try {
        mergedLead.assignedDate = new Date(editFields.assignedDate)
      } catch (e) {
        // ignore invalid date
      }
    }

    await onUpdateLead(mergedLead)
    toast.success("Lead changes saved!")
    setIsEditMode(false)
    await onLeadRefresh()
  }, [
    lead,
    selectedStatus,
    selectedScore,
    selectedAgent,
    canEditLead,
    onUpdateLead,
    onLeadRefresh,
    editFields,
    isAdmin,
  ])

  const handleAddNote = useCallback(async () => {
    if (!newNote.trim() || !canEditLead) {
      if (!newNote.trim()) {
        toast.info("Note cannot be empty.")
      } else {
        toast.error("You do not have permission to add notes to this lead")
      }
      return
    }

    const newActivity: Activity = {
      id: `${lead.id}-note-${Date.now()}`,
      type: "Note",
      description: newNote,
      date: new Date(),
      agent: user?.name || "Current User",
    }

    const updatedLeadWithNote = {
      ...lead,
      activities: [newActivity, ...(lead.activities || [])],
      updatedAt: new Date(),
    }

    await onUpdateLead(updatedLeadWithNote)
    setNewNote("")
    toast.success("Note added successfully!")
    await onLeadRefresh()
  }, [newNote, canEditLead, lead, user, onUpdateLead, onLeadRefresh])

  const handleCommunicationActivity = useCallback(
    async (activity: CommunicationActivity) => {
      setCommunicationActivities((prev) => [activity, ...prev])

      let mappedType: Activity["type"]
      switch (activity.type) {
        case "call":
          mappedType = "Call"
          break
        case "email":
          mappedType = "Email"
          break
        case "calendar":
          mappedType = "Meeting"
          break
        default:
          mappedType = "Note"
      }

      const leadActivity: Activity = {
        id: activity.id,
        type: mappedType,
        description: activity.content || "",
        date: activity.timestamp,
        agent: activity.agent,
      }

      const updatedLeadWithComms = {
        ...lead,
        activities: [leadActivity, ...(lead.activities || [])],
        updatedAt: new Date(),
      }

      await onUpdateLead(updatedLeadWithComms)
      toast.success("Communication activity logged!")
      await onLeadRefresh()
    },
    [lead, onUpdateLead, onLeadRefresh],
  )

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const formatCurrency = (amount: string) => {
    if (amount.includes("$")) {
      return amount.replace(/\$/g, "₹").replace(/,/g, ",")
    }
    return amount
  }

  const getActivityIcon = (type: string) => {
    const icons = {
      Call: Phone,
      Email: Mail,
      Meeting: Calendar,
      Note: FileText,
      "Status Change": CheckCircle2,
      "Property Shown": Building,
      whatsapp: MessageCircle,
      calendar: Calendar,
    }
    const Icon = icons[type as keyof typeof icons] || FileText
    return <Icon className="h-4 w-4" />
  }

  const allActivities = [
    ...(communicationActivities || []).map((ca) => {
      let mappedDisplayType: Activity["type"]
      switch (ca.type) {
        case "call":
          mappedDisplayType = "Call"
          break
        case "email":
          mappedDisplayType = "Email"
          break
        case "calendar":
          mappedDisplayType = "Meeting"
          break
        default:
          mappedDisplayType = "Note"
      }
      return {
        id: ca.id,
        type: mappedDisplayType,
        description: ca.content || "",
        date: ca.timestamp,
        agent: ca.agent,
      }
    }),
    ...(lead.activities || []).map((la) => ({
      id: la.id,
      type: la.type,
      description: la.description,
      date: la.date,
      agent: la.agent,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id && t.type === v.type) === i)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Leads</span>
        </Button>
        <div className="flex items-center space-x-2">
          {canEditLead && (
            <Button variant={isEditMode ? "outline" : "secondary"} onClick={() => setIsEditMode((prev) => !prev)}>
              {isEditMode ? "Cancel Edit" : "Edit Details"}
            </Button>
          )}

          {canEditLead && isEditMode && (
            <Button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-medium">
                  {lead.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                {isEditMode ? (
                  <div>
                    <input
                      className="text-2xl font-bold text-gray-900 bg-transparent border-b border-gray-200 pb-1"
                      value={editFields.name}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <div className="text-sm text-gray-500 mt-1">Lead ID: {lead.id}</div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-2xl font-bold text-gray-900">{lead.name}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Lead ID: {lead.id} • Created {formatDate(lead.createdAt)}
                    </CardDescription>
                  </>
                )}

                {isEditMode && isAdmin && (
                  <div className="mt-2">
                    <label className="text-sm font-medium text-gray-500">Created At</label>
                    <input
                      type="datetime-local"
                      className="block mt-1 w-full border rounded px-2 py-1"
                      value={editFields.createdAt}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, createdAt: e.target.value }))}
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2 mt-3">
                  <Badge className={`${getStatusColor(lead.status)} font-medium`}>{lead.status}</Badge>
                  <Badge
                    variant="outline"
                    className={`
                    ${
                      lead.leadScore === "High"
                        ? "text-red-600 bg-red-50"
                        : lead.leadScore === "Medium"
                          ? "text-amber-600 bg-amber-50"
                          : "text-green-600 bg-green-50"
                    } font-medium
                  `}
                  >
                    {lead.leadScore} Priority
                  </Badge>
                  <Badge variant="outline" className="font-medium">
                    {lead.propertyType}
                  </Badge>
                  {lead.leadType && (
                    <Badge variant="outline" className={`${getLeadTypeColor(lead.leadType)} font-medium`}>
                      {lead.leadType.replace("-", " ")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Primary Phone</div>
                  {isEditMode ? (
                    <Input
                      value={editFields.primaryPhone}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, primaryPhone: e.target.value }))}
                    />
                  ) : (
                    <div className="text-base font-medium">{lead.primaryPhone}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Secondary Phone</div>
                  {isEditMode ? (
                    <Input
                      value={editFields.secondaryPhone}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, secondaryPhone: e.target.value }))}
                    />
                  ) : (
                    <div className="text-base font-medium">{lead.secondaryPhone || "N/A"}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Primary Email</div>
                  {isEditMode ? (
                    <Input
                      value={editFields.primaryEmail}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, primaryEmail: e.target.value }))}
                    />
                  ) : (
                    <div className="text-base font-medium">{lead.primaryEmail}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Secondary Email</div>
                  {isEditMode ? (
                    <Input
                      value={editFields.secondaryEmail}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, secondaryEmail: e.target.value }))}
                    />
                  ) : (
                    <div className="text-base font-medium">{lead.secondaryEmail || "N/A"}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Important Dates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Received Date</div>
                  {isEditMode ? (
                    <Input
                      type="datetime-local"
                      value={editFields.receivedDate}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, receivedDate: e.target.value }))}
                    />
                  ) : (
                    <div className="text-base font-medium flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{lead.receivedDate ? formatDate(lead.receivedDate) : "N/A"}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">When the lead was first received</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Assigned Date</div>
                  {isEditMode && isAdmin ? (
                    <div>
                      <Input
                        type="datetime-local"
                        value={editFields.assignedDate}
                        onChange={(e) => setEditFields((prev) => ({ ...prev, assignedDate: e.target.value }))}
                      />
                      <p className="text-xs text-amber-600 mt-1">Admin only: Can edit assigned date</p>
                    </div>
                  ) : (
                    <div className="text-base font-medium flex items-center space-x-2">
                      <CalendarCheck className="h-4 w-4 text-gray-400" />
                      <span>{lead.assignedDate ? formatDate(lead.assignedDate) : "Not assigned"}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">When the lead was assigned to an agent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span>Property Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Property Type</div>
                  {isEditMode ? (
                    <Select
                      value={editFields.propertyType}
                      onValueChange={(value) =>
                        setEditFields((prev) => ({
                          ...prev,
                          propertyType: value as "Residential" | "Commercial" | "Land",
                        }))
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
                  ) : (
                    <div className="text-base font-medium">{lead.propertyType}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Budget Range</div>
                  {isEditMode ? (
                    <Input
                      value={editFields.budgetRange}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, budgetRange: e.target.value }))}
                    />
                  ) : (
                    <div className="text-base font-medium flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>{formatCurrency(lead.budgetRange)}</span>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-gray-500">Preferred Locations</div>
                  {isEditMode ? (
                    <Input
                      value={editFields.preferredLocations}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, preferredLocations: e.target.value }))}
                      placeholder="Comma-separated locations"
                    />
                  ) : (
                    <div className="text-base font-medium flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {lead.preferredLocations && lead.preferredLocations.length > 0
                          ? lead.preferredLocations.join(", ")
                          : "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status, Score, and Agent Assignment */}
          {canEditLead && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Lead Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Status</div>
                    <Select
                      value={selectedStatus}
                      onValueChange={(value) => setSelectedStatus(value as StatusType)}
                      disabled={!isEditMode}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Nurturing">Nurturing</SelectItem>
                        <SelectItem value="Site Visit Scheduled">Site Visit Scheduled</SelectItem>
                        <SelectItem value="Site Visited">Site Visited</SelectItem>
                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                        <SelectItem value="Converted">Converted</SelectItem>
                        <SelectItem value="Lost">Lost</SelectItem>
                        <SelectItem value="Hold">Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Lead Score</div>
                    <Select
                      value={selectedScore}
                      onValueChange={(value) => setSelectedScore(value as ScoreType)}
                      disabled={!isEditMode}
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
                  {canAssignLeads && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">Assigned Agent</div>
                      <Select
                        value={selectedAgent}
                        onValueChange={(value) => setSelectedAgent(value)}
                        disabled={!isEditMode}
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
                            agents.map((agent) => (
                              <SelectItem key={agent.id} value={agent.id}>
                                {agent.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity and Notes Tabs */}
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-4">
                  <div className="space-y-4">
                    {allActivities.length > 0 ? (
                      allActivities.map((activity, index) => (
                        <div
                          key={`${activity.id}-${index}`}
                          className="flex items-start space-x-3 pb-4 border-b last:border-b-0"
                        >
                          <div className="p-2 bg-gray-100 rounded-full">{getActivityIcon(activity.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{activity.type}</span>
                              <span className="text-xs text-gray-500">{formatDate(activity.date)}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            <span className="text-xs text-gray-400">by {activity.agent}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No activities recorded yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                  <div className="space-y-4">
                    {canEditLead && (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Add a new note..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={3}
                        />
                        <Button onClick={handleAddNote} size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Add Note
                        </Button>
                      </div>
                    )}

                    <div className="space-y-3 mt-4">
                      {isEditMode ? (
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-2">Lead Notes</div>
                          <Textarea
                            value={editFields.notes}
                            onChange={(e) => setEditFields((prev) => ({ ...prev, notes: e.target.value }))}
                            rows={4}
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{lead.notes || "No notes added yet."}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Communication Panel */}
        <div className="lg:col-span-1">
          <CommunicationPanel lead={lead} />
        </div>
      </div>
    </div>
  )
}
