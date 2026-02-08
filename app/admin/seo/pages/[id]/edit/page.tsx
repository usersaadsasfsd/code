"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import PageHeader from "@/components/dashboard/page-header"

export default function EditSEOPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    page_path: "",
    page_type: "static",
    page_title: "",
    meta_description: "",
    meta_keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    canonical_url: "",
    robots_meta: "index, follow",
    schema_markup: "",
  })

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/admin/seo/pages/${id}`)
        if (res.ok) {
          const data = await res.json()
          setFormData({
            page_path: data.page_path || "",
            page_type: data.page_type || "static",
            page_title: data.page_title || "",
            meta_description: data.meta_description || "",
            meta_keywords: data.meta_keywords || "",
            og_title: data.og_title || "",
            og_description: data.og_description || "",
            og_image: data.og_image || "",
            canonical_url: data.canonical_url || "",
            robots_meta: data.robots_meta || "index, follow",
            schema_markup: data.schema_markup ? JSON.stringify(data.schema_markup, null, 2) : "",
          })
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchPage()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let schemaMarkup = null
      if (formData.schema_markup) {
        try {
          schemaMarkup = JSON.parse(formData.schema_markup)
        } catch (e) {
          toast({ title: "Error", description: "Invalid JSON in schema markup", variant: "destructive" })
          setSaving(false)
          return
        }
      }

      const res = await fetch(`/api/admin/seo/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          schema_markup: schemaMarkup,
        }),
      })

      if (res.ok) {
        toast({ title: "Success", description: "SEO configuration updated" })
        router.push("/admin/seo")
      } else {
        const data = await res.json()
        toast({ title: "Error", description: data.error || "Failed to update", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update SEO configuration", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <PageHeader
          title="Edit SEO Configuration"
          description={`Editing: ${formData.page_path}`}
          showBackButton
          backHref="/admin/seo"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Page Path *</Label>
                  <Input
                    value={formData.page_path}
                    onChange={(e) => setFormData({ ...formData, page_path: e.target.value })}
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Page Type</Label>
                  <Select value={formData.page_type} onValueChange={(v) => setFormData({ ...formData, page_type: v })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">Static Page</SelectItem>
                      <SelectItem value="property">Property Page</SelectItem>
                      <SelectItem value="developer">Developer Page</SelectItem>
                      <SelectItem value="location">Location Page</SelectItem>
                      <SelectItem value="blog">Blog Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Page Title</Label>
                <Input
                  value={formData.page_title}
                  onChange={(e) => setFormData({ ...formData, page_title: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Meta Description</Label>
                <Textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Meta Keywords</Label>
                <Input
                  value={formData.meta_keywords}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Open Graph</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">OG Title</Label>
                  <Input
                    value={formData.og_title}
                    onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">OG Image URL</Label>
                  <Input
                    value={formData.og_image}
                    onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">OG Description</Label>
                <Textarea
                  value={formData.og_description}
                  onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                  rows={2}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Advanced SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Canonical URL</Label>
                  <Input
                    value={formData.canonical_url}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Robots Meta</Label>
                  <Select value={formData.robots_meta} onValueChange={(v) => setFormData({ ...formData, robots_meta: v })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index, follow">Index, Follow</SelectItem>
                      <SelectItem value="noindex, follow">NoIndex, Follow</SelectItem>
                      <SelectItem value="index, nofollow">Index, NoFollow</SelectItem>
                      <SelectItem value="noindex, nofollow">NoIndex, NoFollow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Schema Markup (JSON-LD)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.schema_markup}
                onChange={(e) => setFormData({ ...formData, schema_markup: e.target.value })}
                rows={12}
                className="text-xs font-mono"
                placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
              />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
