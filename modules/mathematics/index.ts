import type { ModuleInterface, ModuleResponse, ModuleStats } from "@/types/global"
import { storageManager } from "@/core/storage/manager"
import { MODULE_CONFIG } from "@/config/app"
import { generateId } from "@/utils/helpers"
import { TeslaMathCalculator } from "./tesla-vortex"

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

      await this.learn({
        input,
        results,
        context,
        timestamp: Date.now(),
      })

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

    // Basic arithmetic expressions
    const basicMath = input.match(/\d+\s*[+\-*/]\s*\d+/g)
    if (basicMath) {
      expressions.push(...basicMath)
    }

    // Tesla/Vortex math patterns
    const teslaMatch = input.match(/tesla|vortex|369|digital root/i)
    if (teslaMatch) {
      expressions.push(input)
    }

    // Times table requests
    const timesTableMatch = input.match(/(\d+)\s*times\s*table|times\s*table\s*for\s*(\d+)/i)
    if (timesTableMatch) {
      expressions.push(input)
    }

    // Mirror times table requests
    const mirrorMatch = input.match(/mirror\s*times\s*table/i)
    if (mirrorMatch) {
      expressions.push(input)
    }

    // Sacred geometry
    const sacredMatch = input.match(/sacred\s*geometry|golden\s*ratio|fibonacci/i)
    if (sacredMatch) {
      expressions.push(input)
    }

    return expressions
  }

  private async solveMathExpression(expression: string): Promise<any> {
    // Basic arithmetic
    const basicResult = this.solveBasicArithmetic(expression)
    if (basicResult !== null) {
      return {
        expression,
        result: basicResult,
        type: "basic_arithmetic",
        steps: this.getArithmeticSteps(expression),
      }
    }

    // Tesla/Vortex math
    const teslaResult = this.solveTeslaMath(expression)
    if (teslaResult !== null) {
      return {
        expression,
        result: teslaResult,
        type: "tesla_vortex",
        steps: this.getTeslaSteps(expression),
      }
    }

    // Times tables
    const timesTableResult = this.generateTimesTable(expression)
    if (timesTableResult !== null) {
      return {
        expression,
        result: timesTableResult,
        type: "times_table",
        steps: ["Generated times table"],
      }
    }

    // Mirror times tables
    const mirrorResult = this.generateMirrorTimesTable(expression)
    if (mirrorResult !== null) {
      return {
        expression,
        result: mirrorResult,
        type: "mirror_times_table",
        steps: ["Generated mirror times table with digital root patterns"],
      }
    }

    // Sacred geometry
    const sacredResult = this.calculateSacredGeometry(expression)
    if (sacredResult !== null) {
      return {
        expression,
        result: sacredResult,
        type: "sacred_geometry",
        steps: ["Calculated sacred geometry patterns"],
      }
    }

    return null
  }

  private solveBasicArithmetic(expression: string): number | null {
    try {
      const cleanExpression = expression.replace(/[^0-9+\-*/().\s]/g, "")

      if (!/^[0-9+\-*/().\s]+$/.test(cleanExpression)) {
        return null
      }

      const result = Function(`"use strict"; return (${cleanExpression})`)()

      if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
        return Math.round(result * 1000000) / 1000000
      }
    } catch (error) {
      console.error("Error in basic arithmetic:", error)
    }

    return null
  }

  private solveTeslaMath(expression: string): any {
    const input = expression.toLowerCase()

    if (input.includes("tesla") || input.includes("369") || input.includes("digital root")) {
      const numbers = expression.match(/\d+/g)
      if (numbers) {
        const results = numbers.map((numStr) => {
          const num = Number.parseInt(numStr)
          return TeslaMathCalculator.calculateTeslaPattern(num)
        })

        return {
          type: "tesla_369",
          results,
          explanation: "Tesla believed that 3, 6, and 9 were the key to the universe",
        }
      }
    }

    if (input.includes("vortex")) {
      const numbers = expression.match(/\d+/g)
      const startNum = numbers ? Number.parseInt(numbers[0]) : 1
      const sequence = TeslaMathCalculator.generateVortexSequence(startNum, 12)

      return {
        type: "vortex_math",
        sequence,
        explanation: "Vortex math reveals the underlying patterns in numbers",
      }
    }

    return null
  }

  private generateTimesTable(expression: string): any {
    const match = expression.match(/(\d+)/)
    if (match) {
      const multiplier = Number.parseInt(match[1])
      const table = []

      for (let i = 1; i <= 12; i++) {
        table.push({
          multiplication: `${multiplier} × ${i}`,
          result: multiplier * i,
        })
      }

      return {
        multiplier,
        table,
        type: "standard_times_table",
      }
    }

    return null
  }

  private generateMirrorTimesTable(expression: string): any {
    const match = expression.match(/(\d+)/)
    const multiplier = match ? Number.parseInt(match[1]) : 2

    return TeslaMathCalculator.generateMirrorTimesTable(multiplier)
  }

  private calculateSacredGeometry(expression: string): any {
    return TeslaMathCalculator.calculateSacredGeometry()
  }

  private getArithmeticSteps(expression: string): string[] {
    const steps: string[] = []
    steps.push(`Original expression: ${expression}`)

    if (expression.includes("+")) steps.push("Performing addition")
    if (expression.includes("-")) steps.push("Performing subtraction")
    if (expression.includes("*")) steps.push("Performing multiplication")
    if (expression.includes("/")) steps.push("Performing division")

    return steps
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

  private buildMathResponse(results: any[]): string {
    if (results.length === 1) {
      const result = results[0]

      if (result.type === "basic_arithmetic") {
        return `**Result:** ${result.result}\n\n**Steps:**\n${result.steps.join("\n")}`
      } else if (result.type === "tesla_vortex") {
        return this.formatTeslaResponse(result.result)
      } else if (result.type === "times_table") {
        return this.formatTimesTableResponse(result.result)
      } else if (result.type === "mirror_times_table") {
        return this.formatMirrorTimesTableResponse(result.result)
      } else if (result.type === "sacred_geometry") {
        return this.formatSacredGeometryResponse(result.result)
      }
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
      return `**Vortex Math Sequence:** ${result.sequence.join(", ")}\n\n*${result.explanation}*`
    }

    return JSON.stringify(result, null, 2)
  }

  private formatTimesTableResponse(result: any): string {
    let response = `**${result.multiplier} Times Table:**\n\n`
    result.table.forEach((entry: any) => {
      response += `${entry.multiplication} = ${entry.result}\n`
    })
    return response
  }

  private formatMirrorTimesTableResponse(result: any): string {
    let response = `**Mirror Times Table for ${result.multiplier}:**\n\n`
    response += `**Standard:** ${result.standard.join(", ")}\n`
    response += `**Digital Roots:** ${result.mirror.join(", ")}\n`
    response += `**Sum Check:** ${result.sumCheck} (Digital Root: ${TeslaMathCalculator.calculateDigitalRoot(result.sumCheck)})\n`
    response += `**Pattern:** ${result.pattern}\n\n`
    response += `*All digital roots sum to 45, which reduces to 9 - the universal mathematical constant*`
    return response
  }

  private formatSacredGeometryResponse(result: any): string {
    let response = `**Sacred Geometry:**\n\n`
    response += `**Golden Ratio (φ):** ${result.goldenRatio.toFixed(6)}\n`
    response += `**Fibonacci Sequence:** ${result.fibonacci.join(", ")}\n`
    response += `**Phi Digital Root:** ${result.phiDigitalRoot}\n\n`
    response += `*${result.explanation}*`
    return response
  }

  private calculateMathConfidence(results: any[]): number {
    if (results.length === 0) return 0

    let totalConfidence = 0

    for (const result of results) {
      if (result.type === "basic_arithmetic") {
        totalConfidence += 0.95
      } else if (result.type === "tesla_vortex") {
        totalConfidence += 0.8
      } else if (result.type === "times_table") {
        totalConfidence += 0.9
      } else if (result.type === "mirror_times_table") {
        totalConfidence += 0.85
      } else if (result.type === "sacred_geometry") {
        totalConfidence += 0.8
      } else {
        totalConfidence += 0.7
      }
    }

    return Math.min(1, totalConfidence / results.length)
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
