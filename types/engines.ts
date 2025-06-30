// Engine-specific type definitions
export interface CognitiveEngineConfig {
  modules: string[]
  reasoning: boolean
  learning: boolean
  confidence: {
    threshold: number
    aggregation: "average" | "weighted" | "max"
  }
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
  description: string
  input: any
  output: any
  confidence: number
  reasoning: string
}

export interface LearningPattern {
  id: string
  type: string
  pattern: string
  confidence: number
  occurrences: number
  examples: string[]
  metadata: {
    firstSeen: number
    lastSeen: number
    source: string
  }
}

export interface IntentAnalysis {
  intent: string
  confidence: number
  entities: Entity[]
  context: any
  suggestedModules: string[]
}

export interface Entity {
  type: string
  value: string
  confidence: number
  start: number
  end: number
}

export interface CognitiveEngineStats {
  initialized: boolean
  registeredModules: string[]
  contextStats: {
    messageCount: number
    duration: number
  }
}
