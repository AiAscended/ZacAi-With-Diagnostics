export class APIManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private requestQueue: Map<string, Promise<any>> = new Map()

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
      this.cache.delete(cacheKey)
    }

    // Check if request is already in progress
    const requestKey = `${url}_${JSON.stringify(options)}`
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey)
    }

    // Make the request
    const requestPromise = this.executeRequest(url, options)
    this.requestQueue.set(requestKey, requestPromise)

    try {
      const result = await requestPromise

      // Cache the result if cacheKey provided
      if (cacheKey && result) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl: cacheTTL,
        })
      }

      return result
    } finally {
      this.requestQueue.delete(requestKey)
    }
  }

  private async executeRequest(url: string, options: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      } else {
        return await response.text()
      }
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheSize(): number {
    return this.cache.size
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

export const apiManager = new APIManager()
