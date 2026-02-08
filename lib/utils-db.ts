import { ObjectId } from "mongodb"
import { getDatabase } from "./db"

// Helper to validate MongoDB ObjectId
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id)
}

// Helper to convert string to ObjectId
export function toObjectId(id: string) {
  return new ObjectId(id)
}

// Helper to get a single document by id
export async function getDocumentById(collection: string, id: string) {
  if (!isValidObjectId(id)) return null
  const db = await getDatabase()
  return db.collection(collection).findOne({ _id: new ObjectId(id) })
}

// Helper to get documents with pagination
export async function getDocumentsWithPagination(collection: string, filter: object = {}, page = 1, limit = 12) {
  const db = await getDatabase()
  const skip = (page - 1) * limit

  const documents = await db.collection(collection).find(filter).skip(skip).limit(limit).toArray()

  const total = await db.collection(collection).countDocuments(filter)

  return {
    data: documents,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
}

// Helper to create slug from string
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}
