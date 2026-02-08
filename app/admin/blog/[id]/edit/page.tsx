import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { getBlogPostById } from "@/app/blog/_actions"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import AdminNav from "@/components/admin/admin-nav"
import BlogPostForm from "@/components/admin/blog-post-form"

export const metadata: Metadata = {
  title: "Edit Blog Post | CountryRoof Admin",
  robots: { index: false },
}

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string }
}) {
  try {
    await requireAdmin()
  } catch {
    redirect("/auth/login")
  }

  // Fetch blog post data server-side using the _actions function
  const blogPost = await getBlogPostById(params.id)

  if (!blogPost) {
    redirect("/admin/blog")
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="flex flex-col md:flex-row">
          <AdminNav />

          <div className="flex-1 px-4 py-8 md:py-12">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Edit Blog Post</h1>
                <p className="text-sm text-muted-foreground">Update the blog post details</p>
              </div>

              <BlogPostForm initialData={blogPost} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
