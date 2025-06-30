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
}

export interface MathConcept {
  name: string
  description: string
  formula?: string
  category: string
  difficulty: number
  examples: MathExample[]
  applications: string[]
}

export interface MathExample {
  problem: string
  solution: string
  explanation: string
  steps: string[]
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
  output?: string
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
  name?: string
  preferences: { [key: string]: any }
  learningHistory: LearningRecord[]
  interests: string[]
  skillLevel: { [domain: string]: number }
}

export interface LearningRecord {
  topic: string
  timestamp: number
  confidence: number
  source: string
  context: string
}
