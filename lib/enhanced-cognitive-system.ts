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
    this.addThought("🔢 Analyzing mathematical expression...")

    // Enhanced math processing for multi-step operations
    const mathProcessor = new AdvancedMathProcessor()
    const result = mathProcessor.processComplexExpression(input)

    if (result.success) {
      this.addThought(`🧮 Mathematical solution found: ${result.answer}`)
      return {
        pathway: "mathematical",
        confidence: result.confidence,
        data: {
          answer: result.answer,
          steps: result.steps,
          method: result.method,
        },
      }
    }

    this.addThought("❌ No mathematical pattern recognized")
    return { pathway: "mathematical", confidence: 0.1, data: null }
  }

  private async processFactualPathway(input: string): Promise<PathwayResult> {
    this.addThought("📚 Searching factual knowledge...")

    const relevantFacts = this.searchFactDatabase(input)

    if (relevantFacts.length > 0) {
      this.addThought(`📖 Found ${relevantFacts.length} relevant facts`)
      return {
        pathway: "factual",
        confidence: 0.8,
        data: relevantFacts[0], // Use most relevant fact
      }
    }

    this.addThought("❌ No relevant facts found")
    return { pathway: "factual", confidence: 0.2, data: null }
  }

  private async processPersonalPathway(input: string, personalInfo: Map<string, any>): Promise<PathwayResult> {
    this.addThought("👤 Analyzing personal context...")

    const personalFacts = Array.from(personalInfo.entries())

    if (personalFacts.length > 0) {
      this.addThought(`💭 Found ${personalFacts.length} personal memories`)
      return {
        pathway: "personal",
        confidence: 0.7,
        data: personalFacts,
      }
    }

    this.addThought("❌ No personal information available")
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

    switch (synthesis.primaryPathway) {
      case "mathematical":
        if (synthesis.data && synthesis.data.answer !== undefined) {
          content = `${namePrefix}the answer is ${synthesis.data.answer}`
          if (synthesis.data.steps) {
            content += `. Here's how I solved it: ${synthesis.data.steps.join(" → ")}`
          }
        } else {
          content = `${namePrefix}I can help with math problems. Try something like "3×3+3" or "15÷3"`
        }
        break

      case "factual":
        if (synthesis.data) {
          content = `${namePrefix}${synthesis.data.content || synthesis.data}`
        } else {
          content = `${namePrefix}I don't have specific information about that, but I'd be happy to help with what I know!`
        }
        break

      case "personal":
        if (synthesis.data && synthesis.data.length > 0) {
          const facts = synthesis.data
            .slice(0, 3)
            .map(([key, entry]: [string, any]) => {
              const value = typeof entry === "object" ? entry.value : entry
              return `${key}: ${value}`
            })
            .join(", ")
          content = `${namePrefix}I remember: ${facts}`
        } else {
          content = `${namePrefix}I don't have any stored memories yet. Tell me something about yourself!`
        }
        break

      default:
        content = `${namePrefix}I understand. What would you like to talk about?`
    }

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

    // Handle multi-step expressions like 3×3+3, 3×3×3, etc.
    const complexPatterns = [
      {
        pattern: /(\d+)[×*](\d+)[+](\d+)/,
        solver: (match: RegExpMatchArray) => {
          const a = Number.parseInt(match[1])
          const b = Number.parseInt(match[2])
          const c = Number.parseInt(match[3])
          const step1 = a * b
          const result = step1 + c
          return {
            answer: result,
            steps: [`${a} × ${b} = ${step1}`, `${step1} + ${c} = ${result}`],
            method: "Order of operations (multiplication first, then addition)",
          }
        },
      },
      {
        pattern: /(\d+)[×*](\d+)[×*](\d+)/,
        solver: (match: RegExpMatchArray) => {
          const a = Number.parseInt(match[1])
          const b = Number.parseInt(match[2])
          const c = Number.parseInt(match[3])
          const step1 = a * b
          const result = step1 * c
          return {
            answer: result,
            steps: [`${a} × ${b} = ${step1}`, `${step1} × ${c} = ${result}`],
            method: "Sequential multiplication",
          }
        },
      },
      {
        pattern: /(\d+)[+](\d+)[×*](\d+)/,
        solver: (match: RegExpMatchArray) => {
          const a = Number.parseInt(match[1])
          const b = Number.parseInt(match[2])
          const c = Number.parseInt(match[3])
          const step1 = b * c
          const result = a + step1
          return {
            answer: result,
            steps: [`${b} × ${c} = ${step1}`, `${a} + ${step1} = ${result}`],
            method: "Order of operations (multiplication first, then addition)",
          }
        },
      },
    ]

    // Try complex patterns first
    for (const pattern of complexPatterns) {
      const match = cleanInput.match(pattern.pattern)
      if (match) {
        const solution = pattern.solver(match)
        return {
          success: true,
          confidence: 0.95,
          ...solution,
        }
      }
    }

    // Fall back to simple operations
    const simplePatterns = [
      {
        pattern: /(\d+)[×*](\d+)/,
        solver: (a: number, b: number) => ({ answer: a * b, method: "Multiplication" }),
      },
      {
        pattern: /(\d+)[+](\d+)/,
        solver: (a: number, b: number) => ({ answer: a + b, method: "Addition" }),
      },
      {
        pattern: /(\d+)[-](\d+)/,
        solver: (a: number, b: number) => ({ answer: a - b, method: "Subtraction" }),
      },
      {
        pattern: /(\d+)[÷/](\d+)/,
        solver: (a: number, b: number) => ({ answer: b !== 0 ? a / b : "Cannot divide by zero", method: "Division" }),
      },
    ]

    for (const pattern of simplePatterns) {
      const match = cleanInput.match(pattern.pattern)
      if (match) {
        const a = Number.parseInt(match[1])
        const b = Number.parseInt(match[2])
        const solution = pattern.solver(a, b)
        return {
          success: true,
          confidence: 0.9,
          steps: [
            `${a} ${pattern.pattern.source.includes("×") ? "×" : pattern.pattern.source.includes("+") ? "+" : pattern.pattern.source.includes("-") ? "-" : "÷"} ${b} = ${solution.answer}`,
          ],
          ...solution,
        }
      }
    }

    return {
      success: false,
      confidence: 0.1,
      answer: undefined,
      steps: [],
      method: "No mathematical pattern recognized",
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
}
