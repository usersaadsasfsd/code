"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { ImportExportDialog } from "@/components/admin/import-export-dialog"
import { useToast } from "@/hooks/use-toast"
import PageHeader from "@/components/dashboard/page-header"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories")
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error("[v0] Error loading categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
        if (res.ok) {
          setCategories(categories.filter((c) => c._id !== id))
          toast({
            title: "Success",
            description: "Category deleted successfully",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to delete category",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("[v0] Error deleting category:", error)
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories Management"
        description="Manage property categories"
        showBackButton
        backHref="/admin/dashboard"
        actions={
          <Button asChild size="sm">
            <Link href="/admin/categories/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Link>
          </Button>
        }
      />

      <ImportExportDialog entityType="categories" onImportSuccess={loadCategories} />

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold">Name</th>
              <th className="px-4 py-2 text-left text-xs font-semibold">Slug</th>
              <th className="px-4 py-2 text-left text-xs font-semibold">Icon</th>
              <th className="px-4 py-2 text-left text-xs font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category._id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2 text-xs">{category.name}</td>
                  <td className="px-4 py-2 text-xs">{category.slug}</td>
                  <td className="px-4 py-2 text-xs">{category.icon_class}</td>
                  <td className="px-4 py-2 text-xs">
                    <div className="flex gap-2">
                      <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                        <Link href={`/admin/categories/${category._id}/edit`}>
                          <Edit2 size={14} />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleDelete(category._id)}
                      >
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
