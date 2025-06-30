import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import type { MathConcept } from "@/types/modules"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"

export class MathematicsModule implements ModuleInterface {
  name = "mathematics"
  version = "1.0.0"
  initialized = false

  private seedData: any = null
  private learntData: any = null
  private stats: ModuleStats = {
    totalQueries: 0,
    successRate: 0,
    averageResponseTime: 0,
    learntEntries: 0,
    lastUpdate: 0,
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("Initializing Mathematics Module...")

    try {
      this.seedData = await storageManager.loadSeedData(MODULE_CONFIG.mathematics.seedFile)
      this.learntData = await storageManager.loadLearntData(MODULE_CONFIG.mathematics.learntFile)

      this.initialized = true
      console.log("Mathematics Module initialized successfully")
    } catch (error) {
      console.error("Error initializing Mathematics Module:", error)
      throw error
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      // Check if input contains mathematical expressions
      const mathExpressions = this.extractMathExpressions(input)

      if (mathExpressions.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const results: any[] = []

      for (const expression of mathExpressions) {
        const result = await this.solveMathExpression(expression)
        if (result) {
          results.push(result)
        }
      }

      if (results.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const response = this.buildMathResponse(results)
      const confidence = this.calculateMathConfidence(results)

      // Learn from this interaction
      await this.learn({
        input,
        results,
        context,
        timestamp: Date.now(),
      })

      // Update stats
      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence,
        source: this.name,
        timestamp: Date.now(),
        metadata: {
          expressionsProcessed: mathExpressions.length,
          resultsFound: results.length,
        },
      }
    } catch (error) {
      console.error("Error in Mathematics Module processing:", error)
      this.updateStats(Date.now() - startTime, false)

      return {
        success: false,
        data: null,
        confidence: 0,
        source: this.name,
        timestamp: Date.now(),
      }
    }
  }

  private extractMathExpressions(input: string): string[] {
    const expressions: string[] = []

    // Look for basic arithmetic expressions
    const basicMath = input.match(/\d+\s*[+\-*/]\s*\d+/g)
    if (basicMath) {
      expressions.push(...basicMath)
    }

    // Look for "calculate" or "solve" patterns
    const calculateMatch = input.match(/calculate\s+(.+?)(?:\.|$)/i)
    if (calculateMatch) {
      expressions.push(calculateMatch[1].trim())
    }

    const solveMatch = input.match(/solve\s+(.+?)(?:\.|$)/i)
    if (solveMatch) {
      expressions.push(solveMatch[1].trim())
    }

    // Look for Tesla/Vortex math patterns
    const teslaMatch = input.match(/tesla|vortex|369|sacred/i)
    if (teslaMatch) {
      expressions.push(input) // Process entire input for Tesla math
    }

    return expressions
  }

  private async solveMathExpression(expression: string): Promise<any> {
    // Try basic arithmetic first
    const basicResult = this.solveBasicArithmetic(expression)
    if (basicResult !== null) {
      return {
        expression,
        result: basicResult,
        type: "basic_arithmetic",
        steps: this.getArithmeticSteps(expression),
      }
    }

    // Try Tesla/Vortex math
    const teslaResult = this.solveTeslaMath(expression)
    if (teslaResult !== null) {
      return {
        expression,
        result: teslaResult,
        type: "tesla_vortex",
        steps: this.getTeslaSteps(expression),
      }
    }

    // Try advanced math concepts
    const conceptResult = await this.findMathConcept(expression)
    if (conceptResult) {
      return {
        expression,
        result: conceptResult,
        type: "concept",
        steps: [],
      }
    }

    return null
  }

  private solveBasicArithmetic(expression: string): number | null {
    try {
      // Clean the expression
      const cleanExpression = expression.replace(/[^0-9+\-*/().\s]/g, "")

      // Basic safety check
      if (!/^[0-9+\-*/().\s]+$/.test(cleanExpression)) {
        return null
      }

      // Use Function constructor for safe evaluation
      const result = Function(`"use strict"; return (${cleanExpression})`)()

      if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
        return Math.round(result * 1000000) / 1000000 // Round to 6 decimal places
      }
    } catch (error) {
      console.error("Error in basic arithmetic:", error)
    }

    return null
  }

