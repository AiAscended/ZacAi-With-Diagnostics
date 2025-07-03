export interface GrammarRule {
  rule: string
  description: string
  examples: string[]
  exceptions?: string[]
}

export interface GrammarAnalysis {
  word: string
  partOfSpeech: string
  grammarRules: GrammarRule[]
  conjugations?: string[]
  plurals?: string[]
  comparatives?: string[]
  usage: string[]
}

export interface GrammarResponse {
  success: boolean
  data?: GrammarAnalysis
  error?: string
  cached?: boolean
  timestamp: number
}

export class GrammarClient {
  private static readonly CACHE_DURATION = 86400000 // 24 hours
  private cache = new Map<string, { data: GrammarAnalysis; timestamp: number }>()

  async analyzeGrammar(word: string, partOfSpeech?: string): Promise<GrammarResponse> {
    const normalizedWord = word.toLowerCase().trim()

    if (!normalizedWord) {
      return {
        success: false,
        error: "Word cannot be empty",
        timestamp: Date.now(),
      }
    }

    // Check cache first
    const cached = this.getCachedAnalysis(normalizedWord)
    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      }
    }

    try {
      const grammarData = await this.performGrammarAnalysis(normalizedWord, partOfSpeech)

      this.cacheAnalysis(normalizedWord, grammarData)

      return {
        success: true,
        data: grammarData,
        cached: false,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("Grammar analysis error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: Date.now(),
      }
    }
  }

  private async performGrammarAnalysis(word: string, partOfSpeech?: string): Promise<GrammarAnalysis> {
    // Determine part of speech if not provided
    const pos = partOfSpeech || this.guessPartOfSpeech(word)

    const analysis: GrammarAnalysis = {
      word,
      partOfSpeech: pos,
      grammarRules: this.getGrammarRules(pos),
      usage: this.getUsageExamples(word, pos),
    }

    // Add specific forms based on part of speech
    switch (pos) {
      case "noun":
        analysis.plurals = this.generatePlurals(word)
        break
      case "verb":
        analysis.conjugations = this.generateConjugations(word)
        break
      case "adjective":
        analysis.comparatives = this.generateComparatives(word)
        break
    }

    return analysis
  }

  private guessPartOfSpeech(word: string): string {
    // Simple heuristics to guess part of speech
    if (word.endsWith("ing")) return "verb"
    if (word.endsWith("ed")) return "verb"
    if (word.endsWith("ly")) return "adverb"
    if (word.endsWith("tion") || word.endsWith("sion")) return "noun"
    if (word.endsWith("ful") || word.endsWith("less")) return "adjective"

    // Default to noun
    return "noun"
  }

  private getGrammarRules(partOfSpeech: string): GrammarRule[] {
    const rules: { [key: string]: GrammarRule[] } = {
      noun: [
        {
          rule: "Plural Formation",
          description: "Most nouns form plurals by adding -s or -es",
          examples: ["cat → cats", "box → boxes", "child → children"],
          exceptions: ["man → men", "foot → feet", "mouse → mice"],
        },
        {
          rule: "Possessive Form",
          description: "Add 's to show possession",
          examples: ["the cat's toy", "James's book", "the children's games"],
        },
      ],
      verb: [
        {
          rule: "Present Tense",
          description: "Third person singular adds -s",
          examples: ["I walk, he walks", "I try, she tries"],
        },
        {
          rule: "Past Tense",
          description: "Regular verbs add -ed",
          examples: ["walk → walked", "try → tried"],
          exceptions: ["go → went", "see → saw", "be → was/were"],
        },
        {
          rule: "Present Participle",
          description: "Add -ing for continuous tenses",
          examples: ["walk → walking", "run → running", "die → dying"],
        },
      ],
      adjective: [
        {
          rule: "Comparative Form",
          description: "Add -er or use 'more' for comparison",
          examples: ["tall → taller", "beautiful → more beautiful"],
        },
        {
          rule: "Superlative Form",
          description: "Add -est or use 'most' for superlative",
          examples: ["tall → tallest", "beautiful → most beautiful"],
        },
      ],
      adverb: [
        {
          rule: "Formation",
          description: "Many adverbs are formed by adding -ly to adjectives",
          examples: ["quick → quickly", "careful → carefully"],
        },
        {
          rule: "Position",
          description: "Adverbs can modify verbs, adjectives, or other adverbs",
          examples: ["He runs quickly", "Very tall", "Quite slowly"],
        },
      ],
    }

    return rules[partOfSpeech] || []
  }

  private generatePlurals(word: string): string[] {
    const plurals: string[] = []

    // Regular plurals
    if (word.endsWith("s") || word.endsWith("sh") || word.endsWith("ch") || word.endsWith("x") || word.endsWith("z")) {
      plurals.push(word + "es")
    } else if (word.endsWith("y") && !"aeiou".includes(word[word.length - 2])) {
      plurals.push(word.slice(0, -1) + "ies")
    } else if (word.endsWith("f")) {
      plurals.push(word.slice(0, -1) + "ves")
    } else if (word.endsWith("fe")) {
      plurals.push(word.slice(0, -2) + "ves")
    } else {
      plurals.push(word + "s")
    }

    return plurals
  }

  private generateConjugations(word: string): string[] {
    const conjugations: string[] = []

    // Present tense (3rd person singular)
    if (word.endsWith("s") || word.endsWith("sh") || word.endsWith("ch") || word.endsWith("x") || word.endsWith("z")) {
      conjugations.push(word + "es")
    } else if (word.endsWith("y") && !"aeiou".includes(word[word.length - 2])) {
      conjugations.push(word.slice(0, -1) + "ies")
    } else {
      conjugations.push(word + "s")
    }

    // Past tense
    if (word.endsWith("e")) {
      conjugations.push(word + "d")
    } else if (word.endsWith("y") && !"aeiou".includes(word[word.length - 2])) {
      conjugations.push(word.slice(0, -1) + "ied")
    } else {
      conjugations.push(word + "ed")
    }

    // Present participle
    if (word.endsWith("e") && word.length > 2) {
      conjugations.push(word.slice(0, -1) + "ing")
    } else {
      conjugations.push(word + "ing")
    }

    return conjugations
  }

  private generateComparatives(word: string): string[] {
    const comparatives: string[] = []

    if (word.length <= 6) {
      // Short adjectives
      if (word.endsWith("e")) {
        comparatives.push(word + "r", word + "st")
      } else if (word.endsWith("y")) {
        comparatives.push(word.slice(0, -1) + "ier", word.slice(0, -1) + "iest")
      } else {
        comparatives.push(word + "er", word + "est")
      }
    } else {
      // Long adjectives
      comparatives.push(`more ${word}`, `most ${word}`)
    }

    return comparatives
  }

  private getUsageExamples(word: string, partOfSpeech: string): string[] {
    // Generate basic usage examples
    const examples: string[] = []

    switch (partOfSpeech) {
      case "noun":
        examples.push(`The ${word} is important.`, `I need a ${word}.`)
        break
      case "verb":
        examples.push(`I ${word} every day.`, `She ${word}s well.`)
        break
      case "adjective":
        examples.push(`It is very ${word}.`, `A ${word} example.`)
        break
      case "adverb":
        examples.push(`He works ${word}.`, `She speaks ${word}.`)
        break
    }

    return examples
  }

  private getCachedAnalysis(word: string): GrammarAnalysis | null {
    const cached = this.cache.get(word)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > GrammarClient.CACHE_DURATION
    if (isExpired) {
      this.cache.delete(word)
      return null
    }

    return cached.data
  }

  private cacheAnalysis(word: string, data: GrammarAnalysis): void {
    this.cache.set(word, {
      data,
      timestamp: Date.now(),
    })
  }

  getCacheStats(): { size: number; words: string[] } {
    return {
      size: this.cache.size,
      words: Array.from(this.cache.keys()),
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  formatGrammarResponse(analysis: GrammarAnalysis): string {
    let response = `**${analysis.word.toUpperCase()}** Grammar Analysis\n\n`

    response += `**Part of Speech:** ${analysis.partOfSpeech}\n\n`

    if (analysis.plurals && analysis.plurals.length > 0) {
      response += `**Plural Forms:** ${analysis.plurals.join(", ")}\n\n`
    }

    if (analysis.conjugations && analysis.conjugations.length > 0) {
      response += `**Conjugations:** ${analysis.conjugations.join(", ")}\n\n`
    }

    if (analysis.comparatives && analysis.comparatives.length > 0) {
      response += `**Comparative Forms:** ${analysis.comparatives.join(", ")}\n\n`
    }

    if (analysis.grammarRules.length > 0) {
      response += `**Grammar Rules:**\n`
      analysis.grammarRules.forEach((rule) => {
        response += `• **${rule.rule}:** ${rule.description}\n`
        if (rule.examples.length > 0) {
          response += `  Examples: ${rule.examples.join(", ")}\n`
        }
      })
      response += "\n"
    }

    if (analysis.usage.length > 0) {
      response += `**Usage Examples:**\n`
      analysis.usage.forEach((example) => {
        response += `• "${example}"\n`
      })
    }

    return response
  }
}

export const grammarClient = new GrammarClient()
