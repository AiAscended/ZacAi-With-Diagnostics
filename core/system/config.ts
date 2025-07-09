export interface SystemConfig {
  version: string
  engines: {
    thinking: boolean
    math: boolean
    knowledge: boolean
    language: boolean
    memory: boolean
    diagnostic: boolean
  }
  settings: {
    maxMemoryItems: number
    maxHistoryItems: number
    confidenceThreshold: number
  }
}

export const defaultConfig: SystemConfig = {
  version: "2.0.0",
  engines: {
    thinking: true,
    math: true,
    knowledge: true,
    language: true,
    memory: true,
    diagnostic: true,
  },
  settings: {
    maxMemoryItems: 100,
    maxHistoryItems: 50,
    confidenceThreshold: 0.6,
  },
}
