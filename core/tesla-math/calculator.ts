interface TeslaCalculation {
  input: number
  result: number
  pattern: string
  explanation: string
  vortexPosition?: number
}

class TeslaMathCalculator {
  private readonly TESLA_NUMBERS = [3, 6, 9]
  private readonly VORTEX_SEQUENCE = [1, 2, 4, 8, 7, 5]

  calculate(input: number): TeslaCalculation {
    const digitalRoot = this.getDigitalRoot(input)
    const vortexPosition = this.getVortexPosition(input)
    const pattern = this.identifyPattern(digitalRoot)

    return {
      input,
      result: digitalRoot,
      pattern,
      explanation: this.generateExplanation(input, digitalRoot, pattern),
      vortexPosition,
    }
  }

  private getDigitalRoot(num: number): number {
    if (num === 0) return 0
    return 1 + ((Math.abs(num) - 1) % 9)
  }

  private getVortexPosition(num: number): number {
    const digitalRoot = this.getDigitalRoot(num)
    if (this.TESLA_NUMBERS.includes(digitalRoot)) {
      return -1 // Tesla numbers are outside the vortex
    }
    return this.VORTEX_SEQUENCE.indexOf(digitalRoot)
  }

  private identifyPattern(digitalRoot: number): string {
    if (digitalRoot === 3) return "Divine Trinity - Creation"
    if (digitalRoot === 6) return "Divine Duality - Balance"
    if (digitalRoot === 9) return "Divine Unity - Completion"
    if (this.VORTEX_SEQUENCE.includes(digitalRoot)) return "Vortex Energy"
    return "Unknown Pattern"
  }

  private generateExplanation(input: number, result: number, pattern: string): string {
    let explanation = `${input} reduces to ${result} (${pattern}). `

    if (this.TESLA_NUMBERS.includes(result)) {
      explanation += `This is a Tesla number! Tesla believed ${result} held special significance in the universe.`
    } else {
      explanation += `This number flows through Tesla's vortex mathematics.`
    }

    return explanation
  }

  analyzeSequence(numbers: number[]): {
    sequence: TeslaCalculation[]
    patterns: string[]
    teslaCount: number
  } {
    const sequence = numbers.map((num) => this.calculate(num))
    const patterns = [...new Set(sequence.map((calc) => calc.pattern))]
    const teslaCount = sequence.filter((calc) => this.TESLA_NUMBERS.includes(calc.result)).length

    return { sequence, patterns, teslaCount }
  }

  generateVortexSequence(length = 12): number[] {
    const sequence: number[] = []
    for (let i = 1; i <= length; i++) {
      const digitalRoot = this.getDigitalRoot(i)
      if (!this.TESLA_NUMBERS.includes(digitalRoot)) {
        sequence.push(digitalRoot)
      }
    }
    return sequence
  }

  isTeslaNumber(num: number): boolean {
    const digitalRoot = this.getDigitalRoot(num)
    return this.TESLA_NUMBERS.includes(digitalRoot)
  }

  getVortexFlow(): { vortex: number[]; tesla: number[] } {
    return {
      vortex: this.VORTEX_SEQUENCE,
      tesla: this.TESLA_NUMBERS,
    }
  }
}

export const teslaMath = new TeslaMathCalculator()
export type { TeslaCalculation }
