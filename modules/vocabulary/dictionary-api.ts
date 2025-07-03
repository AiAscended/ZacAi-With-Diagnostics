import { apiManager } from "@/core/api/manager"
import type { VocabularyEntry } from "@/types/modules"

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

export class DictionaryAPI {
  private baseUrl = "https://api.dictionaryapi.dev/api/v2/entries/en"

  async lookupWord(word: string): Promise<VocabularyEntry | null> {
    try {
      const cacheKey = `dict_${word.toLowerCase()}`
      const url = `${this.baseUrl}/${encodeURIComponent(word)}`

      const response = await apiManager.makeRequest(url, {}, cacheKey, 86400000) // 24 hour cache

      if (response && Array.isArray(response) && response.length > 0) {
        return this.formatDictionaryResponse(word, response[0])
      }

      return null
    } catch (error) {
      console.error(`Dictionary lookup failed for "${word}":`, error)
      return null
    }
  }

  private formatDictionaryResponse(word: string, data: any): VocabularyEntry {
    const meanings = data.meanings || []
    const firstMeaning = meanings[0] || {}
    const definitions = firstMeaning.definitions || []
    const firstDefinition = definitions[0] || {}

    return {
      word: word.toLowerCase(),
      definition: firstDefinition.definition || "No definition available",
      pronunciation: data.phonetic || "",
      partOfSpeech: firstMeaning.partOfSpeech || "unknown",
      examples: definitions
        .filter((def: any) => def.example)
        .map((def: any) => def.example)
        .slice(0, 3),
      synonyms: firstDefinition.synonyms || [],
      antonyms: firstDefinition.antonyms || [],
      etymology: data.origin || "",
      difficulty: this.calculateDifficulty(word),
      frequency: this.calculateFrequency(word),
      timestamp: Date.now(),
      source: "dictionary-api",
    }
  }

  private calculateDifficulty(word: string): number {
    // Simple difficulty calculation based on word length and complexity
    const length = word.length
    const hasComplexPatterns = /[^a-zA-Z]/.test(word)

    if (length <= 4) return 1
    if (length <= 6) return 2
    if (length <= 8) return 3
    if (length <= 10) return 4
    return hasComplexPatterns ? 5 : 4
  }

  private calculateFrequency(word: string): number {
    // Common words frequency estimation
    const commonWords = [
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "i",
      "it",
      "for",
      "not",
      "on",
      "with",
      "he",
      "as",
      "you",
      "do",
      "at",
    ]

    if (commonWords.includes(word.toLowerCase())) return 10
    if (word.length <= 4) return 8
    if (word.length <= 6) return 6
    if (word.length <= 8) return 4
    return 2
  }
}

export const dictionaryAPI = new DictionaryAPI()
