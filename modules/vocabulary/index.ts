import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { VocabularyEntry } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
import { apiManager } from "@/core/api/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"

export class VocabularyModule implements ModuleInterface {
  name = "vocabulary"
  version = "1.0.0"
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
      // Load seed data
      this.seedData = await storageManager.loadSeedData(MODULE_CONFIG.vocabulary.seedFile)

      // Load learnt data
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
      // Extract words to define
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

      const definitions: any[] = []

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

      // Build response
      const response = this.buildDefinitionResponse(definitions)
      const confidence = this.calculateResponseConfidence(definitions)

      // Learn from this interaction
      await this.learn({
        input,
        definitions,
        context,
        timestamp: Date.now(),
      })

      // Update stats
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

    // Look for "define X" or "what is X" patterns
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

      // Take first few words that might be vocabulary
      words.push(...potentialWords.slice(0, 3))
    }

    return [...new Set(words)] // Remove duplicates
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

    // Try API lookup
    const apiDefinition = await this.lookupWordAPI(word)
    if (apiDefinition) {
      // Save to learnt data
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
        partOfSpeech: wordData.partOfSpeech || "unknown",
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

  private async lookupWordAPI(word: string): Promise<VocabularyEntry | null> {
    try {
      const url = `${MODULE_CONFIG.vocabulary.apiEndpoints.dictionary}/${word}`
      const cacheKey = `vocab_${word}`

      const response = await apiManager.makeRequest(url, {}, cacheKey, 86400000) // 24 hour cache

      if (response && response.length > 0) {
        const wordData = response[0]
        const meaning = wordData.meanings && wordData.meanings[0]
        const definition = meaning && meaning.definitions && meaning.definitions[0]

        if (definition) {
          return {
            word,
            definition: definition.definition,
            partOfSpeech: meaning.partOfSpeech || "unknown",
            examples: definition.example ? [definition.example] : [],
            synonyms: definition.synonyms || [],
            antonyms: definition.antonyms || [],
            difficulty: this.assessDifficulty(definition.definition),
            frequency: 1,
            etymology: wordData.origin,
            pronunciation: wordData.phonetic,
          }
        }
      }
    } catch (error) {
      console.error(`Error looking up word "${word}":`, error)
    }

    return null
  }

  private assessDifficulty(definition: string): number {
    // Simple difficulty assessment based on definition length and complexity
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
      confidence: 0.8, // API data is generally reliable
      source: "dictionary-api",
      context: `Looked up definition for "${word}"`,
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
      let response = `**${def.word}** (${def.partOfSpeech}): ${def.definition}`

      if (def.examples && def.examples.length > 0) {
        response += `\n\nExample: "${def.examples[0]}"`
      }

      if (def.synonyms && def.synonyms.length > 0) {
        response += `\n\nSynonyms: ${def.synonyms.slice(0, 3).join(", ")}`
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

    // Higher confidence for more definitions found
    const baseConfidence = Math.min(0.9, 0.6 + definitions.length * 0.1)

    // Adjust based on definition quality
    const avgDifficulty = definitions.reduce((sum, def) => sum + def.difficulty, 0) / definitions.length
    const difficultyBonus = avgDifficulty > 3 ? 0.1 : 0

    return Math.min(1, baseConfidence + difficultyBonus)
  }

  async learn(data: any): Promise<void> {
    // Learning is handled in the processing method
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
