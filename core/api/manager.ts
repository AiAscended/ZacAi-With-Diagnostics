import { retry } from "@/utils/helpers"

export class APIManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map()

  async get(url: string, options: RequestInit = {}, cacheTTL = 300000): Promise<any> {
    // Check cache first
    const cacheKey = `GET:${url}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    // Check rate limits
    if (!this.checkRateLimit(url)) {
      throw new Error("Rate limit exceeded")
    }

    try {
      const response = await retry(async () => {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          ...options,
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        return res.json()
      })

      // Cache the response
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
        ttl: cacheTTL,
      })

      return response
    } catch (error) {
      console.error("API GET error:", error)
      throw error
    }
  }

  async post(url: string, data: any, options: RequestInit = {}): Promise<any> {
    if (!this.checkRateLimit(url)) {
      throw new Error("Rate limit exceeded")
    }

    try {
      const response = await retry(async () => {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          body: JSON.stringify(data),
          ...options,
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        return res.json()
      })

      return response
    } catch (error) {
      console.error("API POST error:", error)
      throw error
    }
  }

  private checkRateLimit(url: string): boolean {
    const now = Date.now()
    const domain = new URL(url).hostname
    const limit = this.rateLimits.get(domain)

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(domain, {
        count: 1,
        resetTime: now + 60000, // 1 minute window
      })
      return true
    }

    if (limit.count >= 60) {
      // 60 requests per minute
      return false
    }

    limit.count++
    return true
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheSize(): number {
    return this.cache.size
  }
}

export const apiManager = new APIManager()
