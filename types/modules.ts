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
  name: string
  description: string
  formula?: string
  examples: MathExample[]
  difficulty: number
  category: string
}

export interface MathExample {
  problem: string
  solution: string
  explanation: string
  steps: string[]
}

export interface FactEntry {
  title: string
  content: string
  category: string
  source: string
  reliability: number
  lastVerified: number
  tags: string[]
  relatedFacts: string[]
}

export interface CodeExample {
  language: string
  code: string
  description: string
  concepts: string[]
  difficulty: number
  category: string
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

export interface UserPreference {
  key: string
  value: any
  category: string
  timestamp: number
  confidence: number
}
