import { SystemConfig } from "../system/config"

export interface MathResult {
  result: string | number
  confidence: number
  analysis: MathAnalysis
  method: string
  steps?: string[]
}

export interface MathAnalysis {
  expression: string
  type: string
  complexity: number
  vortexPattern?: VortexAnalysis
  teslaPattern?: TeslaAnalysis
}

export interface VortexAnalysis {
  digitalRoot: number
  vortexPosition: number
  isVortexNumber: boolean
  pattern: string
}

export interface TeslaAnalysis {
  isTeslaNumber: boolean
  teslaPattern: number[]
  significance: string
}

export class MathEngine {
  private mathFunctions: Map<string, Function> = new Map()
  private mathHistory: Array<{ expression: string; result: any; timestamp: number }> = []
  private vortexCycle = [1, 2, 4, 8, 7, 5]
  private isInitialized = false

  constructor() {
    console.log("🔢 MathEngine: Initializing...")
    this.initializeMathFunctions()
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🔢 MathEngine: Loading mathematical functions and patterns...")
    this.isInitialized = true
  }

  private initializeMathFunctions(): void {
    // Basic arithmetic
    this.mathFunctions.set("add", (a: number, b: number) => a + b)
    this.mathFunctions.set("subtract", (a: number, b: number) => a - b)
    this.mathFunctions.set("multiply", (a: number, b: number) => a * b)
    this.mathFunctions.set("divide", (a: number, b: number) => (b !== 0 ? a / b : "Cannot divide by zero"))

    // Advanced functions
    this.mathFunctions.set("power", (a: number, b: number) => Math.pow(a, b))
    this.mathFunctions.set("sqrt", (a: number) => Math.sqrt(a))
    this.mathFunctions.set("sin", (a: number) => Math.sin((a * Math.PI) / 180))
    this.mathFunctions.set("cos", (a: number) => Math.cos((a * Math.PI) / 180))
    this.mathFunctions.set("tan", (a: number) => Math.tan((a * Math.PI) / 180))
    this.mathFunctions.set("log", (a: number) => Math.log10(a))
    this.mathFunctions.set("ln", (a: number) => Math.log(a))

    // Tesla/Vortex functions
    this.mathFunctions.set("digitalRoot", (a: number) => this.calculateDigitalRoot(a))
    this.mathFunctions.set("vortexPattern", (a: number) => this.getVortexPattern(a))
    this.mathFunctions.set("teslaPattern", (a: number) => this.getTeslaPattern(a))
  }

  public async processMath(input: string): Promise<MathResult> {
    console.log(`🔢 MathEngine: Processing math: "${input}"`)

    try {
      const analysis = this.analyzeMathExpression(input)
      const result = await this.calculateExpression(input, analysis)

      // Store in history
      this.mathHistory.push({
        expression: input,
        result: result.result,
        timestamp: Date.now(),
      })

      // Keep history manageable
      if (this.mathHistory.length > 100) {
        this.mathHistory = this.mathHistory.slice(-50)
      }

      return result
    } catch (error) {
      console.error("❌ MathEngine: Error processing math:", error)
      return {
        result: "Error: Could not calculate",
        confidence: 0.1,
        analysis: {
          expression: input,
          type: "error",
          complexity: 0,
        },
        method: "error",
      }
    }
  }

  private analyzeMathExpression(input: string): MathAnalysis {
    const expression = input.trim()
    let type = "unknown"
    let complexity = 0

    // Determine math type
    if (/^\d+\s*[+]\s*\d+/.test(expression)) type = "addition"
    else if (/^\d+\s*[-]\s*\d+/.test(expression)) type = "subtraction"
    else if (/^\d+\s*[*×]\s*\d+/.test(expression)) type = "multiplication"
    else if (/^\d+\s*[/÷]\s*\d+/.test(expression)) type = "division"
    else if (/^\d+\s*[\^]\s*\d+/.test(expression)) type = "exponentiation"
    else if (/sqrt|√/.test(expression)) type = "square_root"
    else if (/sin|cos|tan/.test(expression)) type = "trigonometry"
    else if (/log|ln/.test(expression)) type = "logarithm"
    else if (/digital\s*root|vortex|tesla/.test(expression.toLowerCase())) type = "vortex_math"
    else type = "complex"

    // Calculate complexity
    const operatorCount = (expression.match(/[+\-*/^√]/g) || []).length
    const numberCount = (expression.match(/\d+/g) || []).length
    complexity = (operatorCount + numberCount) / 10

    return {
      expression,
      type,
      complexity: Math.min(complexity, 1),
    }
  }

