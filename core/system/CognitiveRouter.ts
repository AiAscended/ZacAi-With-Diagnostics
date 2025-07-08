import type { ThinkingEngine } from "../engines/ThinkingEngine"
import type { MathEngine } from "../engines/MathEngine"
import type { KnowledgeEngine } from "../engines/KnowledgeEngine"
import type { LanguageEngine } from "../engines/LanguageEngine"
import type { MemoryEngine } from "../engines/MemoryEngine"
import type { DiagnosticEngine } from "../engines/DiagnosticEngine"

export interface CognitiveRouterConfig {
  thinkingEngine: ThinkingEngine
  mathEngine: MathEngine
  knowledgeEngine: KnowledgeEngine
  languageEngine: LanguageEngine
  memoryEngine: MemoryEngine
  diagnosticEngine: DiagnosticEngine
}

export interface RoutingDecision {
  primaryEngine: string
  secondaryEngines: string[]
  confidence: number
  reasoning: string[]
}

export class CognitiveRouter {
  private engines: CognitiveRouterConfig
  private routingHistory: RoutingDecision[] = []

  constructor(engines: CognitiveRouterConfig) {
    this.engines = engines
  }

  public async initialize(): Promise<void> {
    console.log("🛤️ Cognitive Router initialized")
  }

  public async route(input: string, context: any): Promise<any> {
    console.log("🧭 Routing message through cognitive pathways...")

    // Analyze input to determine routing
    const routingDecision = this.analyzeInput(input, context)
    this.routingHistory.push(routingDecision)

    console.log(`🎯 Primary engine: ${routingDecision.primaryEngine}`)
    console.log(`🔗 Secondary engines: ${routingDecision.secondaryEngines.join(", ")}`)

    // Route to primary engine with thinking process
    const thinkingResult = await this.engines.thinkingEngine.processThought(input, context, routingDecision)

    // Process through selected engines
    let finalResult = thinkingResult

    switch (routingDecision.primaryEngine) {
      case "math":
        finalResult = await this.engines.mathEngine.process(input, thinkingResult)
        break
      case "knowledge":
        finalResult = await this.engines.knowledgeEngine.process(input, thinkingResult)
        break
      case "language":
        finalResult = await this.engines.languageEngine.process(input, thinkingResult)
        break
      case "memory":
        finalResult = await this.engines.memoryEngine.process(input, thinkingResult)
        break
      default:
        // Use thinking engine result as-is for conversational responses
        break
    }

    // Enhance with secondary engines if needed
    for (const engineName of routingDecision.secondaryEngines) {
      switch (engineName) {
        case "memory":
          finalResult = await this.engines.memoryEngine.enhance(finalResult)
          break
        case "language":
          finalResult = await this.engines.languageEngine.enhance(finalResult)
          break
        case "knowledge":
          finalResult = await this.engines.knowledgeEngine.enhance(finalResult)
          break
      }
    }

    return finalResult
  }

  private analyzeInput(input: string, context: any): RoutingDecision {
    const reasoning: string[] = []
    const inputLower = input.toLowerCase()

    reasoning.push(`🔍 Analyzing input: "${input}"`)

    // Mathematical detection
    const hasMath =
      /\d+\s*[+\-×*÷/]\s*\d+/.test(input) || /calculate|solve|math|multiply|divide|add|subtract/.test(inputLower)

    // Knowledge request detection
    const hasKnowledgeRequest = /what is|tell me about|explain|define|meaning/.test(inputLower)

    // Personal/memory detection
    const hasPersonalInfo = /my name|i am|remember|recall/.test(inputLower)

    // Language/vocabulary detection
    const hasLanguageRequest = /define|meaning|synonym|antonym|pronunciation/.test(inputLower)

    let primaryEngine = "thinking" // Default to thinking engine
    const secondaryEngines: string[] = []

    if (hasMath) {
      primaryEngine = "math"
      reasoning.push("🧮 Mathematical content detected - routing to Math Engine")
    } else if (hasKnowledgeRequest) {
      primaryEngine = "knowledge"
      reasoning.push("📚 Knowledge request detected - routing to Knowledge Engine")
      secondaryEngines.push("language")
    } else if (hasLanguageRequest) {
      primaryEngine = "language"
      reasoning.push("📝 Language request detected - routing to Language Engine")
    } else if (hasPersonalInfo) {
      primaryEngine = "memory"
      reasoning.push("👤 Personal information detected - routing to Memory Engine")
    } else {
      reasoning.push("💭 General conversation - using Thinking Engine")
    }

    // Always include memory for context
    if (primaryEngine !== "memory") {
      secondaryEngines.push("memory")
    }

    const confidence = this.calculateRoutingConfidence(primaryEngine, input)
    reasoning.push(`📊 Routing confidence: ${Math.round(confidence * 100)}%`)

    return {
      primaryEngine,
      secondaryEngines,
      confidence,
      reasoning,
    }
  }

  private calculateRoutingConfidence(engine: string, input: string): number {
    // Simple confidence calculation based on keyword matches
    const inputLower = input.toLowerCase()

    switch (engine) {
      case "math":
        return /\d+\s*[+\-×*÷/]\s*\d+/.test(input) ? 0.95 : 0.7
      case "knowledge":
        return /what is|tell me about|explain/.test(inputLower) ? 0.9 : 0.6
      case "language":
        return /define|meaning/.test(inputLower) ? 0.9 : 0.6
      case "memory":
        return /my name|i am|remember/.test(inputLower) ? 0.9 : 0.6
      default:
        return 0.8
    }
  }

  public getRoutingHistory(): RoutingDecision[] {
    return [...this.routingHistory]
  }
}
