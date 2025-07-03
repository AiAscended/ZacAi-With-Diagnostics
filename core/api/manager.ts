export class APIManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private requestQueue = new Map<string, Promise<any>>()

  /**
   * Make an HTTP request with caching and deduplication
   */
  async makeRequest(
    url: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL = 300000, // 5 minutes default
  ): Promise<any> {
    const key = cacheKey || url

    // Check cache first
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`Cache hit for: ${key}`)
      return cached.data
    }

    // Check if request is already in progress
    if (this.requestQueue.has(key)) {
      console.log(`Request deduplication for: ${key}`)
      return await this.requestQueue.get(key)
    }

    // Make the request
    const requestPromise = this.executeRequest(url, options)
    this.requestQueue.set(key, requestPromise)

    try {
      const data = await requestPromise

      // Cache the result
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: cacheTTL,
      })

      console.log(`API request successful: ${key}`)
      return data
    } catch (error) {
      console.error(`API request failed: ${key}`, error)
      throw error
    } finally {
      // Remove from queue
      this.requestQueue.delete(key)
    }
  }

  private async executeRequest(url: string, options: RequestInit): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "ZacAI/2.0",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return await response.json()
    } else {
      return await response.text()
    }
  }

  /**
   * Clear cache entries older than specified age
   */
  clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= cached.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): any {
    return {
      totalEntries: this.cache.size,
      activeRequests: this.requestQueue.size,
      cacheHitRate: this.calculateCacheHitRate(),
    }
  }

  private calculateCacheHitRate(): number {
    // This would need to be tracked over time
    // For now, return a placeholder
    return 0.75
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

export const apiManager = new APIManager()
