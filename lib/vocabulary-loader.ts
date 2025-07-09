export interface VocabularyEntry {
  definition: string
  part_of_speech: string
  examples: string[]
  synonyms: string[]
  antonyms: string[]
  phonetic: string
  frequency: number
  source: "seed" | "learnt"
  date_added: string
  last_used?: string
  topics?: string[]
  notes?: string
}

export interface VocabularyData {
  [word: string]: VocabularyEntry
}

export class VocabularyLoader {
  private seedVocabulary: VocabularyData = {}
  private learntVocabulary: VocabularyData = {}
  private isLoaded = false

  async loadSeedVocabulary(): Promise<VocabularyData> {
    if (this.isLoaded && Object.keys(this.seedVocabulary).length > 0) {
      return this.seedVocabulary
    }

    try {
      const response = await fetch("/seed_vocab.json")
      if (!response.ok) {
        throw new Error(`Failed to load seed vocabulary: ${response.statusText}`)
      }

      this.seedVocabulary = await response.json()
      console.log(`✅ Loaded ${Object.keys(this.seedVocabulary).length} seed vocabulary words`)
      return this.seedVocabulary
    } catch (error) {
      console.error("❌ Error loading seed vocabulary:", error)

      // Fallback to basic vocabulary
      this.seedVocabulary = this.getBasicVocabulary()
      return this.seedVocabulary
    }
  }

  async loadLearntVocabulary(): Promise<VocabularyData> {
    try {
      const stored = localStorage.getItem("zacai_learnt_vocab")
      if (stored) {
        this.learntVocabulary = JSON.parse(stored)
        console.log(`✅ Loaded ${Object.keys(this.learntVocabulary).length} learnt vocabulary words`)
      }
      return this.learntVocabulary
    } catch (error) {
      console.error("❌ Error loading learnt vocabulary:", error)
      this.learntVocabulary = {}
      return this.learntVocabulary
    }
  }

  async saveLearntVocabulary(): Promise<void> {
    try {
      localStorage.setItem("zacai_learnt_vocab", JSON.stringify(this.learntVocabulary))
      console.log(`✅ Saved ${Object.keys(this.learntVocabulary).length} learnt vocabulary words`)
    } catch (error) {
      console.error("❌ Error saving learnt vocabulary:", error)
    }
  }

  addLearntWord(word: string, entry: VocabularyEntry): void {
    this.learntVocabulary[word.toLowerCase()] = {
      ...entry,
      source: "learnt",
      date_added: new Date().toISOString(),
      last_used: new Date().toISOString(),
    }
    this.saveLearntVocabulary()
  }

  getWord(word: string): VocabularyEntry | null {
    const normalizedWord = word.toLowerCase()
    return this.seedVocabulary[normalizedWord] || this.learntVocabulary[normalizedWord] || null
  }

  getAllVocabulary(): VocabularyData {
    return { ...this.seedVocabulary, ...this.learntVocabulary }
  }

  getVocabularySize(): number {
    return Object.keys(this.seedVocabulary).length + Object.keys(this.learntVocabulary).length
  }

  getSeedVocabularySize(): number {
    return Object.keys(this.seedVocabulary).length
  }

  getLearntVocabularySize(): number {
    return Object.keys(this.learntVocabulary).length
  }

  private getBasicVocabulary(): VocabularyData {
    return {
      hello: {
        definition: "A greeting used when meeting someone",
        part_of_speech: "interjection",
        examples: ["Hello, how are you?", "She said hello to her neighbor"],
        synonyms: ["hi", "greetings", "hey"],
        antonyms: ["goodbye", "farewell"],
        phonetic: "həˈloʊ",
        frequency: 1,
        source: "seed",
        date_added: new Date().toISOString(),
      },
      the: {
        definition: "Used to refer to a specific thing or person",
        part_of_speech: "article",
        examples: ["The cat is sleeping", "I saw the movie yesterday"],
        synonyms: [],
        antonyms: [],
        phonetic: "ðə",
        frequency: 1,
        source: "seed",
        date_added: new Date().toISOString(),
      },
      and: {
        definition: "Used to connect words, phrases, or clauses",
        part_of_speech: "conjunction",
        examples: ["Bread and butter", "He ran and jumped"],
        synonyms: ["plus", "also", "furthermore"],
        antonyms: ["or", "but"],
        phonetic: "ænd",
        frequency: 2,
        source: "seed",
        date_added: new Date().toISOString(),
      },
    }
  }

  async initialize(): Promise<void> {
    if (this.isLoaded) return

    await Promise.all([this.loadSeedVocabulary(), this.loadLearntVocabulary()])

    this.isLoaded = true
    console.log(`✅ VocabularyLoader initialized with ${this.getVocabularySize()} total words`)
  }
}

// Export a singleton instance
export const vocabularyLoader = new VocabularyLoader()
