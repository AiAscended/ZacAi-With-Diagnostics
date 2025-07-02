import type { IntentAnalysis, ReasoningChain, ReasoningStep } from "@/types/global"

export class ReasoningEngine {
  private initialized = false
  private reasoningHistory: ReasoningChain[] = []

  async initialize(): Promise<void> {
    this.initialized = true
    console.log("✅ Reasoning Engine initialized")
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

  async synthesize(input: string, analysis: IntentAnalysis, moduleResponses: any[]): Promise<any> {
    if (moduleResponses.length === 0) {
      return {
        response: "I'm not sure how to help with that. Could you please rephrase your question?",
        confidence: 0.1,
        sources: [],
        reasoning: ["No relevant modules found a suitable response"],
      }
    }

    // Sort responses by confidence
    const sortedResponses = moduleResponses.filter((r) => r && r.success).sort((a, b) => b.confidence - a.confidence)

    if (sortedResponses.length === 0) {
      return {
        response: "I couldn't find a reliable answer to your question. Please try rephrasing it.",
        confidence: 0.2,
        sources: [],
        reasoning: ["All module responses had low confidence or failed"],
      }
    }

    const bestResponse = sortedResponses[0]
    const avgConfidence = sortedResponses.reduce((sum, r) => sum + r.confidence, 0) / sortedResponses.length

    let finalResponse = ""
    if (typeof bestResponse.data === "string") {
      finalResponse = bestResponse.data
    } else if (bestResponse.data && typeof bestResponse.data === "object") {
      if (bestResponse.data.answer) {
        finalResponse = bestResponse.data.answer
      } else if (bestResponse.data.definition) {
        finalResponse = bestResponse.data.definition
      } else if (bestResponse.data.result !== undefined) {
        finalResponse = bestResponse.data.result.toString()
      } else {
        finalResponse = JSON.stringify(bestResponse.data, null, 2)
      }
    }

    const reasoning = [
      `Intent analyzed as: ${analysis.intent} (confidence: ${analysis.confidence})`,
      `Best response from: ${bestResponse.source} (confidence: ${bestResponse.confidence})`,
      `Considered ${sortedResponses.length} module responses`,
    ]

    return {
      response: finalResponse || "I found some information but couldn't format it properly.",
      confidence: avgConfidence,
      sources: sortedResponses.map((r) => r.source),
      reasoning,
      mathAnalysis: bestResponse.source === "mathematics" ? bestResponse.metadata : undefined,
    }
  }

  async createReasoningChain(input: string, context: any, moduleResponses: any[]): Promise<ReasoningChain> {
    const steps: ReasoningStep[] = []

    // Step 1: Input analysis
    steps.push({
      step: 1,
      reasoning: "Analyzing user input for intent and entities",
      confidence: 0.8,
      output: { intent: "analysis", entities: this.extractEntities(input) },
    })

    // Step 2: Module selection
    steps.push({
      step: 2,
      reasoning: "Selecting relevant knowledge modules",
      confidence: 0.9,
      output: { suggestedModules: this.determineModules(input) },
    })

    // Step 3: Response synthesis
    if (moduleResponses.length > 0) {
      steps.push({
        step: 3,
        reasoning: "Synthesizing responses from knowledge modules",
        confidence: 0.7,
        output: { responseCount: moduleResponses.length },
      })
    }

    const totalConfidence = steps.reduce((sum, step) => sum + step.confidence, 0) / steps.length

    const chain: ReasoningChain = {
      input,
      steps,
      finalOutput: moduleResponses.length > 0 ? moduleResponses[0] : null,
      totalConfidence,
    }

    this.reasoningHistory.push(chain)
    return chain
  }

  private isMathQuery(input: string): boolean {
    return /\d+\s*[+\-*/×÷]\s*\d+|calculate|math|multiply|divide|add|subtract|tesla|vortex|369/.test(input)
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

  private extractEntities(input: string): string[] {
    return input
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 5)
  }

  private determineModules(input: string): string[] {
    const modules = []
    const lower = input.toLowerCase()

    if (this.isMathQuery(lower)) modules.push("mathematics")
    if (this.isVocabularyQuery(lower)) modules.push("vocabulary")
    if (this.isFactsQuery(lower)) modules.push("facts")
    if (this.isCodingQuery(lower)) modules.push("coding")
    if (this.isPhilosophyQuery(lower)) modules.push("philosophy")
    if (this.isUserInfoQuery(lower)) modules.push("user-info")

    return modules.length > 0 ? modules : ["vocabulary", "facts"]
  }

  getStats() {
    return {
      initialized: this.initialized,
      totalReasoningChains: this.reasoningHistory.length,
      averageSteps:
        this.reasoningHistory.length > 0
          ? this.reasoningHistory.reduce((sum, chain) => sum + chain.steps.length, 0) / this.reasoningHistory.length
          : 0,
      averageConfidence:
        this.reasoningHistory.length > 0
          ? this.reasoningHistory.reduce((sum, chain) => sum + chain.totalConfidence, 0) / this.reasoningHistory.length
          : 0,
    }
  }
}

export const reasoningEngine = new ReasoningEngine()
