"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface QuoteData {
  name: string
  email: string
  phone: string
  serviceType: string
  propertyType: string
  roofSize: string
  urgency: string
  details: string
}

export default function QuoteForm() {
  const [formData, setFormData] = useState<QuoteData>({
    name: "",
    email: "",
    phone: "",
    serviceType: "installation",
    propertyType: "residential",
    roofSize: "",
    urgency: "normal",
    details: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to submit quote request")

      setSuccess(true)
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceType: "installation",
        propertyType: "residential",
        roofSize: "",
        urgency: "normal",
        details: "",
      })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-border rounded-lg p-6 bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-medium text-foreground">
            Full Name *
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Smith"
            value={formData.name}
            onChange={handleChange}
            required
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="phone" className="text-xs font-medium text-foreground">
            Phone *
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={handleChange}
            required
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-xs font-medium text-foreground">
          Email *
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="h-8 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="serviceType" className="text-xs font-medium text-foreground">
            Service Type *
          </label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full h-8 text-xs border border-border rounded bg-background px-2"
          >
            <option value="installation">New Installation</option>
            <option value="repair">Repair</option>
            <option value="replacement">Replacement</option>
            <option value="maintenance">Maintenance</option>
            <option value="inspection">Inspection</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="propertyType" className="text-xs font-medium text-foreground">
            Property Type *
          </label>
          <select
            id="propertyType"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            className="w-full h-8 text-xs border border-border rounded bg-background px-2"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="roofSize" className="text-xs font-medium text-foreground">
            Estimated Roof Size (sq ft)
          </label>
          <Input
            id="roofSize"
            name="roofSize"
            type="number"
            placeholder="2000"
            value={formData.roofSize}
            onChange={handleChange}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="urgency" className="text-xs font-medium text-foreground">
            Timeline
          </label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            className="w-full h-8 text-xs border border-border rounded bg-background px-2"
          >
            <option value="emergency">Emergency (ASAP)</option>
            <option value="urgent">Urgent (This week)</option>
            <option value="normal">Normal (1-2 weeks)</option>
            <option value="planning">Planning (Future)</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="details" className="text-xs font-medium text-foreground">
          Project Details
        </label>
        <Textarea
          id="details"
          name="details"
          placeholder="Tell us more about your project, current roof condition, or any concerns..."
          value={formData.details}
          onChange={handleChange}
          rows={4}
          className="text-xs resize-none"
        />
      </div>

      {success && (
        <p className="text-xs text-green-600 bg-green-50 p-2 rounded">Quote request submitted successfully!</p>
      )}
      {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full h-8 text-xs">
        {loading ? "Submitting..." : "Get Free Quote"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">We'll respond within 24 hours with an accurate quote.</p>
    </form>
  )
}
