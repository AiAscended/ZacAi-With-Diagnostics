import type { VocabularyLoader } from "./vocabulary-loader"

export interface Token {
  text: string
  type: string
  position: number
  confidence: number
}

export class AdvancedTokenizer {
  private vocabularyLoader: VocabularyLoader
  private isInitialized = false

  constructor(vocabularyLoader: VocabularyLoader) {
    this.vocabularyLoader = vocabularyLoader
    console.log("🔤 AdvancedTokenizer initialized")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🔤 Initializing tokenizer...")
    await this.vocabularyLoader.loadVocabulary()
    this.isInitialized = true
    console.log("🔤 Tokenizer initialization complete")
  }

  public tokenize(text: string): Token[] {
    const tokens: Token[] = []
    const words = text.toLowerCase().match(/\b\w+\b/g) || []

    words.forEach((word, index) => {
      const token: Token = {
        text: word,
        type: this.getTokenType(word),
        position: index,
        confidence: this.getTokenConfidence(word),
      }
      tokens.push(token)
    })

    return tokens
  }

  private getTokenType(word: string): string {
    // Check if it's a number
    if (/^\d+$/.test(word)) {
      return "number"
    }

    // Check if it's a mathematical operator
    if (["+", "-", "*", "/", "=", "×", "÷"].includes(word)) {
      return "operator"
    }

    // Check if it's in vocabulary
    if (this.vocabularyLoader.hasWord(word)) {
      return "known_word"
    }

    // Check if it's a common word pattern
    if (word.length <= 2) {
      return "short_word"
    }

    if (word.length >= 10) {
      return "long_word"
    }

    return "unknown_word"
  }

  private getTokenConfidence(word: string): number {
    if (this.vocabularyLoader.hasWord(word)) {
      return 0.9
    }

    if (/^\d+$/.test(word)) {
      return 0.95
    }

    if (["+", "-", "*", "/", "=", "×", "÷"].includes(word)) {
      return 0.98
    }

    // Lower confidence for unknown words
    return 0.3
  }

  public analyzeText(text: string): any {
    const tokens = this.tokenize(text)
    const knownWords = tokens.filter((t) => t.type === "known_word").length
    const unknownWords = tokens.filter((t) => t.type === "unknown_word").length
    const numbers = tokens.filter((t) => t.type === "number").length
    const operators = tokens.filter((t) => t.type === "operator").length

    return {
      totalTokens: tokens.length,
      knownWords,
      unknownWords,
      numbers,
      operators,
      averageConfidence: tokens.reduce((sum, t) => sum + t.confidence, 0) / tokens.length,
      tokens: tokens.slice(0, 10), // Return first 10 tokens for analysis
    }
  }

  public extractKeywords(text: string): string[] {
    const tokens = this.tokenize(text)
    return tokens
      .filter((t) => t.type === "known_word" && t.text.length > 3)
      .map((t) => t.text)
      .slice(0, 5) // Return top 5 keywords
  }

  public isInitialized(): boolean {
    return this.isInitialized
  }
}
