// app/api/leads/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb" // Assuming this path is correct for your MongoDB connection

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Lead ID format" }, { status: 400 })
    }

    const db = await getDatabase()
    const leadsCollection = db.collection("leads")

    const lead = await leadsCollection.findOne({ _id: new ObjectId(id) })

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Convert _id to string 'id' for consistent client-side usage
    const { _id, ...restOfLead } = lead
    const formattedLead = { id: _id.toString(), ...restOfLead }

    return NextResponse.json(formattedLead)
  } catch (error) {
    console.error("API Error (GET lead by ID):", error)
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updateData = await request.json()

    console.log(`[API PUT] Attempting to update lead ID: ${id}`)
    console.log(`[API PUT] Received update data:`, updateData)

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Lead ID format" }, { status: 400 })
    }

    const db = await getDatabase()
    const leadsCollection = db.collection("leads")

    // Remove _id from updateData if present
    const { _id, ...dataToUpdate } = updateData

    // If client provided createdAt or updatedAt as strings, convert to Date objects
    if (dataToUpdate.createdAt) {
      try {
        dataToUpdate.createdAt = new Date(dataToUpdate.createdAt)
      } catch (e) {
        // ignore invalid format
      }
    }
    if (dataToUpdate.updatedAt) {
      try {
        dataToUpdate.updatedAt = new Date(dataToUpdate.updatedAt)
      } catch (e) {
        // ignore invalid format
      }
    }
    if (dataToUpdate.receivedDate) {
      try {
        dataToUpdate.receivedDate = new Date(dataToUpdate.receivedDate)
      } catch (e) {
        // ignore invalid format
      }
    }
    if (dataToUpdate.assignedDate) {
      try {
        dataToUpdate.assignedDate = new Date(dataToUpdate.assignedDate)
      } catch (e) {
        // ignore invalid format
      }
    }

    // Fetch existing lead to detect assignment changes
    const existingLead = await leadsCollection.findOne({ _id: new ObjectId(id) })
    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found for update" }, { status: 404 })
    }

    // If assignedAgent is being set now but was previously empty, set dateAssignedToSales
    if (dataToUpdate.assignedAgent && !existingLead.assignedAgent) {
      // If caller supplied an explicit dateAssignedToSales, respect it; otherwise set to now
      dataToUpdate.dateAssignedToSales = dataToUpdate.dateAssignedToSales
        ? new Date(dataToUpdate.dateAssignedToSales)
        : new Date()
      if (!dataToUpdate.assignedDate) {
        dataToUpdate.assignedDate = new Date()
      }
    }

    dataToUpdate.updatedAt = new Date() // Ensure updatedAt is set/updated

    const result = await leadsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: dataToUpdate },
      { returnDocument: "after" }, // Return the updated document
    )

    if (!result || !result.value) {
      console.warn(`[API PUT] Lead not found for update, findOneAndUpdate returned no value for ID: ${id}.`)
      return NextResponse.json({ error: "Lead not found for update" }, { status: 404 })
    }

    const updatedDoc = result.value
    const { _id: updatedId, ...rest } = updatedDoc
    const updatedLead = { id: updatedId.toString(), ...rest }

    console.log(`[API PUT] Successfully updated lead ID: ${id}, returning 200.`)
    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error("API Error (PUT lead by ID):", error)
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Lead ID format" }, { status: 400 })
    }

    const db = await getDatabase()
    const leadsCollection = db.collection("leads")

    const result = await leadsCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Lead not found for deletion" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("API Error (DELETE lead by ID):", error)
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 })
  }
}
