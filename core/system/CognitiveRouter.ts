export interface EngineCollection {
  thinkingEngine: any
  mathEngine: any
  knowledgeEngine: any
  languageEngine: any
  memoryEngine: any
  diagnosticEngine: any
}

export class CognitiveRouter {
  private engines: EngineCollection

  constructor(engines: EngineCollection) {
    console.log("🧠 CognitiveRouter: Initializing...")
    this.engines = engines
  }

  public async initialize(): Promise<void> {
    console.log("✅ CognitiveRouter: Initialized successfully")
  }

  public async processMessage(message: string): Promise<any> {
    console.log(`🔀 CognitiveRouter: Routing message: "${message}"`)

    try {
      // Determine which engines to use based on message content
      const routingDecision = this.analyzeMessage(message)

      // Process through thinking engine first
      const thinkingResult = await this.engines.thinkingEngine.process(message)

      // Route to appropriate engines based on content
      const response = {
        content: "I understand your message.",
        confidence: 0.7,
        thinkingProcess: thinkingResult.steps || [],
        knowledgeUsed: [],
        mathAnalysis: null,
      }

      // Math processing
      if (routingDecision.needsMath) {
        const mathResult = await this.engines.mathEngine.process(message)
        if (mathResult.success) {
          response.content = mathResult.result
          response.confidence = mathResult.confidence
          response.mathAnalysis = mathResult.analysis
        }
      }

      // Language processing
      if (routingDecision.needsLanguage) {
        const langResult = await this.engines.languageEngine.processLanguage(message)
        response.content = langResult.response
        response.confidence = langResult.confidence
      }

      // Knowledge lookup
      if (routingDecision.needsKnowledge) {
        const knowledgeResult = await this.engines.knowledgeEngine.search(message)
        if (knowledgeResult.length > 0) {
          response.knowledgeUsed = knowledgeResult.map((k) => k.type + ": " + k.key)
        }
      }

      // Memory storage
      await this.engines.memoryEngine.storeInteraction(message, response.content)

      return response
    } catch (error) {
      console.error("❌ CognitiveRouter: Error processing message:", error)
      return {
        content: "I encountered an error processing your message.",
        confidence: 0.1,
        thinkingProcess: ["Error occurred during processing"],
        knowledgeUsed: [],
        mathAnalysis: null,
      }
    }
  }

  private analyzeMessage(message: string): any {
    const lowerMessage = message.toLowerCase()

    return {
      needsMath: /\d+|\+|-|\*|\/|=|calculate|math|plus|minus|times|divided/.test(lowerMessage),
      needsLanguage: /define|meaning|spell|pronunciation|what does|what is/.test(lowerMessage),
      needsKnowledge: /tell me|explain|what|how|why|when|where/.test(lowerMessage),
      needsMemory: true, // Always store interactions
    }
  }
}
