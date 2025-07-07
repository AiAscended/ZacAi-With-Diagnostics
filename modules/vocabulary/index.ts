import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"

export class VocabularyModule implements ModuleInterface {
  name = "vocabulary"
  version = "3.0.0"
  initialized = false

  private seedData: any = null
  private learntData: any = null
  private stats: ModuleStats = {
    totalQueries: 0,
    successRate: 0,
    averageResponseTime: 0,
    learntEntries: 0,
    lastUpdate: 0,
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("📚 Initializing Vocabulary Module...")

    try {
      this.seedData = await this.loadSeedData()
      this.learntData = await this.loadLearntData()

      this.initialized = true
      console.log("✅ Vocabulary Module initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing Vocabulary Module:", error)
      throw error
    }
  }

  private async loadSeedData(): Promise<any> {
    try {
      return await storageManager.loadSeedData("vocabulary")
    } catch (error) {
      console.warn("Using fallback vocabulary data")
      return this.getFallbackVocabData()
    }
  }

  private async loadLearntData(): Promise<any> {
    try {
      return await storageManager.loadLearntData("vocabulary")
    } catch (error) {
      console.warn("No learnt vocabulary data found")
      return { entries: {} }
    }
  }

  private getFallbackVocabData(): any {
    return {
      words: {
        algorithm: {
          definition: "A process or set of rules to be followed in calculations or other problem-solving operations",
          partOfSpeech: "noun",
          examples: ["The sorting algorithm efficiently organized the data"],
          synonyms: ["procedure", "method", "process"],
        },
        artificial: {
          definition: "Made or produced by human beings rather than occurring naturally",
          partOfSpeech: "adjective",
          examples: ["Artificial intelligence mimics human cognitive functions"],
          synonyms: ["synthetic", "man-made"],
          antonyms: ["natural", "organic"],
        },
        intelligence: {
          definition: "The ability to acquire and apply knowledge and skills",
          partOfSpeech: "noun",
          examples: ["Her intelligence was evident in her problem-solving"],
          synonyms: ["intellect", "wisdom", "cleverness"],
          antonyms: ["stupidity", "ignorance"],
        },
      },
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      const vocabQueries = this.extractVocabQueries(input)

      if (vocabQueries.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const results: any[] = []

      for (const query of vocabQueries) {
        const result = await this.processVocabQuery(query)
        if (result) {
          results.push(result)
        }
      }

      if (results.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const response = this.buildVocabResponse(results)
      const confidence = this.calculateConfidence(results)

      await this.learn({ input, results, context, timestamp: Date.now() })

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence,
        source: this.name,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("Error in Vocabulary Module processing:", error)
      this.updateStats(Date.now() - startTime, false)

      return {
        success: false,
        data: null,
        confidence: 0,
        source: this.name,
        timestamp: Date.now(),
      }
    }
  }

  private extractVocabQueries(input: string): string[] {
    const queries: string[] = []

    // Look for definition requests
    const defineMatch = input.match(/define\s+(\w+)|what\s+(?:is|does)\s+(\w+)\s+mean/gi)
    if (defineMatch) {
      defineMatch.forEach((match) => {
        const word = match.replace(/define\s+|what\s+(?:is|does)\s+|\s+mean/gi, "").trim()
        if (word) queries.push(word.toLowerCase())
      })
    }

    return [...new Set(queries)]
  }

  private async processVocabQuery(word: string): Promise<any> {
    // Check seed data first
    const seedResult = this.searchSeedData(word)
    if (seedResult) {
      return {
        word,
        source: "seed",
        data: seedResult,
        confidence: 0.95,
      }
    }

    // Check learnt data
    const learntResult = this.searchLearntData(word)
    if (learntResult) {
      return {
        word,
        source: "learnt",
        data: learntResult,
        confidence: 0.9,
      }
    }

    return null
  }

  private searchSeedData(word: string): any {
    if (!this.seedData || !this.seedData.words) return null

    const wordData = this.seedData.words[word.toLowerCase()]
    if (wordData) {
      return {
        word: word,
        definition: wordData.definition,
        partOfSpeech: wordData.partOfSpeech || "unknown",
        examples: wordData.examples || [],
        synonyms: wordData.synonyms || [],
        antonyms: wordData.antonyms || [],
      }
    }

    return null
  }

  private searchLearntData(word: string): any {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (entryData.content && entryData.content.word === word.toLowerCase()) {
        return entryData.content
      }
    }

    return null
  }

  private buildVocabResponse(results: any[]): string {
    if (results.length === 1) {
      const result = results[0]
      const data = result.data

      let response = `**${data.word.toUpperCase()}**\n\n`
      response += `**Definition:** ${data.definition}\n`

      if (data.partOfSpeech) {
        response += `**Part of Speech:** ${data.partOfSpeech}\n`
      }

      if (data.examples && data.examples.length > 0) {
        response += `\n**Example:** "${data.examples[0]}"\n`
      }

      if (data.synonyms && data.synonyms.length > 0) {
        response += `\n**Synonyms:** ${data.synonyms.slice(0, 5).join(", ")}`
      }

      if (data.antonyms && data.antonyms.length > 0) {
        response += `\n**Antonyms:** ${data.antonyms.slice(0, 5).join(", ")}`
      }

      response += `\n\n*Source: ${result.source} data*`
      return response
    } else {
      let response = "Here are the vocabulary definitions:\n\n"
      results.forEach((result, index) => {
        const data = result.data
        response += `**${index + 1}. ${data.word.toUpperCase()}**\n`
        response += `${data.definition}\n\n`
      })
      return response
    }
  }

  private calculateConfidence(results: any[]): number {
    if (results.length === 0) return 0

    let totalConfidence = 0
    for (const result of results) {
      totalConfidence += result.confidence
    }

    return Math.min(1, totalConfidence / results.length)
  }

  async learn(data: any): Promise<void> {
    this.stats.lastUpdate = Date.now()
  }

  private updateStats(responseTime: number, success: boolean): void {
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (this.stats.totalQueries - 1) + responseTime) / this.stats.totalQueries

    if (success) {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1) + 1) / this.stats.totalQueries
    } else {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1)) / this.stats.totalQueries
    }
  }

  getStats(): ModuleStats {
    return { ...this.stats }
  }
}

export const vocabularyModule = new VocabularyModule()
