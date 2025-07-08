import { SystemConfig } from "../system/config"

export interface LearnedKnowledge {
  vocabulary: Map<string, any>
  mathematics: Map<string, any>
  userInfo: Map<string, any>
  facts: Map<string, any>
  conversations: any[]
  metadata: {
    totalEntries: number
    lastUpdated: number
    version: string
  }
}

export class KnowledgeManager {
  private learnedKnowledge: LearnedKnowledge
  private sessionData: any = {}

  constructor() {
    this.learnedKnowledge = {
      vocabulary: new Map(),
      mathematics: new Map(),
      userInfo: new Map(),
      facts: new Map(),
      conversations: [],
      metadata: {
        totalEntries: 0,
        lastUpdated: Date.now(),
        version: SystemConfig.VERSION,
      },
    }
  }

  public async initialize(): Promise<void> {
    console.log("📚 KnowledgeManager: Initializing...")
    await this.loadSeedData()
  }

  public async loadSeedData(): Promise<void> {
    try {
      console.log("🌱 Loading seed data...")

      const [vocab, maths, system, learning, knowledge] = await Promise.all([
        this.loadSeedFile(SystemConfig.SEED_FILES.VOCABULARY),
        this.loadSeedFile(SystemConfig.SEED_FILES.MATHEMATICS),
        this.loadSeedFile(SystemConfig.SEED_FILES.SYSTEM),
        this.loadSeedFile(SystemConfig.SEED_FILES.LEARNING),
        this.loadSeedFile(SystemConfig.SEED_FILES.KNOWLEDGE).catch(() => null),
      ])

      if (vocab) {
        Object.entries(vocab).forEach(([word, data]: [string, any]) => {
          const entry = {
            word,
            definition: data.definition || `Definition for ${word}`,
            partOfSpeech: data.part_of_speech || data.partOfSpeech || "unknown",
            phonetic: data.phonetic || "",
            synonyms: Array.isArray(data.synonyms) ? data.synonyms : [],
            antonyms: Array.isArray(data.antonyms) ? data.antonyms : [],
            examples: Array.isArray(data.examples) ? data.examples : [],
            frequency: typeof data.frequency === "number" ? data.frequency : 1,
            learned: Date.now(),
            category: data.alphabet_position ? "alphabet" : "seed",
          }

          this.learnedKnowledge.vocabulary.set(word, entry)
        })
        console.log(`✅ Processed ${Object.keys(vocab).length} vocabulary entries`)
      }

      if (maths) {
        Object.entries(maths).forEach(([concept, data]: [string, any]) => {
          this.learnedKnowledge.mathematics.set(concept, {
            concept,
            formula: data.formula,
            examples: data.examples || [],
            category: data.category || "arithmetic",
            difficulty: data.difficulty || 1,
            learned: Date.now(),
          })
        })
      }

      if (system) {
        this.sessionData.system = system
      }

      if (learning) {
        this.sessionData.learning = learning
      }

      if (knowledge) {
        Object.entries(knowledge).forEach(([topic, data]: [string, any]) => {
          this.learnedKnowledge.facts.set(topic, {
            fact: data.summary || data.content || "",
            source: data.source || "seed",
            category: data.category || "general",
            confidence: 0.9,
            timestamp: Date.now(),
          })
        })
      }

      console.log("✅ Seed data loaded successfully")
    } catch (error) {
      console.error("❌ Failed to load seed data:", error)
    }
  }

