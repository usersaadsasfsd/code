"use client"

import { useState, useEffect } from "react"
import { ComboSelect, MultiComboSelect } from "@/components/ui/combo-select"

interface Option {
  _id: string
  name: string
  [key: string]: any
}

export default function PropertyFormStep3({ formData, onChange }: any) {
  const [states, setStates] = useState<Option[]>([])
  const [amenities, setAmenities] = useState<Option[]>([])
  const [facilities, setFacilities] = useState<Option[]>([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingAmenities, setLoadingAmenities] = useState(false)
  const [loadingFacilities, setLoadingFacilities] = useState(false)

  useEffect(() => {
    const loadStates = async () => {
      setLoadingStates(true)
      try {
        const res = await fetch("/api/admin/states")
        const data = await res.json()
        setStates(data)
      } catch (error) {
        console.error("Error loading states:", error)
      } finally {
        setLoadingStates(false)
      }
    }

    const loadAmenities = async () => {
      setLoadingAmenities(true)
      try {
        const res = await fetch("/api/admin/amenities")
        const data = await res.json()
        setAmenities(data)
      } catch (error) {
        console.error("Error loading amenities:", error)
      } finally {
        setLoadingAmenities(false)
      }
    }

    const loadFacilities = async () => {
      setLoadingFacilities(true)
      try {
        const res = await fetch("/api/admin/facilities")
        const data = await res.json()
        setFacilities(data)
      } catch (error) {
        console.error("Error loading facilities:", error)
      } finally {
        setLoadingFacilities(false)
      }
    }

    loadStates()
    loadAmenities()
    loadFacilities()
  }, [])

  const handleAddState = async (name: string): Promise<Option | null> => {
    try {
      const res = await fetch("/api/admin/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const newState = await res.json()
        setStates((prev) => [...prev, newState].sort((a, b) => a.name.localeCompare(b.name)))
        return newState
      }
    } catch (error) {
      console.error("Error adding state:", error)
    }
    return null
  }

  const handleAddAmenity = async (name: string): Promise<Option | null> => {
    try {
      const res = await fetch("/api/admin/amenities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon_class: "check" }),
      })
      if (res.ok) {
        const newAmenity = await res.json()
        setAmenities((prev) => [...prev, newAmenity].sort((a, b) => a.name.localeCompare(b.name)))
        return newAmenity
      }
    } catch (error) {
      console.error("Error adding amenity:", error)
    }
    return null
  }

  const handleAddFacility = async (name: string): Promise<Option | null> => {
    try {
      const res = await fetch("/api/admin/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon_class: "building" }),
      })
      if (res.ok) {
        const newFacility = await res.json()
        setFacilities((prev) => [...prev, newFacility].sort((a, b) => a.name.localeCompare(b.name)))
        return newFacility
      }
    } catch (error) {
      console.error("Error adding facility:", error)
    }
    return null
  }

  const handleStateChange = (value: string | string[]) => {
    const selectedName = Array.isArray(value) ? value[0] : value
    onChange("state", selectedName || "")
  }

  const handleAmenitiesChange = (value: string[]) => {
    onChange("amenities", value)
  }

  const handleFacilitiesChange = (value: string[]) => {
    onChange("facilities", value)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Location & Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Country</label>
          <input
            type="text"
            value={formData.country || "India"}
            onChange={(e) => onChange("country", e.target.value)}
            placeholder="Country"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Google Map Link</label>
          <input
            type="url"
            value={formData.google_map_link || ""}
            onChange={(e) => onChange("google_map_link", e.target.value)}
            placeholder="https://maps.google.com/..."
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Address</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Street address"
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="City"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <ComboSelect
          label="State"
          value={formData.state || ""}
          onChange={handleStateChange}
          options={states}
          onAddNew={handleAddState}
          placeholder="Select or add a state..."
          loading={loadingStates}
        />
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Postal Code</label>
          <input
            type="text"
            value={formData.postal_code}
            onChange={(e) => onChange("postal_code", e.target.value)}
            placeholder="Postal code"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Locality</label>
          <input
            type="text"
            value={formData.neighborhood}
            onChange={(e) => onChange("neighborhood", e.target.value)}
            placeholder="Locality or neighborhood"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Landmark</label>
          <input
            type="text"
            value={formData.landmark || ""}
            onChange={(e) => onChange("landmark", e.target.value)}
            placeholder="Nearby landmark"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Amenities with MultiComboSelect */}
      <div className="pt-2">
        <MultiComboSelect
          label="Amenities"
          value={formData.amenities || []}
          onChange={handleAmenitiesChange}
          options={amenities}
          onAddNew={handleAddAmenity}
          placeholder="Select or add amenities..."
          loading={loadingAmenities}
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Select from existing amenities or type to add new ones
        </p>
      </div>

      {/* Facilities with MultiComboSelect */}
      <div className="pt-2">
        <MultiComboSelect
          label="Facilities"
          value={formData.facilities || []}
          onChange={handleFacilitiesChange}
          options={facilities}
          onAddNew={handleAddFacility}
          placeholder="Select or add facilities..."
          loading={loadingFacilities}
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Select from existing facilities or type to add new ones
        </p>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Luxury Amenities</label>
        <textarea
          placeholder="Premium amenities (e.g., Private Elevator, Home Theater, Jacuzzi)"
          value={formData.luxury_amenities.join(", ")}
          onChange={(e) =>
            onChange(
              "luxury_amenities",
              e.target.value.split(",").map((a) => a.trim()),
            )
          }
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring resize-none h-20"
        />
      </div>

      {(formData.listing_type === "resale" || formData.listing_type === "rental") && (
        <div className="border-t border-border pt-4 mt-4">
          <h4 className="font-semibold mb-3">Unit Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: "modular_kitchen", label: "Modular Kitchen" },
              { key: "wardrobes", label: "Wardrobes" },
              { key: "acs", label: "Air Conditioners" },
              { key: "home_automation", label: "Home Automation" },
              { key: "servant_room", label: "Servant Room" },
              { key: "study_room", label: "Study Room" },
            ].map((feature) => (
              <label key={feature.key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.unit_features?.[feature.key] || false}
                  onChange={(e) =>
                    onChange("unit_features", {
                      ...formData.unit_features,
                      [feature.key]: e.target.checked,
                    })
                  }
                  className="rounded border-border"
                />
                <span>{feature.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
