"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, AlertCircle, Search, Brain, Lightbulb } from "lucide-react"

interface ThinkingStep {
  id: string
  type: "analysis" | "search" | "reasoning" | "synthesis" | "validation"
  title: string
  description: string
  status: "pending" | "processing" | "completed" | "error"
  confidence?: number
  duration?: number
  module?: string
}

interface ThinkingDisplayProps {
  steps: ThinkingStep[]
  isActive: boolean
  totalSteps?: number
  currentStep?: number
}

export default function ThinkingDisplay({ steps, isActive, totalSteps, currentStep }: ThinkingDisplayProps) {
  const getStepIcon = (type: string, status: string) => {
    const iconClass = "w-4 h-4"

    if (status === "processing") {
      return <Loader2 className={`${iconClass} animate-spin`} />
    }

    if (status === "completed") {
      return <CheckCircle className={`${iconClass} text-green-600`} />
    }

    if (status === "error") {
      return <AlertCircle className={`${iconClass} text-red-600`} />
    }

    switch (type) {
      case "analysis":
        return <Search className={iconClass} />
      case "search":
        return <Search className={iconClass} />
      case "reasoning":
        return <Brain className={iconClass} />
      case "synthesis":
        return <Lightbulb className={iconClass} />
      case "validation":
        return <CheckCircle className={iconClass} />
      default:
        return <Brain className={iconClass} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200 text-green-800"
      case "processing":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-600"
    }
  }

  if (steps.length === 0) return null

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Thinking Process
            </h4>
            {isActive && totalSteps && currentStep && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {currentStep}/{totalSteps}
                </span>
                <Progress value={(currentStep / totalSteps) * 100} className="w-16 h-2" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-3 rounded-lg border ${getStatusColor(step.status)} transition-all duration-200`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getStepIcon(step.type, step.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">{step.title}</h5>
                      <div className="flex items-center gap-2">
                        {step.module && (
                          <Badge variant="outline" className="text-xs">
                            {step.module}
                          </Badge>
                        )}
                        {step.duration && <span className="text-xs text-gray-500">{step.duration}ms</span>}
                        {step.confidence && (
                          <span className="text-xs text-gray-500">{Math.round(step.confidence * 100)}%</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
