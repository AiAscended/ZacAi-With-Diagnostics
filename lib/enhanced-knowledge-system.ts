// NEW: Enhanced Knowledge System with Online Sources and Learned Knowledge
export class EnhancedKnowledgeSystem {
  private learnedVocabulary: Map<string, any> = new Map()
  private learnedMathematics: Map<string, any> = new Map()
  private learnedScience: Map<string, any> = new Map()
  private onlineSources: Map<string, string> = new Map()

  constructor() {
    this.initializeOnlineSources()
  }

  private initializeOnlineSources() {
    // Dictionary and Thesaurus APIs
    this.onlineSources.set("dictionary", "https://api.dictionaryapi.dev/api/v2/entries/en/")
    this.onlineSources.set("thesaurus", "https://api.datamuse.com/words?rel_syn=")
    this.onlineSources.set("rhymes", "https://api.datamuse.com/words?rel_rhy=")

    // Math and Science
    this.onlineSources.set("math_formulas", "https://api.mathjs.org/v4/")
    this.onlineSources.set("wikipedia", "https://en.wikipedia.org/api/rest_v1/page/summary/")

    // Programming Resources
    this.onlineSources.set("mdn_docs", "https://developer.mozilla.org/en-US/docs/Web/")
    this.onlineSources.set("w3schools", "https://www.w3schools.com/")
    this.onlineSources.set("react_docs", "https://react.dev/reference/")
    this.onlineSources.set("nextjs_docs", "https://nextjs.org/docs/")
  }

  // Enhanced Dictionary Lookup with Thesaurus and Phonetics
  public async lookupWord(word: string): Promise<any> {
    try {
      const response = await fetch(`${this.onlineSources.get("dictionary")}${word}`)
      if (response.ok) {
        const data = await response.json()
        const wordData = data[0]

        // Get synonyms from thesaurus
        const synonymsResponse = await fetch(`${this.onlineSources.get("thesaurus")}${word}`)
        const synonymsData = synonymsResponse.ok ? await synonymsResponse.json() : []

        const enhancedWordData = {
          word: wordData.word,
          phonetics: wordData.phonetics || [],
          meanings: wordData.meanings || [],
          synonyms: synonymsData.slice(0, 10).map((item: any) => item.word) || [],
          sourceUrl: wordData.sourceUrls?.[0] || "",
          learned: true,
          timestamp: Date.now(),
        }

        // Store in learned vocabulary
        this.learnedVocabulary.set(word.toLowerCase(), enhancedWordData)
        await this.saveLearnedKnowledge("vocabulary")

        return enhancedWordData
      }
    } catch (error) {
      console.error("Dictionary lookup failed:", error)
    }
    return null
  }

