// Reasoning engine for logical analysis and decision making
import type { ReasoningChain, ReasoningStep, ModuleResponse } from "@/types/global"
import { generateId, calculateConfidence } from "@/utils/helpers"

export class ReasoningEngine {
  private initialized = false
  private reasoningChains: Map<string, ReasoningChain> = new Map()
  private stats = {
    totalChains: 0,
    averageSteps: 0,
    averageConfidence: 0,
    successRate: 0,
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("Initializing Reasoning Engine...")
    this.initialized = true
    console.log("Reasoning Engine initialized successfully")
  }

  async createReasoningChain(input: string, context: any, moduleResponses: ModuleResponse[]): Promise<ReasoningChain> {
    const chainId = generateId()
    const startTime = Date.now()

    const steps: ReasoningStep[] = []

    // Step 1: Input Analysis
    steps.push({
      step: 1,
      reasoning: "Analyzing user input for intent, entities, and context",
      input: { text: input, context },
      output: this.analyzeInput(input, context),
      confidence: 0.8,
      timestamp: Date.now(),
    })

    // Step 2: Module Selection
    steps.push({
      step: 2,
      reasoning: "Determining which knowledge modules to consult",
      input: steps[0].output,
      output: this.selectModules(input, context),
      confidence: 0.7,
      timestamp: Date.now(),
    })

    // Step 3: Response Synthesis
    if (moduleResponses.length > 0) {
      steps.push({
        step: 3,
        reasoning: "Synthesizing responses from knowledge modules",
        input: moduleResponses,
        output: this.synthesizeResponses(moduleResponses),
        confidence: calculateConfidence(moduleResponses.map((r) => r.confidence)),
        timestamp: Date.now(),
      })
    }

    // Step 4: Confidence Assessment
    steps.push({
      step: steps.length + 1,
      reasoning: "Assessing overall confidence and quality of response",
      input: steps[steps.length - 1]?.output || steps[0].output,
      output: this.assessConfidence(steps, moduleResponses),
      confidence: 0.9,
      timestamp: Date.now(),
    })

    const totalConfidence = calculateConfidence(steps.map((s) => s.confidence))
    const processingTime = Date.now() - startTime

    const chain: ReasoningChain = {
      id: chainId,
      input,
      steps,
      finalOutput: steps[steps.length - 1].output,
      totalConfidence,
      processingTime,
    }

    this.reasoningChains.set(chainId, chain)
    this.updateStats(chain)

    return chain
  }

  private analyzeInput(input: string, context: any): any {
    const analysis = {
      intent: this.determineIntent(input),
      entities: this.extractEntities(input),
      complexity: this.assessComplexity(input),
      contextRelevance: this.assessContextRelevance(input, context),
      suggestedModules: [] as string[],
    }

    // Determine suggested modules based on analysis
    if (analysis.intent === "definition" || input.toLowerCase().includes("define")) {
      analysis.suggestedModules.push("vocabulary", "facts")
    }
    if (analysis.intent === "calculation" || /\d+|\+|-|\*|\//.test(input)) {
      analysis.suggestedModules.push("mathematics")
    }
    if (analysis.intent === "coding" || input.toLowerCase().includes("code")) {
      analysis.suggestedModules.push("coding")
    }
    if (analysis.intent === "philosophical" || input.toLowerCase().includes("philosophy")) {
      analysis.suggestedModules.push("philosophy")
    }
    if (analysis.suggestedModules.length === 0) {
      analysis.suggestedModules.push("facts") // Default fallback
    }

    return analysis
  }

  private determineIntent(input: string): string {
    const lower = input.toLowerCase()

    if (lower.includes("define") || lower.includes("what is") || lower.includes("meaning")) {
      return "definition"
    }
    if (lower.includes("calculate") || lower.includes("solve") || /\d+[+\-*/]/.test(input)) {
      return "calculation"
    }
    if (lower.includes("code") || lower.includes("program") || lower.includes("function")) {
      return "coding"
    }
    if (lower.includes("philosophy") || lower.includes("ethics") || lower.includes("moral")) {
      return "philosophical"
    }
    if (lower.includes("fact") || lower.includes("information") || lower.includes("tell me about")) {
      return "factual"
    }

    return "general"
  }

  private extractEntities(input: string): string[] {
    // Simple entity extraction - in a real system this would be more sophisticated
    const entities: string[] = []
    const words = input.split(/\s+/)

    // Look for capitalized words (potential proper nouns)
    words.forEach((word) => {
      if (word.length > 2 && word[0] === word[0].toUpperCase()) {
        entities.push(word)
      }
    })

    // Look for numbers
    const numbers = input.match(/\d+/g)
    if (numbers) {
      entities.push(...numbers)
    }

    return entities
  }

