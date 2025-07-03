import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"
import { generateId } from "@/utils/helpers"

export class MathematicsModule implements ModuleInterface {
  name = "mathematics"
  version = "2.0.0"
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
      this.seedData = await this.loadSeedData()
      this.learntData = await this.loadLearntData()

      this.initialized = true
      console.log("✅ Mathematics Module initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing Mathematics Module:", error)
      throw error
    }
  }

  private async loadSeedData(): Promise<any> {
    try {
      const response = await fetch("/seed_maths.json")
      if (!response.ok) throw new Error("Failed to load seed math data")
      return await response.json()
    } catch (error) {
      console.warn("Using fallback math data")
      return this.getFallbackMathData()
    }
  }

  private async loadLearntData(): Promise<any> {
    try {
      return await storageManager.loadLearntData("mathematics")
    } catch (error) {
      console.warn("No learnt math data found, starting fresh")
      return { entries: {} }
    }
  }

  private getFallbackMathData(): any {
    return {
      metadata: {
        version: "1.0.0",
        totalEntries: 5,
        source: "fallback-math",
      },
      concepts: {
        basic_arithmetic: {
          name: "Basic Arithmetic",
          description: "Fundamental mathematical operations",
          operations: ["+", "-", "*", "/"],
          examples: ["2+2=4", "5*3=15", "10/2=5"],
        },
        order_of_operations: {
          name: "Order of Operations",
          description: "PEMDAS/BODMAS rule for mathematical expressions",
          rule: "Parentheses, Exponents, Multiplication/Division, Addition/Subtraction",
          examples: ["3+3*3=12", "(3+3)*3=18"],
        },
      },
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
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

      await this.learn({ input, results, context, timestamp: Date.now() })

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

    // Basic arithmetic expressions with order of operations
    const basicMath = input.match(/\d+(?:\.\d+)?\s*[+\-*/()]\s*\d+(?:\.\d+)?(?:\s*[+\-*/()]\s*\d+(?:\.\d+)?)*/g)
    if (basicMath) {
      expressions.push(...basicMath)
    }

    // Simple equals expressions
    const equalsMatch = input.match(/\d+(?:\.\d+)?\s*[+\-*/]\s*\d+(?:\.\d+)?\s*=/g)
    if (equalsMatch) {
      equalsMatch.forEach((expr) => {
        expressions.push(expr.replace("=", ""))
      })
    }

    return expressions
  }

  private async solveMathExpression(expression: string): Promise<any> {
    // Clean and validate expression
    const cleanExpression = expression.replace(/[^0-9+\-*/().\s]/g, "").trim()

    if (!cleanExpression || !/^[0-9+\-*/().\s]+$/.test(cleanExpression)) {
      return null
    }

    try {
      // Safe evaluation using Function constructor
      const result = this.evaluateExpression(cleanExpression)

      if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
        return {
          expression: cleanExpression,
          result: Math.round(result * 1000000) / 1000000, // Round to 6 decimal places
          type: "arithmetic",
          steps: this.getCalculationSteps(cleanExpression, result),
        }
      }
    } catch (error) {
      console.error("Error evaluating expression:", error)
    }

    return null
  }

  private evaluateExpression(expression: string): number {
    // Simple recursive descent parser for basic arithmetic
    const tokens = this.tokenize(expression)
    let index = 0

    const parseExpression = (): number => {
      let result = parseTerm()

      while (index < tokens.length && (tokens[index] === "+" || tokens[index] === "-")) {
        const operator = tokens[index++]
        const term = parseTerm()
        result = operator === "+" ? result + term : result - term
      }

      return result
    }

    const parseTerm = (): number => {
      let result = parseFactor()

      while (index < tokens.length && (tokens[index] === "*" || tokens[index] === "/")) {
        const operator = tokens[index++]
        const factor = parseFactor()
        result = operator === "*" ? result * factor : result / factor
      }

      return result
    }

    const parseFactor = (): number => {
      if (tokens[index] === "(") {
        index++ // skip '('
        const result = parseExpression()
        index++ // skip ')'
        return result
      }

      if (tokens[index] === "-") {
        index++
        return -parseFactor()
      }

      return Number.parseFloat(tokens[index++])
    }

    return parseExpression()
  }

  private tokenize(expression: string): string[] {
    const tokens: string[] = []
    let current = ""

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i]

      if (/\d|\./.test(char)) {
        current += char
      } else if (/[+\-*/()]/.test(char)) {
        if (current) {
          tokens.push(current)
          current = ""
        }
        tokens.push(char)
      } else if (char === " ") {
        if (current) {
          tokens.push(current)
          current = ""
        }
      }
    }

    if (current) {
      tokens.push(current)
    }

    return tokens
  }

  private getCalculationSteps(expression: string, result: number): string[] {
    const steps: string[] = []
    steps.push(`Original expression: ${expression}`)

    // Check for order of operations
    if (expression.includes("*") || expression.includes("/")) {
      if (expression.includes("+") || expression.includes("-")) {
        steps.push("Following order of operations (PEMDAS/BODMAS)")
        steps.push("First: Multiplication and Division (left to right)")
        steps.push("Then: Addition and Subtraction (left to right)")
      }
    }

    steps.push(`Final result: ${result}`)
    return steps
  }

  private buildMathResponse(results: any[]): string {
    if (results.length === 1) {
      const result = results[0]
      let response = `**Mathematical Calculation:**\n\n`
      response += `**Expression:** ${result.expression}\n`
      response += `**Result:** ${result.result}\n\n`

      if (result.steps && result.steps.length > 0) {
        response += `**Steps:**\n`
        result.steps.forEach((step: string, index: number) => {
          response += `${index + 1}. ${step}\n`
        })
      }

      return response
    } else {
      let response = "**Mathematical Calculations:**\n\n"
      results.forEach((result, index) => {
        response += `**${index + 1}.** ${result.expression} = ${result.result}\n`
      })
      return response
    }
  }

  private calculateMathConfidence(results: any[]): number {
    if (results.length === 0) return 0

    // Math calculations have high confidence when successful
    return 0.95
  }

  async learn(data: any): Promise<void> {
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

        await storageManager.addLearntEntry("mathematics", learntEntry)
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
