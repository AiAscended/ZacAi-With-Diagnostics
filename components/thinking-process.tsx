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
  Zap,
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
  const [isExpanded, setIsExpanded] = useState(false)

  const getStepIcon = (type: ThinkingStep["type"], status: ThinkingStep["status"]) => {
    if (status === "processing") {
      return <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
    }

    switch (type) {
      case "analysis":
        return <Brain className={`w-3 h-3 ${status === "completed" ? "text-green-600" : "text-gray-400"}`} />
      case "search":
        return <Search className={`w-3 h-3 ${status === "completed" ? "text-green-600" : "text-gray-400"}`} />
      case "reasoning":
        return <Lightbulb className={`w-3 h-3 ${status === "completed" ? "text-green-600" : "text-gray-400"}`} />
      case "synthesis":
        return <CheckCircle className={`w-3 h-3 ${status === "completed" ? "text-green-600" : "text-gray-400"}`} />
      case "validation":
        return status === "error" ? (
          <AlertCircle className="w-3 h-3 text-red-600" />
        ) : (
          <CheckCircle className={`w-3 h-3 ${status === "completed" ? "text-green-600" : "text-gray-400"}`} />
        )
      default:
        return <Brain className={`w-3 h-3 ${status === "completed" ? "text-green-600" : "text-gray-400"}`} />
    }
  }

  const getStatusColor = (status: ThinkingStep["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-700"
      case "processing":
        return "text-blue-700"
      case "error":
        return "text-red-700"
      default:
        return "text-gray-600"
    }
  }

  if (steps.length === 0) return null

  const completedSteps = steps.filter((s) => s.status === "completed").length
  const totalProcessingTime = steps.reduce((sum, step) => sum + (step.duration || 0), 0)

  return (
    <div className="mb-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto text-left border border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {isActive ? "Thinking..." : "View Thinking Process"}
              </span>
              {!isActive && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <span>
                    {completedSteps}/{steps.length} steps
                  </span>
                  {totalProcessingTime > 0 && (
                    <>
                      <span>•</span>
                      <span>{totalProcessingTime}ms</span>
                    </>
                  )}
                </div>
              )}
              {isActive && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                  <span className="text-xs text-blue-600">
                    Step {currentStep}/{totalSteps}
                  </span>
                </div>
              )}
            </div>
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-blue-600" />
            ) : (
              <ChevronRight className="w-3 h-3 text-blue-600" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Card className="mt-2 border-blue-200 bg-blue-50/30">
            <CardContent className="p-3">
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-2 text-sm">
                    <div className="flex-shrink-0">{getStepIcon(step.type, step.status)}</div>

                    <div className="flex-1 min-w-0">
                      <span className={`font-medium ${getStatusColor(step.status)}`}>{step.title}</span>
                      <span className="text-gray-600 ml-2">{step.description}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {step.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {step.duration}ms
                        </span>
                      )}
                      {step.confidence !== undefined && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          {Math.round(step.confidence * 100)}%
                        </Badge>
                      )}
                      {step.module && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          {step.module}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                {isActive && (
                  <div className="flex items-center justify-center py-2 text-xs text-blue-600">
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    <span>Processing your request...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
