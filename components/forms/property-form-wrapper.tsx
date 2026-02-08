"use client"

import type { ReactNode } from "react"

interface PropertyFormWrapperProps {
  title: string
  description?: string
  children: ReactNode
}

export default function PropertyFormWrapper({ title, description, children }: PropertyFormWrapperProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}
