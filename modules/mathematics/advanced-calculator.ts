export class AdvancedCalculator {
  static sin(x: number): number {
    return Math.sin(x)
  }

  static cos(x: number): number {
    return Math.cos(x)
  }

  static tan(x: number): number {
    return Math.tan(x)
  }

  static asin(x: number): number {
    if (x < -1 || x > 1) throw new Error("Input out of range for arcsin")
    return Math.asin(x)
  }

  static acos(x: number): number {
    if (x < -1 || x > 1) throw new Error("Input out of range for arccos")
    return Math.acos(x)
  }

  static atan(x: number): number {
    return Math.atan(x)
  }

  static log(x: number, base: number = Math.E): number {
    if (x <= 0) throw new Error("Logarithm of non-positive number is undefined")
    if (base <= 0 || base === 1) throw new Error("Invalid logarithm base")
    return Math.log(x) / Math.log(base)
  }

  static ln(x: number): number {
    return this.log(x, Math.E)
  }

  static log10(x: number): number {
    return this.log(x, 10)
  }

  static exp(x: number): number {
    return Math.exp(x)
  }

  static abs(x: number): number {
    return Math.abs(x)
  }

  static ceil(x: number): number {
    return Math.ceil(x)
  }

  static floor(x: number): number {
    return Math.floor(x)
  }

  static round(x: number, decimals = 0): number {
    const factor = Math.pow(10, decimals)
    return Math.round(x * factor) / factor
  }

  static max(...numbers: number[]): number {
    return Math.max(...numbers)
  }

  static min(...numbers: number[]): number {
    return Math.min(...numbers)
  }

  static mean(numbers: number[]): number {
    if (numbers.length === 0) throw new Error("Cannot calculate mean of empty array")
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  }

  static median(numbers: number[]): number {
    if (numbers.length === 0) throw new Error("Cannot calculate median of empty array")

    const sorted = [...numbers].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2
    }
    return sorted[mid]
  }

  static mode(numbers: number[]): number[] {
    if (numbers.length === 0) throw new Error("Cannot calculate mode of empty array")

    const frequency: { [key: number]: number } = {}
    let maxFreq = 0

    numbers.forEach((num) => {
      frequency[num] = (frequency[num] || 0) + 1
      maxFreq = Math.max(maxFreq, frequency[num])
    })

    return Object.keys(frequency)
      .filter((key) => frequency[Number(key)] === maxFreq)
      .map(Number)
  }

  static standardDeviation(numbers: number[]): number {
    if (numbers.length === 0) throw new Error("Cannot calculate standard deviation of empty array")

    const mean = this.mean(numbers)
    const squaredDiffs = numbers.map((num) => Math.pow(num - mean, 2))
    const variance = this.mean(squaredDiffs)

    return Math.sqrt(variance)
  }

  static variance(numbers: number[]): number {
    if (numbers.length === 0) throw new Error("Cannot calculate variance of empty array")

    const mean = this.mean(numbers)
    const squaredDiffs = numbers.map((num) => Math.pow(num - mean, 2))

    return this.mean(squaredDiffs)
  }

  static correlation(x: number[], y: number[]): number {
    if (x.length !== y.length) throw new Error("Arrays must have the same length")
    if (x.length === 0) throw new Error("Cannot calculate correlation of empty arrays")

    const meanX = this.mean(x)
    const meanY = this.mean(y)

    let numerator = 0
    let sumXSquared = 0
    let sumYSquared = 0

    for (let i = 0; i < x.length; i++) {
      const diffX = x[i] - meanX
      const diffY = y[i] - meanY

      numerator += diffX * diffY
      sumXSquared += diffX * diffX
      sumYSquared += diffY * diffY
    }

    const denominator = Math.sqrt(sumXSquared * sumYSquared)

    if (denominator === 0) return 0
    return numerator / denominator
  }

  static linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
    if (x.length !== y.length) throw new Error("Arrays must have the same length")
    if (x.length === 0) throw new Error("Cannot perform regression on empty arrays")

    const n = x.length
    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
    const sumXSquared = x.reduce((sum, val) => sum + val * val, 0)
    const sumYSquared = y.reduce((sum, val) => sum + val * val, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXSquared - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate R-squared
    const meanY = sumY / n
    const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0)
    const residualSumSquares = y.reduce((sum, val, i) => {
      const predicted = slope * x[i] + intercept
      return sum + Math.pow(val - predicted, 2)
    }, 0)

    const r2 = 1 - residualSumSquares / totalSumSquares

    return { slope, intercept, r2 }
  }
}
