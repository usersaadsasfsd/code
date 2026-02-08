"use client"

import Link from "next/link"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Calendar, User, Share2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function NewsDetailPage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const res = await fetch(`/api/news/${params.slug}`)
        const data = await res.json()
        setArticle(data)
      } catch (error) {
        console.error("[v0] Error loading article:", error)
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [params.slug])

  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">Loading...</div>
        <Footer />
      </>
    )

  if (!article)
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Article not found</p>
        </div>
        <Footer />
      </>
    )

  return (
    <>
      <Header />
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Hero Image */}
          <div className="h-96 bg-muted rounded-lg overflow-hidden">
            <img
              src={article.cover_image || "/placeholder.svg?height=384&width=768&query=article"}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Header */}
          <div className="space-y-3">
            <h1>{article.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(article.publication_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <User size={14} />
                By Author
              </div>
              <Button variant="outline" size="sm" className="text-xs bg-transparent ml-auto">
                <Share2 size={14} className="mr-1" />
                Share
              </Button>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-sm max-w-none">
            <div
              className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: article.content }}
            ></div>
          </div>

          {/* Related Articles */}
          <div className="border-t border-border pt-6">
            <h3 className="mb-4">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Link
                  key={i}
                  href="#"
                  className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-32 bg-muted overflow-hidden">
                    <img
                      src={`/open-book-knowledge.png?height=128&width=256&query=article${i}`}
                      alt="Related"
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold line-clamp-2">Related Article Title {i}</p>
                    <p className="text-xs text-muted-foreground mt-2">Browse more insights...</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
