"use client"

import type React from "react"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

export default function PropertyReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" })
        setAuthenticated(response.ok)
      } catch {
        setAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  if (!authenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Please log in to leave a review</p>
            <Button onClick={() => router.push("/auth/login")}>Log In</Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/properties/${params.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, comment }),
      })

      if (res.ok) {
        router.push(`/properties/${params.id}`)
      }
    } catch (error) {
      console.error("[v0] Error submitting review:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Leave a Review</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star size={32} className={star <= rating ? "fill-primary text-primary" : "text-muted"} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{rating} out of 5 stars</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Your Review</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this property..."
                rows={6}
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
