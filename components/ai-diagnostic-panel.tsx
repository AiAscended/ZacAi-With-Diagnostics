// components/ai-diagnostic-panel.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Brain, MessageSquare, Activity, BookOpen, User, FileJson } from "lucide-react"
import type { CognitiveAISystem } from "@/lib/cognitive-ai-system"
import type { ChatMessage, SystemStats } from "@/lib/types"

interface AIDiagnosticPanelProps {
  aiSystem: CognitiveAISystem
}

export default function AiDiagnosticPanel({ aiSystem }: AIDiagnosticPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<SystemStats | null>(aiSystem.getStats())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = { id: Date.now().toString(), role: "user", content: input, timestamp: Date.now() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await aiSystem.processMessage(userMessage.content)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        confidence: response.confidence,
        reasoning: response.reasoning,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setStats(aiSystem.getStats())
    } catch (error) {
      console.error("Error processing message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = () => {
    // In a real app, this would be more robust.
    const data = {
      stats: aiSystem.getStats(),
      history: aiSystem.getConversationHistory(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "zacai-diagnostic-export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Brain /> ZacAI Cognitive Diagnostics
          </CardTitle>
          <Button onClick={exportData} variant="outline" size="sm">
            <FileJson className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="chat">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="status">
              <Activity className="mr-2 h-4 w-4" />
              System Status
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <BookOpen className="mr-2 h-4 w-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="memory">
              <User className="mr-2 h-4 w-4" />
              Memory System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
            <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] p-3 rounded-lg ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Send a message..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                Send
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="status" className="mt-4">
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent>{stats.systemStatus}</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Messages</CardTitle>
                  </CardHeader>
                  <CardContent>{stats.totalMessages}</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Avg. Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>{stats.avgConfidence}%</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Learned Concepts</CardTitle>
                  </CardHeader>
                  <CardContent>{stats.totalLearned}</CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="knowledge" className="mt-4">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Word</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats &&
                    Array.from(stats.vocabularyData.entries()).map(([word, category]) => (
                      <TableRow key={word}>
                        <TableCell>{word}</TableCell>
                        <TableCell>{category}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="memory" className="mt-4">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats &&
                    Array.from(stats.personalInfoData.entries()).map(([key, entry]) => (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{entry.value}</TableCell>
                        <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
