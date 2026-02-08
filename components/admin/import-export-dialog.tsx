"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Upload, AlertCircle, CheckCircle, Plus, Database, X } from "lucide-react"

interface ValidationReport {
  totalRows: number
  validRows: number
  invalidRows: number
  duplicateRows: number
  warnings: string[]
  errors: any[]
  fieldAccuracy: Record<string, { valid: number; invalid: number; percentage: number }>
}

interface ConfigCreationResult {
  type: "category" | "state" | "amenity" | "developer" | "facility"
  name: string
  isNew: boolean
}

interface ImportResult {
  success: boolean
  insertedCount: number
  skippedCount: number
  totalProcessed: number
  errors?: any[]
  configCreations?: {
    summary: Record<string, string[]>
    totalNewEntries: number
    details: ConfigCreationResult[]
  }
}

export function ImportExportDialog({
  entityType,
  onImportSuccess,
}: { entityType: string; onImportSuccess?: () => void }) {
  const [showImport, setShowImport] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [showImportResult, setShowImportResult] = useState(false)
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("entityType", entityType)

      const res = await fetch("/api/admin/import-export/validate", {
        method: "POST",
        body: formData,
      })

      const report = await res.json()
      setValidationReport(report)
      setShowValidation(true)
    } catch (error) {
      console.error("Validation error:", error)
      alert("Failed to validate file")
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("entityType", entityType)

      const res = await fetch("/api/admin/import-export/import", {
        method: "POST",
        body: formData,
      })

      const result = await res.json()
      setImportResult(result)

      if (result.success) {
        setShowValidation(false)
        setShowImportResult(true)
        onImportSuccess?.()
      } else {
        alert("Import failed")
      }
    } catch (error) {
      console.error("Import error:", error)
      alert("Failed to import file")
    } finally {
      setLoading(false)
    }
  }

  const handleCloseAll = () => {
    setShowImport(false)
    setShowValidation(false)
    setShowImportResult(false)
    setSelectedFile(null)
    setValidationReport(null)
    setImportResult(null)
  }

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      const res = await fetch(`/api/admin/import-export/export?entityType=${entityType}&format=${format}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${entityType}-export.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export file")
    }
  }

  const handleDownloadSample = async (format: "csv" | "xlsx") => {
    try {
      const res = await fetch(`/api/admin/import-export/samples?entityType=${entityType}&format=${format}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${entityType}-sample.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download sample file")
    }
  }

  const getConfigTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      category: "Categories",
      state: "States",
      amenity: "Amenities",
      developer: "Developers",
      facility: "Facilities",
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setShowImport(!showImport)} className="text-xs h-8 gap-2">
          <Upload size={14} />
          Import
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="text-xs h-8 gap-2">
          <Download size={14} />
          CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport("xlsx")} className="text-xs h-8 gap-2">
          <Download size={14} />
          XLSX
        </Button>
      </div>

      {showImport && (
        <Card className="p-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Select CSV or XLSX file</label>
            <input type="file" accept=".csv,.xlsx" onChange={handleFileSelect} className="text-xs" disabled={loading} />
          </div>

          {entityType === "properties" && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Database size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Auto-Configuration</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    New categories, states, amenities, developers, and facilities found in the import file will be
                    automatically added to the system configuration.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Download sample file to see required format:
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownloadSample("csv")}
                className="text-xs h-7 gap-1"
              >
                <Download size={12} />
                CSV Sample
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownloadSample("xlsx")}
                className="text-xs h-7 gap-1"
              >
                <Download size={12} />
                XLSX Sample
              </Button>
            </div>
          </div>
        </Card>
      )}

      {showValidation && validationReport && (
        <Card className="p-4 space-y-4">
          <div className="space-y-3">
            <div
              className="p-3 rounded border-2 flex items-center justify-between"
              style={{
                borderColor: validationReport.invalidRows === 0 ? "#22c55e" : "#ef4444",
                backgroundColor: validationReport.invalidRows === 0 ? "#f0fdf4" : "#fef2f2",
              }}
            >
              <div className="flex items-center gap-2">
                {validationReport.invalidRows === 0 ? (
                  <>
                    <CheckCircle size={18} className="text-green-600" />
                    <div>
                      <p className="text-sm font-bold text-green-700">All records valid</p>
                      <p className="text-xs text-green-600">{validationReport.validRows} records ready to import</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle size={18} className="text-red-600" />
                    <div>
                      <p className="text-sm font-bold text-red-700">
                        Import will skip {validationReport.invalidRows} records
                      </p>
                      <p className="text-xs text-red-600">
                        {validationReport.validRows} valid, {validationReport.invalidRows} rejected
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted rounded">
                <p className="text-muted-foreground text-xs">Total Rows</p>
                <p className="text-lg font-bold">{validationReport.totalRows}</p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                <p className="text-green-700 dark:text-green-300 text-xs">Accepted</p>
                <p className="text-lg font-bold text-green-600">{validationReport.validRows}</p>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-950 rounded">
                <p className="text-red-700 dark:text-red-300 text-xs">Rejected</p>
                <p className="text-lg font-bold text-red-600">{validationReport.invalidRows}</p>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded">
                <p className="text-amber-700 dark:text-amber-300 text-xs">Duplicates</p>
                <p className="text-lg font-bold text-amber-600">{validationReport.duplicateRows}</p>
              </div>
            </div>

            {Object.keys(validationReport.fieldAccuracy).length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold mb-2">Field Accuracy</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Object.entries(validationReport.fieldAccuracy).map(([field, accuracy]) => (
                    <div key={field} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{field}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-1.5">
                          <div
                            className={
                              accuracy.percentage === 100
                                ? "bg-green-600"
                                : accuracy.percentage >= 80
                                  ? "bg-amber-500"
                                  : "bg-red-600"
                            }
                            style={{ width: `${accuracy.percentage}%`, height: "100%", borderRadius: "9999px" }}
                          />
                        </div>
                        <span className="font-semibold min-w-8 text-right">{accuracy.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validationReport.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold mb-2 text-red-600">
                  Errors (showing first 5 of {validationReport.errors.length})
                </p>
                <div className="space-y-1 max-h-24 overflow-y-auto text-xs text-red-600">
                  {validationReport.errors.slice(0, 5).map((error, idx) => (
                    <p key={idx} className="truncate">
                      {error.error || error.errors?.[0]}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              onClick={handleImport}
              disabled={loading || validationReport.validRows === 0}
              className="text-xs h-8"
            >
              {loading ? "Importing..." : `Import ${validationReport.validRows} Records`}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCloseAll} className="text-xs h-8 bg-transparent">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Import Result with Config Creations */}
      {showImportResult && importResult && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-bold text-green-700">Import Successful</p>
                <p className="text-xs text-muted-foreground">
                  {importResult.insertedCount} of {importResult.totalProcessed} records imported
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCloseAll} className="h-8 w-8 p-0">
              <X size={16} />
            </Button>
          </div>

          {/* Config Creations Section */}
          {importResult.configCreations && importResult.configCreations.totalNewEntries > 0 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-md border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-start gap-2 mb-3">
                <Plus size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    New Configuration Entries Created
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {importResult.configCreations.totalNewEntries} new entries were automatically added to the system
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {Object.entries(importResult.configCreations.summary).map(([type, names]) => (
                  <div key={type} className="bg-white/50 dark:bg-black/20 rounded p-2">
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-1.5">
                      {getConfigTypeLabel(type)} ({names.length} new)
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {names.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs rounded"
                        >
                          <Plus size={10} />
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skipped Records */}
          {importResult.skippedCount > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {importResult.skippedCount} Records Skipped
                  </p>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {importResult.errors.slice(0, 3).map((error, idx) => (
                        <p key={idx} className="text-xs text-amber-600 dark:text-amber-400">
                          Row {error.row}: {error.error || error.errors?.[0]}
                        </p>
                      ))}
                      {importResult.errors.length > 3 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          ...and {importResult.errors.length - 3} more errors
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button size="sm" onClick={handleCloseAll} className="text-xs h-8">
              Done
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
