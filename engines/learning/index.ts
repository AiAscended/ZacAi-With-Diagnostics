// Learning engine for pattern recognition and knowledge acquisition
import type { LearningPattern, LearningEngineStats } from "@/types/engines"
import { generateId, calculateSimilarity } from "@/utils/helpers"

export class LearningEngine {
  private initialized = false
  private patterns: Map<string, LearningPattern> = new Map()
  private learningQueue: any[] = []
  private stats: LearningEngineStats = {
    totalLearned: 0,
    learningRate: 0,
    retentionRate: 0.85,
    averageConfidence: 0,
    lastLearningSession: 0,
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("Initializing Learning Engine...")

    // Start background learning processor
    this.startLearningProcessor()

    this.initialized = true
    console.log("Learning Engine initialized successfully")
  }

  async learnFromInteraction(
    input: string,
    response: string,
    confidence: number,
    source: string,
    context: any,
  ): Promise<void> {
    const learningData = {
      id: generateId(),
      input,
      response,
      confidence,
      source,
      context,
      timestamp: Date.now(),
      processed: false,
    }

    this.learningQueue.push(learningData)

    // Process immediately if queue is small
    if (this.learningQueue.length < 5) {
      await this.processLearningQueue()
    }
  }

  private async processLearningQueue(): Promise<void> {
    if (this.learningQueue.length === 0) return

    const batch = this.learningQueue.splice(0, 10) // Process in batches

    for (const item of batch) {
      await this.processLearningItem(item)
    }

    this.stats.lastLearningSession = Date.now()
  }

  private async processLearningItem(item: any): Promise<void> {
    try {
      // Extract patterns from the interaction
      const patterns = this.extractPatterns(item)

      // Update existing patterns or create new ones
      for (const pattern of patterns) {
        await this.updatePattern(pattern)
      }

      // Update learning statistics
      this.updateLearningStats(item)

      item.processed = true
      this.stats.totalLearned++
    } catch (error) {
      console.error("Error processing learning item:", error)
    }
  }

  private extractPatterns(item: any): LearningPattern[] {
    const patterns: LearningPattern[] = []

    // Input-Response pattern
    const inputResponsePattern: LearningPattern = {
      id: generateId(),
      pattern: `${item.input} -> ${item.response}`,
      frequency: 1,
      confidence: item.confidence,
      lastSeen: item.timestamp,
      examples: [item.input],
    }
    patterns.push(inputResponsePattern)

    // Source-specific patterns
    if (item.source) {
      const sourcePattern: LearningPattern = {
        id: generateId(),
        pattern: `source:${item.source}`,
        frequency: 1,
        confidence: item.confidence,
        lastSeen: item.timestamp,
        examples: [item.input],
      }
      patterns.push(sourcePattern)
    }

    // Context patterns
    if (item.context && item.context.topics) {
      for (const topic of item.context.topics.slice(0, 5)) {
        const topicPattern: LearningPattern = {
          id: generateId(),
          pattern: `topic:${topic}`,
          frequency: 1,
          confidence: item.confidence,
          lastSeen: item.timestamp,
          examples: [item.input],
        }
        patterns.push(topicPattern)
      }
    }

    return patterns
  }

  private async updatePattern(newPattern: LearningPattern): Promise<void> {
    // Look for similar existing patterns
    let existingPattern: LearningPattern | null = null
    let maxSimilarity = 0

    for (const [id, pattern] of this.patterns.entries()) {
      const similarity = calculateSimilarity(pattern.pattern, newPattern.pattern)
      if (similarity > 0.8 && similarity > maxSimilarity) {
        maxSimilarity = similarity
        existingPattern = pattern
      }
    }

    if (existingPattern) {
      // Update existing pattern
      existingPattern.frequency++
      existingPattern.confidence = (existingPattern.confidence + newPattern.confidence) / 2
      existingPattern.lastSeen = newPattern.lastSeen
      existingPattern.examples.push(...newPattern.examples)

      // Keep only recent examples
      if (existingPattern.examples.length > 10) {
        existingPattern.examples = existingPattern.examples.slice(-10)
      }
    } else {
      // Create new pattern
      this.patterns.set(newPattern.id, newPattern)
    }
  }

