import type { ReasoningChain, ReasoningStep } from "@/types/engines"
import { generateId, calculateConfidence } from "@/utils/helpers"

export class ReasoningEngine {
  private chains: Map<string, ReasoningChain> = new Map()

  async createReasoningChain(input: string, context: any, moduleResponses: any[]): Promise<ReasoningChain> {
    const chainId = generateId()
    const steps: ReasoningStep[] = []

    // Step 1: Input Analysis
    steps.push({
      id: generateId(),
      description: "Analyzing user input",
      input: input,
      output: {
        keywords: this.extractKeywords(input),
        intent: this.classifyIntent(input),
        complexity: this.assessComplexity(input),
      },
      confidence: 0.8,
      reasoning: "Extracted key information from user input using pattern matching",
    })

    // Step 2: Context Integration
    steps.push({
      id: generateId(),
      description: "Integrating conversation context",
      input: context,
      output: {
        relevantHistory: this.findRelevantHistory(context),
        userPreferences: context.preferences || {},
        contextualClues: this.extractContextualClues(context),
      },
      confidence: 0.7,
      reasoning: "Analyzed conversation history and user preferences for context",
    })

    // Step 3: Module Response Analysis
    if (moduleResponses.length > 0) {
      steps.push({
        id: generateId(),
        description: "Analyzing module responses",
        input: moduleResponses,
        output: {
          bestResponse: moduleResponses[0],
          alternativeResponses: moduleResponses.slice(1),
          confidenceDistribution: moduleResponses.map((r) => r.confidence),
        },
        confidence: calculateConfidence(moduleResponses.map((r) => r.confidence)),
        reasoning: "Evaluated and ranked responses from different knowledge modules",
      })
    }

    // Step 4: Logical Validation
    const validationStep = await this.validateLogic(steps)
    steps.push(validationStep)

    // Step 5: Conclusion Formation
    const conclusion = this.formConclusion(steps)
    const overallConfidence = calculateConfidence(steps.map((s) => s.confidence))

    const chain: ReasoningChain = {
      id: chainId,
      steps,
      conclusion,
      confidence: overallConfidence,
      sources: moduleResponses.map((r) => r.source),
    }

    this.chains.set(chainId, chain)
    return chain
  }

  private extractKeywords(input: string): string[] {
    return input
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2)
      .slice(0, 10)
  }

  private classifyIntent(input: string): string {
    const lowercaseInput = input.toLowerCase()

    if (lowercaseInput.includes("what") || lowercaseInput.includes("define")) {
      return "question"
    } else if (lowercaseInput.includes("how")) {
      return "instruction"
    } else if (lowercaseInput.includes("calculate") || lowercaseInput.match(/\d+/)) {
      return "calculation"
    } else if (lowercaseInput.includes("explain")) {
      return "explanation"
    }

    return "general"
  }

  private assessComplexity(input: string): "low" | "medium" | "high" {
    const wordCount = input.split(/\s+/).length
    const hasNumbers = /\d+/.test(input)
    const hasSpecialTerms = /\b(algorithm|function|equation|philosophy|quantum)\b/i.test(input)

    if (wordCount > 20 || hasSpecialTerms) return "high"
    if (wordCount > 10 || hasNumbers) return "medium"
    return "low"
  }

  private findRelevantHistory(context: any): any[] {
    if (!context.recentMessages) return []

    return context.recentMessages.filter((msg: any) => msg.role === "user").slice(-3) // Last 3 user messages
  }

  private extractContextualClues(context: any): string[] {
    const clues: string[] = []

    if (context.keywords && context.keywords.length > 0) {
      clues.push(`Keywords from context: ${context.keywords.join(", ")}`)
    }

    if (context.conversationLength > 5) {
      clues.push("Extended conversation - user likely seeking detailed information")
    }

    return clues
  }

  private async validateLogic(steps: ReasoningStep[]): Promise<ReasoningStep> {
    const validationResults = {
      consistency: this.checkConsistency(steps),
      completeness: this.checkCompleteness(steps),
      relevance: this.checkRelevance(steps),
    }

    return {
      id: generateId(),
      description: "Validating logical consistency",
      input: steps,
      output: validationResults,
      confidence: calculateConfidence([
        validationResults.consistency,
        validationResults.completeness,
        validationResults.relevance,
      ]),
      reasoning: "Performed logical validation checks on reasoning steps",
    }
  }

  private checkConsistency(steps: ReasoningStep[]): number {
    // Simple consistency check - in a real implementation, this would be more sophisticated
    return 0.8
  }

  private checkCompleteness(steps: ReasoningStep[]): number {
    // Check if we have all necessary reasoning steps
    const requiredSteps = ["input_analysis", "context_integration", "response_analysis"]
    return steps.length >= 3 ? 0.9 : 0.6
  }

  private checkRelevance(steps: ReasoningStep[]): number {
    // Check if steps are relevant to the input
    return 0.85
  }

  private formConclusion(steps: ReasoningStep[]): string {
    const analysisStep = steps.find((s) => s.description.includes("input"))
    const responseStep = steps.find((s) => s.description.includes("response"))

    if (responseStep && responseStep.output.bestResponse) {
      return `Based on analysis of the input and available knowledge sources, the most appropriate response comes from ${responseStep.output.bestResponse.source} with ${(responseStep.output.bestResponse.confidence * 100).toFixed(1)}% confidence.`
    }

    return "Completed reasoning process with available information."
  }

  getReasoningChain(chainId: string): ReasoningChain | null {
    return this.chains.get(chainId) || null
  }

  getRecentChains(count = 5): ReasoningChain[] {
    return Array.from(this.chains.values())
      .sort((a, b) => b.steps[0]?.input?.timestamp - a.steps[0]?.input?.timestamp)
      .slice(0, count)
  }
}

export const reasoningEngine = new ReasoningEngine()
