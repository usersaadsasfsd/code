"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"

export default function AgentReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch("/api/agent/reviews")
        const data = await res.json()
        setReviews(data)
      } catch (error) {
        console.error("[v0] Error loading reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [])

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6 px-4 py-8 md:py-12">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Reviews & Ratings</h1>
            <p className="text-sm text-muted-foreground">See what buyers think about your properties</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Average Rating</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-2xl font-bold text-primary">{avgRating}</p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.round(Number(avgRating)) ? "fill-primary text-primary" : "text-muted"}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-bold text-primary mt-2">{reviews.length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Properties Reviewed</p>
              <p className="text-2xl font-bold text-primary mt-2">{new Set(reviews.map((r) => r.property)).size}</p>
            </div>
          </div>

          {loading ? (
            <div className="border border-border rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="border border-border rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review._id} className="border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? "fill-primary text-primary" : "text-muted"}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{review.rating}/5 Stars</p>
                  </div>
                  <p className="text-sm text-foreground">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">Property: {review.property}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
