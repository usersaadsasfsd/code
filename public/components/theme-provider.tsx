"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface CustomThemeProviderProps {
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  storageKey?: string
  children: React.ReactNode
}

export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