  private assessComplexity(input: string): number {
    let complexity = 0

    // Length factor
    complexity += Math.min(input.length / 100, 1) * 0.3

    // Word count factor
    const wordCount = input.split(/\s+/).length
    complexity += Math.min(wordCount / 20, 1) * 0.3

    // Technical terms factor
    const technicalTerms = ["algorithm", "quantum", "philosophy", "mathematics", "programming"]
    const hasTechnicalTerms = technicalTerms.some((term) => input.toLowerCase().includes(term))
    if (hasTechnicalTerms) complexity += 0.4

    return Math.min(complexity, 1)
  }

  private assessContextRelevance(input: string, context: any): number {
    if (!context || !context.topics) return 0.5

    const inputWords = new Set(input.toLowerCase().split(/\s+/))
    const contextTopics = new Set(context.topics)

    const intersection = new Set([...inputWords].filter((x) => contextTopics.has(x)))
    const union = new Set([...inputWords, ...contextTopics])

    return union.size > 0 ? intersection.size / union.size : 0.5
  }

  private selectModules(input: string, context: any): any {
    const analysis = this.analyzeInput(input, context)
    return {
      selectedModules: analysis.suggestedModules,
      reasoning: `Selected modules based on intent: ${analysis.intent}`,
      confidence: 0.8,
    }
  }

  private synthesizeResponses(responses: ModuleResponse[]): any {
    if (responses.length === 0) {
      return {
        synthesis: "No module responses to synthesize",
        confidence: 0,
        sources: [],
      }
    }

    // Sort by confidence
    const sortedResponses = responses.sort((a, b) => b.confidence - a.confidence)
    const bestResponse = sortedResponses[0]

    return {
      synthesis: bestResponse.data,
      confidence: bestResponse.confidence,
      sources: responses.map((r) => r.source),
      alternativeResponses: sortedResponses.slice(1, 3).map((r) => ({
        source: r.source,
        confidence: r.confidence,
        preview: typeof r.data === "string" ? r.data.substring(0, 100) : "Complex data",
      })),
    }
  }

  private assessConfidence(steps: ReasoningStep[], moduleResponses: ModuleResponse[]): any {
    const stepConfidences = steps.map((s) => s.confidence)
    const moduleConfidences = moduleResponses.map((r) => r.confidence)

    const overallConfidence = calculateConfidence([...stepConfidences, ...moduleConfidences])

    return {
      overallConfidence,
      stepConfidences,
      moduleConfidences,
      qualityAssessment: this.assessQuality(overallConfidence),
      recommendations: this.generateRecommendations(overallConfidence, moduleResponses),
    }
  }

  private assessQuality(confidence: number): string {
    if (confidence > 0.8) return "High quality response with strong confidence"
    if (confidence > 0.6) return "Good quality response with moderate confidence"
    if (confidence > 0.4) return "Acceptable response with some uncertainty"
    return "Low confidence response, may need clarification"
  }

  private generateRecommendations(confidence: number, responses: ModuleResponse[]): string[] {
    const recommendations: string[] = []

    if (confidence < 0.5) {
      recommendations.push("Consider asking for clarification or rephrasing the question")
    }

    if (responses.length === 0) {
      recommendations.push("Try asking about a different topic or provide more context")
    }

    if (responses.length === 1) {
      recommendations.push("Multiple perspectives might be helpful for this topic")
    }

    return recommendations
  }

  private updateStats(chain: ReasoningChain): void {
    this.stats.totalChains++
    this.stats.averageSteps =
      (this.stats.averageSteps * (this.stats.totalChains - 1) + chain.steps.length) / this.stats.totalChains
    this.stats.averageConfidence =
      (this.stats.averageConfidence * (this.stats.totalChains - 1) + chain.totalConfidence) / this.stats.totalChains
    this.stats.successRate =
      chain.totalConfidence > 0.5
        ? (this.stats.successRate * (this.stats.totalChains - 1) + 1) / this.stats.totalChains
        : (this.stats.successRate * (this.stats.totalChains - 1)) / this.stats.totalChains
  }

  getStats(): any {
    return {
      ...this.stats,
      initialized: this.initialized,
      activeChains: this.reasoningChains.size,
    }
  }

  getReasoningChain(id: string): ReasoningChain | undefined {
    return this.reasoningChains.get(id)
  }

  clearOldChains(): void {
    const cutoff = Date.now() - 3600000 // 1 hour
    for (const [id, chain] of this.reasoningChains.entries()) {
      if (chain.steps[0].timestamp < cutoff) {
        this.reasoningChains.delete(id)
      }
    }
  }
}

export const reasoningEngine = new ReasoningEngine()
