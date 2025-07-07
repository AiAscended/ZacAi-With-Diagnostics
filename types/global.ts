export interface SystemConfig {
  version: string
  environment: "development" | "production" | "test"
  features: {
    vocabulary: boolean
    mathematics: boolean
    coding: boolean
    facts: boolean
    philosophy: boolean
    userInfo: boolean
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
  entities: any[]
  context: any
  suggestedModules: string[]
}

export interface ContextMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: number
  metadata?: any
}

export interface ReasoningStep {
  step: number
  reasoning: string
  input: any
  output: any
  confidence: number
  timestamp: number
}

export interface ReasoningChain {
  id: string
  input: string
  steps: ReasoningStep[]
  finalOutput: any
  totalConfidence: number
  processingTime: number
}

export interface LearningPattern {
  id: string
  pattern: string
  frequency: number
  confidence: number
  context: string[]
  timestamp: number
  category?: string
  effectiveness?: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
  reasoning?: string[]
  thinking?: string[]
}

export interface AIResponse {
  response: string
  confidence: number
  sources: string[]
  reasoning: string[]
  thinking?: string[]
  timestamp: number
}

export interface SystemState {
  initialized: boolean
  loading: boolean
  error: string | null
  modules: string[]
  activeModules: string[]
  stats: any
}
