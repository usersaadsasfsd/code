"use client"
import { useEffect, useState } from "react"
import { Star, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch("/api/admin/reviews")
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

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: true }),
      })
      if (res.ok) {
        setReviews(reviews.map((r) => (r._id === id ? { ...r, is_approved: true } : r)))
      }
    } catch (error) {
      console.error("[v0] Error approving review:", error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" })
      if (res.ok) {
        setReviews(reviews.filter((r) => r._id !== id))
      }
    } catch (error) {
      console.error("[v0] Error deleting review:", error)
    }
  }

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Reviews Management</h1>
          <p className="text-sm text-muted-foreground">Approve or reject property reviews</p>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold">Property</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Reviewer</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Rating</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Status</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2 text-xs">{review.property_id}</td>
                    <td className="px-4 py-2 text-xs">{review.reviewer_name}</td>
                    <td className="px-4 py-2 text-xs flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={12} className="fill-primary" />
                      ))}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${review.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {review.is_approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs flex gap-2 justify-end">
                      {!review.is_approved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleApprove(review._id)}
                        >
                          <Check size={14} className="text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleReject(review._id)}
                      >
                        <X size={14} className="text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
