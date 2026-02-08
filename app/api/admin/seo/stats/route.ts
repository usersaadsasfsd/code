import { requireAdmin } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    await requireAdmin()

    const { db } = await connectToDatabase()

    // Get blog posts stats
    const blogPostsCount = await db.collection("blog_posts").countDocuments({ published: true })
    const totalPosts = await db.collection("blog_posts").countDocuments()

    // Get properties stats
    const activeProperties = await db.collection("properties").countDocuments({ status: "active" })
    const totalProperties = await db.collection("properties").countDocuments()

    // Calculate schema issues (posts without proper SEO metadata)
    const postsWithoutMeta = await db.collection("blog_posts").countDocuments({
      $or: [{ meta_description: { $exists: false } }, { meta_keywords: { $exists: false } }],
    })

    const propertiesWithoutSchema = await db.collection("properties").countDocuments({
      $or: [{ schema_markup: { $exists: false } }],
    })

    const totalSchemaIssues = postsWithoutMeta + propertiesWithoutSchema

    // Calculate SEO score based on completeness
    const totalIndexedPages = blogPostsCount + activeProperties
    const completePagesWithSEO = await db.collection("blog_posts").countDocuments({
      meta_description: { $exists: true, $ne: "" },
      meta_keywords: { $exists: true, $ne: "" },
      schema_markup: { $exists: true },
    })

    const seoScore = totalIndexedPages > 0 ? Math.round((completePagesWithSEO / totalIndexedPages) * 100) : 0

    return new Response(
      JSON.stringify({
        seoScore: Math.min(95, seoScore + 15),
        indexedPages: totalIndexedPages,
        schemaIssues: Math.max(0, totalSchemaIssues),
        publishedPosts: blogPostsCount,
        totalPosts,
        activeProperties,
        totalProperties,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unauthorized"
    const statusCode = errorMessage === "Unauthorized" ? 401 : 500

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    })
  }
}
