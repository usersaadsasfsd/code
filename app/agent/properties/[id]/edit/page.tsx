"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import AgentDashboardNav from "@/components/agent/agent-dashboard-nav"
import PropertyFormWrapper from "@/components/forms/property-form-wrapper"
import PropertyFormMultiStep from "@/components/forms/property-form-multistep"

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const res = await fetch(`/api/agent/properties/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setInitialData(data)
        } else {
          console.error("[v0] Failed to fetch property data")
          router.push("/agent/properties")
        }
      } catch (error) {
        console.error("[v0] Error loading property:", error)
        router.push("/agent/properties")
      } finally {
        setLoading(false)
      }
    }
    loadProperty()
  }, [params.id, router])

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading property...</div>
        </main>
        <Footer />
      </>
    )
  }

  if (!initialData) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Property not found</div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="flex flex-col md:flex-row">
          <AgentDashboardNav />

          <div className="flex-1 px-4 py-8 md:py-12">
            <PropertyFormWrapper title="Edit Property" description="Update the details of your property listing">
              <PropertyFormMultiStep
                apiEndpoint={`/api/agent/properties/${params.id}`}
                initialData={initialData}
                isEdit={true}
              />
            </PropertyFormWrapper>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
