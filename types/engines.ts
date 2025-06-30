import type { LearningPattern } from "./learningPatterns" // Assuming LearningPattern is declared in another file

export interface CognitiveEngineConfig {
  maxContextLength: number
  confidenceThreshold: number
  reasoningDepth: number
  learningRate: number
}

export interface ReasoningChain {
  id: string
  steps: ReasoningStep[]
  conclusion: string
  confidence: number
  sources: string[]
}

export interface ReasoningStep {
  id: string
  type: "premise" | "inference" | "conclusion"
  content: string
  confidence: number
  dependencies: string[]
}

export interface LearningEvent {
  id: string
  type: string
  data: any
  timestamp: number
  source: string
  confidence: number
  verified: boolean
}

export interface PatternRecognition {
  patterns: LearningPattern[]
  confidence: number
  recommendations: string[]
}
