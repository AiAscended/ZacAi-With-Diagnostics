// Engine-specific type definitions
export interface CognitiveEngineStats {
  initialized: boolean
  registeredModules: string[]
  contextStats: any
}

export interface LearningEngineStats {
  totalLearned: number
  learningRate: number
  retentionRate: number
  averageConfidence: number
  lastLearningSession: number
}

export interface ReasoningEngineStats {
  totalReasoningChains: number
  averageSteps: number
  averageConfidence: number
  successRate: number
}

export interface LearningPattern {
  id: string
  pattern: string
  frequency: number
  confidence: number
  lastSeen: number
  examples: string[]
}

export interface ContextStats {
  totalMessages: number
  averageLength: number
  topicDistribution: { [topic: string]: number }
  sentimentAnalysis: any
}
