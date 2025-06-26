import { EnhancedAPIManager } from "./enhanced-api-manager"
import { TemporalKnowledgeSystem } from "./temporal-knowledge-system"

export class EnhancedKnowledgeSystem {
  private apiManager = new EnhancedAPIManager()
  private temporalSystem = new TemporalKnowledgeSystem()
  private learnedVocabulary: Map<string, any> = new Map()
  private learnedMathematics: Map<string, any> = new Map()
  private learnedScience: Map<string, any> = new Map()
  private learnedCoding: Map<string, any> = new Map()
  private batchLearningQueue: Array<{ category: string; query: string }> = []

  constructor() {
    this.loadLearnedKnowledge()
  }

  // Enhanced Dictionary Lookup with Multiple APIs
  public async lookupWord(word: string): Promise<any> {
    try {
      // Check if already learned
      const existing = this.learnedVocabulary.get(word.toLowerCase())
      if (existing) {
        console.log(`📚 Using cached definition for: ${word}`)
        return existing
      }

      // Use API manager with fallbacks
      const wordData = await this.apiManager.lookupWord(word)

      // Store in learned vocabulary
      this.learnedVocabulary.set(word.toLowerCase(), wordData)
      await this.saveLearnedKnowledge("vocabulary")

      console.log(`✨ Learned new word: ${word}`)
      return wordData
    } catch (error) {
      console.warn(`Dictionary lookup failed for "${word}":`, error)
      return null
    }
  }

  // Enhanced Math Processing with Multiple APIs
  public async processMathProblem(expression: string): Promise<any> {
    try {
      const mathType = this.identifyMathType(expression)

      // Check if we have learned this type of problem
      const existing = this.learnedMathematics.get(mathType)
      if (existing && this.canApplyLearnedPattern(expression, existing)) {
        console.log(`🧮 Using learned math pattern: ${mathType}`)
        return this.applyLearnedFormula(expression, existing)
      }

      // Try online math APIs
      try {
        const mathData = await this.apiManager.lookupMathConcept(expression)

        // Store learned pattern
        this.learnedMathematics.set(mathType, {
          type: mathType,
          pattern: this.extractFormula(expression),
          method: mathData.method,
          source: mathData.source,
          examples: [expression],
          timestamp: Date.now(),
        })

        await this.saveLearnedKnowledge("mathematics")
        return mathData
      } catch (apiError) {
        console.warn("Online math APIs failed, using local processing")
        return this.processLocalMath(expression)
      }
    } catch (error) {
      console.warn("Math processing failed:", error)
      return this.processLocalMath(expression)
    }
  }

  // Enhanced Science Knowledge with Multiple APIs
  public async lookupScientificConcept(concept: string): Promise<any> {
    try {
      // Check if already learned
      const existing = this.learnedScience.get(concept.toLowerCase())
      if (existing) {
        console.log(`🔬 Using cached science knowledge: ${concept}`)
        return existing
      }

      // Use API manager with fallbacks
      const scienceData = await this.apiManager.lookupScientificConcept(concept)

      // Store in learned science
      this.learnedScience.set(concept.toLowerCase(), scienceData)
      await this.saveLearnedKnowledge("science")

      console.log(`✨ Learned new science concept: ${concept}`)
      return scienceData
    } catch (error) {
      console.warn(`Science lookup failed for "${concept}":`, error)
      return null
    }
  }

  // NEW: Enhanced Coding Knowledge with Multiple APIs
  public async lookupCodingConcept(concept: string, language = "javascript"): Promise<any> {
    try {
      const key = `${concept}_${language}`.toLowerCase()

      // Check if already learned
      const existing = this.learnedCoding.get(key)
      if (existing) {
        console.log(`💻 Using cached coding knowledge: ${concept} (${language})`)
        return existing
      }

      // Use API manager with fallbacks
      const codingData = await this.apiManager.lookupCodingConcept(concept, language)

      // Store in learned coding
      this.learnedCoding.set(key, codingData)
      await this.saveLearnedKnowledge("coding")

      console.log(`✨ Learned new coding concept: ${concept} (${language})`)
      return codingData
    } catch (error) {
      console.warn(`Coding lookup failed for "${concept}":`, error)
      return null
    }
  }

  // NEW: Date/Time Query Handling
  public handleDateTimeQuery(message: string): string {
    return this.temporalSystem.handleDateTimeQuery(message)
  }

