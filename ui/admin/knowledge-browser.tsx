"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Database, Download } from "lucide-react"

export default function KnowledgeBrowser() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", name: "All", count: 1250 },
    { id: "vocabulary", name: "Vocabulary", count: 500 },
    { id: "mathematics", name: "Mathematics", count: 200 },
    { id: "facts", name: "Facts", count: 300 },
    { id: "coding", name: "Coding", count: 150 },
    { id: "philosophy", name: "Philosophy", count: 100 },
  ]

  const sampleEntries = [
    {
      id: 1,
      title: "Algorithm",
      category: "vocabulary",
      content: "A step-by-step procedure for solving a problem...",
      confidence: 0.95,
      sources: ["dictionary", "coding"],
    },
    {
      id: 2,
      title: "Fibonacci Sequence",
      category: "mathematics",
      content: "A series of numbers where each number is the sum...",
      confidence: 0.92,
      sources: ["mathematics"],
    },
    {
      id: 3,
      title: "React Components",
      category: "coding",
      content: "Reusable pieces of UI in React applications...",
      confidence: 0.88,
      sources: ["coding", "nextjs"],
    },
  ]

  const filteredEntries = sampleEntries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || entry.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Knowledge Browser
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search knowledge base..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredEntries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{entry.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {entry.category}
                    </Badge>
                    <Badge variant="outline">{Math.round(entry.confidence * 100)}% confidence</Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{entry.content}</p>
                <div className="flex flex-wrap gap-1">
                  {entry.sources.map((source, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No knowledge entries found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
