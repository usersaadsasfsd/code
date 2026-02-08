"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { 
  Edit2, 
  Trash2, 
  X, 
  Eye, 
  EyeOff, 
  Save,
  Pencil,
  LayoutGrid,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import PageHeader from "@/components/dashboard/page-header"

interface Section {
  _id: string
  name: string
  section_type: string
  title: string
  subtitle?: string
  display_limit: number
  sort_order: number
  is_active: boolean
  property_ids: string[]
}

const PREDEFINED_SECTIONS: Omit<Section, "_id">[] = [
  {
    name: "Handpicked Selections",
    section_type: "handpicked",
    title: "Countryroof's Handpicked Selections",
    subtitle: "Curated properties selected just for you",
    display_limit: 4,
    sort_order: 1,
    is_active: true,
    property_ids: [],
  },
  {
    name: "Trending Tabs",
    section_type: "trending_tabs",
    title: "High-Demand Real Estate in Delhi NCR & Gurgaon",
    subtitle: "Most sought-after properties in the region",
    display_limit: 32,
    sort_order: 2,
    is_active: true,
    property_ids: [],
  },
  {
    name: "New Launches",
    section_type: "new_launches",
    title: "Fresh Arrivals: Latest Gurgaon Developments",
    subtitle: "Be the first to explore new projects",
    display_limit: 4,
    sort_order: 3,
    is_active: true,
    property_ids: [],
  },
  {
    name: "Luxury",
    section_type: "luxury",
    title: "Elite Residences & Premium Penthouses",
    subtitle: "Experience luxury living at its finest",
    display_limit: 4,
    sort_order: 4,
    is_active: true,
    property_ids: [],
  },
  {
    name: "Developers",
    section_type: "developers",
    title: "Premier Residential & Business Hubs",
    subtitle: "Projects from top developers",
    display_limit: 3,
    sort_order: 5,
    is_active: true,
    property_ids: [],
  },
  {
    name: "Affordable",
    section_type: "affordable",
    title: "Value-Driven Housing in Gurugram",
    subtitle: "Quality homes within your budget",
    display_limit: 4,
    sort_order: 6,
    is_active: true,
    property_ids: [],
  },
  {
    name: "SCO",
    section_type: "sco",
    title: "Prime SCO Plots & Commercial Land",
    subtitle: "Investment opportunities in commercial spaces",
    display_limit: 4,
    sort_order: 7,
    is_active: true,
    property_ids: [],
  },
  {
    name: "Iconic",
    section_type: "iconic",
    title: "Iconic Living in the Center of Gurugram",
    subtitle: "Landmark properties in prime locations",
    display_limit: 8,
    sort_order: 8,
    is_active: true,
    property_ids: [],
  },
  {
    name: "Plots",
    section_type: "plots",
    title: "Affordable Residential & Investment Plots",
    subtitle: "Build your dream home on your own land",
    display_limit: 4,
    sort_order: 9,
    is_active: true,
    property_ids: [],
  },
  {
    name: "Commercial",
    section_type: "commercial",
    title: "Top-Tier Commercial Ventures in NCR",
    subtitle: "Premium spaces for your business",
    display_limit: 4,
    sort_order: 10,
    is_active: true,
    property_ids: [],
  },
  {
    name: "Spotlight Projects",
    section_type: "spotlight",
    title: "Our Signature Spotlight Projects",
    subtitle: "Featured properties with exceptional value",
    display_limit: 3,
    sort_order: 11,
    is_active: true,
    property_ids: [],
  },
  {
    name: "Investment",
    section_type: "investment",
    title: "High-Growth Investment Corridors",
    subtitle: "Properties with excellent appreciation potential",
    display_limit: 4,
    sort_order: 12,
    is_active: true,
    property_ids: [],
  },
  {
    name: "Budget",
    section_type: "budget",
    title: "Budget-Friendly Living in Gurgaon",
    subtitle: "Affordable options for first-time buyers",
    display_limit: 4,
    sort_order: 13,
    is_active: true,
    property_ids: [],
  },
  {
    name: "Builders",
    section_type: "builders",
    title: "Leading Builders & Industry Pioneers",
    subtitle: "Trusted names in real estate development",
    display_limit: 12,
    sort_order: 14,
    is_active: true,
    property_ids: [],
  },
]