  // Enhanced Math Processing with Formula Learning
  public async processMathProblem(expression: string): Promise<any> {
    try {
      // First check if we have learned this type of problem
      const mathType = this.identifyMathType(expression)
      const learnedFormula = this.learnedMathematics.get(mathType)

      if (learnedFormula) {
        return this.applyLearnedFormula(expression, learnedFormula)
      }

      // Try to solve using MathJS API
      const response = await fetch(`${this.onlineSources.get("math_formulas")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expr: expression }),
      })

      if (response.ok) {
        const result = await response.json()

        // Learn this math pattern for future use
        const mathPattern = {
          type: mathType,
          expression: expression,
          result: result.result,
          method: "online_calculation",
          formula: this.extractFormula(expression),
          timestamp: Date.now(),
        }

        this.learnedMathematics.set(mathType, mathPattern)
        await this.saveLearnedKnowledge("mathematics")

        return mathPattern
      }
    } catch (error) {
      console.error("Math processing failed:", error)
    }

    // Fallback to local processing
    return this.processLocalMath(expression)
  }

  private identifyMathType(expression: string): string {
    if (expression.includes("+")) return "addition"
    if (expression.includes("-")) return "subtraction"
    if (expression.includes("*") || expression.includes("×")) return "multiplication"
    if (expression.includes("/") || expression.includes("÷")) return "division"
    if (expression.includes("^") || expression.includes("**")) return "exponentiation"
    if (expression.includes("sqrt") || expression.includes("√")) return "square_root"
    return "general"
  }

  private extractFormula(expression: string): string {
    // Extract the mathematical pattern/formula from the expression
    return expression.replace(/\d+/g, "n").replace(/\s+/g, " ").trim()
  }

  private applyLearnedFormula(expression: string, formula: any): any {
    // Apply previously learned mathematical formula
    return {
      result: this.calculateUsingFormula(expression, formula),
      method: "learned_formula",
      confidence: 0.9,
      source: "learned_knowledge",
    }
  }

  private calculateUsingFormula(expression: string, formula: any): number {
    // Simple calculation logic - can be enhanced
    try {
      return Function('"use strict"; return (' + expression + ")")()
    } catch {
      return 0
    }
  }

  private processLocalMath(expression: string): any {
    // Fallback local math processing
    try {
      const result = Function('"use strict"; return (' + expression + ")")()
      return {
        result,
        method: "local_calculation",
        confidence: 0.7,
        source: "local_processing",
      }
    } catch (error) {
      return {
        result: "Error: Cannot calculate",
        method: "error",
        confidence: 0.1,
        source: "error",
      }
    }
  }

  // Tesla/Vortex Math Implementation
  public getVortexMathPattern(number: number): any {
    const digitalRoot = this.calculateDigitalRoot(number)
    const vortexCycle = [1, 2, 4, 8, 7, 5]
    const teslaPattern = [3, 6, 9]

    return {
      number,
      digitalRoot,
      isVortexNumber: vortexCycle.includes(digitalRoot),
      isTeslaNumber: teslaPattern.includes(digitalRoot),
      vortexPosition: vortexCycle.indexOf(digitalRoot),
      pattern: digitalRoot <= 9 ? "single_digit" : "multi_digit",
    }
  }

  private calculateDigitalRoot(num: number): number {
    while (num >= 10) {
      num = num
        .toString()
        .split("")
        .reduce((sum, digit) => sum + Number.parseInt(digit), 0)
    }
    return num
  }

  // Science Knowledge Lookup
  public async lookupScientificConcept(concept: string): Promise<any> {
    try {
      const response = await fetch(`${this.onlineSources.get("wikipedia")}${encodeURIComponent(concept)}`)
      if (response.ok) {
        const data = await response.json()

        const scientificData = {
          title: data.title,
          extract: data.extract,
          url: data.content_urls?.desktop?.page || "",
          type: "scientific_concept",
          learned: true,
          timestamp: Date.now(),
        }

        this.learnedScience.set(concept.toLowerCase(), scientificData)
        await this.saveLearnedKnowledge("science")

        return scientificData
      }
    } catch (error) {
      console.error("Science lookup failed:", error)
    }
    return null
  }

  // Programming Knowledge Lookup
  public async lookupProgrammingConcept(concept: string, language = "javascript"): Promise<any> {
    const sources = {
      javascript: this.onlineSources.get("mdn_docs"),
      react: this.onlineSources.get("react_docs"),
      nextjs: this.onlineSources.get("nextjs_docs"),
      general: this.onlineSources.get("w3schools"),
    }

    // This would need actual API implementation for each source
    return {
      concept,
      language,
      source: sources[language as keyof typeof sources] || sources.general,
      learned: true,
      timestamp: Date.now(),
    }
  }

  // Retrieve Learned Knowledge
  public getLearnedVocabulary(): Map<string, any> {
    return this.learnedVocabulary
  }

  public getLearnedMathematics(): Map<string, any> {
    return this.learnedMathematics
  }

  public getLearnedScience(): Map<string, any> {
    return this.learnedScience
  }

  // Check if word/concept was recently learned
  public wasRecentlyLearned(item: string, type: "vocabulary" | "mathematics" | "science"): boolean {
    const maps = {
      vocabulary: this.learnedVocabulary,
      mathematics: this.learnedMathematics,
      science: this.learnedScience,
    }

    const learned = maps[type].get(item.toLowerCase())
    if (learned) {
      const hoursSinceLearned = (Date.now() - learned.timestamp) / (1000 * 60 * 60)
      return hoursSinceLearned < 24 // Consider "recent" if learned in last 24 hours
    }
    return false
  }

  // Save learned knowledge to separate files
  private async saveLearnedKnowledge(type: "vocabulary" | "mathematics" | "science"): Promise<void> {
    try {
      const data = {
        vocabulary: Array.from(this.learnedVocabulary.entries()),
        mathematics: Array.from(this.learnedMathematics.entries()),
        science: Array.from(this.learnedScience.entries()),
      }

      // Save to localStorage with separate keys
      localStorage.setItem(`learned_${type}`, JSON.stringify(data[type]))
      console.log(`✅ Saved learned ${type} knowledge`)
    } catch (error) {
      console.error(`Failed to save learned ${type}:`, error)
    }
  }

  // Load learned knowledge from storage
  public async loadLearnedKnowledge(): Promise<void> {
    try {
      const types = ["vocabulary", "mathematics", "science"]

      for (const type of types) {
        const stored = localStorage.getItem(`learned_${type}`)
        if (stored) {
          const data = JSON.parse(stored)
          const map =
            type === "vocabulary"
              ? this.learnedVocabulary
              : type === "mathematics"
                ? this.learnedMathematics
                : this.learnedScience

          data.forEach(([key, value]: [string, any]) => {
            map.set(key, value)
          })
        }
      }

      console.log("✅ Loaded all learned knowledge")
    } catch (error) {
      console.error("Failed to load learned knowledge:", error)
    }
  }

  // Get comprehensive stats
  public getKnowledgeStats(): any {
    return {
      learnedVocabulary: this.learnedVocabulary.size,
      learnedMathematics: this.learnedMathematics.size,
      learnedScience: this.learnedScience.size,
      totalLearned: this.learnedVocabulary.size + this.learnedMathematics.size + this.learnedScience.size,
      onlineSourcesAvailable: this.onlineSources.size,
      lastUpdate: Date.now(),
    }
  }
}
