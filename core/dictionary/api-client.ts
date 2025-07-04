interface DictionaryEntry {
  word: string
  phonetic?: string
  phonetics?: Array<{
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
}

interface DictionaryCache {
  [word: string]: {
    data: DictionaryEntry[]
    timestamp: number
    expires: number
  }
}

class DictionaryAPIClient {
  private cache: DictionaryCache = {}
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private readonly API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en"

  async lookup(word: string): Promise<DictionaryEntry[]> {
    const normalizedWord = word.toLowerCase().trim()

    // Check cache first
    const cached = this.cache[normalizedWord]
    if (cached && Date.now() < cached.expires) {
      console.log(`📖 Dictionary cache hit for: ${word}`)
      return cached.data
    }

    try {
      console.log(`📖 Fetching dictionary data for: ${word}`)
      const response = await fetch(`${this.API_BASE}/${encodeURIComponent(normalizedWord)}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Word "${word}" not found in dictionary`)
        }
        throw new Error(`Dictionary API error: ${response.status}`)
      }

      const data: DictionaryEntry[] = await response.json()

      // Cache the result
      this.cache[normalizedWord] = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION,
      }

      return data
    } catch (error) {
      console.error("Dictionary lookup failed:", error)
      throw error
    }
  }

  async getDefinition(word: string): Promise<string> {
    try {
      const entries = await this.lookup(word)
      if (entries.length === 0) return `No definition found for "${word}"`

      const firstMeaning = entries[0].meanings[0]
      const firstDefinition = firstMeaning?.definitions[0]

      return firstDefinition?.definition || `No definition available for "${word}"`
    } catch (error) {
      return `Could not find definition for "${word}"`
    }
  }

  async getPhonetic(word: string): Promise<string> {
    try {
      const entries = await this.lookup(word)
      if (entries.length === 0) return ""

      return entries[0].phonetic || entries[0].phonetics?.[0]?.text || ""
    } catch (error) {
      return ""
    }
  }

  getCacheSize(): number {
    return Object.keys(this.cache).length
  }

  clearCache(): void {
    this.cache = {}
    console.log("📖 Dictionary cache cleared")
  }

  getCacheStats(): { size: number; oldestEntry: number; newestEntry: number } {
    const entries = Object.values(this.cache)
    if (entries.length === 0) {
      return { size: 0, oldestEntry: 0, newestEntry: 0 }
    }

    const timestamps = entries.map((entry) => entry.timestamp)
    return {
      size: entries.length,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
    }
  }
}

export const dictionaryAPI = new DictionaryAPIClient()
export type { DictionaryEntry }
