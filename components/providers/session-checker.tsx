"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function SessionChecker() {
  const { data: session, status, update } = useSession()
  const [lastChecked, setLastChecked] = useState<number>(Date.now())
  const router = useRouter()

  // Check session status every 5 minutes to ensure it's still valid
  useEffect(() => {
    if (status === "authenticated") {
      const interval = setInterval(async () => {
        // Verify session is still valid
        try {
          const response = await fetch('/api/auth/check-session', {
            credentials: 'include'
          })
          const data = await response.json()
          console.log("Session check:", data)
          
          if (!data.authenticated) {
            console.log("Session expired, refreshing...")
            await update() // Force session refresh
            
            // Wait after update and check again
            setTimeout(async () => {
              const recheckResponse = await fetch('/api/auth/check-session', {
                credentials: 'include'
              })
              const recheckData = await recheckResponse.json()
              console.log("Session recheck after update:", recheckData)
              
              if (!recheckData.authenticated) {
                console.warn("Session still invalid after refresh")
              }
            }, 1000)
          }
        } catch (error) {
          console.error("Error checking session:", error)
        }
        
        setLastChecked(Date.now())
      }, 5 * 60 * 1000) // Check every 5 minutes
      
      return () => clearInterval(interval)
    }
  }, [status, update])

  // Return null so it doesn't render anything
  return null
} 