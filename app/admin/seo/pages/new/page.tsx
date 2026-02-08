"use client"

import React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import PageHeader from "@/components/dashboard/page-header"
import { Suspense } from "react"
import Loading from "./loading"

function NewSEOPageForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = searchParams.get("type") || "static"
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    page_path: "",
    page_type: initialType,
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

  const schemaTemplates: Record<string, string> = {
    property: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": "{{property_name}}",
      "description": "{{description}}",
      "url": "{{url}}",
      "image": "{{image}}",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "{{address}}",
        "addressLocality": "{{city}}",
        "addressRegion": "{{state}}",
        "postalCode": "{{postal_code}}",
        "addressCountry": "IN"
      },
      "offers": {
        "@type": "Offer",
        "price": "{{price}}",
        "priceCurrency": "INR"
      }
    }, null, 2),
    developer: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "{{developer_name}}",
      "description": "{{description}}",
      "url": "{{url}}",
      "logo": "{{logo}}",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "{{phone}}",
        "contactType": "sales"
      }
    }, null, 2),
    location: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Place",
      "name": "{{location_name}}",
      "description": "{{description}}",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "{{latitude}}",
        "longitude": "{{longitude}}"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "{{city}}",
        "addressRegion": "{{state}}",
        "addressCountry": "IN"
      }
    }, null, 2),
    blog: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "{{title}}",
      "description": "{{excerpt}}",
      "image": "{{featured_image}}",
      "author": {
        "@type": "Person",
        "name": "{{author_name}}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Country Roof",
        "logo": {
          "@type": "ImageObject",
          "url": "{{logo_url}}"
        }
      },
      "datePublished": "{{date_published}}",
      "dateModified": "{{date_modified}}"
    }, null, 2),
    static: "",
  }

  const handleLoadTemplate = () => {
    const template = schemaTemplates[formData.page_type]
    if (template) {
      setFormData({ ...formData, schema_markup: template })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let schemaMarkup = null
      if (formData.schema_markup) {
        try {
          schemaMarkup = JSON.parse(formData.schema_markup)
        } catch (e) {
          toast({ title: "Error", description: "Invalid JSON in schema markup", variant: "destructive" })
          setLoading(false)
          return
        }
      }

      const res = await fetch("/api/admin/seo/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          schema_markup: schemaMarkup,
        }),
      })

      if (res.ok) {
        toast({ title: "Success", description: "SEO configuration created" })
        router.push("/admin/seo")
      } else {
        const data = await res.json()
        toast({ title: "Error", description: data.error || "Failed to create", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create SEO configuration", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
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
                placeholder="/about or /properties/[slug]"
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
              placeholder="Page Title | Country Roof"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Meta Description</Label>
            <Textarea
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              placeholder="Brief description for search engines (150-160 characters)"
              rows={2}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Meta Keywords</Label>
            <Input
              value={formData.meta_keywords}
              onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
              placeholder="keyword1, keyword2, keyword3"
              className="h-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Open Graph (Social Sharing)</CardTitle>
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
                placeholder="https://..."
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Schema Markup (JSON-LD)</CardTitle>
            {formData.page_type !== "static" && (
              <Button type="button" variant="outline" size="sm" onClick={handleLoadTemplate}>
                Load Template
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.schema_markup}
            onChange={(e) => setFormData({ ...formData, schema_markup: e.target.value })}
            rows={12}
            className="text-xs font-mono"
            placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
          />
          <p className="text-[10px] text-muted-foreground mt-2">
            Use placeholders like {"{{property_name}}"} for dynamic values
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Creating..." : "Create SEO Configuration"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default function NewSEOPage() {
  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <PageHeader
          title="New SEO Configuration"
          description="Add SEO settings for a page"
          showBackButton
          backHref="/admin/seo"
        />
        <Suspense fallback={<Loading />}>
          <NewSEOPageForm />
        </Suspense>
      </div>
    </main>
  )
}