  public isDateTimeQuery(message: string): boolean {
    return this.temporalSystem.isDateTimeQuery(message)
  }

  // NEW: Batch Learning System
  public addToBatchLearning(category: string, query: string): void {
    this.batchLearningQueue.push({ category, query })
  }

  public async processBatchLearning(): Promise<any> {
    if (this.batchLearningQueue.length === 0) {
      return { processed: 0, results: [] }
    }

    const results = []
    const batchSize = Math.min(5, this.batchLearningQueue.length) // Process 5 at a time

    for (let i = 0; i < batchSize; i++) {
      const item = this.batchLearningQueue.shift()
      if (!item) break

      try {
        let result
        switch (item.category) {
          case "vocabulary":
            result = await this.lookupWord(item.query)
            break
          case "science":
            result = await this.lookupScientificConcept(item.query)
            break
          case "coding":
            result = await this.lookupCodingConcept(item.query)
            break
          case "mathematics":
            result = await this.processMathProblem(item.query)
            break
        }

        if (result) {
          results.push({ category: item.category, query: item.query, success: true, data: result })
        }

        // Rate limiting between batch items
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error) {
        results.push({ category: item.category, query: item.query, success: false, error: error.message })
      }
    }

    return { processed: results.length, results, remaining: this.batchLearningQueue.length }
  }

  // Enhanced Tesla/Vortex Math Implementation
  public getVortexMathPattern(number: number): any {
    const digitalRoot = this.calculateDigitalRoot(number)
    const vortexCycle = [1, 2, 4, 8, 7, 5]
    const teslaPattern = [3, 6, 9]

    return {
      number,
      digitalRoot,
      isVortexNumber: vortexCycle.includes(digitalRoot),
      isTeslaNumber: teslaPattern.includes(digitalRoot),
      vortexPosition: vortexCycle.indexOf(digitalRoot),
      pattern: digitalRoot <= 9 ? "single_digit" : "multi_digit",
      analysis: this.getVortexAnalysis(digitalRoot),
      timestamp: Date.now(),
    }
  }

  private getVortexAnalysis(digitalRoot: number): string {
    const analyses = {
      1: "Unity and new beginnings - the source point",
      2: "Duality and balance - the first division",
      3: "Tesla's sacred number - creation and manifestation",
      4: "Foundation and stability - material world",
      5: "Change and transformation - dynamic energy",
      6: "Tesla's sacred number - harmony and love",
      7: "Spiritual completion - the bridge",
      8: "Infinite cycles - material mastery",
      9: "Tesla's sacred number - universal completion",
    }
    return analyses[digitalRoot as keyof typeof analyses] || "Unknown pattern"
  }

  // All existing helper methods remain the same...
  private identifyMathType(expression: string): string {
    if (expression.includes("+")) return "addition"
    if (expression.includes("-")) return "subtraction"
    if (expression.includes("*") || expression.includes("×")) return "multiplication"
    if (expression.includes("/") || expression.includes("÷")) return "division"
    if (expression.includes("^") || expression.includes("**")) return "exponentiation"
    if (expression.includes("sqrt") || expression.includes("√")) return "square_root"
    return "general"
  }

  private extractFormula(expression: string): string {
    return expression.replace(/\d+/g, "n").replace(/\s+/g, " ").trim()
  }

  private canApplyLearnedPattern(expression: string, pattern: any): boolean {
    const currentPattern = this.extractFormula(expression)
    return currentPattern === pattern.pattern
  }

  private applyLearnedFormula(expression: string, formula: any): any {
    return {
      result: this.calculateUsingFormula(expression, formula),
      method: "learned_formula",
      confidence: 0.9,
      source: "learned_knowledge",
      pattern: formula.pattern,
    }
  }

  private calculateUsingFormula(expression: string, formula: any): number {
    try {
      return Function('"use strict"; return (' + expression + ")")()
    } catch {
      return 0
    }
  }

  private processLocalMath(expression: string): any {
    try {
      const result = Function('"use strict"; return (' + expression + ")")()
      return {
        result,
        method: "local_calculation",
        confidence: 0.7,
        source: "local_processing",
      }
    } catch (error) {
      return {
        result: "Error: Cannot calculate",
        method: "error",
        confidence: 0.1,
        source: "error",
      }
    }
  }

