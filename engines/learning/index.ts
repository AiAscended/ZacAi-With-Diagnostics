import type { LearningPattern } from "@/types/global"
import { generateId, calculateSimilarity } from "@/utils/helpers"

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

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("📚 Initializing Learning Engine...")

    try {
      this.initialized = true
      this.startProcessingQueue()
      console.log("✅ Learning Engine initialized successfully")
    } catch (error) {
      console.error("❌ Learning Engine initialization failed:", error)
      throw error
    }
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

    // Process immediately if queue is getting large
    if (this.learningQueue.length > 10) {
      this.processLearningQueue()
    }
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

  getStats() {
    return {
      initialized: this.initialized,
      queueSize: this.learningQueue.length,
      totalPatterns: this.patterns.length,
      isProcessing: this.isProcessing,
    }
  }
}

export const learningEngine = new LearningEngine()
