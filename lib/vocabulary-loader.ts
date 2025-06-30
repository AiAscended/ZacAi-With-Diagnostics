class VocabularyLoader {
  private vocabulary: Map<string, any>

  constructor() {
    this.vocabulary = new Map<string, any>()
  }

  public loadVocabulary(data: any[]): void {
    try {
      data.forEach((item) => {
        if (item && item.word && item.definition) {
          this.vocabulary.set(item.word.toLowerCase(), item)
        }
      })
    } catch (error) {
      console.error("Error loading vocabulary:", error)
    }
  }

  public getWordDefinition(word: string): any | null {
    try {
      const entry = this.vocabulary.get(word.toLowerCase())
      if (entry && entry.definition) {
        return entry
      }
      return null
    } catch (error) {
      console.error(`Error getting definition for ${word}:`, error)
      return null
    }
  }

  public searchWords(query: string, limit = 10): any[] {
    try {
      const results: any[] = []
      const queryLower = query.toLowerCase()

      for (const [word, entry] of this.vocabulary) {
        if (entry && entry.definition) {
          if (
            word.includes(queryLower) ||
            (Array.isArray(entry.definitions) &&
              entry.definitions.some((def) => def && def.toLowerCase().includes(queryLower))) ||
            (typeof entry.definition === "string" && entry.definition.toLowerCase().includes(queryLower))
          ) {
            results.push(entry)
            if (results.length >= limit) break
          }
        }
      }

      return results
    } catch (error) {
      console.error("Error in searchWords:", error)
      return []
    }
  }
}
