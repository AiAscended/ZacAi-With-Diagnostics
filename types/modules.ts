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
}

export interface FactEntry {
  id: string
  title: string
  content: string
  category: string
  source: string
  confidence: number
  lastVerified: number
  tags: string[]
}

export interface CodeExample {
  id: string
  title: string
  language: string
  code: string
  explanation: string
  difficulty: number
  tags: string[]
}

export interface PhilosophicalConcept {
  id: string
  name: string
  description: string
  philosopher?: string
  school: string
  relatedConcepts: string[]
  arguments: Array<{
    type: "for" | "against"
    argument: string
    source?: string
  }>
}

export interface UserProfile {
  id: string
  name?: string
  preferences: {
    learningStyle: string
    interests: string[]
    difficulty: number
  }
  history: Array<{
    timestamp: number
    query: string
    response: string
    satisfaction?: number
  }>
  stats: {
    totalQueries: number
    favoriteTopics: string[]
    learningProgress: { [topic: string]: number }
  }
}
