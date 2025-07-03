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

export class DictionaryAPIClient {
  private static readonly FREE_DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en"
  private static readonly CACHE_DURATION = 86400000 // 24 hours

  static async lookupWord(word: string): Promise<VocabularyEntry | null> {
    try {
      const cleanWord = word.toLowerCase().trim()
      const url = `${this.FREE_DICTIONARY_API}/${encodeURIComponent(cleanWord)}`

      const response = await fetch(url)

      if (!response.ok) {
        console.warn(`Dictionary API returned ${response.status} for word: ${word}`)
        return null
      }

      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        return this.formatDictionaryResponse(cleanWord, data[0])
      }

      return null
    } catch (error) {
      console.error(`Dictionary lookup failed for "${word}":`, error)
      return null
    }
  }

  private static formatDictionaryResponse(word: string, data: any): VocabularyEntry {
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

  private static calculateDifficulty(word: string): number {
    const length = word.length
    const hasComplexPatterns = /[^a-zA-Z]/.test(word)

    if (length <= 4) return 1
    if (length <= 6) return 2
    if (length <= 8) return 3
    if (length <= 10) return 4
    return hasComplexPatterns ? 5 : 4
  }

  private static calculateFrequency(word: string): number {
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

  static formatForDisplay(entry: VocabularyEntry): string {
    let formatted = `**${entry.word}**`

    if (entry.pronunciation) {
      formatted += ` /${entry.pronunciation}/`
    }

    formatted += "\n\n"

    if (entry.partOfSpeech) {
      formatted += `**${entry.partOfSpeech}**\n`
    }

    formatted += `${entry.definition}\n`

    if (entry.examples && entry.examples.length > 0) {
      formatted += `\n**Example:** "${entry.examples[0]}"\n`
    }

    if (entry.synonyms && entry.synonyms.length > 0) {
      formatted += `\n**Synonyms:** ${entry.synonyms.slice(0, 5).join(", ")}`
    }

    if (entry.antonyms && entry.antonyms.length > 0) {
      formatted += `\n**Antonyms:** ${entry.antonyms.slice(0, 5).join(", ")}`
    }

    if (entry.etymology) {
      formatted += `\n\n**Etymology:** ${entry.etymology}`
    }

    return formatted
  }
}
