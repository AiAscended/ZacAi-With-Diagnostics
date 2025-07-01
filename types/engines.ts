// Type definitions for reasoning and learning engines
export interface ReasoningEngine {
  initialize(): Promise<void>
  createReasoningChain(input: string, context: any, moduleResponses: any[]): Promise<ReasoningChain>
  getStats(): any
}

export interface LearningEngine {
  initialize(): Promise<void>
  learnFromInteraction(input: string, output: string, confidence: number, source: string, context: any): Promise<void>
  getLearningStats(): any
  forceProcessQueue(): Promise<void>
  destroy(): void
}

export interface ReasoningChain {
  id: string
  input: string
  steps: ReasoningStep[]
  finalOutput: any
  totalConfidence: number
  timestamp: number
}

export interface ReasoningStep {
  step: number
  reasoning: string
  confidence: number
  output: any
  timestamp: number
}

export interface IntentAnalysis {
  intent: string
  confidence: number
  entities: any[]
  context: any
  suggestedModules: string[]
}

export interface LearningPattern {
  id: string
  pattern: string
  frequency: number
  confidence: number
  context: string[]
  timestamp: number
}

export interface LearningEngineStats {
  totalLearned: number
  learningRate: number
  retentionRate: number
  averageConfidence: number
  lastLearningSession: number
}

export interface CognitiveState {
  currentFocus: string[]
  workingMemory: any[]
  longTermMemory: any[]
  attentionLevel: number
  processingLoad: number
}

export interface DecisionTree {
  id: string
  root: DecisionNode
  confidence: number
  alternatives: DecisionPath[]
}

export interface DecisionNode {
  id: string
  condition: string
  trueNode?: DecisionNode
  falseNode?: DecisionNode
  action?: string
  confidence: number
}

export interface DecisionPath {
  path: string[]
  confidence: number
  outcome: any
}

export interface MemoryTrace {
  id: string
  content: any
  strength: number
  lastAccessed: number
  accessCount: number
  associations: string[]
}

export interface ConceptMap {
  concepts: ConceptNode[]
  relationships: ConceptRelationship[]
  centrality: { [conceptId: string]: number }
}

export interface ConceptNode {
  id: string
  label: string
  type: string
  properties: any
  activation: number
}

export interface ConceptRelationship {
  id: string
  source: string
  target: string
  type: string
  strength: number
}

export interface InferenceRule {
  id: string
  condition: string
  conclusion: string
  confidence: number
  domain: string
}

export interface ReasoningStrategy {
  name: string
  description: string
  applicability: (context: any) => number
  execute: (input: any, context: any) => Promise<any>
}

export interface LearningObjective {
  id: string
  description: string
  domain: string
  difficulty: number
  prerequisites: string[]
  success_criteria: string[]
}

export interface AdaptationRule {
  trigger: string
  condition: (state: any) => boolean
  action: (state: any) => any
  priority: number
}
