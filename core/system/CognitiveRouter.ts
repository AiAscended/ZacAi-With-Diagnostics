export interface RoutingDecision {
  primaryEngine: string
  secondaryEngines: string[]
  confidence: number
  reasoning: string
  personalInfo?: any
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

    // GOLDEN CODE: Extract personal info IMMEDIATELY before processing
    const extractedPersonalInfo = await this.extractPersonalInfoImmediate(userMessage)

    // Determine routing decision with personal info context
    const routingDecision = this.determineRouting(userMessage, extractedPersonalInfo)
    console.log(`🧭 Primary engine: ${routingDecision.primaryEngine}`)

    // Process through ThinkingEngine first with personal context
    const thinkingResult = await this.engines.thinkingEngine.processThought(userMessage, context, routingDecision)

    // Enhance with specific engine processing
    const enhancedResponse = await this.enhanceWithEngines(
      userMessage,
      thinkingResult,
      routingDecision,
      extractedPersonalInfo,
    )

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

  // GOLDEN CODE: Immediate personal info extraction for instant usage
  private async extractPersonalInfoImmediate(message: string): Promise<any> {
    const personalInfo: any = {}

    // Enhanced patterns for immediate extraction
    const patterns = [
      { pattern: /(?:my name is|i'm|i am|call me)\s+(\w+)/i, key: "name" },
      { pattern: /i have (\d+)\s+(cats?|dogs?|pets?)/i, key: "pets", multi: true },
      { pattern: /(?:one|first)\s+(?:is\s+)?(?:named|called)\s+(\w+)/i, key: "pet_name_1" },
      { pattern: /(?:other|second|another)\s+(?:is\s+)?(?:named|called)\s+(\w+)/i, key: "pet_name_2" },
      { pattern: /(?:and|,)\s*(\w+)\s+(?:is\s+)?(?:the\s+)?(?:other|second)/i, key: "pet_name_2" },
      { pattern: /i work as (?:a |an )?(.+)/i, key: "job" },
      { pattern: /i live in (.+)/i, key: "location" },
    ]

    patterns.forEach(({ pattern, key, multi }) => {
      const match = message.match(pattern)
      if (match && match[1]) {
        if (multi && key === "pets") {
          personalInfo[key] = `${match[1]} ${match[2]}`
        } else {
          personalInfo[key] = match[1].trim()
        }
      }
    })

    // Store in memory engine for persistence
    if (Object.keys(personalInfo).length > 0) {
      await this.engines.memoryEngine.storeMemory({
        type: "conversation",
        userMessage: message,
        extractedInfo: personalInfo,
      })
    }

    return personalInfo
  }

  private determineRouting(userMessage: string, personalInfo: any): RoutingDecision {
    const lowerMessage = userMessage.toLowerCase()

    // Math detection
    if (/\d+\s*[+\-*/÷×]\s*\d+/.test(userMessage)) {
      return {
        primaryEngine: "math",
        secondaryEngines: ["thinking", "language"],
        confidence: 0.9,
        reasoning: "Mathematical expression detected",
        personalInfo,
      }
    }

    // ENHANCED: Personal info sharing detection with immediate context
    if (/(?:my name is|i'm|i am|call me|i have|i work|i live)/.test(lowerMessage)) {
      return {
        primaryEngine: "memory",
        secondaryEngines: ["thinking", "language"],
        confidence: 0.95,
        reasoning: "Personal information sharing detected",
        personalInfo,
      }
    }

    // GOLDEN CODE: Dictionary/definition request detection
    if (/(?:what\s+(?:is|does|means?)|define|meaning\s+of|explain)\s+(.+)/i.test(lowerMessage)) {
      return {
        primaryEngine: "knowledge",
        secondaryEngines: ["thinking", "language"],
        confidence: 0.9,
        reasoning: "Definition/dictionary request detected",
        personalInfo,
      }
    }

    // Knowledge query detection
    if (/what is|tell me about|explain|define/.test(lowerMessage)) {
      return {
        primaryEngine: "knowledge",
        secondaryEngines: ["thinking", "language"],
        confidence: 0.8,
        reasoning: "Knowledge query detected",
        personalInfo,
      }
    }

    // ENHANCED: Memory recall detection
    if (/remember|what.*know.*about.*me|do you know|recall|who am i/.test(lowerMessage)) {
      return {
        primaryEngine: "memory",
        secondaryEngines: ["thinking", "language"],
        confidence: 0.85,
        reasoning: "Memory recall query detected",
        personalInfo,
      }
    }

    // Default to conversational
    return {
      primaryEngine: "language",
      secondaryEngines: ["thinking", "memory"],
      confidence: 0.7,
      reasoning: "General conversational input",
      personalInfo,
    }
  }

  private async enhanceWithEngines(
    userMessage: string,
    thinkingResult: any,
    routingDecision: RoutingDecision,
    personalInfo: any,
  ): Promise<any> {
    let enhancedContent = thinkingResult.content
    let mathAnalysis = null
    let knowledgeUsed: string[] = []

    // Process with primary engine
    if (routingDecision.primaryEngine === "math") {
      const mathResult = await this.engines.mathEngine.processMath(userMessage)
      if (mathResult) {
        enhancedContent = this.generateMathResponseWithPersonalTouch(mathResult, personalInfo)
        mathAnalysis = mathResult
      }
    } else if (routingDecision.primaryEngine === "knowledge") {
      // GOLDEN CODE: Enhanced knowledge processing with dictionary lookup
      const knowledgeResult = await this.engines.knowledgeEngine.processKnowledge(userMessage)
      if (knowledgeResult.found) {
        knowledgeUsed = knowledgeResult.results.map((r: any) => r.key)
        enhancedContent = this.generateKnowledgeResponseWithPersonalTouch(knowledgeResult, personalInfo)
      } else {
        // GOLDEN CODE: Fallback to thinking when knowledge not found
        enhancedContent = this.generateThinkingFallbackResponse(userMessage, personalInfo)
      }
    } else if (routingDecision.primaryEngine === "memory") {
      // ENHANCED: Handle both storing and recalling personal info with immediate usage
      if (/remember|what.*know.*about.*me|do you know|recall|who am i/.test(userMessage.toLowerCase())) {
        const personalSummary = this.engines.memoryEngine.getPersonalInfoSummary()
        enhancedContent = `Here's what I remember about you: ${personalSummary}`
      } else {
        // GOLDEN CODE: Immediate personal info acknowledgment
        enhancedContent = this.generatePersonalInfoResponseWithImmediateUsage(userMessage, personalInfo)
      }
    } else {
      // Language processing with personal touch
      enhancedContent = this.generateLanguageResponseWithPersonalTouch(userMessage, thinkingResult, personalInfo)
    }

    return {
      content: enhancedContent,
      confidence: thinkingResult.confidence,
      mathAnalysis,
      knowledgeUsed,
    }
  }

  // GOLDEN CODE: Math response with personal touch
  private generateMathResponseWithPersonalTouch(mathResult: any, personalInfo: any): string {
    const name = personalInfo.name ? `, ${personalInfo.name}` : ""
    return `I can help you with that calculation${name}! ${mathResult.calculation}`
  }

  // GOLDEN CODE: Knowledge response with personal touch
  private generateKnowledgeResponseWithPersonalTouch(knowledgeResult: any, personalInfo: any): string {
    const name = personalInfo.name ? `, ${personalInfo.name}` : ""
    return `Based on my knowledge${name}: ${this.generateKnowledgeResponse("")}`
  }

  // GOLDEN CODE: Thinking fallback when knowledge lookup fails
  private generateThinkingFallbackResponse(userMessage: string, personalInfo: any): string {
    const name = personalInfo.name ? `, ${personalInfo.name}` : ""

    // Extract the word/concept they're asking about
    const wordMatch = userMessage.match(/(?:what\s+(?:is|does|means?)|define|meaning\s+of|explain)\s+(.+)/i)
    const word = wordMatch ? wordMatch[1].trim().replace(/[?!.]/g, "") : "that"

    return `I don't have a definition for "${word}" in my current knowledge base${name}, but let me think about this... Based on the context and structure of the word, I can try to help you understand it better. Could you provide more context about where you encountered this word, or would you like me to break down what I can infer about it?`
  }

  // GOLDEN CODE: Personal info response with immediate name usage
  private generatePersonalInfoResponseWithImmediateUsage(input: string, personalInfo: any): string {
    const lowerInput = input.toLowerCase()

    if (personalInfo.name) {
      if (lowerInput.includes("my name is")) {
        return `Nice to meet you, ${personalInfo.name}! I'll remember your name for our future conversations.`
      }
    }

    if (personalInfo.pets) {
      let response = `That's wonderful${personalInfo.name ? `, ${personalInfo.name}` : ""}! You have ${personalInfo.pets}.`

      if (personalInfo.pet_name_1) {
        response += ` ${personalInfo.pet_name_1} sounds like a great companion!`
      }

      if (personalInfo.pet_name_2) {
        response += ` And ${personalInfo.pet_name_2} too!`
      }

      response += " I love hearing about pets and I'll remember this information about your furry friends."
      return response
    }

    if (personalInfo.job) {
      return `Thanks for sharing that${personalInfo.name ? `, ${personalInfo.name}` : ""}! Working as ${personalInfo.job} must be interesting. I'll keep this information in mind for our conversations.`
    }

    if (personalInfo.location) {
      return `${personalInfo.location} sounds like a nice place to live${personalInfo.name ? `, ${personalInfo.name}` : ""}! I'll remember this for our future chats.`
    }

    const name = personalInfo.name ? `, ${personalInfo.name}` : ""
    return `I've noted this information${name} and will remember it for our future chats!`
  }

  // GOLDEN CODE: Language response with personal touch
  private generateLanguageResponseWithPersonalTouch(input: string, thinkingResult: any, personalInfo: any): string {
    const lowerInput = input.toLowerCase()
    const name = personalInfo.name ? `, ${personalInfo.name}` : ""

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return `Hello${name}! I'm ZacAI, and I'm here to help you. I can think through problems, remember our conversations, and learn from our interactions!`
    }

    if (lowerInput.includes("how are you")) {
      return `I'm doing well, thank you${name}! My thinking processes are running smoothly, and I'm ready to help you with whatever you need.`
    }

    if (lowerInput.includes("what can you do")) {
      return `I can engage in thoughtful conversations${name}, solve mathematical problems, remember our discussions, and learn from every interaction. I use advanced reasoning to understand context and provide helpful responses!`
    }

    // Use thinking result as base with personal touch
    const baseResponse =
      thinkingResult.synthesis?.primaryInsight ||
      "I understand what you're saying. Let me think about this and provide a thoughtful response."

    return `${baseResponse}${name ? ` I'm glad we're chatting, ${personalInfo.name}!` : ""}`
  }

  private generateKnowledgeResponse(input: string): string {
    const responses = [
      "Let me share what I know about this topic.",
      "I have some information that might be helpful.",
      "Based on my understanding, here's what I can tell you.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
}
