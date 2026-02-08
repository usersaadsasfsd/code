"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import AdminNav from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminEditStatePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  })

  useEffect(() => {
    const loadState = async () => {
      try {
        const res = await fetch(`/api/admin/states/${id}`)
        const data = await res.json()
        setFormData(data)
      } catch (error) {
        console.error("[v0] Error loading state:", error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadState()
  }, [id])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === "name" && !prev.slug) {
        updated.slug = value.toLowerCase().replace(/\s+/g, "-")
      }
      return updated
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/states/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        router.push("/admin/states")
      }
    } catch (error) {
      console.error("[v0] Error updating state:", error)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="flex flex-col md:flex-row">
            <AdminNav />
            <div className="flex-1 px-4 py-8 md:py-12">
              <p className="text-muted-foreground text-sm">Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="flex flex-col md:flex-row">
          <AdminNav />

          <div className="flex-1 px-4 py-8 md:py-12">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Edit State</h1>
                <p className="text-sm text-muted-foreground mt-1">Update state details</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">State Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="text-xs h-8">
                    {loading ? "Updating..." : "Update State"}
                  </Button>
                  <Button asChild variant="outline" className="text-xs h-8 bg-transparent">
                    <Link href="/admin/states">Cancel</Link>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
