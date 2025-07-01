// Learning engine for pattern recognition and knowledge acquisition
import type { LearningEngine, LearningPattern } from "@/types/engines"
import { generateId } from "@/utils/helpers"

export class LearningEngineImpl implements LearningEngine {
  private initialized = false
  private learningQueue: any[] = []
  private patterns: LearningPattern[] = []
  private stats = {
    totalInteractions: 0,
    patternsLearned: 0,
    averageConfidence: 0,
    learningRate: 0,
    lastUpdate: Date.now(),
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🎓 Initializing Learning Engine...")
    this.initialized = true
    console.log("✅ Learning Engine initialized")
  }

  async learnFromInteraction(
    input: string,
    output: string,
    confidence: number,
    source: string,
    context: any,
  ): Promise<void> {
    const interaction = {
      id: generateId(),
      input,
      output,
      confidence,
      source,
      context,
      timestamp: Date.now(),
    }

    // Add to learning queue
    this.learningQueue.push(interaction)
    this.stats.totalInteractions++

    // Process patterns
    await this.identifyPatterns(interaction)

    // Update stats
    this.updateStats(confidence)

    // Process queue if it gets too large
    if (this.learningQueue.length > 100) {
      await this.processQueue()
    }
  }

  private async identifyPatterns(interaction: any): Promise<void> {
    // Simple pattern identification
    const inputWords = interaction.input.toLowerCase().split(/\s+/)
    const outputLength = interaction.output.length

    // Pattern: Question type -> Response confidence
    const questionType = this.identifyQuestionType(interaction.input)
    const existingPattern = this.patterns.find((p) => p.pattern === questionType)

    if (existingPattern) {
      existingPattern.frequency++
      existingPattern.confidence = (existingPattern.confidence + interaction.confidence) / 2
    } else {
      this.patterns.push({
        id: generateId(),
        pattern: questionType,
        frequency: 1,
        confidence: interaction.confidence,
        context: [interaction.source],
        timestamp: Date.now(),
      })
      this.stats.patternsLearned++
    }

    // Keep only recent patterns
    if (this.patterns.length > 1000) {
      this.patterns = this.patterns.slice(-1000)
    }
  }

  private identifyQuestionType(input: string): string {
    const lowercaseInput = input.toLowerCase()

    if (lowercaseInput.startsWith("what is") || lowercaseInput.startsWith("define")) {
      return "definition_request"
    }
    if (lowercaseInput.includes("calculate") || lowercaseInput.match(/\d+.*[+\-*/]/)) {
      return "calculation_request"
    }
    if (lowercaseInput.startsWith("tell me about") || lowercaseInput.startsWith("explain")) {
      return "explanation_request"
    }
    if (lowercaseInput.includes("how to") || lowercaseInput.includes("how do")) {
      return "instruction_request"
    }

    return "general_query"
  }

  private updateStats(confidence: number): void {
    this.stats.averageConfidence =
      (this.stats.averageConfidence * (this.stats.totalInteractions - 1) + confidence) / this.stats.totalInteractions

    // Calculate learning rate (interactions per hour)
    const hoursSinceStart = (Date.now() - this.stats.lastUpdate) / (1000 * 60 * 60)
    if (hoursSinceStart > 0) {
      this.stats.learningRate = this.stats.totalInteractions / hoursSinceStart
    }
  }

  async processQueue(): Promise<void> {
    // Process learning queue in batches
    const batchSize = 50
    const batch = this.learningQueue.splice(0, batchSize)

    for (const interaction of batch) {
      // Additional processing could go here
      // For now, we just ensure patterns are identified
      await this.identifyPatterns(interaction)
    }
  }

  async forceProcessQueue(): Promise<void> {
    while (this.learningQueue.length > 0) {
      await this.processQueue()
    }
  }

  getLearningStats(): any {
    return {
      ...this.stats,
      queueSize: this.learningQueue.length,
      totalPatterns: this.patterns.length,
      patternTypes: [...new Set(this.patterns.map((p) => p.pattern))],
      topPatterns: this.patterns
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)
        .map((p) => ({ pattern: p.pattern, frequency: p.frequency, confidence: p.confidence })),
    }
  }

  destroy(): void {
    this.learningQueue = []
    this.patterns = []
    this.initialized = false
  }
}

export const learningEngine = new LearningEngineImpl()
