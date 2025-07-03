export interface EnhancedWordDefinition {
  word: string
  phonetic?: string
  phonetics: Array<{
    text?: string
    audio?: string
  }>
  meanings: Array<{
    partOfSpeech: string
    definitions: Array<{
      definition: string
      example?: string
      synonyms: string[]
      antonyms: string[]
    }>
    synonyms: string[]
    antonyms: string[]
  }>
  origin?: string
  sourceUrls?: string[]
  frequency?: number
  difficulty?: number
}

export interface ThesaurusEntry {
  word: string
  synonyms: string[]
  antonyms: string[]
  related: string[]
}

export class EnhancedDictionaryAPI {
  private static readonly DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en"
  private static readonly THESAURUS_API = "https://api.api-ninjas.com/v1/thesaurus"
  private static readonly CACHE_DURATION = 86400000 // 24 hours
  private cache = new Map<string, { data: EnhancedWordDefinition; timestamp: number }>()
  private thesaurusCache = new Map<string, { data: ThesaurusEntry; timestamp: number }>()

  async lookupWordComplete(word: string): Promise<{
    success: boolean
    data?: EnhancedWordDefinition
    error?: string
    cached?: boolean
  }> {
    const normalizedWord = word.toLowerCase().trim()

    if (!normalizedWord) {
      return { success: false, error: "Word cannot be empty" }
    }

    // Check cache first
    const cached = this.getCachedWord(normalizedWord)
    if (cached) {
      return { success: true, data: cached, cached: true }
    }

    try {
      // Get dictionary data
      const dictResponse = await fetch(`${EnhancedDictionaryAPI.DICTIONARY_API}/${encodeURIComponent(normalizedWord)}`)

      if (!dictResponse.ok) {
        if (dictResponse.status === 404) {
          return { success: false, error: `Word "${word}" not found in dictionary` }
        }
        throw new Error(`Dictionary API request failed: ${dictResponse.status}`)
      }

      const dictData = await dictResponse.json()
      if (!Array.isArray(dictData) || dictData.length === 0) {
        return { success: false, error: "Invalid response format from dictionary API" }
      }

      // Get thesaurus data
      const thesaurusData = await this.lookupThesaurus(normalizedWord)

      // Combine data
      const enhancedData = this.combineWordData(dictData[0], thesaurusData)

      // Cache the result
      this.cacheWord(normalizedWord, enhancedData)

      return { success: true, data: enhancedData, cached: false }
    } catch (error) {
      console.error("Enhanced dictionary lookup error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  private async lookupThesaurus(word: string): Promise<ThesaurusEntry | null> {
    try {
      // Check thesaurus cache
      const cached = this.getCachedThesaurus(word)
      if (cached) return cached

      // For now, we'll use a simple thesaurus lookup
      // In production, you'd use a real thesaurus API
      const thesaurusData: ThesaurusEntry = {
        word,
        synonyms: [],
        antonyms: [],
        related: [],
      }

      // Cache and return
      this.cacheThesaurus(word, thesaurusData)
      return thesaurusData
    } catch (error) {
      console.error("Thesaurus lookup error:", error)
      return null
    }
  }

  private combineWordData(dictData: any, thesaurusData: ThesaurusEntry | null): EnhancedWordDefinition {
    const enhanced: EnhancedWordDefinition = {
      word: dictData.word || "",
      phonetic: dictData.phonetic || dictData.phonetics?.[0]?.text || "",
      phonetics: dictData.phonetics || [],
      meanings: (dictData.meanings || []).map((meaning: any) => ({
        partOfSpeech: meaning.partOfSpeech || "",
        definitions: (meaning.definitions || []).map((def: any) => ({
          definition: def.definition || "",
          example: def.example || undefined,
          synonyms: [...(def.synonyms || []), ...(thesaurusData?.synonyms || [])].filter(
            (s, i, arr) => arr.indexOf(s) === i,
          ), // Remove duplicates
          antonyms: [...(def.antonyms || []), ...(thesaurusData?.antonyms || [])].filter(
            (a, i, arr) => arr.indexOf(a) === i,
          ), // Remove duplicates
        })),
        synonyms: meaning.synonyms || [],
        antonyms: meaning.antonyms || [],
      })),
      origin: dictData.origin || undefined,
      sourceUrls: dictData.sourceUrls || [],
      frequency: this.calculateFrequency(dictData.word),
      difficulty: this.calculateDifficulty(dictData.word, dictData.meanings),
    }

    return enhanced
  }

  private calculateFrequency(word: string): number {
    // Simple frequency calculation based on word length and common patterns
    const commonWords = ["the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"]
    if (commonWords.includes(word.toLowerCase())) return 5
    if (word.length <= 4) return 4
    if (word.length <= 6) return 3
    if (word.length <= 8) return 2
    return 1
  }

  private calculateDifficulty(word: string, meanings: any[]): number {
    let difficulty = 1

    // Length factor
    if (word.length > 8) difficulty += 1
    if (word.length > 12) difficulty += 1

    // Meaning complexity
    if (meanings && meanings.length > 3) difficulty += 1

    // Technical terms (simple heuristic)
    if (word.includes("tion") || word.includes("sion") || word.includes("ology")) {
      difficulty += 2
    }

    return Math.min(5, difficulty)
  }

  private getCachedWord(word: string): EnhancedWordDefinition | null {
    const cached = this.cache.get(word)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > EnhancedDictionaryAPI.CACHE_DURATION
    if (isExpired) {
      this.cache.delete(word)
      return null
    }

    return cached.data
  }

  private getCachedThesaurus(word: string): ThesaurusEntry | null {
    const cached = this.thesaurusCache.get(word)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > EnhancedDictionaryAPI.CACHE_DURATION
    if (isExpired) {
      this.thesaurusCache.delete(word)
      return null
    }

    return cached.data
  }

  private cacheWord(word: string, data: EnhancedWordDefinition): void {
    this.cache.set(word, { data, timestamp: Date.now() })
  }

  private cacheThesaurus(word: string, data: ThesaurusEntry): void {
    this.thesaurusCache.set(word, { data, timestamp: Date.now() })
  }

  getCacheStats(): {
    dictionaryCache: number
    thesaurusCache: number
    words: string[]
  } {
    return {
      dictionaryCache: this.cache.size,
      thesaurusCache: this.thesaurusCache.size,
      words: Array.from(this.cache.keys()),
    }
  }

  clearCache(): void {
    this.cache.clear()
    this.thesaurusCache.clear()
  }
}

export const enhancedDictionaryAPI = new EnhancedDictionaryAPI()
