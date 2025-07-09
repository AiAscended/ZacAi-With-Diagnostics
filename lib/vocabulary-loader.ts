export interface VocabularyEntry {
  word: string
  definition: string
  partOfSpeech: string
  examples: string[]
  synonyms: string[]
  antonyms: string[]
  phonetic: string
  frequency: number
  source: "seed" | "learnt"
  dateAdded: string
  lastUsed?: string
  topics?: string[]
  notes?: string
}

export interface VocabularyData {
  [word: string]: VocabularyEntry
}

export class VocabularyLoader {
  private static instance: VocabularyLoader
  private vocabularyCache: Map<string, VocabularyEntry> = new Map()
  private isLoaded = false

  private constructor() {}

  public static getInstance(): VocabularyLoader {
    if (!VocabularyLoader.instance) {
      VocabularyLoader.instance = new VocabularyLoader()
    }
    return VocabularyLoader.instance
  }

  public async loadSeedVocabulary(): Promise<Map<string, VocabularyEntry>> {
    if (this.isLoaded && this.vocabularyCache.size > 0) {
      return this.vocabularyCache
    }

    try {
      const response = await fetch("/seed_vocab.json")
      if (!response.ok) {
        throw new Error(`Failed to load seed vocabulary: ${response.statusText}`)
      }

      const data: VocabularyData = await response.json()

      // Convert to Map and ensure proper structure
      this.vocabularyCache.clear()

      for (const [word, entry] of Object.entries(data)) {
        const vocabularyEntry: VocabularyEntry = {
          word: entry.word || word,
          definition: entry.definition || "No definition available",
          partOfSpeech: entry.partOfSpeech || "unknown",
          examples: Array.isArray(entry.examples) ? entry.examples : [],
          synonyms: Array.isArray(entry.synonyms) ? entry.synonyms : [],
          antonyms: Array.isArray(entry.antonyms) ? entry.antonyms : [],
          phonetic: entry.phonetic || "",
          frequency: typeof entry.frequency === "number" ? entry.frequency : 1,
          source: entry.source || "seed",
          dateAdded: entry.dateAdded || new Date().toISOString(),
          lastUsed: entry.lastUsed,
          topics: Array.isArray(entry.topics) ? entry.topics : [],
          notes: entry.notes || "",
        }

        this.vocabularyCache.set(word.toLowerCase(), vocabularyEntry)
      }

      this.isLoaded = true
      console.log(`✅ Loaded ${this.vocabularyCache.size} vocabulary entries`)

      return this.vocabularyCache
    } catch (error) {
      console.error("Failed to load seed vocabulary:", error)

      // Return basic vocabulary as fallback
      const basicVocab = this.createBasicVocabulary()
      this.vocabularyCache = basicVocab
      this.isLoaded = true

      return basicVocab
    }
  }

  public async loadLearntVocabulary(): Promise<Map<string, VocabularyEntry>> {
    try {
      const stored = localStorage.getItem("learnt_vocabulary")
      if (!stored) {
        return new Map()
      }

      const data: VocabularyData = JSON.parse(stored)
      const learntVocab = new Map<string, VocabularyEntry>()

      for (const [word, entry] of Object.entries(data)) {
        const vocabularyEntry: VocabularyEntry = {
          word: entry.word || word,
          definition: entry.definition || "No definition available",
          partOfSpeech: entry.partOfSpeech || "unknown",
          examples: Array.isArray(entry.examples) ? entry.examples : [],
          synonyms: Array.isArray(entry.synonyms) ? entry.synonyms : [],
          antonyms: Array.isArray(entry.antonyms) ? entry.antonyms : [],
          phonetic: entry.phonetic || "",
          frequency: typeof entry.frequency === "number" ? entry.frequency : 1,
          source: "learnt",
          dateAdded: entry.dateAdded || new Date().toISOString(),
          lastUsed: entry.lastUsed,
          topics: Array.isArray(entry.topics) ? entry.topics : [],
          notes: entry.notes || "",
        }

        learntVocab.set(word.toLowerCase(), vocabularyEntry)
      }

      console.log(`✅ Loaded ${learntVocab.size} learnt vocabulary entries`)
      return learntVocab
    } catch (error) {
      console.error("Failed to load learnt vocabulary:", error)
      return new Map()
    }
  }

  public async saveLearntVocabulary(vocabulary: Map<string, VocabularyEntry>): Promise<void> {
    try {
      const data: VocabularyData = {}

      for (const [word, entry] of vocabulary) {
        data[word] = { ...entry, source: "learnt" }
      }

      localStorage.setItem("learnt_vocabulary", JSON.stringify(data))
      console.log(`✅ Saved ${vocabulary.size} learnt vocabulary entries`)
    } catch (error) {
      console.error("Failed to save learnt vocabulary:", error)
    }
  }

  public getVocabularyEntry(word: string): VocabularyEntry | undefined {
    return this.vocabularyCache.get(word.toLowerCase())
  }

  public addVocabularyEntry(word: string, entry: VocabularyEntry): void {
    this.vocabularyCache.set(word.toLowerCase(), entry)
  }

  public getAllVocabulary(): Map<string, VocabularyEntry> {
    return new Map(this.vocabularyCache)
  }

  public getVocabularyStats(): { total: number; seed: number; learnt: number } {
    let seed = 0
    let learnt = 0

    for (const entry of this.vocabularyCache.values()) {
      if (entry.source === "seed") {
        seed++
      } else {
        learnt++
      }
    }

    return {
      total: this.vocabularyCache.size,
      seed,
      learnt,
    }
  }

  private createBasicVocabulary(): Map<string, VocabularyEntry> {
    const basicWords = [
      {
        word: "hello",
        definition: "A greeting used when meeting someone",
        partOfSpeech: "interjection",
        examples: ["Hello, how are you?"],
        synonyms: ["hi", "greetings"],
        antonyms: ["goodbye"],
        phonetic: "/həˈloʊ/",
        frequency: 1,
      },
      {
        word: "computer",
        definition: "An electronic device that processes data",
        partOfSpeech: "noun",
        examples: ["I use my computer for work"],
        synonyms: ["machine", "device"],
        antonyms: [],
        phonetic: "/kəmˈpjuːtər/",
        frequency: 2,
      },
      {
        word: "learn",
        definition: "To acquire knowledge or skill",
        partOfSpeech: "verb",
        examples: ["I want to learn programming"],
        synonyms: ["study", "acquire"],
        antonyms: ["forget", "unlearn"],
        phonetic: "/lɜːrn/",
        frequency: 3,
      },
    ]

    const basicVocab = new Map<string, VocabularyEntry>()

    for (const word of basicWords) {
      const entry: VocabularyEntry = {
        ...word,
        source: "seed",
        dateAdded: new Date().toISOString(),
        topics: ["basic"],
        notes: "Basic vocabulary entry",
      }
      basicVocab.set(word.word.toLowerCase(), entry)
    }

    return basicVocab
  }

  public clearCache(): void {
    this.vocabularyCache.clear()
    this.isLoaded = false
  }
}

// Export singleton instance
export const vocabularyLoader = VocabularyLoader.getInstance()
