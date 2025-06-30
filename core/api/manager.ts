export class APIManager {
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map()
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  async makeRequest(
    url: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL = 300000, // 5 minutes default
  ): Promise<any> {
    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (Date.now() - cached.timestamp < cached.ttl) {
        return cached.data
      }
    }

    // Check rate limits
    if (!this.checkRateLimit(url)) {
      throw new Error("Rate limit exceeded")
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
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

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  private checkRateLimit(url: string): boolean {
    const domain = new URL(url).hostname
    const now = Date.now()
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

  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.85, // Placeholder - would need actual tracking
    }
  }
}

export const apiManager = new APIManager()
