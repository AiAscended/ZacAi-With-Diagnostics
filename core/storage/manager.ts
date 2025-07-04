class StorageManager {
  async loadSeedData(category: string): Promise<any[]> {
    try {
      console.log(`📦 Loading seed data for: ${category}`)
      const response = await fetch(`/seed/${category}.json`)

      if (!response.ok) {
        console.warn(`Seed data not found for ${category}`)
        return []
      }

      const data = await response.json()
      console.log(`📦 Loaded ${data.length || 0} seed items for ${category}`)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error(`Failed to load seed data for ${category}:`, error)
      return []
    }
  }
}
