import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
}

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
  _mongoClient?: MongoClient
  _lastConnectionCheck?: number
}

let clientPromise: Promise<MongoClient>

if (!globalWithMongo._mongoClientPromise) {
  const client = new MongoClient(uri, options)
  globalWithMongo._mongoClientPromise = client.connect()
}

clientPromise = globalWithMongo._mongoClientPromise

// Cache the database connection for 5 seconds to avoid excessive pings
const CONNECTION_CHECK_INTERVAL = 5000
let cachedDb: Db | null = null
let lastCheck = 0

/**
 * Returns a promise that resolves to the database instance.
 * Uses connection caching to improve performance.
 */
export async function getDatabase(): Promise<Db> {
  try {
    const now = Date.now()

    // Return cached database if it was checked recently
    if (cachedDb && now - lastCheck < CONNECTION_CHECK_INTERVAL) {
      return cachedDb
    }

    const client = await clientPromise
    const db = client.db("realestate_crm")

    // Verify connection only if it hasn't been checked recently
    if (now - lastCheck >= CONNECTION_CHECK_INTERVAL) {
      try {
        await db.admin().ping()
        lastCheck = now
        cachedDb = db
      } catch (pingError) {
        console.warn("[v0] MongoDB ping failed, reconnecting...")
        // Reset and reconnect
        globalWithMongo._mongoClientPromise = undefined
        cachedDb = null
        const newClient = new MongoClient(uri, options)
        globalWithMongo._mongoClientPromise = newClient.connect()
        const reconnectedClient = await globalWithMongo._mongoClientPromise
        globalWithMongo._mongoClient = reconnectedClient
        const newDb = reconnectedClient.db("realestate_crm")
        cachedDb = newDb
        lastCheck = now
        return newDb
      }
    }

    return db
  } catch (error) {
    console.error("[v0] MongoDB connection error:", error)
    cachedDb = null
    if (error instanceof Error) {
      if (error.message.includes("ENOTFOUND")) {
        throw new Error("Database server not found. Please check MONGODB_URI.")
      } else if (error.message.includes("authentication failed")) {
        throw new Error("Database authentication failed. Please check credentials.")
      }
    }
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

if (typeof process !== "undefined") {
  process.on("SIGINT", async () => {
    try {
      if (globalWithMongo._mongoClient) {
        await globalWithMongo._mongoClient.close()
      }
    } catch (error) {
      console.error("[v0] Error closing MongoDB connection:", error)
    }
  })
}

export default clientPromise
