// lib/storage-manager.ts

/**
 * Manages loading and saving data from localStorage and public JSON files.
 * This centralizes data access logic for the AI's knowledge modules.
 */
export class StorageManager {
  /**
   * Loads data from the browser's localStorage.
   * @param key The key to retrieve from localStorage.
   * @returns The parsed JSON data, or null if not found or invalid.
   */
  public loadData<T>(key: string): T | null {
    try {
      if (typeof window === "undefined") return null
      const data = window.localStorage.getItem(key)
      return data ? (JSON.parse(data) as T) : null
    } catch (error) {
      console.error(`[StorageManager] Error loading data for key "${key}":`, error)
      return null
    }
  }

  /**
   * Saves data to the browser's localStorage.
   * @param key The key to save the data under.
   * @param data The data to be saved (will be stringified).
   */
  public saveData(key: string, data: any): void {
    try {
      if (typeof window === "undefined") return
      window.localStorage.setItem(key, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error(`[StorageManager] Error saving data for key "${key}":`, error)
    }
  }

  /**
   * Loads a JSON file from the public directory.
   * @param path The path to the JSON file within the /public directory (e.g., "/seed_vocab.json").
   * @returns The parsed JSON data, or null if fetching fails.
   */
  public async loadJSON<T>(path: string): Promise<T | null> {
    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.statusText}`)
      }
      return (await response.json()) as T
    } catch (error) {
      console.error(`[StorageManager] Error loading JSON from "${path}":`, error)
      return null
    }
  }
}
