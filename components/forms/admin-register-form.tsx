"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminRegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    company_name: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number,
          user_type: "admin",
          company_name: formData.company_name,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Registration failed")
      }

      router.push("/admin/login?success=registered")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="username" className="text-xs font-medium text-foreground">
          Username
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="admin_user"
          value={formData.username}
          onChange={handleChange}
          required
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-xs font-medium text-foreground">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@countyroof.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="text-xs font-medium text-foreground">
          Phone Number
        </label>
        <Input
          id="phone"
          name="phone_number"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone_number}
          onChange={handleChange}
          required
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="company" className="text-xs font-medium text-foreground">
          Organization Name
        </label>
        <Input
          id="company"
          name="company_name"
          type="text"
          placeholder="CountyRoof Inc"
          value={formData.company_name}
          onChange={handleChange}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-xs font-medium text-foreground">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
          required
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="h-8 text-xs"
        />
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full h-8 text-xs bg-orange-600 hover:bg-orange-700">
        {loading ? "Creating admin account..." : "Create Admin Account"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        By creating an admin account, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  )
}
