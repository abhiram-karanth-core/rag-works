"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
    AUTHFLOW_URL,
    AUTHFLOW_CLIENT_ID,
    AUTHFLOW_REDIRECT_URI,
} from "@/lib/authflow"


export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const endpoint = isLogin ? "/login" : "/register"

        try {
            const res = await fetch(`https://ragworks.onrender.com${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong")
            }

            if (isLogin) {
                login(data.access_token, username)
            } else {
                alert("Account created. Please sign in.")
                setIsLogin(true)
            }
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)] bg-muted/40">
            <Card className="w-full max-w-sm shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">{isLogin ? "Sign In" : "Create Account"}</CardTitle>
                    <CardDescription>
                        {isLogin ? "Enter your credentials to access your account" : "Enter your information to create an account"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder=""
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                        </Button>
                    </form>
                </CardContent>
                {/* <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                        const url =
                            `${AUTHFLOW_URL}/auth/google` +
                            `?client_id=${AUTHFLOW_CLIENT_ID}` +
                            `&redirect_uri=${encodeURIComponent(AUTHFLOW_REDIRECT_URI)}`

                        window.location.href = url
                    }}

                >
                    Continue with Google
                </Button> */}

                <CardFooter>
                    <Button
                        variant="link"
                        className="w-full text-muted-foreground"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
