"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Loader2, UploadCloud, AlertCircle, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function UploadForm() {
    const { token } = useAuth()
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
    const [message, setMessage] = useState("")

    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setStatus("idle")
            setMessage("")
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !token) return

        setLoading(true)
        setStatus("idle")
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("http://localhost:5000/upload", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            })

            const data = await res.json()
            if (res.ok) {
                setStatus("success")
                setMessage("Uploaded successfully.")
                setFile(null)
            } else {
                throw new Error(data.error || "Upload failed")
            }
        } catch (error: any) {
            setStatus("error")
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!token) return
        if (!confirm("Are you sure you want to delete all uploaded knowledge? This cannot be undone.")) return

        setDeleteLoading(true)
        try {
            const res = await fetch("http://localhost:5000/delete_uploads", {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                setMessage("Knowledge base cleared.")
                setStatus("success")
            } else {
                throw new Error("Failed to clear")
            }
        } catch (e) {
            setMessage("Error clearing knowledge")
            setStatus("error")
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleUpload} className="space-y-4">
                <div className="border-2 border-dashed border-input hover:border-accent-foreground/20 rounded-lg p-8 transition-colors text-center cursor-pointer relative">
                    <Input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-muted">
                            <UploadCloud className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{file ? file.name : "Click to upload PDF"}</p>
                            <p className="text-xs text-muted-foreground mt-1">Maximum size 10MB</p>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={cn(
                        "text-xs px-3 py-2 rounded border",
                        status === "success" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                        {message}
                    </div>
                )}

                <Button type="submit" disabled={!file || loading} className="w-full">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {status === "success" && !loading ? "Uploaded" : "Upload Document"}
                </Button>
            </form>

            <Button
                variant="ghost"
                onClick={handleDelete}
                disabled={deleteLoading || !token}
                className="w-full bg-white dark:bg-zinc-950 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-white font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all opacity-100 disabled:opacity-50"
            >
                {deleteLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Clear Knowledge Base
            </Button>
        </div>
    )
}
