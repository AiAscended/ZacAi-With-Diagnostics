"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, MessageSquare, Calculator, HelpCircle } from "lucide-react"

interface Suggestion {
  id: string
  text: string
  type: "question" | "command" | "topic" | "action"
  category?: string
}

interface SuggestionsProps {
  suggestions: Suggestion[]
  onSuggestionClick: (suggestion: string) => void
  isVisible?: boolean
}

export default function Suggestions({ suggestions, onSuggestionClick, isVisible = true }: SuggestionsProps) {
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "question":
        return <HelpCircle className="w-3 h-3" />
      case "command":
        return <MessageSquare className="w-3 h-3" />
      case "topic":
        return <Lightbulb className="w-3 h-3" />
      case "action":
        return <Calculator className="w-3 h-3" />
      default:
        return <MessageSquare className="w-3 h-3" />
    }
  }

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case "question":
        return "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
      case "command":
        return "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
      case "topic":
        return "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
      case "action":
        return "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
    }
  }

  if (!isVisible || suggestions.length === 0) return null

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-700">Suggestions</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick(suggestion.text)}
                className={`justify-start text-left h-auto p-3 ${getSuggestionColor(suggestion.type)}`}
              >
                <div className="flex items-start gap-2 w-full">
                  {getSuggestionIcon(suggestion.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{suggestion.text}</p>
                    {suggestion.category && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {suggestion.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
