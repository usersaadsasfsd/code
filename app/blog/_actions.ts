import { MongoClient } from "mongodb"

const mongoUrl = process.env.MONGODB_URI || ""

export async function getBlogPostBySlug(slug: string) {
  if (!mongoUrl) {
    console.error("[v0] MongoDB URI not configured")
    return null
  }

  const client = new MongoClient(mongoUrl)

  try {
    await client.connect()
    const db = client.db("countryroof")
    const collection = db.collection("blog_posts")

    const post = await collection.findOne({
      slug,
      is_published: true,
    })

    if (!post) {
      return null
    }

    // Convert MongoDB ObjectId to string for serialization
    return {
      ...post,
      _id: post._id?.toString(),
      author: post.author?.toString?.() || post.author,
    }
  } catch (error) {
    console.error("[v0] Error fetching blog post by slug:", error)
    return null
  } finally {
    await client.close()
  }
}

export async function getBlogPostById(id: string) {
  if (!mongoUrl) {
    console.error("[v0] MongoDB URI not configured")
    return null
  }

  const client = new MongoClient(mongoUrl)

  try {
    await client.connect()
    const db = client.db("countryroof")
    const collection = db.collection("blog_posts")
    const { ObjectId } = await import("mongodb")

    const post = await collection.findOne({
      _id: new ObjectId(id),
    })

    if (!post) {
      return null
    }

    return {
      ...post,
      _id: post._id?.toString(),
      author: post.author?.toString?.() || post.author,
    }
  } catch (error) {
    console.error("[v0] Error fetching blog post by ID:", error)
    return null
  } finally {
    await client.close()
  }
}
