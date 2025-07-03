export class DictionaryAPIClient {
  private baseUrl = "https://api.dictionaryapi.dev/api/v2/entries/en"
  private cache: Map<string, any> = new Map()

  async lookupWord(word: string): Promise<any> {
    // Check cache first
    if (this.cache.has(word.toLowerCase())) {
      return this.cache.get(word.toLowerCase())
    }

    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(word)}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data && data.length > 0) {
        const wordData = this.parseWordData(data[0])

        // Cache the result
        this.cache.set(word.toLowerCase(), wordData)

        return wordData
      }
    } catch (error) {
      console.error(`Error looking up word "${word}":`, error)
      return null
    }

    return null
  }

  private parseWordData(apiData: any): any {
    const meaning = apiData.meanings?.[0]
    const definition = meaning?.definitions?.[0]

    return {
      word: apiData.word,
      phonetic: apiData.phonetic || apiData.phonetics?.[0]?.text,
      definition: definition?.definition,
      partOfSpeech: meaning?.partOfSpeech,
      example: definition?.example,
      synonyms: definition?.synonyms || [],
      antonyms: definition?.antonyms || [],
      origin: apiData.origin,
      meanings: apiData.meanings,
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheSize(): number {
    return this.cache.size
  }
}

export const dictionaryAPI = new DictionaryAPIClient()
