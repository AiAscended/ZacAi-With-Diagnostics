export class DictionaryAPI {
  private cache: Map<string, any> = new Map()
  private baseUrl = "https://api.dictionaryapi.dev/api/v2/entries/en"

  async getDefinition(word: string): Promise<string> {
    if (this.cache.has(word)) {
      return this.cache.get(word).definition
    }

    try {
      const response = await fetch(`${this.baseUrl}/${word}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const entry = data[0]
          const meaning = entry.meanings?.[0]
          const definition = meaning?.definitions?.[0]?.definition || "Definition found"

          this.cache.set(word, { definition, timestamp: Date.now() })
          return definition
        }
      }
    } catch (error) {
      console.warn("Dictionary API failed:", error)
    }

    throw new Error("Word not found")
  }

  async getPhonetic(word: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/${word}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          return data[0].phonetic || ""
        }
      }
    } catch (error) {
      console.warn("Phonetic lookup failed:", error)
    }
    return ""
  }

  getCacheSize(): number {
    return this.cache.size
  }

  getCacheStats(): any {
    return {
      size: this.cache.size,
      words: Array.from(this.cache.keys()),
    }
  }
}

export const dictionaryAPI = new DictionaryAPI()
