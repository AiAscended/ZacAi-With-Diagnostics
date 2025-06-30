import type { ReasoningChain, ReasoningStep } from "@/types/engines"
import { generateId } from "@/utils/helpers"

export class ReasoningEngine {
  private chains: Map<string, ReasoningChain> = new Map()
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return
    console.log("Initializing Reasoning Engine...")
    this.initialized = true
    console.log("Reasoning Engine initialized successfully")
  }

  async createReasoningChain(premises: string[], goal: string, context?: any): Promise<ReasoningChain> {
    const chainId = generateId()
    const steps: ReasoningStep[] = []

    // Add premises as initial steps
    premises.forEach((premise, index) => {
      steps.push({
        id: `premise_${index}`,
        type: "premise",
        content: premise,
        confidence: 0.9,
        dependencies: [],
      })
    })

    // Add reasoning steps
    const inferences = await this.generateInferences(premises, goal, context)
    inferences.forEach((inference, index) => {
      steps.push({
        id: `inference_${index}`,
        type: "inference",
        content: inference.content,
        confidence: inference.confidence,
        dependencies: inference.dependencies,
      })
    })

    // Add conclusion
    const conclusion = await this.generateConclusion(steps, goal)
    steps.push({
      id: "conclusion",
      type: "conclusion",
      content: conclusion.content,
      confidence: conclusion.confidence,
      dependencies: steps.map((s) => s.id),
    })

    const chain: ReasoningChain = {
      id: chainId,
      steps,
      conclusion: conclusion.content,
      confidence: this.calculateChainConfidence(steps),
      sources: this.extractSources(steps, context),
    }

    this.chains.set(chainId, chain)
    return chain
  }

  private async generateInferences(
    premises: string[],
    goal: string,
    context?: any,
  ): Promise<Array<{ content: string; confidence: number; dependencies: string[] }>> {
    const inferences = []

    // Simple logical inference patterns
    if (premises.length >= 2) {
      // Modus ponens: If A then B, A, therefore B
      const conditionalPremise = premises.find((p) => p.includes("if") && p.includes("then"))
      const factualPremise = premises.find((p) => !p.includes("if") && !p.includes("then"))

      if (conditionalPremise && factualPremise) {
        inferences.push({
          content: `Based on the conditional statement and the given fact, we can infer a logical conclusion`,
          confidence: 0.8,
          dependencies: ["premise_0", "premise_1"],
        })
      }
    }

    // Pattern matching inference
    if (context && context.patterns) {
      inferences.push({
        content: `Pattern analysis suggests additional relationships between the given premises`,
        confidence: 0.7,
        dependencies: premises.map((_, i) => `premise_${i}`),
      })
    }

    // Causal reasoning
    const causalWords = ["because", "since", "due to", "caused by", "results in"]
    if (premises.some((p) => causalWords.some((word) => p.toLowerCase().includes(word)))) {
      inferences.push({
        content: `Causal relationships identified in the premises suggest additional implications`,
        confidence: 0.75,
        dependencies: premises.map((_, i) => `premise_${i}`),
      })
    }

    return inferences
  }

  private async generateConclusion(
    steps: ReasoningStep[],
    goal: string,
  ): Promise<{ content: string; confidence: number }> {
    const premises = steps.filter((s) => s.type === "premise")
    const inferences = steps.filter((s) => s.type === "inference")

    let conclusionContent = ""
    let confidence = 0

    if (inferences.length > 0) {
      conclusionContent = `Based on the premises and logical inferences, ${goal.toLowerCase()}`
      confidence = inferences.reduce((sum, inf) => sum + inf.confidence, 0) / inferences.length
    } else {
      conclusionContent = `Based on the available premises, ${goal.toLowerCase()}`
      confidence = premises.reduce((sum, prem) => sum + prem.confidence, 0) / premises.length
    }

    return {
      content: conclusionContent,
      confidence: Math.min(0.95, confidence),
    }
  }

  private calculateChainConfidence(steps: ReasoningStep[]): number {
    if (steps.length === 0) return 0

    const totalConfidence = steps.reduce((sum, step) => sum + step.confidence, 0)
    const averageConfidence = totalConfidence / steps.length

    // Reduce confidence for longer chains (more uncertainty)
    const lengthPenalty = Math.max(0.1, 1 - steps.length * 0.05)

    return Math.min(0.95, averageConfidence * lengthPenalty)
  }

  private extractSources(steps: ReasoningStep[], context?: any): string[] {
    const sources = ["reasoning-engine"]

    if (context && context.sources) {
      sources.push(...context.sources)
    }

    return [...new Set(sources)]
  }

  getChain(chainId: string): ReasoningChain | undefined {
    return this.chains.get(chainId)
  }

  getAllChains(): ReasoningChain[] {
    return Array.from(this.chains.values())
  }

  getStats(): any {
    return {
      initialized: this.initialized,
      totalChains: this.chains.size,
      averageChainLength:
        this.chains.size > 0
          ? Array.from(this.chains.values()).reduce((sum, chain) => sum + chain.steps.length, 0) / this.chains.size
          : 0,
      averageConfidence:
        this.chains.size > 0
          ? Array.from(this.chains.values()).reduce((sum, chain) => sum + chain.confidence, 0) / this.chains.size
          : 0,
    }
  }
}

export const reasoningEngine = new ReasoningEngine()
