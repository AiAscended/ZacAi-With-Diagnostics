"use client"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-2">ZacAi</h1>
            <p className="text-gray-600">Your Advanced AI Assistant</p>
          </div>
          <Button onClick={() => (window.location.href = "/diagnostics")} variant="outline" className="ml-4">
            🔧 Admin
          </Button>
        </div>
        {/* Rest of your page content goes here */}
        <div>
          <p>Welcome to ZacAi! This is the main page.</p>
        </div>
      </div>
    </main>
  )
}
