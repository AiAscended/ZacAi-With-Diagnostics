import type { LearningPattern } from "@/types/global"
import { generateId, calculateSimilarity } from "@/utils/helpers"
import { storageManager } from "@/core/storage/manager"

interface LearningEntry {
  id: string
  input: string
  output: string
  confidence: number
  source: string
  context: any
  timestamp: number
  feedback?: "positive" | "negative"
}

export class LearningEngine {
  private initialized = false
  private learningQueue: LearningEntry[] = []
  private patterns: LearningPattern[] = []
  private isProcessing = false
  private learningRate = 0.1
  private learningStats = {
    totalInteractions: 0,
    successfulLearning: 0,
    averageConfidence: 0,
    learningRate: 0,
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    console.log("Initializing Learning Engine...")
    this.initialized = true
    this.startProcessingQueue()
  }

  async learnFromInteraction(
    input: string,
    response: string,
    confidence: number,
    source: string,
    context: any,
  ): Promise<void> {
    const learningEntry: LearningEntry = {
      id: generateId(),
      input,
      output: response,
      confidence,
      source,
      context,
      timestamp: Date.now(),
    }

    this.learningQueue.push(learningEntry)
    this.updateStats(learningEntry)

    // Process immediately if queue is getting large
    if (this.learningQueue.length > 10) {
      this.processLearningQueue()
    }
  }

  async learn(input: string, response: any): Promise<void> {
    if (!response) return

    const learningEntry: LearningEntry = {
      id: generateId(),
      input,
      output: typeof response === "string" ? response : JSON.stringify(response),
      confidence: response.confidence || 0.5,
      source: response.source || "unknown",
      context: { timestamp: Date.now() },
      timestamp: Date.now(),
    }

    this.learningQueue.push(learningEntry)
    this.updateStats(learningEntry)
  }

  private startProcessingQueue(): void {
    setInterval(() => {
      if (this.learningQueue.length > 0) {
        this.processLearningQueue()
      }
    }, 5000) // Process every 5 seconds
  }

  private async processLearningQueue(): Promise<void> {
    if (this.isProcessing || this.learningQueue.length === 0) return

    this.isProcessing = true

    try {
      const batch = this.learningQueue.splice(0, 5) // Process 5 at a time

      for (const interaction of batch) {
        await this.processInteraction(interaction)
      }

      // Update patterns
      await this.updatePatterns()
    } catch (error) {
      console.error("Error processing learning queue:", error)
    } finally {
      this.isProcessing = false
    }
  }

  private async processInteraction(interaction: LearningEntry): Promise<void> {
    // Extract keywords from input
    const keywords = this.extractKeywords(interaction.input)

    // Look for similar past interactions
    const similarPatterns = this.findSimilarPatterns(interaction.input)

    // Create or update pattern
    if (similarPatterns.length > 0) {
      // Update existing pattern
      const pattern = similarPatterns[0]
      pattern.frequency++
      pattern.confidence = (pattern.confidence + interaction.confidence) * this.learningRate
      pattern.timestamp = Date.now()
    } else {
      // Create new pattern
      const newPattern: LearningPattern = {
        id: generateId(),
        pattern: interaction.input,
        frequency: 1,
        confidence: interaction.confidence,
        context: keywords,
        timestamp: Date.now(),
      }
      this.patterns.push(newPattern)
    }

    // Keep patterns manageable
    if (this.patterns.length > 1000) {
      this.patterns = this.patterns.sort((a, b) => b.frequency - a.frequency).slice(0, 1000)
    }
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 10)
  }

  private findSimilarPatterns(input: string): LearningPattern[] {
    return this.patterns
      .filter((pattern) => calculateSimilarity(pattern.pattern, input) > 0.7)
      .sort((a, b) => b.frequency - a.frequency)
  }

  private async updatePatterns(): Promise<void> {
    // Remove old, low-frequency patterns
    const cutoffTime = Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days
    this.patterns = this.patterns.filter((pattern) => pattern.timestamp > cutoffTime || pattern.frequency > 5)

    // Sort by relevance (frequency * confidence)
    this.patterns.sort((a, b) => {
      const scoreA = a.frequency * a.confidence
      const scoreB = b.frequency * b.confidence
      return scoreB - scoreA
    })
  }

  async identifyPatterns(): Promise<LearningPattern[]> {
    return this.patterns.slice(0, 20) // Return top 20 patterns
  }

  async forceProcessQueue(): Promise<void> {
    while (this.learningQueue.length > 0) {
      await this.processLearningQueue()
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  private groupEntriesBySource(entries: LearningEntry[]): { [source: string]: LearningEntry[] } {
    return entries.reduce(
      (groups, entry) => {
        const source = entry.source || "general"
        if (!groups[source]) groups[source] = []
        groups[source].push(entry)
        return groups
      },
      {} as { [source: string]: LearningEntry[] },
    )
  }

  private async saveLearningEntries(source: string, entries: LearningEntry[]): Promise<void> {
    try {
      const filePath = this.getFilePath(source)

      for (const entry of entries) {
        const learntEntry = {
          id: entry.id,
          content: {
            input: entry.input,
            output: entry.output,
            confidence: entry.confidence,
            context: entry.context,
          },
          confidence: entry.confidence,
          source: entry.source,
          context: entry.input,
          timestamp: entry.timestamp,
          usageCount: 1,
          lastUsed: entry.timestamp,
          verified: entry.confidence > 0.7,
          tags: this.generateTags(entry),
          relationships: [],
        }

        await storageManager.addLearntEntry(filePath, learntEntry)
      }
    } catch (error) {
      console.error(`Error saving learning entries for ${source}:`, error)
    }
  }

  private getFilePath(source: string): string {
    const fileMap: { [key: string]: string } = {
      vocabulary: "/learnt/vocabulary.json",
      mathematics: "/learnt/mathematics.json",
      facts: "/learnt/facts.json",
      coding: "/learnt/coding.json",
      philosophy: "/learnt/philosophy.json",
      "user-info": "/learnt/user-profile.json",
    }

    return fileMap[source] || "/learnt/general.json"
  }

  private generateTags(entry: LearningEntry): string[] {
    const tags = [entry.source]

    if (entry.confidence > 0.8) tags.push("high-confidence")
    if (entry.confidence < 0.5) tags.push("low-confidence")

    // Add content-based tags
    const input = entry.input.toLowerCase()
    if (input.includes("define")) tags.push("definition")
    if (input.includes("calculate")) tags.push("calculation")
    if (input.includes("explain")) tags.push("explanation")

    return tags
  }

  private updateStats(entry: LearningEntry): void {
    this.learningStats.totalInteractions++

    if (entry.confidence > 0.7) {
      this.learningStats.successfulLearning++
    }

    // Update average confidence
    this.learningStats.averageConfidence =
      (this.learningStats.averageConfidence * (this.learningStats.totalInteractions - 1) + entry.confidence) /
      this.learningStats.totalInteractions

    // Update learning rate (successful learning / total interactions)
    this.learningStats.learningRate = this.learningStats.successfulLearning / this.learningStats.totalInteractions
  }

  getLearningStats() {
    return {
      ...this.learningStats,
      queueSize: this.learningQueue.length,
      initialized: this.initialized,
    }
  }

  getStats() {
    return this.getLearningStats()
  }

  destroy(): void {
    this.learningQueue = []
    this.patterns = []
    this.initialized = false
  }
}

export const learningEngine = new LearningEngine()
