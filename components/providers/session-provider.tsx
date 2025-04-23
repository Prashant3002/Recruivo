"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { SessionChecker } from "./session-checker"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <SessionChecker />
      {children}
    </NextAuthSessionProvider>
  )
} 