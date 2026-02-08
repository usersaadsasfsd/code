"use client"

import Link from "next/link"
import { Calendar, User } from "lucide-react"
import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/news?page=${page}&limit=10`)
        const data = await res.json()
        setNews(data.news)
      } catch (error) {
        console.error("[v0] Error loading news:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [page])

  return (
    <>
      <Header />
      <main className="min-h-screen px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1>Latest Real Estate News</h1>
            <p className="text-muted-foreground text-sm">Stay updated with industry insights and market trends</p>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : (
            <>
              <div className="space-y-4">
                {news.map((article) => (
                  <Link
                    key={article._id}
                    href={`/news/${article.slug}`}
                    className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex gap-4"
                  >
                    <div className="w-32 h-32 bg-muted flex-shrink-0 overflow-hidden">
                      <img
                        src={article.cover_image || "/placeholder.svg?height=128&width=128&query=news"}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-center">
                      <h3 className="font-semibold text-foreground hover:text-primary line-clamp-2 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{article.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(article.publication_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          Author
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-xs border border-border rounded hover:bg-muted disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-xs text-muted-foreground">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-2 text-xs border border-border rounded hover:bg-muted"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
