export class ChineseStickMethod {
  static multiply(
    num1: string,
    num2: string,
  ): {
    result: string
    steps: string[]
    visualization: string
    stickDiagram: string[][]
  } {
    const steps: string[] = []
    const digits1 = num1.split("").map(Number)
    const digits2 = num2.split("").map(Number)

    steps.push(`Multiplying ${num1} × ${num2} using Chinese Stick Method`)
    steps.push(`First number digits: ${digits1.join(", ")}`)
    steps.push(`Second number digits: ${digits2.join(", ")}`)

    // Create stick representation
    const stickDiagram = this.createStickDiagram(digits1, digits2)

    // Calculate intersections
    const intersections = this.calculateIntersections(digits1, digits2)
    steps.push(`Intersection points calculated`)

    // Sum diagonals to get result
    const result = this.sumDiagonals(intersections, digits1.length, digits2.length)
    steps.push(`Final result: ${result}`)

    const visualization = this.createVisualization(digits1, digits2, intersections)

    return {
      result,
      steps,
      visualization,
      stickDiagram,
    }
  }

  private static createStickDiagram(digits1: number[], digits2: number[]): string[][] {
    const diagram: string[][] = []
    const maxHeight = Math.max(...digits1, ...digits2) + 2
    const totalWidth = digits1.length * 3 + digits2.length * 3 + 5

    // Initialize diagram with spaces
    for (let i = 0; i < maxHeight; i++) {
      diagram[i] = new Array(totalWidth).fill(" ")
    }

    // Draw first number sticks (vertical)
    let xPos = 2
    digits1.forEach((digit, i) => {
      for (let stick = 0; stick < digit; stick++) {
        for (let y = 1; y < maxHeight - 1; y++) {
          diagram[y][xPos + stick] = "|"
        }
      }
      xPos += digit + 1
    })

    // Draw second number sticks (horizontal)
    let yPos = 2
    digits2.forEach((digit, i) => {
      for (let stick = 0; stick < digit; stick++) {
        for (let x = 1; x < totalWidth - 1; x++) {
          if (diagram[yPos + stick][x] === "|") {
            diagram[yPos + stick][x] = "+"
          } else if (diagram[yPos + stick][x] === " ") {
            diagram[yPos + stick][x] = "-"
          }
        }
      }
      yPos += digit + 1
    })

    return diagram
  }

  private static calculateIntersections(digits1: number[], digits2: number[]): number[][] {
    const intersections: number[][] = []

    for (let i = 0; i < digits1.length; i++) {
      const row: number[] = []
      for (let j = 0; j < digits2.length; j++) {
        row.push(digits1[i] * digits2[j])
      }
      intersections.push(row)
    }

    return intersections
  }

  private static sumDiagonals(intersections: number[][], rows: number, cols: number): string {
    const diagonalSums: number[] = []

    // Sum each diagonal from bottom-left to top-right
    for (let d = 0; d < rows + cols - 1; d++) {
      let sum = 0

      for (let i = 0; i < rows; i++) {
        const j = d - i
        if (j >= 0 && j < cols) {
          sum += intersections[i][j]
        }
      }

      diagonalSums.push(sum)
    }

    // Handle carries
    let carry = 0
    const resultDigits: number[] = []

    for (let i = diagonalSums.length - 1; i >= 0; i--) {
      const total = diagonalSums[i] + carry
      resultDigits.unshift(total % 10)
      carry = Math.floor(total / 10)
    }

    while (carry > 0) {
      resultDigits.unshift(carry % 10)
      carry = Math.floor(carry / 10)
    }

    return resultDigits.join("")
  }

  private static createVisualization(digits1: number[], digits2: number[], intersections: number[][]): string {
    let viz = "Chinese Stick Method Visualization:\n\n"

    viz += "Step 1: Draw sticks for each digit\n"
    viz += `${digits1.join(" × ")} (vertical sticks)\n`
    viz += `${digits2.join(" × ")} (horizontal sticks)\n\n`

    viz += "Step 2: Count intersection points\n"
    viz += "Intersection Matrix:\n"

    intersections.forEach((row, i) => {
      viz += `Row ${i + 1}: ${row.join("  ")}\n`
    })

    viz += "\nStep 3: Sum diagonals (right to left)\n"
    viz += "Each diagonal sum gives one digit of the result\n"

    return viz
  }

  static demonstrateMethod(examples: Array<{ num1: string; num2: string }>): {
    [key: string]: {
      calculation: ReturnType<typeof ChineseStickMethod.multiply>
      traditionalResult: string
      matches: boolean
    }
  } {
    const results: any = {}

    examples.forEach(({ num1, num2 }) => {
      const stickResult = this.multiply(num1, num2)
      const traditionalResult = (Number.parseInt(num1) * Number.parseInt(num2)).toString()
      const matches = stickResult.result === traditionalResult

      results[`${num1}×${num2}`] = {
        calculation: stickResult,
        traditionalResult,
        matches,
      }
    })

    return results
  }

  static generatePracticeProblems(
    difficulty: "easy" | "medium" | "hard",
    count: number,
  ): Array<{
    num1: string
    num2: string
    hint: string
  }> {
    const problems: Array<{ num1: string; num2: string; hint: string }> = []

    for (let i = 0; i < count; i++) {
      let num1: string, num2: string, hint: string

      switch (difficulty) {
        case "easy":
          num1 = Math.floor(Math.random() * 90 + 10).toString() // 10-99
          num2 = Math.floor(Math.random() * 9 + 1).toString() // 1-9
          hint = "Start with single digit multiplication"
          break

        case "medium":
          num1 = Math.floor(Math.random() * 90 + 10).toString() // 10-99
          num2 = Math.floor(Math.random() * 90 + 10).toString() // 10-99
          hint = "Remember to sum the diagonals carefully"
          break

        case "hard":
          num1 = Math.floor(Math.random() * 900 + 100).toString() // 100-999
          num2 = Math.floor(Math.random() * 90 + 10).toString() // 10-99
          hint = "More diagonals means more careful addition"
          break

        default:
          num1 = "12"
          num2 = "34"
          hint = "Basic example"
      }

      problems.push({ num1, num2, hint })
    }

    return problems
  }

  static explainConcept(): {
    history: string
    principle: string
    advantages: string[]
    applications: string[]
    modernRelevance: string
  } {
    return {
      history:
        "The Chinese stick method, also known as line multiplication or Napier's bones variation, has been used in East Asia for over 1000 years. It provides a visual way to multiply numbers using intersecting lines.",

      principle:
        "The method works by representing each digit as a number of parallel lines. When lines from two numbers intersect, the intersection points represent partial products. These are then grouped and summed to get the final result.",

      advantages: [
        "Visual and intuitive approach",
        "Reduces mental arithmetic",
        "Easy to verify by counting",
        "Works for any size numbers",
        "Helps understand place value",
        "Engaging for visual learners",
      ],

      applications: [
        "Elementary mathematics education",
        "Alternative calculation method",
        "Mathematical art and visualization",
        "Cultural mathematics studies",
        "Cognitive learning research",
      ],

      modernRelevance:
        "While calculators have made manual multiplication less necessary, the Chinese stick method remains valuable for understanding mathematical concepts, engaging visual learners, and appreciating the diversity of mathematical thinking across cultures.",
    }
  }
}
