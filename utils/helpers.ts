export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)

  const set1 = new Set(words1)
  const set2 = new Set(words2)

  const intersection = new Set([...set1].filter((x) => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

export function calculateConfidence(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((a, b) => a + b, 0)
  return sum / values.length
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim()
    .substring(0, 10000)
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

export function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)

  return [...new Set(words)]
}

export function calculateRelevance(query: string, content: string): number {
  const queryWords = extractKeywords(query)
  const contentWords = extractKeywords(content)

  let matches = 0
  for (const word of queryWords) {
    if (contentWords.includes(word)) {
      matches++
    }
  }

  return queryWords.length > 0 ? matches / queryWords.length : 0
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
    const clonedObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + "..."
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function parseJSON<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString)
  } catch {
    return fallback
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function groupBy<T, K extends keyof any>(array: T[], key: (item: T) => K): Record<K, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = key(item)
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    },
    {} as Record<K, T[]>,
  )
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item)
  }, [])
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function camelCase(str: string): string {
  return str.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
}

export function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
}

export function snakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()
}