  private getArithmeticSteps(expression: string): string[] {
    const steps: string[] = []
    steps.push(`Original expression: ${expression}`)

    // Simple step generation for basic operations
    if (expression.includes("+")) {
      steps.push("Performing addition")
    }
    if (expression.includes("-")) {
      steps.push("Performing subtraction")
    }
    if (expression.includes("*")) {
      steps.push("Performing multiplication")
    }
    if (expression.includes("/")) {
      steps.push("Performing division")
    }

    return steps
  }

  private solveTeslaMath(expression: string): any {
    const input = expression.toLowerCase()

    // Tesla 3-6-9 pattern
    if (input.includes("369") || input.includes("tesla")) {
      return this.calculateTeslaPattern(expression)
    }

    // Vortex math
    if (input.includes("vortex")) {
      return this.calculateVortexMath(expression)
    }

    // Sacred geometry
    if (input.includes("sacred") || input.includes("geometry")) {
      return this.calculateSacredGeometry(expression)
    }

    return null
  }

  private calculateTeslaPattern(expression: string): any {
    // Extract numbers from expression
    const numbers = expression.match(/\d+/g)
    if (!numbers) return null

    const results = []

    for (const numStr of numbers) {
      const num = Number.parseInt(numStr)
      const digitalRoot = this.calculateDigitalRoot(num)
      const teslaPattern = this.getTeslaPattern(digitalRoot)

      results.push({
        number: num,
        digitalRoot,
        teslaPattern,
        significance: this.getTeslaSignificance(digitalRoot),
      })
    }

    return {
      type: "tesla_369",
      results,
      explanation: "Tesla believed that 3, 6, and 9 were the key to the universe",
    }
  }

  private calculateDigitalRoot(num: number): number {
    while (num >= 10) {
      num = num
        .toString()
        .split("")
        .reduce((sum, digit) => sum + Number.parseInt(digit), 0)
    }
    return num
  }

  private getTeslaPattern(digitalRoot: number): string {
    if ([3, 6, 9].includes(digitalRoot)) {
      return "Tesla Key Number"
    } else if ([1, 2, 4, 5, 7, 8].includes(digitalRoot)) {
      return "Physical Realm Number"
    }
    return "Unknown Pattern"
  }

  private getTeslaSignificance(digitalRoot: number): string {
    const significance: { [key: number]: string } = {
      1: "Unity, beginning, leadership",
      2: "Duality, cooperation, balance",
      3: "Tesla Key - Creation, expression, communication",
      4: "Stability, foundation, hard work",
      5: "Freedom, adventure, change",
      6: "Tesla Key - Harmony, responsibility, nurturing",
      7: "Spirituality, introspection, analysis",
      8: "Material success, power, achievement",
      9: "Tesla Key - Completion, universal love, service",
    }

    return significance[digitalRoot] || "Unknown significance"
  }

  private calculateVortexMath(expression: string): any {
    // Simplified vortex math implementation
    const numbers = expression.match(/\d+/g)
    if (!numbers) return null

    const vortexSequence = []
    let current = Number.parseInt(numbers[0]) || 1

    for (let i = 0; i < 12; i++) {
      vortexSequence.push(current)
      current = (current * 2) % 9
      if (current === 0) current = 9
    }

    return {
      type: "vortex_math",
      sequence: vortexSequence,
      pattern: this.analyzeVortexPattern(vortexSequence),
      explanation: "Vortex math reveals the underlying patterns in numbers",
    }
  }

  private analyzeVortexPattern(sequence: number[]): string {
    const uniqueNumbers = [...new Set(sequence)]
    if (uniqueNumbers.length <= 3) {
      return "Simple repeating pattern"
    } else if (uniqueNumbers.includes(3) && uniqueNumbers.includes(6) && uniqueNumbers.includes(9)) {
      return "Contains Tesla key numbers (3, 6, 9)"
    }
    return "Complex pattern"
  }

  private calculateSacredGeometry(expression: string): any {
    // Golden ratio and sacred geometry calculations
    const phi = (1 + Math.sqrt(5)) / 2 // Golden ratio

    return {
      type: "sacred_geometry",
      goldenRatio: phi,
      fibonacci: this.generateFibonacci(10),
      explanation: "Sacred geometry reveals the mathematical patterns in nature",
    }
  }

  private generateFibonacci(count: number): number[] {
    const fib = [0, 1]
    for (let i = 2; i < count; i++) {
      fib[i] = fib[i - 1] + fib[i - 2]
    }
    return fib
  }

  private getTeslaSteps(expression: string): string[] {
    return [
      "Analyzing input for Tesla/Vortex math patterns",
      "Calculating digital roots",
      "Identifying Tesla key numbers (3, 6, 9)",
      "Determining pattern significance",
      "Generating mathematical insights",
    ]
  }

