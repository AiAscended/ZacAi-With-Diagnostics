import type { ReasoningChain, ReasoningStep, IntentAnalysis } from "@/types/global"
import { generateId } from "@/utils/helpers"

export class ReasoningEngine {
  private initialized = false
  private reasoningHistory: ReasoningChain[] = []

  async initialize(): Promise<void> {
    if (this.initialized) return
    console.log("Initializing Reasoning Engine...")
    this.initialized = true
  }

  async createReasoningChain(input: string, context: any, moduleResponses: any[]): Promise<ReasoningChain> {
    const startTime = Date.now()
    const chainId = generateId()

    const steps: ReasoningStep[] = []

    // Step 1: Input Analysis
    steps.push({
      step: 1,
      reasoning: "Analyzing user input for intent and entities",
      input: input,
      output: { intent: this.determineIntent(input), entities: this.extractEntities(input) },
      confidence: 0.8,
      timestamp: Date.now(),
    })

    // Step 2: Context Integration
    steps.push({
      step: 2,
      reasoning: "Integrating conversation context and history",
      input: context,
      output: { contextScore: this.calculateContextRelevance(input, context) },
      confidence: 0.7,
      timestamp: Date.now(),
    })

    // Step 3: Module Response Analysis
    if (moduleResponses.length > 0) {
      steps.push({
        step: 3,
        reasoning: "Analyzing and ranking module responses",
        input: moduleResponses,
        output: {
          bestResponse: moduleResponses[0],
          confidenceScores: moduleResponses.map((r) => r.confidence),
          suggestedModules: this.suggestModules(input),
        },
        confidence: 0.9,
        timestamp: Date.now(),
      })
    }

    // Step 4: Final Reasoning
    const finalOutput = this.synthesizeResponse(input, context, moduleResponses)
    steps.push({
      step: 4,
      reasoning: "Synthesizing final response with confidence assessment",
      input: { input, context, moduleResponses },
      output: finalOutput,
      confidence: this.calculateFinalConfidence(steps),
      timestamp: Date.now(),
    })

    const chain: ReasoningChain = {
      id: chainId,
      input,
      steps,
      finalOutput,
      totalConfidence: this.calculateFinalConfidence(steps),
      processingTime: Date.now() - startTime,
    }

    this.reasoningHistory.push(chain)
    if (this.reasoningHistory.length > 100) {
      this.reasoningHistory = this.reasoningHistory.slice(-100)
    }

    return chain
  }

  async analyzeIntent(input: string): Promise<IntentAnalysis> {
    const intent = this.determineIntent(input)
    const entities = this.extractEntities(input)
    const suggestedModules = this.suggestModules(input)

    return {
      intent,
      confidence: 0.8,
      entities,
      context: {},
      suggestedModules,
    }
  }

  private determineIntent(input: string): string {
    const lowercaseInput = input.toLowerCase()

    if (lowercaseInput.includes("define") || lowercaseInput.includes("meaning") || lowercaseInput.includes("what is")) {
      return "definition"
    }
    if (lowercaseInput.match(/\d+|\+|-|\*|\/|calculate|solve/)) {
      return "calculation"
    }
    if (lowercaseInput.includes("code") || lowercaseInput.includes("program") || lowercaseInput.includes("function")) {
      return "coding"
    }
    if (
      lowercaseInput.includes("fact") ||
      lowercaseInput.includes("information") ||
      lowercaseInput.includes("tell me about")
    ) {
      return "factual"
    }
    if (
      lowercaseInput.includes("philosophy") ||
      lowercaseInput.includes("ethics") ||
      lowercaseInput.includes("moral")
    ) {
      return "philosophical"
    }

    return "general"
  }

  private extractEntities(input: string): any[] {
    const entities: any[] = []

    // Simple entity extraction - numbers
    const numbers = input.match(/\d+/g)
    if (numbers) {
      entities.push(...numbers.map((num) => ({ type: "number", value: num })))
    }

    // Simple entity extraction - words that might be vocabulary
    const words = input.match(/\b[a-zA-Z]{4,}\b/g)
    if (words) {
      entities.push(...words.slice(0, 3).map((word) => ({ type: "word", value: word.toLowerCase() })))
    }

    return entities
  }

  private suggestModules(input: string): string[] {
    const suggestions: string[] = []
    const lowercaseInput = input.toLowerCase()

    if (lowercaseInput.includes("define") || lowercaseInput.includes("meaning")) {
      suggestions.push("vocabulary")
    }
    if (lowercaseInput.match(/\d+|\+|-|\*|\/|calculate|solve/)) {
      suggestions.push("mathematics")
    }
    if (lowercaseInput.includes("code") || lowercaseInput.includes("program")) {
      suggestions.push("coding")
    }
    if (lowercaseInput.includes("fact") || lowercaseInput.includes("information")) {
      suggestions.push("facts")
    }
    if (lowercaseInput.includes("philosophy") || lowercaseInput.includes("ethics")) {
      suggestions.push("philosophy")
    }

    // Default fallback
    if (suggestions.length === 0) {
      suggestions.push("facts", "vocabulary")
    }

    return suggestions
  }

  private calculateContextRelevance(input: string, context: any): number {
    if (!context || !context.recentMessages) return 0.5

    const inputWords = new Set(input.toLowerCase().split(/\s+/))
    let relevanceScore = 0
    let messageCount = 0

    for (const message of context.recentMessages) {
      const messageWords = new Set(message.content.toLowerCase().split(/\s+/))
      const intersection = new Set([...inputWords].filter((x) => messageWords.has(x)))
      const union = new Set([...inputWords, ...messageWords])

      if (union.size > 0) {
        relevanceScore += intersection.size / union.size
        messageCount++
      }
    }

    return messageCount > 0 ? relevanceScore / messageCount : 0.5
  }

  private synthesizeResponse(input: string, context: any, moduleResponses: any[]): any {
    if (moduleResponses.length === 0) {
      return {
        response: "I need more information to provide a helpful response.",
        confidence: 0.3,
        reasoning: "No module responses available",
      }
    }

    const bestResponse = moduleResponses.sort((a, b) => b.confidence - a.confidence)[0]

    return {
      response: bestResponse.data,
      confidence: bestResponse.confidence,
      reasoning: `Selected best response from ${bestResponse.source} module`,
      sources: moduleResponses.map((r) => r.source),
    }
  }

  private calculateFinalConfidence(steps: ReasoningStep[]): number {
    if (steps.length === 0) return 0
    const totalConfidence = steps.reduce((sum, step) => sum + step.confidence, 0)
    return totalConfidence / steps.length
  }

  getStats(): any {
    return {
      initialized: this.initialized,
      totalChains: this.reasoningHistory.length,
      averageProcessingTime: this.calculateAverageProcessingTime(),
      averageConfidence: this.calculateAverageConfidence(),
    }
  }

  private calculateAverageProcessingTime(): number {
    if (this.reasoningHistory.length === 0) return 0
    const totalTime = this.reasoningHistory.reduce((sum, chain) => sum + chain.processingTime, 0)
    return totalTime / this.reasoningHistory.length
  }

  private calculateAverageConfidence(): number {
    if (this.reasoningHistory.length === 0) return 0
    const totalConfidence = this.reasoningHistory.reduce((sum, chain) => sum + chain.totalConfidence, 0)
    return totalConfidence / this.reasoningHistory.length
  }
}

export const reasoningEngine = new ReasoningEngine()
