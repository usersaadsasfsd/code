import Header from "@/components/layout/header"
import AdminNav from "@/components/admin/admin-nav"
import SectionPropertyEditor from "@/components/admin/section-property-editor"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Suspense } from "react"
import { ChevronLeft, ArrowLeft, ChevronRight } from "lucide-react"

interface SectionData {
  _id: string
  title: string
  subtitle?: string
  section_type: string
  display_limit: number
  property_ids?: string[]
  is_active: boolean
}

async function SectionHeader({ sectionId }: { sectionId: string }) {
  const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fetchUrl = `${baseUrl}/api/admin/homepage-sections/${sectionId}`
  
  try {
    console.log("[v0] SectionHeader: sectionId =", sectionId)
    console.log("[v0] SectionHeader: baseUrl =", baseUrl)
    console.log("[v0] SectionHeader: fetchUrl =", fetchUrl)
    
    const res = await fetch(fetchUrl, {
      cache: "no-store",
    })
    
    console.log("[v0] SectionHeader: fetch status =", res.status)

    if (res.status === 404) {
      const errorData = await res.json().catch(() => ({}))
      console.log("[v0] SectionHeader: 404 error data =", errorData)
      
      return (
        <div className="border-2 border-dashed rounded-lg p-8 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Section Not Found</h1>
              <p className="text-sm text-muted-foreground mt-2">
                This section doesn't exist yet. Please initialize the default sections to get started.
              </p>
              <Button asChild variant="default">
                <Link href="/api/admin/homepage-sections/initialize">
                  Initialize Default Sections
                </Link>
              </Button>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/homepage-sections">
                <ChevronRight size={16} className="mr-2" />
                Back to Sections
              </Link>
            </Button>
          </div>
        </div>
      )
    }

    if (!res.ok) {
      return (
        <div className="border-2 border-dashed rounded-lg p-8 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Error Loading Section</h1>
              <p className="text-sm text-muted-foreground mt-2">
                An error occurred while loading this section. Please try again.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/homepage-sections">Back</Link>
            </Button>
          </div>
        </div>
      )
    }

    const section: SectionData = await res.json()

    if (!section || typeof section !== "object") {
      return (
        <div className="border-2 border-dashed rounded-lg p-8 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Invalid Section Data</h1>
              <p className="text-sm text-muted-foreground mt-2">
                The section data is invalid. Please try again.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/homepage-sections">Back</Link>
            </Button>
          </div>
        </div>
      )
    }

    const propertyCount = Array.isArray(section.property_ids) ? section.property_ids.length : 0
    const displayLimit = section.display_limit || 0
    const title = section.title || "Section"
    const subtitle = section.subtitle || ""
    const sectionType = section.section_type || "unknown"
    const isActive = section.is_active !== false

    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2">
          <Link href="/admin/homepage-sections">
            <ArrowLeft size={16} className="mr-1" />
            Back to sections
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
              }`}>
                {isActive ? "Active" : "Hidden"}
              </span>
            </div>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium">
                {sectionType.replace(/_/g, " ")}
              </span>
              <span>
                <strong className="text-foreground">{propertyCount}</strong> / {displayLimit} properties
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Error loading section header:", error)
    return (
      <div className="border-2 border-dashed rounded-lg p-8 bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Error Loading Section</h1>
            <p className="text-sm text-muted-foreground mt-2">
              An unexpected error occurred. Please return to sections and try again.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/homepage-sections">Back</Link>
          </Button>
        </div>
      </div>
    )
  }
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function SectionDetailsPage({ params }: Props) {
  // CRITICAL: Await params before accessing properties (Next.js 16)
  const resolvedParams = await params
  const sectionId = resolvedParams.id

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="flex flex-col md:flex-row">
          <AdminNav />

          <div className="flex-1 px-4 py-8 md:py-12">
            <div className="max-w-7xl mx-auto space-y-6">
              <Suspense fallback={<div className="text-muted-foreground">Loading section...</div>}>
                <SectionHeader sectionId={sectionId} />
              </Suspense>

              <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading properties...</div>}>
                <SectionPropertyEditor sectionId={sectionId} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
