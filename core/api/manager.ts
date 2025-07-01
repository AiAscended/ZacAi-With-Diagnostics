// API management and caching system
interface APIRequest {
  url: string
  options?: RequestInit
  cacheKey?: string
  cacheDuration?: number
}

interface CacheEntry {
  data: any
  timestamp: number
  duration: number
}

export class APIManager {
  private cache: Map<string, CacheEntry> = new Map()
  private requestQueue: Map<string, Promise<any>> = new Map()
  private rateLimiter: Map<string, number[]> = new Map()

  private readonly DEFAULT_CACHE_DURATION = 300000 // 5 minutes
  private readonly MAX_REQUESTS_PER_MINUTE = 60
  private readonly REQUEST_TIMEOUT = 10000 // 10 seconds

  async makeRequest(url: string, options: RequestInit = {}, cacheKey?: string, cacheDuration?: number): Promise<any> {
    const key = cacheKey || this.generateCacheKey(url, options)

    // Check cache first
    if (this.isCached(key)) {
      console.log(`📦 Cache hit for: ${key}`)
      return this.getFromCache(key)
    }

    // Check if request is already in progress
    if (this.requestQueue.has(key)) {
      console.log(`⏳ Request already in progress for: ${key}`)
      return this.requestQueue.get(key)
    }

    // Check rate limiting
    if (!this.checkRateLimit(url)) {
      throw new Error(`Rate limit exceeded for ${url}`)
    }

    // Make the request
    const requestPromise = this.executeRequest(url, options)
    this.requestQueue.set(key, requestPromise)

    try {
      const result = await requestPromise

      // Cache successful responses
      if (result && !result.error) {
        this.setCache(key, result, cacheDuration || this.DEFAULT_CACHE_DURATION)
      }

      return result
    } catch (error) {
      console.error(`❌ API request failed for ${url}:`, error)
      throw error
    } finally {
      this.requestQueue.delete(key)
    }
  }

  private async executeRequest(url: string, options: RequestInit): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "ZacAI/2.0",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      } else {
        return await response.text()
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout")
      }

      throw error
    }
  }

  private generateCacheKey(url: string, options: RequestInit): string {
    const method = options.method || "GET"
    const body = options.body ? JSON.stringify(options.body) : ""
    return `${method}:${url}:${body}`
  }

  private isCached(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const isExpired = Date.now() - entry.timestamp > entry.duration
    if (isExpired) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  private getFromCache(key: string): any {
    const entry = this.cache.get(key)
    return entry ? entry.data : null
  }

  private setCache(key: string, data: any, duration: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration,
    })

    // Clean up old cache entries periodically
    if (this.cache.size > 1000) {
      this.cleanupCache()
    }
  }

  private cleanupCache(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.duration) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key))
    console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`)
  }

  private checkRateLimit(url: string): boolean {
    const domain = new URL(url).hostname
    const now = Date.now()
    const windowStart = now - 60000 // 1 minute window

    if (!this.rateLimiter.has(domain)) {
      this.rateLimiter.set(domain, [])
    }

    const requests = this.rateLimiter.get(domain)!

    // Remove old requests outside the window
    const recentRequests = requests.filter((timestamp) => timestamp > windowStart)

    if (recentRequests.length >= this.MAX_REQUESTS_PER_MINUTE) {
      return false
    }

    // Add current request
    recentRequests.push(now)
    this.rateLimiter.set(domain, recentRequests)

    return true
  }

  // Public methods for cache management
  clearCache(): void {
    this.cache.clear()
    console.log("🗑️ API cache cleared")
  }

  getCacheStats(): any {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      hitRate: this.calculateHitRate(),
    }
  }

  private calculateHitRate(): number {
    // This would need to be tracked over time in a real implementation
    return 0.75 // Placeholder
  }

  // Batch requests
  async batchRequests(requests: APIRequest[]): Promise<any[]> {
    const promises = requests.map((req) => this.makeRequest(req.url, req.options, req.cacheKey, req.cacheDuration))

    return Promise.allSettled(promises)
  }

  // Retry mechanism
  async requestWithRetry(url: string, options: RequestInit = {}, maxRetries = 3, retryDelay = 1000): Promise<any> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.makeRequest(url, options)
      } catch (error) {
        lastError = error as Error

        if (attempt < maxRetries) {
          console.log(`🔄 Retry attempt ${attempt} for ${url} in ${retryDelay}ms`)
          await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt))
        }
      }
    }

    throw lastError!
  }
}

export const apiManager = new APIManager()
