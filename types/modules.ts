// Type definitions for all modules
export interface VocabularyEntry {
  word: string
  definition: string
  partOfSpeech: string
  examples: string[]
  synonyms: string[]
  antonyms: string[]
  difficulty: number
  frequency: number
  etymology?: string
  pronunciation?: string
}

export interface MathConcept {
  id: string
  name: string
  formula: string
  description: string
  category: string
  difficulty: number
  prerequisites: string[]
  applications: string[]
  examples: MathExample[]
}

export interface MathExample {
  problem: string
  solution: string
  steps: string[]
  explanation: string
}

export interface FactEntry {
  topic: string
  content: string
  source: string
  category: string
  verified: boolean
  lastUpdated: number
  relatedTopics: string[]
}

export interface CodingConcept {
  name: string
  language: string
  description: string
  syntax: string
  examples: CodeExample[]
  difficulty: number
  category: string
}

export interface CodeExample {
  title: string
  code: string
  explanation: string
}

export interface PhilosophicalConcept {
  name: string
  description: string
  philosopher?: string
  school: string
  relatedConcepts: string[]
  arguments: string[]
  counterArguments: string[]
}

export interface UserProfile {
  preferences: { [key: string]: any }
  learningHistory: LearningHistoryEntry[]
  interests: string[]
  skillLevel: { [domain: string]: number }
}

export interface LearningHistoryEntry {
  topic: string
  timestamp: number
  confidence: number
  source: string
  context: string
}

export interface ModuleConfig {
  seedFile: string
  learntFile: string
  apiEndpoints: { [key: string]: string }
  cacheTimeout: number
}

export interface ProcessingResult {
  success: boolean
  data: any
  confidence: number
  processingTime: number
  sources: string[]
  metadata?: any
}

export interface LearningPattern {
  id: string
  pattern: string
  frequency: number
  confidence: number
  lastSeen: number
  examples: string[]
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

export interface KnowledgeNode {
  id: string
  type: string
  label: string
  properties: { [key: string]: any }
}

export interface KnowledgeEdge {
  id: string
  source: string
  target: string
  relationship: string
  weight: number
}

export interface SearchResult {
  id: string
  content: any
  relevance: number
  source: string
  timestamp: number
}

export interface ValidationResult {
  isValid: boolean
  confidence: number
  issues: string[]
  suggestions: string[]
}
