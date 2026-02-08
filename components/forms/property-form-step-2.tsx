"use client"

import { formatPriceToIndian } from "@/lib/utils"

export default function PropertyFormStep2({ formData, onChange }: any) {
  // Helper to display formatted price preview
  const getPricePreview = (value: number | string | undefined) => {
    if (!value) return ""
    const numValue = typeof value === "string" ? parseFloat(value) : value
    if (isNaN(numValue) || numValue === 0) return ""
    return formatPriceToIndian(numValue)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Pricing & Dimensions</h3>
      </div>

      {formData.listing_type === "rental" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Monthly Rent (₹)</label>
              <input
                type="number"
                value={formData.monthly_rent || ""}
                onChange={(e) => onChange("monthly_rent", e.target.value)}
                placeholder="e.g., 25000"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Security Deposit (₹)</label>
              <input
                type="number"
                value={formData.security_deposit || ""}
                onChange={(e) => onChange("security_deposit", e.target.value)}
                placeholder="e.g., 50000"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Lock-in Period</label>
              <input
                type="text"
                value={formData.lock_in_period || ""}
                onChange={(e) => onChange("lock_in_period", e.target.value)}
                placeholder="e.g., 11 months"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Maintenance Charge (₹)</label>
              <input
                type="number"
                value={formData.maintenance_charge || ""}
                onChange={(e) => onChange("maintenance_charge", e.target.value)}
                placeholder="e.g., 3000"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Lowest Price (₹)</label>
              <input
                type="number"
                value={formData.lowest_price}
                onChange={(e) => onChange("lowest_price", e.target.value)}
                placeholder="e.g., 5000000"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {formData.lowest_price && (
                <p className="text-xs text-primary mt-1 font-medium">
                  Display: ₹{getPricePreview(formData.lowest_price)}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Maximum Price (₹)</label>
              <input
                type="number"
                value={formData.max_price}
                onChange={(e) => onChange("max_price", e.target.value)}
                placeholder="e.g., 7000000"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {formData.max_price && (
                <p className="text-xs text-primary mt-1 font-medium">
                  Display: ₹{getPricePreview(formData.max_price)}
                </p>
              )}
            </div>
          </div>

          {formData.listing_type === "builder_project" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Booking Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.booking_amount || ""}
                    onChange={(e) => onChange("booking_amount", e.target.value)}
                    placeholder="e.g., 100000"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Payment Plan</label>
                  <select
                    value={formData.payment_plan || "clp"}
                    onChange={(e) => onChange("payment_plan", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="clp">Construction Linked Plan</option>
                    <option value="possession_linked">Possession Linked</option>
                    <option value="down_payment">Down Payment</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Offers/Discounts</label>
                <input
                  type="text"
                  value={formData.offers_discounts || ""}
                  onChange={(e) => onChange("offers_discounts", e.target.value)}
                  placeholder="e.g., Early bird discount 5%"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </>
          )}
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            {formData.listing_type === "builder_project" ? "Super Area (Sq Ft)" : "Area (Sq Ft)"}
          </label>
          <input
            type="number"
            value={formData.area_sqft}
            onChange={(e) => onChange("area_sqft", e.target.value)}
            placeholder="e.g., 1500"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Property Size</label>
          <input
            type="text"
            value={formData.property_size}
            onChange={(e) => onChange("property_size", e.target.value)}
            placeholder="e.g., 1500 Sq Ft"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {(formData.listing_type === "resale" || formData.listing_type === "rental") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Carpet Area (Sq Ft)</label>
            <input
              type="number"
              value={formData.carpet_area || ""}
              onChange={(e) => onChange("carpet_area", e.target.value)}
              placeholder="e.g., 1200"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Built-Up Area (Sq Ft)</label>
            <input
              type="number"
              value={formData.built_up_area || ""}
              onChange={(e) => onChange("built_up_area", e.target.value)}
              placeholder="e.g., 1350"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Direction Facing</label>
            <select
              value={formData.direction_facing || ""}
              onChange={(e) => onChange("direction_facing", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
              <option value="north_east">North-East</option>
              <option value="north_west">North-West</option>
              <option value="south_east">South-East</option>
              <option value="south_west">South-West</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(formData.listing_type === "resale" || formData.listing_type === "rental") && (
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">BHK Configuration</label>
            <input
              type="text"
              value={formData.bhk_configuration || ""}
              onChange={(e) => onChange("bhk_configuration", e.target.value)}
              placeholder="e.g., 3BHK"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Bedrooms</label>
          <input
            type="number"
            value={formData.bedrooms}
            onChange={(e) => onChange("bedrooms", e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Bathrooms</label>
          <input
            type="number"
            value={formData.bathrooms}
            onChange={(e) => onChange("bathrooms", e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Balconies</label>
          <input
            type="number"
            value={formData.balconies_count || ""}
            onChange={(e) => onChange("balconies_count", e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Floor Number</label>
          <input
            type="number"
            value={formData.floor_number}
            onChange={(e) => onChange("floor_number", e.target.value)}
            placeholder="e.g., 5"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Total Floors</label>
          <input
            type="number"
            value={formData.total_floors}
            onChange={(e) => onChange("total_floors", e.target.value)}
            placeholder="e.g., 20"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Parking Type</label>
          <select
            value={formData.parking_type}
            onChange={(e) => onChange("parking_type", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="open">Open</option>
            <option value="covered">Covered</option>
            <option value="basement">Basement</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Parking Count</label>
        <input
          type="number"
          value={formData.parking_count}
          onChange={(e) => onChange("parking_count", e.target.value)}
          placeholder="Number of parking spaces"
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {formData.listing_type === "builder_project" && (
        <>
          <div className="border-t border-border pt-4 mt-4">
            <h4 className="font-semibold mb-3">Project Master Data</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Total Towers</label>
                <input
                  type="number"
                  value={formData.total_towers || ""}
                  onChange={(e) => onChange("total_towers", e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Total Units</label>
                <input
                  type="number"
                  value={formData.total_units || ""}
                  onChange={(e) => onChange("total_units", e.target.value)}
                  placeholder="e.g., 500"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Total Acreage</label>
                <input
                  type="text"
                  value={formData.total_acreage || ""}
                  onChange={(e) => onChange("total_acreage", e.target.value)}
                  placeholder="e.g., 10 acres"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
