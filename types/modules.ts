export interface VocabularyEntry {
  word: string
  definition: string
  pronunciation?: string
  partOfSpeech: string
  phonetics?: string
  examples: string[]
  synonyms: string[]
  antonyms: string[]
  etymology?: string
  difficulty: number
  frequency: number
  timestamp: number
  source: string
}

export interface MathConcept {
  id: string
  name: string
  category: string
  description: string
  formula?: string
  examples: Array<{
    problem: string
    solution: string
    steps: string[]
    explanation: string
  }>
  difficulty: number
  prerequisites: string[]
  applications: string[]
  timestamp: number
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
  language?: string
  description: string
  syntax: string
  examples: Array<{
    code: string
    explanation: string
  }>
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
  id: string
  name?: string
  preferences: {
    learningStyle: string
    interests: string[]
    difficulty: string
    language: string
  }
  history: {
    topics: string[]
    strengths: string[]
    weaknesses: string[]
    progress: { [key: string]: number }
  }
  personalInfo: {
    age?: number
    occupation?: string
    education?: string
    goals: string[]
  }
  timestamp: number
  lastActive: number
}

export interface ModuleConfig {
  name: string
  enabled: boolean
  priority: number
  confidenceThreshold: number
  maxEntries: number
  cacheSize: number
  seedFile?: string
  learntFile?: string
  apiEndpoints?: { [key: string]: string }
}

export interface LearningMetrics {
  totalLearned: number
  accuracyRate: number
  retentionRate: number
  improvementRate: number
  timeSpent: number
  sessionsCompleted: number
  streakDays: number
  lastSession: number
}
