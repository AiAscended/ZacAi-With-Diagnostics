"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Search,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Target,
  BookOpen,
  Calculator,
  Code,
  Globe,
  User,
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
  details?: any
}

interface ThinkingProcessProps {
  steps: ThinkingStep[]
  isActive: boolean
  totalSteps?: number
  currentStep?: number
}

export function ThinkingProcess({ steps, isActive, totalSteps, currentStep }: ThinkingProcessProps) {
  const getStepIcon = (type: string, status: string) => {
    const iconProps = { className: "w-4 h-4" }

    if (status === "error") return <AlertCircle {...iconProps} className="w-4 h-4 text-red-500" />
    if (status === "completed") return <CheckCircle {...iconProps} className="w-4 h-4 text-green-500" />

    switch (type) {
      case "analysis":
        return <Brain {...iconProps} className="w-4 h-4 text-blue-500" />
      case "search":
        return <Search {...iconProps} className="w-4 h-4 text-purple-500" />
      case "reasoning":
        return <Lightbulb {...iconProps} className="w-4 h-4 text-yellow-500" />
      case "synthesis":
        return <Zap {...iconProps} className="w-4 h-4 text-orange-500" />
      case "validation":
        return <Target {...iconProps} className="w-4 h-4 text-green-500" />
      default:
        return <Brain {...iconProps} />
    }
  }

  const getModuleIcon = (module: string) => {
    const iconProps = { className: "w-3 h-3" }

    switch (module) {
      case "vocabulary":
        return <BookOpen {...iconProps} />
      case "mathematics":
        return <Calculator {...iconProps} />
      case "coding":
        return <Code {...iconProps} />
      case "facts":
        return <Globe {...iconProps} />
      case "user-info":
        return <User {...iconProps} />
      default:
        return <Brain {...iconProps} />
    }
  }

  const getStatusColor = (status: string) => {
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500"
    if (confidence >= 0.6) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (!isActive && steps.length === 0) return null

  return (
    <Card className="mb-4 border-dashed border-2 border-blue-200 bg-blue-50/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">AI Thinking Process</h3>
          {isActive && (
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              Processing...
            </Badge>
          )}
        </div>

        {totalSteps && currentStep && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>
                {currentStep} of {totalSteps} steps
              </span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
        )}

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                step.status === "processing" ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.status === "processing" ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  getStepIcon(step.type, step.status)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm text-gray-900">{step.title}</h4>

                  {step.module && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      <span className="mr-1">{getModuleIcon(step.module)}</span>
                      {step.module}
                    </Badge>
                  )}

                  <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getStatusColor(step.status)}`}>
                    {step.status}
                  </Badge>
                </div>

                <p className="text-xs text-gray-600 mb-2">{step.description}</p>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {step.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{step.duration}ms</span>
                    </div>
                  )}

                  {step.confidence !== undefined && (
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getConfidenceColor(step.confidence)}`} />
                        <span>{Math.round(step.confidence * 100)}% confidence</span>
                      </div>
                    </div>
                  )}
                </div>

                {step.details && step.status === "completed" && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {typeof step.details === "string" ? step.details : JSON.stringify(step.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {isActive && (
          <div className="mt-3 text-xs text-gray-500 italic">
            AI is analyzing your request and determining the best approach...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
