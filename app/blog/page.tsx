import type { Metadata } from "next"
import BlogGrid from "@/components/blog/blog-grid"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Blog | CountryRoof",
  description:
    "Read expert tips on roofing maintenance, installation guides, and industry insights from CountryRoof professionals.",
  openGraph: {
    title: "Blog | CountryRoof",
    description: "Expert roofing tips and industry insights from CountryRoof professionals.",
    url: "https://countryroof.com/blog",
  },
}

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="w-full py-12 md:py-16 px-4 bg-primary/5 border-b border-border">
          <div className="max-w-4xl mx-auto space-y-3">
            <h1 className="text-primary">Roofing Blog</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              Expert tips, maintenance guides, and industry insights from CountryRoof professionals.
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="w-full py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <BlogGrid />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
