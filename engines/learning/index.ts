import type { LearningPattern } from "@/types/engines"
import type { LearntDataEntry } from "@/types/global"
import { storageManager } from "@/core/storage/manager"
import { generateId, calculateSimilarity } from "@/utils/helpers"

export class LearningEngine {
  private patterns: Map<string, LearningPattern> = new Map()
  private learningQueue: any[] = []
  private initialized = false
  private processingInterval: NodeJS.Timeout | null = null

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🎓 Initializing Learning Engine...")

    try {
      await this.loadExistingPatterns()
      this.startBackgroundLearning()
      this.initialized = true
      console.log("✅ Learning Engine initialized")
    } catch (error) {
      console.error("❌ Error initializing Learning Engine:", error)
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
    if (!this.initialized) {
      await this.initialize()
    }

    const learningEntry = {
      id: generateId(),
      input: input.trim(),
      response: response.trim(),
      confidence,
      source,
      context,
      timestamp: Date.now(),
    }

    // Add to learning queue for background processing
    this.learningQueue.push(learningEntry)

    // Immediate pattern extraction for high-confidence interactions
    if (confidence > 0.8) {
      await this.extractPatternsImmediate(learningEntry)
    }

    // Update module-specific learning
    await this.updateModuleLearning(source, learningEntry)
  }

  private async extractPatternsImmediate(entry: any): Promise<void> {
    try {
      // Input pattern analysis
      const inputPattern = this.analyzeInputPattern(entry.input)
      if (inputPattern) {
        await this.updatePattern("input_pattern", inputPattern, entry)
      }

      // Response quality pattern
      const responsePattern = this.analyzeResponsePattern(entry)
      if (responsePattern) {
        await this.updatePattern("response_quality", responsePattern, entry)
      }

      // Context pattern analysis
      const contextPattern = this.analyzeContextPattern(entry.context)
      if (contextPattern) {
        await this.updatePattern("context_pattern", contextPattern, entry)
      }
    } catch (error) {
      console.error("Error in immediate pattern extraction:", error)
    }
  }

  private analyzeInputPattern(input: string): string | null {
    const lowercaseInput = input.toLowerCase().trim()

    // Question patterns
    if (lowercaseInput.startsWith("what is") || lowercaseInput.startsWith("define")) {
      return "definition_request"
    }
    if (lowercaseInput.startsWith("how to") || lowercaseInput.startsWith("how do")) {
      return "instruction_request"
    }
    if (lowercaseInput.startsWith("why") || lowercaseInput.includes("because")) {
      return "explanation_request"
    }
    if (lowercaseInput.startsWith("when") || lowercaseInput.includes("time")) {
      return "temporal_request"
    }
    if (lowercaseInput.startsWith("where") || lowercaseInput.includes("location")) {
      return "location_request"
    }

    // Mathematical patterns
    if (/\d+\s*[+\-*/=]\s*\d+/.test(input)) {
      return "calculation_request"
    }
    if (lowercaseInput.includes("solve") || lowercaseInput.includes("calculate")) {
      return "math_problem"
    }

    // Coding patterns
    if (lowercaseInput.includes("code") || lowercaseInput.includes("function")) {
      return "coding_request"
    }
    if (lowercaseInput.includes("debug") || lowercaseInput.includes("error")) {
      return "debugging_request"
    }

    // Conversational patterns
    if (lowercaseInput.includes("thank") || lowercaseInput.includes("thanks")) {
      return "gratitude_expression"
    }
    if (lowercaseInput.includes("hello") || lowercaseInput.includes("hi")) {
      return "greeting"
    }

    // Complex query patterns
    if (input.split(" ").length > 10) {
      return "complex_query"
    }
    if (input.includes("?") && input.split("?").length > 2) {
      return "multiple_questions"
    }

    return null
  }

  private analyzeResponsePattern(entry: any): string | null {
    const { confidence, response, source } = entry

    if (confidence > 0.9) {
      return "high_confidence_response"
    }
    if (confidence > 0.7) {
      return "medium_confidence_response"
    }
    if (confidence > 0.5) {
      return "low_confidence_response"
    }
    if (confidence <= 0.5) {
      return "uncertain_response"
    }

    // Response length patterns
    if (response.length > 500) {
      return "detailed_response"
    }
    if (response.length < 50) {
      return "brief_response"
    }

    // Source-based patterns
    if (source === "mathematics" && confidence > 0.8) {
      return "reliable_math_response"
    }
    if (source === "vocabulary" && confidence > 0.8) {
      return "reliable_vocab_response"
    }

    return null
  }

