import type { LearningPattern } from "@/types/engines"
import type { LearntDataEntry } from "@/types/global"
import { storageManager } from "@/core/storage/manager"
import { generateId } from "@/utils/helpers"

export class LearningEngine {
  private patterns: Map<string, LearningPattern> = new Map()
  private learningQueue: any[] = []

  async initialize(): Promise<void> {
    console.log("Initializing Learning Engine...")

    // Load existing patterns
    await this.loadExistingPatterns()

    // Start background learning process
    this.startBackgroundLearning()

    console.log("Learning Engine initialized")
  }

  async learnFromInteraction(
    input: string,
    response: string,
    confidence: number,
    source: string,
    context: any,
  ): Promise<void> {
    // Create learning entry
    const learningEntry = {
      input,
      response,
      confidence,
      source,
      context,
      timestamp: Date.now(),
    }

    // Add to learning queue
    this.learningQueue.push(learningEntry)

    // Extract patterns
    await this.extractPatterns(learningEntry)

    // Update module-specific learning
    await this.updateModuleLearning(source, learningEntry)
  }

  private async extractPatterns(entry: any): Promise<void> {
    // Pattern 1: Input-Response patterns
    const inputPattern = this.analyzeInputPattern(entry.input)
    if (inputPattern) {
      await this.updatePattern("input_pattern", inputPattern, entry)
    }

    // Pattern 2: Confidence patterns
    const confidencePattern = this.analyzeConfidencePattern(entry)
    if (confidencePattern) {
      await this.updatePattern("confidence_pattern", confidencePattern, entry)
    }

    // Pattern 3: Context patterns
    const contextPattern = this.analyzeContextPattern(entry.context)
    if (contextPattern) {
      await this.updatePattern("context_pattern", contextPattern, entry)
    }
  }

  private analyzeInputPattern(input: string): string | null {
    const lowercaseInput = input.toLowerCase()

    if (lowercaseInput.startsWith("what is") || lowercaseInput.startsWith("define")) {
      return "definition_request"
    } else if (lowercaseInput.includes("calculate") || /\d+[+\-*/]\d+/.test(input)) {
      return "calculation_request"
    } else if (lowercaseInput.includes("how to") || lowercaseInput.includes("explain")) {
      return "explanation_request"
    } else if (lowercaseInput.includes("code") || lowercaseInput.includes("function")) {
      return "coding_request"
    }

    return null
  }

  private analyzeConfidencePattern(entry: any): string | null {
    if (entry.confidence > 0.8) {
      return "high_confidence"
    } else if (entry.confidence > 0.6) {
      return "medium_confidence"
    } else if (entry.confidence > 0.3) {
      return "low_confidence"
    }

    return "very_low_confidence"
  }

  private analyzeContextPattern(context: any): string | null {
    if (!context) return null

    if (context.conversationLength > 10) {
      return "extended_conversation"
    } else if (context.keywords && context.keywords.length > 5) {
      return "keyword_rich"
    } else if (context.recentMessages && context.recentMessages.length > 3) {
      return "active_conversation"
    }

    return "simple_interaction"
  }

  private async updatePattern(type: string, pattern: string, entry: any): Promise<void> {
    const patternId = `${type}_${pattern}`
    const existingPattern = this.patterns.get(patternId)

    if (existingPattern) {
      existingPattern.occurrences++
      existingPattern.confidence = (existingPattern.confidence + entry.confidence) / 2
      existingPattern.examples.push(entry.input)

      // Keep only last 10 examples
      if (existingPattern.examples.length > 10) {
        existingPattern.examples = existingPattern.examples.slice(-10)
      }
    } else {
      const newPattern: LearningPattern = {
        id: patternId,
        type,
        pattern,
        confidence: entry.confidence,
        occurrences: 1,
        examples: [entry.input],
        metadata: {
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          source: entry.source,
        },
      }

      this.patterns.set(patternId, newPattern)
    }
  }

  private async updateModuleLearning(source: string, entry: any): Promise<void> {
    // Create learnt data entry
    const learntEntry: LearntDataEntry = {
      id: generateId(),
      content: {
        input: entry.input,
        response: entry.response,
        pattern: this.analyzeInputPattern(entry.input),
      },
      confidence: entry.confidence,
      source,
      context: JSON.stringify(entry.context),
      timestamp: Date.now(),
      usageCount: 1,
      lastUsed: Date.now(),
      verified: entry.confidence > 0.8,
      tags: this.generateTags(entry),
      relationships: [],
    }

    // Save to appropriate module's learnt data
    const moduleName = this.mapSourceToModule(source)
    if (moduleName) {
      await storageManager.addLearntEntry(`/learnt/${moduleName}.json`, learntEntry)
    }
  }

