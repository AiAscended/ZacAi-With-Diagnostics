"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Brain,
  Search,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react"

export interface ThinkingStep {
  id: string
  type: "analysis" | "search" | "reasoning" | "synthesis" | "validation"
  title: string
  description: string
  status: "pending" | "processing" | "completed" | "error"
  confidence?: number
  duration?: number
  module?: string
}

interface ThinkingProcessProps {
  steps: ThinkingStep[]
  isActive: boolean
  totalSteps?: number
  currentStep?: number
}

export function ThinkingProcess({ steps, isActive, totalSteps = 4, currentStep = 1 }: ThinkingProcessProps) {
  const [isExpanded, setIsExpanded] = useState(isActive)

  const getStepIcon = (type: ThinkingStep["type"], status: ThinkingStep["status"]) => {
    if (status === "processing") {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
    }

    switch (type) {
      case "analysis":
        return <Brain className={`w-4 h-4 ${status === "completed" ? "text-green-600" : "text-gray-400"}`} />
      case "search":
        return <Search className={`w-4 h-4 ${status === "completed" ? "text-green-600" : "text-gray-400"}`} />
      case "reasoning":
        return <Lightbulb className={`w-4 h-4 ${status === "completed" ? "text-green-600" : "text-gray-400"}`} />
      case "synthesis":
        return <CheckCircle className={`w-4 h-4 ${status === "completed" ? "text-green-600" : "text-gray-400"}`} />
      case "validation":
        return status === "error" ? (
          <AlertCircle className="w-4 h-4 text-red-600" />
        ) : (
          <CheckCircle className={`w-4 h-4 ${status === "completed" ? "text-green-600" : "text-gray-400"}`} />
        )
      default:
        return <Brain className={`w-4 h-4 ${status === "completed" ? "text-green-600" : "text-gray-400"}`} />
    }
  }

  const getStatusColor = (status: ThinkingStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  if (steps.length === 0) return null

  return (
    <Card className="mb-4 border-dashed border-blue-200 bg-blue-50/30">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="font-medium">
                {isActive ? "Thinking Process" : "View Thinking Process"}
                {isActive && totalSteps && ` (${currentStep}/${totalSteps})`}
              </span>
              {isActive && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <span className="text-sm text-blue-600">Processing...</span>
                </div>
              )}
            </div>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="flex-shrink-0 mt-0.5">{getStepIcon(step.type, step.status)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <div className="flex items-center gap-2">
                        {step.duration && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {step.duration}ms
                          </Badge>
                        )}
                        <Badge variant="outline" className={`text-xs ${getStatusColor(step.status)}`}>
                          {step.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>

                    <div className="flex items-center gap-2">
                      {step.confidence !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(step.confidence * 100)}% confidence
                        </Badge>
                      )}
                      {step.module && (
                        <Badge variant="outline" className="text-xs">
                          {step.module} module
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isActive && (
                <div className="text-center py-2">
                  <div className="inline-flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing your request...</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
