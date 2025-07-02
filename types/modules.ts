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
  category: string
  difficulty: number
  prerequisites?: string[]
}

export interface FactEntry {
  id: string
  title: string
  content: string
  category: string
  source: string
  verified: boolean
  tags: string[]
  lastUpdated: number
  confidence: number
  relatedTopics: string[]
}

export interface CodeExample {
  id: string
  title: string
  description: string
  language: string
  code: string
  explanation: string
  difficulty: "beginner" | "intermediate" | "advanced"
  tags: string[]
  category: string
}

export interface CodingConcept {
  name: string
  language: string
  description: string
  syntax: string
  examples: Array<{
    title: string
    code: string
    explanation: string
  }>
  difficulty: number
  category: string
}

export interface PhilosophicalConcept {
  id: string
  name: string
  description: string
  philosopher?: string
  school?: string
  period?: string
  keyIdeas: string[]
  relatedConcepts: string[]
  arguments: string[]
  counterArguments: string[]
}

export interface UserProfile {
  id: string
  name?: string
  preferences: { [key: string]: any }
  learningHistory: Array<{
    topic: string
    timestamp: number
    confidence: number
    source: string
    context: string
  }>
  personalInfo: Record<string, any>
  settings: {
    notifications: boolean
    darkMode: boolean
    autoSave: boolean
  }
  interests: string[]
  skillLevel: { [key: string]: number }
}

export interface LearningPattern {
  id: string
  pattern: string
  frequency: number
  confidence: number
  context: string[]
  timestamp: number
  category?: string
  effectiveness?: number
}

export interface KnowledgeGraph {
  nodes: Array<{
    id: string
    label: string
    type: string
    properties: Record<string, any>
  }>
  edges: Array<{
    source: string
    target: string
    relationship: string
    weight: number
  }>
}

export interface SearchResult {
  id: string
  title: string
  content: string
  relevance: number
  source: string
  type: "vocabulary" | "math" | "fact" | "code" | "philosophy"
  metadata: Record<string, any>
}

export interface LearningObjective {
  id: string
  title: string
  description: string
  targetSkills: string[]
  prerequisites: string[]
  estimatedTime: number
  difficulty: number
  progress: number
  completed: boolean
}

export interface AssessmentResult {
  id: string
  userId: string
  topic: string
  score: number
  maxScore: number
  timeSpent: number
  answers: Array<{
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanation: string
  }>
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  timestamp: number
}

export interface ModuleConfig {
  name: string
  enabled: boolean
  priority: number
  settings: Record<string, any>
  dependencies: string[]
  version: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  modules: string[]
  estimatedDuration: number
  difficulty: number
  prerequisites: string[]
  objectives: LearningObjective[]
  progress: number
}

export interface ContentRecommendation {
  id: string
  type: "vocabulary" | "math" | "fact" | "code" | "philosophy"
  title: string
  description: string
  relevance: number
  difficulty: number
  estimatedTime: number
  reason: string
}

export interface PerformanceMetrics {
  accuracy: number
  speed: number
  retention: number
  engagement: number
  improvement: number
  consistency: number
}

export interface LearningSession {
  id: string
  userId: string
  startTime: number
  endTime?: number
  topics: string[]
  activities: Array<{
    type: string
    content: string
    duration: number
    performance: number
  }>
  totalTime: number
  performance: PerformanceMetrics
  notes?: string
}
