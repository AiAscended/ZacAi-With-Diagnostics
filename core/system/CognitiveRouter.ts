export interface RoutingDecision {
  primaryEngine: string
  secondaryEngines: string[]
  confidence: number
  reasoning: string
  personalInfo?: any
  immediateResponse?: string
}

export class CognitiveRouter {
  private engines: any
  private isInitialized = false

  constructor(engines: any) {
    this.engines = engines
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return
    console.log("🧭 CognitiveRouter: Initialized with golden code integration")
    this.isInitialized = true
  }

  public async route(userMessage: string, context: any): Promise<any> {
    console.log(`🧭 CognitiveRouter: Processing with golden code: "${userMessage}"`)

    // GOLDEN CODE: Extract personal info IMMEDIATELY and generate instant response if needed
    const personalContext = await this.extractAndProcessPersonalInfoImmediate(userMessage)

    // If we have an immediate response (like name recognition), use it
    if (personalContext.immediateResponse) {
      return {
        content: personalContext.immediateResponse,
        confidence: 0.95,
        reasoning: ["Immediate personal info recognition and response"],
        pathways: ["personal_info_immediate"],
        synthesis: { primaryInsight: "Personal information processed immediately" },
        thinkingProcess: ["🧠 Recognized personal information", "💭 Generated immediate personalized response"],
        mathAnalysis: null,
        knowledgeUsed: ["personal_memory"],
      }
    }

    // Determine routing decision with personal info context
    const routingDecision = this.determineRouting(userMessage, personalContext.extractedInfo)
    console.log(`🧭 Primary engine: ${routingDecision.primaryEngine}`)

    // Process through ThinkingEngine with personal context
    const thinkingResult = await this.engines.thinkingEngine.processThought(userMessage, context, routingDecision)

    // Enhance with specific engine processing
    const enhancedResponse = await this.enhanceWithEngines(
      userMessage,
      thinkingResult,
      routingDecision,
      personalContext.extractedInfo,
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

  // GOLDEN CODE: Merged from CognitiveAISystem + EnhancedAISystemV2 - Immediate extraction and response
  private async extractAndProcessPersonalInfoImmediate(message: string): Promise<any> {
    const lowerMessage = message.toLowerCase()
    const extractedInfo: any = {}
    let immediateResponse: string | null = null

    // GOLDEN PATTERNS: Enhanced from multiple old systems
    const personalPatterns = [
      {
        pattern: /(?:my name is|i'm|i am|call me)\s+(\w+)/i,
        key: "name",
        importance: 0.9,
        immediateResponseGenerator: (name: string) =>
          `Nice to meet you, ${name}! I'll remember your name for all our future conversations. How can I help you today?`,
      },
      {
        pattern: /i have (\d+)\s+(cats?|dogs?|pets?)/i,
        key: "pets",
        importance: 0.7,
        multiCapture: true,
        immediateResponseGenerator: (count: string, type: string, fullMessage: string) => {
          const petNames = this.extractPetNamesFromMessage(fullMessage)
          let response = `That's wonderful! You have ${count} ${type}.`

          if (petNames.length > 0) {
            if (petNames.length === 1) {
              response += ` ${petNames[0]} sounds like a great companion!`
            } else if (petNames.length === 2) {
              response += ` ${petNames[0]} and ${petNames[1]} sound like wonderful companions!`
            }
          }

          response += " I love hearing about pets and I'll remember this information about your furry friends."
          return response
        },
      },
      {
        pattern: /i work as (?:a |an )?(.+)/i,
        key: "job",
        importance: 0.8,
        immediateResponseGenerator: (job: string, fullMessage: string) => {
          const name = this.extractNameFromContext(fullMessage)
          return `Thanks for sharing that${name ? `, ${name}` : ""}! Working as ${job.trim()} must be interesting. I'll keep this information in mind for our conversations.`
        },
      },
      {
        pattern: /i live in (.+)/i,
        key: "location",
        importance: 0.7,
        immediateResponseGenerator: (location: string, fullMessage: string) => {
          const name = this.extractNameFromContext(fullMessage)
          return `${location.trim()} sounds like a nice place to live${name ? `, ${name}` : ""}! I'll remember this for our future chats.`
        },
      },
    ]

    // Process each pattern
    for (const patternConfig of personalPatterns) {
      const match = message.match(patternConfig.pattern)
      if (match && match[1]) {
        if (patternConfig.multiCapture && match[2]) {
          extractedInfo[patternConfig.key] = `${match[1]} ${match[2]}`
          if (patternConfig.immediateResponseGenerator) {
            immediateResponse = patternConfig.immediateResponseGenerator(match[1], match[2], message)
          }
        } else {
          extractedInfo[patternConfig.key] = match[1].trim()
          if (patternConfig.immediateResponseGenerator) {
            immediateResponse = patternConfig.immediateResponseGenerator(match[1], message)
          }
        }

        // Store in memory engine immediately
        await this.engines.memoryEngine.storeMemory({
          type: "conversation",
          userMessage: message,
          extractedInfo: { [patternConfig.key]: extractedInfo[patternConfig.key] },
          immediate: true,
        })

        console.log(
          `📝 CognitiveRouter: Immediately processed: ${patternConfig.key} = ${extractedInfo[patternConfig.key]}`,
        )
        break // Use first match for immediate response
      }
    }

    return {
      extractedInfo,
      immediateResponse,
    }
  }

  // GOLDEN CODE: Enhanced pet name extraction from multiple old systems
  private extractPetNamesFromMessage(message: string): string[] {
    const petNames: string[] = []

    const petNamePatterns = [
      /(?:one|first|older)\s+(?:is\s+)?(?:named|called)\s+(\w+)/i,
      /(?:other|second|younger|another)\s+(?:is\s+)?(?:named|called)\s+(\w+)/i,
      /(?:and|,)\s*(\w+)\s+(?:is\s+)?(?:the\s+)?(?:other|second)/i,
      /named\s+(\w+)\s+and\s+(\w+)/i,
      /(\w+)\s+and\s+(\w+)\s+are\s+(?:my|their)\s+names/i,
    ]

    petNamePatterns.forEach((pattern) => {
      const match = message.match(pattern)
      if (match) {
        if (match[1]) petNames.push(match[1])
        if (match[2]) petNames.push(match[2])
      }
    })

    return [...new Set(petNames)] // Remove duplicates
  }

  // GOLDEN CODE: Extract name from current context (if mentioned in same message)
  private extractNameFromContext(message: string): string | null {
    const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+(\w+)/i)
    return nameMatch ? nameMatch[1] : null
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

    // ENHANCED: Personal info sharing detection
    if (/(?:my name is|i'm|i am|call me|i have|i work|i live)/.test(lowerMessage)) {
      return {
        primaryEngine: "memory",
        secondaryEngines: ["thinking", "language"],
        confidence: 0.95,
        reasoning: "Personal information sharing detected",
        personalInfo,
      }
    }

    // GOLDEN CODE: Dictionary/definition request detection with fallback
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

    // Memory recall detection
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

    // Get stored personal info for context
    const storedPersonalInfo = this.engines.memoryEngine.getPersonalInfo()
    const userName = storedPersonalInfo.get("name")?.value || personalInfo.name

    // Process with primary engine
    if (routingDecision.primaryEngine === "math") {
      const mathResult = await this.engines.mathEngine.processMath(userMessage)
      if (mathResult) {
        enhancedContent = `I can help you with that calculation${userName ? `, ${userName}` : ""}! ${mathResult.calculation}`
        mathAnalysis = mathResult
      }
    } else if (routingDecision.primaryEngine === "knowledge") {
      // GOLDEN CODE: Enhanced knowledge processing with thinking fallback
      const knowledgeResult = await this.engines.knowledgeEngine.processKnowledge(userMessage)
      if (knowledgeResult.found) {
        knowledgeUsed = knowledgeResult.results.map((r: any) => r.key)
        enhancedContent = `Based on my knowledge${userName ? `, ${userName}` : ""}: ${this.generateKnowledgeResponse("")}`
      } else {
        // GOLDEN CODE: Thinking fallback when knowledge lookup fails
        const wordMatch = userMessage.match(/(?:what\s+(?:is|does|means?)|define|meaning\s+of|explain)\s+(.+)/i)
        const word = wordMatch ? wordMatch[1].trim().replace(/[?!.]/g, "") : "that"

        enhancedContent = `I don't have a definition for "${word}" in my current knowledge base${userName ? `, ${userName}` : ""}, but let me think about this... Based on the context and structure of the word, I can try to help you understand it better. Could you provide more context about where you encountered this word, or would you like me to break down what I can infer about it?`
      }
    } else if (routingDecision.primaryEngine === "memory") {
      // Handle memory recall
      if (/remember|what.*know.*about.*me|do you know|recall|who am i/.test(userMessage.toLowerCase())) {
        const personalSummary = this.engines.memoryEngine.getPersonalInfoSummary()
        enhancedContent = `Here's what I remember about you: ${personalSummary}`
      } else {
        // This should have been handled by immediate response, but fallback
        enhancedContent = `I've noted this information${userName ? `, ${userName}` : ""} and will remember it for our future chats!`
      }
    } else {
      // Language processing with personal touch
      enhancedContent = this.generateLanguageResponseWithPersonalTouch(userMessage, thinkingResult, userName)
    }

    return {
      content: enhancedContent,
      confidence: thinkingResult.confidence,
      mathAnalysis,
      knowledgeUsed,
    }
  }

  private generateLanguageResponseWithPersonalTouch(input: string, thinkingResult: any, userName?: string): string {
    const lowerInput = input.toLowerCase()
    const nameGreeting = userName ? `, ${userName}` : ""

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return `Hello${nameGreeting}! I'm ZacAI, and I'm here to help you. I can think through problems, remember our conversations, and learn from our interactions!`
    }

    if (lowerInput.includes("how are you")) {
      return `I'm doing well, thank you${nameGreeting}! My thinking processes are running smoothly, and I'm ready to help you with whatever you need.`
    }

    if (lowerInput.includes("what can you do")) {
      return `I can engage in thoughtful conversations${nameGreeting}, solve mathematical problems, remember our discussions, and learn from every interaction. I use advanced reasoning to understand context and provide helpful responses!`
    }

    // Use thinking result as base with personal touch
    const baseResponse =
      thinkingResult.synthesis?.primaryInsight ||
      "I understand what you're saying. Let me think about this and provide a thoughtful response."

    return `${baseResponse}${userName ? ` I'm glad we're chatting, ${userName}!` : ""}`
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
