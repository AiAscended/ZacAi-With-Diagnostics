import { AdvancedTokenizer } from "../processors/Tokenizer"
import { VocabularyLoader } from "../../lib/vocabulary-loader"
import { SystemConfig } from "../system/config"

export interface LanguageResult {
  response: string
  confidence: number
  tokenInfo?: any
  vocabularyUsed?: string[]
  newWordsLearned?: string[]
}

export interface EnhancementResult {
  enhanced: boolean
  content: string
  improvements: string[]
}

export class LanguageEngine {
  private tokenizer: AdvancedTokenizer
  private vocabularyLoader: VocabularyLoader
  private learnedVocabulary: Map<string, any> = new Map()

  constructor() {
    console.log("🔤 LanguageEngine: Initializing...")
    this.vocabularyLoader = new VocabularyLoader()
    this.tokenizer = new AdvancedTokenizer(this.vocabularyLoader)
  }

  public async initialize(): Promise<void> {
    console.log("🔤 LanguageEngine: Loading vocabulary and tokenizer...")

    try {
      // Load seed vocabulary
      await this.loadSeedVocabulary()

      // Initialize tokenizer
      await this.tokenizer.initialize()

      console.log("✅ LanguageEngine: Initialization completed")
    } catch (error) {
      console.error("❌ LanguageEngine: Initialization failed:", error)
      throw error
    }
  }

  private async loadSeedVocabulary(): Promise<void> {
    try {
      const response = await fetch(SystemConfig.SEED_FILES.VOCABULARY)
      if (response.ok) {
        const vocabData = await response.json()
        const vocabArray = Object.entries(vocabData).map(([word, data]) => ({
          word,
          ...data,
        }))

        this.vocabularyLoader.loadVocabulary(vocabArray)
        console.log(`📚 LanguageEngine: Loaded ${vocabArray.length} vocabulary entries`)
      }
    } catch (error) {
      console.error("❌ LanguageEngine: Failed to load seed vocabulary:", error)
    }
  }

  public async processLanguage(input: string): Promise<LanguageResult> {
    console.log(`🔤 LanguageEngine: Processing language: "${input}"`)

    try {
      // Tokenize the input
      const tokenInfo = this.tokenizer.getTokenInfo(input)

      // Check for vocabulary requests
      if (this.isVocabularyRequest(input)) {
        return await this.handleVocabularyRequest(input, tokenInfo)
      }

      // Check for spelling requests
      if (this.isSpellingRequest(input)) {
        return await this.handleSpellingRequest(input, tokenInfo)
      }

      // Check for pronunciation requests
      if (this.isPronunciationRequest(input)) {
        return await this.handlePronunciationRequest(input, tokenInfo)
      }

      // General language processing
      return await this.handleGeneralLanguage(input, tokenInfo)
    } catch (error) {
      console.error("❌ LanguageEngine: Error processing language:", error)
      return {
        response: "I encountered an error processing your language request.",
        confidence: 0.1,
      }
    }
  }

  public async enhanceResponse(content: string): Promise<EnhancementResult> {
    const improvements: string[] = []
    let enhanced = false
    let enhancedContent = content

    try {
      // Check for grammar improvements
      const grammarCheck = this.checkGrammar(content)
      if (grammarCheck.hasImprovements) {
        enhancedContent = grammarCheck.improved
        improvements.push("grammar")
        enhanced = true
      }

      // Check for vocabulary enhancements
      const vocabCheck = this.enhanceVocabulary(enhancedContent)
      if (vocabCheck.hasImprovements) {
        enhancedContent = vocabCheck.improved
        improvements.push("vocabulary")
        enhanced = true
      }

      return {
        enhanced,
        content: enhancedContent,
        improvements,
      }
    } catch (error) {
      console.error("❌ LanguageEngine: Error enhancing response:", error)
      return {
        enhanced: false,
        content,
        improvements: [],
      }
    }
  }

