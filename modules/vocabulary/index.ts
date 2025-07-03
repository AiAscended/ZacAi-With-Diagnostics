import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { VocabularyEntry } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"
import { DictionaryAPIClient } from "./dictionary-api"

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
      const wordsToDefine = this.extractWords(input)

      if (wordsToDefine.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const definitions: VocabularyEntry[] = []

      for (const word of wordsToDefine) {
        const definition = await this.getWordDefinition(word)
        if (definition) {
          definitions.push(definition)
        }
      }

      if (definitions.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const response = this.buildDefinitionResponse(definitions)
      const confidence = this.calculateResponseConfidence(definitions)

      await this.learn({
        input,
        definitions,
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
          wordsProcessed: wordsToDefine.length,
          definitionsFound: definitions.length,
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

  private extractWords(input: string): string[] {
    const words: string[] = []

    // Look for explicit definition requests
    const defineMatch = input.match(/define\s+(\w+)/i)
    if (defineMatch) {
      words.push(defineMatch[1].toLowerCase())
    }

    const whatIsMatch = input.match(/what\s+is\s+(\w+)/i)
    if (whatIsMatch) {
      words.push(whatIsMatch[1].toLowerCase())
    }

    const meaningMatch = input.match(/meaning\s+of\s+(\w+)/i)
    if (meaningMatch) {
      words.push(meaningMatch[1].toLowerCase())
    }

    // If no specific patterns, extract potential vocabulary words
    if (words.length === 0) {
      const potentialWords = input
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => word.length > 3 && word.length < 20)
        .filter((word) => !this.isCommonWord(word))

      words.push(...potentialWords.slice(0, 3))
    }

    return [...new Set(words)]
  }

  private isCommonWord(word: string): boolean {
    const commonWords = [
      "this",
      "that",
      "with",
      "have",
      "will",
      "from",
      "they",
      "know",
      "want",
      "been",
      "good",
      "much",
      "some",
      "time",
      "very",
      "when",
      "come",
      "here",
      "just",
      "like",
      "long",
      "make",
      "many",
      "over",
      "such",
      "take",
      "than",
      "them",
      "well",
      "were",
    ]
    return commonWords.includes(word)
  }

  private async getWordDefinition(word: string): Promise<VocabularyEntry | null> {
    // Check learnt data first
    const learntDefinition = this.searchLearntData(word)
    if (learntDefinition) {
      return learntDefinition
    }

    // Check seed data
    const seedDefinition = this.searchSeedData(word)
    if (seedDefinition) {
      return seedDefinition
    }

    // Try online API lookup
    const apiDefinition = await this.lookupWordOnline(word)
    if (apiDefinition) {
      await this.saveToLearntData(word, apiDefinition)
      return apiDefinition
    }

    return null
  }

  private searchLearntData(word: string): VocabularyEntry | null {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (entryData.content && entryData.content.word === word) {
        return entryData.content
      }
    }

    return null
  }

  private searchSeedData(word: string): VocabularyEntry | null {
    if (!this.seedData || !this.seedData.words) return null

    const wordData = this.seedData.words[word]
    if (wordData) {
      return {
        word,
        definition: wordData.definition,
        partOfSpeech: wordData.part_of_speech || wordData.partOfSpeech || "unknown",
        examples: wordData.examples || [],
        synonyms: wordData.synonyms || [],
        antonyms: wordData.antonyms || [],
        difficulty: wordData.difficulty || 1,
        frequency: wordData.frequency || 1,
        etymology: wordData.etymology,
        pronunciation: wordData.pronunciation,
      }
    }

    return null
  }

  private async lookupWordOnline(word: string): Promise<VocabularyEntry | null> {
    try {
      const apiResponse = await DictionaryAPIClient.lookupWord(word)
      if (apiResponse) {
        const formatted = DictionaryAPIClient.formatDefinition(apiResponse)
        if (formatted) {
          return {
            word: formatted.word,
            definition: formatted.definition,
            partOfSpeech: formatted.partOfSpeech,
            examples: formatted.example ? [formatted.example] : [],
            synonyms: formatted.synonyms || [],
            antonyms: formatted.antonyms || [],
            difficulty: this.assessDifficulty(formatted.definition),
            frequency: 1,
            etymology: formatted.origin,
            pronunciation: formatted.phonetic,
          }
        }
      }
    } catch (error) {
      console.error(`Error looking up word "${word}" online:`, error)
    }

    return null
  }

  private assessDifficulty(definition: string): number {
    const length = definition.length
    const complexWords = (definition.match(/\b\w{8,}\b/g) || []).length

    if (length > 200 || complexWords > 3) return 5
    if (length > 150 || complexWords > 2) return 4
    if (length > 100 || complexWords > 1) return 3
    if (length > 50) return 2
    return 1
  }

  private async saveToLearntData(word: string, definition: VocabularyEntry): Promise<void> {
    const learntEntry = {
      id: generateId(),
      content: definition,
      confidence: 0.8,
      source: "dictionary-api",
      context: `Online lookup for "${word}"`,
      timestamp: Date.now(),
      usageCount: 1,
      lastUsed: Date.now(),
      verified: true,
      tags: ["api-lookup", definition.partOfSpeech],
      relationships: [],
    }

    await storageManager.addLearntEntry(MODULE_CONFIG.vocabulary.learntFile, learntEntry)
    this.stats.learntEntries++
  }

  private buildDefinitionResponse(definitions: VocabularyEntry[]): string {
    if (definitions.length === 1) {
      const def = definitions[0]
      let response = `**${def.word}**`

      if (def.pronunciation) {
        response += ` ${def.pronunciation}`
      }

      response += ` (${def.partOfSpeech}): ${def.definition}`

      if (def.examples && def.examples.length > 0) {
        response += `\n\n**Example:** "${def.examples[0]}"`
      }

      if (def.synonyms && def.synonyms.length > 0) {
        response += `\n\n**Synonyms:** ${def.synonyms.slice(0, 3).join(", ")}`
      }

      if (def.etymology) {
        response += `\n\n**Etymology:** ${def.etymology}`
      }

      return response
    } else {
      let response = "Here are the definitions:\n\n"
      definitions.forEach((def, index) => {
        response += `${index + 1}. **${def.word}** (${def.partOfSpeech}): ${def.definition}\n`
      })
      return response
    }
  }

  private calculateResponseConfidence(definitions: VocabularyEntry[]): number {
    if (definitions.length === 0) return 0

    const baseConfidence = Math.min(0.9, 0.6 + definitions.length * 0.1)
    const avgDifficulty = definitions.reduce((sum, def) => sum + def.difficulty, 0) / definitions.length
    const difficultyBonus = avgDifficulty > 3 ? 0.1 : 0

    return Math.min(1, baseConfidence + difficultyBonus)
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
