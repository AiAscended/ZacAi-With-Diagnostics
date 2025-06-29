import type { WordEntry } from "./types"

export interface VocabularyLoader {
  loadVocabulary(): Promise<void>
  getWord(word: string): WordEntry | null
}

export class VocabularyLoader {
  private vocabulary: Map<string, WordEntry> = new Map()
  private isLoaded = false

  constructor() {
    this.vocabulary = new Map()
  }

  public async loadVocabulary(): Promise<void> {
    if (this.isLoaded) return

    try {
      // Load basic vocabulary
      const basicWords = [
        { word: "hello", definition: "A greeting", partOfSpeech: "interjection" },
        { word: "goodbye", definition: "A farewell", partOfSpeech: "interjection" },
        { word: "yes", definition: "An affirmative answer", partOfSpeech: "adverb" },
        { word: "no", definition: "A negative answer", partOfSpeech: "adverb" },
        { word: "please", definition: "Used to make a polite request", partOfSpeech: "adverb" },
        { word: "thank", definition: "To express gratitude", partOfSpeech: "verb" },
        { word: "help", definition: "To assist or aid", partOfSpeech: "verb" },
        { word: "learn", definition: "To acquire knowledge", partOfSpeech: "verb" },
        { word: "understand", definition: "To comprehend", partOfSpeech: "verb" },
        { word: "know", definition: "To be aware of", partOfSpeech: "verb" },
      ]

      basicWords.forEach((word) => {
        this.vocabulary.set(word.word.toLowerCase(), {
          word: word.word.toLowerCase(),
          definition: word.definition,
          partOfSpeech: word.partOfSpeech,
          examples: [`Example usage of ${word.word}`],
          phonetic: `/${word.word}/`,
          synonyms: [],
          antonyms: [],
        })
      })

      // Try to load from seed data
      try {
        const response = await fetch("/seed_vocab.json")
        if (response.ok) {
          const data = await response.json()
          Object.entries(data).forEach(([word, entry]: [string, any]) => {
            this.vocabulary.set(word.toLowerCase(), {
              word: word.toLowerCase(),
              definition: entry.definition || "No definition available",
              partOfSpeech: entry.part_of_speech || entry.partOfSpeech || "unknown",
              examples: entry.examples || [],
              phonetic: entry.phonetic || "",
              synonyms: entry.synonyms || [],
              antonyms: entry.antonyms || [],
            })
          })
        }
      } catch (error) {
        console.warn("Could not load seed vocabulary, using basic vocabulary only")
      }

      this.isLoaded = true
      console.log(`✅ Vocabulary loaded: ${this.vocabulary.size} words`)
    } catch (error) {
      console.error("Error loading vocabulary:", error)
      this.isLoaded = true // Mark as loaded even if failed to prevent infinite retries
    }
  }

  public getWord(word: string): WordEntry | null {
    const entry = this.vocabulary.get(word.toLowerCase())
    return entry || null
  }

  public getWordDefinition(word: string): WordEntry | null {
    return this.getWord(word)
  }

  public searchWords(query: string, limit = 10): WordEntry[] {
    const results: WordEntry[] = []
    const queryLower = query.toLowerCase()

    for (const [word, entry] of this.vocabulary) {
      if (
        word.includes(queryLower) ||
        entry.definition.toLowerCase().includes(queryLower) ||
        (entry.examples && entry.examples.some((ex) => ex.toLowerCase().includes(queryLower)))
      ) {
        results.push(entry)
        if (results.length >= limit) break
      }
    }

    return results
  }

  public addWord(wordEntry: WordEntry): void {
    this.vocabulary.set(wordEntry.word.toLowerCase(), wordEntry)
  }

  public getVocabularySize(): number {
    return this.vocabulary.size
  }

  public getAllWords(): WordEntry[] {
    return Array.from(this.vocabulary.values())
  }

  public hasWord(word: string): boolean {
    return this.vocabulary.has(word.toLowerCase())
  }

  public removeWord(word: string): boolean {
    return this.vocabulary.delete(word.toLowerCase())
  }

  public clearVocabulary(): void {
    this.vocabulary.clear()
    this.isLoaded = false
  }

  public exportVocabulary(): any {
    const exported: any = {}
    this.vocabulary.forEach((entry, word) => {
      exported[word] = entry
    })
    return exported
  }

  public importVocabulary(data: any): void {
    Object.entries(data).forEach(([word, entry]: [string, any]) => {
      this.vocabulary.set(word.toLowerCase(), entry as WordEntry)
    })
  }
}
