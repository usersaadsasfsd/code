"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Building2, Award } from "lucide-react"

export default function FeaturedDevelopers() {
  const [developers, setDevelopers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const response = await fetch("/api/admin/developers?limit=6")
        const data = await response.json()
        setDevelopers(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching developers:", error)
        setDevelopers([])
      } finally {
        setLoading(false)
      }
    }

    fetchDevelopers()
  }, [])

  if (loading || developers.length === 0) return null

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Award className="text-primary" size={24} />
            <span className="text-primary font-semibold">Trusted Partners</span>
          </div>
          <h2 className="text-primary mb-4">Featured Developers & Builders</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Partner with India's leading real estate developers
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {developers.slice(0, 6).map((developer: any) => (
            <Link
              key={developer._id}
              href={`/properties?developer_id=${developer._id}`}
              className="bg-muted/50 rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center"
            >
              {developer.logo_url ? (
                <img
                  src={developer.logo_url || "/placeholder.svg"}
                  alt={developer.name}
                  className="w-full h-16 object-contain mb-3 grayscale hover:grayscale-0 transition-all"
                />
              ) : (
                <Building2
                  size={48}
                  className="text-muted-foreground mb-3 hover:text-primary transition-colors"
                />
              )}
              <p className="text-sm font-medium text-center text-foreground line-clamp-2">{developer.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