  private analyzeContextPattern(context: any): string | null {
    if (!context) return null

    // Conversation length patterns
    if (context.messageCount > 10) {
      return "extended_conversation"
    }
    if (context.messageCount > 5) {
      return "moderate_conversation"
    }
    if (context.messageCount <= 2) {
      return "new_conversation"
    }

    // Topic consistency patterns
    if (context.topics && context.topics.length > 3) {
      return "multi_topic_conversation"
    }
    if (context.topics && context.topics.length === 1) {
      return "focused_conversation"
    }

    // User behavior patterns
    if (context.conversationFlow === "follow_up") {
      return "follow_up_pattern"
    }
    if (context.conversationFlow === "topic_change") {
      return "topic_switching_pattern"
    }

    return null
  }

  private async updatePattern(type: string, pattern: string, entry: any): Promise<void> {
    const patternId = `${type}_${pattern}`
    const existingPattern = this.patterns.get(patternId)

    if (existingPattern) {
      // Update existing pattern
      existingPattern.occurrences++
      existingPattern.confidence = (existingPattern.confidence + entry.confidence) / 2
      existingPattern.examples.push(entry.input)
      existingPattern.metadata.lastSeen = Date.now()

      // Keep only the most recent examples
      if (existingPattern.examples.length > 10) {
        existingPattern.examples = existingPattern.examples.slice(-10)
      }
    } else {
      // Create new pattern
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
    try {
      const learntEntry: LearntDataEntry = {
        id: generateId(),
        content: {
          input: entry.input,
          response: entry.response,
          pattern: this.analyzeInputPattern(entry.input),
          context: entry.context,
        },
        confidence: entry.confidence,
        source,
        context: JSON.stringify(entry.context || {}),
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
    } catch (error) {
      console.error("Error updating module learning:", error)
    }
  }

  private generateTags(entry: any): string[] {
    const tags: string[] = []

    // Confidence-based tags
    if (entry.confidence > 0.8) tags.push("high-confidence")
    if (entry.confidence < 0.5) tags.push("low-confidence")

    // Pattern-based tags
    const pattern = this.analyzeInputPattern(entry.input)
    if (pattern) tags.push(pattern)

    // Source-based tags
    if (entry.source) tags.push(`source-${entry.source}`)

    // Content-based tags
    if (entry.input.includes("?")) tags.push("question")
    if (/\d/.test(entry.input)) tags.push("contains-numbers")
    if (entry.input.length > 100) tags.push("long-input")

    // Context-based tags
    if (entry.context?.conversationFlow) {
      tags.push(`flow-${entry.context.conversationFlow}`)
    }

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
        console.log(`📚 Loaded ${this.patterns.size} existing learning patterns`)
      }
    } catch (error) {
      console.error("Error loading existing patterns:", error)
    }
  }

  private startBackgroundLearning(): void {
    // Process learning queue every 30 seconds
    this.processingInterval = setInterval(async () => {
      if (this.learningQueue.length > 0) {
        await this.processLearningQueue()
      }
    }, 30000)

    // Save patterns every 5 minutes
    setInterval(async () => {
      await this.savePatterns()
    }, 300000)
  }

  private async processLearningQueue(): Promise<void> {
    const batchSize = Math.min(10, this.learningQueue.length)
    const batch = this.learningQueue.splice(0, batchSize)

    console.log(`🔄 Processing ${batch.length} learning entries...`)

    for (const entry of batch) {
      try {
        // Deep pattern analysis
        await this.deepPatternAnalysis(entry)

        // Similarity analysis
        await this.analyzeSimilarities(entry)

        // Temporal pattern analysis
        await this.analyzeTemporalPatterns(entry)
      } catch (error) {
        console.error("Error in background learning:", error)
      }
    }

    console.log(`✅ Processed ${batch.length} learning entries`)
  }

  private async deepPatternAnalysis(entry: any): Promise<void> {
    // Analyze relationships between entries
    const similarEntries = this.findSimilarEntries(entry)
    if (similarEntries.length > 2) {
      await this.updatePattern("similarity", "related_queries", entry)
    }

    // Analyze user behavior patterns
    const behaviorPattern = this.analyzeBehaviorPattern(entry)
    if (behaviorPattern) {
      await this.updatePattern("behavior", behaviorPattern, entry)
    }

    // Analyze success patterns
    const successPattern = this.analyzeSuccessPattern(entry)
    if (successPattern) {
      await this.updatePattern("success", successPattern, entry)
    }
  }