  private calculateDigitalRoot(num: number): number {
    while (num >= 10) {
      num = num
        .toString()
        .split("")
        .reduce((sum, digit) => sum + Number.parseInt(digit), 0)
    }
    return num
  }

  // Enhanced Knowledge Retrieval
  public getLearnedVocabulary(): Map<string, any> {
    return this.learnedVocabulary
  }
  public getLearnedMathematics(): Map<string, any> {
    return this.learnedMathematics
  }
  public getLearnedScience(): Map<string, any> {
    return this.learnedScience
  }
  public getLearnedCoding(): Map<string, any> {
    return this.learnedCoding
  }

  public wasRecentlyLearned(item: string, type: "vocabulary" | "mathematics" | "science" | "coding"): boolean {
    const maps = {
      vocabulary: this.learnedVocabulary,
      mathematics: this.learnedMathematics,
      science: this.learnedScience,
      coding: this.learnedCoding,
    }

    const learned = maps[type].get(item.toLowerCase())
    if (learned) {
      const hoursSinceLearned = (Date.now() - learned.timestamp) / (1000 * 60 * 60)
      return hoursSinceLearned < 24
    }
    return false
  }

  // Enhanced Storage System
  private async saveLearnedKnowledge(type: "vocabulary" | "mathematics" | "science" | "coding"): Promise<void> {
    try {
      const data = {
        vocabulary: Array.from(this.learnedVocabulary.entries()),
        mathematics: Array.from(this.learnedMathematics.entries()),
        science: Array.from(this.learnedScience.entries()),
        coding: Array.from(this.learnedCoding.entries()),
      }

      localStorage.setItem(`learned_${type}`, JSON.stringify(data[type]))
      console.log(`✅ Saved learned ${type} knowledge (${data[type].length} items)`)
    } catch (error) {
      console.error(`Failed to save learned ${type}:`, error)
    }
  }

  public async loadLearnedKnowledge(): Promise<void> {
    try {
      const types = ["vocabulary", "mathematics", "science", "coding"] as const

      for (const type of types) {
        try {
          const stored = localStorage.getItem(`learned_${type}`)
          if (stored) {
            const data = JSON.parse(stored)
            const map =
              type === "vocabulary"
                ? this.learnedVocabulary
                : type === "mathematics"
                  ? this.learnedMathematics
                  : type === "science"
                    ? this.learnedScience
                    : this.learnedCoding

            if (Array.isArray(data)) {
              data.forEach(([key, value]: [string, any]) => {
                map.set(key, value)
              })
            }
            console.log(`📚 Loaded ${data.length} learned ${type} entries`)
          }
        } catch (typeError) {
          console.warn(`Failed to load learned ${type} (non-critical):`, typeError)
        }
      }
    } catch (error) {
      console.warn("Failed to load learned knowledge (non-critical):", error)
    }
  }

  // Enhanced Export System
  public exportLearnedKnowledge(): any {
    const currentTime = this.temporalSystem.getCurrentDateTime()

    return {
      exportInfo: {
        timestamp: currentTime.timestamp,
        date: currentTime.formatted.full,
        version: "2.0.0",
        totalItems:
          this.learnedVocabulary.size +
          this.learnedMathematics.size +
          this.learnedScience.size +
          this.learnedCoding.size,
      },
      vocabulary: Object.fromEntries(this.learnedVocabulary),
      mathematics: Object.fromEntries(this.learnedMathematics),
      science: Object.fromEntries(this.learnedScience),
      coding: Object.fromEntries(this.learnedCoding),
      apiStatus: this.apiManager.getAPIStatus(),
      temporalInfo: currentTime,
    }
  }

  // Comprehensive Stats
  public getKnowledgeStats(): any {
    const currentTime = this.temporalSystem.getCurrentDateTime()

    return {
      learnedVocabulary: this.learnedVocabulary.size,
      learnedMathematics: this.learnedMathematics.size,
      learnedScience: this.learnedScience.size,
      learnedCoding: this.learnedCoding.size,
      totalLearned:
        this.learnedVocabulary.size + this.learnedMathematics.size + this.learnedScience.size + this.learnedCoding.size,
      batchQueueSize: this.batchLearningQueue.length,
      apiStatus: this.apiManager.getAPIStatus(),
      currentDateTime: currentTime,
      lastUpdate: Date.now(),
    }
  }
}
