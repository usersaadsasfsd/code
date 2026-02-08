import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { UsersAPI } from "@/lib/api/users"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

if (!process.env.JWT_SECRET) {
  console.warn("[v0] WARNING: JWT_SECRET not set in environment variables, using default (insecure for production)")
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login attempt started")

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json({ message: "Invalid request format" }, { status: 400 })
    }

    const { email, password } = body

    if (!email || !password) {
      console.warn("[v0] Login attempt with missing credentials")
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    console.log("[v0] Attempting login for email:", email)

    let user
    try {
      user = await UsersAPI.getUserByEmail(email)
    } catch (dbError) {
      console.error("[v0] Database error during login:", dbError)
      return NextResponse.json({ message: "Database connection error. Please try again." }, { status: 503 })
    }

    if (!user) {
      console.warn("[v0] Login attempt failed: User not found for email", email)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    if (!user.password) {
      console.error("[v0] Login attempt failed: User", email, "has no password hash in database")
      return NextResponse.json({ message: "Account configuration error. Please contact support." }, { status: 401 })
    }

    // Verify password
    console.log("[v0] Verifying password for", email)
    let isValidPassword = false
    try {
      isValidPassword = await bcrypt.compare(password, user.password)
    } catch (bcryptError) {
      console.error("[v0] Password verification error:", bcryptError)
      return NextResponse.json({ message: "Authentication error. Please try again." }, { status: 500 })
    }

    if (!isValidPassword) {
      console.warn("[v0] Login attempt failed: Invalid password for email", email)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is active
    if (!user.isActive) {
      console.warn("[v0] Login attempt failed: User", email, "is not active")
      return NextResponse.json(
        { message: "Your account has been deactivated. Please contact support." },
        { status: 401 },
      )
    }

    try {
      await UsersAPI.updateLastLogin(user.id)
    } catch (updateError) {
      console.error("[v0] Failed to update last login:", updateError)
      // Don't fail login if this fails
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user

    console.log("[v0] Login successful for", email, "- Role:", user.role)
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        lastLogin: new Date(),
      },
      token,
    })
  } catch (error) {
    console.error("[v0] Unexpected login error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