  private async findMathConcept(expression: string): Promise<MathConcept | null> {
    // Search seed data for math concepts
    if (this.seedData && this.seedData.concepts) {
      for (const concept of Object.values(this.seedData.concepts)) {
        const conceptData = concept as MathConcept
        if (expression.toLowerCase().includes(conceptData.name.toLowerCase())) {
          return conceptData
        }
      }
    }

    return null
  }

  private buildMathResponse(results: any[]): string {
    if (results.length === 1) {
      const result = results[0]

      if (result.type === "basic_arithmetic") {
        return `**Result:** ${result.result}\n\n**Steps:**\n${result.steps.join("\n")}`
      } else if (result.type === "tesla_vortex") {
        return this.formatTeslaResponse(result.result)
      } else if (result.type === "concept") {
        return this.formatConceptResponse(result.result)
      }
    } else {
      let response = "Here are the mathematical results:\n\n"
      results.forEach((result, index) => {
        response += `${index + 1}. ${result.expression} = ${result.result}\n`
      })
      return response
    }

    return "Mathematical analysis completed."
  }

  private formatTeslaResponse(result: any): string {
    if (result.type === "tesla_369") {
      let response = "**Tesla 3-6-9 Analysis:**\n\n"
      result.results.forEach((item: any) => {
        response += `Number: ${item.number}\n`
        response += `Digital Root: ${item.digitalRoot}\n`
        response += `Pattern: ${item.teslaPattern}\n`
        response += `Significance: ${item.significance}\n\n`
      })
      response += `*${result.explanation}*`
      return response
    } else if (result.type === "vortex_math") {
      return `**Vortex Math Sequence:** ${result.sequence.join(", ")}\n\n**Pattern:** ${result.pattern}\n\n*${result.explanation}*`
    } else if (result.type === "sacred_geometry") {
      return `**Golden Ratio (φ):** ${result.goldenRatio.toFixed(6)}\n\n**Fibonacci Sequence:** ${result.fibonacci.join(", ")}\n\n*${result.explanation}*`
    }

    return JSON.stringify(result, null, 2)
  }

  private formatConceptResponse(concept: MathConcept): string {
    let response = `**${concept.name}**\n\n`
    response += `${concept.description}\n\n`

    if (concept.formula) {
      response += `**Formula:** ${concept.formula}\n\n`
    }

    if (concept.examples && concept.examples.length > 0) {
      response += `**Example:**\n${concept.examples[0].explanation}`
    }

    return response
  }

  private calculateMathConfidence(results: any[]): number {
    if (results.length === 0) return 0

    let totalConfidence = 0

    for (const result of results) {
      if (result.type === "basic_arithmetic") {
        totalConfidence += 0.95 // High confidence for basic math
      } else if (result.type === "tesla_vortex") {
        totalConfidence += 0.8 // Good confidence for pattern analysis
      } else if (result.type === "concept") {
        totalConfidence += 0.9 // High confidence for known concepts
      } else {
        totalConfidence += 0.6 // Medium confidence for other results
      }
    }

    return Math.min(1, totalConfidence / results.length)
  }

  async learn(data: any): Promise<void> {
    // Save successful math operations to learnt data
    if (data.results && data.results.length > 0) {
      for (const result of data.results) {
        const learntEntry = {
          id: generateId(),
          content: {
            expression: result.expression,
            result: result.result,
            type: result.type,
            steps: result.steps || [],
          },
          confidence: 0.9,
          source: "mathematics-module",
          context: data.input,
          timestamp: Date.now(),
          usageCount: 1,
          lastUsed: Date.now(),
          verified: true,
          tags: [result.type, "calculation"],
          relationships: [],
        }

        await storageManager.addLearntEntry(MODULE_CONFIG.mathematics.learntFile, learntEntry)
        this.stats.learntEntries++
      }
    }

    this.stats.lastUpdate = Date.now()
  }

  private updateStats(responseTime: number, success: boolean): void {
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (this.stats.totalQueries - 1) + responseTime) / this.stats.totalQueries

    if (success) {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1) + 1) / this.stats.totalQueries
    } else {
      this.stats.successRate = (this.stats.successRate * (this.stats.totalQueries - 1)) / this.stats.totalQueries
    }
  }

  getStats(): ModuleStats {
    return { ...this.stats }
  }
}

export const mathematicsModule = new MathematicsModule()
