"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, User, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface MessageProps {
  message: {
    id: string
    type: "user" | "assistant"
    content: string
    timestamp: number
    confidence?: number
    sources?: string[]
    processingTime?: number
    thinkingSteps?: any[]
  }
}

export default function Message({ message }: MessageProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 border-green-200"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "vocabulary":
        return "📚"
      case "mathematics":
        return "🔢"
      case "facts":
        return "🌍"
      case "coding":
        return "💻"
      case "philosophy":
        return "💭"
      case "user-info":
        return "👤"
      default:
        return "🤖"
    }
  }

  return (
    <div className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-3xl ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {message.type === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        <Card className={`${message.type === "user" ? "bg-blue-50 border-blue-200" : "bg-white"}`}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatTimestamp(message.timestamp)}</span>

                {message.type === "assistant" && (
                  <div className="flex items-center gap-2">
                    {message.processingTime && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {message.processingTime}ms
                      </Badge>
                    )}

                    {message.confidence !== undefined && (
                      <Badge variant="outline" className={`text-xs ${getConfidenceColor(message.confidence)}`}>
                        {message.confidence >= 0.8 ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {Math.round(message.confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {message.sources && message.sources.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                  {message.sources.map((source, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <span className="mr-1">{getSourceIcon(source)}</span>
                      {source}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
