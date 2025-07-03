export interface WordDefinition {
  word: string
  phonetic?: string
  meanings: Array<{
    partOfSpeech: string
    definitions: Array<{
      definition: string
      example?: string
      synonyms?: string[]
      antonyms?: string[]
    }>
  }>
  origin?: string
  sourceUrls?: string[]
}

export interface DictionaryResponse {
  success: boolean
  data?: WordDefinition
  error?: string
  cached?: boolean
  timestamp: number
}

export class DictionaryAPIClient {
  private static readonly API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en"
  private static readonly CACHE_DURATION = 86400000 // 24 hours
  private cache = new Map<string, { data: WordDefinition; timestamp: number }>()

  async lookupWord(word: string): Promise<DictionaryResponse> {
    const normalizedWord = word.toLowerCase().trim()

    if (!normalizedWord) {
      return {
        success: false,
        error: "Word cannot be empty",
        timestamp: Date.now(),
      }
    }

    // Check cache first
    const cached = this.getCachedWord(normalizedWord)
    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      }
    }

    try {
      const response = await fetch(`${DictionaryAPIClient.API_BASE}/${encodeURIComponent(normalizedWord)}`)

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: `Word "${word}" not found in dictionary`,
            timestamp: Date.now(),
          }
        }
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()

      if (!Array.isArray(data) || data.length === 0) {
        return {
          success: false,
          error: "Invalid response format from dictionary API",
          timestamp: Date.now(),
        }
      }

      const wordData = this.parseAPIResponse(data[0])

      // Cache the result
      this.cacheWord(normalizedWord, wordData)

      return {
        success: true,
        data: wordData,
        cached: false,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("Dictionary API error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: Date.now(),
      }
    }
  }

  private parseAPIResponse(apiData: any): WordDefinition {
    return {
      word: apiData.word || "",
      phonetic: apiData.phonetic || apiData.phonetics?.[0]?.text || "",
      meanings: (apiData.meanings || []).map((meaning: any) => ({
        partOfSpeech: meaning.partOfSpeech || "",
        definitions: (meaning.definitions || []).map((def: any) => ({
          definition: def.definition || "",
          example: def.example || undefined,
          synonyms: def.synonyms || [],
          antonyms: def.antonyms || [],
        })),
      })),
      origin: apiData.origin || undefined,
      sourceUrls: apiData.sourceUrls || [],
    }
  }

  private getCachedWord(word: string): WordDefinition | null {
    const cached = this.cache.get(word)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > DictionaryAPIClient.CACHE_DURATION
    if (isExpired) {
      this.cache.delete(word)
      return null
    }

    return cached.data
  }

  private cacheWord(word: string, data: WordDefinition): void {
    this.cache.set(word, {
      data,
      timestamp: Date.now(),
    })
  }

  getCacheStats(): { size: number; words: string[] } {
    return {
      size: this.cache.size,
      words: Array.from(this.cache.keys()),
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  getWordSummary(definition: WordDefinition): string {
    if (!definition.meanings || definition.meanings.length === 0) {
      return "No definition available"
    }

    const firstMeaning = definition.meanings[0]
    const firstDefinition = firstMeaning.definitions?.[0]?.definition || "No definition available"

    return `${definition.word} (${firstMeaning.partOfSpeech}): ${firstDefinition}`
  }

  getPartsOfSpeech(definition: WordDefinition): string[] {
    return definition.meanings?.map((m) => m.partOfSpeech).filter(Boolean) || []
  }

  getAllSynonyms(definition: WordDefinition): string[] {
    const synonyms = new Set<string>()

    definition.meanings?.forEach((meaning) => {
      meaning.definitions?.forEach((def) => {
        def.synonyms?.forEach((synonym) => synonyms.add(synonym))
      })
    })

    return Array.from(synonyms)
  }

  getAllAntonyms(definition: WordDefinition): string[] {
    const antonyms = new Set<string>()

    definition.meanings?.forEach((meaning) => {
      meaning.definitions?.forEach((def) => {
        def.antonyms?.forEach((antonym) => antonyms.add(antonym))
      })
    })

    return Array.from(antonyms)
  }
}

export const dictionaryAPI = new DictionaryAPIClient()
