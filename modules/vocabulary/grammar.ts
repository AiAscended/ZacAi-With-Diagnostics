export interface GrammarRule {
  rule: string
  description: string
  examples: string[]
  exceptions?: string[]
}

export interface WordForm {
  word: string
  plural?: string
  pastTense?: string
  presentParticiple?: string
  pastParticiple?: string
  comparative?: string
  superlative?: string
}

export interface GrammarResponse {
  success: boolean
  data?: {
    wordForms: WordForm
    rules: GrammarRule[]
    suggestions: string[]
  }
  error?: string
  cached?: boolean
  timestamp: number
}

export class GrammarClient {
  private static readonly CACHE_DURATION = 86400000 // 24 hours
  private cache = new Map<string, { data: any; timestamp: number }>()

  async analyzeGrammar(word: string, context?: string): Promise<GrammarResponse> {
    const normalizedWord = word.toLowerCase().trim()

    if (!normalizedWord) {
      return {
        success: false,
        error: "Word cannot be empty",
        timestamp: Date.now(),
      }
    }

    // Check cache first
    const cached = this.getCachedEntry(normalizedWord)
    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      }
    }

    try {
      const grammarData = await this.getGrammarAnalysis(normalizedWord, context)

      if (grammarData) {
        this.cacheEntry(normalizedWord, grammarData)
        return {
          success: true,
          data: grammarData,
          cached: false,
          timestamp: Date.now(),
        }
      }

      return {
        success: false,
        error: `No grammar analysis available for "${word}"`,
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

  private async getGrammarAnalysis(word: string, context?: string): Promise<any> {
    const wordForms = this.generateWordForms(word)
    const rules = this.getRelevantRules(word)
    const suggestions = this.generateSuggestions(word, context)

    return {
      wordForms,
      rules,
      suggestions,
    }
  }

  private generateWordForms(word: string): WordForm {
    const forms: WordForm = { word }

    // Generate plural
    if (this.isNoun(word)) {
      forms.plural = this.makePlural(word)
    }

    // Generate verb forms
    if (this.isVerb(word)) {
      forms.pastTense = this.makePastTense(word)
      forms.presentParticiple = this.makePresentParticiple(word)
      forms.pastParticiple = this.makePastParticiple(word)
    }

    // Generate adjective forms
    if (this.isAdjective(word)) {
      forms.comparative = this.makeComparative(word)
      forms.superlative = this.makeSuperlative(word)
    }

    return forms
  }

  private makePlural(word: string): string {
    if (word.endsWith("s") || word.endsWith("sh") || word.endsWith("ch") || word.endsWith("x") || word.endsWith("z")) {
      return word + "es"
    }
    if (word.endsWith("y") && !this.isVowel(word[word.length - 2])) {
      return word.slice(0, -1) + "ies"
    }
    if (word.endsWith("f")) {
      return word.slice(0, -1) + "ves"
    }
    if (word.endsWith("fe")) {
      return word.slice(0, -2) + "ves"
    }
    return word + "s"
  }

  private makePastTense(word: string): string {
    if (word.endsWith("e")) {
      return word + "d"
    }
    if (word.endsWith("y") && !this.isVowel(word[word.length - 2])) {
      return word.slice(0, -1) + "ied"
    }
    if (this.shouldDoubleConsonant(word)) {
      return word + word[word.length - 1] + "ed"
    }
    return word + "ed"
  }

  private makePresentParticiple(word: string): string {
    if (word.endsWith("e") && !word.endsWith("ee")) {
      return word.slice(0, -1) + "ing"
    }
    if (this.shouldDoubleConsonant(word)) {
      return word + word[word.length - 1] + "ing"
    }
    return word + "ing"
  }

  private makePastParticiple(word: string): string {
    // For regular verbs, past participle is same as past tense
    return this.makePastTense(word)
  }

  private makeComparative(word: string): string {
    if (word.length <= 2 || (word.length === 3 && this.countVowels(word) === 1)) {
      if (word.endsWith("y")) {
        return word.slice(0, -1) + "ier"
      }
      if (this.shouldDoubleConsonant(word)) {
        return word + word[word.length - 1] + "er"
      }
      return word + "er"
    }
    return "more " + word
  }

  private makeSuperlative(word: string): string {
    if (word.length <= 2 || (word.length === 3 && this.countVowels(word) === 1)) {
      if (word.endsWith("y")) {
        return word.slice(0, -1) + "iest"
      }
      if (this.shouldDoubleConsonant(word)) {
        return word + word[word.length - 1] + "est"
      }
      return word + "est"
    }
    return "most " + word
  }

  private isVowel(char: string): boolean {
    return "aeiouAEIOU".includes(char)
  }

  private countVowels(word: string): number {
    return word.split("").filter((char) => this.isVowel(char)).length
  }

  private shouldDoubleConsonant(word: string): boolean {
    if (word.length < 3) return false
    const lastThree = word.slice(-3)
    return (
      !this.isVowel(lastThree[0]) &&
      this.isVowel(lastThree[1]) &&
      !this.isVowel(lastThree[2]) &&
      lastThree[2] !== "w" &&
      lastThree[2] !== "x" &&
      lastThree[2] !== "y"
    )
  }

  private isNoun(word: string): boolean {
    const nounSuffixes = ["tion", "sion", "ness", "ment", "ity", "er", "or", "ist"]
    return nounSuffixes.some((suffix) => word.endsWith(suffix))
  }

  private isVerb(word: string): boolean {
    const verbSuffixes = ["ate", "ify", "ize", "ise"]
    return verbSuffixes.some((suffix) => word.endsWith(suffix))
  }

  private isAdjective(word: string): boolean {
    const adjSuffixes = ["able", "ible", "ful", "less", "ous", "ive", "al", "ic"]
    return adjSuffixes.some((suffix) => word.endsWith(suffix))
  }

  private getRelevantRules(word: string): GrammarRule[] {
    const rules: GrammarRule[] = []

    if (this.isNoun(word)) {
      rules.push({
        rule: "Plural Formation",
        description: "Most nouns form plurals by adding -s or -es",
        examples: ["cat → cats", "box → boxes", "baby → babies"],
        exceptions: ["child → children", "mouse → mice", "foot → feet"],
      })
    }

    if (this.isVerb(word)) {
      rules.push({
        rule: "Past Tense Formation",
        description: "Regular verbs form past tense by adding -ed",
        examples: ["walk → walked", "dance → danced", "study → studied"],
        exceptions: ["go → went", "see → saw", "have → had"],
      })
    }

    if (this.isAdjective(word)) {
      rules.push({
        rule: "Comparative and Superlative",
        description: "Short adjectives add -er/-est, long adjectives use more/most",
        examples: ["big → bigger → biggest", "beautiful → more beautiful → most beautiful"],
        exceptions: ["good → better → best", "bad → worse → worst"],
      })
    }

    return rules
  }

  private generateSuggestions(word: string, context?: string): string[] {
    const suggestions: string[] = []

    if (context) {
      if (context.includes("plural") || context.includes("multiple")) {
        const plural = this.makePlural(word)
        suggestions.push(`Use "${plural}" for plural form`)
      }

      if (context.includes("past") || context.includes("yesterday")) {
        const pastTense = this.makePastTense(word)
        suggestions.push(`Use "${pastTense}" for past tense`)
      }

      if (context.includes("compare") || context.includes("more")) {
        const comparative = this.makeComparative(word)
        suggestions.push(`Use "${comparative}" for comparison`)
      }
    }

    return suggestions
  }

  private getCachedEntry(word: string): any {
    const cached = this.cache.get(word)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > GrammarClient.CACHE_DURATION
    if (isExpired) {
      this.cache.delete(word)
      return null
    }

    return cached.data
  }

  private cacheEntry(word: string, data: any): void {
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

  formatGrammarResponse(data: any): string {
    let response = `**${data.wordForms.word.toUpperCase()}** Grammar Analysis\n\n`

    // Word forms
    response += "**Word Forms:**\n"
    if (data.wordForms.plural) response += `• Plural: ${data.wordForms.plural}\n`
    if (data.wordForms.pastTense) response += `• Past Tense: ${data.wordForms.pastTense}\n`
    if (data.wordForms.presentParticiple) response += `• Present Participle: ${data.wordForms.presentParticiple}\n`
    if (data.wordForms.pastParticiple) response += `• Past Participle: ${data.wordForms.pastParticiple}\n`
    if (data.wordForms.comparative) response += `• Comparative: ${data.wordForms.comparative}\n`
    if (data.wordForms.superlative) response += `• Superlative: ${data.wordForms.superlative}\n`

    // Grammar rules
    if (data.rules.length > 0) {
      response += "\n**Grammar Rules:**\n"
      data.rules.forEach((rule: GrammarRule) => {
        response += `• **${rule.rule}**: ${rule.description}\n`
        response += `  Examples: ${rule.examples.join(", ")}\n`
        if (rule.exceptions) {
          response += `  Exceptions: ${rule.exceptions.join(", ")}\n`
        }
      })
    }

    // Suggestions
    if (data.suggestions.length > 0) {
      response += "\n**Suggestions:**\n"
      data.suggestions.forEach((suggestion: string) => {
        response += `• ${suggestion}\n`
      })
    }

    return response
  }
}

export const grammarClient = new GrammarClient()
