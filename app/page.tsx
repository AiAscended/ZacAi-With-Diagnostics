"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Message {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function ZacAimain() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm ZacAimain. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simple AI responses
    let response = ""
    const inputLower = input.toLowerCase()

    if (inputLower.includes("hello") || inputLower.includes("hi")) {
      response = "Hello! Nice to meet you. How can I assist you today?"
    } else if (inputLower.includes("help")) {
      response = "I can help you with basic math, answer questions, and have conversations. Try asking me something!"
    } else if (inputLower.match(/\d+\s*[+\-*/]\s*\d+/)) {
      try {
        const result = eval(input.replace(/[^0-9+\-*/().]/g, ""))
        response = `The answer is: ${result}`
      } catch {
        response = "Sorry, I couldn't calculate that. Please try a simpler math expression."
      }
    } else {
      response = `I understand you said: "${input}". I'm a simple AI assistant. Try asking me for help or giving me a math problem!`
    }

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">ZacAimain AI Assistant</h1>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Chat Window</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4 p-4 border rounded">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white ml-auto max-w-xs"
                          : "bg-gray-200 text-gray-800 mr-auto max-w-xs"
                      }`}
                    >
                      <p>{message.text}</p>
                      <small className="opacity-70">{message.timestamp.toLocaleTimeString()}</small>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="bg-gray-200 text-gray-800 mr-auto max-w-xs mb-4 p-3 rounded-lg">
                      <p>Thinking...</p>
                    </div>
                  )}
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    disabled={isLoading}
                  />
                  <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="text-green-600">Online</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Messages:</span>
                          <span>{messages.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Uptime:</span>
                          <span>Active</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          onClick={() =>
                            setMessages([
                              {
                                id: "1",
                                text: "Chat cleared! How can I help you?",
                                sender: "ai",
                                timestamp: new Date(),
                              },
                            ])
                          }
                        >
                          Clear Chat
                        </Button>
                        <Button className="w-full bg-transparent" variant="outline">
                          Export Data
                        </Button>
                        <Button className="w-full bg-transparent" variant="outline">
                          System Health Check
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
