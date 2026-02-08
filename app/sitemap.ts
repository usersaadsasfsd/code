import type { MetadataRoute } from "next"
import { MongoClient } from "mongodb"

async function getProperties() {
  if (!process.env.MONGODB_URI) {
    console.log("[sitemap] MONGODB_URI not set, skipping dynamic properties")
    return []
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI)
    try {
      await client.connect()
      const db = client.db("countryroof")
      const collection = db.collection("properties")
      const properties = await collection.find({ status: "active" }).project({ slug: 1, updated_at: 1 }).toArray()
      return properties
    } finally {
      await client.close()
    }
  } catch (error) {
    console.log("[sitemap] Failed to parse MONGODB_URI or connect:", error)
    return []
  }
}

async function getBlogs() {
  if (!process.env.MONGODB_URI) {
    console.log("[sitemap] MONGODB_URI not set, skipping dynamic blogs")
    return []
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI)
    try {
      await client.connect()
      const db = client.db("countryroof")
      const collection = db.collection("blog_posts")
      const blogs = await collection.find({ is_published: true }).project({ slug: 1, updated_at: 1 }).toArray()
      return blogs
    } finally {
      await client.close()
    }
  } catch (error) {
    console.log("[sitemap] Failed to parse MONGODB_URI or connect:", error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://countryroof.com"

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]

  // Dynamic property pages
  const properties = await getProperties()
  const propertyPages = properties.map((prop: any) => ({
    url: `${baseUrl}/properties/${prop._id}`,
    lastModified: new Date(prop.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // Dynamic blog pages
  const blogs = await getBlogs()
  const blogPages = blogs.map((blog: any) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...propertyPages, ...blogPages]
}
