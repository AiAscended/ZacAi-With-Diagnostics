import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"
import { generateId } from "@/utils/helpers"

interface VocabEntry {
  word: string
  definition: string
  partOfSpeech: string
  phonetics?: string
  frequency: number
  examples: string[]
  synonyms: string[]
  antonyms: string[]
  etymology?: string
  difficulty: number
  timestamp: number
}

export class VocabularyModule implements ModuleInterface {
  name = "vocab"
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

    console.log("Initializing Vocab Module...")

    try {
      // Load seed vocabulary data
      this.seedData = await this.loadSeedData()
      this.learntData = await this.loadLearntData()

      this.initialized = true
      console.log("✅ Vocab Module initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing Vocab Module:", error)
      throw error
    }
  }

  private async loadSeedData(): Promise<any> {
    try {
      const response = await fetch("/seed_vocab.json")
      if (!response.ok) throw new Error("Failed to load seed vocab data")
      return await response.json()
    } catch (error) {
      console.warn("Using fallback vocab data")
      return this.getFallbackVocabData()
    }
  }

  private async loadLearntData(): Promise<any> {
    try {
      return await storageManager.loadLearntData("vocab")
    } catch (error) {
      console.warn("No learnt vocab data found, starting fresh")
      return { entries: {} }
    }
  }

  private getFallbackVocabData(): any {
    return {
      metadata: {
        version: "1.0.0",
        totalEntries: 10,
        source: "fallback-vocab",
      },
      words: {
        algorithm: {
          definition: "A process or set of rules to be followed in calculations or other problem-solving operations",
          partOfSpeech: "noun",
          phonetics: "/ˈælɡəˌrɪðəm/",
          frequency: 4,
          examples: [
            "The sorting algorithm efficiently organized the data",
            "Machine learning algorithms can recognize patterns",
          ],
          synonyms: ["procedure", "method", "process"],
          difficulty: 4,
          etymology: "From Arabic al-Khwarizmi, named after the 9th-century mathematician",
        },
        quantum: {
          definition: "The minimum amount of any physical entity involved in an interaction",
          partOfSpeech: "noun",
          phonetics: "/ˈkwɒntəm/",
          frequency: 3,
          examples: [
            "Quantum mechanics describes the behavior of matter at atomic scales",
            "A quantum of light is called a photon",
          ],
          synonyms: ["unit", "amount", "portion"],
          difficulty: 5,
          etymology: "From Latin quantus meaning 'how much'",
        },
        artificial: {
          definition: "Made or produced by human beings rather than occurring naturally",
          partOfSpeech: "adjective",
          phonetics: "/ˌɑːtɪˈfɪʃəl/",
          frequency: 4,
          examples: [
            "Artificial intelligence mimics human cognitive functions",
            "The artificial flowers looked surprisingly real",
          ],
          synonyms: ["synthetic", "man-made", "manufactured"],
          antonyms: ["natural", "organic", "genuine"],
          difficulty: 2,
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
        metadata: {
          queriesProcessed: vocabQueries.length,
          resultsFound: results.length,
        },
      }
    } catch (error) {
      console.error("Error in Vocab Module processing:", error)
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
    const defineMatch = input.match(/define\s+(\w+)|what\s+(?:is|does)\s+(\w+)\s+mean|meaning\s+of\s+(\w+)/gi)
    if (defineMatch) {
      defineMatch.forEach((match) => {
        const word = match.replace(/define\s+|what\s+(?:is|does)\s+|meaning\s+of\s+|\s+mean/gi, "").trim()
        if (word) queries.push(word.toLowerCase())
      })
    }

    // Look for spelling requests
    const spellMatch = input.match(/spell\s+(\w+)|how\s+to\s+spell\s+(\w+)/gi)
    if (spellMatch) {
      spellMatch.forEach((match) => {
        const word = match.replace(/spell\s+|how\s+to\s+spell\s+/gi, "").trim()
        if (word) queries.push(word.toLowerCase())
      })
    }

    return [...new Set(queries)] // Remove duplicates
  }

  private async processVocabQuery(word: string): Promise<any> {
    // First check seed data
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

    // Try online lookup
    const onlineResult = await this.lookupOnline(word)
    if (onlineResult) {
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

  private searchSeedData(word: string): VocabEntry | null {
    if (!this.seedData || !this.seedData.words) return null

    const wordData = this.seedData.words[word.toLowerCase()]
    if (wordData) {
      return {
        word: word,
        definition: wordData.definition,
        partOfSpeech: wordData.partOfSpeech || "unknown",
        phonetics: wordData.phonetics,
        frequency: wordData.frequency || 1,
        examples: wordData.examples || [],
        synonyms: wordData.synonyms || [],
        antonyms: wordData.antonyms || [],
        etymology: wordData.etymology,
        difficulty: wordData.difficulty || 1,
        timestamp: Date.now(),
      }
    }

    return null
  }

  private searchLearntData(word: string): VocabEntry | null {
    if (!this.learntData || !this.learntData.entries) return null

    for (const entry of Object.values(this.learntData.entries)) {
      const entryData = entry as any
      if (entryData.content && entryData.content.word === word.toLowerCase()) {
        return entryData.content
      }
    }

    return null
  }

  private async lookupOnline(word: string): Promise<VocabEntry | null> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      if (!response.ok) return null

      const data = await response.json()
      if (!data || !data[0]) return null

      const entry = data[0]
      const meaning = entry.meanings?.[0]

      return {
        word: entry.word,
        definition: meaning?.definitions?.[0]?.definition || "No definition available",
        partOfSpeech: meaning?.partOfSpeech || "unknown",
        phonetics: entry.phonetics?.[0]?.text,
        frequency: 3, // Default frequency
        examples: meaning?.definitions?.[0]?.example ? [meaning.definitions[0].example] : [],
        synonyms: meaning?.definitions?.[0]?.synonyms || [],
        antonyms: meaning?.definitions?.[0]?.antonyms || [],
        difficulty: 3, // Default difficulty
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("Online lookup failed:", error)
      return null
    }
  }

  private async saveToLearntData(word: string, entry: VocabEntry): Promise<void> {
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

    await storageManager.addLearntEntry("vocab", learntEntry)
    this.stats.learntEntries++
  }

  private buildVocabResponse(results: any[]): string {
    if (results.length === 1) {
      const result = results[0]
      const data = result.data

      let response = `**${data.word.toUpperCase()}**\n\n`

      if (data.phonetics) {
        response += `**Pronunciation:** ${data.phonetics}\n`
      }

      if (data.partOfSpeech) {
        response += `**Part of Speech:** ${data.partOfSpeech}\n`
      }

      response += `**Definition:** ${data.definition}\n`

      if (data.examples && data.examples.length > 0) {
        response += `\n**Example:** "${data.examples[0]}"\n`
      }

      if (data.synonyms && data.synonyms.length > 0) {
        response += `\n**Synonyms:** ${data.synonyms.slice(0, 5).join(", ")}`
      }

      if (data.antonyms && data.antonyms.length > 0) {
        response += `\n**Antonyms:** ${data.antonyms.slice(0, 5).join(", ")}`
      }

      if (data.etymology) {
        response += `\n\n**Etymology:** ${data.etymology}`
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

  getSeedWords(): any {
    return this.seedData?.words || {}
  }

  getLearntWords(): any {
    return this.learntData?.entries || {}
  }
}

export const vocabularyModule = new VocabularyModule()
