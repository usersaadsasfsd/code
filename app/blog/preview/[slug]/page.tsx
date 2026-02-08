// Import necessary modules and components
import { notFound } from "next/navigation"
import { getBlogPostBySlug } from "@/app/blog/_actions"
import { BlogPostPreview } from "@/app/blog/_components"

// Define the default export function
export default async function BlogPostPreviewPage({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const blogPost = await getBlogPostBySlug(slug)

  if (!blogPost) {
    notFound()
  }

  // Render the blog post preview component
  return <BlogPostPreview blogPost={blogPost} />
}