  private isVocabularyRequest(input: string): boolean {
    const vocabPatterns = [/what does \w+ mean/i, /define \w+/i, /meaning of \w+/i, /definition of \w+/i]

    return vocabPatterns.some((pattern) => pattern.test(input))
  }

  private isSpellingRequest(input: string): boolean {
    return /spell|spelling|how do you spell/i.test(input)
  }

  private isPronunciationRequest(input: string): boolean {
    return /pronounce|pronunciation|how do you say/i.test(input)
  }

  private async handleVocabularyRequest(input: string, tokenInfo: any): Promise<LanguageResult> {
    // Extract the word being asked about
    const wordMatch = input.match(/(?:what does |define |meaning of |definition of )(\w+)/i)
    if (!wordMatch) {
      return {
        response: "I couldn't identify which word you want me to define.",
        confidence: 0.3,
      }
    }

    const word = wordMatch[1].toLowerCase()
    const definition = this.vocabularyLoader.getWordDefinition(word)

    if (definition) {
      const response = this.formatDefinition(definition)
      return {
        response,
        confidence: 0.9,
        vocabularyUsed: [word],
        tokenInfo,
      }
    }

    // Try to learn the word online
    const learnedDefinition = await this.learnWordOnline(word)
    if (learnedDefinition) {
      return {
        response: this.formatDefinition(learnedDefinition),
        confidence: 0.8,
        newWordsLearned: [word],
        tokenInfo,
      }
    }

    return {
      response: `I don't know the definition of "${word}" yet, but I can learn it if you teach me!`,
      confidence: 0.4,
      tokenInfo,
    }
  }

  private async handleSpellingRequest(input: string, tokenInfo: any): Promise<LanguageResult> {
    const wordMatch = input.match(/(?:spell |spelling |how do you spell )(\w+)/i)
    if (!wordMatch) {
      return {
        response: "Which word would you like me to spell?",
        confidence: 0.3,
      }
    }

    const word = wordMatch[1].toLowerCase()
    const spelling = word.split("").join("-").toUpperCase()

    return {
      response: `The spelling of "${word}" is: ${spelling}`,
      confidence: 0.95,
      vocabularyUsed: [word],
      tokenInfo,
    }
  }

  private async handlePronunciationRequest(input: string, tokenInfo: any): Promise<LanguageResult> {
    const wordMatch = input.match(/(?:pronounce |pronunciation |how do you say )(\w+)/i)
    if (!wordMatch) {
      return {
        response: "Which word would you like pronunciation help with?",
        confidence: 0.3,
      }
    }

    const word = wordMatch[1].toLowerCase()
    const definition = this.vocabularyLoader.getWordDefinition(word)

    if (definition && definition.phonetic) {
      return {
        response: `The pronunciation of "${word}" is: ${definition.phonetic}`,
        confidence: 0.9,
        vocabularyUsed: [word],
        tokenInfo,
      }
    }

    return {
      response: `I don't have pronunciation information for "${word}" yet.`,
      confidence: 0.4,
      tokenInfo,
    }
  }

  private async handleGeneralLanguage(input: string, tokenInfo: any): Promise<LanguageResult> {
    const unknownWords = tokenInfo.tokens.filter((token: any) => !token.isKnown)
    const newWordsLearned: string[] = []

    // Try to learn unknown words
    for (const token of unknownWords.slice(0, 3)) {
      // Limit to 3 words per request
      const learned = await this.learnWordOnline(token.token)
      if (learned) {
        newWordsLearned.push(token.token)
      }
    }

    let response = "I've analyzed your language input. "

    if (newWordsLearned.length > 0) {
      response += `I learned ${newWordsLearned.length} new word(s): ${newWordsLearned.join(", ")}. `
    }

    if (unknownWords.length > newWordsLearned.length) {
      response += `There are ${unknownWords.length - newWordsLearned.length} words I'm still learning about.`
    }

    return {
      response,
      confidence: 0.7,
      tokenInfo,
      newWordsLearned: newWordsLearned.length > 0 ? newWordsLearned : undefined,
    }
  }

