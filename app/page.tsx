"use client"

import { useState } from "react"

export default function Home() {
  const [mode, setMode] = useState<"chat" | "admin">("chat")
  const [messages, setMessages] = useState([{ id: 1, type: "ai", text: "Hello! I'm ZacAI. How can I help you?" }])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "user", text: input },
      { id: Date.now() + 1, type: "ai", text: `You said: "${input}". I'm here to help!` },
    ])
    setInput("")
  }

  if (mode === "admin") {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">ZacAI Admin</h1>
              <button
                onClick={() => setMode("chat")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Back to Chat
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-semibold">Status</h3>
                <p className="text-green-600">Online</p>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-semibold">Messages</h3>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <h3 className="font-semibold">Version</h3>
                <p>1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">ZacAI Chat</h1>
          <button
            onClick={() => setMode("admin")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Admin
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4">
        <div className="bg-white rounded-lg shadow h-full flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-4 ${msg.type === "user" ? "text-right" : "text-left"}`}>
                <div
                  className={`inline-block p-3 rounded-lg max-w-xs ${
                    msg.type === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleSend} className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
