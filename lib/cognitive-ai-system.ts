import { BrowserStorageManager } from "./browser-storage-manager"

// Revolutionary Cognitive Processing Engine - FUNCTIONALITY ONLY
class CognitiveProcessor {
  private contextMemory: Map<string, ContextNode> = new Map()
  private semanticPatterns: Map<string, SemanticPattern> = new Map()

  constructor() {
    this.initializeSemanticPatterns()
  }

  // Core Cognitive Processing Pipeline
  public async processThought(
    input: string,
    conversationContext: any[],
    personalInfo: Map<string, any>,
  ): Promise<CognitiveResponse> {
    console.log("🧠 Starting cognitive processing for:", input)

    // Stage 1: Semantic Decomposition
    const semantics = this.decomposeSemantics(input)
    console.log("📝 Semantics:", semantics)

    // Stage 2: Context Synthesis
    const context = this.synthesizeContext(semantics, conversationContext, personalInfo)
    console.log("🔗 Context:", context)

    // Stage 3: Intent Inference
    const intent = this.inferIntent(semantics, context)
    console.log("🎯 Intent:", intent)

    // Stage 4: Knowledge Activation
    const knowledge = this.activateRelevantKnowledge(intent, context, personalInfo)
    console.log("📚 Knowledge:", knowledge)

    // Stage 5: Response Synthesis
    const response = this.synthesizeResponse(intent, context, knowledge, personalInfo)
    console.log("💬 Response:", response)

    // Stage 6: Confidence Calculation
    const confidence = this.calculateConfidence(semantics, intent, context, knowledge)

    return {
      content: response.content,
      confidence: confidence,
      reasoning: response.reasoning,
      intent: intent,
      context: context,
      semantics: semantics,
    }
  }

  private decomposeSemantics(input: string): SemanticComponents {
    const words = input.toLowerCase().match(/\b\w+\b/g) || []
    const entities = this.extractEntities(input)
    const emotions = this.detectEmotions(input)
    const concepts = this.identifyConcepts(words)
    const relationships = this.findRelationships(words, entities)

    return {
      words,
      entities,
      emotions,
      concepts,
      relationships,
      complexity: this.calculateComplexity(words, entities, concepts),
    }
  }

  private synthesizeContext(
    semantics: SemanticComponents,
    history: any[],
    personalInfo: Map<string, any>,
  ): ContextSynthesis {
    const recentContext = history.slice(-5) // Last 5 exchanges
    const topicalContext = this.extractTopicalContext(recentContext)
    const personalContext = this.extractPersonalContext(personalInfo)
    const emotionalContext = this.extractEmotionalContext(recentContext)

    return {
      recent: recentContext,
      topical: topicalContext,
      personal: personalContext,
      emotional: emotionalContext,
      continuity: this.calculateContinuity(semantics, topicalContext),
    }
  }

  private inferIntent(semantics: SemanticComponents, context: ContextSynthesis): IntentInference {
    const primaryIntent = this.classifyPrimaryIntent(semantics)
    const secondaryIntents = this.identifySecondaryIntents(semantics, context)
    const urgency = this.assessUrgency(semantics)
    const complexity = this.assessComplexity(semantics, context)

    return {
      primary: primaryIntent,
      secondary: secondaryIntents,
      urgency,
      complexity,
      confidence: this.calculateIntentConfidence(primaryIntent, secondaryIntents, context),
    }
  }

  private activateRelevantKnowledge(
    intent: IntentInference,
    context: ContextSynthesis,
    personalInfo: Map<string, any>,
  ): KnowledgeActivation {
    const relevantFacts = this.retrieveRelevantFacts(intent, context, personalInfo)
    const patterns = this.matchPatterns(intent, context)
    const analogies = this.findAnalogies(intent, context)

    return {
      facts: relevantFacts,
      patterns,
      analogies,
      confidence: this.calculateKnowledgeConfidence(relevantFacts, patterns),
    }
  }

  private synthesizeResponse(
    intent: IntentInference,
    context: ContextSynthesis,
    knowledge: KnowledgeActivation,
    personalInfo: Map<string, any>,
  ): ResponseSynthesis {
    const responseTemplate = this.selectResponseTemplate(intent, context)
    const content = this.generateContent(responseTemplate, intent, context, knowledge, personalInfo)
    const tone = this.determineTone(context, intent)
    const reasoning = this.generateReasoning(intent, context, knowledge)

    return {
      content,
      tone,
      reasoning,
      template: responseTemplate,
    }
  }

