"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Trash2, Search, RefreshCw } from "lucide-react"

interface MemoryEntry {
  id: string
  key: string
  value: string
  type: "user_info" | "preference" | "fact" | "conversation"
  importance: number
  timestamp: number
  lastAccessed: number
  accessCount: number
}

export default function MemorySystemTab() {
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)

  const loadMemories = async () => {
    setIsLoading(true)
    try {
      // Simulate loading memories
      const mockMemories: MemoryEntry[] = [
        {
          id: "1",
          key: "user_name",
          value: "TestUser",
          type: "user_info",
          importance: 0.9,
          timestamp: Date.now() - 86400000,
          lastAccessed: Date.now() - 3600000,
          accessCount: 5,
        },
        {
          id: "2",
          key: "preferred_language",
          value: "English",
          type: "preference",
          importance: 0.7,
          timestamp: Date.now() - 172800000,
          lastAccessed: Date.now() - 7200000,
          accessCount: 3,
        },
        {
          id: "3",
          key: "favorite_color",
          value: "Blue",
          type: "preference",
          importance: 0.5,
          timestamp: Date.now() - 259200000,
          lastAccessed: Date.now() - 14400000,
          accessCount: 2,
        },
        {
          id: "4",
          key: "math_skill_level",
          value: "Advanced",
          type: "fact",
          importance: 0.8,
          timestamp: Date.now() - 345600000,
          lastAccessed: Date.now() - 1800000,
          accessCount: 8,
        },
      ]
      setMemories(mockMemories)
    } catch (error) {
      console.error("Failed to load memories:", error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadMemories()
  }, [])

  const deleteMemory = (id: string) => {
    setMemories(memories.filter((memory) => memory.id !== id))
  }

  const clearAllMemories = () => {
    if (confirm("Are you sure you want to clear all memories? This action cannot be undone.")) {
      setMemories([])
    }
  }

  const filteredMemories = memories.filter((memory) => {
    const matchesSearch =
      memory.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.value.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || memory.type === selectedType
    return matchesSearch && matchesType
  })

  const memoryTypes = ["all", "user_info", "preference", "fact", "conversation"]
  const totalMemorySize = memories.length
  const memoryUsage = Math.min((totalMemorySize / 100) * 100, 100) // Simulate usage percentage

  const getTypeColor = (type: string) => {
    switch (type) {
      case "user_info":
        return "bg-blue-100 text-blue-800"
      case "preference":
        return "bg-green-100 text-green-800"
      case "fact":
        return "bg-purple-100 text-purple-800"
      case "conversation":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getImportanceColor = (importance: number) => {
    if (importance >= 0.8) return "text-red-600"
    if (importance >= 0.6) return "text-orange-600"
    if (importance >= 0.4) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🧠 Memory System</h2>
        <div className="flex gap-2">
          <Button onClick={loadMemories} disabled={isLoading} variant="outline">
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          <Button onClick={clearAllMemories} variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Memory Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMemorySize}</div>
            <p className="text-xs text-muted-foreground">Stored entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoryUsage.toFixed(1)}%</div>
            <Progress value={memoryUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memories.filter((m) => m.importance >= 0.8).length}</div>
            <p className="text-xs text-muted-foreground">Important memories</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search memories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {memoryTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type.replace("_", " ").toUpperCase()}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Memory Entries */}
      <div className="space-y-4">
        {filteredMemories.map((memory) => (
          <Card key={memory.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  <div>
                    <h3 className="font-semibold">{memory.key.replace("_", " ")}</h3>
                    <p className="text-sm text-gray-600">{memory.value}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(memory.type)}>{memory.type.replace("_", " ")}</Badge>
                  <Button variant="outline" size="sm" onClick={() => deleteMemory(memory.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Importance</p>
                  <p className={`font-semibold ${getImportanceColor(memory.importance)}`}>
                    {(memory.importance * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Access Count</p>
                  <p className="font-semibold">{memory.accessCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-semibold">{new Date(memory.timestamp).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Accessed</p>
                  <p className="font-semibold">{new Date(memory.lastAccessed).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMemories.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">No memories found</p>
            {searchTerm && <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or filters</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
