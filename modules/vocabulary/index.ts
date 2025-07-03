import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"
import { DictionaryAPIClient, type DictionaryEntry } from "./dictionary-api"

export class VocabularyModule implements ModuleInterface {
  name = "vocabulary"
  version = "2.0.0"
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

    console.log("Initializing Vocabulary Module...")

    try {
      this.seedData = await storageManager.loadSeedData(MODULE_CONFIG.vocabulary.seedFile)
      this.learntData = await storageManager.loadLearntData(MODULE_CONFIG.vocabulary.learntFile)

      this.initialized = true
      console.log("Vocabulary Module initialized successfully")
    } catch (error) {
      console.error("Error initializing Vocabulary Module:", error)
      throw error
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      const vocabularyQueries = this.extractVocabularyQueries(input)

      if (vocabularyQueries.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const results: any[] = []

      for (const query of vocabularyQueries) {
        const result = await this.processVocabularyQuery(query)
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

      const response = this.buildVocabularyResponse(results)
      const confidence = this.calculateVocabularyConfidence(results)

      await this.learn({
        input,
        results,
        context,
        timestamp: Date.now(),
      })

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence,
        source: this.name,
        timestamp: Date.now(),
        metadata: {
          queriesProcessed: vocabularyQueries.length,
          resultsFound: results.length,
        },
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

  private extractVocabularyQueries(input: string): string[] {
    const queries: string[] = []

    // Look for definition requests
    const defineMatch = input.match(/define\s+(\w+)|what\s+(?:is|does)\s+(\w+)\s+mean|meaning\s+of\s+(\w+)/gi)
    if (defineMatch) {
      defineMatch.forEach((match) => {
        const word = match.replace(/define\s+|what\s+(?:is|does)\s+|meaning\s+of\s+|\s+mean/gi, "").trim()
        if (word) queries.push(word)
      })
    }

    // Look for spelling requests
    const spellMatch = input.match(/spell\s+(\w+)|how\s+to\s+spell\s+(\w+)/gi)
    if (spellMatch) {
      spellMatch.forEach((match) => {
        const word = match.replace(/spell\s+|how\s+to\s+spell\s+/gi, "").trim()
        if (word) queries.push(word)
      })
    }

    // Look for pronunciation requests
    const pronounceMatch = input.match(/pronounce\s+(\w+)|pronunciation\s+of\s+(\w+)/gi)
    if (pronounceMatch) {
      pronounceMatch.forEach((match) => {
        const word = match.replace(/pronounce\s+|pronunciation\s+of\s+/gi, "").trim()
        if (word) queries.push(word)
      })
    }

    // Look for synonym/antonym requests
    const synonymMatch = input.match(/synonym(?:s)?\s+(?:for|of)\s+(\w+)|(\w+)\s+synonym(?:s)?/gi)
    if (synonymMatch) {
      synonymMatch.forEach((match) => {
        const word = match.replace(/synonym(?:s)?\s+(?:for|of)\s+|\s+synonym(?:s)?/gi, "").trim()
        if (word) queries.push(word)
      })
    }

    return [...new Set(queries)] // Remove duplicates
  }

  private async processVocabularyQuery(word: string): Promise<any> {
    // First check local seed data
    const seedResult = this.searchSeedData(word)
    if (seedResult) {
      return {
        word,
        source: "seed",
        data: seedResult,
        confidence: 0.9,
      }
    }

    // Check learnt data
    const learntResult = this.searchLearntData(word)
    if (learntResult) {
      return {
        word,
        source: "learnt",
        data: learntResult,
        confidence: 0.85,
      }
    }

    // Look up online using Dictionary API
    const onlineResult = await DictionaryAPIClient.lookupWord(word)
    if (onlineResult) {
      // Save to learnt data for future use
      await this.saveToLearntData(word, onlineResult)

      return {
        word,
        source: "online",
        data: onlineResult,
        confidence: 0.8,
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
        difficulty: wordData.difficulty || 1,
        frequency: wordData.frequency || 1,
      }
    }

    return null
  }

  private searchLearntData(word: string): DictionaryEntry | null {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (entryData.content && entryData.content.word === word.toLowerCase()) {
        return entryData.content
      }
    }

    return null
  }

  private async saveToLearntData(word: string, entry: DictionaryEntry): Promise<void> {
    const learntEntry = {
      id: generateId(),
      content: entry,
      confidence: 0.8,
      source: "dictionary-api",
      context: `Looked up definition for "${word}"`,
      timestamp: Date.now(),
      usageCount: 1,
      lastUsed: Date.now(),
      verified: true,
      tags: ["dictionary", "online-lookup"],
      relationships: [],
    }

    await storageManager.addLearntEntry(MODULE_CONFIG.vocabulary.learntFile, learntEntry)
    this.stats.learntEntries++
  }

  private buildVocabularyResponse(results: any[]): string {
    if (results.length === 1) {
      const result = results[0]

      if (result.source === "online") {
        return DictionaryAPIClient.formatForDisplay(result.data)
      } else {
        // Format seed/learnt data
        const data = result.data
        let response = `**${data.word}**\n\n`

        if (data.partOfSpeech) {
          response += `**${data.partOfSpeech}**\n`
        }

        response += `${data.definition}\n`

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
      }
    } else {
      let response = "Here are the vocabulary definitions:\n\n"
      results.forEach((result, index) => {
        const data = result.data
        response += `**${index + 1}. ${data.word}**\n`
        response += `${data.definition || DictionaryAPIClient.getPrimaryDefinition(data)}\n\n`
      })
      return response
    }
  }

  private calculateVocabularyConfidence(results: any[]): number {
    if (results.length === 0) return 0

    let totalConfidence = 0
    for (const result of results) {
      totalConfidence += result.confidence
    }

    return Math.min(1, totalConfidence / results.length)
  }

  async learn(data: any): Promise<void> {
    // Learning happens automatically when we save online lookups
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
