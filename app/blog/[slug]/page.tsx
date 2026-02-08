import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MongoClient } from "mongodb"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"
import { generateBlogSchema } from "@/lib/schema-markup-generator"

const mongoUrl = process.env.MONGODB_URI || ""

async function getBlogPost(slug: string) {
  if (!mongoUrl) return null

  const client = new MongoClient(mongoUrl)

  try {
    await client.connect()
    const db = client.db("countryroof")
    const collection = db.collection("blog_posts")

    const post = await collection.findOne({
      slug,
      is_published: true,
    })

    return post
  } finally {
    await client.close()
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return { title: "Post not found" }
  }

  return {
    title: post.meta_title || `${post.title} | CountryRoof Blog`,
    description: post.meta_description || post.excerpt,
    keywords: post.meta_keywords || post.tags?.join(", "),
    openGraph: {
      title: post.og_title || post.title,
      description: post.og_description || post.excerpt,
      url: `https://countryroof.com/blog/${slug}`,
      type: "article",
      publishedTime: post.publication_date,
      authors: [post.author?.toString() || "CountryRoof"],
      images: [post.og_image || post.banner_image || post.cover_image],
    },
    twitter: {
      card: "summary_large_image",
      title: post.og_title || post.title,
      description: post.og_description || post.excerpt,
      images: [post.og_image || post.banner_image || post.cover_image],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const publishDate = new Date(post.publication_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const schemaMarkup = generateBlogSchema(post, post.author || "CountryRoof")

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaMarkup),
          }}
        />

        {/* Hero Section with Banner */}
        <section className="w-full bg-primary/5 border-b border-border">
          {post.banner_image && (
            <div className="w-full h-96 md:h-[500px] overflow-hidden">
              <img
                src={post.banner_image || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="px-4 py-8 md:py-12">
            <div className="max-w-3xl mx-auto space-y-3">
              <Link href="/blog" className="text-xs text-primary hover:underline">
                ← Back to Blog
              </Link>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground">{post.title}</h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span>{post.author}</span>
                <span>•</span>
                <span>{publishDate}</span>
                <span>•</span>
                <span>{post.read_time || "5"} min read</span>
                {post.category && (
                  <>
                    <span>•</span>
                    <span className="inline-block px-2 py-1 bg-muted rounded-full text-xs">{post.category}</span>
                  </>
                )}
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {post.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${tag}`}
                      className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full hover:bg-accent/20 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="w-full py-12 md:py-16 px-4">
          <article className="max-w-3xl mx-auto prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <div className="space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground">
              {post.content.split("\n\n").map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </article>
        </section>

        <section className="w-full py-8 px-4 bg-muted/30 border-t border-border">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">POSTED ON</p>
                <p className="text-sm text-foreground">{publishDate}</p>
              </div>
              {post.category && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">CATEGORY</p>
                  <p className="text-sm text-foreground">{post.category}</p>
                </div>
              )}
              {post.read_time && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">READING TIME</p>
                  <p className="text-sm text-foreground">{post.read_time} minutes</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
