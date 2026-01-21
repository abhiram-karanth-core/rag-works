"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function OAuthCallbackClient() {
  const params = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    const token = params.get("token")

    if (!token) {
      router.replace("/auth")
      return
    }

    const completeOAuth = async () => {
      try {
        const res = await fetch("/auth/oauth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        })

        if (!res.ok) {
          router.replace("/auth")
          return
        }

        const data = await res.json()
        login(data.access_token, data.username)
        router.replace("/")
      } catch (err) {
        router.replace("/auth")
      }
    }

    completeOAuth()
  }, [])

  return null
}
