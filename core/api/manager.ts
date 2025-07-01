export class APIManager {
  private cache: Map<string, { data: any; timestamp: number; duration: number }> = new Map()
  private requestQueue: Array<{ url: string; options: any; resolve: Function; reject: Function }> = []
  private isProcessing = false
  private rateLimitDelay = 1000 // 1 second between requests

  async makeRequest(url: string, options: any = {}, cacheKey?: string, cacheDuration = 300000): Promise<any> {
    // Check cache first
    if (cacheKey && this.getCachedResponse(cacheKey)) {
      return this.getCachedResponse(cacheKey)
    }

    return new Promise((resolve, reject) => {
      this.requestQueue.push({ url, options, resolve, reject })
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) return

    this.isProcessing = true

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()
      if (!request) break

      try {
        const response = await fetch(request.url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "ZacAI/1.0",
          },
          ...request.options,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        request.resolve(data)

        // Add delay between requests to respect rate limits
        if (this.requestQueue.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay))
        }
      } catch (error) {
        console.error(`API request failed for ${request.url}:`, error)
        request.reject(error)
      }
    }

    this.isProcessing = false
  }

  getCachedResponse(key: string): any {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.duration) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  setCachedResponse(key: string, data: any, duration: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration,
    })
  }

  clearCache(): void {
    this.cache.clear()
  }

  getStats(): any {
    return {
      cacheSize: this.cache.size,
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing,
    }
  }
}

export const apiManager = new APIManager()
