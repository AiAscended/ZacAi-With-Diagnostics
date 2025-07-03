export interface PhoneticEntry {
  word: string
  phonetic: string
  audio?: string
  syllables: string[]
  stress: number[] // Which syllables are stressed
  rhymes: string[]
}

export interface PhoneticResponse {
  success: boolean
  data?: PhoneticEntry
  error?: string
  cached?: boolean
  timestamp: number
}

export class PhoneticsClient {
  private static readonly CACHE_DURATION = 86400000 // 24 hours
  private cache = new Map<string, { data: PhoneticEntry; timestamp: number }>()

  async lookupPhonetics(word: string): Promise<PhoneticResponse> {
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
      const phoneticData = await this.getBuiltInPhonetics(normalizedWord)

      if (phoneticData) {
        this.cacheEntry(normalizedWord, phoneticData)
        return {
          success: true,
          data: phoneticData,
          cached: false,
          timestamp: Date.now(),
        }
      }

      // Fallback: generate basic phonetics
      const fallbackData = this.generateBasicPhonetics(normalizedWord)
      this.cacheEntry(normalizedWord, fallbackData)

      return {
        success: true,
        data: fallbackData,
        cached: false,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("Phonetics lookup error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: Date.now(),
      }
    }
  }

  private async getBuiltInPhonetics(word: string): Promise<PhoneticEntry | null> {
    // Built-in phonetic data for common words
    const builtInData: { [key: string]: PhoneticEntry } = {
      algorithm: {
        word: "algorithm",
        phonetic: "/ˈælɡəˌrɪðəm/",
        syllables: ["al", "go", "rithm"],
        stress: [0], // First syllable stressed
        rhymes: ["rhythm", "logarithm"],
      },
      computer: {
        word: "computer",
        phonetic: "/kəmˈpjuːtər/",
        syllables: ["com", "pu", "ter"],
        stress: [1], // Second syllable stressed
        rhymes: ["commuter", "tutor"],
      },
      artificial: {
        word: "artificial",
        phonetic: "/ˌɑːrtɪˈfɪʃəl/",
        syllables: ["ar", "ti", "fi", "cial"],
        stress: [0, 2], // First and third syllables stressed
        rhymes: ["superficial", "beneficial"],
      },
      intelligence: {
        word: "intelligence",
        phonetic: "/ɪnˈtelɪdʒəns/",
        syllables: ["in", "tel", "li", "gence"],
        stress: [1], // Second syllable stressed
        rhymes: ["negligence", "diligence"],
      },
      quantum: {
        word: "quantum",
        phonetic: "/ˈkwɒntəm/",
        syllables: ["quan", "tum"],
        stress: [0], // First syllable stressed
        rhymes: ["momentum", "datum"],
      },
    }

    return builtInData[word] || null
  }

  private generateBasicPhonetics(word: string): PhoneticEntry {
    // Basic syllable splitting (simple heuristic)
    const syllables = this.splitIntoSyllables(word)

    return {
      word,
      phonetic: `/${word}/`, // Basic fallback
      syllables,
      stress: [0], // Default to first syllable stress
      rhymes: [],
    }
  }

  private splitIntoSyllables(word: string): string[] {
    // Simple syllable splitting algorithm
    const vowels = "aeiouAEIOU"
    const syllables: string[] = []
    let currentSyllable = ""

    for (let i = 0; i < word.length; i++) {
      const char = word[i]
      currentSyllable += char

      // If we hit a vowel followed by a consonant, it might be a syllable break
      if (vowels.includes(char) && i < word.length - 1 && !vowels.includes(word[i + 1])) {
        // Look ahead to see if we should break here
        if (i < word.length - 2 && vowels.includes(word[i + 2])) {
          syllables.push(currentSyllable)
          currentSyllable = ""
        }
      }
    }

    if (currentSyllable) {
      syllables.push(currentSyllable)
    }

    return syllables.length > 0 ? syllables : [word]
  }

  private getCachedEntry(word: string): PhoneticEntry | null {
    const cached = this.cache.get(word)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > PhoneticsClient.CACHE_DURATION
    if (isExpired) {
      this.cache.delete(word)
      return null
    }

    return cached.data
  }

  private cacheEntry(word: string, data: PhoneticEntry): void {
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

  formatPhoneticResponse(entry: PhoneticEntry): string {
    let response = `**${entry.word.toUpperCase()}** Phonetics\n\n`

    response += `**Pronunciation:** ${entry.phonetic}\n\n`

    if (entry.syllables.length > 0) {
      response += `**Syllables:** ${entry.syllables.join(" • ")}\n\n`
    }

    if (entry.stress.length > 0) {
      const stressedSyllables = entry.stress.map((index) => entry.syllables[index]).filter(Boolean)
      response += `**Stressed Syllables:** ${stressedSyllables.join(", ")}\n\n`
    }

    if (entry.rhymes.length > 0) {
      response += `**Rhymes:** ${entry.rhymes.join(", ")}\n\n`
    }

    if (entry.audio) {
      response += `**Audio:** [Listen](${entry.audio})\n\n`
    }

    return response
  }
}

export const phoneticsClient = new PhoneticsClient()
