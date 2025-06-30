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
  formula?: string
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

export interface CodeSnippet {
  id: string
  title: string
  language: string
  code: string
  description: string
  tags: string[]
  difficulty: number
  examples: string[]
  documentation?: string
}

export interface PhilosophicalConcept {
  id: string
  name: string
  description: string
  philosopher?: string
  school: string
  relatedConcepts: string[]
  arguments: string[]
  counterArguments: string[]
  modernRelevance: string
}

export interface UserProfile {
  id: string
  preferences: {
    learningStyle: string
    difficultyLevel: number
    interests: string[]
    goals: string[]
  }
  history: {
    totalInteractions: number
    favoriteTopics: string[]
    learningProgress: { [key: string]: number }
    achievements: string[]
  }
  settings: {
    responseStyle: string
    verbosity: number
    showSources: boolean
    showReasoning: boolean
  }
}
