import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"
import { userMemory } from "@/core/memory/user-memory"
import { dictionaryAPI } from "./dictionary-api"
import { thesaurusClient } from "./thesaurus"
import { phoneticsClient } from "./phonetics"
import { grammarClient } from "./grammar"
import { generateId, calculateConfidence, extractKeywords } from "@/utils/helpers"

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
  thesaurusData?: any
  phoneticData?: any
  grammarData?: any
}

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

    console.log("📚 Initializing Enhanced Vocabulary Module...")

    try {
      // Initialize storage manager first
      await storageManager.initialize()

      // Load seed vocabulary data
      this.seedData = await this.loadSeedData()
      this.learntData = await this.loadLearntData()

      this.initialized = true
      console.log("✅ Enhanced Vocabulary Module initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing Vocabulary Module:", error)
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
      return await storageManager.loadLearntData("vocabulary")
    } catch (error) {
      console.warn("No learnt vocab data found, starting fresh")
      return { entries: {} }
    }
  }

  private getFallbackVocabData(): any {
    return {
      metadata: {
        version: "1.0.0",
        totalEntries: 15,
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
        intelligence: {
          definition: "The ability to acquire and apply knowledge and skills",
          partOfSpeech: "noun",
          phonetics: "/ɪnˈtelɪdʒəns/",
          frequency: 4,
          examples: [
            "Artificial intelligence is revolutionizing technology",
            "Her intelligence was evident in her quick problem-solving",
          ],
          synonyms: ["intellect", "wisdom", "cleverness", "smartness"],
          antonyms: ["stupidity", "ignorance"],
          difficulty: 3,
        },
        computer: {
          definition: "An electronic device for storing and processing data",
          partOfSpeech: "noun",
          phonetics: "/kəmˈpjuːtər/",
          frequency: 5,
          examples: ["The computer processed the data in seconds", "Modern computers are incredibly powerful"],
          synonyms: ["machine", "processor", "device"],
          difficulty: 1,
        },
        programming: {
          definition: "The process of creating a set of instructions that tell a computer how to perform a task",
          partOfSpeech: "noun",
          phonetics: "/ˈproʊɡræmɪŋ/",
          frequency: 3,
          examples: [
            "Programming requires logical thinking and attention to detail",
            "She learned programming to build her own website",
          ],
          synonyms: ["coding", "development", "software engineering"],
          difficulty: 3,
        },
        database: {
          definition: "A structured set of data held in a computer",
          partOfSpeech: "noun",
          phonetics: "/ˈdeɪtəbeɪs/",
          frequency: 3,
          examples: [
            "The database stores customer information securely",
            "We need to update the database with new records",
          ],
          synonyms: ["data store", "repository", "archive"],
          difficulty: 3,
        },
        network: {
          definition: "A group of interconnected computers or systems",
          partOfSpeech: "noun",
          phonetics: "/ˈnetwɜːrk/",
          frequency: 4,
          examples: [
            "The office network allows file sharing between computers",
            "Social networks connect people worldwide",
          ],
          synonyms: ["system", "grid", "web"],
          difficulty: 2,
        },
        software: {
          definition: "Computer programs and operating information used by a computer",
          partOfSpeech: "noun",
          phonetics: "/ˈsɔːftwer/",
          frequency: 4,
          examples: ["The software update fixed several bugs", "We need new software for project management"],
          synonyms: ["program", "application", "system"],
          antonyms: ["hardware"],
          difficulty: 2,
        },
        technology: {
          definition: "The application of scientific knowledge for practical purposes",
          partOfSpeech: "noun",
          phonetics: "/tekˈnɒlədʒi/",
          frequency: 5,
          examples: [
            "Technology has transformed how we communicate",
            "The latest technology makes tasks more efficient",
          ],
          synonyms: ["innovation", "advancement", "engineering"],
          difficulty: 2,
        },
      },
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      // Extract user's name for personalized responses
      const userName = userMemory.retrieve("name")?.value

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
        const result = await this.processVocabQuery(query, context)
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

      const response = this.buildVocabResponse(results, userName)
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
          toolsUsed: this.getToolsUsed(results),
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

    // Look for synonym requests
    const synonymMatch = input.match(/synonym(?:s)?\s+(?:for|of)\s+(\w+)|what\s+are\s+synonyms?\s+(?:for|of)\s+(\w+)/gi)
    if (synonymMatch) {
      synonymMatch.forEach((match) => {
        const word = match.replace(/synonym(?:s)?\s+(?:for|of)\s+|what\s+are\s+synonyms?\s+(?:for|of)\s+/gi, "").trim()
        if (word) queries.push(word.toLowerCase())
      })
    }

    // Look for pronunciation requests
    const pronounceMatch = input.match(/pronounce\s+(\w+)|how\s+to\s+pronounce\s+(\w+)|pronunciation\s+of\s+(\w+)/gi)
    if (pronounceMatch) {
      pronounceMatch.forEach((match) => {
        const word = match.replace(/pronounce\s+|how\s+to\s+pronounce\s+|pronunciation\s+of\s+/gi, "").trim()
        if (word) queries.push(word.toLowerCase())
      })
    }

    return [...new Set(queries)] // Remove duplicates
  }

  private async processVocabQuery(word: string, context?: any): Promise<any> {
    const queryType = this.determineQueryType(context?.originalInput || "", word)

    // First check seed data
    const seedResult = this.searchSeedData(word)
    if (seedResult) {
      const enhancedResult = await this.enhanceWithTools(seedResult, queryType)
      return {
        word,
        source: "seed",
        data: enhancedResult,
        confidence: 0.95,
        queryType,
      }
    }

    // Check learnt data
    const learntResult = this.searchLearntData(word)
    if (learntResult) {
      const enhancedResult = await this.enhanceWithTools(learntResult, queryType)
      return {
        word,
        source: "learnt",
        data: enhancedResult,
        confidence: 0.9,
        queryType,
      }
    }

    // Try online lookup with full tool integration
    const onlineResult = await this.lookupOnlineWithTools(word, queryType)
    if (onlineResult) {
      await this.saveToLearntData(word, onlineResult)
      return {
        word,
        source: "online",
        data: onlineResult,
        confidence: 0.85,
        queryType,
      }
    }

    return null
  }

  private determineQueryType(input: string, word: string): string[] {
    const types: string[] = []
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("define") || lowerInput.includes("meaning")) {
      types.push("definition")
    }
    if (lowerInput.includes("synonym") || lowerInput.includes("similar")) {
      types.push("thesaurus")
    }
    if (lowerInput.includes("pronounce") || lowerInput.includes("pronunciation")) {
      types.push("phonetics")
    }
    if (lowerInput.includes("grammar") || lowerInput.includes("plural") || lowerInput.includes("past tense")) {
      types.push("grammar")
    }

    // Default to definition if no specific type detected
    if (types.length === 0) {
      types.push("definition")
    }

    return types
  }

  private async enhanceWithTools(baseData: VocabEntry, queryTypes: string[]): Promise<VocabEntry> {
    const enhanced = { ...baseData }

    for (const queryType of queryTypes) {
      switch (queryType) {
        case "thesaurus":
          if (!enhanced.thesaurusData) {
            const thesaurusResult = await thesaurusClient.lookupThesaurus(baseData.word)
            if (thesaurusResult.success && thesaurusResult.data) {
              enhanced.thesaurusData = thesaurusResult.data
              enhanced.synonyms = [...enhanced.synonyms, ...thesaurusResult.data.synonyms]
              enhanced.antonyms = [...enhanced.antonyms, ...thesaurusResult.data.antonyms]
            }
          }
          break

        case "phonetics":
          if (!enhanced.phoneticData) {
            const phoneticResult = await phoneticsClient.lookupPhonetics(baseData.word)
            if (phoneticResult.success && phoneticResult.data) {
              enhanced.phoneticData = phoneticResult.data
              if (!enhanced.phonetics) {
                enhanced.phonetics = phoneticResult.data.phonetic
              }
            }
          }
          break

        case "grammar":
          if (!enhanced.grammarData) {
            const grammarResult = await grammarClient.analyzeGrammar(baseData.word)
            if (grammarResult.success && grammarResult.data) {
              enhanced.grammarData = grammarResult.data
            }
          }
          break
      }
    }

    return enhanced
  }

  private async lookupOnlineWithTools(word: string, queryTypes: string[]): Promise<VocabEntry | null> {
    try {
      // Get basic definition from dictionary API
      const dictResult = await dictionaryAPI.lookupWord(word)
      if (!dictResult.success || !dictResult.data) {
        return null
      }

      const baseEntry: VocabEntry = {
        word: dictResult.data.word,
        definition: dictResult.data.meanings[0]?.definitions[0]?.definition || "No definition available",
        partOfSpeech: dictResult.data.meanings[0]?.partOfSpeech || "unknown",
        phonetics: dictResult.data.phonetic,
        frequency: 3, // Default frequency
        examples: dictResult.data.meanings[0]?.definitions[0]?.example
          ? [dictResult.data.meanings[0].definitions[0].example]
          : [],
        synonyms: dictionaryAPI.getAllSynonyms(dictResult.data),
        antonyms: dictionaryAPI.getAllAntonyms(dictResult.data),
        etymology: dictResult.data.origin,
        difficulty: 3, // Default difficulty
        timestamp: Date.now(),
      }

      // Enhance with additional tools based on query type
      const enhancedEntry = await this.enhanceWithTools(baseEntry, queryTypes)

      return enhancedEntry
    } catch (error) {
      console.error("Online lookup with tools failed:", error)
      return null
    }
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

  private async saveToLearntData(word: string, entry: VocabEntry): Promise<void> {
    const learntEntry = {
      id: generateId(),
      content: entry,
      confidence: calculateConfidence({
        sourceReliability: 0.8,
        dataQuality: 0.9,
        contextMatch: 0.7,
      }),
      source: "enhanced-dictionary-api",
      context: `Enhanced lookup for "${word}" with multiple tools`,
      timestamp: Date.now(),
      usageCount: 1,
      lastUsed: Date.now(),
      verified: true,
      tags: ["dictionary", "online-lookup", "enhanced"],
      relationships: [],
    }

    await storageManager.addLearntEntry("vocabulary", learntEntry)
    this.stats.learntEntries++
  }

  private buildVocabResponse(results: any[], userName?: string): string {
    let response = ""

    // Add personalized greeting if user name is known
    if (userName && results.length > 0) {
      response += `Hi ${userName}! Here's what I found:\n\n`
    }

    if (results.length === 1) {
      const result = results[0]
      const data = result.data

      response += `**${data.word.toUpperCase()}**\n\n`

      if (data.phonetics || data.phoneticData?.phonetic) {
        response += `**Pronunciation:** ${data.phonetics || data.phoneticData.phonetic}\n`
      }

      if (data.partOfSpeech) {
        response += `**Part of Speech:** ${data.partOfSpeech}\n`
      }

      response += `**Definition:** ${data.definition}\n`

      if (data.examples && data.examples.length > 0) {
        response += `\n**Example:** "${data.examples[0]}"\n`
      }

      // Enhanced thesaurus information
      if (data.thesaurusData || (data.synonyms && data.synonyms.length > 0)) {
        const synonyms = data.thesaurusData?.synonyms || data.synonyms
        if (synonyms.length > 0) {
          response += `\n**Synonyms:** ${synonyms.slice(0, 5).join(", ")}`
        }
      }

      if (data.thesaurusData?.antonyms || (data.antonyms && data.antonyms.length > 0)) {
        const antonyms = data.thesaurusData?.antonyms || data.antonyms
        if (antonyms.length > 0) {
          response += `\n**Antonyms:** ${antonyms.slice(0, 5).join(", ")}`
        }
      }

      // Enhanced phonetic information
      if (data.phoneticData) {
        if (data.phoneticData.syllables && data.phoneticData.syllables.length > 0) {
          response += `\n**Syllables:** ${data.phoneticData.syllables.join(" • ")}`
        }
        if (data.phoneticData.rhymes && data.phoneticData.rhymes.length > 0) {
          response += `\n**Rhymes:** ${data.phoneticData.rhymes.join(", ")}`
        }
      }

      // Grammar information
      if (data.grammarData) {
        response += `\n\n**Grammar Forms:**`
        const forms = data.grammarData.wordForms
        if (forms.plural) response += `\n• Plural: ${forms.plural}`
        if (forms.pastTense) response += `\n• Past Tense: ${forms.pastTense}`
        if (forms.comparative) response += `\n• Comparative: ${forms.comparative}`
        if (forms.superlative) response += `\n• Superlative: ${forms.superlative}`
      }

      if (data.etymology) {
        response += `\n\n**Etymology:** ${data.etymology}`
      }

      response += `\n\n*Source: ${result.source} data with enhanced tools*`
    } else {
      response += "Here are the vocabulary definitions:\n\n"
      results.forEach((result, index) => {
        const data = result.data
        response += `**${index + 1}. ${data.word.toUpperCase()}**\n`
        response += `${data.definition}\n`
        if (data.phonetics) response += `Pronunciation: ${data.phonetics}\n`
        response += "\n"
      })
    }

    return response
  }

  private getToolsUsed(results: any[]): string[] {
    const tools = new Set<string>()

    results.forEach((result) => {
      tools.add("dictionary")
      if (result.data.thesaurusData) tools.add("thesaurus")
      if (result.data.phoneticData) tools.add("phonetics")
      if (result.data.grammarData) tools.add("grammar")
    })

    return Array.from(tools)
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

    // Store the learning interaction in user memory
    if (data.input && data.results.length > 0) {
      const words = data.results.map((r: any) => r.word).join(", ")
      userMemory.store(`vocab_learned_${Date.now()}`, `Learned about: ${words}`, "learning", 0.6, data.input)
    }
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

  // New methods for enhanced functionality
  async getWordDetails(word: string): Promise<VocabEntry | null> {
    const result = await this.processVocabQuery(word, { originalInput: `define ${word}` })
    return result?.data || null
  }

  async searchWords(query: string): Promise<VocabEntry[]> {
    const results: VocabEntry[] = []
    const keywords = extractKeywords(query)

    // Search seed data
    if (this.seedData?.words) {
      Object.entries(this.seedData.words).forEach(([word, data]: [string, any]) => {
        if (
          keywords.some(
            (keyword) =>
              word.includes(keyword) ||
              data.definition.toLowerCase().includes(keyword) ||
              data.synonyms?.some((syn: string) => syn.includes(keyword)),
          )
        ) {
          results.push({
            word,
            definition: data.definition,
            partOfSpeech: data.partOfSpeech || "unknown",
            phonetics: data.phonetics,
            frequency: data.frequency || 1,
            examples: data.examples || [],
            synonyms: data.synonyms || [],
            antonyms: data.antonyms || [],
            etymology: data.etymology,
            difficulty: data.difficulty || 1,
            timestamp: Date.now(),
          })
        }
      })
    }

    // Search learnt data
    if (this.learntData?.entries) {
      Object.values(this.learntData.entries).forEach((entry: any) => {
        if (
          entry.content &&
          keywords.some(
            (keyword) =>
              entry.content.word.includes(keyword) || entry.content.definition.toLowerCase().includes(keyword),
          )
        ) {
          results.push(entry.content)
        }
      })
    }

    return results.slice(0, 20) // Limit results
  }

  async getPopularWords(): Promise<VocabEntry[]> {
    const popularEntries = await storageManager.getPopularEntries("vocabulary", 10)
    return popularEntries.map((entry) => entry.content).filter(Boolean)
  }

  async getRecentWords(): Promise<VocabEntry[]> {
    const recentEntries = await storageManager.getRecentEntries("vocabulary", 10)
    return recentEntries.map((entry) => entry.content).filter(Boolean)
  }
}

export const vocabularyModule = new VocabularyModule()
