import "./globals.css"
import { Navbar } from "@/components/navigate"
import { AuthProvider } from "@/components/auth-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100">
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto pt-24 px-4 pb-12">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
