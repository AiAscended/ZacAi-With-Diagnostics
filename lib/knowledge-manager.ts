// This file manages loading and saving all knowledge sources for the AI.

/**
 * Loads seed data from a JSON file in the /public directory.
 * @param fileName The name of the JSON file (e.g., "seed_vocab.json").
 * @param dataKey The key within the JSON object that holds the data array/object.
 * @returns A Map of the loaded data.
 */
export const loadSeedData = async (fileName: string, dataKey: string): Promise<Map<string, any>> => {
  try {
    const response = await fetch(`/${fileName}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`)
    }
    const data = await response.json()
    const dataMap = new Map(Object.entries(data[dataKey] || data))
    console.log(`✅ Loaded ${dataMap.size} entries from ${fileName}`)
    return dataMap
  } catch (error) {
    console.warn(`Could not load seed data from ${fileName}:`, error)
    return new Map() // Return empty map on failure
  }
}

/**
 * Loads learned data. In a real app, this would be from a user-specific database.
 * Here, we simulate it by trying to fetch from a file, falling back to an empty map.
 * @param fileName The name of the JSON file (e.g., "learnt_vocab.json").
 * @returns A Map of the learned data.
 */
export const loadLearnedData = async (fileName: string): Promise<Map<string, any>> => {
  try {
    const response = await fetch(`/${fileName}`)
    if (!response.ok) {
      // It's normal for this file not to exist initially
      return new Map()
    }
    const data = await response.json()
    const dataMap = new Map(Object.entries(data))
    console.log(`✅ Loaded ${dataMap.size} learned entries from ${fileName}`)
    return dataMap
  } catch (error) {
    // This can happen if the file is empty or malformed, which is okay on first run.
    console.log(`No learned data found in ${fileName}, starting fresh.`)
    return new Map()
  }
}

/**
 * Saves learned data. In a real app, this would be an API call to a database.
 * Here, we simulate it by logging to the console. We don't actually write to the file system.
 * @param fileName The name of the file we are "saving" to.
 * @param data The Map of data to save.
 */
export const saveLearnedData = async (fileName: string, data: Map<string, any>): Promise<void> => {
  try {
    const dataToSave = Object.fromEntries(data)
    console.log(`📝 Simulating save to ${fileName}:`, dataToSave)
    // In a real application, this would be a POST request to a server endpoint:
    // await fetch('/api/save-knowledge', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ fileName, data: dataToSave }),
    // });
    console.log(`💾 Simulated save to ${fileName} successful.`)
  } catch (error) {
    console.error(`Failed to simulate save for ${fileName}:`, error)
  }
}

/**
 * Fetches a word definition from the free dictionary API.
 * @param word The word to look up.
 * @returns A structured object with the definition and part of speech, or null.
 */
export const fetchDictionaryAPI = async (word: string): Promise<any | null> => {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    if (data && data.length > 0) {
      const entry = data[0]
      const meaning = entry.meanings?.[0]
      const definition = meaning?.definitions?.[0]
      return {
        definition: definition?.definition || "No definition found.",
        partOfSpeech: meaning?.partOfSpeech || "unknown",
        examples: definition?.example ? [definition.example] : [],
      }
    }
    return null
  } catch (error) {
    console.error("Dictionary API fetch failed:", error)
    return null
  }
}
