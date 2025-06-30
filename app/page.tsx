"use client"

import { useState } from "react"
import ChatWindow from "@/ui/chat/chat-window"
import AdminDashboard from "@/ui/admin/dashboard"

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false)

  return (
    <main className="h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      {showAdmin ? (
        <AdminDashboard onToggleChat={() => setShowAdmin(false)} />
      ) : (
        <ChatWindow onToggleAdmin={() => setShowAdmin(true)} />
      )}
    </main>
  )
}
