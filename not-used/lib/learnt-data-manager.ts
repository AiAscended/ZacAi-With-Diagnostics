"use client"

export class LearntDataManager {
  private static instance: LearntDataManager

  public static getInstance(): LearntDataManager {
    if (!LearntDataManager.instance) {
      LearntDataManager.instance = new LearntDataManager()
    }
    return LearntDataManager.instance
  }

  // Save learned vocabulary to learnt_vocab.json structure
  public async saveLearnedVocabulary(vocabularyData: any[]): Promise<void> {
    try {
      // For now, save to localStorage with proper structure
      // In production, this would save to actual learnt_vocab.json file
      const structuredData = {
        metadata: {
          version: "2.0.0",
          lastUpdated: new Date().toISOString(),
          totalEntries: vocabularyData.length,
          source: "learned_api",
        },
        vocabulary: vocabularyData.reduce((acc, entry) => {
          acc[entry.word] = {
            definition: entry.definition,
            part_of_speech: entry.partOfSpeech,
            phonetic: entry.phonetic,
            examples: entry.examples,
            frequency: entry.frequency,
            learned_date: new Date(entry.learned).toISOString(),
            confidence: entry.confidence,
            source: entry.source,
          }
          return acc
        }, {}),
      }

      localStorage.setItem("learnt_vocab", JSON.stringify(structuredData))
      console.log(`💾 Saved ${vocabularyData.length} learned vocabulary entries to learnt_vocab structure`)
    } catch (error) {
      console.error("Failed to save learned vocabulary:", error)
    }
  }

  // Save learned mathematics to learnt_maths.json structure
  public async saveLearnedMathematics(mathData: any[]): Promise<void> {
    try {
      const structuredData = {
        metadata: {
          version: "2.0.0",
          lastUpdated: new Date().toISOString(),
          totalEntries: mathData.length,
          source: "learned_calculations",
        },
        mathematics: {
          calculations: mathData
            .filter((m) => m.type === "calculation")
            .reduce((acc, entry) => {
              acc[entry.concept] = {
                calculation: entry.data.calculation,
                result: entry.data.result,
                method: entry.data.seedUsed ? "seed_data" : "computed",
                learned_date: new Date(entry.learned).toISOString(),
                confidence: entry.confidence,
              }
              return acc
            }, {}),
          concepts: mathData
            .filter((m) => m.type !== "calculation")
            .reduce((acc, entry) => {
              acc[entry.concept] = {
                type: entry.type,
                data: entry.data,
                learned_date: new Date(entry.learned).toISOString(),
                confidence: entry.confidence,
                source: entry.source,
              }
              return acc
            }, {}),
        },
      }

      localStorage.setItem("learnt_maths", JSON.stringify(structuredData))
      console.log(`💾 Saved ${mathData.length} learned mathematics entries to learnt_maths structure`)
    } catch (error) {
      console.error("Failed to save learned mathematics:", error)
    }
  }

  // Save learned science/knowledge to learnt_science.json structure
  public async saveLearnedScience(scienceData: any[]): Promise<void> {
    try {
      const structuredData = {
        metadata: {
          version: "2.0.0",
          lastUpdated: new Date().toISOString(),
          totalEntries: scienceData.length,
          source: "learned_research",
        },
        science: scienceData.reduce((acc, entry) => {
          acc[entry.key] = {
            topic: entry.key,
            explanation: entry.value,
            category: entry.category,
            learned_date: new Date(entry.timestamp).toISOString(),
            confidence: entry.confidence,
            source: entry.source,
          }
          return acc
        }, {}),
      }

      localStorage.setItem("learnt_science", JSON.stringify(structuredData))
      console.log(`💾 Saved ${scienceData.length} learned science entries to learnt_science structure`)
    } catch (error) {
      console.error("Failed to save learned science:", error)
    }
  }

  // Load learned data from structured format
  public loadLearnedVocabulary(): any[] {
    try {
      const stored = localStorage.getItem("learnt_vocab")
      if (stored) {
        const data = JSON.parse(stored)
        if (data.vocabulary) {
          return Object.entries(data.vocabulary).map(([word, info]: [string, any]) => ({
            word,
            definition: info.definition,
            partOfSpeech: info.part_of_speech,
            phonetic: info.phonetic || "",
            examples: info.examples || [],
            frequency: info.frequency || 1,
            source: "learned_api",
            learned: new Date(info.learned_date).getTime(),
            confidence: info.confidence,
          }))
        }
      }
    } catch (error) {
      console.warn("Failed to load learned vocabulary:", error)
    }
    return []
  }

  public loadLearnedMathematics(): any[] {
    try {
      const stored = localStorage.getItem("learnt_maths")
      if (stored) {
        const data = JSON.parse(stored)
        const results: any[] = []

        // Load calculations
        if (data.mathematics?.calculations) {
          Object.entries(data.mathematics.calculations).forEach(([concept, info]: [string, any]) => {
            results.push({
              concept,
              type: "calculation",
              data: {
                calculation: info.calculation,
                result: info.result,
                seedUsed: info.method === "seed_data",
              },
              source: info.method === "seed_data" ? "seed" : "calculated",
              learned: new Date(info.learned_date).getTime(),
              confidence: info.confidence,
            })
          })
        }

        // Load concepts
        if (data.mathematics?.concepts) {
          Object.entries(data.mathematics.concepts).forEach(([concept, info]: [string, any]) => {
            results.push({
              concept,
              type: info.type,
              data: info.data,
              source: info.source,
              learned: new Date(info.learned_date).getTime(),
              confidence: info.confidence,
            })
          })
        }

        return results
      }
    } catch (error) {
      console.warn("Failed to load learned mathematics:", error)
    }
    return []
  }

  public loadLearnedScience(): any[] {
    try {
      const stored = localStorage.getItem("learnt_science")
      if (stored) {
        const data = JSON.parse(stored)
        if (data.science) {
          return Object.entries(data.science).map(([key, info]: [string, any]) => ({
            key,
            value: info.explanation,
            category: info.category,
            source: info.source,
            confidence: info.confidence,
            timestamp: new Date(info.learned_date).getTime(),
          }))
        }
      }
    } catch (error) {
      console.warn("Failed to load learned science:", error)
    }
    return []
  }
}
