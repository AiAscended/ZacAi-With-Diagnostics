export interface MathOperation {
  operation: string
  operands: number[]
  result: number
  method: string
  steps: string[]
}

export interface TimesTable {
  multiplicand: number
  multiplier: number
  product: number
  visualization: string
}

export class MathematicalToolkit {
  private timesTableCache: Map<string, number> = new Map()
  private mathConstants: Map<string, number> = new Map()
  private calculationHistory: MathOperation[] = []

  constructor() {
    this.initializeTimesTable()
    this.initializeMathConstants()
  }

  private initializeTimesTable(): void {
    // Pre-calculate times tables 1-12
    for (let i = 1; i <= 12; i++) {
      for (let j = 1; j <= 12; j++) {
        const key = `${i}x${j}`
        this.timesTableCache.set(key, i * j)
      }
    }
  }

  private initializeMathConstants(): void {
    this.mathConstants.set("pi", Math.PI)
    this.mathConstants.set("e", Math.E)
    this.mathConstants.set("phi", (1 + Math.sqrt(5)) / 2) // Golden ratio
    this.mathConstants.set("sqrt2", Math.sqrt(2))
    this.mathConstants.set("sqrt3", Math.sqrt(3))
    this.mathConstants.set("ln2", Math.LN2)
    this.mathConstants.set("ln10", Math.LN10)
    this.mathConstants.set("log2e", Math.LOG2E)
    this.mathConstants.set("log10e", Math.LOG10E)
  }

  // Basic arithmetic with step-by-step explanation
  add(a: number, b: number): MathOperation {
    const result = a + b
    const operation: MathOperation = {
      operation: "addition",
      operands: [a, b],
      result,
      method: "basic arithmetic",
      steps: [`Start with ${a}`, `Add ${b}`, `${a} + ${b} = ${result}`],
    }

    this.calculationHistory.push(operation)
    return operation
  }

  subtract(a: number, b: number): MathOperation {
    const result = a - b
    const operation: MathOperation = {
      operation: "subtraction",
      operands: [a, b],
      result,
      method: "basic arithmetic",
      steps: [`Start with ${a}`, `Subtract ${b}`, `${a} - ${b} = ${result}`],
    }

    this.calculationHistory.push(operation)
    return operation
  }

  multiply(a: number, b: number): MathOperation {
    const key = `${a}x${b}`
    const reverseKey = `${b}x${a}`

    // Check times table first
    if (this.timesTableCache.has(key)) {
      return {
        operation: "multiplication",
        operands: [a, b],
        result: this.timesTableCache.get(key)!,
        method: "times table lookup",
        steps: [`Looking up ${a} × ${b} in times table`, `${a} × ${b} = ${this.timesTableCache.get(key)}`],
      }
    }

    if (this.timesTableCache.has(reverseKey)) {
      return {
        operation: "multiplication",
        operands: [a, b],
        result: this.timesTableCache.get(reverseKey)!,
        method: "times table lookup (commutative)",
        steps: [
          `Looking up ${b} × ${a} in times table`,
          `${b} × ${a} = ${a} × ${b} = ${this.timesTableCache.get(reverseKey)}`,
        ],
      }
    }

    // Use long multiplication for larger numbers
    return this.longMultiplication(a, b)
  }

  private longMultiplication(a: number, b: number): MathOperation {
    const result = a * b
    const steps = [`Multiplying ${a} × ${b}`, `Using standard multiplication algorithm`, `Result: ${result}`]

    // Add visual breakdown for smaller numbers
    if (a <= 20 && b <= 20) {
      steps.splice(1, 0, this.visualizeMultiplication(a, b))
    }

    const operation: MathOperation = {
      operation: "multiplication",
      operands: [a, b],
      result,
      method: "long multiplication",
      steps,
    }

    this.calculationHistory.push(operation)
    return operation
  }

  private visualizeMultiplication(a: number, b: number): string {
    // Create a simple visual representation
    if (a <= 5 && b <= 5) {
      let visual = `Visual: `
      for (let i = 0; i < a; i++) {
        visual += "●".repeat(b) + " "
      }
      visual += `= ${a * b} dots`
      return visual
    }
    return `${a} groups of ${b} = ${a * b}`
  }

  divide(a: number, b: number): MathOperation {
    if (b === 0) {
      throw new Error("Division by zero is undefined")
    }

    const result = a / b
    const isWholeNumber = result % 1 === 0

    const steps = [
      `Dividing ${a} ÷ ${b}`,
      isWholeNumber ? `${a} ÷ ${b} = ${result}` : `${a} ÷ ${b} = ${result} (${this.toFraction(a, b)})`,
    ]

    const operation: MathOperation = {
      operation: "division",
      operands: [a, b],
      result,
      method: "basic division",
      steps,
    }

    this.calculationHistory.push(operation)
    return operation
  }

  private toFraction(numerator: number, denominator: number): string {
    const gcd = this.greatestCommonDivisor(numerator, denominator)
    const simplifiedNum = numerator / gcd
    const simplifiedDen = denominator / gcd
    return `${simplifiedNum}/${simplifiedDen}`
  }

  private greatestCommonDivisor(a: number, b: number): number {
    return b === 0 ? a : this.greatestCommonDivisor(b, a % b)
  }

  // Safe expression evaluation
  evaluateExpression(expression: string): MathOperation {
    try {
      // Sanitize the expression - only allow numbers, operators, and parentheses
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, "")

      if (sanitized !== expression) {
        throw new Error("Invalid characters in expression")
      }

      // Use Function constructor for safe evaluation
      const result = new Function(`"use strict"; return (${sanitized})`)()

      if (typeof result !== "number" || !isFinite(result)) {
        throw new Error("Invalid calculation result")
      }

      const operation: MathOperation = {
        operation: "expression evaluation",
        operands: [],
        result,
        method: "expression parser",
        steps: [`Evaluating: ${expression}`, `Sanitized: ${sanitized}`, `Result: ${result}`],
      }

      this.calculationHistory.push(operation)
      return operation
    } catch (error) {
      throw new Error(`Failed to evaluate expression: ${error}`)
    }
  }

  // Get times table for learning
  getTimesTable(number: number): TimesTable[] {
    const table: TimesTable[] = []

    for (let i = 1; i <= 12; i++) {
      table.push({
        multiplicand: number,
        multiplier: i,
        product: number * i,
        visualization: this.createMultiplicationVisualization(number, i),
      })
    }

    return table
  }

  private createMultiplicationVisualization(a: number, b: number): string {
    if (a <= 3 && b <= 3) {
      let visual = ""
      for (let i = 0; i < a; i++) {
        visual += "●".repeat(b) + "\n"
      }
      return visual.trim()
    }
    return `${a} × ${b} = ${a * b}`
  }

  // Get math constant
  getConstant(name: string): number | null {
    return this.mathConstants.get(name.toLowerCase()) || null
  }

  // Get calculation history
  getCalculationHistory(): MathOperation[] {
    return [...this.calculationHistory]
  }

  // Clear history
  clearHistory(): void {
    this.calculationHistory = []
  }

  // Get math statistics
  getMathStats() {
    const operations = this.calculationHistory.reduce(
      (acc, op) => {
        acc[op.operation] = (acc[op.operation] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalCalculations: this.calculationHistory.length,
      operationBreakdown: operations,
      timesTableSize: this.timesTableCache.size,
      constantsAvailable: this.mathConstants.size,
      recentCalculations: this.calculationHistory.slice(-5),
    }
  }
}
