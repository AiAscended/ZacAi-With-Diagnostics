export interface WordEntry {
  word: string
  definition: string
  part_of_speech?: string
  examples?: string[]
  synonyms?: string[]
  antonyms?: string[]
  phonetic?: string
  frequency?: number
  source?: string
  date_added?: string
  last_used?: string
  topics?: string[]
  notes?: string
}

export class VocabularyLoader {
  private vocabulary: Map<string, WordEntry> = new Map()

  constructor() {
    this.vocabulary = new Map<string, WordEntry>()
  }

  public async loadVocabulary(): Promise<void> {
    try {
      // Load seed vocabulary
      const response = await fetch("/seed_vocab.json")
      if (response.ok) {
        const data = await response.json()
        this.loadVocabularyData(data)
      }
    } catch (error) {
      console.error("Error loading vocabulary:", error)
    }
  }

  public loadVocabularyData(data: any): void {
    try {
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (item && item.word && item.definition) {
            this.vocabulary.set(item.word.toLowerCase(), item)
          }
        })
      } else if (typeof data === "object") {
        // Handle object format where keys are words
        Object.entries(data).forEach(([word, entry]: [string, any]) => {
          if (entry && typeof entry === "object") {
            const wordEntry = {
              word: word,
              ...entry,
            }
            this.vocabulary.set(word.toLowerCase(), wordEntry)
          }
        })
      }
    } catch (error) {
      console.error("Error loading vocabulary data:", error)
    }
  }

  public getWord(word: string): WordEntry | null {
    try {
      const entry = this.vocabulary.get(word.toLowerCase())
      return entry || null
    } catch (error) {
      console.error(`Error getting word ${word}:`, error)
      return null
    }
  }

  public getWordDefinition(word: string): WordEntry | null {
    return this.getWord(word)
  }

  public searchWords(query: string, limit = 10): WordEntry[] {
    try {
      const results: WordEntry[] = []
      const queryLower = query.toLowerCase()

      for (const [word, entry] of this.vocabulary) {
        if (entry && entry.definition) {
          if (
            word.includes(queryLower) ||
            entry.definition.toLowerCase().includes(queryLower) ||
            (entry.synonyms && entry.synonyms.some((syn) => syn.toLowerCase().includes(queryLower)))
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

  public getVocabularySize(): number {
    return this.vocabulary.size
  }

  public getAllWords(): WordEntry[] {
    return Array.from(this.vocabulary.values())
  }
}
