// lib/api/leads.ts

import { getDatabase } from "@/lib/mongodb"
import type { Lead, Activity } from "@/types/lead"
import { ObjectId } from "mongodb"

interface CsvLeadData {
  name: string
  email: string
  phone: string
  "date received"?: string
  "received date"?: string // Added alternative column name for received date
  createdat?: string
  "property type"?: string
  "budget range"?: string
  "preferred locations"?: string
  source?: string
  status?: string
  "lead score"?: string
  "lead type"?: string
  notes?: string
}

const VALID_PROPERTY_TYPES = ["Residential", "Commercial", "Land"] as const
const VALID_SOURCES = ["Website", "Referral", "Social Media", "Walk-in", "Advertisement", "Other"] as const
const VALID_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Nurturing",
  "RNR",
  "Busy",
  "Disconnected",
  "Switch Off",
  "Invalid Number",
  "Incoming Call Not Allowed (ICNA)",
  "DNE (Does Not Exist)",
  "Forward call",
  "Out Of Network",
  "Not Interested",
  "Not Interested (project)",
  "Low Potential",
  "Site Visit Scheduled",
  "Site Visited",
  "Negotiation",
  "Converted",
  "Lost",
  "Hold",
] as const
const VALID_LEAD_SCORES = ["High", "Medium", "Low"] as const
const VALID_LEAD_TYPES = ["Lead", "Cold-Lead"] as const

export class LeadsAPI {
  private static async getCollection() {
    const db = await getDatabase()
    return db.collection("leads")
  }

  /**
   * Fetches leads, optionally filtered by leadType.
   * @param filterOptions An object containing optional filters like leadType.
   * @returns A promise that resolves to an array of Lead objects.
   */
  static async getLeads(filterOptions?: { leadType?: "Lead" | "Cold-Lead" }): Promise<Lead[]> {
    try {
      const collection = await this.getCollection()
      const query: { leadType?: "Lead" | "Cold-Lead" } = {}

      if (filterOptions?.leadType) {
        query.leadType = filterOptions.leadType
      }

      // Use lean query without fetching unnecessary nested data
      const leads = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(1000) // Add limit to prevent fetching too much data at once
        .toArray()

      return leads.map((lead) => {
        const { _id, createdAt, updatedAt, lastContacted, activities, ...rest } = lead

        return {
          ...rest,
          id: _id.toString(),
          createdAt: new Date(createdAt),
          updatedAt: new Date(updatedAt),
          lastContacted: lastContacted ? new Date(lastContacted) : undefined,
          dateAssignedToSales: lead.dateAssignedToSales ? new Date(lead.dateAssignedToSales) : undefined,
          receivedDate: lead.receivedDate ? new Date(lead.receivedDate) : undefined,
          assignedDate: lead.assignedDate ? new Date(lead.assignedDate) : undefined,
          activities:
            activities?.map(
              (activity: any) =>
                ({
                  ...activity,
                  date: new Date(activity.date),
                }) as Activity,
            ) || [],
        } as Lead
      })
    } catch (error) {
      console.error("[v0] Error fetching leads:", error)
      throw new Error("Failed to fetch leads from database")
    }
  }

  static async getLeadById(id: string): Promise<Lead | null> {
    try {
      if (!ObjectId.isValid(id)) {
        console.warn(`Attempted to fetch lead with invalid ID format: ${id}`)
        return null
      }

      const collection = await this.getCollection()
      const lead = await collection.findOne({ _id: new ObjectId(id) })

      if (!lead) return null

      const { _id, ...rest } = lead
      return {
        ...rest,
        id: _id.toString(),
        createdAt: new Date(lead.createdAt),
        updatedAt: new Date(lead.updatedAt),
        lastContacted: lead.lastContacted ? new Date(lead.lastContacted) : undefined,
        dateAssignedToSales: lead.dateAssignedToSales ? new Date(lead.dateAssignedToSales) : undefined,
        receivedDate: lead.receivedDate ? new Date(lead.receivedDate) : undefined,
        assignedDate: lead.assignedDate ? new Date(lead.assignedDate) : undefined,
        activities:
          lead.activities?.map(
            (activity: any) =>
              ({
                ...activity,
                date: new Date(activity.date),
              }) as Activity,
          ) || [],
      } as Lead
    } catch (error) {
      console.error("Error fetching lead:", error)
      return null
    }
  }

