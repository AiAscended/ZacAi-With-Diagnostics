export class TeslaMathCalculator {
  calculate(number: number): any {
    const digitalRoot = this.getDigitalRoot(number)
    const pattern = this.getTeslaPattern(digitalRoot)

    return {
      input: number,
      result: digitalRoot,
      pattern: pattern,
      explanation: this.getExplanation(digitalRoot),
    }
  }

  private getDigitalRoot(num: number): number {
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
      return "Tesla Sacred Number"
    } else if ([1, 2, 4, 8, 7, 5].includes(digitalRoot)) {
      return "Vortex Cycle Number"
    }
    return "Unknown Pattern"
  }

  private getExplanation(digitalRoot: number): string {
    const explanations: { [key: number]: string } = {
      1: "Beginning, unity, source energy",
      2: "Duality, balance, partnership",
      3: "Tesla sacred number - creativity and manifestation",
      4: "Foundation, stability, material world",
      5: "Change, freedom, adventure",
      6: "Tesla sacred number - harmony and nurturing",
      7: "Spirituality, introspection, mystery",
      8: "Material success, power, achievement",
      9: "Tesla sacred number - completion and universal love",
    }
    return explanations[digitalRoot] || "Unknown significance"
  }

  getTeslaPattern(number: number): any {
    const digitalRoot = this.getDigitalRoot(number)
    const isTeslaNumber = [3, 6, 9].includes(digitalRoot)

    return {
      digitalRoot,
      type: isTeslaNumber ? "Tesla Sacred" : "Vortex Cycle",
      significance: this.getExplanation(digitalRoot),
      analysis: `The number ${number} reduces to ${digitalRoot}, which is ${isTeslaNumber ? "one of Tesla's sacred numbers" : "part of the vortex cycle"}.`,
      steps: this.getCalculationSteps(number),
      isTeslaNumber,
    }
  }

  private getCalculationSteps(number: number): string[] {
    const steps: string[] = []
    let current = number

    steps.push(`Starting with: ${current}`)

    while (current >= 10) {
      const digits = current
        .toString()
        .split("")
        .map((d) => Number.parseInt(d))
      const sum = digits.reduce((a, b) => a + b, 0)
      steps.push(`${digits.join(" + ")} = ${sum}`)
      current = sum
    }

    steps.push(`Final digital root: ${current}`)
    return steps
  }
}

export const teslaMathCalculator = new TeslaMathCalculator()
