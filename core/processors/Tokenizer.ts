export interface TokenInfo {
  token: string
  id: number
  wordEntry?: any
  isKnown: boolean
  subwords?: string[]
}

export class AdvancedTokenizer {
  private vocabularyLoader: any
  private tokenToId: Map<string, number> = new Map()
  private idToToken: Map<number, string> = new Map()
  private nextId = 0
  private specialTokens = {
    PAD: 0,
    UNK: 1,
    START: 2,
    END: 3,
  }

  constructor(vocabularyLoader: any) {
    this.vocabularyLoader = vocabularyLoader
    this.initializeSpecialTokens()
  }

  private initializeSpecialTokens(): void {
    const tokens = ["<PAD>", "<UNK>", "<START>", "<END>"]
    tokens.forEach((token, index) => {
      this.tokenToId.set(token, index)
      this.idToToken.set(index, token)
    })
    this.nextId = tokens.length
  }

  public async initialize(): Promise<void> {
    console.log("🔤 Advanced tokenizer initialized")
  }

  public tokenize(text: string): TokenInfo[] {
    const words = this.preprocessText(text)
    const tokens: TokenInfo[] = []

    for (const word of words) {
      const tokenInfo = this.processWord(word)
      tokens.push(tokenInfo)
    }

    return tokens
  }

  private preprocessText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s'-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((word) => word.length > 0)
  }

  private processWord(word: string): TokenInfo {
    const wordEntry = this.vocabularyLoader?.getWordDefinition?.(word)

    if (wordEntry) {
      const id = this.getOrCreateTokenId(word)
      return {
        token: word,
        id,
        wordEntry,
        isKnown: true,
      }
    }

    const subwords = this.subwordTokenize(word)
    if (subwords.length > 1) {
      const id = this.getOrCreateTokenId(word)
      return {
        token: word,
        id,
        isKnown: false,
        subwords,
      }
    }

    return {
      token: word,
      id: this.specialTokens.UNK,
      isKnown: false,
    }
  }

  private subwordTokenize(word: string): string[] {
    const subwords: string[] = []
    let remaining = word

    while (remaining.length > 0) {
      let found = false

      for (let i = Math.min(remaining.length, 8); i >= 2; i--) {
        const prefix = remaining.substring(0, i)
        if (this.vocabularyLoader?.getWordDefinition?.(prefix)) {
          subwords.push(prefix)
          remaining = remaining.substring(i)
          found = true
          break
        }
      }

      if (!found) {
        subwords.push(remaining[0])
        remaining = remaining.substring(1)
      }
    }

    return subwords
  }

  private getOrCreateTokenId(token: string): number {
    if (this.tokenToId.has(token)) {
      return this.tokenToId.get(token)!
    }

    const id = this.nextId++
    this.tokenToId.set(token, id)
    this.idToToken.set(id, token)
    return id
  }

  public getTokenInfo(text: string): {
    tokens: TokenInfo[]
    knownWords: number
    unknownWords: number
    totalTokens: number
  } {
    const tokens = this.tokenize(text)
    const knownWords = tokens.filter((t) => t.isKnown).length
    const unknownWords = tokens.filter((t) => !t.isKnown).length

    return {
      tokens,
      knownWords,
      unknownWords,
      totalTokens: tokens.length,
    }
  }

  public getVocabularySize(): number {
    return this.nextId
  }
}
