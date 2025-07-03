class StorageManager {
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log("🚀 Initializing Storage Manager...")
    this.initialized = true
    console.log("✅ Storage Manager initialized")
  }

  async loadSeedData(filename: string): Promise<any> {
    try {
      const response = await fetch(`/seed/${filename}.json`)
      if (!response.ok) {
        throw new Error(`Failed to load seed data: ${filename}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error loading seed data ${filename}:`, error)
      return this.getFallbackData(filename)
    }
  }

  async loadLearntData(filename: string): Promise<any> {
    try {
      const stored = localStorage.getItem(`zacai_learnt_${filename}`)
      if (stored) {
        return JSON.parse(stored)
      }
      return { entries: {} }
    } catch (error) {
      console.error(`Error loading learnt data ${filename}:`, error)
      return { entries: {} }
    }
  }

  async addLearntEntry(filename: string, entry: any): Promise<void> {
    try {
      const data = await this.loadLearntData(filename)
      data.entries[entry.id] = entry
      localStorage.setItem(`zacai_learnt_${filename}`, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving learnt entry to ${filename}:`, error)
    }
  }

  private getFallbackData(filename: string): any {
    switch (filename) {
      case "vocabulary":
        return {
          metadata: { version: "1.0.0", totalEntries: 3 },
          words: {
            algorithm: {
              definition:
                "A process or set of rules to be followed in calculations or other problem-solving operations",
              partOfSpeech: "noun",
              phonetics: "/ˈælɡəˌrɪðəm/",
              frequency: 4,
              examples: ["The sorting algorithm efficiently organized the data"],
              synonyms: ["procedure", "method", "process"],
              difficulty: 4,
            },
            quantum: {
              definition: "The minimum amount of any physical entity involved in an interaction",
              partOfSpeech: "noun",
              phonetics: "/ˈkwɒntəm/",
              frequency: 3,
              examples: ["Quantum mechanics describes behavior at atomic scales"],
              synonyms: ["unit", "amount", "portion"],
              difficulty: 5,
            },
            artificial: {
              definition: "Made or produced by human beings rather than occurring naturally",
              partOfSpeech: "adjective",
              phonetics: "/ˌɑːtɪˈfɪʃəl/",
              frequency: 4,
              examples: ["Artificial intelligence mimics human cognitive functions"],
              synonyms: ["synthetic", "man-made", "manufactured"],
              antonyms: ["natural", "organic", "genuine"],
              difficulty: 2,
            },
          },
        }
      case "mathematics":
        return {
          metadata: { version: "1.0.0", totalEntries: 2 },
          concepts: {
            basic_arithmetic: {
              name: "Basic Arithmetic",
              description: "Fundamental mathematical operations",
              operations: ["+", "-", "*", "/"],
              examples: ["2+2=4", "5*3=15", "10/2=5"],
            },
            order_of_operations: {
              name: "Order of Operations",
              description: "PEMDAS/BODMAS rule for mathematical expressions",
              rule: "Parentheses, Exponents, Multiplication/Division, Addition/Subtraction",
              examples: ["3+3*3=12", "(3+3)*3=18"],
            },
          },
        }
      default:
        return { metadata: { version: "1.0.0", totalEntries: 0 }, entries: {} }
    }
  }
}

export const storageManager = new StorageManager()
