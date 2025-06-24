// ENHANCED COGNITIVE SYSTEM - BACKEND ONLY, NO UI CHANGES
export class EnhancedCognitiveSystem {
  private mathKnowledge: Map<string, any> = new Map()
  private factDatabase: Map<string, any> = new Map()
  private cognitiveRouter = new CognitiveRouter()
  private thinkingProcess: string[] = []
  private isInitialized = false

  constructor() {
    console.log("🧠 Initializing Enhanced Cognitive System...")
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("🔄 Loading mathematical knowledge...")
      await this.loadMathKnowledge()

      console.log("📚 Loading factual database...")
      await this.loadFactDatabase()

      console.log("🧠 Initializing cognitive router...")
      this.cognitiveRouter.initialize()

      this.isInitialized = true
      console.log("✅ Enhanced Cognitive System ready!")
    } catch (error) {
      console.error("❌ Enhanced Cognitive System initialization failed:", error)
      this.isInitialized = true // Continue anyway
    }
  }

  public async processThought(
    input: string,
    conversationHistory: any[],
    personalInfo: Map<string, any>,
  ): Promise<CognitiveResponse> {
    this.thinkingProcess = []

    console.log("🧠 Enhanced cognitive processing:", input)

    // Stage 1: Input Analysis
    this.addThought("🔍 Analyzing input complexity and type...")
    const inputAnalysis = this.analyzeInput(input)
    this.addThought(`📝 Input type: ${inputAnalysis.type}, complexity: ${inputAnalysis.complexity}`)

    // Stage 2: Cognitive Routing
    this.addThought("🛤️ Selecting cognitive pathways...")
    const pathways = this.cognitiveRouter.selectPathways(inputAnalysis)
    this.addThought(`🔀 Activated pathways: ${pathways.map((p) => p.name).join(", ")}`)

    // Stage 3: Parallel Processing
    this.addThought("⚡ Processing through multiple cognitive pathways...")
    const pathwayResults = await this.processPathways(pathways, input, personalInfo)

    // Stage 4: Knowledge Synthesis
    this.addThought("🔗 Synthesizing knowledge from all pathways...")
    const synthesis = this.synthesizeKnowledge(pathwayResults, personalInfo)
    this.addThought(`💡 Synthesis confidence: ${Math.round(synthesis.confidence * 100)}%`)

    // Stage 5: Response Generation
    this.addThought("💬 Generating intelligent response...")
    const response = this.generateIntelligentResponse(synthesis, personalInfo)
    this.addThought(`✅ Response generated with ${Math.round(response.confidence * 100)}% confidence`)

    return {
      content: response.content,
      confidence: response.confidence,
      reasoning: [...this.thinkingProcess],
      pathways: pathways.map((p) => p.name),
      synthesis: synthesis,
    }
  }

  private addThought(thought: string): void {
    this.thinkingProcess.push(thought)
    console.log(thought)
  }

  private analyzeInput(input: string): InputAnalysis {
    const words = input.toLowerCase().split(/\s+/)
    const hasNumbers = /\d/.test(input)
    const hasMathOperators = /[+\-×*÷/=]/.test(input)
    const hasQuestionWords = /\b(what|how|why|when|where|who|which)\b/i.test(input)

    let type = "conversation"
    let complexity = 0.3

    // Detect mathematical expressions
    if (hasNumbers && hasMathOperators) {
      type = "mathematics"
      complexity = this.calculateMathComplexity(input)
    }
    // Detect questions
    else if (hasQuestionWords) {
      type = "inquiry"
      complexity = 0.6
    }
    // Detect personal information
    else if (/\b(my|i|me|am|have)\b/i.test(input)) {
      type = "personal"
      complexity = 0.4
    }

    return {
      type,
      complexity,
      hasNumbers,
      hasMathOperators,
      hasQuestionWords,
      wordCount: words.length,
    }
  }

  private calculateMathComplexity(input: string): number {
    const operators = (input.match(/[+\-×*÷/]/g) || []).length
    const numbers = (input.match(/\d+/g) || []).length

    // More operators and numbers = higher complexity
    return Math.min(0.9, 0.3 + operators * 0.2 + numbers * 0.1)
  }

  private async processPathways(
    pathways: CognitivePathway[],
    input: string,
    personalInfo: Map<string, any>,
  ): Promise<PathwayResult[]> {
    const results: PathwayResult[] = []

    for (const pathway of pathways) {
      this.addThought(`🔄 Processing through ${pathway.name} pathway...`)

      try {
        let result: PathwayResult

        switch (pathway.type) {
          case "mathematical":
            result = await this.processMathematicalPathway(input)
            break
          case "factual":
            result = await this.processFactualPathway(input)
            break
          case "personal":
            result = await this.processPersonalPathway(input, personalInfo)
            break
          case "conversational":
            result = await this.processConversationalPathway(input)
            break
          default:
            result = { pathway: pathway.name, confidence: 0.3, data: "Generic response" }
        }

        this.addThought(`✅ ${pathway.name} pathway result: confidence ${Math.round(result.confidence * 100)}%`)
        results.push(result)
      } catch (error) {
        this.addThought(`❌ ${pathway.name} pathway failed: ${error}`)
        results.push({ pathway: pathway.name, confidence: 0.1, data: null })
      }
    }

    return results
  }

  private async processMathematicalPathway(input: string): Promise<PathwayResult> {
    this.addThought("🔢 Entering Mathematical Reasoning Pathway...")
    this.addThought(`📝 Mathematical input to analyze: "${input}"`)

    const mathProcessor = new AdvancedMathProcessor()
    const result = mathProcessor.processComplexExpression(input)

    // Add all the detailed mathematical thoughts
    if (result.thoughts) {
      result.thoughts.forEach((thought) => this.addThought(thought))
    }

    if (result.success) {
      this.addThought(`🎉 MATHEMATICAL SOLUTION FOUND!`)
      this.addThought(`📊 Answer: ${result.answer}`)
      this.addThought(`🔧 Method used: ${result.method}`)
      this.addThought(`📈 Mathematical confidence: ${Math.round(result.confidence * 100)}%`)

      return {
        pathway: "mathematical",
        confidence: result.confidence,
        data: {
          answer: result.answer,
          steps: result.steps,
          method: result.method,
          detailedReasoning: result.thoughts,
        },
      }
    }

    this.addThought("❌ No mathematical solution found")
    this.addThought("🤔 This might not be a mathematical expression")
    return { pathway: "mathematical", confidence: 0.1, data: null }
  }

  private async processFactualPathway(input: string): Promise<PathwayResult> {
    this.addThought("📚 Entering Factual Knowledge Pathway...")
    this.addThought(`🔍 Searching for facts related to: "${input}"`)

    const queryWords = input.toLowerCase().split(/\s+/)
    this.addThought(`🔤 Query words extracted: [${queryWords.join(", ")}]`)

    const relevantFacts = this.searchFactDatabase(input)

    this.addThought(`📊 Fact search results: ${relevantFacts.length} facts found`)

    if (relevantFacts.length > 0) {
      const topFact = relevantFacts[0]
      this.addThought(`🏆 Top fact selected: "${topFact.key}"`)
      this.addThought(`📈 Fact relevance score: ${Math.round(topFact.relevance * 100)}%`)
      this.addThought(`📝 Fact content: "${topFact.content}"`)

      // Show reasoning for why this fact was chosen
      this.addThought(`🤔 Why this fact was chosen:`)
      this.addThought(`   - Relevance score: ${Math.round(topFact.relevance * 100)}%`)
      this.addThought(`   - Matches ${Math.round(topFact.relevance * queryWords.length)} query words`)

      return {
        pathway: "factual",
        confidence: 0.8,
        data: topFact,
      }
    }

    this.addThought("❌ No relevant facts found in knowledge database")
    this.addThought("💡 Suggestion: Try asking about science, history, or geography")
    return { pathway: "factual", confidence: 0.2, data: null }
  }

  private async processPersonalPathway(input: string, personalInfo: Map<string, any>): Promise<PathwayResult> {
    this.addThought("👤 Entering Personal Memory Pathway...")
    this.addThought(`🧠 Checking personal memories for: "${input}"`)

    const personalFacts = Array.from(personalInfo.entries())
    this.addThought(`📊 Total personal memories stored: ${personalFacts.length}`)

    if (personalFacts.length > 0) {
      this.addThought(`💭 Personal memories found:`)
      personalFacts.forEach(([key, entry]) => {
        const value = typeof entry === "object" ? entry.value : entry
        const importance = typeof entry === "object" ? entry.importance : 0.5
        this.addThought(`   - ${key}: "${value}" (importance: ${Math.round(importance * 100)}%)`)
      })

      // Analyze which memories are most relevant to current input
      const inputWords = input.toLowerCase().split(/\s+/)
      const relevantMemories = personalFacts.filter(([key, entry]) => {
        const memoryText = `${key} ${typeof entry === "object" ? entry.value : entry}`.toLowerCase()
        return inputWords.some((word) => memoryText.includes(word))
      })

      if (relevantMemories.length > 0) {
        this.addThought(`🎯 Found ${relevantMemories.length} relevant memories for current input`)
        relevantMemories.forEach(([key, entry]) => {
          const value = typeof entry === "object" ? entry.value : entry
          this.addThought(`   ✅ Relevant: ${key} = "${value}"`)
        })
      } else {
        this.addThought(`🤔 No memories directly relevant to current input, using all available`)
      }

      return {
        pathway: "personal",
        confidence: 0.7,
        data: personalFacts,
      }
    }

    this.addThought("❌ No personal memories stored yet")
    this.addThought("💡 Suggestion: Tell me about yourself so I can remember!")
    return { pathway: "personal", confidence: 0.3, data: null }
  }

  private async processConversationalPathway(input: string): Promise<PathwayResult> {
    this.addThought("💬 Processing conversational context...")

    return {
      pathway: "conversational",
      confidence: 0.6,
      data: "I understand what you're saying.",
    }
  }

  private synthesizeKnowledge(results: PathwayResult[], personalInfo: Map<string, any>): KnowledgeSynthesis {
    this.addThought("🔗 Synthesizing knowledge from all pathways...")

    const validResults = results.filter((r) => r.confidence > 0.3)
    const bestResult = validResults.reduce((best, current) => (current.confidence > best.confidence ? current : best), {
      confidence: 0,
      pathway: "none",
      data: null,
    })

    const userName = this.getUserName(personalInfo)

    return {
      primaryPathway: bestResult.pathway,
      confidence: bestResult.confidence,
      data: bestResult.data,
      userName: userName,
      allResults: validResults,
    }
  }

  private generateIntelligentResponse(
    synthesis: KnowledgeSynthesis,
    personalInfo: Map<string, any>,
  ): ResponseGeneration {
    const namePrefix = synthesis.userName ? `${synthesis.userName}, ` : ""
    let content = ""
    const confidence = synthesis.confidence

    this.addThought(`🎭 Generating response for pathway: ${synthesis.primaryPathway}`)
    this.addThought(`👤 User name detected: ${synthesis.userName || "none"}`)

    switch (synthesis.primaryPathway) {
      case "mathematical":
        if (synthesis.data && synthesis.data.answer !== undefined) {
          this.addThought(`🧮 Mathematical answer found: ${synthesis.data.answer}`)
          this.addThought(`📋 Steps available: ${synthesis.data.steps ? "yes" : "no"}`)

          content = `${namePrefix}the answer is ${synthesis.data.answer}`
          if (synthesis.data.steps && synthesis.data.steps.length > 0) {
            content += `. Here's how I solved it: ${synthesis.data.steps.join(" → ")}`
          }

          this.addThought(`💬 Generated mathematical response: "${content}"`)
        } else {
          this.addThought(`❌ No mathematical data available, providing help message`)
          content = `${namePrefix}I can help with math problems. Try something like "3×3+3" or "15÷3"`
        }
        break

      case "factual":
        if (synthesis.data && typeof synthesis.data === "object") {
          const factContent = synthesis.data.content || synthesis.data.value || String(synthesis.data)
          this.addThought(`📚 Using factual data: ${factContent}`)
          content = `${namePrefix}${factContent}`
        } else if (synthesis.data) {
          this.addThought(`📚 Using simple factual data: ${synthesis.data}`)
          content = `${namePrefix}${synthesis.data}`
        } else {
          this.addThought(`❌ No factual data available`)
          content = `${namePrefix}I don't have specific information about that, but I'd be happy to help with what I know!`
        }
        break

      case "personal":
        if (synthesis.data && Array.isArray(synthesis.data) && synthesis.data.length > 0) {
          this.addThought(`👤 Processing ${synthesis.data.length} personal memories`)
          const facts = synthesis.data
            .slice(0, 3)
            .map(([key, entry]: [string, any]) => {
              const value = typeof entry === "object" ? entry.value : entry
              this.addThought(`💭 Personal memory: ${key} = ${value}`)
              return `${key}: ${value}`
            })
            .join(", ")
          content = `${namePrefix}I remember: ${facts}`
          this.addThought(`💬 Generated personal response with ${synthesis.data.length} memories`)
        } else {
          this.addThought(`❌ No personal memories available`)
          content = `${namePrefix}I don't have any stored memories yet. Tell me something about yourself!`
        }
        break

      default:
        this.addThought(`💬 Using default conversational response`)
        content = `${namePrefix}I understand. What would you like to talk about?`
    }

    this.addThought(`✅ Final response generated: "${content}"`)
    this.addThought(`📊 Response confidence: ${Math.round(confidence * 100)}%`)

    return { content, confidence }
  }

  private getUserName(personalInfo: Map<string, any>): string | null {
    const nameEntry = personalInfo.get("name")
    if (nameEntry) {
      return typeof nameEntry === "object" ? nameEntry.value : nameEntry
    }
    return null
  }

  private async loadMathKnowledge(): Promise<void> {
    try {
      // Load from seed_maths.json
      const response = await fetch("/seed_maths.json")
      const mathData = await response.json()

      Object.entries(mathData).forEach(([key, value]) => {
        this.mathKnowledge.set(key, value)
      })

      console.log(`📊 Loaded ${this.mathKnowledge.size} mathematical concepts`)
    } catch (error) {
      console.warn("Failed to load math knowledge:", error)
    }
  }

  private async loadFactDatabase(): Promise<void> {
    try {
      // Load from seed_knowledge.json
      const response = await fetch("/seed_knowledge.json")
      const factData = await response.json()

      Object.entries(factData).forEach(([key, value]) => {
        this.factDatabase.set(key, value)
      })

      console.log(`📚 Loaded ${this.factDatabase.size} facts`)
    } catch (error) {
      console.warn("Failed to load fact database:", error)
    }
  }

  private searchFactDatabase(query: string): any[] {
    const results: any[] = []
    const queryWords = query.toLowerCase().split(/\s+/)

    for (const [key, fact] of this.factDatabase.entries()) {
      const factText = typeof fact === "object" ? JSON.stringify(fact) : String(fact)
      const matches = queryWords.filter((word) => factText.toLowerCase().includes(word)).length

      if (matches > 0) {
        results.push({
          key,
          content: fact,
          relevance: matches / queryWords.length,
        })
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance)
  }

  // Public methods for stats (FIXED - no double counting)
  public getMathKnowledge(): Map<string, any> {
    return this.mathKnowledge
  }

  public getFactDatabase(): Map<string, any> {
    return this.factDatabase
  }
}

