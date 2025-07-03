export interface ThesaurusEntry {
  word: string
  synonyms: string[]
  antonyms: string[]
  related: string[]
  partOfSpeech?: string
}

export interface ThesaurusResponse {
  success: boolean
  data?: ThesaurusEntry
  error?: string
  cached?: boolean
  timestamp: number
}

export class ThesaurusClient {
  private static readonly CACHE_DURATION = 86400000 // 24 hours
  private cache = new Map<string, { data: ThesaurusEntry; timestamp: number }>()

  async lookupThesaurus(word: string): Promise<ThesaurusResponse> {
    const normalizedWord = word.toLowerCase().trim()

    if (!normalizedWord) {
      return {
        success: false,
        error: "Word cannot be empty",
        timestamp: Date.now(),
      }
    }

    // Check cache first
    const cached = this.getCachedEntry(normalizedWord)
    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      }
    }

    try {
      // For now, we'll use built-in synonym/antonym data
      // In production, you could integrate with APIs like Merriam-Webster Thesaurus
      const thesaurusData = await this.getBuiltInThesaurus(normalizedWord)

      if (thesaurusData) {
        this.cacheEntry(normalizedWord, thesaurusData)
        return {
          success: true,
          data: thesaurusData,
          cached: false,
          timestamp: Date.now(),
        }
      }

      return {
        success: false,
        error: `No thesaurus data found for "${word}"`,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("Thesaurus lookup error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: Date.now(),
      }
    }
  }

  private async getBuiltInThesaurus(word: string): Promise<ThesaurusEntry | null> {
    // Built-in thesaurus data for common words
    const builtInData: { [key: string]: ThesaurusEntry } = {
      happy: {
        word: "happy",
        synonyms: ["joyful", "cheerful", "glad", "pleased", "content", "delighted", "elated"],
        antonyms: ["sad", "unhappy", "miserable", "depressed", "gloomy"],
        related: ["happiness", "joy", "pleasure", "satisfaction"],
        partOfSpeech: "adjective",
      },
      big: {
        word: "big",
        synonyms: ["large", "huge", "enormous", "massive", "giant", "vast", "immense"],
        antonyms: ["small", "tiny", "little", "miniature", "minute"],
        related: ["size", "magnitude", "scale", "dimension"],
        partOfSpeech: "adjective",
      },
      good: {
        word: "good",
        synonyms: ["excellent", "great", "wonderful", "fantastic", "superb", "outstanding"],
        antonyms: ["bad", "poor", "terrible", "awful", "horrible"],
        related: ["quality", "virtue", "merit", "value"],
        partOfSpeech: "adjective",
      },
      fast: {
        word: "fast",
        synonyms: ["quick", "rapid", "swift", "speedy", "hasty", "brisk"],
        antonyms: ["slow", "sluggish", "leisurely", "gradual"],
        related: ["speed", "velocity", "pace", "tempo"],
        partOfSpeech: "adjective",
      },
      smart: {
        word: "smart",
        synonyms: ["intelligent", "clever", "bright", "brilliant", "wise", "sharp"],
        antonyms: ["stupid", "dumb", "foolish", "ignorant"],
        related: ["intelligence", "wisdom", "knowledge", "intellect"],
        partOfSpeech: "adjective",
      },
    }

    return builtInData[word] || null
  }

  private getCachedEntry(word: string): ThesaurusEntry | null {
    const cached = this.cache.get(word)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > ThesaurusClient.CACHE_DURATION
    if (isExpired) {
      this.cache.delete(word)
      return null
    }

    return cached.data
  }

  private cacheEntry(word: string, data: ThesaurusEntry): void {
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

  formatThesaurusResponse(entry: ThesaurusEntry): string {
    let response = `**${entry.word.toUpperCase()}** Thesaurus\n\n`

    if (entry.partOfSpeech) {
      response += `**Part of Speech:** ${entry.partOfSpeech}\n\n`
    }

    if (entry.synonyms.length > 0) {
      response += `**Synonyms:** ${entry.synonyms.join(", ")}\n\n`
    }

    if (entry.antonyms.length > 0) {
      response += `**Antonyms:** ${entry.antonyms.join(", ")}\n\n`
    }

    if (entry.related.length > 0) {
      response += `**Related Words:** ${entry.related.join(", ")}\n\n`
    }

    return response
  }
}

export const thesaurusClient = new ThesaurusClient()
