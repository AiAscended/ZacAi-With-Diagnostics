export interface MatchResult {
  intent: string
  confidence: number
  pattern: any
  extractedEntities?: string[]
}

export class PatternMatcher {
  private patterns: any[]
  private knowledgeBase: any[]

  constructor(patterns: any[] = [], knowledgeBase: any[] = []) {
    this.patterns = patterns
    this.knowledgeBase = knowledgeBase
  }

  public matchIntent(input: string): MatchResult | null {
    const mathMatch = this.enhancedMathRecognition(input)
    if (mathMatch) {
      return mathMatch
    }

    const inputLower = input.toLowerCase().trim()
    let bestMatch: MatchResult | null = null
    let highestConfidence = 0

    for (const pattern of this.patterns) {
      const confidence = this.calculatePatternMatch(inputLower, pattern)

      if (confidence > highestConfidence && confidence > 0.3) {
        highestConfidence = confidence
        bestMatch = {
          intent: pattern.intent,
          confidence,
          pattern,
          extractedEntities: this.extractEntities(inputLower, pattern),
        }
      }
    }

    return bestMatch
  }

  private enhancedMathRecognition(input: string): MatchResult | null {
    const mathKeywords = [
      "multiply",
      "times",
      "plus",
      "add",
      "minus",
      "subtract",
      "divide",
      "equals",
      "calculate",
      "what is",
      "how much",
      "result",
      "answer",
    ]

    const hasNumbers = /\d+/.test(input)
    const hasMathKeywords = mathKeywords.some((keyword) => input.toLowerCase().includes(keyword))
    const hasMathSymbols = /[+\-×÷*/=]/.test(input)

    if (hasNumbers && (hasMathKeywords || hasMathSymbols)) {
      return {
        intent: "mathematics",
        confidence: 0.9,
        pattern: {
          intent: "mathematics",
          patterns: ["mathematical expression detected"],
          responses: ["Let me calculate that for you."],
          followUp: ["Would you like to try another calculation?"],
        },
        extractedEntities: this.extractNumbers(input),
      }
    }

    return null
  }

  private extractNumbers(input: string): string[] {
    const numbers = input.match(/\d+/g) || []
    return numbers
  }

  private calculatePatternMatch(input: string, pattern: any): number {
    let maxScore = 0

    for (const patternText of pattern.patterns || []) {
      const score = this.calculateStringMatch(input, patternText.toLowerCase())
      maxScore = Math.max(maxScore, score)
    }

    return maxScore
  }

  private calculateStringMatch(input: string, pattern: string): number {
    if (input === pattern) return 1.0
    if (input.includes(pattern)) return 0.9
    if (pattern.includes(input)) return 0.8

    const inputWords = input.split(/\s+/)
    const patternWords = pattern.split(/\s+/)

    let matchingWords = 0
    for (const word of inputWords) {
      if (patternWords.includes(word)) {
        matchingWords++
      }
    }

    return matchingWords / Math.max(inputWords.length, patternWords.length)
  }

  private extractEntities(input: string, pattern: any): string[] {
    const entities: string[] = []

    for (const knowledge of this.knowledgeBase) {
      if (input.includes(knowledge.topic?.toLowerCase() || "")) {
        entities.push(knowledge.topic)
      }
    }

    return entities
  }
}
