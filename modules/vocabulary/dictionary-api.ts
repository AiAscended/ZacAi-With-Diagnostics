import { apiManager } from "@/core/api/manager"

export interface DictionaryEntry {
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
      synonyms?: string[]
      antonyms?: string[]
    }>
  }>
  origin?: string
  sourceUrls?: string[]
}

export class DictionaryAPIClient {
  private static readonly FREE_DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en"
  private static readonly CACHE_DURATION = 86400000 // 24 hours

  /**
   * Look up a word using the Free Dictionary API
   */
  static async lookupWord(word: string): Promise<DictionaryEntry | null> {
    try {
      const cleanWord = word.toLowerCase().trim()
      const cacheKey = `dict_${cleanWord}`
      const url = `${this.FREE_DICTIONARY_API}/${encodeURIComponent(cleanWord)}`

      const response = await apiManager.makeRequest(url, {}, cacheKey, this.CACHE_DURATION)

      if (response && Array.isArray(response) && response.length > 0) {
        return this.formatDictionaryResponse(response[0])
      }

      return null
    } catch (error) {
      console.error(`Dictionary lookup failed for "${word}":`, error)
      return null
    }
  }

  /**
   * Format the API response into our standard format
   */
  private static formatDictionaryResponse(apiResponse: any): DictionaryEntry {
    return {
      word: apiResponse.word || "",
      phonetic: apiResponse.phonetic || "",
      phonetics: apiResponse.phonetics || [],
      meanings: this.formatMeanings(apiResponse.meanings || []),
      origin: apiResponse.origin || "",
      sourceUrls: apiResponse.sourceUrls || [],
    }
  }

  /**
   * Format meanings array from API response
   */
  private static formatMeanings(meanings: any[]): DictionaryEntry["meanings"] {
    return meanings.map((meaning) => ({
      partOfSpeech: meaning.partOfSpeech || "",
      definitions: this.formatDefinitions(meaning.definitions || []),
    }))
  }

  /**
   * Format definitions array from API response
   */
  private static formatDefinitions(definitions: any[]): any[] {
    return definitions.map((def) => ({
      definition: def.definition || "",
      example: def.example || "",
      synonyms: def.synonyms || [],
      antonyms: def.antonyms || [],
    }))
  }

  /**
   * Get pronunciation audio URL if available
   */
  static getPronunciationAudio(entry: DictionaryEntry): string | null {
    for (const phonetic of entry.phonetics) {
      if (phonetic.audio) {
        return phonetic.audio
      }
    }
    return null
  }

  /**
   * Extract all synonyms from a dictionary entry
   */
  static extractSynonyms(entry: DictionaryEntry): string[] {
    const synonyms = new Set<string>()

    entry.meanings.forEach((meaning) => {
      meaning.definitions.forEach((def) => {
        if (def.synonyms) {
          def.synonyms.forEach((synonym) => synonyms.add(synonym))
        }
      })
    })

    return Array.from(synonyms)
  }

  /**
   * Extract all antonyms from a dictionary entry
   */
  static extractAntonyms(entry: DictionaryEntry): string[] {
    const antonyms = new Set<string>()

    entry.meanings.forEach((meaning) => {
      meaning.definitions.forEach((def) => {
        if (def.antonyms) {
          def.antonyms.forEach((antonym) => antonyms.add(antonym))
        }
      })
    })

    return Array.from(antonyms)
  }

  /**
   * Get the primary definition (first definition of first meaning)
   */
  static getPrimaryDefinition(entry: DictionaryEntry): string {
    if (entry.meanings.length > 0 && entry.meanings[0].definitions.length > 0) {
      return entry.meanings[0].definitions[0].definition
    }
    return ""
  }

  /**
   * Get all parts of speech for a word
   */
  static getPartsOfSpeech(entry: DictionaryEntry): string[] {
    return entry.meanings.map((meaning) => meaning.partOfSpeech).filter(Boolean)
  }

  /**
   * Format entry for display
   */
  static formatForDisplay(entry: DictionaryEntry): string {
    let formatted = `**${entry.word}**`

    if (entry.phonetic) {
      formatted += ` /${entry.phonetic}/`
    }

    formatted += "\n\n"

    entry.meanings.forEach((meaning, index) => {
      if (meaning.partOfSpeech) {
        formatted += `**${meaning.partOfSpeech}**\n`
      }

      meaning.definitions.forEach((def, defIndex) => {
        formatted += `${defIndex + 1}. ${def.definition}\n`

        if (def.example) {
          formatted += `   *Example: "${def.example}"*\n`
        }
      })

      if (index < entry.meanings.length - 1) {
        formatted += "\n"
      }
    })

    const synonyms = this.extractSynonyms(entry)
    if (synonyms.length > 0) {
      formatted += `\n**Synonyms:** ${synonyms.slice(0, 5).join(", ")}`
    }

    const antonyms = this.extractAntonyms(entry)
    if (antonyms.length > 0) {
      formatted += `\n**Antonyms:** ${antonyms.slice(0, 5).join(", ")}`
    }

    if (entry.origin) {
      formatted += `\n\n**Etymology:** ${entry.origin}`
    }

    return formatted
  }

  /**
   * Batch lookup multiple words
   */
  static async lookupMultipleWords(words: string[]): Promise<{ [word: string]: DictionaryEntry | null }> {
    const results: { [word: string]: DictionaryEntry | null } = {}

    // Process in batches to avoid overwhelming the API
    const batchSize = 5
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize)
      const batchPromises = batch.map(async (word) => {
        const result = await this.lookupWord(word)
        return { word, result }
      })

      const batchResults = await Promise.all(batchPromises)
      batchResults.forEach(({ word, result }) => {
        results[word] = result
      })

      // Small delay between batches to be respectful to the API
      if (i + batchSize < words.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return results
  }

  /**
   * Search for words that contain a substring
   */
  static async searchWords(substring: string, maxResults = 10): Promise<string[]> {
    // This would require a different API or local word list
    // For now, return empty array as the free dictionary API doesn't support search
    console.log(`Search functionality not available with current API for: ${substring}`)
    return []
  }

  /**
   * Get word difficulty score based on various factors
   */
  static calculateDifficultyScore(entry: DictionaryEntry): number {
    let score = 1 // Base difficulty

    // Longer words are generally more difficult
    score += Math.min(entry.word.length * 0.1, 2)

    // More meanings might indicate complexity
    score += Math.min(entry.meanings.length * 0.2, 1)

    // Technical or specialized terms (indicated by fewer common examples)
    const hasCommonExamples = entry.meanings.some((meaning) =>
      meaning.definitions.some((def) => def.example && def.example.length > 0),
    )

    if (!hasCommonExamples) {
      score += 0.5
    }

    // Etymology indicates older/more complex words
    if (entry.origin && entry.origin.length > 50) {
      score += 0.3
    }

    return Math.min(Math.max(score, 1), 5) // Clamp between 1-5
  }
}
