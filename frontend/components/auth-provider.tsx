"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
    token: string | null
    login: (token: string, username: string) => void
    logout: () => void
    user: string | null
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    login: () => { },
    logout: () => { },
    user: null,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Check local storage on initial load
        const storedToken = localStorage.getItem("token")
        const storedUser = localStorage.getItem("username")
        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(storedUser)
        }
    }, [])

    const login = (newToken: string, newUser: string) => {
        setToken(newToken)
        setUser(newUser)
        localStorage.setItem("token", newToken)
        localStorage.setItem("username", newUser)
        router.push("/")
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem("token")
        localStorage.removeItem("username")
        router.push("/auth")
    }

    return (
        <AuthContext.Provider value={{ token, login, logout, user }}>
            {children}
        </AuthContext.Provider>
    )
}
