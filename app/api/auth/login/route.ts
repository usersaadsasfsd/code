import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const mongoUrl = process.env.MONGODB_URI || ""

async function loginUser(email: string, password: string) {
  if (!mongoUrl) {
    throw new Error("MongoDB URI not configured")
  }

  const client = new MongoClient(mongoUrl)

  try {
    await client.connect()
    const db = client.db("countryroof")
    const collection = db.collection("users")

    // Find user
    const user = await collection.findOne({ email: email.toLowerCase() })
    if (!user) {
      throw new Error("Invalid credentials")
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new Error("Invalid credentials")
    }

    // Update last login
    await collection.updateOne({ _id: user._id }, { $set: { last_login: new Date() } })

    // Create session token
    const token = Buffer.from(JSON.stringify({ userId: user._id, email: user.email })).toString("base64")

    return {
      id: user._id,
      email: user.email,
      username: user.username,
      user_type: user.user_type,
      token,
    }
  } finally {
    await client.close()
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing email or password" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const user = await loginUser(email, password)

    // Set secure HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set("auth_token", user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: "Logged in successfully",
        user: { id: user.id, email: user.email, username: user.username, user_type: user.user_type },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Login failed"

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
}
