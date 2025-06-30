// components/ai-control-panel.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, MessageSquare, BookOpen, Calculator } from "lucide-react"
import type { CognitiveEngine } from "@/lib/cognitive-engine"
import type { ChatMessage } from "@/lib/types"
import KnowledgeViewerTab from "./knowledge-viewer-tab"

interface AIControlPanelProps {
  engine: CognitiveEngine
}

export default function AIControlPanel({ engine }: AIControlPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: input, timestamp: Date.now() }])
    setInput("")
    setIsLoading(true)

    const response = await engine.processMessage(input)

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        thinkingProcess: response.thinkingProcess,
        confidence: response.confidence,
      },
    ])
    setIsLoading(false)
  }

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare />
            Chat Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-lg ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "assistant" && msg.thinkingProcess && (
                    <details className="text-xs mt-1 w-full max-w-[85%]">
                      <summary className="cursor-pointer text-muted-foreground">Show thinking...</summary>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded mt-1 border">
                        {msg.thinkingProcess.map((step, i) => (
                          <p key={i} className="font-mono text-xs">
                            {step}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Define a word, ask a question..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Thinking..." : "Send"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1 h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain />
            Knowledge Modules
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="vocabulary" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vocabulary">
                <BookOpen className="mr-2 h-4 w-4" /> Vocabulary
              </TabsTrigger>
              <TabsTrigger value="mathematics">
                <Calculator className="mr-2 h-4 w-4" /> Math
              </TabsTrigger>
              {/* <TabsTrigger value="coding" disabled><Code className="mr-2 h-4 w-4"/>Coding</TabsTrigger>
              <TabsTrigger value="user" disabled><User className="mr-2 h-4 w-4"/>User</TabsTrigger> */}
            </TabsList>
            <TabsContent value="vocabulary" className="flex-1 mt-2">
              <KnowledgeViewerTab data={engine.getModuleData("Vocabulary")} title="Vocabulary" />
            </TabsContent>
            <TabsContent value="mathematics" className="flex-1 mt-2">
              <KnowledgeViewerTab data={engine.getModuleData("Mathematics")} title="Mathematics" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
