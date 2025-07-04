"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Bot, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface MessageProps {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
  processingTime?: number
}

export default function Message({ type, content, timestamp, confidence, sources, processingTime }: MessageProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 border-green-200"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <div className={`flex gap-3 ${type === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-3xl ${type === "user" ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            type === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {type === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        <Card className={`${type === "user" ? "bg-blue-50 border-blue-200" : "bg-white"}`}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatTimestamp(timestamp)}</span>

                {type === "assistant" && (
                  <div className="flex items-center gap-2">
                    {processingTime && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {processingTime}ms
                      </Badge>
                    )}

                    {confidence !== undefined && (
                      <Badge variant="outline" className={`text-xs ${getConfidenceColor(confidence)}`}>
                        {confidence >= 0.8 ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {Math.round(confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {sources && sources.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                  {sources.map((source, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <span className="mr-1">🤖</span>
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