  private async loadSeedFile(path: string): Promise<any> {
    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load ${path}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error(`❌ Failed to load ${path}:`, error)
      throw error
    }
  }

  public async learnFromMessage(userMessage: string, aiResponse: string): Promise<void> {
    const extractedKnowledge: string[] = []

    try {
      // Extract vocabulary
      const newWords = this.extractNewVocabulary(userMessage)
      for (const word of newWords) {
        if (!this.learnedKnowledge.vocabulary.has(word)) {
          const definition = await this.lookupWordDefinition(word)
          if (definition) {
            this.learnedKnowledge.vocabulary.set(word, {
              word,
              definition: definition.definition || `Learned definition for ${word}`,
              partOfSpeech: definition.partOfSpeech || "unknown",
              learned: Date.now(),
              category: "learned",
            })
            extractedKnowledge.push(`vocabulary: ${word}`)
          }
        }
      }

      // Store conversation
      this.learnedKnowledge.conversations.push({
        id: Date.now().toString(),
        timestamp: Date.now(),
        userMessage,
        aiResponse,
        knowledgeExtracted: extractedKnowledge,
      })

      // Keep conversations manageable
      if (this.learnedKnowledge.conversations.length > 100) {
        this.learnedKnowledge.conversations = this.learnedKnowledge.conversations.slice(-80)
      }

      // Update metadata
      this.updateMetadata()

      if (extractedKnowledge.length > 0) {
        console.log(`🧠 Learned: ${extractedKnowledge.join(", ")}`)
      }
    } catch (error) {
      console.error("Error in learnFromMessage:", error)
    }
  }

  private extractNewVocabulary(message: string): string[] {
    const words = message.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
    return words.filter(
      (word) => word.length > 2 && !this.learnedKnowledge.vocabulary.has(word) && !this.isCommonWord(word),
    )
  }

  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      "the",
      "and",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "had",
      "her",
      "was",
      "one",
      "our",
      "out",
      "day",
      "get",
      "has",
      "him",
      "his",
      "how",
      "man",
      "new",
      "now",
      "old",
      "see",
      "two",
      "way",
      "who",
      "boy",
    ])
    return commonWords.has(word)
  }

  private async lookupWordDefinition(word: string): Promise<any | null> {
    if (!SystemConfig.LEARNING_SETTINGS.ONLINE_LEARNING_ENABLED) {
      return null
    }

    try {
      const response = await fetch(`${SystemConfig.APIS.DICTIONARY}${encodeURIComponent(word)}`)

      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          const entry = data[0]
          const meaning = entry.meanings[0]
          return {
            definition: meaning.definitions[0].definition,
            partOfSpeech: meaning.partOfSpeech,
            phonetic: entry.phonetic,
            examples: meaning.definitions[0].example ? [meaning.definitions[0].example] : [],
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to lookup definition for "${word}":`, error)
    }

    return null
  }

  public searchKnowledge(query: string): any[] {
    const results: any[] = []
    const queryLower = query.toLowerCase()

    try {
      // Search vocabulary
      for (const [word, entry] of this.learnedKnowledge.vocabulary) {
        if (entry && entry.definition) {
          if (word.includes(queryLower) || entry.definition.toLowerCase().includes(queryLower)) {
            results.push({
              type: "vocabulary",
              data: entry,
              relevance: this.calculateRelevance(query, word),
            })
          }
        }
      }

      // Search mathematics
      for (const [concept, entry] of this.learnedKnowledge.mathematics) {
        if (entry && entry.concept) {
          if (concept.includes(queryLower) || (entry.formula && entry.formula.toLowerCase().includes(queryLower))) {
            results.push({
              type: "mathematics",
              data: entry,
              relevance: this.calculateRelevance(query, concept),
            })
          }
        }
      }

      // Search facts
      for (const [topic, entry] of this.learnedKnowledge.facts) {
        if (entry && entry.fact) {
          if (topic.includes(queryLower) || entry.fact.toLowerCase().includes(queryLower)) {
            results.push({
              type: "facts",
              data: entry,
              relevance: this.calculateRelevance(query, entry.fact),
            })
          }
        }
      }

      return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10)
    } catch (error) {
      console.error("Error in searchKnowledge:", error)
      return []
    }
  }

  private calculateRelevance(query: string, text: string): number {
    const queryWords = query.toLowerCase().split(" ")
    const textWords = text.toLowerCase().split(" ")
    let matches = 0

    for (const queryWord of queryWords) {
      for (const textWord of textWords) {
        if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
          matches++
        }
      }
    }

    return matches / queryWords.length
  }

  private updateMetadata(): void {
    this.learnedKnowledge.metadata.totalEntries =
      this.learnedKnowledge.vocabulary.size +
      this.learnedKnowledge.mathematics.size +
      this.learnedKnowledge.userInfo.size +
      this.learnedKnowledge.facts.size
    this.learnedKnowledge.metadata.lastUpdated = Date.now()
  }

  public exportKnowledge(): any {
    return {
      vocabulary: Array.from(this.learnedKnowledge.vocabulary.entries()),
      mathematics: Array.from(this.learnedKnowledge.mathematics.entries()),
      userInfo: Array.from(this.learnedKnowledge.userInfo.entries()),
      facts: Array.from(this.learnedKnowledge.facts.entries()),
      conversations: this.learnedKnowledge.conversations,
      metadata: this.learnedKnowledge.metadata,
      session: this.sessionData,
      exportDate: new Date().toISOString(),
    }
  }

  public importKnowledge(data: any): void {
    try {
      if (data.vocabulary) {
        this.learnedKnowledge.vocabulary = new Map(data.vocabulary)
      }
      if (data.mathematics) {
        this.learnedKnowledge.mathematics = new Map(data.mathematics)
      }
      if (data.userInfo) {
        this.learnedKnowledge.userInfo = new Map(data.userInfo)
      }
      if (data.facts) {
        this.learnedKnowledge.facts = new Map(data.facts)
      }
      if (data.conversations) {
        this.learnedKnowledge.conversations = data.conversations
      }
      if (data.metadata) {
        this.learnedKnowledge.metadata = data.metadata
      }
      if (data.session) {
        this.sessionData = data.session
      }

      console.log("✅ Knowledge imported successfully")
    } catch (error) {
      console.error("❌ Failed to import knowledge:", error)
    }
  }

  public getStats(): any {
    return {
      vocabulary: this.learnedKnowledge.vocabulary.size,
      mathematics: this.learnedKnowledge.mathematics.size,
      userInfo: this.learnedKnowledge.userInfo.size,
      facts: this.learnedKnowledge.facts.size,
      conversations: this.learnedKnowledge.conversations.length,
      totalEntries: this.learnedKnowledge.metadata.totalEntries,
      lastUpdated: this.learnedKnowledge.metadata.lastUpdated,
      version: this.learnedKnowledge.metadata.version,
    }
  }

  public async optimizeKnowledge(): Promise<void> {
    console.log("🔧 Optimizing knowledge base...")

    // Remove duplicates and old entries
    // Keep only recent conversations
    if (this.learnedKnowledge.conversations.length > 50) {
      this.learnedKnowledge.conversations = this.learnedKnowledge.conversations.slice(-50)
    }

    this.updateMetadata()
    console.log("✅ Knowledge optimization completed")
  }

  public async clearAllKnowledge(): Promise<void> {
    this.learnedKnowledge = {
      vocabulary: new Map(),
      mathematics: new Map(),
      userInfo: new Map(),
      facts: new Map(),
      conversations: [],
      metadata: {
        totalEntries: 0,
        lastUpdated: Date.now(),
        version: SystemConfig.VERSION,
      },
    }
    console.log("✅ All knowledge cleared")
  }
}
