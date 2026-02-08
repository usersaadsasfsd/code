import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/types/auth"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

// Track if seeding has been checked to avoid repeated checks
let seedingChecked = false

export class UsersAPI {
  private static async getCollection() {
    const db = await getDatabase()
    return db.collection("users")
  }

  private static async seedDatabase() {
    // Only check seeding once per application lifecycle
    if (seedingChecked) return

    try {
      const collection = await this.getCollection()
      const count = await collection.countDocuments()

      if (count === 0) {
        const defaultUsers = [
          {
            email: "admin@realestate.com",
            password: await bcrypt.hash("admin123", 10),
            name: "Admin User",
            role: "admin",
            phone: "+91-9876543200",
            department: "Management",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: {
              theme: "system",
              notifications: {
                email: true,
                push: true,
                leadUpdates: true,
                taskReminders: true,
              },
              dashboard: {
                defaultView: "leads",
                leadsPerPage: 10,
              },
            },
            googleAccount: null,
          },
          {
            email: "agent@realestate.com",
            password: await bcrypt.hash("agent123", 10),
            name: "Agent User",
            role: "agent",
            phone: "+91-9876543201",
            department: "Sales",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: {
              theme: "system",
              notifications: {
                email: true,
                push: true,
                leadUpdates: true,
                taskReminders: true,
              },
              dashboard: {
                defaultView: "leads",
                leadsPerPage: 10,
              },
            },
            googleAccount: null,
          },
        ]

        await collection.insertMany(defaultUsers)
        console.log("[v0] Database seeded with default users")
      }

      seedingChecked = true
    } catch (error) {
      console.error("[v0] Error seeding database:", error)
      seedingChecked = true // Mark as checked even on error to avoid repeated attempts
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      await this.seedDatabase()

      const collection = await this.getCollection()
      const users = await collection.find({ isActive: true }).sort({ name: 1 }).toArray()

      return users.map((user) => {
        const { _id, password, ...rest } = user
        return {
          ...rest,
          id: _id.toString(),
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
        } as User
      })
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
      throw new Error("Failed to fetch users")
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null
      }

      const collection = await this.getCollection()
      const user = await collection.findOne({ _id: new ObjectId(id), isActive: true })

      if (!user) return null

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        preferences: user.preferences,
        phone: user.phone,
        department: user.department,
        googleAccount: user.googleAccount,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
        // Do not include password or _id
      } as User
    } catch (error) {
      console.error("Error fetching user:", error)
      return null
    }
  }

  static async getUserByEmail(email: string): Promise<any | null> {
    try {
      await this.seedDatabase()

      const collection = await this.getCollection()
      const user = await collection.findOne({ email: email.toLowerCase() })

      if (!user) {
        return null
      }

      return {
        ...user,
        id: user._id.toString(),
        _id: undefined,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
        password: user.password, // Keep password for authentication
      }
    } catch (error) {
      console.error("[v0] getUserByEmail: Error fetching user by email:", error)
      throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  static async createUser(userData: {
    name: string
    email: string
    password: string
    role: "admin" | "agent"
    phone?: string
    department?: string
  }): Promise<User> {
    try {
      const collection = await this.getCollection()

      // Check if user already exists
      const existingUser = await collection.findOne({ email: userData.email.toLowerCase() })
      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      // Format phone number to Indian format
      let formattedPhone = userData.phone
      if (formattedPhone && !formattedPhone.startsWith("+91")) {
        const digits = formattedPhone.replace(/\D/g, "")
        if (digits.length === 10) {
          formattedPhone = `+91-${digits}`
        }
      }

      const newUser = {
        ...userData,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        phone: formattedPhone,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          theme: "system",
          notifications: {
            email: true,
            push: true,
            leadUpdates: true,
            taskReminders: true,
          },
          dashboard: {
            defaultView: "leads",
            leadsPerPage: 10,
          },
        },
        googleAccount: null,
      }

      const result = await collection.insertOne(newUser)

      // If this is an agent, also create an agent record
      if (userData.role === "agent") {
        try {
          const agentsDb = await getDatabase()
          const agentsCollection = agentsDb.collection("agents")

          await agentsCollection.insertOne({
            name: userData.name,
            email: userData.email.toLowerCase(),
            phone: formattedPhone || "",
            active: true,
            userId: result.insertedId.toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        } catch (agentError) {
          console.error("Error creating agent record:", agentError)
          // Don't fail user creation if agent creation fails
        }
      }

      return {
        ...newUser,
        id: result.insertedId.toString(),
        password: undefined, // Never return password
        googleAccount: undefined,
      } as User
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  static async updateUser(id: string, updateData: Partial<User> & { password?: string }): Promise<User> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid user ID")
      }

      const collection = await this.getCollection()
      const { id: _, password, ...dataToUpdate } = updateData

      // Format phone number if provided
      if (dataToUpdate.phone && !dataToUpdate.phone.startsWith("+91")) {
        const digits = dataToUpdate.phone.replace(/\D/g, "")
        if (digits.length === 10) {
          dataToUpdate.phone = `+91-${digits}`
        }
      }

      // If password is being updated, hash it
      if (password) {
        ;(dataToUpdate as any).password = await bcrypt.hash(password, 10)
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...dataToUpdate,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      )

      if (!result) {
        throw new Error("User not found")
      }

      return {
        id: result._id.toString(),
        email: result.email,
        name: result.name,
        role: result.role,
        isActive: result.isActive,
        preferences: result.preferences,
        phone: result.phone,
        department: result.department,
        googleAccount: result.googleAccount,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        lastLogin: result.lastLogin ? new Date(result.lastLogin) : undefined,
        password: undefined, // Never return password
      } as User
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }

  static async updateLastLogin(id: string): Promise<void> {
    try {
      if (!ObjectId.isValid(id)) {
        return
      }

      const collection = await this.getCollection()
      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            lastLogin: new Date(),
            updatedAt: new Date(),
          },
        },
      )
    } catch (error) {
      console.error("Error updating last login:", error)
    }
  }

  static async deleteUser(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false
      }

      const collection = await this.getCollection()
      // Soft delete by setting isActive to false
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            isActive: false,
            updatedAt: new Date(),
          },
        },
      )
      return result.modifiedCount === 1
    } catch (error) {
      console.error("Error deleting user:", error)
      return false
    }
  }

  static async changePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false
      }

      const collection = await this.getCollection()
      const user = await collection.findOne({ _id: new ObjectId(id) })

      if (!user) {
        return false
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return false
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10)

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            password: hashedNewPassword,
            updatedAt: new Date(),
          },
        },
      )

      return result.modifiedCount === 1
    } catch (error) {
      console.error("Error changing password:", error)
      return false
    }
  }
}
