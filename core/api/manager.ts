export class APIManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private requestQueue: Map<string, Promise<any>> = new Map()

  async makeRequest(
    url: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL = 300000, // 5 minutes default
  ): Promise<any> {
    // Use cache if available and not expired
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (Date.now() - cached.timestamp < cached.ttl) {
        return cached.data
      }
      this.cache.delete(cacheKey)
    }

    // Prevent duplicate requests
    const requestKey = `${url}_${JSON.stringify(options)}`
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey)
    }

    const requestPromise = this.executeRequest(url, options)
    this.requestQueue.set(requestKey, requestPromise)

    try {
      const result = await requestPromise

      // Cache successful results
      if (cacheKey && result) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl: cacheTTL,
        })
      }

      return result
    } catch (error) {
      console.error(`API request failed for ${url}:`, error)
      throw error
    } finally {
      this.requestQueue.delete(requestKey)
    }
  }

  private async executeRequest(url: string, options: RequestInit): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "ZacAI/1.0",
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

  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

export const apiManager = new APIManager()
