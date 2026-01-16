"use client"

import { UploadForm } from "@/components/upload-form"
import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sidebar - Fixed Width, Border Right */}
      <div className="w-[300px] flex-shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="p-4 border-b h-14 flex items-center">
          <h2 className="font-semibold text-sm">Knowledge Base</h2>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <UploadForm />
        </div>
      </div>

      {/* Main Chat Area - Flexible, Seamless */}
      <div className="flex-1 flex flex-col relative bg-background h-full">
        <ChatInterface />
      </div>
    </div>
  )
}
