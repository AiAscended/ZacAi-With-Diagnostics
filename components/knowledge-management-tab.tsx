"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ReliableAISystem } from "@/lib/reliable-ai-system"
import { Book, Plus, Search, Trash2, Edit, Save } from "lucide-react"

interface KnowledgeEntry {
  id: string
  topic: string
  content: string
  category: string
  timestamp: number
}

export default function KnowledgeManagementTab() {
  const [aiSystem] = useState(() => new ReliableAISystem())
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newEntry, setNewEntry] = useState({ topic: "", content: "", category: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadKnowledgeBase = async () => {
    setIsLoading(true)
    try {
      // Simulate loading knowledge base
      const mockKnowledge: KnowledgeEntry[] = [
        {
          id: "1",
          topic: "Mathematics Basics",
          content: "Basic arithmetic operations including addition, subtraction, multiplication, and division.",
          category: "Math",
          timestamp: Date.now() - 86400000,
        },
        {
          id: "2",
          topic: "Conversation Patterns",
          content: "Common greeting patterns and response templates for natural conversation flow.",
          category: "Language",
          timestamp: Date.now() - 172800000,
        },
        {
          id: "3",
          topic: "Memory Management",
          content: "Techniques for storing and retrieving user information and conversation context.",
          category: "System",
          timestamp: Date.now() - 259200000,
        },
      ]
      setKnowledgeBase(mockKnowledge)
    } catch (error) {
      console.error("Failed to load knowledge base:", error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadKnowledgeBase()
  }, [])

  const addKnowledgeEntry = () => {
    if (newEntry.topic && newEntry.content) {
      const entry: KnowledgeEntry = {
        id: Date.now().toString(),
        topic: newEntry.topic,
        content: newEntry.content,
        category: newEntry.category || "General",
        timestamp: Date.now(),
      }
      setKnowledgeBase([entry, ...knowledgeBase])
      setNewEntry({ topic: "", content: "", category: "" })
    }
  }

  const deleteEntry = (id: string) => {
    setKnowledgeBase(knowledgeBase.filter((entry) => entry.id !== id))
  }

  const startEditing = (entry: KnowledgeEntry) => {
    setEditingId(entry.id)
    setNewEntry({
      topic: entry.topic,
      content: entry.content,
      category: entry.category,
    })
  }

  const saveEdit = () => {
    if (editingId) {
      setKnowledgeBase(
        knowledgeBase.map((entry) =>
          entry.id === editingId
            ? { ...entry, topic: newEntry.topic, content: newEntry.content, category: newEntry.category }
            : entry,
        ),
      )
      setEditingId(null)
      setNewEntry({ topic: "", content: "", category: "" })
    }
  }

  const filteredKnowledge = knowledgeBase.filter(
    (entry) =>
      entry.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const categories = [...new Set(knowledgeBase.map((entry) => entry.category))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📚 Knowledge Management</h2>
        <Badge variant="outline" className="bg-blue-50">
          {knowledgeBase.length} Entries
        </Badge>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search topics, content, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {editingId ? "Edit Entry" : "Add New Entry"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Topic/Title"
              value={newEntry.topic}
              onChange={(e) => setNewEntry({ ...newEntry, topic: e.target.value })}
            />
            <Input
              placeholder="Category"
              value={newEntry.category}
              onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
            />
          </div>
          <Textarea
            placeholder="Content/Description"
            value={newEntry.content}
            onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
            rows={4}
          />
          <div className="flex gap-2">
            <Button onClick={editingId ? saveEdit : addKnowledgeEntry}>
              {editingId ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </>
              )}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setNewEntry({ topic: "", content: "", category: "" })
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>📂 Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category} ({knowledgeBase.filter((e) => e.category === category).length})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Entries */}
      <div className="space-y-4">
        {filteredKnowledge.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  <CardTitle className="text-lg">{entry.topic}</CardTitle>
                  <Badge variant="outline">{entry.category}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEditing(entry)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteEntry(entry.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">{entry.content}</p>
              <p className="text-xs text-gray-400">Added: {new Date(entry.timestamp).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredKnowledge.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">No knowledge entries found</p>
            {searchTerm && <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
