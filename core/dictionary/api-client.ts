export class DictionaryAPIClient {
  private static readonly BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en"
  private static cache = new Map<string, any>()

  static async lookupWord(word: string): Promise<any> {
    // Check cache first
    if (this.cache.has(word)) {
      return this.cache.get(word)
    }

    try {
      const response = await fetch(`${this.BASE_URL}/${word}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Cache the result
      this.cache.set(word, data)

      return data
    } catch (error) {
      console.error(`Error looking up word "${word}":`, error)
      return null
    }
  }

  static async lookupMultipleWords(words: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>()

    for (const word of words) {
      const result = await this.lookupWord(word)
      if (result) {
        results.set(word, result)
      }
    }

    return results
  }

  static formatDefinition(wordData: any): any {
    if (!wordData || !Array.isArray(wordData) || wordData.length === 0) {
      return null
    }

    const entry = wordData[0]
    const meaning = entry.meanings?.[0]
    const definition = meaning?.definitions?.[0]

    if (!definition) {
      return null
    }

    return {
      word: entry.word,
      phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
      partOfSpeech: meaning.partOfSpeech,
      definition: definition.definition,
      example: definition.example,
      synonyms: definition.synonyms || [],
      antonyms: definition.antonyms || [],
      origin: entry.origin,
    }
  }
}
