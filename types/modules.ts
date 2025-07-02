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
  examples: Array<{
    problem: string
    solution: string
    explanation: string
  }>
  difficulty: number
  category: string
  prerequisites: string[]
}

export interface FactEntry {
  title: string
  content: string
  category: string
  source: string
  verified: boolean
  lastUpdated: number
  tags: string[]
  relatedTopics: string[]
}

export interface CodingConcept {
  name: string
  language: string
  description: string
  syntax: string
  examples: Array<{
    code: string
    explanation: string
    output?: string
  }>
  difficulty: number
  category: string
  bestPractices: string[]
}

export interface PhilosophicalConcept {
  name: string
  description: string
  philosopher?: string
  school: string
  keyIdeas: string[]
  relatedConcepts: string[]
  historicalContext?: string
  modernRelevance?: string
}

export interface UserPreference {
  key: string
  value: any
  category: string
  lastUpdated: number
  source: string
}

export interface LearningPattern {
  id: string
  pattern: string
  frequency: number
  confidence: number
  context: string[]
  timestamp: number
}