  private async calculateExpression(input: string, analysis: MathAnalysis): Promise<MathResult> {
    const steps: string[] = []
    let result: string | number = 0
    let confidence = 0.9
    let method = "calculation"

    // Handle different math types
    switch (analysis.type) {
      case "addition":
        result = this.handleBasicArithmetic(input, "add", steps)
        break
      case "subtraction":
        result = this.handleBasicArithmetic(input, "subtract", steps)
        break
      case "multiplication":
        result = this.handleBasicArithmetic(input, "multiply", steps)
        break
      case "division":
        result = this.handleBasicArithmetic(input, "divide", steps)
        break
      case "exponentiation":
        result = this.handleBasicArithmetic(input, "power", steps)
        break
      case "square_root":
        result = this.handleSquareRoot(input, steps)
        break
      case "trigonometry":
        result = this.handleTrigonometry(input, steps)
        break
      case "vortex_math":
        result = this.handleVortexMath(input, steps)
        method = "vortex_calculation"
        break
      default:
        result = this.handleComplexExpression(input, steps)
        confidence = 0.7
    }

    // Add vortex analysis for numbers
    if (typeof result === "number" && SystemConfig.ENGINES.MATH.ENABLE_VORTEX_MATH) {
      analysis.vortexPattern = this.analyzeVortexPattern(result)
    }

    // Add Tesla analysis for numbers
    if (typeof result === "number" && SystemConfig.ENGINES.MATH.ENABLE_TESLA_PATTERNS) {
      analysis.teslaPattern = this.analyzeTeslaPattern(result)
    }

    return {
      result,
      confidence,
      analysis,
      method,
      steps: steps.length > 0 ? steps : undefined,
    }
  }

  private handleBasicArithmetic(input: string, operation: string, steps: string[]): number | string {
    const numbers = input.match(/\d+(?:\.\d+)?/g)
    if (!numbers || numbers.length < 2) {
      return "Error: Invalid expression"
    }

    const a = Number.parseFloat(numbers[0])
    const b = Number.parseFloat(numbers[1])

    steps.push(`Identified numbers: ${a} and ${b}`)
    steps.push(`Performing ${operation} operation`)

    const mathFunc = this.mathFunctions.get(operation)
    if (mathFunc) {
      const result = mathFunc(a, b)
      steps.push(`Result: ${result}`)
      return result
    }

    return "Error: Operation not found"
  }

  private handleSquareRoot(input: string, steps: string[]): number | string {
    const match = input.match(/sqrt$$(\d+(?:\.\d+)?)$$|√(\d+(?:\.\d+)?)|sqrt\s+(\d+(?:\.\d+)?)/i)
    if (!match) return "Error: Invalid square root expression"

    const number = Number.parseFloat(match[1] || match[2] || match[3])
    steps.push(`Taking square root of ${number}`)

    const result = Math.sqrt(number)
    steps.push(`√${number} = ${result}`)

    return result
  }

