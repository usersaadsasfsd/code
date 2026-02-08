import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import BlogPostForm from "@/components/admin/blog-post-form"

export const metadata: Metadata = {
  title: "Create Blog Post | CountryRoof Admin",
  robots: { index: false },
}

export default async function NewBlogPostPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/auth/login")
  }

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Create Blog Post</h1>
          <p className="text-sm text-muted-foreground">Write and publish a new blog post</p>
        </div>

        <BlogPostForm />
      </div>
    </div>
  )
}
