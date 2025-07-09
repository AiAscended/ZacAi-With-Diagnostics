export interface SystemConfig {
  name: string
  version: string
  debug: boolean
  performance: {
    enableMetrics: boolean
    logLevel: "error" | "warn" | "info" | "debug"
  }
  engines: {
    thinking: {
      maxIterations: number
      confidenceThreshold: number
    }
    math: {
      enableVortexMath: boolean
      enableTeslaMath: boolean
      precision: number
    }
    knowledge: {
      enableOnlineLookup: boolean
      cacheTimeout: number
    }
    language: {
      vocabularySize: number
      enableLearning: boolean
    }
    memory: {
      maxEntries: number
      compressionEnabled: boolean
    }
  }
  storage: {
    provider: "localStorage" | "indexedDB"
    encryptionEnabled: boolean
  }
}

export const defaultConfig: SystemConfig = {
  name: "ZacAI",
  version: "2.0.0",
  debug: false,
  performance: {
    enableMetrics: true,
    logLevel: "info",
  },
  engines: {
    thinking: {
      maxIterations: 5,
      confidenceThreshold: 0.8,
    },
    math: {
      enableVortexMath: true,
      enableTeslaMath: true,
      precision: 10,
    },
    knowledge: {
      enableOnlineLookup: true,
      cacheTimeout: 3600000, // 1 hour
    },
    language: {
      vocabularySize: 10000,
      enableLearning: true,
    },
    memory: {
      maxEntries: 1000,
      compressionEnabled: true,
    },
  },
  storage: {
    provider: "indexedDB",
    encryptionEnabled: false,
  },
}
