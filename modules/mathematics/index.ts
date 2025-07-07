import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"

export class MathematicsModule implements ModuleInterface {
  name = "mathematics"
  version = "3.0.0"
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

    console.log("🔢 Initializing Mathematics Module...")

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
      return await storageManager.loadSeedData("mathematics")
    } catch (error) {
      console.warn("Using fallback mathematics data")
      return this.getFallbackMathData()
    }
  }

  private async loadLearntData(): Promise<any> {
    try {
      return await storageManager.loadLearntData("mathematics")
    } catch (error) {
      console.warn("No learnt mathematics data found")
      return { entries: {} }
    }
  }

  private getFallbackMathData(): any {
    return {
      concepts: {
        basic_arithmetic: {
          name: "Basic Arithmetic",
          description:
            "Fundamental mathematical operations including addition, subtraction, multiplication, and division",
          examples: [
            { problem: "2 + 3", solution: "5", explanation: "Adding 2 and 3 gives us 5" },
            { problem: "10 - 4", solution: "6", explanation: "Subtracting 4 from 10 gives us 6" },
          ],
        },
      },
    }
  }

  async process(input: string, context?: any): Promise<ModuleResponse> {
    const startTime = Date.now()
    this.stats.totalQueries++

    try {
      const mathQueries = this.extractMathQueries(input)

      if (mathQueries.length === 0) {
        return {
          success: false,
          data: null,
          confidence: 0,
          source: this.name,
          timestamp: Date.now(),
        }
      }

      const results: any[] = []

      for (const query of mathQueries) {
        const result = await this.processMathQuery(query)
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
      const confidence = this.calculateConfidence(results)

      await this.learn({ input, results, context, timestamp: Date.now() })

      this.updateStats(Date.now() - startTime, true)

      return {
        success: true,
        data: response,
        confidence,
        source: this.name,
        timestamp: Date.now(),
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

  private extractMathQueries(input: string): string[] {
    const queries: string[] = []

    // Look for arithmetic expressions
    const arithmeticMatch = input.match(/[\d+\-*/()=\s]+/g)
    if (arithmeticMatch) {
      arithmeticMatch.forEach((match) => {
        const cleaned = match.trim()
        if (cleaned && /[\d+\-*/()]/.test(cleaned)) {
          queries.push(cleaned)
        }
      })
    }

    return [...new Set(queries)]
  }

  private async processMathQuery(query: string): Promise<any> {
    // Try to solve arithmetic expressions
    const arithmeticResult = this.solveArithmetic(query)
    if (arithmeticResult) {
      return {
        query,
        type: "arithmetic",
        result: arithmeticResult,
        confidence: 0.95,
      }
    }

    return null
  }

  private solveArithmetic(expression: string): any {
    try {
      // Clean the expression
      const cleaned = expression.replace(/[^0-9+\-*/().\s]/g, "").trim()
      if (!cleaned) return null

      // Basic safety check
      if (!/^[0-9+\-*/().\s]+$/.test(cleaned)) return null

      // Evaluate using order of operations
      const result = this.evaluateExpression(cleaned)
      if (result !== null && !isNaN(result)) {
        return {
          expression: cleaned,
          result: result,
          explanation: this.explainCalculation(cleaned, result),
        }
      }
    } catch (error) {
      console.error("Error solving arithmetic:", error)
    }
    return null
  }

  private evaluateExpression(expr: string): number | null {
    try {
      // Replace common symbols
      const normalized = expr.replace(/×/g, "*").replace(/÷/g, "/")

      // Use Function constructor for safe evaluation
      const result = new Function(`"use strict"; return (${normalized})`)()
      return typeof result === "number" ? result : null
    } catch (error) {
      return null
    }
  }

  private explainCalculation(expression: string, result: number): string {
    if (expression.includes("*") && expression.includes("+")) {
      return `Following order of operations (PEMDAS), multiplication is performed before addition`
    }
    if (expression.includes("(")) {
      return `Parentheses are evaluated first, then other operations follow order of operations`
    }
    return `Basic arithmetic calculation`
  }

  private buildMathResponse(results: any[]): string {
    let response = ""

    results.forEach((result, index) => {
      if (index > 0) response += "\n\n"

      if (result.type === "arithmetic") {
        response += `🧮 **${result.result.expression} = ${result.result.result}**\n\n`
        response += `**Explanation:** ${result.result.explanation}`
      }
    })

    return response
  }

  private calculateConfidence(results: any[]): number {
    if (results.length === 0) return 0

    let totalConfidence = 0
    for (const result of results) {
      totalConfidence += result.confidence
    }

    return Math.min(1, totalConfidence / results.length)
  }

  async learn(data: any): Promise<void> {
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
