// Module-specific type definitions
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
  phonetics?: string
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
  id: string
  topic: string
  fact: string
  category: string
  sources: string[]
  reliability: number
  lastVerified: number
  relatedFacts: string[]
}

export interface CodingConcept {
  id: string
  language: string
  concept: string
  description: string
  examples: CodeExample[]
  bestPractices: string[]
  commonMistakes: string[]
}

export interface CodeExample {
  title: string
  code: string
  explanation: string
  output?: string
}

export interface PhilosophicalConcept {
  id: string
  name: string
  description: string
  philosopher: string
  school: string
  relatedConcepts: string[]
  arguments: string[]
  counterArguments: string[]
}

export interface UserProfile {
  name?: string
  preferences: {
    responseStyle: "brief" | "detailed" | "technical"
    topics: string[]
    learningLevel: "beginner" | "intermediate" | "advanced"
  }
  history: {
    commonQuestions: string[]
    learningProgress: { [topic: string]: number }
    lastActive: number
  }
}

export interface MathOperation {
  type: string
  operation: string
  result: number | string
  steps: string[]
  confidence: number
  method: string
}

export interface TeslaVortexResult {
  input: number
  pattern: number[]
  vortexMap: string
  explanation: string
  digitalRoot: number
}

export interface SacredGeometryResult {
  shape: string
  properties: any
  calculations: any
  significance: string
}
