import { cookies } from "next/headers"
import { MongoClient, ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

const mongoUrl = process.env.MONGODB_URI || ""

export interface User {
  _id: ObjectId
  username: string
  email: string
  password?: string
  phone_number?: string
  user_type: "customer" | "agent" | "admin"
  profile_picture?: string
  date_joined: Date
  last_login?: Date
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) return null

    const decoded = JSON.parse(Buffer.from(token, "base64").toString())

    const client = new MongoClient(mongoUrl)
    try {
      await client.connect()
      const db = client.db("countryroof")
      const collection = db.collection("users")

      const user = await collection.findOne({
        _id: new ObjectId(decoded.userId),
      })

      return user as User | null
    } finally {
      await client.close()
    }
  } catch {
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.user_type !== "admin") {
    throw new Error("Forbidden")
  }
  return user
}

export async function requireAgent() {
  const user = await requireAuth()
  if (user.user_type !== "agent" && user.user_type !== "admin") {
    throw new Error("Forbidden")
  }
  return user
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
