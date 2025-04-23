'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  
  // useEffect only runs on the client, so we can safely show the UI once we're mounted
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // Avoid hydration mismatch by only rendering the ThemeProvider once the component has mounted
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>
  }
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
