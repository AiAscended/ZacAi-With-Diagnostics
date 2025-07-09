export const SystemConfig = {
  // System Information
  NAME: "ZacAI",
  VERSION: "2.0.0",
  BUILD_DATE: "2025-01-07",

  // File paths
  SEED_FILES: {
    VOCABULARY: "/seed_vocab.json",
    MATHEMATICS: "/seed_maths.json",
    SCIENCE: "/seed_science.json",
    SYSTEM: "/seed_system.json",
    LEARNING: "/seed_learning.json",
    TOOLS: "/seed_tools.json",
    KNOWLEDGE: "/seed_knowledge.json",
  },

  // Core Settings
  DEBUG_MODE: process.env.NODE_ENV === "development",
  PERFORMANCE_MONITORING: true,
  ERROR_REPORTING: true,

  // Storage Configuration
  STORAGE: {
    USE_INDEXED_DB: true,
    USE_LOCAL_STORAGE: true,
    MAX_STORAGE_SIZE: 100 * 1024 * 1024, // 100MB
    COMPRESSION_ENABLED: false,
    ENCRYPTION_ENABLED: false,
    AUTO_BACKUP: true,
    BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Learning Configuration
  LEARNING: {
    AUTO_LEARN: true,
    CONFIDENCE_THRESHOLD: 0.7,
    MAX_LEARNING_QUEUE: 1000,
    CONSOLIDATION_INTERVAL: 60 * 60 * 1000, // 1 hour
    PATTERN_RECOGNITION: true,
    ONLINE_LEARNING: true,
  },

  // Learning settings
  LEARNING_SETTINGS: {
    VOCABULARY_LEARNING_ENABLED: true,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    MAX_MEMORY_ENTRIES: 10000,
    CONFIDENCE_THRESHOLD: 0.7,
  },

  // Context Management
  CONTEXT: {
    MAX_CONVERSATION_HISTORY: 50,
    CONTEXT_WINDOW_SIZE: 10,
    TEMPORAL_CONTEXT: true,
    PATTERN_TRACKING: true,
    AUTO_SUMMARIZATION: true,
  },

  // API Configuration
  APIS: {
    DICTIONARY: "https://api.dictionaryapi.dev/api/v2/entries/en/",
    THESAURUS: "https://api.datamuse.com/words?rel_syn=",
    WIKIPEDIA: "https://en.wikipedia.org/api/rest_v1/page/summary/",
    MATH: "https://api.mathjs.org/v4/",
    RATE_LIMIT: 10, // requests per minute
    TIMEOUT: 5000, // 5 seconds
    RETRY_ATTEMPTS: 3,
  },

  // Performance Settings
  PERFORMANCE: {
    MAX_RESPONSE_TIME: 2000, // 2 seconds
    CACHE_SIZE: 1000,
    CACHE_TTL: 60 * 60 * 1000, // 1 hour
    BATCH_SIZE: 100,
    THROTTLE_DELAY: 100, // milliseconds
  },

  // AI Engine Settings
  AI_ENGINES: {
    THINKING: {
      ENABLED: true,
      MAX_STEPS: 10,
      TIMEOUT: 5000,
    },
    MATH: {
      ENABLED: true,
      PRECISION: 10,
      MAX_CALCULATION_TIME: 1000,
    },
    KNOWLEDGE: {
      ENABLED: true,
      MAX_SEARCH_RESULTS: 10,
      RELEVANCE_THRESHOLD: 0.5,
    },
    LANGUAGE: {
      ENABLED: true,
      MAX_VOCABULARY_SIZE: 10000,
      LEARNING_RATE: 0.1,
    },
    MEMORY: {
      ENABLED: true,
      MAX_MEMORIES: 1000,
      IMPORTANCE_THRESHOLD: 0.3,
    },
    DIAGNOSTIC: {
      ENABLED: true,
      HEALTH_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
      PERFORMANCE_MONITORING: true,
    },
  },

  // UI Configuration
  UI: {
    THEME: "light",
    ANIMATIONS: true,
    THINKING_DISPLAY: true,
    CONFIDENCE_DISPLAY: true,
    KNOWLEDGE_SOURCES: true,
    SUGGESTIONS: true,
    AUTO_SCROLL: true,
  },

  // Security Settings
  SECURITY: {
    DATA_ENCRYPTION: false,
    SECURE_STORAGE: true,
    PRIVACY_MODE: true,
    LOCAL_ONLY: true,
    NO_EXTERNAL_TRACKING: true,
  },

  // Cleanup and Maintenance
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  OPTIMIZATION_INTERVAL: 60 * 60 * 1000, // 1 hour
  MAX_LOG_SIZE: 1000,
  LOG_RETENTION_DAYS: 7,

  // Feature Flags
  FEATURES: {
    TESLA_MATH: true,
    VORTEX_PATTERNS: true,
    CHINESE_MULTIPLICATION: true,
    ABACUS_CALCULATION: true,
    PATTERN_RECOGNITION: true,
    ONLINE_RESEARCH: true,
    SELF_HEALING: true,
    AUTO_OPTIMIZATION: true,
  },

  // Seed Data Configuration
  SEED_DATA: {
    VOCABULARY_SIZE: 432,
    MATH_CONCEPTS: 100,
    SYSTEM_KNOWLEDGE: 50,
    LEARNING_PATTERNS: 25,
    AUTO_LOAD: true,
    VALIDATE_ON_LOAD: true,
  },

  // Error Handling
  ERROR_HANDLING: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    FALLBACK_ENABLED: true,
    ERROR_LOGGING: true,
    CRASH_RECOVERY: true,
  },

  // Development Settings
  DEVELOPMENT: {
    VERBOSE_LOGGING: process.env.NODE_ENV === "development",
    PERFORMANCE_PROFILING: false,
    MOCK_APIS: false,
    TEST_MODE: false,
  },
}

export type SystemConfigType = typeof SystemConfig

// Configuration validation
export function validateConfig(): boolean {
  try {
    // Validate required fields
    if (!SystemConfig.NAME || !SystemConfig.VERSION) {
      console.error("Missing required system configuration")
      return false
    }

    // Validate storage settings
    if (SystemConfig.STORAGE.MAX_STORAGE_SIZE <= 0) {
      console.error("Invalid storage size configuration")
      return false
    }

    // Validate API settings
    if (SystemConfig.APIS.RATE_LIMIT <= 0 || SystemConfig.APIS.TIMEOUT <= 0) {
      console.error("Invalid API configuration")
      return false
    }

    console.log("✅ System configuration validated successfully")
    return true
  } catch (error) {
    console.error("Configuration validation failed:", error)
    return false
  }
}

// Get configuration for specific module
export function getModuleConfig(module: keyof typeof SystemConfig): any {
  return SystemConfig[module]
}

// Update configuration at runtime
export function updateConfig(path: string, value: any): void {
  const keys = path.split(".")
  let current: any = SystemConfig

  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {}
    }
    current = current[keys[i]]
  }

  current[keys[keys.length - 1]] = value
  console.log(`Configuration updated: ${path} = ${value}`)
}

// Export default configuration
export default SystemConfig
