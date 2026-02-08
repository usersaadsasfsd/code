"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, FileUp, BarChart3, Download } from "lucide-react"

interface ValidationReport {
  totalRows: number
  validRows: number
  invalidRows: number
  duplicateRows: number
  warnings: string[]
  errors: any[]
  fieldAccuracy: Record<string, { valid: number; invalid: number; percentage: number }>
}

const ENTITY_TYPES = [
  { value: "properties", label: "Properties" },
  { value: "categories", label: "Categories" },
  { value: "states", label: "States" },
  { value: "amenities", label: "Amenities" },
  { value: "developers", label: "Developers" },
  { value: "facilities", label: "Facilities" },
]

export default function ImportExportPage() {
  const [selectedEntityType, setSelectedEntityType] = useState("categories")
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("entityType", selectedEntityType)

      const res = await fetch("/api/admin/import-export/validate", {
        method: "POST",
        body: formData,
      })

      const report = await res.json()
      setValidationReport(report)
    } catch (error) {
      console.error("[v0] Validation error:", error)
      toast({
        title: "Error",
        description: "Failed to validate file",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadSample = async (format: "csv" | "xlsx") => {
    try {
      const res = await fetch(`/api/admin/import-export/samples?entityType=${selectedEntityType}&format=${format}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${selectedEntityType}-sample.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("[v0] Download error:", error)
      toast({
        title: "Error",
        description: "Failed to download sample file",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Import/Export Manager</h1>
          <p className="text-sm text-muted-foreground">Validate and manage bulk imports for all listing features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileUp size={20} />
              Validate File
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">Entity Type</label>
                <select
                  value={selectedEntityType}
                  onChange={(e) => setSelectedEntityType(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded text-xs bg-background"
                >
                  {ENTITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">Select CSV or XLSX file</label>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileSelect}
                  className="text-xs w-full"
                  disabled={loading}
                />
              </div>

              {loading && <p className="text-xs text-muted-foreground">Validating file...</p>}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Download size={20} />
              Download Sample
            </h2>

            <p className="text-xs text-muted-foreground">
              Download a sample file to see the required format and fields
            </p>

            <div className="space-y-2">
              <Button
                onClick={() => downloadSample("csv")}
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 gap-2"
              >
                <Download size={14} />
                CSV Sample
              </Button>
              <Button
                onClick={() => downloadSample("xlsx")}
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 gap-2"
              >
                <Download size={14} />
                XLSX Sample
              </Button>
            </div>
          </Card>

          {validationReport && (
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <BarChart3 size={20} />
                Report
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="text-lg font-bold">{validationReport.totalRows}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded">
                  <span className="text-xs text-green-700 dark:text-green-300 font-semibold">Valid</span>
                  <span className="text-lg font-bold text-green-600">{validationReport.validRows}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded">
                  <span className="text-xs text-red-700 dark:text-red-300 font-semibold">Invalid</span>
                  <span className="text-lg font-bold text-red-600">{validationReport.invalidRows}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {validationReport.invalidRows === 0 ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-xs text-green-600 font-semibold">Ready to import</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-red-600" />
                    <span className="text-xs text-red-600 font-semibold">Fix errors first</span>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>

        {validationReport && Object.keys(validationReport.fieldAccuracy).length > 0 && (
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Field Accuracy Analysis</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(validationReport.fieldAccuracy).map(([field, accuracy]) => (
                <div key={field} className="space-y-2 p-3 border border-border rounded">
                  <p className="text-xs font-semibold text-foreground">{field}</p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Valid: {accuracy.valid}</span>
                      <span className="font-semibold">{accuracy.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-600 h-full rounded-full transition-all"
                        style={{ width: `${accuracy.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {validationReport && validationReport.errors.length > 0 && (
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertCircle size={20} className="text-red-600" />
              Errors Found (showing first 20)
            </h2>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {validationReport.errors.slice(0, 20).map((error, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800"
                >
                  <p className="text-xs font-semibold text-red-700 dark:text-red-300">{error.fieldName}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error.error}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
