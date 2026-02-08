"use client"

import PropertyFormWrapper from "@/components/forms/property-form-wrapper"
import PropertyFormMultiStep from "@/components/forms/property-form-multistep"

export default function AgentAddPropertyPage() {
  return (
    <PropertyFormWrapper
      title="List New Property"
      description="Fill in the details to add your property to CountryRoof"
    >
      <PropertyFormMultiStep apiEndpoint="/api/agent/properties" />
    </PropertyFormWrapper>
  )
}
