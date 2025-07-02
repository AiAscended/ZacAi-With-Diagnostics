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

export interface IntentAnalysis {
  intent: string
  confidence: number
  entities: string[]
  context: any
  suggestedModules: string[]
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

export interface ContextMessage {
  role: "user" | "assistant"
  content: string
  metadata?: any
}

export interface ReasoningStep {
  step: number
  reasoning: string
  confidence: number
  output: any
}

export interface ReasoningChain {
  input: string
  steps: ReasoningStep[]
  finalOutput: any
  totalConfidence: number
}
