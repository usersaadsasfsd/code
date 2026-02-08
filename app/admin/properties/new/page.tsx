"use client"

import PropertyFormMultiStep from "@/components/forms/property-form-multistep"
import PageHeader from "@/components/dashboard/page-header"

export default function AdminAddPropertyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Property"
        description="Create a new property listing on the platform"
        showBackButton
        backHref="/admin/properties"
      />
      <PropertyFormMultiStep apiEndpoint="/api/admin/properties" />
    </div>
  )
}
