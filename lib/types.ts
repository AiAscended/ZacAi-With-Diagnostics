// COMPLETE TYPE DEFINITIONS FOR ZACAI MASTER SYSTEM

export interface VocabularyEntry {
  word: string
  definition: string
  partOfSpeech: string
  examples: string[]
  source: string
  confidence: number
  phonetic: string
  synonyms: string[]
  antonyms: string[]
  frequency: number
  timestamp: number
  category: string
}

export interface WordEntry {
  word: string
  definition: string
  partOfSpeech?: string
  examples?: string[]
  phonetic?: string
  synonyms?: string[]
  antonyms?: string[]
}

export interface MathEntry {
  concept: string
  type: string
  formula: string
  category: string
  source: string
  confidence: number
  timestamp: number
  difficulty: number
  examples: string[]
}

export interface PersonalInfoEntry {
  key: string
  value: string
  timestamp: number
  importance: number
  type: string
  source: string
  category: string
}

export interface FactEntry {
  topic: string
  content: string
  category: string
  source: string
  confidence: number
  timestamp: number
  importance: number
  verified: boolean
}

export interface CodingEntry {
  concept: string
  language: string
  description: string
  examples: string[]
  source: string
  confidence: number
  timestamp: number
  difficulty: number
  category: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  reasoning?: string[]
  mathAnalysis?: any
}

export interface ThoughtNode {
  id: number
  content: string
  type: string
  confidence: number
  timestamp: number
  emoji: string
}

export interface SystemIdentity {
  name: string
  version: string
  purpose: string
}

export interface ReasoningEngineResponse {
  content: string
  confidence: number
  reasoning: string[]
  knowledgeUsed: string[]
  mathAnalysis?: any
  teslaAnalysis?: any
  processingTime: number
  thinking: ThoughtNode[]
  systemStatus: string
  connectionStatus: string
}

export interface AIResponse {
  content: string
  confidence: number
  reasoning?: string[]
  mathAnalysis?: any
}

export interface SystemStats {
  vocabulary: {
    total: number
    learned: number
    seed: number
  }
  mathematics: {
    total: number
    calculations: number
    functions: number
  }
  facts: {
    total: number
    verified: number
  }
  conversations: number
  avgConfidence: number
  vocabularySize: number
  mathFunctions: number
  memoryEntries: number
  totalMessages: number
  seedProgress: number
  responseTime: number
  vocabularyData: Map<string, any>
  memoryData: Map<string, any>
  personalInfoData: Map<string, any>
  factsData: Map<string, any>
  mathFunctionsData: Map<string, any>
  learnedVocabulary: number
  learnedMathematics: number
  learnedScience: number
  learnedCoding: number
  apiStatus: any
  currentDateTime: any
  batchQueueSize: number
  systemName: string
  systemVersion: string
}

export interface PatternMatch {
  intent: string
  confidence: number
  matches?: any[]
}

export interface Pattern {
  pattern: RegExp
  intent: string
  confidence: number
}

export interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: number
}

export interface VocabularyLoader {
  loadVocabulary(): Promise<void>
  getWord(word: string): WordEntry | null
}
