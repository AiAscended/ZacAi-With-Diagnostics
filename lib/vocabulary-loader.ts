export interface WordEntry {
  word: string
  definitions: string[]
  partOfSpeech: string[]
  synonyms: string[]
  antonyms: string[]
  frequency: number
  examples: string[]
}

export interface VocabularyStats {
  totalWords: number
  seedWords: number
  learnedWords: number
  categories: { [key: string]: number }
}

export class VocabularyLoader {
  private vocabulary: Map<string, WordEntry> = new Map()
  private seedVocabulary: Map<string, WordEntry> = new Map()
  private learnedVocabulary: Map<string, WordEntry> = new Map()

  constructor() {
    this.vocabulary = new Map()
    this.seedVocabulary = new Map()
    this.learnedVocabulary = new Map()
  }

  public async loadVocabulary(): Promise<void> {
    try {
      // Load seed vocabulary
      const response = await fetch("/seed_vocab.json")
      if (response.ok) {
        const seedData = await response.json()
        if (Array.isArray(seedData)) {
          seedData.forEach((item) => {
            if (item && item.word && item.definition) {
              const entry: WordEntry = {
                word: item.word,
                definitions: Array.isArray(item.definitions) ? item.definitions : [item.definition],
                partOfSpeech: Array.isArray(item.partOfSpeech) ? item.partOfSpeech : [item.partOfSpeech || "unknown"],
                synonyms: Array.isArray(item.synonyms) ? item.synonyms : [],
                antonyms: Array.isArray(item.antonyms) ? item.antonyms : [],
                frequency: typeof item.frequency === "number" ? item.frequency : 1,
                examples: Array.isArray(item.examples) ? item.examples : [],
              }
              this.vocabulary.set(item.word.toLowerCase(), entry)
              this.seedVocabulary.set(item.word.toLowerCase(), entry)
            }
          })
        }
      }

      // Load learned vocabulary from localStorage
      const learnedData = localStorage.getItem("learned-vocabulary")
      if (learnedData) {
        try {
          const parsed = JSON.parse(learnedData)
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              if (item && item.word) {
                const entry: WordEntry = {
                  word: item.word,
                  definitions: Array.isArray(item.definitions) ? item.definitions : [item.definition || "Learned word"],
                  partOfSpeech: Array.isArray(item.partOfSpeech) ? item.partOfSpeech : [item.partOfSpeech || "unknown"],
                  synonyms: Array.isArray(item.synonyms) ? item.synonyms : [],
                  antonyms: Array.isArray(item.antonyms) ? item.antonyms : [],
                  frequency: typeof item.frequency === "number" ? item.frequency : 1,
                  examples: Array.isArray(item.examples) ? item.examples : [],
                }
                this.vocabulary.set(item.word.toLowerCase(), entry)
                this.learnedVocabulary.set(item.word.toLowerCase(), entry)
              }
            })
          }
        } catch (error) {
          console.warn("Failed to load learned vocabulary:", error)
        }
      }

      console.log(
        `Loaded ${this.vocabulary.size} words (${this.seedVocabulary.size} seed, ${this.learnedVocabulary.size} learned)`,
      )
    } catch (error) {
      console.error("Error loading vocabulary:", error)
    }
  }

  public getWord(word: string): WordEntry | undefined {
    return this.vocabulary.get(word.toLowerCase())
  }

  public addWord(wordEntry: WordEntry): void {
    const key = wordEntry.word.toLowerCase()
    this.vocabulary.set(key, wordEntry)
    this.learnedVocabulary.set(key, wordEntry)
    this.saveLearnedVocabulary()
  }

  public searchWords(query: string, limit = 10): WordEntry[] {
    const results: WordEntry[] = []
    const queryLower = query.toLowerCase()

    for (const [word, entry] of this.vocabulary) {
      if (results.length >= limit) break

      if (word.includes(queryLower) || entry.definitions.some((def) => def.toLowerCase().includes(queryLower))) {
        results.push(entry)
      }
    }

    return results
  }

  public getRandomWords(count = 5): WordEntry[] {
    const words = Array.from(this.vocabulary.values())
    const shuffled = words.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  public getVocabularyStats(): VocabularyStats {
    const categories: { [key: string]: number } = {}

    for (const entry of this.vocabulary.values()) {
      for (const pos of entry.partOfSpeech) {
        categories[pos] = (categories[pos] || 0) + 1
      }
    }

    return {
      totalWords: this.vocabulary.size,
      seedWords: this.seedVocabulary.size,
      learnedWords: this.learnedVocabulary.size,
      categories,
    }
  }

  private saveLearnedVocabulary(): void {
    try {
      const learnedArray = Array.from(this.learnedVocabulary.values())
      localStorage.setItem("learned-vocabulary", JSON.stringify(learnedArray))
    } catch (error) {
      console.warn("Failed to save learned vocabulary:", error)
    }
  }
}
