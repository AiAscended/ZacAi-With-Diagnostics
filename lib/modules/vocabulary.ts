import { EnhancedAPIManager } from "../enhanced-api-manager"

export class VocabularyModule {
  private vocabulary: Map<string, any> = new Map()
  private apiManager: EnhancedAPIManager
  public isInitialized = false

  constructor() {
    this.apiManager = new EnhancedAPIManager()
    console.log("📚 Vocabulary Module initialized.")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return
    await this.loadSeedVocabulary()
    // We will add learned vocabulary loading later
    this.isInitialized = true
  }

  private async loadSeedVocabulary(): Promise<void> {
    try {
      const response = await fetch("/seed_vocab.json")
      if (!response.ok) throw new Error(`Failed to fetch seed_vocab.json: ${response.statusText}`)
      const data = await response.json()
      Object.entries(data).forEach(([word, entry]: [string, any]) => {
        this.vocabulary.set(word.toLowerCase(), { ...entry, source: "seed" })
      })
      console.log(`✅ [Vocab] Loaded ${Object.keys(data).length} seed words.`)
    } catch (error) {
      console.warn("[Vocab] Failed to load seed vocabulary:", error)
    }
  }

  public async handleLookup(
    word: string,
    thinkingSteps: string[],
  ): Promise<{ responseText: string; knowledge: string[]; confidence: number }> {
    thinkingSteps.push(`📚 Entering Vocabulary Processor for word: "${word}".`)
    const lowerCaseWord = word.toLowerCase()

    if (this.vocabulary.has(lowerCaseWord)) {
      const entry = this.vocabulary.get(lowerCaseWord)
      const sourceText = entry.source === "seed" ? "initial knowledge" : "memory"
      const responseText = `From my ${sourceText}, "${word}" means: ${entry.definition || entry.meanings?.[0]?.definitions?.[0]?.definition}`
      thinkingSteps.push(`✅ Found in ${entry.source} data.`)
      return { responseText, knowledge: [`Vocabulary (${entry.source})`], confidence: 1.0 }
    }

    thinkingSteps.push(`🌐 Querying external dictionary API for "${word}"...`)
    try {
      const apiData = await this.apiManager.lookupWord(word)
      if (apiData && apiData.meanings && apiData.meanings.length > 0) {
        const definition = apiData.meanings[0].definitions[0].definition
        const responseText = `According to my sources, "${word}" means: ${definition}`
        thinkingSteps.push(`✅ API lookup successful.`)

        const newEntry = { ...apiData, source: "learned", timestamp: Date.now() }
        this.vocabulary.set(lowerCaseWord, newEntry)
        // In a real app, we'd save this to a backend. For now, it's in-session.
        thinkingSteps.push(`✍️ Learning new word and saving to session memory...`)

        return { responseText, knowledge: ["Dictionary API"], confidence: 0.95 }
      } else {
        thinkingSteps.push(`❌ API did not return a valid definition for "${word}".`)
        return { responseText: `Sorry, I couldn't find a definition for "${word}".`, knowledge: [], confidence: 0.3 }
      }
    } catch (error) {
      console.error("[Vocab] API Error in handleLookup:", error)
      thinkingSteps.push(`🔥 API call failed.`)
      return { responseText: "I had trouble reaching my dictionary service.", knowledge: [], confidence: 0.2 }
    }
  }

  public getVocabularyData(): Map<string, any> {
    return this.vocabulary
  }
}
