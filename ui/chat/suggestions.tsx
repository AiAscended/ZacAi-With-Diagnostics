"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Calculator, Globe, Code, Lightbulb, HelpCircle } from "lucide-react"

interface SuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
  isVisible: boolean
}

const suggestions = [
  {
    icon: BookOpen,
    text: "Define artificial intelligence",
    category: "vocabulary",
    color: "text-blue-600",
  },
  {
    icon: Calculator,
    text: "Calculate 15 * 8 + 42",
    category: "mathematics",
    color: "text-green-600",
  },
  {
    icon: Globe,
    text: "Tell me about quantum physics",
    category: "facts",
    color: "text-purple-600",
  },
  {
    icon: Code,
    text: "Show me a React component",
    category: "coding",
    color: "text-cyan-600",
  },
  {
    icon: Lightbulb,
    text: "What is the meaning of life?",
    category: "philosophy",
    color: "text-orange-600",
  },
  {
    icon: HelpCircle,
    text: "Help me get started",
    category: "help",
    color: "text-gray-600",
  },
]

export default function Suggestions({ onSuggestionClick, isVisible }: SuggestionsProps) {
  if (!isVisible) return null

  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Try asking me about:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="justify-start h-auto p-3 text-left"
                onClick={() => onSuggestionClick(suggestion.text)}
              >
                <suggestion.icon className={`w-4 h-4 mr-2 flex-shrink-0 ${suggestion.color}`} />
                <span className="text-sm">{suggestion.text}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
