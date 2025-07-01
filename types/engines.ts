// Type definitions for reasoning and learning engines
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
  lastSeen: number
  examples: string[]
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