// COGNITIVE ROUTER - SELECTS APPROPRIATE THINKING PATHWAYS
class CognitiveRouter {
  private pathways: CognitivePathway[] = []

  public initialize(): void {
    this.pathways = [
      {
        name: "Mathematical Reasoning",
        type: "mathematical",
        triggers: ["numbers", "operators", "calculation"],
        confidence: 0.9,
      },
      {
        name: "Factual Knowledge",
        type: "factual",
        triggers: ["what", "who", "when", "where", "fact"],
        confidence: 0.8,
      },
      {
        name: "Personal Memory",
        type: "personal",
        triggers: ["remember", "my", "i", "me", "personal"],
        confidence: 0.7,
      },
      {
        name: "Conversational",
        type: "conversational",
        triggers: ["hello", "hi", "how", "thanks"],
        confidence: 0.6,
      },
    ]
  }

  public selectPathways(analysis: InputAnalysis): CognitivePathway[] {
    const selectedPathways: CognitivePathway[] = []

    // Always include conversational as fallback
    selectedPathways.push(this.pathways.find((p) => p.type === "conversational")!)

    // Select specific pathways based on input analysis
    if (analysis.type === "mathematics") {
      selectedPathways.unshift(this.pathways.find((p) => p.type === "mathematical")!)
    }

    if (analysis.hasQuestionWords) {
      selectedPathways.unshift(this.pathways.find((p) => p.type === "factual")!)
    }

    if (analysis.type === "personal") {
      selectedPathways.unshift(this.pathways.find((p) => p.type === "personal")!)
    }

    return selectedPathways
  }
}

