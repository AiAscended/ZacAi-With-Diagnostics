export interface ModuleInterface {
  name: string
  version: string
  initialized: boolean
  initialize(): Promise<any>
  process(input: string, context?: any): Promise<ModuleResponse>
  learn?(data: any): Promise<void>
  getStats(): ModuleStats
}

export interface ModuleResponse {
  success: boolean
  data: any
  confidence: number
  source: string
  timestamp: number
  error?: string
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

export interface ReasoningChain {
  id: string
  steps: ReasoningStep[]
  conclusion: string
  confidence: number
  timestamp: number
}

export interface ReasoningStep {
  step: number
  description: string
  input: any
  output: any
  confidence: number
}

export interface LearningPattern {
  id: string
  pattern: string
  frequency: number
  confidence: number
  context: any
  timestamp: number
}

export interface SystemConfiguration {
  version: string
  environment: "development" | "production" | "test"
  features: {
    [key: string]: boolean
  }
  limits: {
    maxQueryLength: number
    maxResponseTime: number
    maxMemoryUsage: number
  }
  modules: {
    [key: string]: {
      enabled: boolean
      priority: number
      config: any
    }
  }
}

export interface PerformanceMetrics {
  responseTime: number
  memoryUsage: number
  cpuUsage: number
  errorRate: number
  throughput: number
  timestamp: number
}

export interface ErrorInfo {
  id: string
  type: string
  message: string
  stack?: string
  context: any
  timestamp: number
  resolved: boolean
}

export interface UserProfile {
  id: string
  name?: string
  preferences: {
    [key: string]: any
  }
  history: {
    queries: number
    sessions: number
    lastActive: number
  }
  personalInfo: {
    [key: string]: any
  }
}

export interface KnowledgeEntry {
  id: string
  type: "fact" | "definition" | "concept" | "procedure"
  content: any
  source: string
  confidence: number
  tags: string[]
  relationships: string[]
  timestamp: number
  lastAccessed: number
  accessCount: number
}

export interface ConversationContext {
  sessionId: string
  messages: Array<{
    role: "user" | "assistant" | "system"
    content: string
    timestamp: number
    metadata?: any
  }>
  startTime: number
  lastActivity: number
  messageCount: number
}
