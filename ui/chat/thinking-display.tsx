"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface ThinkingStep {
  id: string
  type: "analysis" | "search" | "reasoning" | "synthesis" | "validation"
  title: string
  description: string
  status: "processing" | "completed" | "error"
  confidence?: number
  duration?: number
  module?: string
}

interface ThinkingDisplayProps {
  steps: ThinkingStep[]
  isActive?: boolean
  totalSteps?: number
  currentStep?: number
}

export default function ThinkingDisplay({ steps, isActive = false, totalSteps, currentStep }: ThinkingDisplayProps) {
  const getStepIcon = (step: ThinkingStep) => {
    if (step.status === "processing") {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
    } else if (step.status === "completed") {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    } else if (step.status === "error") {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    return <Clock className="w-4 h-4 text-gray-400" />
  }

  const getStepColor = (step: ThinkingStep) => {
    if (step.status === "processing") return "border-blue-200 bg-blue-50"
    if (step.status === "completed") return "border-green-200 bg-green-50"
    if (step.status === "error") return "border-red-200 bg-red-50"
    return "border-gray-200 bg-gray-50"
  }

  if (steps.length === 0) return null

  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-orange-800">AI Thinking Process</h4>
            {totalSteps && currentStep && (
              <Badge variant="outline" className="text-xs">
                Step {currentStep} of {totalSteps}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.id} className={`p-3 rounded-lg border ${getStepColor(step)}`}>
                <div className="flex items-start gap-3">
                  {getStepIcon(step)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      {step.duration && (
                        <Badge variant="outline" className="text-xs">
                          {step.duration}ms
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {step.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(step.confidence * 100)}% confidence
                        </Badge>
                      )}
                      {step.module && (
                        <Badge variant="outline" className="text-xs">
                          {step.module}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isActive && (
            <div className="flex items-center gap-2 text-xs text-orange-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
