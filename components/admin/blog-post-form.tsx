"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RichTextEditor from "@/components/blog/rich-text-editor"
import TableOfContents from "@/components/blog/table-of-contents"

interface BlogPostFormProps {
  initialData?: {
    _id?: string
    title?: string
    excerpt?: string
    content?: string
    category?: string
    author?: string
    readTime?: string
    cover_image?: string
    banner_image?: string
    meta_title?: string
    meta_description?: string
    meta_keywords?: string
    og_title?: string
    og_description?: string
    og_image?: string
    tags?: string[] | string
    is_published?: boolean
  }
}

export default function BlogPostForm({ initialData }: BlogPostFormProps) {
  const router = useRouter()
  const isEditing = !!initialData?._id
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    category: initialData?.category || "general",
    author: initialData?.author || "",
    readTime: initialData?.readTime || "5",
    cover_image: initialData?.cover_image || "",
    banner_image: initialData?.banner_image || "",
    meta_title: initialData?.meta_title || "",
    meta_description: initialData?.meta_description || "",
    meta_keywords: initialData?.meta_keywords || "",
    og_title: initialData?.og_title || "",
    og_description: initialData?.og_description || "",
    og_image: initialData?.og_image || "",
    tags: Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : initialData?.tags || "",
    is_published: initialData?.is_published || false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append("file", file)
    formDataUpload.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "")
    formDataUpload.append("fileName", file.name)

    try {
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formDataUpload,
      })
      const data = await response.json()
      setFormData((prev) => ({ ...prev, [fieldName]: data.url }))
    } catch (err) {
      setError("Failed to upload image")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const url = isEditing ? `/api/admin/blog/posts/${initialData._id}` : "/api/admin/blog/posts"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((t) => t.trim()),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${isEditing ? "update" : "create"} blog post`)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin/blog")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Blog Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Enter blog title..."
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="author" className="text-sm font-medium">
                    Author *
                  </label>
                  <Input
                    id="author"
                    name="author"
                    type="text"
                    placeholder="Your name"
                    value={formData.author}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  >
                    <option value="general">General</option>
                    <option value="tips">Tips & Tricks</option>
                    <option value="news">News</option>
                    <option value="guides">Guides</option>
                    <option value="market">Market Analysis</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="excerpt" className="text-sm font-medium">
                  Excerpt *
                </label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="Brief summary of the blog post..."
                  value={formData.excerpt}
                  onChange={handleChange}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="banner_image" className="text-sm font-medium">
                    Banner Image
                  </label>
                  <input
                    id="banner_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "banner_image")}
                    className="w-full"
                  />
                  {formData.banner_image && (
                    <img
                      src={formData.banner_image || "/placeholder.svg"}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="cover_image" className="text-sm font-medium">
                    Cover Image
                  </label>
                  <input
                    id="cover_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "cover_image")}
                    className="w-full"
                  />
                  {formData.cover_image && (
                    <img
                      src={formData.cover_image || "/placeholder.svg"}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Blog Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content *</label>
                    <RichTextEditor
                      content={formData.content}
                      onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                      placeholder="Write your blog content with rich formatting, images, and more..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="readTime" className="text-sm font-medium">
                        Read Time (minutes)
                      </label>
                      <Input
                        id="readTime"
                        name="readTime"
                        type="number"
                        value={formData.readTime}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="tags" className="text-sm font-medium">
                        Tags (comma-separated)
                      </label>
                      <Input
                        id="tags"
                        name="tags"
                        type="text"
                        placeholder="tag1, tag2, tag3"
                        value={formData.tags}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <TableOfContents content={formData.content} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="meta_title" className="text-sm font-medium">
                  Meta Title
                </label>
                <Input
                  id="meta_title"
                  name="meta_title"
                  type="text"
                  placeholder="SEO title (50-60 characters)"
                  value={formData.meta_title}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">{formData.meta_title.length}/60 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="meta_description" className="text-sm font-medium">
                  Meta Description
                </label>
                <Textarea
                  id="meta_description"
                  name="meta_description"
                  placeholder="SEO description (150-160 characters)"
                  value={formData.meta_description}
                  onChange={handleChange}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">{formData.meta_description.length}/160 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="meta_keywords" className="text-sm font-medium">
                  Meta Keywords (comma-separated)
                </label>
                <Input
                  id="meta_keywords"
                  name="meta_keywords"
                  type="text"
                  placeholder="keyword1, keyword2, keyword3"
                  value={formData.meta_keywords}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="og_title" className="text-sm font-medium">
                  OG Title (Social Media)
                </label>
                <Input
                  id="og_title"
                  name="og_title"
                  type="text"
                  placeholder="Title for social sharing"
                  value={formData.og_title}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="og_description" className="text-sm font-medium">
                  OG Description
                </label>
                <Textarea
                  id="og_description"
                  name="og_description"
                  placeholder="Description for social sharing"
                  value={formData.og_description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
      {success && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">
          Blog post {isEditing ? "updated" : "created"} successfully!
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (isEditing ? "Updating..." : "Publishing...") : isEditing ? "Update Blog" : "Publish Blog"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setFormData((prev) => ({ ...prev, is_published: false }))}
        >
          Save as Draft
        </Button>
      </div>
    </form>
  )
}
