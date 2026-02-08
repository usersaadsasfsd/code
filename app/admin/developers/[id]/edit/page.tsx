"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import AdminNav from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Upload } from "lucide-react"

export default function EditDeveloperPage() {
  const router = useRouter()
  const params = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    about_developer: "",
  })

  useEffect(() => {
    const loadDeveloper = async () => {
      try {
        const res = await fetch(`/api/admin/developers/${params.id}`)
        const data = await res.json()
        setFormData(data)
        if (data.logo_url) {
          setLogoPreview(data.logo_url)
        }
      } catch (error) {
        console.error("[v0] Error loading developer:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDeveloper()
  }, [params.id])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData((prev) => ({ ...prev, logo_url: data.url }))
      }
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/developers/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        router.push("/admin/developers")
      }
    } catch (error) {
      console.error("[v0] Error updating developer:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="flex flex-col md:flex-row">
          <AdminNav />

          <div className="flex-1 px-4 py-8 md:py-12">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Edit Developer</h1>
                <p className="text-sm text-muted-foreground mt-1">Update developer information</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Developer Name</label>
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
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Developer Logo</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="text-xs h-8"
                      >
                        <Upload size={14} className="mr-1.5" />
                        Change Logo
                      </Button>
                    </div>
                    {logoPreview && (
                      <div className="flex items-center gap-3">
                        <img
                          src={logoPreview || "/placeholder.svg"}
                          alt="Logo preview"
                          className="h-12 w-12 object-cover rounded border border-border"
                        />
                        <span className="text-xs text-muted-foreground">Logo uploaded</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">About Developer</label>
                  <textarea
                    name="about_developer"
                    value={formData.about_developer}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={saving} className="text-xs h-8">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button asChild variant="outline" className="text-xs h-8 bg-transparent">
                    <Link href="/admin/developers">Cancel</Link>
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
