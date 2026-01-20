import { Suspense } from "react"
import OAuthCallbackClient from "./oauth-callback-client"

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<p className="p-4">Signing you in…</p>}>
      <OAuthCallbackClient />
    </Suspense>
  )
}
