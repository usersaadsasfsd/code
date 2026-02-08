import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface BlogPost {
  _id: string
  title: string
  excerpt: string
  content: string
  banner_image?: string
  cover_image?: string
  publication_date: string
  author?: string
  readTime?: string
  tags?: string[]
  category?: string
}

interface BlogPostPreviewProps {
  blogPost: BlogPost
}

export function BlogPostPreview({ blogPost }: BlogPostPreviewProps) {
  const publishDate = new Date(blogPost.publication_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const bannerImage = blogPost.banner_image || blogPost.cover_image || "/blog-banner.jpg"

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-balance">{blogPost.title}</h1>
        <div className="flex items-center gap-4 text-gray-600 mb-6">
          <span>{publishDate}</span>
          {blogPost.author && <span>By {blogPost.author}</span>}
          {blogPost.readTime && <span>{blogPost.readTime} min read</span>}
        </div>
      </header>

      {bannerImage && (
        <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
          <Image src={bannerImage || "/placeholder.svg"} alt={blogPost.title} fill className="object-cover" />
        </div>
      )}

      <p className="text-lg text-gray-700 mb-6 leading-relaxed">{blogPost.excerpt}</p>

      <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: blogPost.content }} />

      {blogPost.tags && blogPost.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {blogPost.tags.map((tag) => (
            <Link key={tag} href={`/blog?tag=${tag}`}>
              <Button variant="outline" size="sm">
                {tag}
              </Button>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 pt-8 border-t">
        <Link href="/blog">
          <Button>Back to Blog</Button>
        </Link>
      </div>
    </article>
  )
}
