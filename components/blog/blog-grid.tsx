"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  author: string
  category: string
  readTime: number
  createdAt: string
}

export default function BlogGrid() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blog/posts")
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts || [])
        }
      } catch (error) {
        console.error("Failed to fetch blog posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading blog posts...</div>
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">No blog posts yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <Link key={post._id} href={`/blog/${post.slug}`}>
          <Card className="border border-border hover:border-primary/50 transition-colors h-full cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="text-xs">{post.author}</CardDescription>
                </div>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded whitespace-nowrap">
                  {post.category}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
                <span className="text-xs text-muted-foreground">{post.readTime} min read</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
