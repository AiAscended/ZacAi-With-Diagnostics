import { API_CONFIG } from "@/config/app"

interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

export class APIManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private requestCount = 0
  private lastRequestTime = 0

  async makeRequest(url: string, options: RequestOptions = {}, cacheKey?: string, cacheTTL = 300000): Promise<any> {
    // Check rate limiting
    if (this.isRateLimited()) {
      throw new Error("Rate limit exceeded")
    }

    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (Date.now() - cached.timestamp < cached.ttl) {
        return cached.data
      } else {
        this.cache.delete(cacheKey)
      }
    }

    try {
      const controller = new AbortController()
      const timeout = options.timeout || API_CONFIG.timeout

      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Cache the response
      if (cacheKey) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTTL,
        })
      }

      this.updateRequestStats()
      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  async get(url: string, cacheKey?: string, cacheTTL?: number): Promise<any> {
    return this.makeRequest(url, { method: "GET" }, cacheKey, cacheTTL)
  }

  async post(url: string, data: any, options: RequestOptions = {}): Promise<any> {
    return this.makeRequest(url, {
      ...options,
      method: "POST",
      body: data,
    })
  }

  async put(url: string, data: any, options: RequestOptions = {}): Promise<any> {
    return this.makeRequest(url, {
      ...options,
      method: "PUT",
      body: data,
    })
  }

  async delete(url: string, options: RequestOptions = {}): Promise<any> {
    return this.makeRequest(url, {
      ...options,
      method: "DELETE",
    })
  }

  private isRateLimited(): boolean {
    const now = Date.now()
    const windowStart = now - API_CONFIG.rateLimit.window

    // Reset counter if we're in a new window
    if (this.lastRequestTime < windowStart) {
      this.requestCount = 0
    }

    return this.requestCount >= API_CONFIG.rateLimit.requests
  }

  private updateRequestStats(): void {
    this.requestCount++
    this.lastRequestTime = Date.now()
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    }
  }

  getStats() {
    return {
      requestCount: this.requestCount,
      cacheSize: this.cache.size,
      lastRequestTime: this.lastRequestTime,
    }
  }
}

export const apiManager = new APIManager()