  private handleTrigonometry(input: string, steps: string[]): number | string {
    const sinMatch = input.match(/sin$$(\d+(?:\.\d+)?)$$/i)
    const cosMatch = input.match(/cos$$(\d+(?:\.\d+)?)$$/i)
    const tanMatch = input.match(/tan$$(\d+(?:\.\d+)?)$$/i)

    if (sinMatch) {
      const angle = Number.parseFloat(sinMatch[1])
      steps.push(`Calculating sin(${angle}°)`)
      const result = Math.sin((angle * Math.PI) / 180)
      steps.push(`sin(${angle}°) = ${result}`)
      return result
    }

    if (cosMatch) {
      const angle = Number.parseFloat(cosMatch[1])
      steps.push(`Calculating cos(${angle}°)`)
      const result = Math.cos((angle * Math.PI) / 180)
      steps.push(`cos(${angle}°) = ${result}`)
      return result
    }

    if (tanMatch) {
      const angle = Number.parseFloat(tanMatch[1])
      steps.push(`Calculating tan(${angle}°)`)
      const result = Math.tan((angle * Math.PI) / 180)
      steps.push(`tan(${angle}°) = ${result}`)
      return result
    }

    return "Error: Invalid trigonometric expression"
  }

  private handleVortexMath(input: string, steps: string[]): number | string {
    const numberMatch = input.match(/\d+/)
    if (!numberMatch) return "Error: No number found for vortex analysis"

    const number = Number.parseInt(numberMatch[0])
    steps.push(`Analyzing vortex pattern for ${number}`)

    const digitalRoot = this.calculateDigitalRoot(number)
    const vortexPattern = this.getVortexPattern(number)
    const teslaPattern = this.getTeslaPattern(number)

    steps.push(`Digital root: ${digitalRoot}`)
    steps.push(`Vortex pattern: ${JSON.stringify(vortexPattern)}`)
    steps.push(`Tesla significance: ${JSON.stringify(teslaPattern)}`)

    return `Digital Root: ${digitalRoot}, Vortex: ${vortexPattern.isVortexNumber ? "Yes" : "No"}, Tesla: ${teslaPattern.isTeslaNumber ? "Yes" : "No"}`
  }

  private handleComplexExpression(input: string, steps: string[]): number | string {
    try {
      steps.push("Attempting to evaluate complex expression")

      // Simple expression evaluation (be careful with eval in production)
      const sanitized = input.replace(/[^0-9+\-*/().\s]/g, "")
      if (sanitized !== input) {
        return "Error: Invalid characters in expression"
      }

      const result = Function('"use strict"; return (' + sanitized + ")")()
      steps.push(`Evaluated: ${sanitized} = ${result}`)

      return result
    } catch (error) {
      return "Error: Could not evaluate expression"
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

  private getVortexPattern(number: number): VortexAnalysis {
    const digitalRoot = this.calculateDigitalRoot(number)
    const vortexCycle = [1, 2, 4, 8, 7, 5]
    const isVortexNumber = vortexCycle.includes(digitalRoot)
    const vortexPosition = vortexCycle.indexOf(digitalRoot)

    return {
      digitalRoot,
      vortexPosition: vortexPosition >= 0 ? vortexPosition : -1,
      isVortexNumber,
      pattern: isVortexNumber ? "vortex_cycle" : "outside_vortex",
    }
  }

  private getTeslaPattern(number: number): TeslaAnalysis {
    const digitalRoot = this.calculateDigitalRoot(number)
    const teslaNumbers = [3, 6, 9]
    const isTeslaNumber = teslaNumbers.includes(digitalRoot)

    return {
      isTeslaNumber,
      teslaPattern: teslaNumbers,
      significance: isTeslaNumber
        ? `Tesla number ${digitalRoot} - represents divine frequency and universal energy`
        : "Not a Tesla number",
    }
  }

  private analyzeVortexPattern(number: number): VortexAnalysis {
    return this.getVortexPattern(number)
  }

  private analyzeTeslaPattern(number: number): TeslaAnalysis {
    return this.getTeslaPattern(number)
  }

  public getStatus(): any {
    return {
      initialized: this.isInitialized,
      functionsLoaded: this.mathFunctions.size,
      historySize: this.mathHistory.length,
      vortexMathEnabled: SystemConfig.ENGINES.MATH.ENABLE_VORTEX_MATH,
      teslaPatternsEnabled: SystemConfig.ENGINES.MATH.ENABLE_TESLA_PATTERNS,
    }
  }
}