  private findSimilarEntries(entry: any): any[] {
    const similarEntries = []
    const entryKeywords = entry.input
      .toLowerCase()
      .split(/\W+/)
      .filter((w: string) => w.length > 2)

    for (const queueEntry of this.learningQueue) {
      if (queueEntry.id === entry.id) continue

      const similarity = calculateSimilarity(entry.input, queueEntry.input)
      if (similarity > 0.6) {
        similarEntries.push(queueEntry)
      }
    }

    return similarEntries
  }

  private analyzeBehaviorPattern(entry: any): string | null {
    const context = entry.context

    if (!context) return null

    // Quick successive questions
    if (context.messageCount > 3 && context.sessionDuration < 300000) {
      return "rapid_questioning"
    }

    // Detailed exploration
    if (context.messageCount > 5 && entry.input.length > 50) {
      return "detailed_exploration"
    }

    // Topic jumping
    if (context.topics && context.topics.length > 2) {
      return "topic_jumping"
    }

    return null
  }

  private analyzeSuccessPattern(entry: any): string | null {
    if (entry.confidence > 0.9 && entry.response.length > 100) {
      return "high_quality_detailed_response"
    }

    if (entry.confidence > 0.8 && entry.source === "mathematics") {
      return "successful_math_solution"
    }

    if (entry.confidence > 0.8 && entry.source === "vocabulary") {
      return "successful_definition"
    }

    return null
  }

  private async analyzeSimilarities(entry: any): Promise<void> {
    // Find patterns in similar queries
    const patterns = Array.from(this.patterns.values())
    const relatedPatterns = patterns.filter((pattern) =>
      pattern.examples.some((example) => calculateSimilarity(example, entry.input) > 0.5),
    )

    if (relatedPatterns.length > 0) {
      await this.updatePattern("similarity", "pattern_cluster", entry)
    }
  }

  private async analyzeTemporalPatterns(entry: any): Promise<void> {
    const hour = new Date(entry.timestamp).getHours()
    const dayOfWeek = new Date(entry.timestamp).getDay()

    // Time-based patterns
    let timePattern = null
    if (hour >= 9 && hour <= 17) {
      timePattern = "business_hours"
    } else if (hour >= 18 && hour <= 22) {
      timePattern = "evening"
    } else if (hour >= 23 || hour <= 6) {
      timePattern = "late_night"
    } else {
      timePattern = "morning"
    }

    if (timePattern) {
      await this.updatePattern("temporal", timePattern, entry)
    }

    // Day-based patterns
    const dayPattern = dayOfWeek >= 1 && dayOfWeek <= 5 ? "weekday" : "weekend"
    await this.updatePattern("temporal", dayPattern, entry)
  }

  private async savePatterns(): Promise<void> {
    try {
      const patternsData = {
        metadata: {
          version: "1.0.0",
          lastUpdated: Date.now(),
          totalPatterns: this.patterns.size,
          learningEngineVersion: "2.0.0",
        },
        patterns: Object.fromEntries(this.patterns),
        statistics: {
          totalLearningEntries: this.learningQueue.length,
          averageConfidence: this.calculateAverageConfidence(),
          patternTypes: [...new Set(Array.from(this.patterns.values()).map((p) => p.type))],
        },
      }

      await storageManager.saveLearntData("/learnt/patterns.json", patternsData)
      console.log(`💾 Saved ${this.patterns.size} learning patterns`)
    } catch (error) {
      console.error("Error saving patterns:", error)
    }
  }

  private calculateAverageConfidence(): number {
    const patterns = Array.from(this.patterns.values())
    if (patterns.length === 0) return 0

    const totalConfidence = patterns.reduce((sum, pattern) => sum + pattern.confidence, 0)
    return totalConfidence / patterns.length
  }

  // Public methods
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
      initialized: this.initialized,
      topPatterns: Array.from(this.patterns.values())
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 5)
        .map((p) => ({ pattern: p.pattern, occurrences: p.occurrences, confidence: p.confidence })),
    }
  }

  async forceProcessQueue(): Promise<void> {
    if (this.learningQueue.length > 0) {
      await this.processLearningQueue()
    }
  }

  clearPatterns(): void {
    this.patterns.clear()
  }

  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
    this.clearPatterns()
    this.learningQueue = []
    this.initialized = false
  }
}

export const learningEngine = new LearningEngine()
