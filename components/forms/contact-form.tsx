"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface FormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to submit form")

      setSuccess(true)
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="name" className="text-xs font-medium text-foreground">
          Name *
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={handleChange}
          required
          className="h-8 text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
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

        <div className="space-y-1">
          <label htmlFor="phone" className="text-xs font-medium text-foreground">
            Phone
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={handleChange}
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="subject" className="text-xs font-medium text-foreground">
          Subject *
        </label>
        <Input
          id="subject"
          name="subject"
          type="text"
          placeholder="How can we help?"
          value={formData.subject}
          onChange={handleChange}
          required
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="message" className="text-xs font-medium text-foreground">
          Message *
        </label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us more about your project..."
          value={formData.message}
          onChange={handleChange}
          required
          rows={4}
          className="text-xs resize-none"
        />
      </div>

      {success && <p className="text-xs text-green-600 bg-green-50 p-2 rounded">Message sent successfully!</p>}
      {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full h-8 text-xs">
        {loading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
