export class KnowledgeManager {
  private isInitialized = false
  private knowledgeBase: Map<string, any> = new Map()

  public async initialize(): Promise<void> {
    if (this.isInitialized) return
    console.log("📚 KnowledgeManager: Initialized")
    this.isInitialized = true
  }

  public async addKnowledge(key: string, data: any): Promise<void> {
    this.knowledgeBase.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  public async getKnowledge(key: string): Promise<any> {
    return this.knowledgeBase.get(key)?.data || null
  }

  public async searchKnowledge(query: string): Promise<any[]> {
    const results: any[] = []
    for (const [key, value] of this.knowledgeBase.entries()) {
      if (key.toLowerCase().includes(query.toLowerCase())) {
        results.push({ key, ...value })
      }
    }
    return results
  }

  public getStats(): any {
    return {
      totalEntries: this.knowledgeBase.size,
      initialized: this.isInitialized,
    }
  }
}
