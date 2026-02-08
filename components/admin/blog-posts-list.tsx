"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface BlogPost {
  _id: string
  title: string
  slug: string
  category: string
  author: string
  createdAt: string
  published: boolean
}

export default function BlogPostsList() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/admin/blog/posts")
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
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild size="sm" className="text-xs h-8">
          <Link href="/admin/blog/new">Create Post</Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground text-center">No blog posts yet</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-xs">Title</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Author</TableHead>
                <TableHead className="text-xs">Published</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post._id} className="border-border">
                  <TableCell className="text-xs font-medium max-w-xs truncate">{post.title}</TableCell>
                  <TableCell className="text-xs">{post.category}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{post.author}</TableCell>
                  <TableCell className="text-xs">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        post.published ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
