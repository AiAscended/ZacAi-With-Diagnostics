export class TimestableMatrix {
  static generateTable(size = 12): number[][] {
    const matrix: number[][] = []

    for (let i = 1; i <= size; i++) {
      const row: number[] = []
      for (let j = 1; j <= size; j++) {
        row.push(i * j)
      }
      matrix.push(row)
    }

    return matrix
  }

  static generateModularTable(size: number, modulus: number): number[][] {
    const matrix: number[][] = []

    for (let i = 1; i <= size; i++) {
      const row: number[] = []
      for (let j = 1; j <= size; j++) {
        row.push((i * j) % modulus)
      }
      matrix.push(row)
    }

    return matrix
  }

  static analyzePatterns(matrix: number[][]): {
    symmetrical: boolean
    diagonalPattern: number[]
    uniqueValues: number[]
    frequency: { [key: number]: number }
  } {
    const size = matrix.length
    let symmetrical = true
    const diagonalPattern: number[] = []
    const allValues: number[] = []

    // Check symmetry and collect values
    for (let i = 0; i < size; i++) {
      diagonalPattern.push(matrix[i][i])
      for (let j = 0; j < size; j++) {
        allValues.push(matrix[i][j])
        if (matrix[i][j] !== matrix[j][i]) {
          symmetrical = false
        }
      }
    }

    const uniqueValues = [...new Set(allValues)].sort((a, b) => a - b)
    const frequency: { [key: number]: number } = {}

    allValues.forEach((value) => {
      frequency[value] = (frequency[value] || 0) + 1
    })

    return {
      symmetrical,
      diagonalPattern,
      uniqueValues,
      frequency,
    }
  }

  static visualizeTable(matrix: number[][], highlight?: number): string {
    const size = matrix.length
    let result = ""

    // Header row
    result += "    "
    for (let j = 1; j <= size; j++) {
      result += j.toString().padStart(4)
    }
    result += "\n"

    // Separator
    result += "   " + "─".repeat(size * 4 + 1) + "\n"

    // Data rows
    for (let i = 0; i < size; i++) {
      result += (i + 1).toString().padStart(2) + " │"
      for (let j = 0; j < size; j++) {
        const value = matrix[i][j]
        const valueStr = value.toString()

        if (highlight && value === highlight) {
          result += `[${valueStr}]`.padStart(4)
        } else {
          result += valueStr.padStart(4)
        }
      }
      result += "\n"
    }

    return result
  }

  static findMultiples(
    number: number,
    limit = 144,
  ): {
    multiples: number[]
    positions: Array<{ row: number; col: number }>
    pattern: string
  } {
    const multiples: number[] = []
    const positions: Array<{ row: number; col: number }> = []

    for (let i = 1; i * number <= limit; i++) {
      multiples.push(i * number)
    }

    // Find positions in 12x12 table
    const matrix = this.generateTable(12)
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j++) {
        if (multiples.includes(matrix[i][j])) {
          positions.push({ row: i + 1, col: j + 1 })
        }
      }
    }

    const pattern = this.analyzeMultiplePattern(positions)

    return { multiples, positions, pattern }
  }

  private static analyzeMultiplePattern(positions: Array<{ row: number; col: number }>): string {
    if (positions.length === 0) return "No pattern"

    // Check for diagonal patterns
    const isDiagonal = positions.every((pos) => pos.row === pos.col)
    if (isDiagonal) return "Diagonal pattern"

    // Check for row/column patterns
    const rows = positions.map((pos) => pos.row)
    const cols = positions.map((pos) => pos.col)
    const uniqueRows = [...new Set(rows)]
    const uniqueCols = [...new Set(cols)]

    if (uniqueRows.length === 1) return "Single row pattern"
    if (uniqueCols.length === 1) return "Single column pattern"

    // Check for symmetric patterns
    const isSymmetric = positions.every((pos) => positions.some((p) => p.row === pos.col && p.col === pos.row))
    if (isSymmetric) return "Symmetric pattern"

    return "Complex pattern"
  }

  static primeFactorization(matrix: number[][]): {
    [key: number]: {
      factors: number[]
      isPrime: boolean
      primeFactorization: string
    }
  } {
    const result: any = {}
    const allValues = matrix.flat()
    const uniqueValues = [...new Set(allValues)].sort((a, b) => a - b)

    uniqueValues.forEach((value) => {
      const factors = this.getFactors(value)
      const primeFactors = this.getPrimeFactors(value)
      const isPrime = primeFactors.length === 1 && primeFactors[0] === value

      result[value] = {
        factors,
        isPrime,
        primeFactorization: this.formatPrimeFactorization(primeFactors),
      }
    })

    return result
  }

  private static getFactors(n: number): number[] {
    const factors: number[] = []
    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        factors.push(i)
        if (i !== n / i) {
          factors.push(n / i)
        }
      }
    }
    return factors.sort((a, b) => a - b)
  }

  private static getPrimeFactors(n: number): number[] {
    const factors: number[] = []
    let divisor = 2

    while (n > 1) {
      while (n % divisor === 0) {
        factors.push(divisor)
        n /= divisor
      }
      divisor++
      if (divisor * divisor > n && n > 1) {
        factors.push(n)
        break
      }
    }

    return factors
  }

  private static formatPrimeFactorization(factors: number[]): string {
    if (factors.length === 0) return "1"
    if (factors.length === 1) return factors[0].toString()

    const factorCounts: { [key: number]: number } = {}
    factors.forEach((factor) => {
      factorCounts[factor] = (factorCounts[factor] || 0) + 1
    })

    return Object.entries(factorCounts)
      .map(([factor, count]) => (count === 1 ? factor : `${factor}^${count}`))
      .join(" × ")
  }

  static generateColorPattern(
    matrix: number[][],
    colorScheme: "rainbow" | "prime" | "even-odd" = "rainbow",
  ): {
    [key: number]: string
  } {
    const colors: { [key: number]: string } = {}
    const uniqueValues = [...new Set(matrix.flat())].sort((a, b) => a - b)

    switch (colorScheme) {
      case "rainbow":
        uniqueValues.forEach((value, index) => {
          const hue = ((index * 360) / uniqueValues.length) % 360
          colors[value] = `hsl(${hue}, 70%, 50%)`
        })
        break

      case "prime":
        uniqueValues.forEach((value) => {
          const isPrime = this.isPrime(value)
          colors[value] = isPrime ? "#ff6b6b" : "#4ecdc4"
        })
        break

      case "even-odd":
        uniqueValues.forEach((value) => {
          colors[value] = value % 2 === 0 ? "#3498db" : "#e74c3c"
        })
        break
    }

    return colors
  }

  private static isPrime(n: number): boolean {
    if (n < 2) return false
    if (n === 2) return true
    if (n % 2 === 0) return false

    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false
    }
    return true
  }

  static exportToCSV(matrix: number[][]): string {
    let csv = ""

    // Header row
    csv += "," + Array.from({ length: matrix.length }, (_, i) => i + 1).join(",") + "\n"

    // Data rows
    matrix.forEach((row, i) => {
      csv += i + 1 + "," + row.join(",") + "\n"
    })

    return csv
  }

  static importFromCSV(csvData: string): number[][] {
    const lines = csvData.trim().split("\n")
    const matrix: number[][] = []

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").slice(1) // Skip row label
      const row = values.map((val) => Number.parseInt(val.trim()))
      matrix.push(row)
    }

    return matrix
  }
}