  private calculateConfidence(
    semantics: SemanticComponents,
    intent: IntentInference,
    context: ContextSynthesis,
    knowledge: KnowledgeActivation,
  ): number {
    const semanticConfidence = semantics.complexity > 0.3 ? 0.8 : 0.6
    const intentConfidence = intent.confidence
    const contextConfidence = context.continuity
    const knowledgeConfidence = knowledge.confidence

    return (semanticConfidence + intentConfidence + contextConfidence + knowledgeConfidence) / 4
  }

  // Enhanced Semantic Analysis Methods
  private extractEntities(input: string): Entity[] {
    const entities: Entity[] = []

    // Names - Enhanced patterns
    const namePattern = /(?:my name is|i'm|i am|call me) (\w+)/gi
    let match = namePattern.exec(input)
    if (match) entities.push({ type: "name", value: match[1], confidence: 0.9 })

    // Numbers
    const numberPattern = /\b(\d+(?:\.\d+)?)\b/g
    while ((match = numberPattern.exec(input)) !== null) {
      entities.push({ type: "number", value: match[1], confidence: 0.95 })
    }

    // Relationships - Enhanced
    const relationshipPattern = /(?:wife|husband|partner|spouse|girlfriend|boyfriend|married)/gi
    if (relationshipPattern.test(input)) {
      entities.push({ type: "relationship", value: "partner", confidence: 0.8 })
    }

    // Pets - Enhanced
    const petPattern = /(?:cat|dog|pet)s?/gi
    if (petPattern.test(input)) {
      entities.push({ type: "pet", value: "animal", confidence: 0.8 })
    }

    // Jobs - Enhanced
    const jobPattern = /(?:work as|job is|i'm a|i am a) (.+?)(?:\.|$|,)/gi
    match = jobPattern.exec(input)
    if (match) entities.push({ type: "job", value: match[1].trim(), confidence: 0.8 })

    return entities
  }

  private detectEmotions(input: string): EmotionalState {
    const positiveWords = ["happy", "great", "good", "excellent", "wonderful", "love", "like", "amazing", "fantastic"]
    const negativeWords = ["sad", "bad", "terrible", "hate", "dislike", "awful", "horrible", "angry"]
    const questionWords = ["what", "how", "why", "when", "where", "who", "which"]

    const words = input.toLowerCase().split(/\s+/)
    const positive = words.filter((w) => positiveWords.includes(w)).length
    const negative = words.filter((w) => negativeWords.includes(w)).length
    const questions = words.filter((w) => questionWords.includes(w)).length

    return {
      valence: positive > negative ? "positive" : negative > positive ? "negative" : "neutral",
      intensity: Math.max(positive, negative) / words.length,
      curiosity: questions / words.length,
      engagement: (positive + negative + questions) / words.length,
    }
  }

  private identifyConcepts(words: string[]): Concept[] {
    const conceptMap = new Map([
      [
        "mathematics",
        ["math", "calculate", "number", "add", "subtract", "multiply", "divide", "times", "plus", "minus", "equals"],
      ],
      ["personal", ["name", "age", "work", "job", "live", "family", "married", "wife", "husband", "pet", "cat", "dog"]],
      ["memory", ["remember", "recall", "forget", "know", "learned", "stored"]],
      ["greeting", ["hello", "hi", "hey", "goodbye", "bye", "good morning", "good afternoon", "good evening"]],
      ["question", ["what", "how", "why", "when", "where", "who", "which", "can", "could", "would"]],
      ["emotion", ["feel", "happy", "sad", "angry", "excited", "love", "like", "hate"]],
      ["learning", ["teach", "learn", "understand", "explain", "show", "tell"]],
    ])

    const concepts: Concept[] = []
    for (const [concept, keywords] of conceptMap) {
      const matches = words.filter((w) => keywords.includes(w)).length
      if (matches > 0) {
        concepts.push({
          name: concept,
          strength: matches / words.length,
          keywords: keywords.filter((k) => words.includes(k)),
        })
      }
    }

    return concepts.sort((a, b) => b.strength - a.strength)
  }

  private classifyPrimaryIntent(semantics: SemanticComponents): string {
    const concepts = semantics.concepts
    if (concepts.length === 0) return "conversation"

    const topConcept = concepts[0]

    // Mathematical intent
    if (topConcept.name === "mathematics" && topConcept.strength > 0.15) {
      return "mathematics"
    }

    // Memory intent
    if (topConcept.name === "memory" && topConcept.strength > 0.1) {
      return "memory"
    }

    // Personal information sharing
    if (topConcept.name === "personal" && topConcept.strength > 0.1) {
      return "personal_sharing"
    }

    // Question asking
    if (topConcept.name === "question" && topConcept.strength > 0.1) {
      return "inquiry"
    }

    // Greeting
    if (topConcept.name === "greeting" && topConcept.strength > 0.15) {
      return "greeting"
    }

    // Learning
    if (topConcept.name === "learning" && topConcept.strength > 0.1) {
      return "learning"
    }

    return "conversation"
  }

  private generateContent(
    template: string,
    intent: IntentInference,
    context: ContextSynthesis,
    knowledge: KnowledgeActivation,
    personalInfo: Map<string, any>,
  ): string {
    switch (intent.primary) {
      case "personal_sharing":
        return this.generatePersonalResponse(context, knowledge, personalInfo)
      case "inquiry":
        return this.generateInquiryResponse(context, knowledge, personalInfo)
      case "mathematics":
        return this.generateMathResponse(context, knowledge)
      case "memory":
        return this.generateMemoryResponse(context, knowledge, personalInfo)
      case "greeting":
        return this.generateGreetingResponse(context, personalInfo)
      case "learning":
        return this.generateLearningResponse(context, knowledge, personalInfo)
      default:
        return this.generateConversationalResponse(context, knowledge, personalInfo)
    }
  }

  private generatePersonalResponse(
    context: ContextSynthesis,
    knowledge: KnowledgeActivation,
    personalInfo: Map<string, any>,
  ): string {
    const userName = this.getUserName(personalInfo)
    const namePrefix = userName ? `Thanks for sharing that, ${userName}! ` : "Thanks for sharing that! "

    const responses = [
      `${namePrefix}I'll remember that about you.`,
      `${namePrefix}I've stored that information and will keep it in mind.`,
      `${namePrefix}That's interesting to know - it helps me understand you better.`,
      `${namePrefix}I appreciate you telling me that. I'll remember it for our future conversations.`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private generateInquiryResponse(
    context: ContextSynthesis,
    knowledge: KnowledgeActivation,
    personalInfo: Map<string, any>,
  ): string {
    const userName = this.getUserName(personalInfo)
    const namePrefix = userName ? `${userName}, ` : ""

    if (knowledge.facts.length > 0) {
      return `${namePrefix}based on what I know: ${knowledge.facts[0].content}`
    }

    // Check if asking about personal info
    if (context.personal.facts.length > 0) {
      const personalFacts = context.personal.facts.map((f) => `${f.type}: ${f.value}`).join(", ")
      return `${namePrefix}here's what I remember about you: ${personalFacts}`
    }

    const responses = [
      `${namePrefix}that's a great question! Let me think about that...`,
      `${namePrefix}I'd be happy to help you with that. Can you provide more context?`,
      `${namePrefix}that's interesting to consider. What specifically would you like to know?`,
      `${namePrefix}good question! I'm processing that and would love to explore it further.`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private generateMathResponse(context: ContextSynthesis, knowledge: KnowledgeActivation): string {
    return "I can help you with that calculation. Let me process the mathematical expression."
  }

  private generateMemoryResponse(
    context: ContextSynthesis,
    knowledge: KnowledgeActivation,
    personalInfo: Map<string, any>,
  ): string {
    const userName = this.getUserName(personalInfo)
    const namePrefix = userName ? `${userName}, ` : ""

    if (personalInfo.size > 0) {
      const facts = Array.from(personalInfo.entries())
        .map(([key, entry]) => {
          const value = typeof entry === "object" ? entry.value : entry
          return `${key}: ${value}`
        })
        .slice(0, 3)
        .join(", ")
      return `${namePrefix}I remember: ${facts}`
    }

    if (knowledge.facts.length > 0) {
      return `${namePrefix}I remember: ${knowledge.facts.map((f) => f.content).join(", ")}`
    }

    return `${namePrefix}I'm searching my memory for that information...`
  }

  private generateGreetingResponse(context: ContextSynthesis, personalInfo: Map<string, any>): string {
    const timeOfDay = new Date().getHours()
    const greeting = timeOfDay < 12 ? "Good morning" : timeOfDay < 18 ? "Good afternoon" : "Good evening"
    const userName = this.getUserName(personalInfo)
    const namePrefix = userName ? ` ${userName}` : ""

    const responses = [
      `${greeting}${namePrefix}! How can I help you today?`,
      `Hello${namePrefix}! Great to see you again!`,
      `Hi there${namePrefix}! What's on your mind?`,
      `Hey${namePrefix}! I'm here and ready to chat.`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private generateLearningResponse(
    context: ContextSynthesis,
    knowledge: KnowledgeActivation,
    personalInfo: Map<string, any>,
  ): string {
    const userName = this.getUserName(personalInfo)
    const namePrefix = userName ? `${userName}, ` : ""

    const responses = [
      `${namePrefix}I'd be happy to help you learn about that! What would you like to know?`,
      `${namePrefix}that's a great topic to explore. Let me share what I know...`,
      `${namePrefix}I love helping with learning! What specific aspect interests you?`,
      `${namePrefix}let's dive into that together. What would you like to understand better?`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private generateConversationalResponse(
    context: ContextSynthesis,
    knowledge: KnowledgeActivation,
    personalInfo: Map<string, any>,
  ): string {
    const userName = this.getUserName(personalInfo)
    const namePrefix = userName ? `${userName}, ` : ""

    const responses = [
      `${namePrefix}that's really interesting! Tell me more about that.`,
      `${namePrefix}I see what you mean. What's your perspective on this?`,
      `${namePrefix}that makes sense. How do you feel about it?`,
      `${namePrefix}I understand. What would you like to explore about this topic?`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private getUserName(personalInfo: Map<string, any>): string | null {
    const nameEntry = personalInfo.get("name")
    if (nameEntry) {
      return typeof nameEntry === "object" ? nameEntry.value : nameEntry
    }
    return null
  }

  // Helper methods for context and pattern matching
  private extractTopicalContext(history: any[]): string[] {
    return (
      history
        .map((h) => h.content)
        .join(" ")
        .match(/\b\w{4,}\b/g) || []
    )
  }

  private extractPersonalContext(personalInfo: Map<string, any>): PersonalContext {
    const personal: PersonalContext = { facts: [], preferences: [], relationships: [] }

    for (const [key, entry] of personalInfo.entries()) {
      const value = typeof entry === "object" ? entry.value : entry
      personal.facts.push({ type: key, value: value })
    }

    return personal
  }

  private extractEmotionalContext(history: any[]): EmotionalContext {
    return {
      overall_tone: "neutral",
      engagement_level: 0.7,
      satisfaction: 0.8,
    }
  }

  private calculateContinuity(semantics: SemanticComponents, topical: string[]): number {
    const overlap = semantics.words.filter((w) => topical.includes(w)).length
    return overlap / Math.max(semantics.words.length, 1)
  }

  private calculateComplexity(words: string[], entities: Entity[], concepts: Concept[]): number {
    return (words.length * 0.1 + entities.length * 0.3 + concepts.length * 0.6) / 10
  }

  private initializeSemanticPatterns(): void {
    // Initialize common semantic patterns for faster processing
    this.semanticPatterns.set("greeting", {
      patterns: [/^(hi|hello|hey)/i],
      weight: 0.9,
      response_type: "greeting",
    })

    this.semanticPatterns.set("math", {
      patterns: [/\d+\s*[+\-*/]\s*\d+/, /calculate|compute/i],
      weight: 0.95,
      response_type: "mathematics",
    })
  }

  // Additional helper methods
  private findRelationships(words: string[], entities: Entity[]): Relationship[] {
    return []
  }

  private identifySecondaryIntents(semantics: SemanticComponents, context: ContextSynthesis): string[] {
    return []
  }

  private assessUrgency(semantics: SemanticComponents): number {
    return 0.5
  }

  private assessComplexity(semantics: SemanticComponents, context: ContextSynthesis): number {
    return semantics.complexity
  }

  private calculateIntentConfidence(primary: string, secondary: string[], context: ContextSynthesis): number {
    return 0.8
  }

  private retrieveRelevantFacts(
    intent: IntentInference,
    context: ContextSynthesis,
    personalInfo: Map<string, any>,
  ): Fact[] {
    const facts: Fact[] = []

    // Add personal info as facts
    for (const [key, entry] of personalInfo.entries()) {
      const value = typeof entry === "object" ? entry.value : entry
      facts.push({
        content: `${key}: ${value}`,
        confidence: 0.9,
        source: "personal",
      })
    }

    return facts
  }

  private matchPatterns(intent: IntentInference, context: ContextSynthesis): Pattern[] {
    return []
  }

  private findAnalogies(intent: IntentInference, context: ContextSynthesis): Analogy[] {
    return []
  }

  private calculateKnowledgeConfidence(facts: Fact[], patterns: Pattern[]): number {
    return facts.length > 0 ? 0.8 : 0.5
  }

  private selectResponseTemplate(intent: IntentInference, context: ContextSynthesis): string {
    return "default"
  }

  private determineTone(context: ContextSynthesis, intent: IntentInference): string {
    return "friendly"
  }

  private generateReasoning(
    intent: IntentInference,
    context: ContextSynthesis,
    knowledge: KnowledgeActivation,
  ): string[] {
    return [
      `Identified intent: ${intent.primary}`,
      `Context continuity: ${context.continuity.toFixed(2)}`,
      `Knowledge confidence: ${knowledge.confidence.toFixed(2)}`,
      `Personal context: ${context.personal.facts.length} facts available`,
    ]
  }
}

// Enhanced AI System with Cognitive Processing
export class CognitiveAISystem {
  private cognitiveProcessor = new CognitiveProcessor()
  private mathProcessor = new EnhancedMathProcessor()
  private storageManager = new BrowserStorageManager()
  private conversationHistory: ChatMessage[] = []
  private memory: Map<string, any> = new Map()
  private vocabulary: Map<string, string> = new Map()
  private personalInfo: Map<string, PersonalInfoEntry> = new Map()
  private facts: Map<string, FactEntry> = new Map()
  private systemStatus = "idle"
  private isInitialized = false

  constructor() {
    this.initializeBasicVocabulary()
    this.initializeBasicMathFunctions()
    this.initializeSampleFacts()
  }

  // ADD MISSING sendMessage METHOD
  public async sendMessage(userMessage: string): Promise<string> {
    const response = await this.processMessage(userMessage)
    return response.content
  }

  public async processMessage(userMessage: string): Promise<AIResponse> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log("🚀 Processing message:", userMessage)

    // Extract and store personal information FIRST
    this.extractAndStorePersonalInfo(userMessage)

    // Check for math first
    const mathAnalysis = this.mathProcessor.analyzeMathExpression(userMessage)
    if (mathAnalysis.isMatch && mathAnalysis.result !== undefined) {
      const response: AIResponse = {
        content: `The result is: ${mathAnalysis.result}`,
        confidence: mathAnalysis.confidence,
        reasoning: mathAnalysis.reasoning,
        mathAnalysis: mathAnalysis,
      }
      await this.saveConversation(userMessage, response.content)
      return response
    }

    // Use cognitive processing for intelligent response
    const cognitiveResponse = await this.cognitiveProcessor.processThought(
      userMessage,
      this.conversationHistory,
      this.personalInfo,
    )

    const response: AIResponse = {
      content: cognitiveResponse.content,
      confidence: cognitiveResponse.confidence,
      reasoning: cognitiveResponse.reasoning,
    }

    await this.saveConversation(userMessage, response.content)
    return response
  }

  private extractAndStorePersonalInfo(message: string): void {
    const personalPatterns = [
      {
        pattern: /(?:my name is|i'm|i am|call me) (\w+)/i,
        key: "name",
        importance: 0.9,
        extract: (match: RegExpMatchArray) => match[1],
      },
      {
        pattern: /i have (\d+) (cats?|dogs?|pets?)/i,
        key: "pets",
        importance: 0.7,
        extract: (match: RegExpMatchArray) => `${match[1]} ${match[2]}`,
      },
      {
        pattern: /i (?:have a|am married to a|married a) (wife|husband|partner)/i,
        key: "marital_status",
        importance: 0.8,
        extract: (match: RegExpMatchArray) => `married (${match[1]})`,
      },
      {
        pattern: /(?:one is named|first one is|cat is named|dog is named) (\w+)/i,
        key: "pet_name_1",
        importance: 0.6,
        extract: (match: RegExpMatchArray) => match[1],
      },
      {
        pattern: /(?:the )?other (?:one )?is (?:named )?(\w+)/i,
        key: "pet_name_2",
        importance: 0.6,
        extract: (match: RegExpMatchArray) => match[1],
      },
      {
        pattern: /i work as (?:a |an )?(.+?)(?:\.|$|,)/i,
        key: "job",
        importance: 0.8,
        extract: (match: RegExpMatchArray) => match[1].trim(),
      },
      {
        pattern: /i live in (.+?)(?:\.|$|,)/i,
        key: "location",
        importance: 0.7,
        extract: (match: RegExpMatchArray) => match[1].trim(),
      },
      {
        pattern: /i am (\d+) years old/i,
        key: "age",
        importance: 0.7,
        extract: (match: RegExpMatchArray) => match[1],
      },
    ]

    personalPatterns.forEach(({ pattern, key, importance, extract }) => {
      const match = message.match(pattern)
      if (match) {
        const value = extract(match)
        const entry: PersonalInfoEntry = {
          key,
          value,
          timestamp: Date.now(),
          importance,
          type: "personal_info",
          source: "conversation",
        }
        this.personalInfo.set(key, entry)
        console.log(`📝 Stored personal info: ${key} = ${value}`)
      }
    })
  }

  public getStats(): any {
    const assistantMessages = this.conversationHistory.filter((m) => m.role === "assistant" && m.confidence)
    const avgConfidence =
      assistantMessages.length > 0
        ? assistantMessages.reduce((sum, m) => sum + (m.confidence || 0), 0) / assistantMessages.length
        : 0

    // FIXED: Count all user information sources properly
    const totalUserInfo = this.personalInfo.size + this.memory.size

    console.log("📊 Stats calculation:", {
      personalInfo: this.personalInfo.size,
      memory: this.memory.size,
      facts: this.facts.size,
      totalUserInfo: totalUserInfo,
    })

    return {
      totalMessages: this.conversationHistory.length,
      vocabularySize: this.vocabulary.size,
      memoryEntries: totalUserInfo, // Fixed: Now counts personal info + memory correctly
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      systemStatus: this.systemStatus,
      mathFunctions: this.mathFunctions.size,
      seedProgress: 0,
      responseTime: 0,
      // Separate data access for detailed viewing
      vocabularyData: this.vocabulary,
      memoryData: this.memory,
      personalInfoData: this.personalInfo,
      factsData: this.facts,
      mathFunctionsData: this.mathFunctions,
    }
  }

  // Rest of the implementation continues with all the missing methods...
  private mathFunctions: Map<string, MathFunction> = new Map()

  private initializeBasicMathFunctions(): void {
    const basicMath: MathFunction[] = [
      {
        name: "add",
        description: "Addition",
        examples: ["2 + 3", "add 5 and 7"],
        func: (a: number, b: number) => a + b,
      },
      {
        name: "subtract",
        description: "Subtraction",
        examples: ["10 - 3", "subtract 4 from 9"],
        func: (a: number, b: number) => a - b,
      },
      {
        name: "multiply",
        description: "Multiplication",
        examples: ["4 * 5", "multiply 3 by 6"],
        func: (a: number, b: number) => a * b,
      },
      {
        name: "divide",
        description: "Division",
        examples: ["15 / 3", "divide 20 by 4"],
        func: (a: number, b: number) => (b !== 0 ? a / b : "Cannot divide by zero"),
      },
    ]

    basicMath.forEach((func) => this.mathFunctions.set(func.name, func))
  }

  private initializeBasicVocabulary(): void {
    const basicWords = [
      "hello",
      "hi",
      "hey",
      "goodbye",
      "bye",
      "thanks",
      "thank",
      "please",
      "yes",
      "no",
      "maybe",
      "sure",
      "okay",
      "ok",
      "good",
      "bad",
      "great",
      "what",
      "who",
      "where",
      "when",
      "why",
      "how",
      "can",
      "could",
      "would",
      "like",
      "love",
      "want",
      "need",
      "know",
      "think",
      "remember",
      "forget",
      "help",
      "sorry",
      "excuse",
      "understand",
      "explain",
      "tell",
      "say",
      "calculate",
      "math",
      "number",
      "add",
      "subtract",
      "multiply",
      "divide",
      "times",
      "plus",
      "minus",
      "equals",
      "result",
      "answer",
    ]

    basicWords.forEach((word) => this.vocabulary.set(word.toLowerCase(), "basic"))
  }

  private initializeSampleFacts(): void {
    const sampleFacts = [
      { category: "science", fact: "Water boils at 100°C at sea level" },
      { category: "history", fact: "The first computer was ENIAC, built in 1946" },
      { category: "geography", fact: "Mount Everest is 8,848 meters tall" },
    ]

    sampleFacts.forEach((item) => {
      this.facts.set(`fact_${item.category}`, {
        key: `fact_${item.category}`,
        value: item.fact,
        timestamp: Date.now(),
        importance: 0.8,
        type: "fact",
        source: "system",
      })
    })
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🚀 Initializing Cognitive AI System...")

      await this.loadConversationHistory()
      await this.loadMemory()
      await this.loadVocabulary()

      this.systemStatus = "ready"
      this.isInitialized = true

      console.log("✅ Cognitive AI System ready!")
    } catch (error) {
      console.error("❌ Initialization failed:", error)
      this.systemStatus = "ready"
      this.isInitialized = true
    }
  }

  private async loadConversationHistory(): Promise<void> {
    try {
      const conversations = await this.storageManager.loadConversations()
      this.conversationHistory = conversations.filter((msg) => msg && msg.id && msg.role && msg.content)
    } catch (error) {
      console.warn("Failed to load conversation history:", error)
      this.conversationHistory = []
    }
  }

  private async loadMemory(): Promise<void> {
    try {
      const memory = await this.storageManager.loadMemory()
      this.memory = memory
    } catch (error) {
      console.warn("Failed to load memory:", error)
      this.memory = new Map()
    }
  }

  private async loadVocabulary(): Promise<void> {
    try {
      const vocabulary = await this.storageManager.loadVocabulary()
      vocabulary.forEach((category, word) => {
        this.vocabulary.set(word, category)
      })
    } catch (error) {
      console.warn("Failed to load vocabulary:", error)
    }
  }

  private async saveConversation(userMessage: string, aiResponse: string): Promise<void> {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponse,
      timestamp: Date.now(),
    }

    this.conversationHistory.push(userMsg, aiMsg)

    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-80)
    }

    await this.saveConversationHistory()
    await this.saveMemory()
    await this.saveVocabulary()
  }

  private async saveConversationHistory(): Promise<void> {
    try {
      await this.storageManager.saveConversations(this.conversationHistory)
    } catch (error) {
      console.warn("Failed to save conversation:", error)
    }
  }

  private async saveMemory(): Promise<void> {
    try {
      await this.storageManager.saveMemory(this.memory)
    } catch (error) {
      console.warn("Failed to save memory:", error)
    }
  }

  private async saveVocabulary(): Promise<void> {
    try {
      await this.storageManager.saveVocabulary(this.vocabulary)
    } catch (error) {
      console.warn("Failed to save vocabulary:", error)
    }
  }

  public getMathFunctionCount(): number {
    return this.mathFunctions.size
  }

  public generateSuggestions(messages: ChatMessage[]): any[] {
    return [
      { text: "Tell me about yourself", type: "question" },
      { text: "What can you remember about me?", type: "question" },
      { text: "Calculate 25 × 4", type: "action" },
    ]
  }

  public generateResponseSuggestions(userInput: string, response: string): string[] {
    return ["Tell me more", "What else?", "Can you explain that?"]
  }

  public processFeedback(messageId: string, feedback: string): void {
    console.log(`Feedback received for ${messageId}: ${feedback}`)
  }

  public updateResponseTime(time: number): void {
    console.log(`Response time: ${time}ms`)
  }

  public exportData(): any {
    return {
      conversations: this.conversationHistory,
      vocabulary: Array.from(this.vocabulary.entries()),
      memory: Array.from(this.memory.entries()),
      personalInfo: Array.from(this.personalInfo.entries()),
      facts: Array.from(this.facts.entries()),
      mathFunctions: Array.from(this.mathFunctions.entries()),
      timestamp: Date.now(),
    }
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  public async addVocabularyWord(word: string, category: string): Promise<void> {
    this.vocabulary.set(word.toLowerCase(), category)
    await this.saveVocabulary()
  }

  public async removeVocabularyWord(word: string): Promise<void> {
    this.vocabulary.delete(word.toLowerCase())
    await this.saveVocabulary()
  }

  public async addMemoryEntry(key: string, value: string): Promise<void> {
    const entry = {
      key: key.toLowerCase().replace(/\s+/g, "_"),
      value: value,
      timestamp: Date.now(),
      importance: 0.7,
    }
    this.memory.set(entry.key, entry)
    await this.saveMemory()
  }

  public async removeMemoryEntry(key: string): Promise<void> {
    this.memory.delete(key)
    await this.saveMemory()
  }

  public async clearAllData(): Promise<void> {
    try {
      this.conversationHistory = []
      this.vocabulary = new Map()
      this.memory = new Map()
      this.personalInfo = new Map()
      this.facts = new Map()
      this.mathFunctions = new Map()

      await this.storageManager.clearAllData()
      console.log("✅ All AI system data cleared")
    } catch (error) {
      console.error("❌ Failed to clear AI system data:", error)
      throw error
    }
  }

  public async retrainFromKnowledge(): Promise<void> {
    try {
      console.log("🔄 Retraining AI system from knowledge base...")

      const storedData = await this.storageManager.exportAllData()
      if (storedData) {
        if (storedData.vocabulary) {
          this.vocabulary = new Map(storedData.vocabulary)
        }
        if (storedData.memory) {
          this.memory = new Map(storedData.memory)
        }
      }

      this.initializeBasicMathFunctions()

      await this.saveConversationHistory()
      await this.saveMemory()
      await this.saveVocabulary()

      console.log("✅ AI system retrained successfully")
    } catch (error) {
      console.error("❌ AI system retraining failed:", error)
      throw error
    }
  }
}

// Enhanced Math Processor (keeping existing functionality)
class EnhancedMathProcessor {
  private mathPatterns: MathPattern[] = []

  constructor() {
    this.initializeMathPatterns()
  }

  private initializeMathPatterns(): void {
    this.mathPatterns = [
      {
        pattern: /(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "multiply",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "add",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "subtract",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*[/÷]\s*(\d+(?:\.\d+)?)\s*=?\s*$/i,
        operation: "divide",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
    ]
  }

  public analyzeMathExpression(input: string): MathAnalysis {
    const cleanInput = input.trim().toLowerCase()
    const reasoning: string[] = []

    reasoning.push(`Analyzing input: "${input}"`)

    for (const pattern of this.mathPatterns) {
      const match = cleanInput.match(pattern.pattern)
      if (match) {
        reasoning.push(`Matched pattern for ${pattern.operation}`)

        try {
          const numbers = pattern.extract(match)
          reasoning.push(`Extracted numbers: ${numbers.join(", ")}`)

          const result = this.performOperation(pattern.operation, numbers)
          reasoning.push(`Calculated result: ${result}`)

          return {
            isMatch: true,
            operation: pattern.operation,
            numbers: numbers,
            result: result,
            confidence: pattern.confidence,
            reasoning: reasoning,
          }
        } catch (error) {
          reasoning.push(`Error in calculation: ${error}`)
          return {
            isMatch: false,
            operation: pattern.operation,
            numbers: [],
            result: undefined,
            confidence: 0.3,
            reasoning: reasoning,
          }
        }
      }
    }

    reasoning.push("No mathematical content detected")
    return {
      isMatch: false,
      operation: "none",
      numbers: [],
      result: undefined,
      confidence: 0.0,
      reasoning: reasoning,
    }
  }

  private performOperation(operation: string, numbers: number[]): number {
    switch (operation) {
      case "add":
        return numbers[0] + numbers[1]
      case "subtract":
        return numbers[0] - numbers[1]
      case "multiply":
        return numbers[0] * numbers[1]
      case "divide":
        if (numbers[1] === 0) throw new Error("Cannot divide by zero")
        return numbers[0] / numbers[1]
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }
}

// Type Definitions
interface CognitiveResponse {
  content: string
  confidence: number
  reasoning: string[]
  intent: IntentInference
  context: ContextSynthesis
  semantics: SemanticComponents
}

interface SemanticComponents {
  words: string[]
  entities: Entity[]
  emotions: EmotionalState
  concepts: Concept[]
  relationships: Relationship[]
  complexity: number
}

interface Entity {
  type: string
  value: string
  confidence: number
}

interface EmotionalState {
  valence: "positive" | "negative" | "neutral"
  intensity: number
  curiosity: number
  engagement: number
}

interface Concept {
  name: string
  strength: number
  keywords: string[]
}

interface Relationship {
  from: string
  to: string
  type: string
  strength: number
}

interface ContextSynthesis {
  recent: any[]
  topical: string[]
  personal: PersonalContext
  emotional: EmotionalContext
  continuity: number
}

interface PersonalContext {
  facts: Array<{ type: string; value: string }>
  preferences: Array<{ type: string; value: string }>
  relationships: Array<{ type: string; value: string }>
}

interface EmotionalContext {
  overall_tone: string
  engagement_level: number
  satisfaction: number
}

interface IntentInference {
  primary: string
  secondary: string[]
  urgency: number
  complexity: number
  confidence: number
}

interface KnowledgeActivation {
  facts: Fact[]
  patterns: Pattern[]
  analogies: Analogy[]
  confidence: number
}

interface Fact {
  content: string
  confidence: number
  source: string
}

interface Pattern {
  name: string
  strength: number
}

interface Analogy {
  source: string
  target: string
  similarity: number
}

interface ResponseSynthesis {
  content: string
  tone: string
  reasoning: string[]
  template: string
}

interface SemanticPattern {
  patterns: RegExp[]
  weight: number
  response_type: string
}

interface ContextNode {
  concept: string
  connections: string[]
  strength: number
}

interface PersonalInfoEntry {
  key: string
  value: string
  timestamp: number
  importance: number
  type: string
  source: string
}

interface FactEntry {
  key: string
  value: string
  timestamp: number
  importance: number
  type: string
  source: string
}

interface AIResponse {
  content: string
  confidence: number
  reasoning?: string[]
  mathAnalysis?: any
}

interface MathFunction {
  name: string
  description: string
  examples: string[]
  func: (...args: number[]) => number | string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}

interface MathPattern {
  pattern: RegExp
  operation: string
  confidence: number
  extract: (match: RegExpMatchArray) => number[]
}

interface MathAnalysis {
  isMatch: boolean
  operation: string
  numbers: number[]
  result: number | undefined
  confidence: number
  reasoning: string[]
}
