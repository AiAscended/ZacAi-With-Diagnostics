export interface WordEntry {
  word: string
  definition: string
  partOfSpeech?: string
  examples?: string[]
  phonetic?: string
  synonyms?: string[]
  antonyms?: string[]
}

export class VocabularyLoader {
  private vocabulary: Map<string, WordEntry> = new Map()
  private isLoaded = false

  constructor() {
    console.log("📚 VocabularyLoader initialized")
  }

  public async loadVocabulary(): Promise<void> {
    if (this.isLoaded) return

    console.log("📚 Loading vocabulary...")

    // Load basic vocabulary first
    this.loadBasicVocabulary()

    // Try to load from seed file
    try {
      const response = await fetch("/seed_vocab.json")
      if (response.ok) {
        const data = await response.json()
        let loadedCount = 0

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
          loadedCount++
        })

        console.log(`📚 Loaded ${loadedCount} words from seed vocabulary`)
      }
    } catch (error) {
      console.warn("Could not load seed vocabulary, using basic vocabulary only")
    }

    this.isLoaded = true
    console.log(`📚 Vocabulary loading complete: ${this.vocabulary.size} words`)
  }

  private loadBasicVocabulary(): void {
    const basicWords = [
      { word: "hello", definition: "A greeting", partOfSpeech: "interjection" },
      { word: "hi", definition: "An informal greeting", partOfSpeech: "interjection" },
      { word: "goodbye", definition: "A farewell", partOfSpeech: "interjection" },
      { word: "yes", definition: "An affirmative answer", partOfSpeech: "adverb" },
      { word: "no", definition: "A negative answer", partOfSpeech: "adverb" },
      { word: "please", definition: "Used to make a polite request", partOfSpeech: "adverb" },
      { word: "thank", definition: "To express gratitude", partOfSpeech: "verb" },
      { word: "thanks", definition: "Expression of gratitude", partOfSpeech: "noun" },
      { word: "help", definition: "To assist or aid", partOfSpeech: "verb" },
      { word: "what", definition: "Used to ask for information", partOfSpeech: "pronoun" },
      { word: "how", definition: "In what way or manner", partOfSpeech: "adverb" },
      { word: "why", definition: "For what reason", partOfSpeech: "adverb" },
      { word: "when", definition: "At what time", partOfSpeech: "adverb" },
      { word: "where", definition: "In or to what place", partOfSpeech: "adverb" },
      { word: "who", definition: "What person or people", partOfSpeech: "pronoun" },
      { word: "good", definition: "Having positive qualities", partOfSpeech: "adjective" },
      { word: "bad", definition: "Having negative qualities", partOfSpeech: "adjective" },
      { word: "big", definition: "Large in size", partOfSpeech: "adjective" },
      { word: "small", definition: "Little in size", partOfSpeech: "adjective" },
      { word: "new", definition: "Recently made or created", partOfSpeech: "adjective" },
      { word: "old", definition: "Having lived for a long time", partOfSpeech: "adjective" },
      { word: "happy", definition: "Feeling joy", partOfSpeech: "adjective" },
      { word: "sad", definition: "Feeling sorrow", partOfSpeech: "adjective" },
      { word: "love", definition: "Deep affection", partOfSpeech: "noun" },
      { word: "like", definition: "To find agreeable", partOfSpeech: "verb" },
      { word: "know", definition: "To be aware of", partOfSpeech: "verb" },
      { word: "think", definition: "To have thoughts", partOfSpeech: "verb" },
      { word: "learn", definition: "To acquire knowledge", partOfSpeech: "verb" },
      { word: "understand", definition: "To comprehend", partOfSpeech: "verb" },
      { word: "remember", definition: "To recall", partOfSpeech: "verb" },
      { word: "forget", definition: "To fail to remember", partOfSpeech: "verb" },
    ]

    basicWords.forEach((entry) => {
      this.vocabulary.set(entry.word, {
        word: entry.word,
        definition: entry.definition,
        partOfSpeech: entry.partOfSpeech,
        examples: [`Example usage of ${entry.word}`],
        phonetic: "",
        synonyms: [],
        antonyms: [],
      })
    })

    console.log(`📚 Loaded ${basicWords.length} basic vocabulary words`)
  }

  public getWord(word: string): WordEntry | null {
    return this.vocabulary.get(word.toLowerCase()) || null
  }

  public hasWord(word: string): boolean {
    return this.vocabulary.has(word.toLowerCase())
  }

  public getVocabularySize(): number {
    return this.vocabulary.size
  }

  public getAllWords(): WordEntry[] {
    return Array.from(this.vocabulary.values())
  }

  public addWord(entry: WordEntry): void {
    this.vocabulary.set(entry.word.toLowerCase(), entry)
  }

  public searchWords(query: string): WordEntry[] {
    const queryLower = query.toLowerCase()
    return Array.from(this.vocabulary.values()).filter(
      (entry) => entry.word.includes(queryLower) || entry.definition.toLowerCase().includes(queryLower),
    )
  }
}
