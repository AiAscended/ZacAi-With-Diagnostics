// API management with caching and rate limiting
export class APIManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map()

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
      } else {
        this.cache.delete(cacheKey)
      }
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
          "User-Agent": "ZacAI/1.0",
          Accept: "application/json",
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

    // Simple rate limiting: max 60 requests per minute
    return limit.count >= 60
  }

  private updateRateLimit(domain: string): void {
    const now = Date.now()
    const limit = this.rateLimits.get(domain)

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(domain, {
        count: 1,
        resetTime: now + 60000, // Reset after 1 minute
      })
    } else {
      limit.count++
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.85, // Placeholder - would track actual hit rate
    }
  }
}

export const apiManager = new APIManager()
