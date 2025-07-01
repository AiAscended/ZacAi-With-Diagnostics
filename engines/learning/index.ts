import type { LearningEngineInterface } from "@/types/engines"
import { generateId } from "@/utils/helpers"

interface LearningEntry {
  id: string
  input: string
  output: string
  confidence: number
  source: string
  context: any
  timestamp: number
  feedback?: "positive" | "negative"
  useCount: number
}

export class LearningEngine implements LearningEngineInterface {
  private initialized = false
  private learningQueue: LearningEntry[] = []
  private patterns: Map<string, any> = new Map()
  private stats = {
    totalInteractions: 0,
    successfulLearning: 0,
    averageConfidence: 0,
    lastLearningTime: 0,
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("Initializing Learning Engine...")
    this.initialized = true
    console.log("Learning Engine initialized")
  }

  async learnFromInteraction(
    input: string,
    output: string,
    confidence: number,
    source: string,
    context: any,
  ): Promise<void> {
    const entry: LearningEntry = {
      id: generateId(),
      input,
      output,
      confidence,
      source,
      context,
      timestamp: Date.now(),
      useCount: 1,
    }

    this.learningQueue.push(entry)
    this.stats.totalInteractions++

    // Process learning if confidence is high enough
    if (confidence > 0.7) {
      await this.processLearningEntry(entry)
      this.stats.successfulLearning++
    }

    // Update average confidence
    this.stats.averageConfidence =
      (this.stats.averageConfidence * (this.stats.totalInteractions - 1) + confidence) / this.stats.totalInteractions

    this.stats.lastLearningTime = Date.now()

    // Maintain queue size
    if (this.learningQueue.length > 1000) {
      this.learningQueue = this.learningQueue.slice(-1000)
    }
  }

  private async processLearningEntry(entry: LearningEntry): Promise<void> {
    // Extract patterns from successful interactions
    const inputKeywords = entry.input
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2)
    const pattern = {
      keywords: inputKeywords,
      source: entry.source,
      confidence: entry.confidence,
      timestamp: entry.timestamp,
    }

    // Store pattern for future reference
    const patternKey = inputKeywords.slice(0, 3).join("_")
    if (!this.patterns.has(patternKey)) {
      this.patterns.set(patternKey, [])
    }
    this.patterns.get(patternKey)!.push(pattern)

    // Limit patterns per key
    const patterns = this.patterns.get(patternKey)!
    if (patterns.length > 10) {
      this.patterns.set(patternKey, patterns.slice(-10))
    }
  }

  async forceProcessQueue(): Promise<void> {
    console.log(`Processing ${this.learningQueue.length} learning entries...`)

    for (const entry of this.learningQueue) {
      if (entry.confidence > 0.5) {
        await this.processLearningEntry(entry)
      }
    }

    console.log("Learning queue processed")
  }

  getLearningStats(): any {
    return {
      ...this.stats,
      queueSize: this.learningQueue.length,
      patternCount: this.patterns.size,
      initialized: this.initialized,
    }
  }

  destroy(): void {
    this.learningQueue = []
    this.patterns.clear()
    this.initialized = false
  }

  // Additional methods for pattern matching and recommendations
  findSimilarPatterns(input: string): any[] {
    const inputKeywords = input
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2)
    const matches: any[] = []

    for (const [key, patterns] of this.patterns.entries()) {
      const keyWords = key.split("_")
      const overlap = inputKeywords.filter((word) => keyWords.includes(word))

      if (overlap.length > 0) {
        matches.push({
          key,
          patterns,
          similarity: overlap.length / Math.max(inputKeywords.length, keyWords.length),
        })
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 5)
  }

  getRecommendations(input: string): string[] {
    const similarPatterns = this.findSimilarPatterns(input)
    const recommendations: string[] = []

    for (const match of similarPatterns) {
      const bestPattern = match.patterns.sort((a: any, b: any) => b.confidence - a.confidence)[0]
      if (bestPattern && bestPattern.source) {
        recommendations.push(`Try ${bestPattern.source} module`)
      }
    }

    return [...new Set(recommendations)].slice(0, 3)
  }
}

export const learningEngine = new LearningEngine()