  private generateTags(entry: any): string[] {
    const tags: string[] = []

    if (entry.confidence > 0.8) tags.push("high-confidence")
    if (entry.confidence < 0.5) tags.push("low-confidence")

    const pattern = this.analyzeInputPattern(entry.input)
    if (pattern) tags.push(pattern)

    if (entry.source) tags.push(`source-${entry.source}`)

    return tags
  }

  private mapSourceToModule(source: string): string | null {
    const sourceModuleMap: { [key: string]: string } = {
      vocabulary: "vocabulary",
      mathematics: "mathematics",
      coding: "coding",
      facts: "facts",
      philosophy: "philosophy",
      "user-info": "user-info",
    }

    return sourceModuleMap[source] || null
  }

  private async loadExistingPatterns(): Promise<void> {
    try {
      const patternsData = await storageManager.loadLearntData("/learnt/patterns.json")
      if (patternsData && patternsData.patterns) {
        for (const [id, pattern] of Object.entries(patternsData.patterns)) {
          this.patterns.set(id, pattern as LearningPattern)
        }
      }
    } catch (error) {
      console.error("Error loading existing patterns:", error)
    }
  }

  private startBackgroundLearning(): void {
    // Process learning queue every 30 seconds
    setInterval(async () => {
      if (this.learningQueue.length > 0) {
        await this.processLearningQueue()
      }
    }, 30000)
  }

  private async processLearningQueue(): Promise<void> {
    const batchSize = Math.min(10, this.learningQueue.length)
    const batch = this.learningQueue.splice(0, batchSize)

    for (const entry of batch) {
      try {
        // Additional pattern analysis
        await this.deepPatternAnalysis(entry)
      } catch (error) {
        console.error("Error in background learning:", error)
      }
    }

    // Save patterns periodically
    await this.savePatterns()
  }

  private async deepPatternAnalysis(entry: any): Promise<void> {
    // Analyze relationships between entries
    const similarEntries = this.findSimilarEntries(entry)
    if (similarEntries.length > 0) {
      await this.updatePattern("similarity", "related_queries", entry)
    }

    // Analyze temporal patterns
    const timePattern = this.analyzeTimePattern(entry)
    if (timePattern) {
      await this.updatePattern("temporal", timePattern, entry)
    }
  }

  private findSimilarEntries(entry: any): any[] {
    // Simple similarity check based on keywords
    const entryKeywords = entry.input.toLowerCase().split(/\W+/)
    const similarEntries = []

    for (const queueEntry of this.learningQueue) {
      const queueKeywords = queueEntry.input.toLowerCase().split(/\W+/)
      const commonKeywords = entryKeywords.filter((word) => queueKeywords.includes(word))

      if (commonKeywords.length > 2) {
        similarEntries.push(queueEntry)
      }
    }

    return similarEntries
  }

  private analyzeTimePattern(entry: any): string | null {
    const hour = new Date(entry.timestamp).getHours()

    if (hour >= 9 && hour <= 17) {
      return "business_hours"
    } else if (hour >= 18 && hour <= 22) {
      return "evening"
    } else if (hour >= 23 || hour <= 6) {
      return "late_night"
    } else {
      return "morning"
    }
  }

  private async savePatterns(): Promise<void> {
    const patternsData = {
      metadata: {
        version: "1.0.0",
        lastUpdated: Date.now(),
        totalPatterns: this.patterns.size,
      },
      patterns: Object.fromEntries(this.patterns),
    }

    await storageManager.saveLearntData("/learnt/patterns.json", patternsData)
  }

  getPatterns(): LearningPattern[] {
    return Array.from(this.patterns.values())
  }

  getPatternsByType(type: string): LearningPattern[] {
    return Array.from(this.patterns.values()).filter((p) => p.type === type)
  }

  getLearningStats(): any {
    return {
      totalPatterns: this.patterns.size,
      queueSize: this.learningQueue.length,
      patternTypes: [...new Set(Array.from(this.patterns.values()).map((p) => p.type))],
      averageConfidence: this.calculateAverageConfidence(),
    }
  }

  private calculateAverageConfidence(): number {
    const patterns = Array.from(this.patterns.values())
    if (patterns.length === 0) return 0

    const totalConfidence = patterns.reduce((sum, pattern) => sum + pattern.confidence, 0)
    return totalConfidence / patterns.length
  }
}

export const learningEngine = new LearningEngine()
