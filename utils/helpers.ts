// Utility helper functions
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export function calculateConfidence(confidences: number[]): number {
  if (confidences.length === 0) return 0

  // Weighted average with higher weight for higher confidences
  const sortedConfidences = confidences.sort((a, b) => b - a)
  let weightedSum = 0
  let totalWeight = 0

  sortedConfidences.forEach((confidence, index) => {
    const weight = 1 / (index + 1) // Higher weight for higher confidences
    weightedSum += confidence * weight
    totalWeight += weight
  })

  return Math.min(1, weightedSum / totalWeight)
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "").substring(0, 1000)
}

export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2 && word.length < 20)
    .slice(0, 10)
}

export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(extractKeywords(text1))
  const words2 = new Set(extractKeywords(text2))

  const intersection = new Set([...words1].filter((x) => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return union.size > 0 ? intersection.size / union.size : 0
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as any
  if (typeof obj === "object") {
    const clonedObj = {} as any
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}
