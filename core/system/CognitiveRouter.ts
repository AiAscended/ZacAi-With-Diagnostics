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
    console.log("🧭 CognitiveRouter: Initialized with true golden code")
    this.isInitialized = true
  }

  public async route(userMessage: string, context: any): Promise<any> {
    console.log(`🧭 CognitiveRouter: Processing with true golden code: "${userMessage}"`)

    // GOLDEN CODE: Extract personal info FIRST (synchronously) like CognitiveAISystem did
    const extractedPersonalInfo = this.extractAndStorePersonalInfoImmediate(userMessage)

    // GOLDEN CODE: Check for immediate personal info responses (like the original CognitiveAISystem)
    const immediateResponse = this.generateImmediatePersonalResponse(userMessage, extractedPersonalInfo)

    if (immediateResponse) {
      // Store the extracted info in memory engine
      if (Object.keys(extractedPersonalInfo).length > 0) {
        await this.engines.memoryEngine.storeMemory({
          type: "conversation",
          userMessage: userMessage,
          extractedInfo: extractedPersonalInfo,
          immediate: true,
        })
      }

      return {
        content: immediateResponse,
        confidence: 0.95,
        reasoning: ["Immediate personal info recognition and response"],
        pathways: ["personal_info_immediate"],
        synthesis: { primaryInsight: "Personal information processed immediately" },
        thinkingProcess: ["🧠 Recognized personal information", "💭 Generated immediate personalized response"],
        mathAnalysis: null,
        knowledgeUsed: ["personal_memory"],
      }
    }

    // Continue with normal routing if no immediate response
    const routingDecision = this.determineRouting(userMessage, extractedPersonalInfo)
    console.log(`🧭 Primary engine: ${routingDecision.primaryEngine}`)

    // Process through ThinkingEngine
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

  // GOLDEN CODE: Exact extraction pattern from CognitiveAISystem
  private extractAndStorePersonalInfoImmediate(message: string): any {
    const extractedInfo: any = {}

    // GOLDEN CODE: Personal patterns from the working CognitiveAISystem
    const personalPatterns = [
      {
        pattern: /(?:my name is|i'm|i am|call me)\s+(\w+)/i,
        key: "name",
        importance: 0.9,
        extract: (match: RegExpMatchArray) => match[1],
      },
      {
        pattern: /i have (\d+)\s+(cats?|dogs?|pets?)/i,
        key: "pets",
        importance: 0.7,
        extract: (match: RegExpMatchArray) => `${match[1]} ${match[2]}`,
      },
      {
        pattern: /(?:one|first)\s+(?:is\s+)?(?:named|called)\s+(\w+)/i,
        key: "pet_name_1",
        importance: 0.6,
        extract: (match: RegExpMatchArray) => match[1],
      },
      {
        pattern: /(?:other|second|another)\s+(?:is\s+)?(?:named|called)\s+(\w+)/i,
        key: "pet_name_2",
        importance: 0.6,
        extract: (match: RegExpMatchArray) => match[1],
      },
      {
        pattern: /named\s+(\w+)\s+and\s+(\w+)/i,
        key: "pet_names_both",
        importance: 0.6,
        extract: (match: RegExpMatchArray) => ({ name1: match[1], name2: match[2] }),
      },
      {
        pattern: /i work as (?:a |an )?(.+)/i,
        key: "job",
        importance: 0.8,
        extract: (match: RegExpMatchArray) => match[1],
      },
      {
        pattern: /i live in (.+)/i,
        key: "location",
        importance: 0.7,
        extract: (match: RegExpMatchArray) => match[1],
      },
    ]

    personalPatterns.forEach(({ pattern, key, importance, extract }) => {
      const match = message.match(pattern)
      if (match) {
        const value = extract(match)
        if (key === "pet_names_both" && typeof value === "object") {
          extractedInfo["pet_name_1"] = value.name1
          extractedInfo["pet_name_2"] = value.name2
        } else {
          extractedInfo[key] = value
        }
        console.log(`📝 CognitiveRouter: Extracted ${key} = ${JSON.stringify(value)}`)
      }
    })

    return extractedInfo
  }

  // GOLDEN CODE: Immediate response generation like CognitiveAISystem did
  private generateImmediatePersonalResponse(userMessage: string, extractedInfo: any): string | null {
    const lowerMessage = userMessage.toLowerCase()

    // GOLDEN CODE: Name recognition with immediate usage
    if (extractedInfo.name) {
      if (lowerMessage.includes("my name is")) {
        return `Nice to meet you, ${extractedInfo.name}! I'll remember your name for all our future conversations. How can I help you today?`
      }
      if (lowerMessage.includes("i'm") || lowerMessage.includes("i am")) {
        return `Hello ${extractedInfo.name}! Thank you for introducing yourself. I'll remember your name and use it in our conversations. What would you like to explore together?`
      }
    }

    // GOLDEN CODE: Pet information with immediate name usage
    if (extractedInfo.pets) {
      let response = `That's wonderful${extractedInfo.name ? `, ${extractedInfo.name}` : ""}! You have ${extractedInfo.pets}.`

      if (extractedInfo.pet_name_1) {
        response += ` ${extractedInfo.pet_name_1} sounds like a great companion!`
      }

      if (extractedInfo.pet_name_2) {
        response += ` And ${extractedInfo.pet_name_2} too!`
      }

      response += " I love hearing about pets and I'll remember this information about your furry friends."
      return response
    }

    // GOLDEN CODE: Job information with immediate name usage
    if (extractedInfo.job) {
      return `Thanks for sharing that${extractedInfo.name ? `, ${extractedInfo.name}` : ""}! Working as ${extractedInfo.job.trim()} must be interesting. I'll keep this information in mind for our conversations.`
    }

    // GOLDEN CODE: Location information with immediate name usage
    if (extractedInfo.location) {
      return `${extractedInfo.location.trim()} sounds like a nice place to live${extractedInfo.name ? `, ${extractedInfo.name}` : ""}! I'll remember this for our future chats.`
    }

    // GOLDEN CODE: General personal info sharing (from CognitiveAISystem)
    if (lowerMessage.includes("my name is") || lowerMessage.includes("i am") || lowerMessage.includes("i have")) {
      return `Thank you for sharing that information with me! I'll remember this in my personal memory system. I'm constantly learning and can now help with math problems, look up word definitions online, and even explore scientific concepts together!`
    }

    return null // No immediate response needed
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

    // Personal info sharing detection
    if (/(?:my name is|i'm|i am|call me|i have|i work|i live)/.test(lowerMessage)) {
      return {
        primaryEngine: "memory",
        secondaryEngines: ["thinking", "language"],
        confidence: 0.95,
        reasoning: "Personal information sharing detected",
        personalInfo,
      }
    }

    // Dictionary/definition request detection
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
      // Enhanced knowledge processing with thinking fallback
      const knowledgeResult = await this.engines.knowledgeEngine.processKnowledge(userMessage)
      if (knowledgeResult.found) {
        knowledgeUsed = knowledgeResult.results.map((r: any) => r.key)
        enhancedContent = `Based on my knowledge${userName ? `, ${userName}` : ""}: ${this.generateKnowledgeResponse("")}`
      } else {
        // GOLDEN CODE: Thinking fallback when knowledge lookup fails (from CognitiveAISystem)
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
