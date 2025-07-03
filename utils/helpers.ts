export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function calculateSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0

  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)

  const set1 = new Set(words1)
  const set2 = new Set(words2)

  const intersection = new Set([...set1].filter((x) => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim()
}

export function extractEntities(text: string): string[] {
  const entities: string[] = []

  // Extract numbers
  const numbers = text.match(/\d+(?:\.\d+)?/g)
  if (numbers) entities.push(...numbers.map((n) => `number:${n}`))

  // Extract capitalized words (potential names/places)
  const capitalWords = text.match(/\b[A-Z][a-z]+\b/g)
  if (capitalWords) entities.push(...capitalWords.map((w) => `name:${w}`))

  // Extract mathematical operators
  const mathOps = text.match(/[+\-*/=]/g)
  if (mathOps) entities.push(...mathOps.map((op) => `operator:${op}`))

  return [...new Set(entities)]
}

export function calculateConfidence(factors: number[]): number {
  if (factors.length === 0) return 0
  const average = factors.reduce((sum, factor) => sum + factor, 0) / factors.length
  return Math.max(0, Math.min(1, average))
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
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as unknown as T
  if (typeof obj === "object") {
    const clonedObj = {} as { [key: string]: any }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj as T
  }
  return obj
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function retry<T>(fn: () => Promise<T>, maxAttempts = 3, delay = 1000): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0

    const attempt = async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (error) {
        attempts++
        if (attempts >= maxAttempts) {
          reject(error)
        } else {
          setTimeout(attempt, delay * attempts)
        }
      }
    }

    attempt()
  })
}
