import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Price formatting utilities for Indian currency (Lakhs and Crores)
export function formatPriceToIndian(price: number | undefined | null): string {
  if (!price || price === 0) return "Price on Request"
  
  if (price >= 10000000) {
    // Crores (1 Cr = 10,000,000)
    const crValue = price / 10000000
    if (crValue === Math.floor(crValue)) {
      return `${crValue} Cr`
    }
    return `${crValue.toFixed(2).replace(/\.?0+$/, '')} Cr`
  }
  
  if (price >= 100000) {
    // Lakhs (1 L = 100,000)
    const lValue = price / 100000
    if (lValue === Math.floor(lValue)) {
      return `${lValue} L`
    }
    return `${lValue.toFixed(2).replace(/\.?0+$/, '')} L`
  }
  
  // Less than 1 Lakh - display as is with commas
  return price.toLocaleString('en-IN')
}

// Format price range display
export function formatPriceRange(lowestPrice?: number | null, maxPrice?: number | null): string {
  if (!lowestPrice && !maxPrice) return "Price on Request"
  
  const low = formatPriceToIndian(lowestPrice)
  
  if (!maxPrice || maxPrice === lowestPrice) {
    return lowestPrice ? `₹${low}` : "Price on Request"
  }
  
  const high = formatPriceToIndian(maxPrice)
  return `₹${low} - ₹${high}`
}

// Parse price string (like "5.3 Cr" or "80 L") back to number
export function parsePriceFromIndian(priceStr: string): number | null {
  if (!priceStr || typeof priceStr !== 'string') return null
  
  const cleanStr = priceStr.trim().toLowerCase().replace(/[₹,\s]/g, '')
  
  // Match patterns like "5.3cr", "5.3 cr", "80l", "80 l"
  const crMatch = cleanStr.match(/^([\d.]+)\s*cr$/i)
  if (crMatch) {
    return parseFloat(crMatch[1]) * 10000000
  }
  
  const lMatch = cleanStr.match(/^([\d.]+)\s*l$/i)
  if (lMatch) {
    return parseFloat(lMatch[1]) * 100000
  }
  
  // Try parsing as plain number
  const num = parseFloat(cleanStr)
  return isNaN(num) ? null : num
}

// Budget ranges for filtering (in actual numbers)
export const BUDGET_RANGES = [
  { label: "Under 50 L", value: "0-5000000", min: 0, max: 5000000 },
  { label: "50 L - 1 Cr", value: "5000000-10000000", min: 5000000, max: 10000000 },
  { label: "1 Cr - 2 Cr", value: "10000000-20000000", min: 10000000, max: 20000000 },
  { label: "2 Cr - 5 Cr", value: "20000000-50000000", min: 20000000, max: 50000000 },
  { label: "5 Cr - 10 Cr", value: "50000000-100000000", min: 50000000, max: 100000000 },
  { label: "10 Cr - 20 Cr", value: "100000000-200000000", min: 100000000, max: 200000000 },
  { label: "20 Cr - 50 Cr", value: "200000000-500000000", min: 200000000, max: 500000000 },
  { label: "Above 50 Cr", value: "500000000-", min: 500000000, max: null },
]

// Get budget range from min/max prices
export function getBudgetRangeFromPrices(minPrice?: string, maxPrice?: string): string {
  if (!minPrice && !maxPrice) return ""
  return `${minPrice || "0"}-${maxPrice || ""}`
}

// Parse budget range to min/max values
export function parseBudgetRange(budgetValue: string): { min: number | null; max: number | null } {
  if (!budgetValue) return { min: null, max: null }
  
  const [minStr, maxStr] = budgetValue.split("-")
  return {
    min: minStr ? parseInt(minStr) : null,
    max: maxStr ? parseInt(maxStr) : null
  }
}
