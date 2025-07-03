export interface VocabularyEntry {
  word: string
  definition: string
  pronunciation?: string
  partOfSpeech: string
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
  examples: MathExample[]
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
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  source: string
  verified: boolean
  confidence: number
  timestamp: number
  lastUpdated: number
  references: string[]
}

export interface CodeConcept {
  id: string
  name: string
  language: string
  category: string
  description: string
  syntax: string
  examples: CodeExample[]
  bestPractices: string[]
  commonMistakes: string[]
  difficulty: number
  timestamp: number
}

export interface CodeExample {
  title: string
  code: string
  explanation: string
  output?: string
}

export interface PhilosophyConcept {
  id: string
  name: string
  school: string
  philosopher?: string
  era: string
  description: string
  keyIdeas: string[]
  arguments: string[]
  counterArguments: string[]
  relatedConcepts: string[]
  timestamp: number
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
