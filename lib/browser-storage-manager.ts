export class BrowserStorageManager {
  private readonly conversationKey = "conversationHistory"
  private readonly memoryKey = "memory"
  private readonly vocabularyKey = "vocabulary"

  async loadConversations(): Promise<any[]> {
    try {
      const stored = localStorage.getItem(this.conversationKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load conversations from localStorage:", error)
      return []
    }
  }

  async saveConversations(conversations: any[]): Promise<void> {
    try {
      localStorage.setItem(this.conversationKey, JSON.stringify(conversations))
    } catch (error) {
      console.error("Failed to save conversations to localStorage:", error)
    }
  }

  async loadMemory(): Promise<Map<string, any>> {
    try {
      const stored = localStorage.getItem(this.memoryKey)
      const data = stored ? JSON.parse(stored) : []
      return new Map(data)
    } catch (error) {
      console.error("Failed to load memory from localStorage:", error)
      return new Map()
    }
  }

  async saveMemory(memory: Map<string, any>): Promise<void> {
    try {
      const data = Array.from(memory.entries())
      localStorage.setItem(this.memoryKey, JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save memory to localStorage:", error)
    }
  }

  async loadVocabulary(): Promise<Map<string, string>> {
    try {
      const stored = localStorage.getItem(this.vocabularyKey)
      const data = stored ? JSON.parse(stored) : []
      return new Map(data)
    } catch (error) {
      console.error("Failed to load vocabulary from localStorage:", error)
      return new Map()
    }
  }

  async saveVocabulary(vocabulary: Map<string, string>): Promise<void> {
    try {
      const data = Array.from(vocabulary.entries())
      localStorage.setItem(this.vocabularyKey, JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save vocabulary to localStorage:", error)
    }
  }

  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.conversationKey)
      localStorage.removeItem(this.memoryKey)
      localStorage.removeItem(this.vocabularyKey)
    } catch (error) {
      console.error("Failed to clear data from localStorage:", error)
    }
  }

  async exportAllData(): Promise<any> {
    try {
      const vocabulary = localStorage.getItem(this.vocabularyKey)
      const memory = localStorage.getItem(this.memoryKey)

      return {
        vocabulary: vocabulary ? JSON.parse(vocabulary) : null,
        memory: memory ? JSON.parse(memory) : null,
      }
    } catch (error) {
      console.error("Failed to export all data from localStorage:", error)
      return null
    }
  }
}