  private updateLearningStats(item: any): void {
    // Update learning rate (items learned per hour)
    const hoursSinceStart = (Date.now() - (this.stats.lastLearningSession || Date.now())) / 3600000
    if (hoursSinceStart > 0) {
      this.stats.learningRate = this.stats.totalLearned / hoursSinceStart
    }

    // Update average confidence
    this.stats.averageConfidence =
      (this.stats.averageConfidence * this.stats.totalLearned + item.confidence) / (this.stats.totalLearned + 1)
  }

  private startLearningProcessor(): void {
    // Process learning queue every 30 seconds
    setInterval(async () => {
      if (this.learningQueue.length > 0) {
        await this.processLearningQueue()
      }
    }, 30000)

    // Clean up old patterns every hour
    setInterval(() => {
      this.cleanupOldPatterns()
    }, 3600000)
  }

  private cleanupOldPatterns(): void {
    const cutoff = Date.now() - 7 * 24 * 3600000 // 7 days

    for (const [id, pattern] of this.patterns.entries()) {
      if (pattern.lastSeen < cutoff && pattern.frequency < 3) {
        this.patterns.delete(id)
      }
    }
  }

  async forceProcessQueue(): Promise<void> {
    await this.processLearningQueue()
  }

  getPatterns(): LearningPattern[] {
    return Array.from(this.patterns.values())
  }

  getTopPatterns(limit = 10): LearningPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit)
  }

  getLearningStats(): LearningEngineStats {
    return { ...this.stats }
  }

  searchPatterns(query: string): LearningPattern[] {
    const results: LearningPattern[] = []

    for (const pattern of this.patterns.values()) {
      if (pattern.pattern.toLowerCase().includes(query.toLowerCase())) {
        results.push(pattern)
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence)
  }

  getPatternInsights(): any {
    const patterns = Array.from(this.patterns.values())

    return {
      totalPatterns: patterns.length,
      mostFrequentPattern: patterns.reduce((max, p) => (p.frequency > max.frequency ? p : max), patterns[0]),
      averageFrequency: patterns.reduce((sum, p) => sum + p.frequency, 0) / patterns.length,
      topSources: this.getTopSources(),
      topTopics: this.getTopTopics(),
      confidenceDistribution: this.getConfidenceDistribution(),
    }
  }

  private getTopSources(): any[] {
    const sources = new Map<string, number>()

    for (const pattern of this.patterns.values()) {
      if (pattern.pattern.startsWith("source:")) {
        const source = pattern.pattern.replace("source:", "")
        sources.set(source, (sources.get(source) || 0) + pattern.frequency)
      }
    }

    return Array.from(sources.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, frequency]) => ({ source, frequency }))
  }

  private getTopTopics(): any[] {
    const topics = new Map<string, number>()

    for (const pattern of this.patterns.values()) {
      if (pattern.pattern.startsWith("topic:")) {
        const topic = pattern.pattern.replace("topic:", "")
        topics.set(topic, (topics.get(topic) || 0) + pattern.frequency)
      }
    }

    return Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, frequency]) => ({ topic, frequency }))
  }

  private getConfidenceDistribution(): any {
    const patterns = Array.from(this.patterns.values())
    const distribution = { high: 0, medium: 0, low: 0 }

    for (const pattern of patterns) {
      if (pattern.confidence > 0.7) distribution.high++
      else if (pattern.confidence > 0.4) distribution.medium++
      else distribution.low++
    }

    return distribution
  }

  destroy(): void {
    this.patterns.clear()
    this.learningQueue = []
    this.initialized = false
  }
}

export const learningEngine = new LearningEngine()
