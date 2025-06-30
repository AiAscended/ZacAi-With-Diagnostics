"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

type MemoryItem = {
  id: string
  type: "short-term" | "long-term"
  content: string
  timestamp: string
}

export function MemorySystemTab() {
  const [memory, setMemory] = useState<MemoryItem[]>([])

  useEffect(() => {
    // Mock data, would be fetched from the AI system in a real scenario
    const mockMemory: MemoryItem[] = [
      { id: "1", type: "short-term", content: "User asked about the weather in London.", timestamp: "2 minutes ago" },
      { id: "2", type: "long-term", content: "User's name is Alex.", timestamp: "3 days ago" },
      { id: "3", type: "short-term", content: "Current topic is AI memory systems.", timestamp: "10 seconds ago" },
      { id: "4", type: "long-term", content: "User prefers concise answers.", timestamp: "1 week ago" },
    ]
    setMemory(mockMemory)
  }, [])

  const clearShortTermMemory = () => {
    setMemory(memory.filter((item) => item.type !== "short-term"))
  }

  const clearAllMemory = () => {
    setMemory([])
  }

  const shortTermMemory = memory.filter((item) => item.type === "short-term")
  const longTermMemory = memory.filter((item) => item.type === "long-term")

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex space-x-2">
        <Button onClick={clearShortTermMemory} variant="outline">
          Clear Short-Term
        </Button>
        <Button onClick={clearAllMemory} variant="destructive">
          Clear All Memory
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Short-Term Memory</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {shortTermMemory.map((item) => (
                  <div key={item.id} className="p-2 border rounded-md">
                    <p className="text-sm">{item.content}</p>
                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Long-Term Memory</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {longTermMemory.map((item) => (
                  <div key={item.id} className="p-2 border rounded-md">
                    <p className="text-sm">{item.content}</p>
                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
