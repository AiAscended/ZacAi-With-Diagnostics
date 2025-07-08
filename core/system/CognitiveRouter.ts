import type { ThinkingEngine } from "../engines/ThinkingEngine"
import type { MathEngine } from "../engines/MathEngine"
import type { KnowledgeEngine } from "../engines/KnowledgeEngine"
import type { LanguageEngine } from "../engines/LanguageEngine"
import type { MemoryEngine } from "../engines/MemoryEngine"
import type { DiagnosticEngine } from "../engines/DiagnosticEngine"

export interface EngineCollection {
  thinkingEngine: ThinkingEngine
  mathEngine: MathEngine
  knowledgeEngine: KnowledgeEngine
  languageEngine: LanguageEngine
  memoryEngine: MemoryEngine
  diagnosticEngine: DiagnosticEngine
}

export interface RoutingResult {
  content: string
  confidence: number
  thinkingProcess?: string[]
  mathAnalysis?: any
  knowledgeUsed?: string[]
  memoryUpdates?: string[]
  primaryEngine: string
  enginesUsed: string[]
}

export class CognitiveRouter {
  private engines: EngineCollection
  private routingPatterns: Map<string, RegExp[]> = new Map()

  constructor(engines: EngineCollection) {
    this.engines = engines
    this.initializeRoutingPatterns()
  }

  public async initialize(): Promise<void> {
    console.log("🧠 CognitiveRouter: Initializing routing patterns...")
    // All engines should already be initialized by SystemManager
  }

  private initializeRoutingPatterns(): void {
    // Math patterns
    this.routingPatterns.set("math", [
      /\d+\s*[+\-*/^]\s*\d+/,
      /calculate|compute|solve|math|equation|formula/i,
      /what\s+is\s+\d+/i,
      /sqrt|sin|cos|tan|log/i,
      /tesla|vortex|digital\s+root/i,
    ])

    // Memory patterns
    this.routingPatterns.set("memory", [
      /remember|recall|my\s+name|i\s+am|i\s+like|i\s+work/i,
      /what\s+did\s+i|do\s+you\s+remember/i,
      /forget|delete|remove/i,
    ])

    // Knowledge patterns
    this.routingPatterns.set("knowledge", [
      /what\s+is|define|explain|tell\s+me\s+about/i,
      /how\s+does|why\s+does|when\s+did/i,
      /wikipedia|dictionary|definition/i,
    ])

    // Language patterns
    this.routingPatterns.set("language", [
      /spell|pronunciation|synonym|antonym/i,
      /what\s+does\s+\w+\s+mean/i,
      /translate|language/i,
    ])

    // Diagnostic patterns
    this.routingPatterns.set("diagnostic", [
      /status|performance|health|diagnostic/i,
      /how\s+are\s+you|system\s+check/i,
      /memory\s+usage|cpu|performance/i,
    ])
  }

  public async processMessage(message: string): Promise<RoutingResult> {
    console.log(`🧠 CognitiveRouter: Routing message: "${message}"`)

    // Analyze message to determine routing
    const routingAnalysis = this.analyzeMessage(message)
    const primaryEngine = routingAnalysis.primaryEngine
    const enginesUsed: string[] = [primaryEngine]

    const result: RoutingResult = {
      content: "",
      confidence: 0,
      primaryEngine,
      enginesUsed,
    }

    try {
      // Always start with thinking process for complex queries
      if (this.isComplexQuery(message)) {
        const thinkingResult = await this.engines.thinkingEngine.processThought(message)
        result.thinkingProcess = thinkingResult.steps
        enginesUsed.push("thinking")
      }

      // Route to primary engine
      switch (primaryEngine) {
        case "math":
          const mathResult = await this.engines.mathEngine.processMath(message)
          result.content = mathResult.result
          result.confidence = mathResult.confidence
          result.mathAnalysis = mathResult.analysis
          break

        case "memory":
          const memoryResult = await this.engines.memoryEngine.processMemory(message)
          result.content = memoryResult.response
          result.confidence = memoryResult.confidence
          result.memoryUpdates = memoryResult.updates
          break

        case "knowledge":
          const knowledgeResult = await this.engines.knowledgeEngine.processKnowledge(message)
          result.content = knowledgeResult.response
          result.confidence = knowledgeResult.confidence
          result.knowledgeUsed = knowledgeResult.sources
          break

        case "language":
          const languageResult = await this.engines.languageEngine.processLanguage(message)
          result.content = languageResult.response
          result.confidence = languageResult.confidence
          break

        case "diagnostic":
          const diagnosticResult = await this.engines.diagnosticEngine.processDiagnostic(message)
          result.content = diagnosticResult.response
          result.confidence = diagnosticResult.confidence
          break

        default:
          // Default to thinking engine for general conversation
          const generalResult = await this.engines.thinkingEngine.processGeneral(message)
          result.content = generalResult.response
          result.confidence = generalResult.confidence
          result.thinkingProcess = generalResult.reasoning
          enginesUsed.push("thinking")
      }

      // Check if we need additional engines
      if (this.needsLanguageProcessing(message) && !enginesUsed.includes("language")) {
        const langEnhancement = await this.engines.languageEngine.enhanceResponse(result.content)
        if (langEnhancement.enhanced) {
          result.content = langEnhancement.content
          enginesUsed.push("language")
        }
      }

      // Always update memory with the interaction
      if (!enginesUsed.includes("memory")) {
        await this.engines.memoryEngine.storeInteraction(message, result.content)
        enginesUsed.push("memory")
      }

      result.enginesUsed = enginesUsed

      console.log(`✅ CognitiveRouter: Routed to ${primaryEngine}, used engines: ${enginesUsed.join(", ")}`)

      return result
    } catch (error) {
      console.error("❌ CognitiveRouter: Error processing message:", error)

      return {
        content: "I encountered an error processing your message. Please try again.",
        confidence: 0.1,
        primaryEngine: "error",
        enginesUsed: ["error"],
      }
    }
  }

  private analyzeMessage(message: string): { primaryEngine: string; confidence: number } {
    const scores: { [engine: string]: number } = {}

    // Score each engine based on pattern matching
    for (const [engine, patterns] of this.routingPatterns.entries()) {
      scores[engine] = 0

      for (const pattern of patterns) {
        if (pattern.test(message)) {
          scores[engine] += 1
        }
      }

      // Normalize score
      scores[engine] = scores[engine] / patterns.length
    }

    // Find the engine with highest score
    let primaryEngine = "thinking" // default
    let maxScore = 0

    for (const [engine, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score
        primaryEngine = engine
      }
    }

    return {
      primaryEngine,
      confidence: maxScore,
    }
  }

  private isComplexQuery(message: string): boolean {
    const complexityIndicators = [
      /why|how|explain|analyze|compare/i,
      /multiple|several|various|different/i,
      /relationship|connection|correlation/i,
      message.length > 50,
      message.split(" ").length > 8,
    ]

    return complexityIndicators.some((indicator) =>
      typeof indicator === "object" ? indicator.test(message) : indicator,
    )
  }

  private needsLanguageProcessing(message: string): boolean {
    return /spell|pronunciation|grammar|syntax/i.test(message)
  }

  public getRoutingStats(): any {
    return {
      patternsLoaded: this.routingPatterns.size,
      engines: Object.keys(this.engines).length,
      routingPatterns: Array.from(this.routingPatterns.keys()),
    }
  }
}
