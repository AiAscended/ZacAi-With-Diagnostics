"use client"
import { useState } from "react"
import { ChatWindow } from "@/ui/chat/chat-window"
import { AdminDashboard } from "@/ui/admin/dashboard"
import type { OptimizedLoader } from "@/core/system/optimized-loader"
import type { SafeModeSystem } from "@/core/system/safe-mode"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: number
  confidence?: number
  thinking?: string
}

interface SystemStats {
  initialized: boolean
  modules: { [key: string]: any }
  uptime: number
  totalQueries: number
  averageResponseTime: number
  health: any
}

interface EnhancedAIChatProps {
  loader: OptimizedLoader
  safeMode: SafeModeSystem
}

export function EnhancedAIChat({ loader, safeMode }: EnhancedAIChatProps) {
  const [view, setView] = useState<"chat" | "admin">("chat")

  if (view === "admin") {
    return <AdminDashboard onToggleChat={() => setView("chat")} loader={loader} safeMode={safeMode} />
  }

  return <ChatWindow onToggleAdmin={() => setView("admin")} />
}
