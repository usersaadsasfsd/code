"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, Plus, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  _id: string
  name: string
  [key: string]: any
}

interface ComboSelectProps {
  value: string | string[]
  onChange: (value: string | string[]) => void
  options: Option[]
  onAddNew: (name: string) => Promise<Option | null>
  placeholder?: string
  label?: string
  multiple?: boolean
  loading?: boolean
  className?: string
  disabled?: boolean
}

export function ComboSelect({
  value,
  onChange,
  options,
  onAddNew,
  placeholder = "Select or add new...",
  label,
  multiple = false,
  loading = false,
  className,
  disabled = false,
}: ComboSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [addedNotification, setAddedNotification] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Clear notification after delay
  useEffect(() => {
    if (addedNotification) {
      const timer = setTimeout(() => setAddedNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [addedNotification])

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isValueSelected = (optionName: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionName)
    }
    return value === optionName
  }

  const handleSelect = (optionName: string) => {
    if (multiple && Array.isArray(value)) {
      if (value.includes(optionName)) {
        onChange(value.filter((v) => v !== optionName))
      } else {
        onChange([...value, optionName])
      }
    } else {
      onChange(optionName)
      setIsOpen(false)
      setSearchTerm("")
    }
  }

  const handleAddNew = async () => {
    if (!searchTerm.trim()) return

    const existingOption = options.find(
      (opt) => opt.name.toLowerCase() === searchTerm.trim().toLowerCase()
    )
    
    if (existingOption) {
      handleSelect(existingOption.name)
      return
    }

    setIsAdding(true)
    try {
      const newOption = await onAddNew(searchTerm.trim())
      if (newOption) {
        handleSelect(newOption.name)
        setAddedNotification(`"${newOption.name}" added to configuration`)
        setSearchTerm("")
      }
    } catch (error) {
      console.error("Failed to add new option:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      e.preventDefault()
      const exactMatch = options.find(
        (opt) => opt.name.toLowerCase() === searchTerm.trim().toLowerCase()
      )
      if (exactMatch) {
        handleSelect(exactMatch.name)
      } else {
        handleAddNew()
      }
    }
    if (e.key === "Escape") {
      setIsOpen(false)
      setSearchTerm("")
    }
  }

  const removeTag = (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((v) => v !== tagName))
    }
  }

  const displayValue = multiple && Array.isArray(value) ? value : value ? [value as string] : []
  const showAddButton = searchTerm.trim() && !filteredOptions.some(
    (opt) => opt.name.toLowerCase() === searchTerm.trim().toLowerCase()
  )

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
          {label}
        </label>
      )}

      {/* Selected Tags (for multiple) */}
      {multiple && displayValue.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {displayValue.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md"
            >
              {tag}
              <button
                type="button"
                onClick={(e) => removeTag(tag, e)}
                className="hover:bg-primary/20 rounded p-0.5"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Main Input */}
      <div
        onClick={() => !disabled && setIsOpen(true)}
        className={cn(
          "flex items-center justify-between px-3 py-2 border border-border rounded-md bg-input cursor-pointer transition-colors",
          isOpen && "ring-1 ring-ring",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm outline-none"
            autoFocus
          />
        ) : (
          <span className={cn("text-sm", !displayValue.length && "text-muted-foreground")}>
            {!multiple && displayValue.length > 0 ? displayValue[0] : placeholder}
          </span>
        )}
        <div className="flex items-center gap-1.5 ml-2">
          {loading && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
          <ChevronDown
            size={16}
            className={cn(
              "text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={18} className="animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading options...</span>
            </div>
          ) : (
            <>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option._id}
                    onClick={() => handleSelect(option.name)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors",
                      isValueSelected(option.name) && "bg-primary/5"
                    )}
                  >
                    <span>{option.name}</span>
                    {isValueSelected(option.name) && (
                      <Check size={14} className="text-primary" />
                    )}
                  </div>
                ))
              ) : searchTerm ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No matching options found
                </div>
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No options available
                </div>
              )}

              {/* Add New Option Button */}
              {showAddButton && (
                <div
                  onClick={handleAddNew}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors border-t border-border text-primary"
                >
                  {isAdding ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Add "{searchTerm.trim()}"</span>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Added Notification */}
      {addedNotification && (
        <div className="absolute -bottom-7 left-0 text-xs text-emerald-600 flex items-center gap-1">
          <Check size={12} />
          {addedNotification}
        </div>
      )}
    </div>
  )
}

interface MultiComboSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  options: Option[]
  onAddNew: (name: string) => Promise<Option | null>
  placeholder?: string
  label?: string
  loading?: boolean
  className?: string
  disabled?: boolean
}

export function MultiComboSelect({
  value = [],
  onChange,
  options,
  onAddNew,
  placeholder = "Select or add items...",
  label,
  loading = false,
  className,
  disabled = false,
}: MultiComboSelectProps) {
  return (
    <ComboSelect
      value={value}
      onChange={onChange as (value: string | string[]) => void}
      options={options}
      onAddNew={onAddNew}
      placeholder={placeholder}
      label={label}
      multiple={true}
      loading={loading}
      className={className}
      disabled={disabled}
    />
  )
}
