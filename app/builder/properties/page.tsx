"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function PropertiesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">My Properties</h1>
          <p className="text-muted-foreground">Manage all your property listings</p>
        </div>
        <Button asChild className="text-sm h-9">
          <Link href="/builder/properties/new">
            <Plus size={16} className="mr-2" />
            Add Property
          </Link>
        </Button>
      </div>

      <div className="border border-border rounded-lg p-8 bg-card text-center">
        <p className="text-muted-foreground">No properties listed yet. Create your first property listing!</p>
      </div>
    </div>
  )
}
