export interface WordEntry {
  word: string
  definition: string
  partOfSpeech?: string
  examples?: string[]
  synonyms?: string[]
  antonyms?: string[]
  phonetic?: string
  frequency?: number
  source?: string
  dateAdded?: string
  lastUsed?: string
  topics?: string[]
  notes?: string
}

export class VocabularyLoader {
  private vocabulary: Map<string, WordEntry> = new Map()
  private isLoaded = false

  constructor() {
    console.log("📚 VocabularyLoader: Initializing...")
  }

  public async loadVocabulary(vocabArray?: WordEntry[]): Promise<void> {
    if (this.isLoaded && !vocabArray) return

    try {
      if (vocabArray) {
        // Load from provided array
        vocabArray.forEach((entry) => {
          this.vocabulary.set(entry.word.toLowerCase(), entry)
        })
        console.log(`📚 VocabularyLoader: Loaded ${vocabArray.length} words from array`)
      } else {
        // Load from seed file
        const response = await fetch("/seed_vocab.json")
        if (response.ok) {
          const vocabData = await response.json()

          // Handle both object and array formats
          if (Array.isArray(vocabData)) {
            vocabData.forEach((entry) => {
              this.vocabulary.set(entry.word.toLowerCase(), entry)
            })
          } else {
            Object.entries(vocabData).forEach(([word, data]: [string, any]) => {
              this.vocabulary.set(word.toLowerCase(), {
                word,
                ...data,
              })
            })
          }

          console.log(`📚 VocabularyLoader: Loaded ${this.vocabulary.size} words from seed file`)
        } else {
          console.warn("⚠️ VocabularyLoader: Could not load seed vocabulary file")
        }
      }

      this.isLoaded = true
    } catch (error) {
      console.error("❌ VocabularyLoader: Error loading vocabulary:", error)
      // Initialize with basic vocabulary if loading fails
      this.initializeBasicVocabulary()
    }
  }

  private initializeBasicVocabulary(): void {
    const basicWords: WordEntry[] = [
      {
        word: "hello",
        definition: "A greeting used when meeting someone",
        partOfSpeech: "interjection",
        examples: ["Hello, how are you?"],
        frequency: 1,
      },
      {
        word: "the",
        definition: "Used to refer to a specific thing",
        partOfSpeech: "article",
        examples: ["The cat is sleeping"],
        frequency: 1,
      },
      {
        word: "and",
        definition: "Used to connect words or phrases",
        partOfSpeech: "conjunction",
        examples: ["Cats and dogs"],
        frequency: 1,
      },
    ]

    basicWords.forEach((entry) => {
      this.vocabulary.set(entry.word.toLowerCase(), entry)
    })

    console.log("📚 VocabularyLoader: Initialized with basic vocabulary")
  }

  public getWordDefinition(word: string): WordEntry | null {
    return this.vocabulary.get(word.toLowerCase()) || null
  }

  public hasWord(word: string): boolean {
    return this.vocabulary.has(word.toLowerCase())
  }

  public getAllWords(): WordEntry[] {
    return Array.from(this.vocabulary.values())
  }

  public getVocabularySize(): number {
    return this.vocabulary.size
  }

  public addWord(entry: WordEntry): void {
    this.vocabulary.set(entry.word.toLowerCase(), entry)
  }

  public removeWord(word: string): boolean {
    return this.vocabulary.delete(word.toLowerCase())
  }

  public searchWords(query: string): WordEntry[] {
    const results: WordEntry[] = []
    const lowerQuery = query.toLowerCase()

    for (const entry of this.vocabulary.values()) {
      if (entry.word.toLowerCase().includes(lowerQuery) || entry.definition.toLowerCase().includes(lowerQuery)) {
        results.push(entry)
      }
    }

    return results.slice(0, 10) // Limit results
  }

  public getWordsByPartOfSpeech(partOfSpeech: string): WordEntry[] {
    return Array.from(this.vocabulary.values()).filter((entry) => entry.partOfSpeech === partOfSpeech)
  }

  public exportVocabulary(): any {
    const exported: any = {}
    for (const [word, entry] of this.vocabulary.entries()) {
      exported[word] = entry
    }
    return exported
  }

  public importVocabulary(data: any): void {
    if (Array.isArray(data)) {
      data.forEach((entry) => {
        this.vocabulary.set(entry.word.toLowerCase(), entry)
      })
    } else {
      Object.entries(data).forEach(([word, entry]: [string, any]) => {
        this.vocabulary.set(word.toLowerCase(), {
          word,
          ...entry,
        })
      })
    }
    console.log(`📚 VocabularyLoader: Imported ${this.vocabulary.size} words`)
  }

  public getStats(): any {
    return {
      totalWords: this.vocabulary.size,
      isLoaded: this.isLoaded,
      partsOfSpeech: this.getPartsOfSpeechStats(),
    }
  }

  private getPartsOfSpeechStats(): any {
    const stats: any = {}
    for (const entry of this.vocabulary.values()) {
      const pos = entry.partOfSpeech || "unknown"
      stats[pos] = (stats[pos] || 0) + 1
    }
    return stats
  }
}