export default function HomepageSectionsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editSubtitle, setEditSubtitle] = useState("")
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    try {
      console.log("[v0] Loading sections from API...")
      const response = await fetch("/api/admin/homepage-sections")
      console.log("[v0] API response status:", response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API returned error:", errorText)
        throw new Error(`Failed to load sections: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("[v0] Loaded sections data:", data)
      console.log("[v0] Loaded sections type:", typeof data, "is array:", Array.isArray(data))
      
      if (!Array.isArray(data)) {
        console.warn("[v0] Data is not an array, received:", typeof data)
      }
      
      const sectionsArray = Array.isArray(data) ? data : []
      console.log("[v0] Final sections array length:", sectionsArray.length)
      
      if (sectionsArray.length > 0) {
        console.log("[v0] ALL Section IDs:", sectionsArray.map((s, idx) => ({ 
          index: idx, 
          id: s._id, 
          title: s.title,
          idType: typeof s._id
        })))
      } else {
        console.warn("[v0] No sections returned - database may be empty")
      }
      
      setSections(sectionsArray)
    } catch (error) {
      console.error("[v0] Error loading sections:", error)
      toast({
        title: "Error",
        description: "Failed to load sections. Check browser console for details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultSections = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/homepage-sections/initialize", { method: "POST" })
      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.count > 0) {
          toast({
            title: "Success",
            description: `Successfully initialized ${result.count} default sections!`,
          })
          await loadSections()
        } else if (result.success && result.count === 0) {
          toast({
            title: "Info",
            description: "Sections were already initialized. No changes made.",
          })
          await loadSections()
        }
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to initialize",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error initializing sections:", error)
      toast({
        title: "Error",
        description: "Error initializing sections. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/homepage-sections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      })
      if (response.ok) {
        setSections(sections.map((s) => (s._id === id ? { ...s, is_active: !isActive } : s)))
        toast({
          title: "Success",
          description: `Section ${!isActive ? "activated" : "deactivated"} successfully`,
        })
      }
    } catch (error) {
      console.error("[v0] Error updating section:", error)
      toast({
        title: "Error",
        description: "Failed to update section status",
        variant: "destructive",
      })
    }
  }

  const startEditing = (section: Section) => {
    setEditingSection(section._id)
    setEditTitle(section.title)
    setEditSubtitle(section.subtitle || "")
  }

  const cancelEditing = () => {
    setEditingSection(null)
    setEditTitle("")
    setEditSubtitle("")
  }

  const saveSection = async (id: string) => {
    if (!editTitle.trim()) {
      toast({
        title: "Error",
        description: "Title cannot be empty",
        variant: "destructive",
      })
      return
    }

    setSavingSection(id)
    try {
      const response = await fetch(`/api/admin/homepage-sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: editTitle.trim(),
          subtitle: editSubtitle.trim() || undefined
        }),
      })
      
      if (response.ok) {
        setSections(sections.map((s) => 
          s._id === id 
            ? { ...s, title: editTitle.trim(), subtitle: editSubtitle.trim() || undefined } 
            : s
        ))
        setEditingSection(null)
        setEditTitle("")
        setEditSubtitle("")
        toast({
          title: "Success",
          description: "Section updated successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update section",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error saving section:", error)
      toast({
        title: "Error",
        description: "Failed to save section changes",
        variant: "destructive",
      })
    } finally {
      setSavingSection(null)
    }
  }

  const deleteSection = async (id: string) => {
    if (confirm("Are you sure? This will remove all properties from this section.")) {
      try {
        const response = await fetch(`/api/admin/homepage-sections/${id}`, { method: "DELETE" })
        
        if (!response.ok) {
          const error = await response.json()
          toast({
            title: "Error",
            description: error.error || "Failed to delete section",
            variant: "destructive",
          })
          return
        }
        
        // Successfully deleted - update UI
        setSections(sections.filter((s) => s._id !== id))
        toast({
          title: "Success",
          description: "Section deleted successfully!",
        })
      } catch (error) {
        console.error("[v0] Error deleting section:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete section",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage Sections"
        description="Manage all homepage sections and their properties. Edit titles, subtitles, and manage property assignments."
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={loadSections} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button onClick={initializeDefaultSections} variant="outline" size="sm">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Initialize Defaults
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="border border-border rounded-xl p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading sections...</p>
          </div>
        </div>
      ) : sections.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-12 text-center bg-muted/20">
          <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sections created yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Initialize default sections to start managing your homepage content. You can customize titles and add properties later.
          </p>
          <Button onClick={initializeDefaultSections}>
            <LayoutGrid className="h-4 w-4 mr-2" />
            Create Default Sections
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground">Section</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground">Properties</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground">Order</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sections.map((section) => (
                  <tr key={section._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      {editingSection === section._id ? (
                        <div className="space-y-2 max-w-md">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Section title"
                            className="h-9"
                          />
                          <Input
                            value={editSubtitle}
                            onChange={(e) => setEditSubtitle(e.target.value)}
                            placeholder="Subtitle (optional)"
                            className="h-8 text-sm"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-foreground">{section.title}</p>
                          {section.subtitle && (
                            <p className="text-xs text-muted-foreground mt-0.5">{section.subtitle}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium">
                        {section.section_type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ 
                              width: `${Math.min(((section.property_ids?.length || 0) / section.display_limit) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {section.property_ids?.length || 0}/{section.display_limit}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-medium">
                        {section.sort_order}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleActive(section._id, section.is_active)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                          section.is_active 
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {section.is_active ? (
                          <>
                            <Eye size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} />
                            Hidden
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {editingSection === section._id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveSection(section._id)}
                              disabled={savingSection === section._id}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                            >
                              <Save size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditing}
                              className="h-8 w-8 p-0 text-muted-foreground"
                            >
                              <X size={14} />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(section)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              title="Edit title & subtitle"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Link 
                                href={`/admin/homepage-sections/${section._id}`}
                                title="Manage properties"
                              >
                                <Edit2 size={14} />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSection(section._id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete section"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border">
            {sections.map((section) => (
              <div key={section._id} className="p-4 space-y-3">
                {editingSection === section._id ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Section title"
                      className="h-9"
                    />
                    <Input
                      value={editSubtitle}
                      onChange={(e) => setEditSubtitle(e.target.value)}
                      placeholder="Subtitle (optional)"
                      className="h-8 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveSection(section._id)}
                        disabled={savingSection === section._id}
                        className="flex-1"
                      >
                        <Save size={14} className="mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{section.title}</p>
                        {section.subtitle && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{section.subtitle}</p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleActive(section._id, section.is_active)}
                        className={cn(
                          "shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          section.is_active 
                            ? "bg-green-500/10 text-green-600" 
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {section.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                        {section.is_active ? "Active" : "Hidden"}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="bg-muted px-2 py-0.5 rounded">{section.section_type.replace(/_/g, " ")}</span>
                      <span>Order: {section.sort_order}</span>
                      <span>{section.property_ids?.length || 0}/{section.display_limit} properties</span>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(section)}
                        className="flex-1 h-8 text-xs"
                      >
                        <Pencil size={12} className="mr-1" />
                        Edit
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs bg-transparent">
                        <Link href={`/admin/homepage-sections/${section._id}`}>
                          <Edit2 size={12} className="mr-1" />
                          Properties
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSection(section._id)}
                        className="h-8 w-8 p-0 text-destructive border-destructive/30"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