  private formatDefinition(definition: any): string {
    if (typeof definition === "string") {
      return definition
    }

    let formatted = `${definition.word}`

    if (definition.part_of_speech || definition.partOfSpeech) {
      formatted += ` (${definition.part_of_speech || definition.partOfSpeech})`
    }

    formatted += `: ${definition.definition}`

    if (definition.examples && definition.examples.length > 0) {
      formatted += `\n\nExample: "${definition.examples[0]}"`
    }

    if (definition.synonyms && definition.synonyms.length > 0) {
      formatted += `\n\nSynonyms: ${definition.synonyms.slice(0, 3).join(", ")}`
    }

    return formatted
  }

  private async learnWordOnline(word: string): Promise<any | null> {
    if (!SystemConfig.LEARNING_SETTINGS.VOCABULARY_LEARNING_ENABLED) {
      return null
    }

    try {
      const response = await fetch(`${SystemConfig.APIS.DICTIONARY}${encodeURIComponent(word)}`)

      if (response.ok) {
        const data = await response.json()
        const wordData = data[0]

        if (wordData) {
          const learned = {
            word: wordData.word,
            definition: wordData.meanings[0]?.definitions[0]?.definition || "No definition available",
            partOfSpeech: wordData.meanings[0]?.partOfSpeech || "unknown",
            phonetic: wordData.phonetic || "",
            examples: wordData.meanings[0]?.definitions[0]?.example
              ? [wordData.meanings[0].definitions[0].example]
              : [],
            learned: true,
            timestamp: Date.now(),
          }

          this.learnedVocabulary.set(word, learned)
          console.log(`📚 LanguageEngine: Learned new word: ${word}`)

          return learned
        }
      }
    } catch (error) {
      console.warn(`⚠️ LanguageEngine: Failed to learn word "${word}":`, error)
    }

    return null
  }

  private checkGrammar(content: string): { hasImprovements: boolean; improved: string } {
    // Simple grammar improvements
    let improved = content
    let hasImprovements = false

    // Fix common issues
    const fixes = [
      { pattern: /\bi\b/g, replacement: "I", description: "Capitalize I" },
      { pattern: /\s+/g, replacement: " ", description: "Fix spacing" },
      { pattern: /([.!?])\s*([a-z])/g, replacement: "$1 $2", description: "Space after punctuation" },
    ]

    for (const fix of fixes) {
      const before = improved
      improved = improved.replace(fix.pattern, fix.replacement)
      if (improved !== before) {
        hasImprovements = true
      }
    }

    return { hasImprovements, improved }
  }

  private enhanceVocabulary(content: string): { hasImprovements: boolean; improved: string } {
    // Simple vocabulary enhancements
    let improved = content
    let hasImprovements = false

    const enhancements = [
      { pattern: /\bvery good\b/gi, replacement: "excellent" },
      { pattern: /\bvery bad\b/gi, replacement: "terrible" },
      { pattern: /\bvery big\b/gi, replacement: "enormous" },
      { pattern: /\bvery small\b/gi, replacement: "tiny" },
    ]

    for (const enhancement of enhancements) {
      const before = improved
      improved = improved.replace(enhancement.pattern, enhancement.replacement)
      if (improved !== before) {
        hasImprovements = true
      }
    }

    return { hasImprovements, improved }
  }

  public getStatus(): any {
    return {
      initialized: true,
      vocabularySize: this.vocabularyLoader ? "loaded" : "not loaded",
      learnedWords: this.learnedVocabulary.size,
      tokenizerReady: this.tokenizer ? true : false,
    }
  }

  public async retrain(): Promise<void> {
    console.log("🔄 LanguageEngine: Retraining language models...")

    // Reload vocabulary
    await this.loadSeedVocabulary()

    // Reinitialize tokenizer
    await this.tokenizer.initialize()

    console.log("✅ LanguageEngine: Retraining completed")
  }
}
