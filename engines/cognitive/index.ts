import type { ModuleInterface, ModuleResponse, IntentAnalysis } from "@/types/global"
import { contextManager } from "@/core/context/manager"
import { calculateConfidence } from "@/utils/helpers"

export class CognitiveEngine {
  private modules: Map<string, ModuleInterface> = new Map()
  private initialized = false

  async initialize(modules: Map<string, ModuleInterface>): Promise<CognitiveEngine> {
    if (this.initialized) return this

    console.log("🧠 Initializing Cognitive Engine...")

    try {
      // Initialize context manager
      contextManager.createContext()

      this.modules = modules
      this.initialized = true
      console.log("✅ Cognitive Engine initialized successfully")
    } catch (error) {
      console.error("❌ Cognitive Engine initialization failed:", error)
      throw error
    }

    return this
  }

  registerModules(modules: Map<string, ModuleInterface>): void {
    this.modules = modules
    console.log(`📦 Modules registered: ${Array.from(modules.keys()).join(", ")}`)
  }

  async processInput(input: string): Promise<{
    response: string
    confidence: number
    sources: string[]
    reasoning: string[]
  }> {
    if (!this.initialized) {
      await this.initialize(this.modules)
    }

    // Add user message to context
    contextManager.addMessage({
      role: "user",
      content: input,
    })

    // Analyze intent
    const intentAnalysis = await this.analyzeIntent(input)

    // Get relevant modules
    const relevantModules = this.selectModules(intentAnalysis)

    // Process with modules
    const moduleResponses = await this.processWithModules(input, relevantModules)

    // Build final response
    const finalResponse = await this.buildResponse(moduleResponses, intentAnalysis)

    // Add assistant message to context
    contextManager.addMessage({
      role: "assistant",
      content: finalResponse.response,
      metadata: {
        confidence: finalResponse.confidence,
        sources: finalResponse.sources,
      },
    })

    return finalResponse
  }

  private async analyzeIntent(input: string): Promise<IntentAnalysis> {
    const context = contextManager.extractContext(input)
    const lowercaseInput = input.toLowerCase()

    // Simple intent classification
    let intent = "general"
    let confidence = 0.5
    const suggestedModules: string[] = []

    if (lowercaseInput.includes("define") || lowercaseInput.includes("meaning") || lowercaseInput.includes("what is")) {
      intent = "definition"
      confidence = 0.8
      suggestedModules.push("vocabulary", "facts")
    } else if (lowercaseInput.match(/\d+|\+|-|\*|\/|calculate|solve/)) {
      intent = "calculation"
      confidence = 0.9
      suggestedModules.push("mathematics")
    } else if (
      lowercaseInput.includes("code") ||
      lowercaseInput.includes("program") ||
      lowercaseInput.includes("function")
    ) {
      intent = "coding"
      confidence = 0.8
      suggestedModules.push("coding")
    } else if (
      lowercaseInput.includes("fact") ||
      lowercaseInput.includes("information") ||
      lowercaseInput.includes("tell me about")
    ) {
      intent = "factual"
      confidence = 0.7
      suggestedModules.push("facts")
    } else if (
      lowercaseInput.includes("philosophy") ||
      lowercaseInput.includes("ethics") ||
      lowercaseInput.includes("moral")
    ) {
      intent = "philosophical"
      confidence = 0.8
      suggestedModules.push("philosophy")
    } else if (
      lowercaseInput.includes("my name") ||
      lowercaseInput.includes("i am") ||
      lowercaseInput.includes("remember")
    ) {
      intent = "personal"
      confidence = 0.9
      suggestedModules.push("user-info")
    }

    return {
      intent,
      confidence,
      entities: [], // Would implement NER here
      context,
      suggestedModules,
    }
  }

  private selectModules(intentAnalysis: IntentAnalysis): ModuleInterface[] {
    const selectedModules: ModuleInterface[] = []

    for (const moduleName of intentAnalysis.suggestedModules) {
      const module = this.modules.get(moduleName)
      if (module && module.initialized) {
        selectedModules.push(module)
      }
    }

    // If no specific modules, try all available modules
    if (selectedModules.length === 0) {
      for (const module of this.modules.values()) {
        if (module.initialized) {
          selectedModules.push(module)
        }
      }
    }

    return selectedModules
  }

  private async processWithModules(input: string, modules: ModuleInterface[]): Promise<ModuleResponse[]> {
    const responses: ModuleResponse[] = []
    const context = contextManager.extractContext(input)

    for (const module of modules) {
      try {
        const response = await module.process(input, context)
        if (response.success && response.confidence > 0.3) {
          responses.push(response)
        }
      } catch (error) {
        console.error(`Error processing with module ${module.name}:`, error)
      }
    }

    return responses.sort((a, b) => b.confidence - a.confidence)
  }

  private async buildResponse(
    moduleResponses: ModuleResponse[],
    intentAnalysis: IntentAnalysis,
  ): Promise<{
    response: string
    confidence: number
    sources: string[]
    reasoning: string[]
  }> {
    if (moduleResponses.length === 0) {
      return {
        response: "I'm not sure how to help with that. Could you please rephrase your question?",
        confidence: 0.1,
        sources: [],
        reasoning: ["No relevant modules found a suitable response"],
      }
    }

    const bestResponse = moduleResponses[0]
    const allSources = moduleResponses.map((r) => r.source)
    const avgConfidence = calculateConfidence(moduleResponses.map((r) => r.confidence))

    let response = ""
    const reasoning: string[] = []

    if (typeof bestResponse.data === "string") {
      response = bestResponse.data
    } else if (bestResponse.data && typeof bestResponse.data === "object") {
      if (bestResponse.data.answer) {
        response = bestResponse.data.answer
      } else if (bestResponse.data.definition) {
        response = bestResponse.data.definition
      } else if (bestResponse.data.result) {
        response = bestResponse.data.result.toString()
      } else {
        response = JSON.stringify(bestResponse.data, null, 2)
      }
    }

    reasoning.push(`Intent analyzed as: ${intentAnalysis.intent} (confidence: ${intentAnalysis.confidence})`)
    reasoning.push(`Best response from: ${bestResponse.source} (confidence: ${bestResponse.confidence})`)

    if (moduleResponses.length > 1) {
      reasoning.push(`Considered ${moduleResponses.length} module responses`)
    }

    return {
      response: response || "I found some information but couldn't format it properly.",
      confidence: avgConfidence,
      sources: allSources,
      reasoning,
    }
  }

  getStats(): any {
    return {
      initialized: this.initialized,
      registeredModules: Array.from(this.modules.keys()),
      contextStats: contextManager.getContextStats(),
    }
  }
}

export const cognitiveEngine = new CognitiveEngine()
