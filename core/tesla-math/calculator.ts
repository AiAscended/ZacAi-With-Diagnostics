export class TeslaMathCalculator {
  // Tesla's 3-6-9 pattern and vortex mathematics

  calculateDigitalRoot(num: number): number {
    while (num >= 10) {
      num = num
        .toString()
        .split("")
        .reduce((sum, digit) => sum + Number.parseInt(digit), 0)
    }
    return num
  }

  getTeslaPattern(number: number): any {
    const digitalRoot = this.calculateDigitalRoot(number)
    const vortexCycle = [1, 2, 4, 8, 7, 5]
    const teslaNumbers = [3, 6, 9]

    const isTeslaNumber = teslaNumbers.includes(digitalRoot)
    const isVortexNumber = vortexCycle.includes(digitalRoot)

    return {
      originalNumber: number,
      digitalRoot,
      isTeslaNumber,
      isVortexNumber,
      type: isTeslaNumber ? "Tesla Number" : isVortexNumber ? "Vortex Cycle" : "Standard",
      significance: this.getTeslaSignificance(digitalRoot),
      analysis: this.getVortexAnalysis(digitalRoot),
      steps: this.getCalculationSteps(number),
    }
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

  private getVortexAnalysis(digitalRoot: number): string {
    if ([3, 6, 9].includes(digitalRoot)) {
      return `Tesla Number representing the key to the universe`
    } else if ([1, 2, 4, 8, 7, 5].includes(digitalRoot)) {
      return `Vortex Cycle number - part of the infinite loop`
    }
    return "Standard number"
  }

  private getCalculationSteps(number: number): string[] {
    const steps: string[] = []
    let current = number

    steps.push(`Starting with: ${current}`)

    while (current >= 10) {
      const digits = current.toString().split("").map(Number)
      const sum = digits.reduce((a, b) => a + b, 0)
      steps.push(`${current} → ${digits.join(" + ")} = ${sum}`)
      current = sum
    }

    steps.push(`Final digital root: ${current}`)
    return steps
  }

  generateVortexSequence(startNumber: number, length = 12): number[] {
    const sequence = []
    let current = this.calculateDigitalRoot(startNumber)

    for (let i = 0; i < length; i++) {
      sequence.push(current)
      current = (current * 2) % 9
      if (current === 0) current = 9
    }

    return sequence
  }

  calculateSacredGeometry(): any {
    const phi = (1 + Math.sqrt(5)) / 2 // Golden ratio
    const fibonacci = this.generateFibonacci(10)

    return {
      goldenRatio: phi,
      fibonacci,
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
}

export const teslaMathCalculator = new TeslaMathCalculator()
