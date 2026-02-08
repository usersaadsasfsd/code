import { MongoClient } from "mongodb"
import { requireAdmin } from "@/lib/auth"

const mongoUrl = process.env.MONGODB_URI || ""

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function GET() {
  if (!mongoUrl) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const client = new MongoClient(mongoUrl)

  try {
    await client.connect()
    const db = client.db("countryroof")
    const collection = db.collection("blog_posts")

    const posts = await collection.find({ published: true }).sort({ createdAt: -1 }).limit(50).toArray()

    return new Response(JSON.stringify({ posts }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch posts" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  } finally {
    await client.close()
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()

    if (!mongoUrl) {
      return new Response(JSON.stringify({ error: "Database not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = await request.json()
    const {
      title,
      excerpt,
      content,
      category,
      author,
      readTime,
      meta_description,
      meta_keywords,
      schema_markup,
      banner_image,
      publication_date,
    } = body

    if (!title || !excerpt || !content || !author) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = new MongoClient(mongoUrl)

    try {
      await client.connect()
      const db = client.db("countryroof")
      const collection = db.collection("blog_posts")

      const slug = slugify(title)

      const result = await collection.insertOne({
        title,
        slug,
        excerpt,
        content,
        category,
        author,
        readTime: Number.parseInt(readTime) || 5,
        published: true,
        meta_description: meta_description || excerpt.substring(0, 160),
        meta_keywords: meta_keywords || "",
        schema_markup: schema_markup || { article_type: "BlogPosting" },
        banner_image: banner_image || null,
        publication_date: publication_date || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return new Response(
        JSON.stringify({
          success: true,
          message: "Blog post created successfully",
          id: result.insertedId,
          slug,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      )
    } finally {
      await client.close()
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create blog post"
    const statusCode = errorMessage === "Unauthorized" ? 401 : 500

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    })
  }
}
