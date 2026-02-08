"use client"

import { Suspense } from "react"
import SearchContent from "@/components/search/search-content"

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  )
}
