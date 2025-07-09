export interface MathResult {
  answer: number | string
  steps: string[]
  method: string
  confidence: number
  vortexData?: any
  teslaData?: any
}

export class MathEngine {
  private mathPatterns: MathPattern[] = []
  private teslaMap: Map<number, any> = new Map()
  private vortexCycle = [1, 2, 4, 8, 7, 5]
  private isInitialized = false
  private calculations = 0

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    this.initializeMathPatterns()
    this.initializeTeslaMap()
    this.isInitialized = true
    console.log("🧮 Math Engine initialized with Tesla/Vortex mathematics")
  }

  public async process(input: string, thinkingResult: any): Promise<any> {
    console.log("🧮 Math Engine processing:", input)

    const mathAnalysis = this.analyzeMathExpression(input)

    if (mathAnalysis.isMatch && mathAnalysis.result !== undefined) {
      const enhancedResult = {
        ...thinkingResult,
        content: this.generateMathResponse(mathAnalysis),
        mathAnalysis: mathAnalysis,
        confidence: mathAnalysis.confidence,
      }

      return enhancedResult
    }

    return thinkingResult
  }

  public async processMath(input: string): Promise<any> {
    // Basic math processing - will be enhanced later
    const mathPattern = /(\d+)\s*([+\-*/])\s*(\d+)/
    const match = input.match(mathPattern)

    if (match) {
      const [, num1, operator, num2] = match
      const a = Number.parseFloat(num1)
      const b = Number.parseFloat(num2)
      let result = 0

      switch (operator) {
        case "+":
          result = a + b
          break
        case "-":
          result = a - b
          break
        case "*":
          result = a * b
          break
        case "/":
          result = b !== 0 ? a / b : Number.NaN
          break
      }

      this.calculations++
      return {
        calculation: `${a} ${operator} ${b} = ${result}`,
        result,
        confidence: 0.95,
      }
    }

    return null
  }

  private initializeMathPatterns(): void {
    this.mathPatterns = [
      {
        pattern: /(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/i,
        operation: "multiply",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)/i,
        operation: "add",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/i,
        operation: "subtract",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
      {
        pattern: /(\d+(?:\.\d+)?)\s*[/÷]\s*(\d+(?:\.\d+)?)/i,
        operation: "divide",
        confidence: 0.95,
        extract: (match) => [Number.parseFloat(match[1]), Number.parseFloat(match[2])],
      },
    ]
  }

  private initializeTeslaMap(): void {
    for (let i = 1; i <= 100; i++) {
      const digitalRoot = this.calculateDigitalRoot(i)
      this.teslaMap.set(i, {
        number: i,
        digitalRoot,
        isVortexNumber: this.vortexCycle.includes(digitalRoot),
        isTeslaNumber: [3, 6, 9].includes(digitalRoot),
        teslaGroup:
          digitalRoot === 3
            ? "creator"
            : digitalRoot === 6
              ? "manifestation"
              : digitalRoot === 9
                ? "completion"
                : "vortex",
      })
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

  private analyzeMathExpression(input: string): any {
    const cleanInput = input.trim().toLowerCase()

    for (const pattern of this.mathPatterns) {
      const match = cleanInput.match(pattern.pattern)
      if (match) {
        try {
          const numbers = pattern.extract(match)
          const result = this.performOperation(pattern.operation, numbers)

          return {
            isMatch: true,
            operation: pattern.operation,
            numbers: numbers,
            result: result,
            confidence: pattern.confidence,
            vortexData: this.getVortexData(result as number),
          }
        } catch (error) {
          return {
            isMatch: false,
            error: error.message,
          }
        }
      }
    }

    return { isMatch: false }
  }

  private performOperation(operation: string, numbers: number[]): number | string {
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

  private getVortexData(number: number): any {
    return (
      this.teslaMap.get(number) || {
        number,
        digitalRoot: this.calculateDigitalRoot(number),
        isVortexNumber: false,
        isTeslaNumber: false,
      }
    )
  }

  private generateMathResponse(analysis: any): string {
    let response = `🧮 **Mathematical Calculation**\n\n`
    response += `**Problem:** ${analysis.numbers.join(` ${this.getOperationSymbol(analysis.operation)} `)} = **${analysis.result}**\n\n`

    if (analysis.vortexData) {
      response += `**🌀 Vortex Math Analysis:**\n`
      response += `• Digital Root: ${analysis.vortexData.digitalRoot}\n`
      response += `• Pattern: ${analysis.vortexData.isTeslaNumber ? "Tesla Number (3-6-9)" : analysis.vortexData.isVortexNumber ? "Vortex Cycle" : "Standard"}\n\n`
    }

    return response
  }

  private getOperationSymbol(operation: string): string {
    const symbols = {
      add: "+",
      subtract: "-",
      multiply: "×",
      divide: "÷",
    }
    return symbols[operation as keyof typeof symbols] || operation
  }

  public getStats(): any {
    return {
      patternsLoaded: this.mathPatterns.length,
      teslaMapSize: this.teslaMap.size,
      isInitialized: this.isInitialized,
      calculations: this.calculations,
    }
  }
}

interface MathPattern {
  pattern: RegExp
  operation: string
  confidence: number
  extract: (match: RegExpMatchArray) => number[]
}
