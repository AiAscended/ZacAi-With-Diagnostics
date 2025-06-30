import type { LearningEvent, LearningPattern, PatternRecognition } from "@/types/engines"
import { generateId } from "@/utils/helpers"

export class LearningEngine {
  private events: LearningEvent[] = []
  private patterns: Map<string, LearningPattern> = new Map()
  private learningQueue: LearningEvent[] = []
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return
    console.log("Initializing Learning Engine...")
    this.initialized = true
    console.log("Learning Engine initialized successfully")
  }

  async recordEvent(event: Omit<LearningEvent, "id">): Promise<void> {
    const learningEvent: LearningEvent = {
      ...event,
      id: generateId(),
    }

    this.events.push(learningEvent)
    this.learningQueue.push(learningEvent)

    // Process learning queue periodically
    if (this.learningQueue.length >= 10) {
      await this.processLearningQueue()
    }
  }

  private async processLearningQueue(): Promise<void> {
    const eventsToProcess = [...this.learningQueue]
    this.learningQueue = []

    for (const event of eventsToProcess) {
      await this.analyzeEvent(event)
    }

    await this.updatePatterns()
  }

  private async analyzeEvent(event: LearningEvent): Promise<void> {
    // Analyze event for patterns
    const eventSignature = this.createEventSignature(event)

    // Check for existing similar patterns
    const similarPatterns = this.findSimilarPatterns(eventSignature)

    if (similarPatterns.length > 0) {
      // Update existing pattern
      const mostSimilar = similarPatterns[0]
      mostSimilar.occurrences++
      mostSimilar.lastSeen = Date.now()
      mostSimilar.confidence = Math.min(0.95, mostSimilar.confidence + 0.05)
    } else {
      // Create new pattern
      const newPattern: LearningPattern = {
        id: generateId(),
        type: event.type,
        pattern: eventSignature,
        confidence: event.confidence,
        occurrences: 1,
        lastSeen: Date.now(),
        effectiveness: 0.5, // Initial effectiveness
      }

      this.patterns.set(newPattern.id, newPattern)
    }
  }

  private createEventSignature(event: LearningEvent): any {
    return {
      type: event.type,
      source: event.source,
      dataType: typeof event.data,
      confidence: Math.round(event.confidence * 10) / 10, // Round to 1 decimal
      verified: event.verified,
    }
  }

  private findSimilarPatterns(signature: any): LearningPattern[] {
    const similar: Array<{ pattern: LearningPattern; similarity: number }> = []

    for (const pattern of this.patterns.values()) {
      const similarity = this.calculatePatternSimilarity(signature, pattern.pattern)
      if (similarity > 0.7) {
        similar.push({ pattern, similarity })
      }
    }

    return similar.sort((a, b) => b.similarity - a.similarity).map((item) => item.pattern)
  }

  private calculatePatternSimilarity(sig1: any, sig2: any): number {
    let matches = 0
    let total = 0

    const keys = new Set([...Object.keys(sig1), ...Object.keys(sig2)])

    for (const key of keys) {
      total++
      if (sig1[key] === sig2[key]) {
        matches++
      } else if (typeof sig1[key] === "number" && typeof sig2[key] === "number") {
        // For numbers, consider close values as similar
        const diff = Math.abs(sig1[key] - sig2[key])
        if (diff < 0.2) matches += 0.8
      }
    }

    return total > 0 ? matches / total : 0
  }

  private async updatePatterns(): Promise<void> {
    // Remove old, ineffective patterns
    const cutoffTime = Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days

    for (const [id, pattern] of this.patterns.entries()) {
      if (pattern.lastSeen < cutoffTime && pattern.effectiveness < 0.3) {
        this.patterns.delete(id)
      }
    }

    // Update pattern effectiveness based on recent usage
    for (const pattern of this.patterns.values()) {
      const recentEvents = this.events.filter(
        (e) =>
          e.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000 && // Last 7 days
          e.type === pattern.type,
      )

      if (recentEvents.length > 0) {
        const avgConfidence = recentEvents.reduce((sum, e) => sum + e.confidence, 0) / recentEvents.length
        pattern.effectiveness = (pattern.effectiveness + avgConfidence) / 2
      }
    }
  }

  async recognizePatterns(input: string, context?: any): Promise<PatternRecognition> {
    const relevantPatterns = Array.from(this.patterns.values())
      .filter((p) => p.effectiveness > 0.5)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10)

    const confidence =
      relevantPatterns.length > 0
        ? relevantPatterns.reduce((sum, p) => sum + p.confidence, 0) / relevantPatterns.length
        : 0

    const recommendations = this.generateRecommendations(relevantPatterns, input, context)

    return {
      patterns: relevantPatterns,
      confidence,
      recommendations,
    }
  }

  private generateRecommendations(patterns: LearningPattern[], input: string, context?: any): string[] {
    const recommendations: string[] = []

    // Analyze patterns for recommendations
    const highConfidencePatterns = patterns.filter((p) => p.confidence > 0.8)
    if (highConfidencePatterns.length > 0) {
      recommendations.push("High confidence patterns detected - responses likely to be accurate")
    }

    const recentPatterns = patterns.filter(
      (p) => Date.now() - p.lastSeen < 24 * 60 * 60 * 1000, // Last 24 hours
    )
    if (recentPatterns.length > 0) {
      recommendations.push("Recent similar queries found - leveraging recent learning")
    }

    const frequentPatterns = patterns.filter((p) => p.occurrences > 5)
    if (frequentPatterns.length > 0) {
      recommendations.push("Frequently encountered patterns - well-established knowledge")
    }

    return recommendations
  }

  getStats(): any {
    return {
      initialized: this.initialized,
      totalEvents: this.events.length,
      totalPatterns: this.patterns.size,
      queueSize: this.learningQueue.length,
      patternTypes: [...new Set(Array.from(this.patterns.values()).map((p) => p.type))],
      averageConfidence:
        this.patterns.size > 0
          ? Array.from(this.patterns.values()).reduce((sum, p) => sum + p.confidence, 0) / this.patterns.size
          : 0,
    }
  }
}

export const learningEngine = new LearningEngine()
