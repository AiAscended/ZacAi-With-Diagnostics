"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, BookOpen, Calculator, Globe, Code, Lightbulb, Download, Upload } from "lucide-react"

export default function KnowledgeBrowser() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedModule, setSelectedModule] = useState("vocabulary")

  const mockData = {
    vocabulary: [
      { word: "algorithm", definition: "A process or set of rules to be followed in calculations", confidence: 0.95 },
      {
        word: "quantum",
        definition: "The minimum amount of any physical entity involved in an interaction",
        confidence: 0.92,
      },
      {
        word: "artificial",
        definition: "Made or produced by human beings rather than occurring naturally",
        confidence: 0.88,
      },
    ],
    mathematics: [
      { concept: "Fibonacci Sequence", formula: "F(n) = F(n-1) + F(n-2)", confidence: 0.96 },
      { concept: "Pythagorean Theorem", formula: "a² + b² = c²", confidence: 0.98 },
      { concept: "Golden Ratio", formula: "φ = (1 + √5) / 2", confidence: 0.94 },
    ],
    facts: [
      { topic: "Solar System", content: "The Solar System consists of the Sun and 8 planets", confidence: 0.99 },
      { topic: "DNA", content: "DNA is a double helix structure containing genetic information", confidence: 0.97 },
      {
        topic: "Photosynthesis",
        content: "Process by which plants convert light energy into chemical energy",
        confidence: 0.95,
      },
    ],
  }

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "vocabulary":
        return <BookOpen className="h-4 w-4" />
      case "mathematics":
        return <Calculator className="h-4 w-4" />
      case "facts":
        return <Globe className="h-4 w-4" />
      case "coding":
        return <Code className="h-4 w-4" />
      case "philosophy":
        return <Lightbulb className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800 border-green-200"
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Knowledge Browser
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Modules */}
      <Tabs value={selectedModule} onValueChange={setSelectedModule}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="vocabulary" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value="mathematics" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Math
          </TabsTrigger>
          <TabsTrigger value="facts" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Facts
          </TabsTrigger>
          <TabsTrigger value="coding" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Coding
          </TabsTrigger>
          <TabsTrigger value="philosophy" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Philosophy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vocabulary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getModuleIcon("vocabulary")}
                  Vocabulary Knowledge
                </span>
                <Badge variant="secondary">{mockData.vocabulary.length} entries</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.vocabulary.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.word}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.definition}</p>
                      </div>
                      <Badge variant="outline" className={`ml-4 ${getConfidenceColor(item.confidence)}`}>
                        {Math.round(item.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mathematics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getModuleIcon("mathematics")}
                  Mathematics Knowledge
                </span>
                <Badge variant="secondary">{mockData.mathematics.length} entries</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.mathematics.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.concept}</h4>
                        <p className="text-sm text-gray-600 mt-1 font-mono">{item.formula}</p>
                      </div>
                      <Badge variant="outline" className={`ml-4 ${getConfidenceColor(item.confidence)}`}>
                        {Math.round(item.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getModuleIcon("facts")}
                  Facts Knowledge
                </span>
                <Badge variant="secondary">{mockData.facts.length} entries</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.facts.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.topic}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                      </div>
                      <Badge variant="outline" className={`ml-4 ${getConfidenceColor(item.confidence)}`}>
                        {Math.round(item.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coding" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Code className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Coding Knowledge</h3>
              <p className="text-gray-600">Coding knowledge module is being loaded...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="philosophy" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Philosophy Knowledge</h3>
              <p className="text-gray-600">Philosophy knowledge module is being loaded...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
