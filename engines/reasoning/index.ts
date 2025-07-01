import type { ReasoningEngineInterface, ReasoningChain, ReasoningStep, IntentAnalysis } from "@/types/engines"
import { generateId } from "@/utils/helpers"

export class ReasoningEngine implements ReasoningEngineInterface {
  private initialized = false
  private reasoningHistory: ReasoningChain[] = []

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("Initializing Reasoning Engine...")
    this.initialized = true
    console.log("Reasoning Engine initialized")
  }

  async createReasoningChain(input: string, context: any, moduleResponses: any[]): Promise<ReasoningChain> {
    const startTime = Date.now()
    const chainId = generateId()

    const steps: ReasoningStep[] = []

    // Step 1: Input Analysis
    steps.push({
      step: 1,
      description: "Analyze user input",
      input: input,
      output: {
        cleanedInput: input.trim(),
        wordCount: input.split(" ").length,
        hasQuestion: input.includes("?"),
        suggestedModules: this.suggestModules(input),
      },
      confidence: 0.9,
      reasoning: "Analyzed input structure and content",
      timestamp: Date.now(),
    })

    // Step 2: Context Integration
    steps.push({
      step: 2,
      description: "Integrate conversation context",
      input: context,
      output: {
        relevantHistory: context.recentMessages?.slice(-3) || [],
        detectedTopics: context.topics || [],
        userPreferences: context.entities || {},
      },
      confidence: 0.8,
      reasoning: "Integrated conversation history and user context",
      timestamp: Date.now(),
    })

    // Step 3: Module Response Analysis
    if (moduleResponses.length > 0) {
      steps.push({
        step: 3,
        description: "Analyze module responses",
        input: moduleResponses,
        output: {
          bestResponse: moduleResponses[0],
          alternativeResponses: moduleResponses.slice(1),
          averageConfidence: moduleResponses.reduce((sum, r) => sum + r.confidence, 0) / moduleResponses.length,
        },
        confidence: 0.85,
        reasoning: `Analyzed ${moduleResponses.length} module responses`,
        timestamp: Date.now(),
      })
    }

    // Calculate final output and confidence
    const totalConfidence = steps.reduce((sum, step) => sum + step.confidence, 0) / steps.length
    const finalOutput = moduleResponses.length > 0 ? moduleResponses[0].data : "No suitable response found"

    const chain: ReasoningChain = {
      id: chainId,
      input,
      steps,
      finalOutput,
      totalConfidence,
      processingTime: Date.now() - startTime,
      timestamp: startTime,
    }

    // Store in history
    this.reasoningHistory.push(chain)
    if (this.reasoningHistory.length > 100) {
      this.reasoningHistory = this.reasoningHistory.slice(-100)
    }

    return chain
  }

  async analyzeIntent(input: string): Promise<IntentAnalysis> {
    const lowercaseInput = input.toLowerCase()

    let intent = "general"
    let confidence = 0.5
    const suggestedModules: string[] = []

    // Intent classification logic
    if (lowercaseInput.includes("define") || lowercaseInput.includes("meaning")) {
      intent = "definition"
      confidence = 0.8
      suggestedModules.push("vocabulary")
    } else if (lowercaseInput.match(/\d+|\+|-|\*|\/|calculate/)) {
      intent = "calculation"
      confidence = 0.9
      suggestedModules.push("mathematics")
    } else if (lowercaseInput.includes("code") || lowercaseInput.includes("program")) {
      intent = "coding"
      confidence = 0.8
      suggestedModules.push("coding")
    } else if (lowercaseInput.includes("fact") || lowercaseInput.includes("information")) {
      intent = "factual"
      confidence = 0.7
      suggestedModules.push("facts")
    }

    return {
      intent,
      confidence,
      entities: [],
      context: {},
      suggestedModules,
    }
  }

  private suggestModules(input: string): string[] {
    const modules: string[] = []
    const lowercaseInput = input.toLowerCase()

    if (lowercaseInput.includes("define") || lowercaseInput.includes("word")) {
      modules.push("vocabulary")
    }
    if (lowercaseInput.match(/\d+|\+|-|\*|\/|math|calculate/)) {
      modules.push("mathematics")
    }
    if (lowercaseInput.includes("code") || lowercaseInput.includes("program")) {
      modules.push("coding")
    }
    if (lowercaseInput.includes("fact") || lowercaseInput.includes("tell me about")) {
      modules.push("facts")
    }
    if (lowercaseInput.includes("philosophy") || lowercaseInput.includes("meaning of life")) {
      modules.push("philosophy")
    }

    return modules.length > 0 ? modules : ["facts"]
  }

  getStats(): any {
    return {
      initialized: this.initialized,
      totalChains: this.reasoningHistory.length,
      averageProcessingTime:
        this.reasoningHistory.length > 0
          ? this.reasoningHistory.reduce((sum, chain) => sum + chain.processingTime, 0) / this.reasoningHistory.length
          : 0,
      averageConfidence:
        this.reasoningHistory.length > 0
          ? this.reasoningHistory.reduce((sum, chain) => sum + chain.totalConfidence, 0) / this.reasoningHistory.length
          : 0,
    }
  }
}

export const reasoningEngine = new ReasoningEngine()