// ADVANCED MATH PROCESSOR - HANDLES COMPLEX EXPRESSIONS
class AdvancedMathProcessor {
  public processComplexExpression(input: string): MathResult {
    const cleanInput = input.trim().replace(/\s+/g, "")
    const detailedThoughts: string[] = []

    detailedThoughts.push(`🔍 Raw input received: "${input}"`)
    detailedThoughts.push(`🧹 Cleaned input: "${cleanInput}"`)
    detailedThoughts.push(`📊 Scanning for mathematical patterns...`)

    // Enhanced pattern recognition with detailed reasoning
    const patterns = [
      {
        name: "Triple Addition",
        pattern: /(\d+)[+](\d+)[+](\d+)/,
        solver: (match: RegExpMatchArray) => {
          const a = Number.parseInt(match[1])
          const b = Number.parseInt(match[2])
          const c = Number.parseInt(match[3])

          detailedThoughts.push(`🎯 PATTERN MATCH: Triple Addition detected`)
          detailedThoughts.push(`🔢 Extracted numbers: a=${a}, b=${b}, c=${c}`)
          detailedThoughts.push(`🧮 Calculation process:`)
          detailedThoughts.push(`   Step 1: ${a} + ${b} = ${a + b}`)
          detailedThoughts.push(`   Step 2: ${a + b} + ${c} = ${a + b + c}`)
          detailedThoughts.push(`✅ Final result: ${a + b + c}`)

          return {
            answer: a + b + c,
            steps: [`${a} + ${b} = ${a + b}`, `${a + b} + ${c} = ${a + b + c}`],
            method: "Sequential addition",
            thoughts: detailedThoughts,
          }
        },
      },
      {
        name: "Triple Multiplication",
        pattern: /(\d+)[×*x](\d+)[×*x](\d+)/,
        solver: (match: RegExpMatchArray) => {
          const a = Number.parseInt(match[1])
          const b = Number.parseInt(match[2])
          const c = Number.parseInt(match[3])

          detailedThoughts.push(`🎯 PATTERN MATCH: Triple Multiplication detected`)
          detailedThoughts.push(`🔢 Extracted numbers: a=${a}, b=${b}, c=${c}`)
          detailedThoughts.push(`🧮 Calculation process:`)
          detailedThoughts.push(`   Step 1: ${a} × ${b} = ${a * b}`)
          detailedThoughts.push(`   Step 2: ${a * b} × ${c} = ${a * b * c}`)
          detailedThoughts.push(`✅ Final result: ${a * b * c}`)

          return {
            answer: a * b * c,
            steps: [`${a} × ${b} = ${a * b}`, `${a * b} × ${c} = ${a * b * c}`],
            method: "Sequential multiplication",
            thoughts: detailedThoughts,
          }
        },
      },
      {
        name: "Multiplication then Addition",
        pattern: /(\d+)[×*x](\d+)[+](\d+)/,
        solver: (match: RegExpMatchArray) => {
          const a = Number.parseInt(match[1])
          const b = Number.parseInt(match[2])
          const c = Number.parseInt(match[3])

          detailedThoughts.push(`🎯 PATTERN MATCH: Multiplication then Addition (Order of Operations)`)
          detailedThoughts.push(`🔢 Extracted numbers: a=${a}, b=${b}, c=${c}`)
          detailedThoughts.push(`📚 Applying PEMDAS: Multiplication before Addition`)
          detailedThoughts.push(`🧮 Calculation process:`)
          detailedThoughts.push(`   Step 1: ${a} × ${b} = ${a * b} (multiplication first)`)
          detailedThoughts.push(`   Step 2: ${a * b} + ${c} = ${a * b + c} (then addition)`)
          detailedThoughts.push(`✅ Final result: ${a * b + c}`)

          return {
            answer: a * b + c,
            steps: [`${a} × ${b} = ${a * b}`, `${a * b} + ${c} = ${a * b + c}`],
            method: "Order of operations (PEMDAS)",
            thoughts: detailedThoughts,
          }
        },
      },
      {
        name: "Simple Addition",
        pattern: /(\d+)[+](\d+)$/,
        solver: (match: RegExpMatchArray) => {
          const a = Number.parseInt(match[1])
          const b = Number.parseInt(match[2])

          detailedThoughts.push(`🎯 PATTERN MATCH: Simple Addition detected`)
          detailedThoughts.push(`🔢 Extracted numbers: a=${a}, b=${b}`)
          detailedThoughts.push(`🧮 Performing addition: ${a} + ${b}`)
          detailedThoughts.push(`💭 Mental calculation: ${a} + ${b} = ${a + b}`)
          detailedThoughts.push(`✅ Final result: ${a + b}`)

          return {
            answer: a + b,
            steps: [`${a} + ${b} = ${a + b}`],
            method: "Basic addition",
            thoughts: detailedThoughts,
          }
        },
      },
      {
        name: "Simple Multiplication",
        pattern: /(\d+)[×*x](\d+)$/,
        solver: (match: RegExpMatchArray) => {
          const a = Number.parseInt(match[1])
          const b = Number.parseInt(match[2])

          detailedThoughts.push(`🎯 PATTERN MATCH: Simple Multiplication detected`)
          detailedThoughts.push(`🔢 Extracted numbers: a=${a}, b=${b}`)
          detailedThoughts.push(`🧮 Performing multiplication: ${a} × ${b}`)
          detailedThoughts.push(`💭 Mental calculation: ${a} × ${b} = ${a * b}`)
          detailedThoughts.push(`✅ Final result: ${a * b}`)

          return {
            answer: a * b,
            steps: [`${a} × ${b} = ${a * b}`],
            method: "Basic multiplication",
            thoughts: detailedThoughts,
          }
        },
      },
    ]

    // Try each pattern with detailed reasoning
    for (const pattern of patterns) {
      detailedThoughts.push(`🔍 Testing pattern: ${pattern.name}`)
      const match = cleanInput.match(pattern.pattern)

      if (match) {
        detailedThoughts.push(`✅ Pattern "${pattern.name}" MATCHED!`)
        const solution = pattern.solver(match)

        return {
          success: true,
          confidence: 0.95,
          ...solution,
        }
      } else {
        detailedThoughts.push(`❌ Pattern "${pattern.name}" did not match`)
      }
    }

    detailedThoughts.push(`❌ No mathematical patterns recognized in: "${cleanInput}"`)
    detailedThoughts.push(`🤔 Input might not be a valid mathematical expression`)

    return {
      success: false,
      confidence: 0.1,
      answer: undefined,
      steps: [],
      method: "No mathematical pattern recognized",
      thoughts: detailedThoughts,
    }
  }
}

// TYPE DEFINITIONS
interface InputAnalysis {
  type: string
  complexity: number
  hasNumbers: boolean
  hasMathOperators: boolean
  hasQuestionWords: boolean
  wordCount: number
}

interface CognitivePathway {
  name: string
  type: string
  triggers: string[]
  confidence: number
}

interface PathwayResult {
  pathway: string
  confidence: number
  data: any
}

interface KnowledgeSynthesis {
  primaryPathway: string
  confidence: number
  data: any
  userName: string | null
  allResults: PathwayResult[]
}

interface ResponseGeneration {
  content: string
  confidence: number
}

interface CognitiveResponse {
  content: string
  confidence: number
  reasoning: string[]
  pathways: string[]
  synthesis: KnowledgeSynthesis
}

interface MathResult {
  success: boolean
  confidence: number
  answer?: number | string
  steps?: string[]
  method?: string
  thoughts?: string[]
}
