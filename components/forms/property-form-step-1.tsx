"use client"

import { useState, useEffect } from "react"
import { ComboSelect } from "@/components/ui/combo-select"

interface Option {
  _id: string
  name: string
  [key: string]: any
}

export default function PropertyFormStep1({ formData, onChange }: any) {
  const [developers, setDevelopers] = useState<Option[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [loadingDevelopers, setLoadingDevelopers] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)

  useEffect(() => {
    const loadDevelopers = async () => {
      setLoadingDevelopers(true)
      try {
        const res = await fetch("/api/admin/developers")
        const data = await res.json()
        setDevelopers(data)
      } catch (error) {
        console.error("Error loading developers:", error)
      } finally {
        setLoadingDevelopers(false)
      }
    }

    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const res = await fetch("/api/admin/categories")
        const data = await res.json()
        setCategories(data)
      } catch (error) {
        console.error("Error loading categories:", error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadDevelopers()
    loadCategories()
  }, [])

  const handleAddDeveloper = async (name: string): Promise<Option | null> => {
    try {
      const res = await fetch("/api/admin/developers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const newDeveloper = await res.json()
        setDevelopers((prev) => [...prev, newDeveloper].sort((a, b) => a.name.localeCompare(b.name)))
        return newDeveloper
      }
    } catch (error) {
      console.error("Error adding developer:", error)
    }
    return null
  }

  const handleAddCategory = async (name: string): Promise<Option | null> => {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon_class: "building" }),
      })
      if (res.ok) {
        const newCategory = await res.json()
        setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)))
        return newCategory
      }
    } catch (error) {
      console.error("Error adding category:", error)
    }
    return null
  }

  const handleDeveloperChange = (value: string | string[]) => {
    const selectedName = Array.isArray(value) ? value[0] : value
    const selectedDeveloper = developers.find((d) => d.name === selectedName)
    onChange("developer_id", selectedDeveloper?._id || "")
    onChange("developer_name", selectedName || "")
  }

  const handleCategoryChange = (value: string | string[]) => {
    const selectedName = Array.isArray(value) ? value[0] : value
    onChange("category", selectedName || "")
  }

  const selectedDeveloperName = developers.find((d) => d._id === formData.developer_id)?.name || formData.developer_name || ""

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Listing Type</label>
          <select
            value={formData.listing_type || "new"}
            onChange={(e) => onChange("listing_type", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="builder_project">Builder Project</option>
            <option value="new">New</option>
            <option value="resale">Resale</option>
            <option value="rental">Rental</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Property Category</label>
          <select
            value={formData.property_category || "residential"}
            onChange={(e) => onChange("property_category", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="mixed_use">Mixed-use</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Property Name *</label>
          <input
            type="text"
            value={formData.property_name}
            onChange={(e) => onChange("property_name", e.target.value)}
            placeholder="e.g., Modern 3BHK Apartment"
            required
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Property Type</label>
          <select
            value={formData.property_type}
            onChange={(e) => onChange("property_type", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="shop">Shop</option>
            <option value="sco">SCO</option>
            <option value="office">Office</option>
            <option value="commercial">Commercial</option>
            <option value="warehouse">Warehouse</option>
          </select>
        </div>
      </div>

      {/* Category Selection with ComboSelect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComboSelect
          label="Category"
          value={formData.category || ""}
          onChange={handleCategoryChange}
          options={categories}
          onAddNew={handleAddCategory}
          placeholder="Select or add a category..."
          loading={loadingCategories}
        />
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Brand/Collection</label>
          <input
            type="text"
            value={formData.brand_collection || ""}
            onChange={(e) => onChange("brand_collection", e.target.value)}
            placeholder="Brand or collection name"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {formData.listing_type === "builder_project" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComboSelect
              label="Select Developer/Builder"
              value={selectedDeveloperName}
              onChange={handleDeveloperChange}
              options={developers}
              onAddNew={handleAddDeveloper}
              placeholder="Select or add a developer..."
              loading={loadingDevelopers}
            />
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Project Status</label>
              <select
                value={formData.project_status || "launched"}
                onChange={(e) => onChange("project_status", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="launched">Launched</option>
                <option value="under_construction">Under Construction</option>
                <option value="ready_to_move">Ready to Move</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Target Segment</label>
              <select
                value={formData.target_segment || "mid"}
                onChange={(e) => onChange("target_segment", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="luxury">Luxury</option>
                <option value="premium">Premium</option>
                <option value="mid">Mid-Range</option>
                <option value="affordable">Affordable</option>
              </select>
            </div>
          </div>
        </>
      )}

      {(formData.listing_type === "resale" || formData.listing_type === "rental") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Unit Status</label>
            <select
              value={formData.unit_status || "vacant"}
              onChange={(e) => onChange("unit_status", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="leased">Leased</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Age of Property (Years)</label>
            <input
              type="number"
              value={formData.age_of_property || ""}
              onChange={(e) => onChange("age_of_property", e.target.value)}
              placeholder="e.g., 5"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">RERA Registered</label>
          <select
            value={formData.rera_registered ? "yes" : "no"}
            onChange={(e) => onChange("rera_registered", e.target.value === "yes")}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        {formData.rera_registered && (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">RERA ID</label>
              <input
                type="text"
                value={formData.rera_id || ""}
                onChange={(e) => onChange("rera_id", e.target.value)}
                placeholder="RERA registration number"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">RERA Website Link</label>
              <input
                type="url"
                value={formData.rera_website_link || ""}
                onChange={(e) => onChange("rera_website_link", e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Possession Type</label>
          <select
            value={formData.possession_type}
            onChange={(e) => onChange("possession_type", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ready">Ready to Move</option>
            <option value="under_construction">Under Construction</option>
            <option value="resale">Resale</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Possession Date</label>
          <input
            type="date"
            value={formData.possession_date}
            onChange={(e) => onChange("possession_date", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Furnishing Type</label>
          <select
            value={formData.furnished_type}
            onChange={(e) => onChange("furnished_type", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="unfurnished">Unfurnished</option>
            <option value="semi_furnished">Semi-Furnished</option>
            <option value="fully_furnished">Fully Furnished</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Status</label>
          <select
            value={formData.status}
            onChange={(e) => onChange("status", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Short Description</label>
        <textarea
          value={formData.short_description}
          onChange={(e) => onChange("short_description", e.target.value)}
          placeholder="Brief description (50-150 characters)"
          maxLength={150}
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring resize-none h-20"
        />
        <p className="text-xs text-muted-foreground mt-1">{formData.short_description.length}/150</p>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Long Description</label>
        <textarea
          value={formData.long_description}
          onChange={(e) => onChange("long_description", e.target.value)}
          placeholder="Detailed property description"
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring resize-none h-28"
        />
      </div>
    </div>
  )
}
