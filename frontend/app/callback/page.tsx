"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function OAuthCallbackPage() {
  const params = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    const token = params.get("token")
    const username = params.get("username")

    if (!token || !username) {
      alert("OAuth login failed")
      router.replace("/login")
      return
    }

    // store JWT using your existing auth logic
    login(token, username)

    // redirect to dashboard / home
    router.replace("/")
  }, [])

  return <p className="p-4">Signing you in…</p>
}