  /**
   * Creates a new lead.
   * Now requires `leadType` in `leadData`.
   */
  static async createLead(
    leadData: Omit<Lead, "id" | "createdAt" | "updatedAt" | "lastContacted" | "activities" | "attachments"> & {
      activities?: any[]
      attachments?: string[]
      receivedDate?: Date | string // Allow receivedDate in creation
    },
  ): Promise<Lead> {
    try {
      const collection = await this.getCollection()
      const now = new Date()

      // Ensure leadType is provided
      if (!leadData.hasOwnProperty("leadType")) {
        throw new Error("leadType is required when creating a lead.")
      }

      const receivedDate = leadData.receivedDate ? new Date(leadData.receivedDate) : now

      const assignedDate = leadData.assignedAgent ? now : undefined

      const newLeadDocument = {
        ...leadData,
        notes: leadData.notes || "",
        activities: leadData.activities || [], // Ensure activities is an array
        attachments: leadData.attachments || [], // Ensure attachments is an array
        createdAt: now,
        updatedAt: now,
        lastContacted: undefined, // New leads typically don't have a lastContacted date initially
        receivedDate: receivedDate, // Set receivedDate
        assignedDate: assignedDate, // Set assignedDate if agent assigned
      }

      const result = await collection.insertOne(newLeadDocument)

      if (!result.acknowledged) {
        throw new Error("Failed to acknowledge lead creation")
      }

      // Return the created lead in the expected format
      const createdLead = {
        ...newLeadDocument,
        id: result.insertedId.toString(),
      } as Lead

      // Ensure dates are correctly typed for the returned Lead object
      createdLead.createdAt = new Date(createdLead.createdAt)
      createdLead.updatedAt = new Date(createdLead.updatedAt)
      if (createdLead.lastContacted) {
        createdLead.lastContacted = new Date(createdLead.lastContacted)
      }
      if ((createdLead as any).dateAssignedToSales) {
        ;(createdLead as any).dateAssignedToSales = new Date((createdLead as any).dateAssignedToSales)
      }
      if (createdLead.receivedDate) {
        createdLead.receivedDate = new Date(createdLead.receivedDate)
      }
      if (createdLead.assignedDate) {
        createdLead.assignedDate = new Date(createdLead.assignedDate)
      }
      createdLead.activities =
        createdLead.activities?.map(
          (activity: any) =>
            ({
              ...activity,
              date: new Date(activity.date),
            }) as Activity,
        ) || []

      return createdLead
    } catch (error) {
      console.error("Error creating lead:", error)
      throw new Error("Failed to create lead")
    }
  }

