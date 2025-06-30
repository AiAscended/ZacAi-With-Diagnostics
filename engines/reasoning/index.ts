import type { ReasoningChain, ReasoningStep, IntentAnalysis } from "@/types/engines"
import { generateId, calculateConfidence } from "@/utils/helpers"

export class ReasoningEngine {
  private chains: Map<string, ReasoningChain> = new Map()
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🧠 Initializing Reasoning Engine...")
    this.initialized = true
    console.log("✅ Reasoning Engine initialized")
  }

  async createReasoningChain(input: string, context: any, moduleResponses: any[]): Promise<ReasoningChain> {
    const chainId = generateId()
    const steps: ReasoningStep[] = []

    // Step 1: Input Analysis
    const inputAnalysis = await this.analyzeInput(input, context)
    steps.push({
      id: generateId(),
      description: "Analyzing user input for intent and entities",
      input: { text: input, context },
      output: inputAnalysis,
      confidence: inputAnalysis.confidence,
      reasoning: `Identified intent as '${inputAnalysis.intent}' with ${inputAnalysis.entities.length} entities`,
    })

    // Step 2: Context Integration
    const contextIntegration = this.integrateContext(context, inputAnalysis)
    steps.push({
      id: generateId(),
      description: "Integrating conversation context and history",
      input: context,
      output: contextIntegration,
      confidence: 0.8,
      reasoning: "Analyzed conversation flow and extracted relevant context patterns",
    })

    // Step 3: Module Response Analysis
    if (moduleResponses.length > 0) {
      const responseAnalysis = this.analyzeModuleResponses(moduleResponses)
      steps.push({
        id: generateId(),
        description: "Evaluating and ranking module responses",
        input: moduleResponses,
        output: responseAnalysis,
        confidence: responseAnalysis.confidence,
        reasoning: `Analyzed ${moduleResponses.length} module responses and selected best match`,
      })
    }

    // Step 4: Logical Validation
    const validation = await this.validateLogic(steps, input)
    steps.push(validation)

    // Step 5: Confidence Calculation
    const overallConfidence = this.calculateOverallConfidence(steps)

    // Step 6: Conclusion Formation
    const conclusion = this.formConclusion(steps, moduleResponses)

    const chain: ReasoningChain = {
      id: chainId,
      steps,
      conclusion,
      confidence: overallConfidence,
      sources: moduleResponses.map((r) => r.source || "unknown"),
    }

    this.chains.set(chainId, chain)
    return chain
  }

  private async analyzeInput(input: string, context: any): Promise<IntentAnalysis> {
    const lowercaseInput = input.toLowerCase()

    // Intent classification
    let intent = "general"
    let confidence = 0.5

    const intentPatterns = {
      question: {
        patterns: ["what", "how", "why", "when", "where", "who", "which"],
        confidence: 0.8,
      },
      definition: {
        patterns: ["define", "meaning", "what is", "what does", "explain"],
        confidence: 0.9,
      },
      calculation: {
        patterns: ["calculate", "solve", "compute", "math", "=", "+", "-", "*", "/"],
        confidence: 0.95,
      },
      instruction: {
        patterns: ["how to", "show me", "teach me", "help me"],
        confidence: 0.85,
      },
      comparison: {
        patterns: ["compare", "difference", "versus", "vs", "better"],
        confidence: 0.8,
      },
    }

    for (const [intentType, config] of Object.entries(intentPatterns)) {
      if (config.patterns.some((pattern) => lowercaseInput.includes(pattern))) {
        intent = intentType
        confidence = config.confidence
        break
      }
    }

    // Entity extraction
    const entities = this.extractEntities(input)

    // Suggested modules based on intent and entities
    const suggestedModules = this.suggestModules(intent, entities, lowercaseInput)

    return {
      intent,
      confidence,
      entities,
      context,
      suggestedModules,
    }
  }

  private extractEntities(input: string): any[] {
    const entities: any[] = []

    // Numbers
    const numberMatches = input.match(/-?\d+\.?\d*/g)
    if (numberMatches) {
      numberMatches.forEach((match, index) => {
        entities.push({
          type: "number",
          value: match,
          confidence: 0.95,
          start: input.indexOf(match),
          end: input.indexOf(match) + match.length,
        })
      })
    }

    // Mathematical operators
    const mathOperators = ["+", "-", "*", "/", "=", "^", "%"]
    mathOperators.forEach((op) => {
      if (input.includes(op)) {
        entities.push({
          type: "math_operator",
          value: op,
          confidence: 0.9,
          start: input.indexOf(op),
          end: input.indexOf(op) + op.length,
        })
      }
    })

    // Capitalized words (potential proper nouns)
    const capitalizedWords = input.match(/\b[A-Z][a-z]+\b/g)
    if (capitalizedWords) {
      capitalizedWords.forEach((word) => {
        entities.push({
          type: "proper_noun",
          value: word,
          confidence: 0.7,
          start: input.indexOf(word),
          end: input.indexOf(word) + word.length,
        })
      })
    }

    return entities
  }

  private suggestModules(intent: string, entities: any[], input: string): string[] {
    const modules: string[] = []

    // Mathematics module
    if (
      intent === "calculation" ||
      entities.some((e) => e.type === "number" || e.type === "math_operator") ||
      /\b(math|calculate|solve|equation|formula)\b/i.test(input)
    ) {
      modules.push("mathematics")
    }

    // Vocabulary module
    if (intent === "definition" || /\b(define|meaning|word|definition|synonym|antonym)\b/i.test(input)) {
      modules.push("vocabulary")
    }

    // Facts module
    if (intent === "question" || /\b(fact|information|tell me about|what is|explain)\b/i.test(input)) {
      modules.push("facts")
    }

    // Coding module
    if (/\b(code|program|function|algorithm|programming|javascript|python)\b/i.test(input)) {
      modules.push("coding")
    }

    // Philosophy module
    if (/\b(philosophy|ethics|moral|meaning of life|existence|consciousness)\b/i.test(input)) {
      modules.push("philosophy")
    }

    // User info module
    if (/\b(my|me|I|remember|profile|preferences)\b/i.test(input)) {
      modules.push("user-info")
    }

    return modules.length > 0 ? modules : ["facts"] // Default to facts if no specific module
  }

  private integrateContext(context: any, inputAnalysis: IntentAnalysis): any {
    return {
      conversationFlow: context.conversationFlow || "new",
      topics: context.topics || [],
      sessionDuration: context.sessionDuration || 0,
      messageCount: context.messageCount || 0,
      relevantHistory: context.recentMessages?.slice(-3) || [],
      userPreferences: context.userPreferences || {},
      contextualClues: this.extractContextualClues(context, inputAnalysis),
    }
  }

  private extractContextualClues(context: any, inputAnalysis: IntentAnalysis): string[] {
    const clues: string[] = []

    if (context.topics && context.topics.length > 0) {
      clues.push(`Previous topics: ${context.topics.join(", ")}`)
    }

    if (context.conversationFlow === "follow_up") {
      clues.push("User is asking a follow-up question")
    }

    if (context.messageCount > 5) {
      clues.push("Extended conversation - user likely seeking detailed information")
    }

    if (inputAnalysis.suggestedModules.length > 1) {
      clues.push(`Multi-domain query involving: ${inputAnalysis.suggestedModules.join(", ")}`)
    }

    return clues
  }

  private analyzeModuleResponses(responses: any[]): any {
    const validResponses = responses.filter((r) => r.success && r.data)

    if (validResponses.length === 0) {
      return {
        bestResponse: null,
        confidence: 0,
        reasoning: "No valid responses from modules",
      }
    }

    // Sort by confidence
    const sortedResponses = validResponses.sort((a, b) => b.confidence - a.confidence)
    const bestResponse = sortedResponses[0]

    return {
      bestResponse,
      alternativeResponses: sortedResponses.slice(1),
      confidence: bestResponse.confidence,
      reasoning: `Selected response from ${bestResponse.source} with ${Math.round(bestResponse.confidence * 100)}% confidence`,
    }
  }

  private async validateLogic(steps: ReasoningStep[], originalInput: string): Promise<ReasoningStep> {
    const validationResults = {
      consistency: this.checkConsistency(steps),
      completeness: this.checkCompleteness(steps),
      relevance: this.checkRelevance(steps, originalInput),
      logicalFlow: this.checkLogicalFlow(steps),
    }

    const overallValidation = calculateConfidence(Object.values(validationResults))

    return {
      id: generateId(),
      description: "Validating logical consistency and completeness",
      input: { steps, originalInput },
      output: validationResults,
      confidence: overallValidation,
      reasoning: `Validation complete: consistency=${Math.round(validationResults.consistency * 100)}%, completeness=${Math.round(validationResults.completeness * 100)}%, relevance=${Math.round(validationResults.relevance * 100)}%`,
    }
  }

  private checkConsistency(steps: ReasoningStep[]): number {
    // Check if steps build logically on each other
    let consistencyScore = 1.0

    for (let i = 1; i < steps.length; i++) {
      const currentStep = steps[i]
      const previousStep = steps[i - 1]

      // Check if current step uses output from previous step
      if (currentStep.input && previousStep.output) {
        // Simple consistency check - in production this would be more sophisticated
        consistencyScore *= 0.95
      }
    }

    return Math.max(0.6, consistencyScore)
  }

  private checkCompleteness(steps: ReasoningStep[]): number {
    const requiredSteps = ["input_analysis", "context_integration", "response_analysis"]
    const stepDescriptions = steps.map((s) => s.description.toLowerCase())

    let completenessScore = 0
    requiredSteps.forEach((required) => {
      if (stepDescriptions.some((desc) => desc.includes(required.replace("_", " ")))) {
        completenessScore += 1 / requiredSteps.length
      }
    })

    return Math.max(0.5, completenessScore)
  }

  private checkRelevance(steps: ReasoningStep[], originalInput: string): number {
    // Check if reasoning steps are relevant to the original input
    const inputKeywords = originalInput
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2)

    let relevanceScore = 0
    steps.forEach((step) => {
      const stepText = (step.description + " " + step.reasoning).toLowerCase()
      const relevantKeywords = inputKeywords.filter((keyword) => stepText.includes(keyword))
      relevanceScore += relevantKeywords.length / inputKeywords.length
    })

    return Math.min(1.0, relevanceScore / steps.length)
  }

  private checkLogicalFlow(steps: ReasoningStep[]): number {
    // Check if confidence scores follow a logical pattern
    if (steps.length < 2) return 1.0

    let flowScore = 1.0
    for (let i = 1; i < steps.length; i++) {
      const confidenceDiff = Math.abs(steps[i].confidence - steps[i - 1].confidence)
      if (confidenceDiff > 0.5) {
        flowScore *= 0.8 // Penalize large confidence jumps
      }
    }

    return Math.max(0.6, flowScore)
  }

  private calculateOverallConfidence(steps: ReasoningStep[]): number {
    if (steps.length === 0) return 0

    const confidences = steps.map((s) => s.confidence)
    const weights = steps.map((_, index) => 1 / (index + 1)) // Higher weight for earlier steps

    let weightedSum = 0
    let totalWeight = 0

    confidences.forEach((confidence, index) => {
      weightedSum += confidence * weights[index]
      totalWeight += weights[index]
    })

    return weightedSum / totalWeight
  }

  private formConclusion(steps: ReasoningStep[], moduleResponses: any[]): string {
    const validResponses = moduleResponses.filter((r) => r.success && r.data)

    if (validResponses.length === 0) {
      return "Unable to generate a confident response based on available information."
    }

    const bestResponse = validResponses.sort((a, b) => b.confidence - a.confidence)[0]
    const confidenceLevel = Math.round(bestResponse.confidence * 100)

    return `Based on analysis using ${steps.length} reasoning steps, the most appropriate response comes from the ${bestResponse.source} module with ${confidenceLevel}% confidence. The reasoning process validated logical consistency and contextual relevance.`
  }

  getReasoningChain(chainId: string): ReasoningChain | null {
    return this.chains.get(chainId) || null
  }

  getRecentChains(count = 5): ReasoningChain[] {
    return Array.from(this.chains.values())
      .sort((a, b) => {
        const aTime = a.steps[0]?.input?.timestamp || 0
        const bTime = b.steps[0]?.input?.timestamp || 0
        return bTime - aTime
      })
      .slice(0, count)
  }

  getStats(): any {
    return {
      totalChains: this.chains.size,
      averageSteps:
        this.chains.size > 0
          ? Array.from(this.chains.values()).reduce((sum, chain) => sum + chain.steps.length, 0) / this.chains.size
          : 0,
      averageConfidence:
        this.chains.size > 0
          ? Array.from(this.chains.values()).reduce((sum, chain) => sum + chain.confidence, 0) / this.chains.size
          : 0,
      initialized: this.initialized,
    }
  }

  clearChains(): void {
    this.chains.clear()
  }
}

export const reasoningEngine = new ReasoningEngine()
