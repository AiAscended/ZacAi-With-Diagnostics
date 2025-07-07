import type { ModuleInterface, ModuleResponse, IntentAnalysis } from "@/types/global"
import { contextManager } from "@/core/context/manager"
import { calculateConfidence } from "@/utils/helpers"

export class CognitiveEngine {
  private modules: Map<string, ModuleInterface> = new Map()
  private initialized = false
  private processingQueue: Array<{ input: string; resolve: Function; reject: Function }> = []
  private isProcessing = false

  async initialize(modules?: Map<string, ModuleInterface>): Promise<CognitiveEngine> {
    if (this.initialized) return this

    console.log("🧠 Initializing Cognitive Engine...")

    try {
      // Initialize context manager
      await contextManager.createContext()

      if (modules) {
        this.modules = modules
      }

      this.initialized = true
      console.log("✅ Cognitive Engine initialized successfully")
    } catch (error) {
      console.error("❌ Cognitive Engine initialization failed:", error)
      // Don't throw - allow fallback operation
      this.initialized = true
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
    // Queue processing to prevent concurrent issues
    return new Promise((resolve, reject) => {
      this.processingQueue.push({ input, resolve, reject })
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return

    this.isProcessing = true

    try {
      while (this.processingQueue.length > 0) {
        const { input, resolve, reject } = this.processingQueue.shift()!

        try {
          const result = await this.processInputInternal(input)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
    } finally {
      this.isProcessing = false
    }
  }

  private async processInputInternal(input: string): Promise<{
    response: string
    confidence: number
    sources: string[]
    reasoning: string[]
  }> {
    if (!this.initialized) {
      return this.createFallbackResponse(input, "System not initialized")
    }

    try {
      // Add user message to context
      contextManager.addMessage({
        role: "user",
        content: input,
      })

      // Analyze intent with enhanced reasoning
      const intentAnalysis = await this.analyzeIntent(input)

      // Get relevant modules based on intent
      const relevantModules = this.selectModules(intentAnalysis)

      // Process with modules in parallel for better performance
      const moduleResponses = await this.processWithModules(input, relevantModules)

      // Build comprehensive response
      const finalResponse = await this.buildResponse(moduleResponses, intentAnalysis, input)

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
    } catch (error) {
      console.error("Error in cognitive processing:", error)
      return this.createFallbackResponse(input, `Processing error: ${error}`)
    }
  }

  private async analyzeIntent(input: string): Promise<IntentAnalysis> {
    const context = contextManager.extractContext(input)
    const lowercaseInput = input.toLowerCase().trim()

    // Enhanced intent classification with confidence scoring
    let intent = "general"
    let confidence = 0.5
    const suggestedModules: string[] = []
    const entities: string[] = []

    // Mathematical queries - highest priority for accuracy
    if (this.isMathQuery(lowercaseInput)) {
      intent = "mathematics"
      confidence = 0.95
      suggestedModules.push("mathematics")
      entities.push(...this.extractMathEntities(input))
    }
    // Definition and vocabulary queries
    else if (this.isVocabularyQuery(lowercaseInput)) {
      intent = "vocabulary"
      confidence = 0.9
      suggestedModules.push("vocabulary")
      entities.push(...this.extractVocabularyEntities(input))
    }
    // Factual information queries
    else if (this.isFactsQuery(lowercaseInput)) {
      intent = "facts"
      confidence = 0.8
      suggestedModules.push("facts")
      entities.push(...this.extractFactEntities(input))
    }
    // Programming and coding queries
    else if (this.isCodingQuery(lowercaseInput)) {
      intent = "coding"
      confidence = 0.85
      suggestedModules.push("coding")
      entities.push(...this.extractCodingEntities(input))
    }
    // Personal information and user data
    else if (this.isUserInfoQuery(lowercaseInput)) {
      intent = "personal"
      confidence = 0.9
      suggestedModules.push("user-info")
      entities.push(...this.extractUserEntities(input))
    }
    // Philosophical and abstract concepts
    else if (this.isPhilosophyQuery(lowercaseInput)) {
      intent = "philosophy"
      confidence = 0.75
      suggestedModules.push("philosophy")
      entities.push(...this.extractPhilosophyEntities(input))
    }
    // System commands and status
    else if (this.isSystemQuery(lowercaseInput)) {
      intent = "system"
      confidence = 0.95
      suggestedModules.push("system")
    }

    // Fallback: try multiple modules for ambiguous queries
    if (suggestedModules.length === 0) {
      suggestedModules.push("vocabulary", "facts", "mathematics")
      confidence = 0.4
    }

    return {
      intent,
      confidence,
      entities,
      context,
      suggestedModules,
    }
  }

  // Enhanced query detection methods
  private isMathQuery(input: string): boolean {
    const mathPatterns = [
      /\d+\s*[+\-*/×÷^]\s*\d+/,
      /calculate|compute|solve|math|equation|formula/,
      /what\s+is\s+\d+.*[+\-*/×÷]/,
      /\d+\s*(plus|minus|times|divided\s+by)\s*\d+/,
      /square\s+root|factorial|percentage|percent/,
    ]
    return mathPatterns.some((pattern) => pattern.test(input))
  }

  private isVocabularyQuery(input: string): boolean {
    const vocabPatterns = [
      /define|definition|meaning|what\s+does.*mean/,
      /what\s+is\s+the\s+meaning\s+of/,
      /etymology|pronunciation|synonym|antonym/,
      /how\s+do\s+you\s+spell|spelling\s+of/,
    ]
    return vocabPatterns.some((pattern) => pattern.test(input))
  }

  private isFactsQuery(input: string): boolean {
    const factPatterns = [
      /who\s+is|what\s+is|when\s+did|where\s+is|how\s+did/,
      /tell\s+me\s+about|information\s+about|facts\s+about/,
      /history\s+of|background\s+of|details\s+about/,
      /explain|describe|overview\s+of/,
    ]
    return factPatterns.some((pattern) => pattern.test(input))
  }

  private isCodingQuery(input: string): boolean {
    const codingPatterns = [
      /code|programming|function|algorithm|script/,
      /javascript|python|html|css|react|node/,
      /how\s+to\s+code|write\s+a\s+program|create\s+a\s+function/,
      /debug|error|syntax|compile/,
    ]
    return codingPatterns.some((pattern) => pattern.test(input))
  }

  private isUserInfoQuery(input: string): boolean {
    const userPatterns = [
      /my\s+name\s+is|i\s+am|remember\s+that\s+i/,
      /personal|preference|remember\s+me/,
      /what\s+do\s+you\s+know\s+about\s+me/,
      /my\s+profile|my\s+information/,
    ]
    return userPatterns.some((pattern) => pattern.test(input))
  }

  private isPhilosophyQuery(input: string): boolean {
    const philPatterns = [
      /philosophy|consciousness|existence|reality/,
      /meaning\s+of\s+life|ethics|morality|truth/,
      /what\s+is\s+the\s+purpose|why\s+do\s+we\s+exist/,
      /free\s+will|determinism|metaphysics/,
    ]
    return philPatterns.some((pattern) => pattern.test(input))
  }

  private isSystemQuery(input: string): boolean {
    const systemPatterns = [
      /status|health|system|diagnostic/,
      /how\s+are\s+you|are\s+you\s+working/,
      /help|commands|what\s+can\s+you\s+do/,
      /version|update|restart/,
    ]
    return systemPatterns.some((pattern) => pattern.test(input))
  }

  // Enhanced entity extraction methods
  private extractMathEntities(input: string): string[] {
    const entities = []
    const numbers = input.match(/\d+(?:\.\d+)?/g)
    if (numbers) entities.push(...numbers)

    const operations = input.match(/[+\-*/×÷^()]/g)
    if (operations) entities.push(...operations)

    const mathTerms = input.match(/square\s+root|factorial|percentage|percent|equation|formula/gi)
    if (mathTerms) entities.push(...mathTerms)

    return entities
  }

  private extractVocabularyEntities(input: string): string[] {
    const entities = []

    const defineMatch = input.match(/define\s+(\w+)/i)
    if (defineMatch) entities.push(defineMatch[1])

    const meaningMatch = input.match(/meaning\s+of\s+(\w+)/i)
    if (meaningMatch) entities.push(meaningMatch[1])

    const whatIsMatch = input.match(/what\s+is\s+(\w+)/i)
    if (whatIsMatch) entities.push(whatIsMatch[1])

    return entities
  }

  private extractFactEntities(input: string): string[] {
    const entities = []

    const whoMatch = input.match(/who\s+is\s+([^?]+)/i)
    if (whoMatch) entities.push(whoMatch[1].trim())

    const whatMatch = input.match(/what\s+is\s+([^?]+)/i)
    if (whatMatch) entities.push(whatMatch[1].trim())

    const tellMeMatch = input.match(/tell\s+me\s+about\s+([^?]+)/i)
    if (tellMeMatch) entities.push(tellMeMatch[1].trim())

    return entities
  }

  private extractCodingEntities(input: string): string[] {
    const languages = input.match(/javascript|python|html|css|java|c\+\+|php|ruby|go|rust/gi)
    const frameworks = input.match(/react|vue|angular|node|express|django|flask/gi)

    return [...(languages || []), ...(frameworks || [])]
  }

  private extractUserEntities(input: string): string[] {
    const entities = []

    const nameMatch = input.match(/my\s+name\s+is\s+(\w+)/i)
    if (nameMatch) entities.push(nameMatch[1])

    const iAmMatch = input.match(/i\s+am\s+(\w+)/i)
    if (iAmMatch) entities.push(iAmMatch[1])

    return entities
  }

  private extractPhilosophyEntities(input: string): string[] {
    const concepts = input.match(/consciousness|existence|reality|truth|knowledge|ethics|morality|free\s+will/gi)
    return concepts || []
  }

  private selectModules(intentAnalysis: IntentAnalysis): ModuleInterface[] {
    const selectedModules: ModuleInterface[] = []

    for (const moduleName of intentAnalysis.suggestedModules) {
      const module = this.modules.get(moduleName)
      if (module && module.initialized) {
        selectedModules.push(module)
      }
    }

    // If no specific modules available, try all initialized modules
    if (selectedModules.length === 0) {
      for (const module of this.modules.values()) {
        if (module && module.initialized) {
          selectedModules.push(module)
        }
      }
    }

    return selectedModules
  }

  private async processWithModules(input: string, modules: ModuleInterface[]): Promise<ModuleResponse[]> {
    const responses: ModuleResponse[] = []
    const context = contextManager.extractContext(input)

    // Process modules in parallel for better performance
    const modulePromises = modules.map(async (module) => {
      try {
        const response = await Promise.race([
          module.process(input, context),
          new Promise<ModuleResponse>((_, reject) => setTimeout(() => reject(new Error("Module timeout")), 5000)),
        ])

        if (response.success && response.confidence > 0.2) {
          return response
        }
      } catch (error) {
        console.warn(`Module ${module.name} processing failed:`, error)
      }
      return null
    })

    const results = await Promise.all(modulePromises)

    // Filter out null results and sort by confidence
    results
      .filter((response): response is ModuleResponse => response !== null)
      .sort((a, b) => b.confidence - a.confidence)
      .forEach((response) => responses.push(response))

    return responses
  }

  private async buildResponse(
    moduleResponses: ModuleResponse[],
    intentAnalysis: IntentAnalysis,
    originalInput: string,
  ): Promise<{
    response: string
    confidence: number
    sources: string[]
    reasoning: string[]
  }> {
    if (moduleResponses.length === 0) {
      return this.createFallbackResponse(originalInput, "No modules could process this query")
    }

    const bestResponse = moduleResponses[0]
    const allSources = moduleResponses.map((r) => r.source)
    const avgConfidence = calculateConfidence(moduleResponses.map((r) => r.confidence))

    let response = ""
    const reasoning: string[] = []

    // Enhanced response building with better formatting
    if (typeof bestResponse.data === "string") {
      response = bestResponse.data
    } else if (bestResponse.data && typeof bestResponse.data === "object") {
      if (bestResponse.data.answer) {
        response = bestResponse.data.answer
      } else if (bestResponse.data.definition) {
        response = bestResponse.data.definition
      } else if (bestResponse.data.result !== undefined) {
        response = String(bestResponse.data.result)
      } else if (bestResponse.data.content) {
        response = bestResponse.data.content
      } else {
        response = JSON.stringify(bestResponse.data, null, 2)
      }
    }

    // Add reasoning chain
    reasoning.push(`Intent: ${intentAnalysis.intent} (${(intentAnalysis.confidence * 100).toFixed(1)}% confidence)`)
    reasoning.push(`Primary source: ${bestResponse.source} (${(bestResponse.confidence * 100).toFixed(1)}% confidence)`)

    if (moduleResponses.length > 1) {
      reasoning.push(`Consulted ${moduleResponses.length} modules for comprehensive response`)
    }

    if (intentAnalysis.entities.length > 0) {
      reasoning.push(`Key entities: ${intentAnalysis.entities.slice(0, 3).join(", ")}`)
    }

    return {
      response: response || "I found information but couldn't format it properly. Please try rephrasing your question.",
      confidence: Math.max(avgConfidence, 0.1),
      sources: allSources,
      reasoning,
    }
  }

  private createFallbackResponse(
    input: string,
    reason: string,
  ): {
    response: string
    confidence: number
    sources: string[]
    reasoning: string[]
  } {
    const lowerInput = input.toLowerCase().trim()

    // Enhanced fallback responses
    if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
      return {
        response:
          "👋 Hello! I'm ZacAI, your intelligent assistant. I'm here to help with questions, calculations, definitions, and more. What would you like to know?",
        confidence: 0.9,
        sources: ["cognitive-engine"],
        reasoning: ["Greeting detection", reason],
      }
    }

    if (lowerInput.includes("help") || lowerInput === "?") {
      return {
        response: `🆘 **ZacAI Help**

I can assist you with:
• **Mathematics** - Calculations, equations, problem solving
• **Definitions** - Word meanings, explanations, concepts  
• **Facts** - Information about people, places, events
• **Coding** - Programming help and explanations
• **Personal** - Remember information about you
• **System** - Check my status and capabilities

Try asking: "Define artificial intelligence", "What is 5 + 5?", or "Tell me about the moon"

What would you like to explore?`,
        confidence: 0.95,
        sources: ["cognitive-engine"],
        reasoning: ["Help request detected", reason],
      }
    }

    if (lowerInput.includes("status") || lowerInput.includes("how are you")) {
      return {
        response: `🤖 **ZacAI System Status**

• **Version**: 2.0.8+ Production
• **Status**: Operational (Fallback Mode)
• **Cognitive Engine**: Active
• **Modules**: Loading/Limited
• **Response Time**: Optimized

I'm running in fallback mode while modules initialize. Core functionality is available!

Ask me anything or type "help" for more options.`,
        confidence: 0.9,
        sources: ["cognitive-engine"],
        reasoning: ["Status request detected", reason],
      }
    }

    // Basic math fallback
    const mathMatch = lowerInput.match(/^(\d+)\s*([+\-*/])\s*(\d+)$/)
    if (mathMatch) {
      const [, a, op, b] = mathMatch
      const numA = Number.parseFloat(a)
      const numB = Number.parseFloat(b)
      let result: number

      switch (op) {
        case "+":
          result = numA + numB
          break
        case "-":
          result = numA - numB
          break
        case "*":
          result = numA * numB
          break
        case "/":
          result = numB !== 0 ? numA / numB : Number.NaN
          break
        default:
          result = Number.NaN
      }

      if (!isNaN(result)) {
        return {
          response: `🧮 **${numA} ${op} ${numB} = ${result}**\n\nCalculation completed using fallback math engine.`,
          confidence: 0.95,
          sources: ["cognitive-engine-fallback"],
          reasoning: ["Basic math calculation", reason],
        }
      }
    }

    // Default fallback
    return {
      response: `I received your message: "${input}"\n\n🔄 I'm currently operating in fallback mode while my specialized modules load. I can still help with basic questions, calculations, and provide information.\n\nTry asking me to:\n• Define a word\n• Solve a math problem\n• Explain a concept\n• Type "help" for more options\n\nWhat would you like to know?`,
      confidence: 0.6,
      sources: ["cognitive-engine-fallback"],
      reasoning: ["Fallback response", reason],
    }
  }

  getStats(): any {
    return {
      initialized: this.initialized,
      registeredModules: Array.from(this.modules.keys()),
      moduleCount: this.modules.size,
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing,
      contextStats: contextManager.getContextStats(),
    }
  }
}

export const cognitiveEngine = new CognitiveEngine()