  static async updateLead(id: string, updateData: Partial<Lead>): Promise<Lead> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid lead ID format")
      }

      const collection = await this.getCollection()
      const now = new Date()

      // Destructure to remove 'id' from updateData payload, as _id is handled by query
      // Also remove backend-managed fields like createdAt, activities, attachments if sent
      const {
        id: _,
        createdAt, // Remove createdAt if sent by frontend
        activities, // Activities are updated via addActivity, not directly here
        attachments, // Attachments might be updated directly or via a separate endpoint
        ...dataToUpdate // This will contain all other fields
      } = updateData

      // Handle updating specific fields that might be Date objects or arrays
      const finalUpdatePayload: any = {
        ...dataToUpdate,
        updatedAt: now, // Always update `updatedAt` on modifications
      }

      // If lastContacted is provided in updateData, ensure it's a Date object
      if (updateData.lastContacted !== undefined) {
        finalUpdatePayload.lastContacted = updateData.lastContacted ? new Date(updateData.lastContacted) : undefined
      }
      if (updateData.dateAssignedToSales !== undefined) {
        finalUpdatePayload.dateAssignedToSales = updateData.dateAssignedToSales
          ? new Date(updateData.dateAssignedToSales)
          : undefined
      }
      if (updateData.receivedDate !== undefined) {
        finalUpdatePayload.receivedDate = updateData.receivedDate ? new Date(updateData.receivedDate) : undefined
      }
      if (updateData.assignedDate !== undefined) {
        finalUpdatePayload.assignedDate = updateData.assignedDate ? new Date(updateData.assignedDate) : undefined
      }
      // Handle array updates if they are part of the `dataToUpdate`
      if (updateData.preferredLocations !== undefined) {
        finalUpdatePayload.preferredLocations = updateData.preferredLocations
      }
      // Ensure 'notes' is handled if it can be empty string but not null/undefined
      if (updateData.notes !== undefined) {
        finalUpdatePayload.notes = updateData.notes
      }
      // leadType can also be updated
      if (updateData.leadType !== undefined) {
        finalUpdatePayload.leadType = updateData.leadType
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) }, // Query for the document by its MongoDB _id
        { $set: finalUpdatePayload }, // Use $set for partial updates
        { returnDocument: "after" }, // Return the document AFTER the update has been applied
      )

      if (!result?.value) {
        throw new Error("Lead not found")
      }

      const { _id, ...rest } = result.value
      return {
        ...rest,
        id: _id.toString(),
        createdAt: new Date(result.value.createdAt),
        updatedAt: new Date(result.value.updatedAt),
        lastContacted: result.value.lastContacted ? new Date(result.value.lastContacted) : undefined,
        receivedDate: result.value.receivedDate ? new Date(result.value.receivedDate) : undefined,
        assignedDate: result.value.assignedDate ? new Date(result.value.assignedDate) : undefined,
        activities:
          result.value.activities?.map(
            (activity: any) =>
              ({
                ...activity,
                date: new Date(activity.date),
              }) as Activity,
          ) || [],
      } as Lead
    } catch (error) {
      console.error("Error updating lead with ID:", id, error)
      if (
        error instanceof Error &&
        (error.message === "Invalid lead ID format" || error.message === "Lead not found")
      ) {
        throw error
      }
      throw new Error("Failed to update lead due to an internal error")
    }
  }

  static async deleteLead(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        console.warn(`Attempted to delete lead with invalid ID format: ${id}`)
        return false
      }

      const collection = await this.getCollection()
      const result = await collection.deleteOne({ _id: new ObjectId(id) })
      return result.deletedCount === 1
    } catch (error) {
      console.error("Error deleting lead:", error)
      return false
    }
  }

  static async addActivity(
    leadId: string,
    activityData: Omit<Activity, "id"> & { date?: Date | string },
  ): Promise<Lead> {
    try {
      if (!ObjectId.isValid(leadId)) {
        throw new Error("Invalid lead ID format")
      }

      const collection = await this.getCollection()
      const now = new Date()

      const newActivity: Activity = {
        id: new ObjectId().toString(), // Generate unique ID for the activity
        date: activityData.date ? new Date(activityData.date) : now,
        type: activityData.type,
        description: activityData.description,
        agent: activityData.agent,
        metadata: activityData.metadata,
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(leadId) },
        {
          $push: { activities: newActivity as any }, // Use $push to add to the array
          $set: { updatedAt: now, lastContacted: now }, // Update timestamps
        },
        { returnDocument: "after" },
      )

      if (!result?.value) {
        throw new Error("Lead not found")
      }

      const { _id, ...rest } = result.value
      return {
        ...rest,
        id: _id.toString(),
        createdAt: new Date(result.value.createdAt),
        updatedAt: new Date(result.value.updatedAt),
        lastContacted: result.value.lastContacted ? new Date(result.value.lastContacted) : undefined,
        receivedDate: result.value.receivedDate ? new Date(result.value.receivedDate) : undefined,
        assignedDate: result.value.assignedDate ? new Date(result.value.assignedDate) : undefined,
        activities:
          result.value.activities?.map(
            (activity: any) =>
              ({
                ...activity,
                date: new Date(activity.date),
              }) as Activity,
          ) || [],
      } as Lead
    } catch (error) {
      console.error("Error adding activity:", error)
      if (
        error instanceof Error &&
        (error.message === "Invalid lead ID format" || error.message === "Lead not found")
      ) {
        throw error
      }
      throw new Error("Failed to add activity to lead")
    }
  }

  /**
   * Bulk creates leads from CSV data.
   * @param leadsData An array of objects parsed from CSV, representing lead information.
   * @returns An object with total, successful, failed counts and an array of errors.
   */
  static async bulkCreateLeads(
    leadsData: CsvLeadData[],
  ): Promise<{ total: number; successful: number; failed: number; errors: string[] }> {
    console.log("[LeadsAPI] Starting bulkCreateLeads. Total records received:", leadsData.length)
    const total = leadsData.length
    let successful = 0
    let failed = 0
    const errors: string[] = []
    const collection = await this.getCollection()
    // We'll use a per-lead createdAt to preserve original "Date Received" if provided by the CSV/XLSX file
    const now = new Date()

    for (let i = 0; i < leadsData.length; i++) {
      const leadData = leadsData[i]
      const rowNumber = i + 2 // +1 for 0-index to 1-index, +1 for skipping header row

      // Basic validation for required fields
      if (!leadData.name || !leadData.email || !leadData.phone) {
        failed++
        errors.push(`Row ${rowNumber}: Missing required fields (name, email, or phone).`)
        console.warn(`[LeadsAPI] Row ${rowNumber}: Skipping due to missing required fields.`)
        continue
      }

      try {
        // Safely map and cast CSV column names to Lead interface properties
        // Use type guards or conditional checks to ensure assignment to union types
        const propertyType: Lead["propertyType"] = (
          VALID_PROPERTY_TYPES.includes(leadData["property type"] as any) ? leadData["property type"] : "Unknown"
        ) as Lead["propertyType"] // 'Unknown' or a suitable default from your enum

        const source: Lead["source"] = (
          VALID_SOURCES.includes(leadData.source as any) ? leadData.source : "Other"
        ) as Lead["source"] // 'Other' or a suitable default from your enum

        const status: Lead["status"] = (
          VALID_STATUSES.includes(leadData.status as any) ? leadData.status : "New"
        ) as Lead["status"]

        const leadScore: Lead["leadScore"] = (
          VALID_LEAD_SCORES.includes(leadData["lead score"] as any) ? leadData["lead score"] : "Low"
        ) as Lead["leadScore"]

        const leadType: "Lead" | "Cold-Lead" = (
          VALID_LEAD_TYPES.includes(leadData["lead type"] as any) ? leadData["lead type"] : "Lead"
        ) as "Lead" | "Cold-Lead"

        const newLead: Omit<Lead, "id" | "createdAt" | "updatedAt" | "lastContacted" | "activities" | "attachments"> = {
          name: leadData.name,
          primaryEmail: leadData.email,
          primaryPhone: leadData.phone,
          propertyType: propertyType,
          budgetRange: leadData["budget range"] || "Not Specified",
          preferredLocations: leadData["preferred locations"]
            ? leadData["preferred locations"]
                .split(",")
                .map((loc) => loc.trim())
                .filter(Boolean)
            : [],
          source: source,
          status: status,
          leadScore: leadScore,
          leadType: leadType,
          notes: leadData.notes || "",
          assignedAgent: undefined,
        }
        console.log(`[LeadsAPI] Row ${rowNumber}: Preparing to insert lead:`, newLead.name)

        let receivedDateForRow: Date = now
        const possibleDateStr =
          (leadData["received date"] as any) || (leadData["date received"] as any) || (leadData["createdat"] as any)
        if (possibleDateStr) {
          const parsed = new Date(possibleDateStr)
          if (!isNaN(parsed.getTime())) {
            receivedDateForRow = parsed
          }
        }

        const result = await collection.insertOne({
          ...newLead,
          activities: [],
          attachments: [],
          createdAt: now,
          updatedAt: now,
          receivedDate: receivedDateForRow, // Set receivedDate from import
          assignedDate: undefined, // No assignedDate on import (not assigned yet)
        })

        if (result.acknowledged) {
          successful++
          console.log(`[LeadsAPI] Row ${rowNumber}: Successfully inserted.`)
        } else {
          failed++
          errors.push(`Row ${rowNumber}: Failed to insert into database.`)
          console.error(`[LeadsAPI] Row ${rowNumber}: Failed to acknowledge insert.`)
        }
      } catch (error: any) {
        console.error(`[LeadsAPI] Row ${i + 2}: Error processing lead:`, error)
        failed++
        errors.push(error.message || "An unexpected error occurred during insertion.")
      }
    }
    console.log(`[LeadsAPI] Bulk import finished. Successful: ${successful}, Failed: ${failed}, Total: ${total}.`)
    return { total, successful, failed, errors }
  }
}
