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
    const username = params.get("username")

    if (!token || !username) {
      router.replace("/login")
      return
    }

    login(token, username)
    router.replace("/")
  }, [])

  return null
}
