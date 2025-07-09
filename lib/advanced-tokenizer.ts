import { type VocabularyLoader, type VocabularyEntry, vocabularyLoader } from "./vocabulary-loader"

export interface Token {
  text: string
  type: "word" | "number" | "punctuation" | "whitespace" | "unknown"
  position: number
  length: number
  confidence: number
  metadata?: {
    partOfSpeech?: string
    definition?: string
    synonyms?: string[]
    frequency?: number
  }
}

export interface TokenizationResult {
  tokens: Token[]
  totalTokens: number
  processingTime: number
  confidence: number
}

export class AdvancedTokenizer {
  private vocabulary: VocabularyLoader
  private isInitialized = false

  constructor() {
    this.vocabulary = vocabularyLoader
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    await this.vocabulary.initialize()
    this.isInitialized = true
    console.log("✅ AdvancedTokenizer initialized")
  }

  async tokenize(text: string): Promise<TokenizationResult> {
    const startTime = performance.now()

    if (!this.isInitialized) {
      await this.initialize()
    }

    const tokens: Token[] = []
    let position = 0

    // Enhanced tokenization patterns
    const patterns = [
      { type: "number", regex: /\d+\.?\d*/g },
      { type: "word", regex: /[a-zA-Z]+(?:'[a-zA-Z]+)?/g },
      { type: "punctuation", regex: /[.,!?;:()[\]{}'"]/g },
      { type: "whitespace", regex: /\s+/g },
    ]

    // Process text character by character for precise tokenization
    let remainingText = text
    position = 0

    while (remainingText.length > 0) {
      let matched = false

      for (const pattern of patterns) {
        const regex = new RegExp(pattern.regex.source, "g")
        regex.lastIndex = 0
        const match = regex.exec(remainingText)

        if (match && match.index === 0) {
          const tokenText = match[0]
          const token: Token = {
            text: tokenText,
            type: pattern.type as Token["type"],
            position,
            length: tokenText.length,
            confidence: this.calculateConfidence(tokenText, pattern.type as Token["type"]),
          }

          // Add metadata for words
          if (pattern.type === "word") {
            const vocabEntry = this.vocabulary.getWord(tokenText.toLowerCase())
            if (vocabEntry) {
              token.metadata = {
                partOfSpeech: vocabEntry.part_of_speech,
                definition: vocabEntry.definition,
                synonyms: vocabEntry.synonyms,
                frequency: vocabEntry.frequency,
              }
              token.confidence = Math.min(token.confidence + 0.2, 1.0)
            }
          }

          tokens.push(token)
          remainingText = remainingText.slice(tokenText.length)
          position += tokenText.length
          matched = true
          break
        }
      }

      if (!matched) {
        // Handle unknown characters
        const unknownChar = remainingText[0]
        tokens.push({
          text: unknownChar,
          type: "unknown",
          position,
          length: 1,
          confidence: 0.1,
        })
        remainingText = remainingText.slice(1)
        position += 1
      }
    }

    const processingTime = performance.now() - startTime
    const averageConfidence = tokens.reduce((sum, token) => sum + token.confidence, 0) / tokens.length

    return {
      tokens,
      totalTokens: tokens.length,
      processingTime,
      confidence: averageConfidence || 0,
    }
  }

  private calculateConfidence(text: string, type: Token["type"]): number {
    switch (type) {
      case "word":
        // Higher confidence for known words
        const vocabEntry = this.vocabulary.getWord(text.toLowerCase())
        return vocabEntry ? 0.9 : 0.6
      case "number":
        return 0.95
      case "punctuation":
        return 0.99
      case "whitespace":
        return 1.0
      default:
        return 0.3
    }
  }

  getVocabularySize(): number {
    return this.vocabulary.getVocabularySize()
  }

  async addWord(word: string, entry: VocabularyEntry): Promise<void> {
    this.vocabulary.addLearntWord(word, entry)
  }

  getWordInfo(word: string): VocabularyEntry | null {
    return this.vocabulary.getWord(word)
  }
}

// Export singleton instance
export const advancedTokenizer = new AdvancedTokenizer()
