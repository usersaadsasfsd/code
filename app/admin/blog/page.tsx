import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import BlogPostsList from "@/components/admin/blog-posts-list"

export const metadata: Metadata = {
  title: "Manage Blog | CountryRoof Admin",
  robots: { index: false },
}

export default async function AdminBlogPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/auth/login")
  }

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Blog Management</h1>
            <p className="text-sm text-muted-foreground">Create and manage blog posts</p>
          </div>
        </div>

        <div className="border border-border rounded-lg">
          <BlogPostsList />
        </div>
      </div>
    </div>
  )
}
