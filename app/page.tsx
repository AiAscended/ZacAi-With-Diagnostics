"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ZacAimain() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "Hello! I'm ZacAimain. How can I help you today?" },
  ])
  const [input, setInput] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: "user", content: input }]

    // Simple responses
    let response = "I understand. Let me help you with that."

    if (input.toLowerCase().includes("hello") || input.toLowerCase().includes("hi")) {
      response = "Hello! Nice to meet you. What would you like to talk about?"
    } else if (input.toLowerCase().includes("help")) {
      response = "I can help with math, conversations, and general questions. What do you need?"
    } else if (input.includes("+")) {
      try {
        const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
        response = `The answer is: ${result}`
      } catch {
        response = "I couldn't calculate that. Try something like '5 + 3'"
      }
    }

    setMessages([...newMessages, { role: "assistant", content: response }])
    setInput("")
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">ZacAimain Admin</h1>
            <Button onClick={() => setIsAdmin(false)}>Back to Chat</Button>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="default">Online</Badge>
                    <p className="text-sm text-gray-600 mt-2">All systems operational</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{messages.length}</p>
                    <p className="text-sm text-gray-600">Total conversations</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">45%</p>
                    <p className="text-sm text-gray-600">System memory</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Base</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Knowledge modules are loading...</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Mathematics</span>
                      <Badge>Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Vocabulary</span>
                      <Badge>Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>General Knowledge</span>
                      <Badge>Loading</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Response Time</span>
                        <span className="text-sm">120ms</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "80%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Accuracy</span>
                        <span className="text-sm">94%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "94%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Response Speed</label>
                    <Input type="range" min="1" max="10" defaultValue="5" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Memory Retention (days)</label>
                    <Input type="number" defaultValue="30" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Learning Rate</label>
                    <Input type="range" min="0.1" max="1" step="0.1" defaultValue="0.5" className="mt-1" />
                  </div>
                  <Button>Save Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ZacAimain</h1>
          <Button onClick={() => setIsAdmin(true)} variant="outline">
            Admin
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Chat with ZacAimain</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
