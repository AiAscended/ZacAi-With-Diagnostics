import { VocabularyLoader, type VocabularyEntry } from "./vocabulary-loader"

export interface TokenInfo {
  token: string
  type: "word" | "punctuation" | "number" | "whitespace" | "unknown"
  position: number
  length: number
  vocabularyEntry?: VocabularyEntry
  confidence: number
}

export interface TokenizationResult {
  tokens: TokenInfo[]
  totalTokens: number
  knownWords: number
  unknownWords: number
  confidence: number
}

export class AdvancedTokenizer {
  private static instance: AdvancedTokenizer
  private vocabularyLoader: VocabularyLoader
  private isInitialized = false

  private constructor() {
    this.vocabularyLoader = VocabularyLoader.getInstance()
  }

  public static getInstance(): AdvancedTokenizer {
    if (!AdvancedTokenizer.instance) {
      AdvancedTokenizer.instance = new AdvancedTokenizer()
    }
    return AdvancedTokenizer.instance
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.vocabularyLoader.loadSeedVocabulary()
      await this.vocabularyLoader.loadLearntVocabulary()
      this.isInitialized = true
      console.log("✅ AdvancedTokenizer initialized")
    } catch (error) {
      console.error("Failed to initialize AdvancedTokenizer:", error)
      this.isInitialized = true // Continue with basic functionality
    }
  }

  public async tokenize(text: string): Promise<TokenizationResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const tokens: TokenInfo[] = []
    let knownWords = 0
    let unknownWords = 0
    let position = 0

    // Enhanced tokenization regex
    const tokenRegex = /(\w+)|([^\w\s])|(\s+)/g
    let match

    while ((match = tokenRegex.exec(text)) !== null) {
      const [fullMatch, word, punctuation, whitespace] = match
      const token = fullMatch
      const tokenStart = match.index

      let tokenType: TokenInfo["type"]
      let vocabularyEntry: VocabularyEntry | undefined
      let confidence = 0

      if (word) {
        tokenType = /^\d+$/.test(word) ? "number" : "word"

        if (tokenType === "word") {
          vocabularyEntry = this.vocabularyLoader.getVocabularyEntry(word.toLowerCase())
          if (vocabularyEntry) {
            knownWords++
            confidence = 0.9
          } else {
            unknownWords++
            confidence = 0.3
          }
        } else {
          confidence = 1.0 // Numbers are always recognized
        }
      } else if (punctuation) {
        tokenType = "punctuation"
        confidence = 1.0
      } else if (whitespace) {
        tokenType = "whitespace"
        confidence = 1.0
      } else {
        tokenType = "unknown"
        confidence = 0.1
      }

      const tokenInfo: TokenInfo = {
        token,
        type: tokenType,
        position: tokenStart,
        length: token.length,
        vocabularyEntry,
        confidence,
      }

      tokens.push(tokenInfo)
      position = tokenStart + token.length
    }

    const totalTokens = tokens.length
    const overallConfidence =
      totalTokens > 0 ? tokens.reduce((sum, token) => sum + token.confidence, 0) / totalTokens : 0

    return {
      tokens,
      totalTokens,
      knownWords,
      unknownWords,
      confidence: overallConfidence,
    }
  }

  public async analyzeText(text: string): Promise<{
    tokenization: TokenizationResult
    wordFrequency: Map<string, number>
    readabilityScore: number
    suggestions: string[]
  }> {
    const tokenization = await this.tokenize(text)
    const wordFrequency = new Map<string, number>()
    const suggestions: string[] = []

    // Calculate word frequency
    for (const token of tokenization.tokens) {
      if (token.type === "word") {
        const word = token.token.toLowerCase()
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1)
      }
    }

    // Calculate readability score (simplified)
    const avgWordsPerSentence = this.calculateAverageWordsPerSentence(text)
    const avgSyllablesPerWord = this.estimateAverageSyllables(tokenization.tokens)
    const readabilityScore = Math.max(
      0,
      Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord),
    )

    // Generate suggestions for unknown words
    for (const token of tokenization.tokens) {
      if (token.type === "word" && !token.vocabularyEntry) {
        suggestions.push(`Consider defining: "${token.token}"`)
      }
    }

    return {
      tokenization,
      wordFrequency,
      readabilityScore,
      suggestions: suggestions.slice(0, 5), // Limit suggestions
    }
  }

  private calculateAverageWordsPerSentence(text: string): number {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const words = text.split(/\s+/).filter((w) => w.trim().length > 0)
    return sentences.length > 0 ? words.length / sentences.length : 0
  }

  private estimateAverageSyllables(tokens: TokenInfo[]): number {
    const wordTokens = tokens.filter((t) => t.type === "word")
    if (wordTokens.length === 0) return 0

    const totalSyllables = wordTokens.reduce((sum, token) => {
      return sum + this.estimateSyllables(token.token)
    }, 0)

    return totalSyllables / wordTokens.length
  }

  private estimateSyllables(word: string): number {
    // Simple syllable estimation
    const vowels = word.toLowerCase().match(/[aeiouy]+/g)
    let syllables = vowels ? vowels.length : 1

    // Adjust for silent 'e'
    if (word.toLowerCase().endsWith("e")) {
      syllables--
    }

    return Math.max(1, syllables)
  }

  public getStats(): {
    initialized: boolean
    vocabularySize: number
    totalProcessed: number
  } {
    const vocabStats = this.vocabularyLoader.getVocabularyStats()

    return {
      initialized: this.isInitialized,
      vocabularySize: vocabStats.total,
      totalProcessed: 0, // Could track this if needed
    }
  }
}

// Export singleton instance
export const advancedTokenizer = AdvancedTokenizer.getInstance()
