import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

// Only validate and throw errors when actually attempting to connect

export async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables")
  }

  if (!process.env.MONGODB_URI.startsWith("mongodb://") && !process.env.MONGODB_URI.startsWith("mongodb+srv://")) {
    throw new Error("MONGODB_URI must start with 'mongodb://' or 'mongodb+srv://'")
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db("countryroof")

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function getDatabase() {
  const { db } = await connectToDatabase()
  return db
}
