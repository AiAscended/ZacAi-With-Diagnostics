export interface SystemConfig {
  version: string
  environment: string
  features: {
    vocabulary: boolean
    mathematics: boolean
    coding: boolean
    facts: boolean
    philosophy: boolean
    userInfo: boolean
    web3: boolean
  }
  apis: {
    dictionary: string
    wikipedia: string
    wolfram: string
    github: string
  }
}

export interface ModuleInterface {
  name: string
  version: string
  initialized: boolean
  initialize(): Promise<void>
  process(input: string, context?: any): Promise<ModuleResponse>
  learn(data: any): Promise<void>
  getStats(): ModuleStats
}

export interface ModuleResponse {
  success: boolean
  data: any
  confidence: number
  source: string
  timestamp: number
  metadata?: any
}

export interface ModuleStats {
  totalQueries: number
  successRate: number
  averageResponseTime: number
  learntEntries: number
  lastUpdate: number
}

export interface SystemStats {
  initialized: boolean
  modules: { [key: string]: ModuleStats }
  learning: any
  cognitive: any
  uptime: number
  totalQueries: number
  averageResponseTime: number
}

export interface LearntDataEntry {
  id: string
  content: any
  confidence: number
  source: string
  context: string
  timestamp: number
  usageCount: number
  lastUsed: number
  verified: boolean
  tags: string[]
  relationships: string[]
}

export interface IntentAnalysis {
  intent: string
  confidence: number
  entities: string[]
  context: any
  suggestedModules: string[]
}

export interface ReasoningStep {
  step: number
  reasoning: string
  confidence: number
  output: any
  timestamp: number
}

export interface ReasoningChain {
  id: string
  input: string
  steps: ReasoningStep[]
  finalOutput: any
  totalConfidence: number
  timestamp: number
}

export interface LearningPattern {
  id: string
  pattern: string
  frequency: number
  confidence: number
  context: string[]
  timestamp: number
}

export interface ContextMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: number
  metadata?: any
}
