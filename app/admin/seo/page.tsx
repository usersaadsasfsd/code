"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import PageHeader from "@/components/dashboard/page-header"
import { 
  Search, Plus, Edit2, Trash2, ExternalLink, FileText, Code2, 
  Globe, Building2, MapPin, Newspaper, BarChart3, CheckCircle2, AlertCircle
} from "lucide-react"

interface SEOPage {
  _id: string
  page_path: string
  page_type: string
  page_title: string
  meta_description: string
  schema_markup?: Record<string, any>
  updated_at: string
}

interface SEOStats {
  seoScore: number
  indexedPages: number
  schemaIssues: number
  publishedPosts: number
  totalPosts: number
  activeProperties: number
  totalProperties: number
}

export default function SEOManagementPage() {
  const searchParams = useSearchParams()
  const [stats, setStats] = useState<SEOStats | null>(null)
  const [pages, setPages] = useState<SEOPage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pagesRes] = await Promise.all([
          fetch("/api/admin/seo/stats"),
          fetch("/api/admin/seo/pages"),
        ])
        
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
        
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json()
          setPages(pagesData)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this SEO configuration?")) return

    try {
      const res = await fetch(`/api/admin/seo/pages/${id}`, { method: "DELETE" })
      if (res.ok) {
        setPages(pages.filter((p) => p._id !== id))
        toast({ title: "Deleted", description: "SEO configuration deleted" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
    }
  }

  const filteredPages = pages.filter((p) =>
    p.page_path.toLowerCase().includes(search.toLowerCase()) ||
    p.page_title.toLowerCase().includes(search.toLowerCase())
  )

  const pageTypeIcons: Record<string, any> = {
    static: Globe,
    property: Building2,
    developer: Building2,
    location: MapPin,
    blog: Newspaper,
  }

  const pageTypeColors: Record<string, string> = {
    static: "bg-gray-100 text-gray-700",
    property: "bg-blue-100 text-blue-700",
    developer: "bg-purple-100 text-purple-700",
    location: "bg-emerald-100 text-emerald-700",
    blog: "bg-amber-100 text-amber-700",
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <PageHeader
          title="SEO Management"
          description="Manage SEO settings, meta tags, and schema markup"
          showBackButton
          backHref="/admin/dashboard"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-9">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="pages" className="text-xs">Page SEO</TabsTrigger>
            <TabsTrigger value="schema" className="text-xs">Schema Markup</TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.seoScore || 0}%</p>
                      <p className="text-xs text-muted-foreground">SEO Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.indexedPages || 0}</p>
                      <p className="text-xs text-muted-foreground">Indexed Pages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.schemaIssues || 0}</p>
                      <p className="text-xs text-muted-foreground">Schema Issues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{pages.length}</p>
                      <p className="text-xs text-muted-foreground">SEO Configs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1 bg-transparent" asChild>
                    <Link href="/admin/seo/pages/new">
                      <Plus className="h-4 w-4" />
                      <span className="text-xs">Add SEO Config</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1 bg-transparent" asChild>
                    <Link href="/sitemap.xml" target="_blank">
                      <Globe className="h-4 w-4" />
                      <span className="text-xs">View Sitemap</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1 bg-transparent" asChild>
                    <Link href="/robots.txt" target="_blank">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">View Robots.txt</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1 bg-transparent" onClick={() => setActiveTab("schema")}>
                    <Code2 className="h-4 w-4" />
                    <span className="text-xs">Schema Markup</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent SEO Configurations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Page</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Schema</TableHead>
                      <TableHead className="text-xs w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.slice(0, 5).map((page) => {
                      const Icon = pageTypeIcons[page.page_type] || Globe
                      return (
                        <TableRow key={page._id}>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium">{page.page_path}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant="secondary" className={`text-[10px] ${pageTypeColors[page.page_type] || ""}`}>
                              {page.page_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            {page.schema_markup ? (
                              <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                                Added
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">None</Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                              <Link href={`/admin/seo/pages/${page._id}/edit`}>
                                <Edit2 className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Page SEO Settings</CardTitle>
                  <Button size="sm" asChild>
                    <Link href="/admin/seo/pages/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Page
                    </Link>
                  </Button>
                </div>
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search pages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Page Path</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Title</TableHead>
                      <TableHead className="text-xs">Schema</TableHead>
                      <TableHead className="text-xs w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredPages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No SEO configurations found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPages.map((page) => {
                        const Icon = pageTypeIcons[page.page_type] || Globe
                        return (
                          <TableRow key={page._id}>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                <Link
                                  href={page.page_path}
                                  target="_blank"
                                  className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                >
                                  {page.page_path}
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </div>
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge variant="secondary" className={`text-[10px] ${pageTypeColors[page.page_type] || ""}`}>
                                {page.page_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2 max-w-[200px]">
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {page.page_title || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="py-2">
                              {page.schema_markup ? (
                                <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                                  Added
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px]">None</Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                                  <Link href={`/admin/seo/pages/${page._id}/edit`}>
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(page._id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schema Markup Tab */}
          <TabsContent value="schema" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Property Schema
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Manage schema markup for property pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    Property schema includes RealEstateListing, Place, and Offer markup for better search visibility.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/seo/pages/new?type=property">
                      Configure Property Schema
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Developer Schema
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Manage schema markup for developer pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    Organization schema for developer pages with contact info, logo, and social links.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/seo/pages/new?type=developer">
                      Configure Developer Schema
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Schema
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Manage schema markup for location pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    Place and LocalBusiness schema for location pages with geo coordinates and area info.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/seo/pages/new?type=location">
                      Configure Location Schema
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Newspaper className="h-4 w-4" />
                    Blog Schema
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Manage schema markup for blog posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    Article and BlogPosting schema with author, date, and image markup.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/seo/pages/new?type=blog">
                      Configure Blog Schema
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Schema Templates</CardTitle>
                <CardDescription className="text-xs">
                  Pre-built schema templates you can use
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <h4 className="text-sm font-medium mb-1">Organization</h4>
                    <p className="text-xs text-muted-foreground mb-2">For company pages</p>
                    <code className="text-[10px] text-muted-foreground block bg-muted p-2 rounded">
                      @type: Organization
                    </code>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <h4 className="text-sm font-medium mb-1">RealEstateListing</h4>
                    <p className="text-xs text-muted-foreground mb-2">For property pages</p>
                    <code className="text-[10px] text-muted-foreground block bg-muted p-2 rounded">
                      @type: RealEstateListing
                    </code>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <h4 className="text-sm font-medium mb-1">BreadcrumbList</h4>
                    <p className="text-xs text-muted-foreground mb-2">For navigation</p>
                    <code className="text-[10px] text-muted-foreground block bg-muted p-2 rounded">
                      @type: BreadcrumbList
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Sitemap</CardTitle>
                  <CardDescription className="text-xs">
                    Auto-generated XML sitemap for search engines
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Your sitemap is automatically generated and includes all properties, blog posts, and pages.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/sitemap.xml" target="_blank">
                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                        View Sitemap
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Robots.txt</CardTitle>
                  <CardDescription className="text-xs">
                    Control search engine crawling behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    The robots.txt file tells search engines which pages to crawl and which to skip.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/robots.txt" target="_blank">
                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                        View Robots.txt
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">SEO Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: "Meta titles on all pages", done: true },
                      { label: "Meta descriptions on all pages", done: true },
                      { label: "Open Graph tags configured", done: true },
                      { label: "Schema markup on properties", done: pages.some((p) => p.page_type === "property" && p.schema_markup) },
                      { label: "Schema markup on blogs", done: pages.some((p) => p.page_type === "blog" && p.schema_markup) },
                      { label: "Sitemap submitted to Google", done: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        {item.done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-xs">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

export function Loading() {
  return null
}
