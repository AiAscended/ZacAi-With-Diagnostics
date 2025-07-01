import type { ReasoningEngine, ReasoningChain, ReasoningStep } from "@/types/engines"
import { generateId } from "@/utils/helpers"

export class ReasoningEngineImpl implements ReasoningEngine {
  private initialized = false
  private reasoningHistory: ReasoningChain[] = []

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🧠 Initializing Reasoning Engine...")
    this.initialized = true
    console.log("✅ Reasoning Engine initialized")
  }

  async createReasoningChain(input: string, context: any, moduleResponses: any[]): Promise<ReasoningChain> {
    const chainId = generateId()
    const steps: ReasoningStep[] = []

    // Step 1: Input Analysis
    steps.push({
      step: 1,
      reasoning: "Analyzing user input for intent, entities, and context",
      confidence: 0.9,
      output: {
        intent: this.analyzeIntent(input),
        entities: this.extractEntities(input),
        suggestedModules: this.suggestModules(input),
      },
      timestamp: Date.now(),
    })

    // Step 2: Context Integration
    steps.push({
      step: 2,
      reasoning: "Integrating conversation context and user history",
      confidence: 0.8,
      output: {
        contextRelevance: this.assessContextRelevance(input, context),
        historicalPatterns: this.findHistoricalPatterns(input, context),
      },
      timestamp: Date.now(),
    })

    // Step 3: Module Response Analysis
    if (moduleResponses.length > 0) {
      steps.push({
        step: 3,
        reasoning: "Analyzing and ranking module responses",
        confidence: 0.85,
        output: {
          responseCount: moduleResponses.length,
          bestResponse: this.selectBestResponse(moduleResponses),
          confidenceScores: moduleResponses.map((r) => r.confidence),
        },
        timestamp: Date.now(),
      })
    }

    // Step 4: Final Synthesis
    const finalOutput = this.synthesizeResponse(input, context, moduleResponses, steps)
    steps.push({
      step: steps.length + 1,
      reasoning: "Synthesizing final response with confidence assessment",
      confidence: finalOutput.confidence,
      output: finalOutput,
      timestamp: Date.now(),
    })

    const chain: ReasoningChain = {
      id: chainId,
      input,
      steps,
      finalOutput,
      totalConfidence: this.calculateTotalConfidence(steps),
      timestamp: Date.now(),
    }

    // Store in history (keep last 100)
    this.reasoningHistory.push(chain)
    if (this.reasoningHistory.length > 100) {
      this.reasoningHistory = this.reasoningHistory.slice(-100)
    }

    return chain
  }

  private analyzeIntent(input: string): string {
    const lowercaseInput = input.toLowerCase()

    if (lowercaseInput.includes("define") || lowercaseInput.includes("meaning")) {
      return "definition"
    }
    if (lowercaseInput.match(/\d+|\+|-|\*|\/|calculate|solve/)) {
      return "calculation"
    }
    if (lowercaseInput.includes("tell me about") || lowercaseInput.includes("information")) {
      return "information"
    }
    if (lowercaseInput.includes("code") || lowercaseInput.includes("program")) {
      return "coding"
    }
    if (lowercaseInput.includes("philosophy") || lowercaseInput.includes("ethics")) {
      return "philosophical"
    }

    return "general"
  }

  private extractEntities(input: string): string[] {
    // Simple entity extraction - in a real system this would be more sophisticated
    const entities: string[] = []
    const words = input.split(/\s+/)

    // Look for capitalized words (potential proper nouns)
    for (const word of words) {
      if (word.length > 2 && word[0] === word[0].toUpperCase()) {
        entities.push(word)
      }
    }

    return entities.slice(0, 5) // Limit to 5 entities
  }

  private suggestModules(input: string): string[] {
    const modules: string[] = []
    const lowercaseInput = input.toLowerCase()

    if (lowercaseInput.includes("define") || lowercaseInput.includes("meaning")) {
      modules.push("vocabulary")
    }
    if (lowercaseInput.match(/\d+|\+|-|\*|\/|calculate|solve|math/)) {
      modules.push("mathematics")
    }
    if (
      lowercaseInput.includes("tell me about") ||
      lowercaseInput.includes("information") ||
      lowercaseInput.includes("fact")
    ) {
      modules.push("facts")
    }
    if (lowercaseInput.includes("code") || lowercaseInput.includes("program") || lowercaseInput.includes("function")) {
      modules.push("coding")
    }
    if (
      lowercaseInput.includes("philosophy") ||
      lowercaseInput.includes("ethics") ||
      lowercaseInput.includes("consciousness")
    ) {
      modules.push("philosophy")
    }
    if (lowercaseInput.includes("my name") || lowercaseInput.includes("remember") || lowercaseInput.includes("i am")) {
      modules.push("user-info")
    }

    // If no specific modules, suggest facts as default
    if (modules.length === 0) {
      modules.push("facts")
    }

    return modules
  }

  private assessContextRelevance(input: string, context: any): number {
    if (!context || !context.recentMessages) return 0.5

    // Simple relevance scoring based on topic continuity
    const inputWords = new Set(input.toLowerCase().split(/\s+/))
    let relevanceScore = 0

    for (const message of context.recentMessages.slice(-3)) {
      const messageWords = new Set(message.content.toLowerCase().split(/\s+/))
      const intersection = new Set([...inputWords].filter((x) => messageWords.has(x)))
      relevanceScore += intersection.size / Math.max(inputWords.size, messageWords.size)
    }

    return Math.min(1, relevanceScore / 3)
  }

  private findHistoricalPatterns(input: string, context: any): string[] {
    const patterns: string[] = []

    if (context && context.topics) {
      patterns.push(`Recent topics: ${context.topics.join(", ")}`)
    }

    if (context && context.messageCount) {
      patterns.push(`Session activity: ${context.messageCount} messages`)
    }

    return patterns
  }

  private selectBestResponse(moduleResponses: any[]): any {
    if (moduleResponses.length === 0) return null

    // Sort by confidence and return the best one
    return moduleResponses.sort((a, b) => b.confidence - a.confidence)[0]
  }

  private synthesizeResponse(input: string, context: any, moduleResponses: any[], steps: ReasoningStep[]): any {
    const bestResponse = this.selectBestResponse(moduleResponses)

    if (bestResponse) {
      return {
        response: bestResponse.data,
        confidence: bestResponse.confidence,
        source: bestResponse.source,
        reasoning: steps.map((s) => s.reasoning),
      }
    }

    return {
      response: "I'm not sure how to help with that. Could you please rephrase your question?",
      confidence: 0.1,
      source: "reasoning-engine",
      reasoning: ["No suitable module responses found"],
    }
  }

  private calculateTotalConfidence(steps: ReasoningStep[]): number {
    if (steps.length === 0) return 0
    return steps.reduce((sum, step) => sum + step.confidence, 0) / steps.length
  }

  getStats(): any {
    return {
      initialized: this.initialized,
      totalChains: this.reasoningHistory.length,
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

export const reasoningEngine = new ReasoningEngineImpl()
