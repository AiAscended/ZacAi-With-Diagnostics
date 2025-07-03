export interface ReasoningStep {
  id: string
  type: ReasoningType
  input: any
  output: any
  reasoning: string
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
  metadata?: Record<string, any>
}

export interface IntentAnalysis {
  intent: string
  confidence: number
  entities: any[]
  context: any
  suggestedModules: string[]
  metadata?: Record<string, any>
}

export interface CognitiveState {
  currentContext: any
  workingMemory: any[]
  longTermMemory: Map<string, any>
  attentionFocus: string[]
  emotionalState: {
    valence: number // -1 to 1 (negative to positive)
    arousal: number // 0 to 1 (calm to excited)
    confidence: number // 0 to 1
  }
  goals: string[]
  beliefs: Map<string, any>
}

export interface LearningEvent {
  id: string
  type: "success" | "failure" | "partial" | "discovery"
  input: string
  output: string
  confidence: number
  feedback?: {
    rating: number
    comments: string
  }
  context: any
  timestamp: number
  source: string
}

export interface MemoryTrace {
  id: string
  content: any
  strength: number
  lastAccessed: number
  accessCount: number
  associations: string[]
  type: "episodic" | "semantic" | "procedural"
  tags: string[]
}

export interface AttentionMechanism {
  focus: string[]
  weights: Map<string, number>
  threshold: number
  decay: number
  update(input: any): void
  getRelevantItems(items: any[]): any[]
}

export interface DecisionNode {
  id: string
  condition: (input: any) => boolean
  action: (input: any) => any
  confidence: number
  children: DecisionNode[]
  parent?: DecisionNode
}

export interface ProblemSolvingStrategy {
  name: string
  description: string
  applicability: (problem: any) => number
  solve: (problem: any) => any
  confidence: number
  steps: string[]
}

export interface MetaCognition {
  selfAwareness: {
    strengths: string[]
    weaknesses: string[]
    knowledge: Map<string, number>
    confidence: Map<string, number>
  }
  monitoring: {
    currentTask: string
    progress: number
    difficulty: number
    timeSpent: number
    effectiveness: number
  }
  control: {
    strategies: ProblemSolvingStrategy[]
    currentStrategy?: string
    adaptations: string[]
  }
}

export interface EmotionalIntelligence {
  selfAwareness: number
  selfRegulation: number
  motivation: number
  empathy: number
  socialSkills: number
  currentEmotion: {
    primary: string
    intensity: number
    triggers: string[]
  }
}

export interface CreativityEngine {
  divergentThinking: {
    fluency: number
    flexibility: number
    originality: number
    elaboration: number
  }
  convergentThinking: {
    analysis: number
    synthesis: number
    evaluation: number
  }
  ideaGeneration: (prompt: string) => string[]
  conceptCombination: (concepts: string[]) => string[]
}

export interface LanguageProcessor {
  tokenize: (text: string) => string[]
  parse: (tokens: string[]) => any
  semanticAnalysis: (parsed: any) => any
  pragmaticAnalysis: (semantic: any, context: any) => any
  generate: (meaning: any) => string
  translate: (text: string, targetLanguage: string) => string
}

export interface KnowledgeIntegrator {
  sources: Map<string, any>
  conflicts: Array<{
    source1: string
    source2: string
    conflictType: string
    resolution?: string
  }>
  integrate: (newKnowledge: any) => void
  resolve: (conflict: any) => any
  validate: (knowledge: any) => boolean
}

export interface AdaptiveLearning {
  learningRate: number
  forgettingCurve: (time: number) => number
  spacedRepetition: {
    intervals: number[]
    difficulty: Map<string, number>
    nextReview: Map<string, number>
  }
  personalizedPath: {
    currentLevel: number
    nextTopics: string[]
    adaptations: string[]
  }
}

export interface ExplanationGenerator {
  generateExplanation: (concept: any, audience: string) => string
  simplify: (explanation: string, level: number) => string
  addExamples: (explanation: string, count: number) => string
  addAnalogies: (concept: any) => string[]
  visualize: (concept: any) => any
}

export interface UncertaintyHandling {
  confidenceCalibration: (prediction: any) => number
  uncertaintyQuantification: (input: any) => {
    epistemic: number // knowledge uncertainty
    aleatoric: number // data uncertainty
  }
  riskAssessment: (decision: any) => {
    probability: number
    impact: number
    mitigation: string[]
  }
}

export interface CausalReasoning {
  causalGraph: {
    nodes: string[]
    edges: Array<{
      cause: string
      effect: string
      strength: number
      type: "direct" | "indirect" | "confounding"
    }>
  }
  interventions: Map<string, any>
  counterfactuals: (scenario: any) => any[]
  causalInference: (observation: any) => any[]
}

export interface TemporalReasoning {
  timeline: Array<{
    event: string
    timestamp: number
    duration?: number
    relationships: string[]
  }>
  sequencing: (events: any[]) => any[]
  prediction: (currentState: any, timeHorizon: number) => any
  planning: (goal: any, constraints: any[]) => any[]
}

export interface CognitiveEngine {
  name: string
  version: string
  initialized: boolean
  initialize(): Promise<void>
  process(input: string, context?: any): Promise<CognitiveResult>
  getStats(): CognitiveStats
}

export interface CognitiveResult {
  response: string
  confidence: number
  reasoning: string[]
  emotions?: string[]
  intent: string
  entities: string[]
  timestamp: number
}

export interface CognitiveStats {
  totalProcessed: number
  averageConfidence: number
  intentsRecognized: { [key: string]: number }
  entitiesExtracted: number
  processingTime: number
}

export interface ReasoningEngine {
  name: string
  version: string
  initialized: boolean
  initialize(): Promise<void>
  reason(input: string, context?: any): Promise<ReasoningResult>
  getStats(): ReasoningStats
}

export interface ReasoningResult {
  conclusion: string
  confidence: number
  steps: ReasoningStep[]
  strategy: string
  evidence: string[]
  assumptions: string[]
  timestamp: number
}

export interface ReasoningStats {
  totalReasoningChains: number
  averageSteps: number
  averageConfidence: number
  successRate: number
  strategiesUsed: { [key: string]: number }
  processingTime: number
}

export interface LearningEngine {
  name: string
  version: string
  initialized: boolean
  initialize(): Promise<void>
  learn(data: LearningData): Promise<LearningResult>
  recall(query: string): Promise<RecallResult>
  getPatterns(): LearningPattern[]
  getStats(): LearningStats
}

export interface LearningData {
  id: string
  content: any
  context: string
  source: string
  timestamp: number
  metadata?: any
}

export interface LearningResult {
  success: boolean
  confidence: number
  patterns: string[]
  connections: string[]
  timestamp: number
}

export interface RecallResult {
  data: any[]
  confidence: number
  relevance: number
  patterns: string[]
  timestamp: number
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

export interface LearningStats {
  totalLearned: number
  patternsIdentified: number
  averageConfidence: number
  retentionRate: number
  processingTime: number
}

export type ReasoningType = "deductive" | "inductive" | "abductive" | "analogical" | "causal" | "temporal"

export interface EngineConfig {
  name: string
  enabled: boolean
  priority: number
  timeout: number
  retries: number
  cacheEnabled: boolean
  debugMode: boolean
}

export interface EngineStats {
  initialized: boolean
  totalProcessed: number
  averageConfidence: number
  processingTime: number
}
