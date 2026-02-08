"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Eye, Plus, RefreshCw, Building2, Link2 } from "lucide-react";
import { ImportExportDialog } from "@/components/admin/import-export-dialog";
import { useToast } from "@/hooks/use-toast";
import { PropertyFilters } from "@/components/admin/property-filters";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatPriceRange } from "@/lib/utils";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const { toast } = useToast();
  const allSelected = properties.length > 0 && selected.length === properties.length;
  const [filters, setFilters] = useState<any>({});

  const buildQuery = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.property_type) params.append("category", filters.property_type);
    if (filters.status) params.append("status", filters.status);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.listing_type) params.append("listing_type", filters.listing_type);
    if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);
    if (filters.city) params.append("city", filters.city);
    if (filters.developer) params.append("developer", filters.developer);
    params.append("limit", "100");
    return params.toString();
  };

  const loadProperties = async (newFilters = filters) => {
    setLoading(true);
    try {
      const query = buildQuery(newFilters);
      const res = await fetch(`/api/admin/properties?${query}`);
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("[v0] Error loading properties:", error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    loadProperties(newFilters);
  };

  const handleDelete = async (id: string, showConfirm = true) => {
    if (showConfirm && !confirm("Are you sure you want to delete this property?")) {
      return;
    }
    
    try {
      console.log("[v0] Deleting property with id:", id)
      const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" })
      console.log("[v0] Delete response status:", res.status)
      
      if (res.ok) {
        setProperties(properties.filter((p) => p._id !== id))
        toast({
          title: "Success",
          description: "Property deleted successfully",
        })
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error("[v0] Delete error:", res.status, errorData)
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete property",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting property:", error)
      toast({
        title: "Error",
        description: "Error deleting property. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Bulk delete action
  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} selected properties?`)) return;
    
    let successCount = 0;
    let failCount = 0;
    
    for (const id of selected) {
      try {
        const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" })
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }
    
    if (successCount > 0) {
      await loadProperties();
      toast({
        title: "Bulk Delete Complete",
        description: `Deleted ${successCount} properties${failCount > 0 ? `, ${failCount} failed` : ""}`,
      })
    }
    
    setSelected([]);
  };

  // Regenerate slugs for properties missing them
  const handleRegenerateSlugs = async () => {
    try {
      const res = await fetch("/api/admin/properties/regenerate-slugs", { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        toast({
          title: "Success",
          description: data.message || `Regenerated slugs for ${data.updatedCount} properties`,
        });
        await loadProperties();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to regenerate slugs",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error regenerating slugs",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties Management"
        description="Manage all properties on the platform"
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadProperties()}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/properties/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        <PropertyFilters onChange={handleFilterChange} initial={filters} />
        <div className="flex items-center gap-2 flex-wrap">
          <ImportExportDialog entityType="properties" onImportSuccess={loadProperties} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerateSlugs}
            className="bg-transparent text-xs"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Fix Missing Slugs
          </Button>
        </div>

        {/* Bulk actions toolbar */}
        {selected.length > 0 && (
          <div className="flex items-center gap-4 bg-muted/40 border border-border rounded-lg px-4 py-2 mb-2">
            <span className="text-xs">{selected.length} selected</span>
            <Button size="sm" variant="destructive" className="text-xs h-7" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
            {/* Add more bulk actions here */}
          </div>
        )}

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-semibold w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => setSelected(e.target.checked ? properties.map((p) => p._id) : [])}
                  />
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold">Thumbnail</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Property Name</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Location</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Price</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No properties found</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {Object.keys(filters).length > 0 
                        ? "Try adjusting your filters to see more results" 
                        : "Get started by adding your first property"}
                    </p>
                    {Object.keys(filters).length === 0 && (
                      <Button asChild size="sm" className="mt-4">
                        <Link href="/admin/properties/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Property
                        </Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                properties.map((property: any) => {
                  const isChecked = selected.includes(property._id);
                  return (
                    <tr key={property._id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-2 py-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            setSelected(
                              e.target.checked
                                ? [...selected, property._id]
                                : selected.filter((id) => id !== property._id)
                            );
                          }}
                        />
                      </td>
                      <td className="px-2 py-2">
                        {property.main_thumbnail ? (
                          <img
                            src={property.main_thumbnail || "/placeholder.svg"}
                            alt="thumbnail"
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs font-medium">{property.property_name}</td>
                      <td className="px-4 py-2 text-xs">{property.city}</td>
                      <td className="px-4 py-2 text-xs">{property.price_range || formatPriceRange(property.lowest_price, property.max_price)}</td>
                      <td className="px-4 py-2 text-xs">{property.property_type || "-"}</td>
                      <td className="px-4 py-2 text-xs">
                        <div className="flex gap-2">
                          <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                            <Link href={`/properties/${property.slug || property._id}`}>
                              <Eye size={14} />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                            <Link href={`/admin/properties/${property._id}/edit`}>
                              <Edit2 size={14} />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleDelete(property._id)}
                          >
                            <Trash2 size={14} className="text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
