export class APIManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map()

  async makeRequest(url: string, options: RequestInit = {}, cacheKey?: string, cacheTTL = 300000): Promise<any> {
    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (Date.now() - cached.timestamp < cached.ttl) {
        return cached.data
      }
      this.cache.delete(cacheKey)
    }

    // Check rate limits
    const domain = new URL(url).hostname
    if (this.isRateLimited(domain)) {
      throw new Error(`Rate limited for ${domain}`)
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "User-Agent": "ZacAI/2.0",
          Accept: "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Cache successful responses
      if (cacheKey) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTTL,
        })
      }

      // Update rate limit tracking
      this.updateRateLimit(domain)

      return data
    } catch (error) {
      console.error(`API request failed for ${url}:`, error)
      throw error
    }
  }

  private isRateLimited(domain: string): boolean {
    const limit = this.rateLimits.get(domain)
    if (!limit) return false

    if (Date.now() > limit.resetTime) {
      this.rateLimits.delete(domain)
      return false
    }

    return limit.count >= 100 // 100 requests per hour
  }

  private updateRateLimit(domain: string): void {
    const now = Date.now()
    const hourFromNow = now + 3600000

    const current = this.rateLimits.get(domain)
    if (!current || now > current.resetTime) {
      this.rateLimits.set(domain, { count: 1, resetTime: hourFromNow })
    } else {
      current.count++
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats(): any {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    }
  }
}

export const apiManager = new APIManager()
