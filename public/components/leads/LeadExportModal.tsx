// components/leads/LeadExportModal.tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Lead } from "@/types/lead"
import { Download, FileText, Filter } from "lucide-react"

interface LeadExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leads: Lead[]
}

export function LeadExportModal({ open, onOpenChange, leads }: LeadExportModalProps) {
  const [selectedFields, setSelectedFields] = useState({
    name: true,
    primaryEmail: true,
    primaryPhone: true,
    propertyType: true,
    budgetRange: true,
    preferredLocations: true,
    source: true,
    status: true,
    leadType: true,
    assignedAgent: false,
    leadScore: false,
    notes: false,
    createdAt: true,
    receivedDate: true,
    assignedDate: true,
    lastContacted: false,
    lastComment: false,
    lastCommentDate: false,
    lastCommentAuthor: false,
    activities: false,
  })

  const [filters, setFilters] = useState({
    status: "all",
    propertyType: "all",
    source: "all",
    dateRange: "30d",
    leadType: "all" as "all" | "Lead" | "Cold-Lead",
  })

  const [format, setFormat] = useState<"csv" | "excel">("csv")

  const fieldLabels = {
    name: "Full Name",
    primaryEmail: "Primary Email",
    primaryPhone: "Primary Phone",
    propertyType: "Property Type",
    budgetRange: "Budget Range",
    preferredLocations: "Preferred Locations",
    source: "Lead Source",
    status: "Status",
    leadType: "Lead Type",
    assignedAgent: "Assigned Agent",
    leadScore: "Lead Score",
    notes: "Notes",
    createdAt: "Created Date",
    receivedDate: "Received Date",
    assignedDate: "Assigned Date",
    lastContacted: "Last Contacted",
    lastComment: "Last Comment",
    lastCommentDate: "Last Comment Date",
    lastCommentAuthor: "Last Comment Author",
    activities: "All Activities",
  }

  const handleFieldToggle = (field: string, checked: boolean) => {
    setSelectedFields((prev) => ({ ...prev, [field]: checked }))
  }

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedFields).every(Boolean)
    const newState = Object.keys(selectedFields).reduce(
      (acc, key) => {
        acc[key as keyof typeof selectedFields] = !allSelected
        return acc
      },
      {} as typeof selectedFields,
    )
    setSelectedFields(newState)
  }

  const filterLeads = () => {
    let filtered = [...leads]

    if (filters.status !== "all") {
      filtered = filtered.filter((lead) => lead.status === filters.status)
    }

    if (filters.propertyType !== "all") {
      filtered = filtered.filter((lead) => lead.propertyType === filters.propertyType)
    }

    if (filters.source !== "all") {
      filtered = filtered.filter((lead) => lead.source === filters.source)
    }

    if (filters.leadType !== "all") {
      filtered = filtered.filter((lead) => lead.leadType === filters.leadType)
    }

    if (filters.dateRange !== "all") {
      const now = new Date()
      const startDate = new Date()

      switch (filters.dateRange) {
        case "7d":
          startDate.setDate(now.getDate() - 7)
          break
        case "30d":
          startDate.setDate(now.getDate() - 30)
          break
        case "90d":
          startDate.setDate(now.getDate() - 90)
          break
        case "1y":
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = filtered.filter((lead) => new Date(lead.createdAt) >= startDate)
    }

    return filtered
  }

  const generateCSV = (filteredLeads: Lead[]) => {
    const selectedFieldKeys = Object.keys(selectedFields).filter(
      (key) => selectedFields[key as keyof typeof selectedFields],
    )

    const headers = selectedFieldKeys.map((key) => fieldLabels[key as keyof typeof fieldLabels])

    const rows = filteredLeads.map((lead) => {
      return selectedFieldKeys.map((key) => {
        let value = ""

        switch (key) {
          case "name":
            value = lead.name
            break
          case "primaryEmail":
            value = lead.primaryEmail
            break
          case "primaryPhone":
            value = lead.primaryPhone
            break
          case "propertyType":
            value = lead.propertyType
            break
          case "budgetRange":
            value = lead.budgetRange
            break
          case "preferredLocations":
            value = lead.preferredLocations.join(", ")
            break
          case "source":
            value = lead.source
            break
          case "status":
            value = lead.status
            break
          case "leadType":
            value = lead.leadType
            break
          case "assignedAgent":
            value = lead.assignedAgent || "Unassigned"
            break
          case "leadScore":
            value = lead.leadScore
            break
          case "notes":
            value = lead.notes || ""
            break
          case "createdAt":
            value = new Date(lead.createdAt).toLocaleDateString()
            break
          case "receivedDate":
            value = lead.receivedDate ? new Date(lead.receivedDate).toLocaleDateString() : "N/A"
            break
          case "assignedDate":
            value = lead.assignedDate ? new Date(lead.assignedDate).toLocaleDateString() : "Not Assigned"
            break
          case "lastContacted":
            value = lead.lastContacted ? new Date(lead.lastContacted).toLocaleDateString() : "Never"
            break
          case "lastComment": {
            const last =
              lead.activities && lead.activities.length > 0 ? lead.activities[lead.activities.length - 1] : null
            value = last ? `${last.description}` : ""
            break
          }
          case "lastCommentDate": {
            const last =
              lead.activities && lead.activities.length > 0 ? lead.activities[lead.activities.length - 1] : null
            value = last ? new Date(last.date).toLocaleString() : ""
            break
          }
          case "lastCommentAuthor": {
            const last =
              lead.activities && lead.activities.length > 0 ? lead.activities[lead.activities.length - 1] : null
            value = last ? last.agent || "" : ""
            break
          }
          case "activities": {
            if (lead.activities && lead.activities.length > 0) {
              value = lead.activities
                .map(
                  (act) =>
                    `${act.agent || "Unknown"} (${new Date(act.date).toLocaleString()}): ${act.description.replace(/\n/g, " ")}`,
                )
                .join(" | ")
            } else {
              value = ""
            }
            break
          }
        }

        if (value.includes(",") || value.includes('"')) {
          value = `"${value.replace(/"/g, '""')}"`
        }

        return value
      })
    })

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
    return csvContent
  }

  const handleExport = () => {
    const filteredLeads = filterLeads()

    if (filteredLeads.length === 0) {
      alert("No leads match the selected filters")
      return
    }

    const csvContent = generateCSV(filteredLeads)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `leads_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    onOpenChange(false)
  }

  const filteredCount = filterLeads().length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-green-600" />
            <span>Export Leads</span>
          </DialogTitle>
          <DialogDescription>Export your leads data with custom fields and filters</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Filters */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Filter className="h-5 w-5" />
                  <span>Export Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Property Type</Label>
                  <Select
                    value={filters.propertyType}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Lead Source</Label>
                  <Select
                    value={filters.source}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, source: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Lead Type</Label>
                  <Select
                    value={filters.leadType}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, leadType: value as "all" | "Lead" | "Cold-Lead" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Lead Types</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Cold-Lead">Cold Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date Range</Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600">
                    <strong>{filteredCount}</strong> leads will be exported
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Field Selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Export Fields</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {Object.values(selectedFields).every(Boolean) ? "Deselect All" : "Select All"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(fieldLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={selectedFields[key as keyof typeof selectedFields]}
                        onCheckedChange={(checked) => handleFieldToggle(key, checked as boolean)}
                      />
                      <Label htmlFor={key} className="text-sm font-medium">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Format</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={format} onValueChange={(value: "csv" | "excel") => setFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="excel" disabled>
                      Excel (.xlsx) - Coming Soon
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={filteredCount === 0 || Object.values(selectedFields).every((v) => !v)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export {filteredCount} Leads
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
