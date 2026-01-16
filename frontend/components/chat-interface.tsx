"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, StopCircle, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
    role: "user" | "ai"
    content: string
}

export function ChatInterface() {
    const { token } = useAuth()
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, loading])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        if (!token) {
            router.push("/auth")
            return
        }

        const newMsg: Message = { role: "user", content: query }
        setMessages((prev) => [...prev, newMsg])
        setQuery("")
        setLoading(true)

        try {
            const res = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ query: newMsg.content }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to get response")
            }

            setMessages((prev) => [...prev, { role: "ai", content: data.response }])
        } catch (error: any) {
            setMessages((prev) => [...prev, { role: "ai", content: `Error: ${error.message}` }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full w-full relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground/60">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Bot className="w-6 h-6 opacity-50" />
                        </div>
                        {!token ? (
                            <>
                                <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to Neural AI</h3>
                                <p className="text-sm max-w-sm mb-4">
                                    Please login to access the knowledge base and start chatting.
                                </p>
                                <Button onClick={() => router.push("/auth")} className="mt-2">
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Login to Start
                                </Button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold text-foreground mb-2">How can I help you?</h3>
                                <p className="text-sm max-w-sm">
                                    Upload a PDF to the Knowledge Base to perform intelligent RAG queries.
                                </p>
                            </>
                        )}
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex w-full gap-4 max-w-3xl mx-auto",
                            msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        {msg.role === "ai" && (
                            <div className="w-8 h-8 rounded-full border bg-background flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                        )}

                        <div
                            className={cn(
                                "py-3 px-5 rounded-2xl text-[0.93rem] max-w-[85%] leading-relaxed shadow-sm",
                                msg.role === "user"
                                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-br-sm"
                                    : "bg-transparent text-foreground px-0 shadow-none pt-2"
                            )}
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    pre: ({ node, ...props }) => (
                                        <div className="overflow-hidden w-full my-4 rounded-lg border bg-zinc-950 dark:bg-zinc-900 shadow-sm text-zinc-50">
                                            {/* MacOS Terminal Header */}
                                            <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-900/50 border-b border-zinc-800">
                                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" /> {/* Red */}
                                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" /> {/* Yellow */}
                                                <div className="w-3 h-3 rounded-full bg-[#27c93f]" /> {/* Green */}
                                            </div>
                                            <div className="p-4 overflow-x-auto">
                                                <pre className="font-mono text-sm leading-relaxed" {...props} />
                                            </div>
                                        </div>
                                    ),
                                    code: ({ node, ...props }) => {
                                        return (
                                            <code
                                                className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[0.9em] font-mono text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-semibold"
                                                {...props}
                                            />
                                        )
                                    },
                                    p: ({ node, ...props }) => (
                                        <p className="mb-4 last:mb-0 leading-relaxed" {...props} />
                                    ),
                                    ul: ({ node, ...props }) => (
                                        <ul className="list-disc pl-4 mb-4 space-y-1" {...props} />
                                    ),
                                    ol: ({ node, ...props }) => (
                                        <ol className="list-decimal pl-4 mb-4 space-y-1" {...props} />
                                    )
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex w-full gap-4 max-w-3xl mx-auto">
                        <div className="w-8 h-8 rounded-full border bg-background flex items-center justify-center shrink-0 mt-1 shadow-sm">
                            <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="py-2">
                            <span className="inline-flex gap-1">
                                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area - Floating Bottom */}
            <div className="absolute bottom-4 left-0 right-0 px-4">
                <div className="max-w-3xl mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="relative flex items-center bg-white dark:bg-zinc-950 rounded-[26px] border border-zinc-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-black/5 shadow-sm transition-all"
                    >
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Message Neural AI..."
                            disabled={loading}
                            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-6 py-6 h-[52px] text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                        />
                        <div className="pr-3">
                            <Button
                                type="submit"
                                disabled={loading || !query.trim()}
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-full transition-all",
                                    query.trim() ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-600"
                                )}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                    <p className="text-[10px] text-center text-muted-foreground mt-3 opacity-60">
                        AI can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </div>
    )
}
