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

export interface ContextMessage {
  role: "user" | "assistant"
  content: string
  timestamp: number
  metadata?: any
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
}

export interface ReasoningChain {
  input: string
  steps: ReasoningStep[]
  finalOutput: any
  totalConfidence: number
}

export interface LearningPattern {
  id: string
  pattern: string
  frequency: number
  confidence: number
  context: any
  timestamp: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  sources?: string[]
  reasoning?: string[]
  thinking?: string
}

export interface SystemHealth {
  overall: "healthy" | "warning" | "error"
  components: { [key: string]: any }
  uptime: number
  lastCheck: number
}
