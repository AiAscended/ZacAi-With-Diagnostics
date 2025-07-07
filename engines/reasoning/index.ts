import type { IntentAnalysis, ReasoningChain } from "@/types/global"

export class ReasoningEngine {
  private initialized = false
  private reasoningHistory: ReasoningChain[] = []

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🤔 Initializing Reasoning Engine...")

    try {
      this.initialized = true
      console.log("✅ Reasoning Engine initialized successfully")
    } catch (error) {
      console.error("❌ Reasoning Engine initialization failed:", error)
      throw error
    }
  }

  async analyze(input: string): Promise<IntentAnalysis> {
    const lowercaseInput = input.toLowerCase()

    // Intent classification
    let intent = "general"
    let confidence = 0.5
    const suggestedModules: string[] = []
    const entities: string[] = []

    // Math detection
    if (this.isMathQuery(lowercaseInput)) {
      intent = "mathematics"
      confidence = 0.9
      suggestedModules.push("mathematics")
      entities.push(...this.extractMathEntities(input))
    }
    // Vocabulary detection
    else if (this.isVocabularyQuery(lowercaseInput)) {
      intent = "vocabulary"
      confidence = 0.8
      suggestedModules.push("vocabulary")
      entities.push(...this.extractVocabularyEntities(input))
    }
    // Facts detection
    else if (this.isFactsQuery(lowercaseInput)) {
      intent = "facts"
      confidence = 0.7
      suggestedModules.push("facts")
      entities.push(...this.extractFactEntities(input))
    }
    // Coding detection
    else if (this.isCodingQuery(lowercaseInput)) {
      intent = "coding"
      confidence = 0.8
      suggestedModules.push("coding")
      entities.push(...this.extractCodingEntities(input))
    }
    // Philosophy detection
    else if (this.isPhilosophyQuery(lowercaseInput)) {
      intent = "philosophy"
      confidence = 0.7
      suggestedModules.push("philosophy")
      entities.push(...this.extractPhilosophyEntities(input))
    }
    // User info detection
    else if (this.isUserInfoQuery(lowercaseInput)) {
      intent = "user-info"
      confidence = 0.9
      suggestedModules.push("user-info")
      entities.push(...this.extractUserEntities(input))
    }

    // Default fallback
    if (suggestedModules.length === 0) {
      suggestedModules.push("vocabulary", "facts")
    }

    return {
      intent,
      confidence,
      entities,
      context: { originalInput: input, timestamp: Date.now() },
      suggestedModules,
    }
  }

  private isMathQuery(input: string): boolean {
    return /\d+\s*[+\-*/×÷]\s*\d+|calculate|math|multiply|divide|add|subtract/.test(input)
  }

  private isVocabularyQuery(input: string): boolean {
    return /define|meaning|what is|etymology|synonym|antonym|pronunciation/.test(input)
  }

  private isFactsQuery(input: string): boolean {
    return /who is|what is|when did|where is|tell me about|fact|information/.test(input)
  }

  private isCodingQuery(input: string): boolean {
    return /code|function|programming|javascript|python|html|css|algorithm/.test(input)
  }

  private isPhilosophyQuery(input: string): boolean {
    return /philosophy|consciousness|meaning of life|ethics|morality|existence/.test(input)
  }

  private isUserInfoQuery(input: string): boolean {
    return /my name|i am|remember|personal|preference/.test(input)
  }

  private extractMathEntities(input: string): string[] {
    const entities = []
    const numbers = input.match(/\d+/g)
    if (numbers) entities.push(...numbers)

    const operations = input.match(/[+\-*/×÷]/g)
    if (operations) entities.push(...operations)

    return entities
  }

  private extractVocabularyEntities(input: string): string[] {
    const defineMatch = input.match(/define\s+(\w+)/i)
    if (defineMatch) return [defineMatch[1]]

    const whatIsMatch = input.match(/what\s+is\s+(\w+)/i)
    if (whatIsMatch) return [whatIsMatch[1]]

    return []
  }

  private extractFactEntities(input: string): string[] {
    const entities = []
    const whoMatch = input.match(/who\s+is\s+([^?]+)/i)
    if (whoMatch) entities.push(whoMatch[1].trim())

    const whatMatch = input.match(/what\s+is\s+([^?]+)/i)
    if (whatMatch) entities.push(whatMatch[1].trim())

    return entities
  }

  private extractCodingEntities(input: string): string[] {
    const languages = input.match(/javascript|python|html|css|java|c\+\+|php|ruby/gi)
    return languages || []
  }

  private extractPhilosophyEntities(input: string): string[] {
    const concepts = input.match(/consciousness|existence|reality|truth|knowledge|ethics|morality/gi)
    return concepts || []
  }

  private extractUserEntities(input: string): string[] {
    const nameMatch = input.match(/my name is (\w+)/i)
    if (nameMatch) return [nameMatch[1]]

    const iAmMatch = input.match(/i am (\w+)/i)
    if (iAmMatch) return [iAmMatch[1]]

    return []
  }

  getStats() {
    return {
      initialized: this.initialized,
      totalReasoningChains: this.reasoningHistory.length,
    }
  }
}

export const reasoningEngine = new ReasoningEngine()
