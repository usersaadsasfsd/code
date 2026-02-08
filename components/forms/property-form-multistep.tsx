"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import PropertyFormStep1 from "./property-form-step-1"
import PropertyFormStep2 from "./property-form-step-2"
import PropertyFormStep3 from "./property-form-step-3"
import PropertyFormStep4 from "./property-form-step-4"

export default function PropertyFormMultiStep({
  apiEndpoint = "/api/agent/properties",
  initialData,
  isEdit = false,
  onSubmit, // Declare the onSubmit variable here
}: {
  apiEndpoint?: string
  initialData?: any
  isEdit?: boolean
  onSubmit?: () => Promise<void> // Declare the type of onSubmit
}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const defaultFormData = {
    property_name: "",
    property_type: "apartment",
    listing_type: "new",
    property_category: "residential",
    short_description: "",
    long_description: "",
    lowest_price: "",
    max_price: "",
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    parking_type: "open",
    parking_count: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    status: "active",
    furnished_type: "unfurnished",
    floor_number: "",
    total_floors: "",
    possession: "",
    possession_type: "ready",
    possession_date: "",
    neighborhood: "",
    amenities: [] as string[],
    facilities: [] as string[],
    luxury_amenities: [] as string[],
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
    main_banner: "",
    main_thumbnail: "",
    multiple_images: [] as string[],
    floor_plans: [] as string[],
    master_plan: "",
    rera_registered: false,
    balconies_count: "",
  }
  
  // Merge initial data with defaults to ensure all fields exist
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return { ...defaultFormData, ...initialData }
    }
    return defaultFormData
  })

  const handleStepChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const method = isEdit ? "PUT" : "POST"
      
      // Clean up the form data - remove _id for updates (it's in the URL)
      // and convert numeric strings to numbers
      const cleanedData: Record<string, any> = {}
      
      for (const [key, value] of Object.entries(formData)) {
        // Skip _id field for updates - it's already in the API endpoint URL
        if (key === "_id") continue
        
        // Convert numeric string fields to numbers
        const numericFields = [
          "lowest_price", "max_price", "bedrooms", "bathrooms", "area_sqft",
          "parking_count", "floor_number", "total_floors", "balconies_count",
          "carpet_area", "built_up_area", "super_area", "total_towers",
          "total_units", "floors_per_tower", "total_acreage", "open_area_percentage",
          "clubhouse_size", "booking_amount", "latitude", "longitude"
        ]
        
        if (numericFields.includes(key) && value !== "" && value !== null && value !== undefined) {
          const num = Number(value)
          cleanedData[key] = isNaN(num) ? value : num
        } else if (value !== undefined) {
          cleanedData[key] = value
        }
      }
      
      const res = await fetch(apiEndpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        const slug = data.property?.slug || data.slug || cleanedData.slug
        const id = data.property?._id || data._id
        
        // Redirect to property view page
        router.push(`/properties/${slug || id}`)
      } else {
        alert(`Error saving property: ${data.error || data.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("[v0] Error submitting property:", error)
      alert(`Error saving property: ${error instanceof Error ? error.message : "Network error"}`)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Pricing & Size" },
    { number: 3, title: "Location" },
    { number: 4, title: "Media & SEO" },
  ]

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step.number < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.number === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step.number < currentStep ? <Check size={18} /> : step.number}
              </div>
              <div className="ml-3 text-sm font-medium">{step.title}</div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${step.number < currentStep ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        {currentStep === 1 && <PropertyFormStep1 formData={formData} onChange={handleStepChange} />}
        {currentStep === 2 && <PropertyFormStep2 formData={formData} onChange={handleStepChange} />}
        {currentStep === 3 && <PropertyFormStep3 formData={formData} onChange={handleStepChange} />}
        {currentStep === 4 && <PropertyFormStep4 formData={formData} onChange={handleStepChange} />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between">
        <Button onClick={handlePrev} variant="outline" disabled={currentStep === 1} className="px-6 bg-transparent">
          <ArrowLeft size={16} className="mr-2" />
          Previous
        </Button>

        {currentStep === 4 ? (
          <Button onClick={handleSubmit} disabled={loading} className="px-8">
            {loading ? "Submitting..." : "Publish Property"}
          </Button>
        ) : (
          <Button onClick={handleNext} className="px-6">
            Next
            <ArrowRight size={16} className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
