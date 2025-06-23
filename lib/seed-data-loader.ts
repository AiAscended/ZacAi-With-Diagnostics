interface CompactVocabEntry {
  d: string // definition
  p: string // part of speech
  ph?: string // phonetic
  s?: string[] // synonyms
  a?: string[] // antonyms
  e?: string[] // examples
  f?: number // frequency
}

interface CompactMathEntry {
  d: string // definition
  f?: string // formula
  e?: string[] // examples
  c: string // category
  l: number // difficulty level
}

export class SeedDataLoader {
  private static instance: SeedDataLoader
  private loadedChunks: Set<string> = new Set()
  private vocabCache: Map<string, any> = new Map()
  private mathCache: Map<string, any> = new Map()

  static getInstance(): SeedDataLoader {
    if (!SeedDataLoader.instance) {
      SeedDataLoader.instance = new SeedDataLoader()
    }
    return SeedDataLoader.instance
  }

  async loadVocabularyChunk(chunkNumber: number): Promise<Map<string, any>> {
    const chunkKey = `vocab_chunk_${chunkNumber}`

    if (this.loadedChunks.has(chunkKey)) {
      return this.getVocabChunk(chunkNumber)
    }

    try {
      const response = await fetch(`/seed_vocab_chunk_${chunkNumber}.json`)
      if (!response.ok) throw new Error(`Failed to load ${chunkKey}`)

      const compactData: Record<string, CompactVocabEntry> = await response.json()

      // Expand compact format to full format
      const expandedData = new Map<string, any>()

      Object.entries(compactData).forEach(([word, compact]) => {
        expandedData.set(word, {
          word,
          definition: compact.d,
          partOfSpeech: compact.p,
          phonetic: compact.ph,
          synonyms: compact.s || [],
          antonyms: compact.a || [],
          examples: compact.e || [],
          frequency: compact.f || 50,
          learned: Date.now(),
          category: "seed",
        })
      })

      // Cache the chunk
      this.cacheVocabChunk(chunkNumber, expandedData)
      this.loadedChunks.add(chunkKey)

      console.log(`📚 Loaded vocabulary chunk ${chunkNumber} (${expandedData.size} words)`)
      return expandedData
    } catch (error) {
      console.warn(`Failed to load vocabulary chunk ${chunkNumber}:`, error)
      return new Map()
    }
  }

  async loadAllVocabulary(): Promise<Map<string, any>> {
    const allVocab = new Map<string, any>()

    // Load all 4 chunks (108 words each = 432 total)
    for (let i = 1; i <= 4; i++) {
      const chunk = await this.loadVocabularyChunk(i)
      chunk.forEach((value, key) => allVocab.set(key, value))
    }

    return allVocab
  }

  async loadMathData(): Promise<Map<string, any>> {
    if (this.mathCache.size > 0) {
      return this.mathCache
    }

    try {
      const response = await fetch("/seed_maths_enhanced.json")
      if (!response.ok) throw new Error("Failed to load enhanced math data")

      const data = await response.json()
      const mathMap = new Map<string, any>()

      Object.entries(data).forEach(([key, value]) => {
        mathMap.set(key, value)
      })

      this.mathCache = mathMap
      console.log(`🔢 Loaded enhanced math data (${mathMap.size} concepts)`)
      return mathMap
    } catch (error) {
      console.warn("Failed to load enhanced math data:", error)
      return new Map()
    }
  }

  private cacheVocabChunk(chunkNumber: number, data: Map<string, any>): void {
    data.forEach((value, key) => {
      this.vocabCache.set(key, { ...value, chunk: chunkNumber })
    })
  }

  private getVocabChunk(chunkNumber: number): Map<string, any> {
    const chunk = new Map<string, any>()
    this.vocabCache.forEach((value, key) => {
      if (value.chunk === chunkNumber) {
        chunk.set(key, value)
      }
    })
    return chunk
  }

  getVocabStats(): { total: number; chunks: number; loaded: string[] } {
    return {
      total: this.vocabCache.size,
      chunks: 4,
      loaded: Array.from(this.loadedChunks),
    }
  }
}
