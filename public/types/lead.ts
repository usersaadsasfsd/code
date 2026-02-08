export interface Lead {
  id: string
  name: string
  primaryPhone: string
  secondaryPhone?: string
  primaryEmail: string
  secondaryEmail?: string
  propertyType: "Residential" | "Commercial" | "Land"
  budgetRange: string
  budget?: number
  preferredLocations: string[]
  source: "Website" | "Referral" | "Social Media" | "Walk-in" | "Advertisement" | "Other"
  status:
    | "New"
    | "Contacted"
    | "Qualified"
    | "Nurturing"
    | "RNR"
    | "Busy"
    | "Disconnected"
    | "Not Interested"
    | "Not Interested (project)"
    | "Low Potential"
    | "Site Visit Scheduled"
    | "Site Visited"
    | "Negotiation"
    | "Converted"
    | "Lost"
    | "Hold"
    | "Switch Off"
    | "Invalid Number"
    | "Incoming Call Not Allowed (ICNA)"
    | "DNE (Does Not Exist)"
    | "Forward call"
    | "Out Of Network"
  assignedAgent?: string
  /** When the lead was assigned to a salesperson (filled automatically when assigned) */
  dateAssignedToSales?: Date
  /** The date when the lead was received (can be set during creation or import) */
  receivedDate?: Date
  /** The date when the lead was assigned to an agent (auto-set on assignment, only admin can edit) */
  assignedDate?: Date
  notes: string
  createdAt: Date
  updatedAt: Date
  lastContacted?: Date
  leadScore: "High" | "Medium" | "Low"
  activities: Activity[]
  attachments: string[]
  createdBy?: string
  leadType: "Lead" | "Cold-Lead"
}

export interface Activity {
  id: string
  type: "Call" | "Email" | "Meeting" | "Note" | "Status Change" | "Property Shown"
  description: string
  date: Date
  agent: string
  metadata?: Record<string, any>
}

export interface Agent {
  id: string
  name: string
  email: string
  phone: string
  active: boolean
  userId?: string
}

export interface LeadFilters {
  status?: string[]
  assignedAgent?: string
  source?: string[]
  propertyType?: string[]
  budgetRange?: string
  leadScore?: string[]
  leadType?: Array<"Lead" | "Cold-Lead">
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
}
