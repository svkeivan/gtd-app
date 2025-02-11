"use client"

import * as React from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "dark" | "light" | "system"

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-storage",
    }
  )
)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  // Handle system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    // Initial theme setup
    const updateTheme = () => {
      const root = document.documentElement
      const systemTheme = mediaQuery.matches ? "dark" : "light"
      const activeTheme = theme === "system" ? systemTheme : theme
      
      if (activeTheme === "dark") {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }

      // Add a transition class for smooth theme changes
      root.style.setProperty("--transition-duration", "200ms")
      root.classList.add("transition-colors")
    }

    updateTheme()

    // Listen for system theme changes
    mediaQuery.addEventListener("change", updateTheme)
    return () => mediaQuery.removeEventListener("change", updateTheme)
  }, [theme])

  return <>{children}</>
}
