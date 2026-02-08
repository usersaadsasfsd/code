import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  console.log("[v0] Attempting MongoDB connection...")
  console.log("[v0] MONGODB_URI exists:", !!process.env.MONGODB_URI)
  
  if (!process.env.MONGODB_URI) {
    console.error("[v0] MONGODB_URI not found in environment variables")
    throw new Error("MONGODB_URI is not defined in environment variables")
  }

  const uri = process.env.MONGODB_URI
  console.log("[v0] MONGODB_URI prefix:", uri.substring(0, 15))

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error("MONGODB_URI must start with 'mongodb://' or 'mongodb+srv://'")
  }

  if (cachedClient && cachedDb) {
    console.log("[v0] Using cached MongoDB connection")
    return { client: cachedClient, db: cachedDb }
  }

  console.log("[v0] Creating new MongoDB connection...")
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db("countryroof")

  cachedClient = client
  cachedDb = db

  console.log("[v0] MongoDB connected successfully")
  return { client, db }
}

export async function getDatabase() {
  const { db } = await connectToDatabase()
  return db
}

export async function connectDB() {
  return getDatabase()
}
