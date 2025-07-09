export interface RoutingDecision {
  primaryEngine: string
  secondaryEngines: string[]
  confidence: number
  reasoning: string
}

export class CognitiveRouter {
  private engines: any
  private isInitialized = false

  constructor(engines: any) {
    this.engines = engines
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return
    console.log("🧭 CognitiveRouter: Initialized")
    this.isInitialized = true
  }

  public async route(userMessage: string, context: any): Promise<any> {
    console.log(`🧭 CognitiveRouter: Routing message: "${userMessage}"`)

    // Determine routing decision
    const routingDecision = this.determineRouting(userMessage)
    console.log(`🧭 Primary engine: ${routingDecision.primaryEngine}`)

    // Process through ThinkingEngine first
    const thinkingResult = await this.engines.thinkingEngine.processThought(userMessage, context, routingDecision)

    // Enhance with specific engine processing
    const enhancedResponse = await this.enhanceWithEngines(userMessage, thinkingResult, routingDecision)

    return {
      content: enhancedResponse.content,
      confidence: enhancedResponse.confidence,
      reasoning: thinkingResult.reasoning,
      pathways: thinkingResult.pathways,
      synthesis: thinkingResult.synthesis,
      thinkingProcess: thinkingResult.thoughts.map((t) => `${t.emoji} ${t.content}`),
      mathAnalysis: enhancedResponse.mathAnalysis,
      knowledgeUsed: enhancedResponse.knowledgeUsed,
    }
  }

  private determineRouting(userMessage: string): RoutingDecision {
    const lowerMessage = userMessage.toLowerCase()

    // Math detection
    if (/\d+\s*[+\-*/÷×]\s*\d+/.test(userMessage)) {
      return {
        primaryEngine: "math",
        secondaryEngines: ["thinking", "language"],
        confidence: 0.9,
        reasoning: "Mathematical expression detected",
      }
    }

    // ENHANCED: Personal info sharing detection
    if (/(?:my name is|i'm|i am|call me|i have|i work|i live)/.test(lowerMessage)) {
      return {
        primaryEngine: "memory",
        secondaryEngines: ["thinking", "language"],
        confidence: 0.95,
        reasoning: "Personal information sharing detected",
      }
    }

    // Knowledge query detection
    if (/what is|tell me about|explain|define/.test(lowerMessage)) {
      return {
        primaryEngine: "knowledge",
        secondaryEngines: ["thinking", "language"],
        confidence: 0.8,
        reasoning: "Knowledge query detected",
      }
    }

    // ENHANCED: Memory recall detection
    if (/remember|what.*know.*about.*me|do you know|recall|who am i/.test(lowerMessage)) {
      return {
        primaryEngine: "memory",
        secondaryEngines: ["thinking", "language"],
        confidence: 0.85,
        reasoning: "Memory recall query detected",
      }
    }

    // Default to conversational
    return {
      primaryEngine: "language",
      secondaryEngines: ["thinking", "memory"],
      confidence: 0.7,
      reasoning: "General conversational input",
    }
  }

  private async enhanceWithEngines(
    userMessage: string,
    thinkingResult: any,
    routingDecision: RoutingDecision,
  ): Promise<any> {
    let enhancedContent = thinkingResult.content
    let mathAnalysis = null
    let knowledgeUsed: string[] = []

    // Process with primary engine
    if (routingDecision.primaryEngine === "math") {
      const mathResult = await this.engines.mathEngine.processMath(userMessage)
      if (mathResult) {
        enhancedContent = `I can help you with that calculation! ${mathResult.calculation}`
        mathAnalysis = mathResult
      }
    } else if (routingDecision.primaryEngine === "knowledge") {
      const knowledgeResult = await this.engines.knowledgeEngine.processKnowledge(userMessage)
      if (knowledgeResult.found) {
        knowledgeUsed = knowledgeResult.results.map((r: any) => r.key)
        enhancedContent = `Based on my knowledge: ${this.generateKnowledgeResponse(userMessage)}`
      }
    } else if (routingDecision.primaryEngine === "memory") {
      // ENHANCED: Handle both storing and recalling personal info
      const memories = await this.engines.memoryEngine.retrieveMemories(userMessage)

      // Check if this is a recall query
      if (/remember|what.*know.*about.*me|do you know|recall|who am i/.test(userMessage.toLowerCase())) {
        const personalSummary = this.engines.memoryEngine.getPersonalInfoSummary()
        enhancedContent = `Here's what I remember about you: ${personalSummary}`
      } else {
        // This is likely sharing new personal info
        enhancedContent = this.generatePersonalInfoResponse(userMessage)
      }
    } else {
      // Language processing
      enhancedContent = this.generateLanguageResponse(userMessage, thinkingResult)
    }

    return {
      content: enhancedContent,
      confidence: thinkingResult.confidence,
      mathAnalysis,
      knowledgeUsed,
    }
  }

  private generateKnowledgeResponse(input: string): string {
    const responses = [
      "Let me share what I know about this topic.",
      "I have some information that might be helpful.",
      "Based on my understanding, here's what I can tell you.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private generateMemoryResponse(input: string): string {
    const responses = [
      "I recall we've discussed this before.",
      "This reminds me of our earlier conversation.",
      "I have some memories related to this topic.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // ENHANCED: Better personal info response generation
  private generatePersonalInfoResponse(input: string): string {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("my name is")) {
      return "Thank you for telling me your name! I'll remember that for our future conversations."
    }

    if (
      lowerInput.includes("i have") &&
      (lowerInput.includes("cat") || lowerInput.includes("dog") || lowerInput.includes("pet"))
    ) {
      return "That's wonderful! I love hearing about pets. I'll remember this information about your furry friends."
    }

    if (lowerInput.includes("i work") || lowerInput.includes("i am")) {
      return "Thanks for sharing that with me! I'll keep this information in mind for our conversations."
    }

    return "I've noted this information and will remember it for our future chats!"
  }

  private generateLanguageResponse(input: string, thinkingResult: any): string {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! I'm ZacAI, and I'm here to help you. I can think through problems, remember our conversations, and learn from our interactions!"
    }

    if (lowerInput.includes("how are you")) {
      return "I'm doing well, thank you! My thinking processes are running smoothly, and I'm ready to help you with whatever you need."
    }

    if (lowerInput.includes("what can you do")) {
      return "I can engage in thoughtful conversations, solve mathematical problems, remember our discussions, and learn from every interaction. I use advanced reasoning to understand context and provide helpful responses!"
    }

    // Use thinking result as base
    return (
      thinkingResult.synthesis?.primaryInsight ||
      "I understand what you're saying. Let me think about this and provide a thoughtful response."
    )
  }
}
