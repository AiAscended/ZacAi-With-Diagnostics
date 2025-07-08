export const SystemConfig = {
  VERSION: "2.0.0",
  NAME: "ZacAI",
  CREATORS: "AiAscended",

  // System Settings
  MAX_CONVERSATION_HISTORY: 100,
  MAX_MEMORY_ENTRIES: 1000,
  MAX_VOCABULARY_SIZE: 10000,

  // Performance Settings
  RESPONSE_TIMEOUT: 30000, // 30 seconds
  THINKING_STEPS_LIMIT: 10,
  CONFIDENCE_THRESHOLD: 0.3,

  // Storage Settings
  STORAGE_VERSION: 1,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  CLEANUP_INTERVAL: 300000, // 5 minutes

  // Learning Settings
  LEARNING_SETTINGS: {
    VOCABULARY_LEARNING_ENABLED: true,
    MATH_LEARNING_ENABLED: true,
    MEMORY_LEARNING_ENABLED: true,
    ONLINE_LEARNING_ENABLED: true,
  },

  // API Endpoints
  APIS: {
    DICTIONARY: "https://api.dictionaryapi.dev/api/v2/entries/en/",
    THESAURUS: "https://api.datamuse.com/words?rel_syn=",
    WIKIPEDIA: "https://en.wikipedia.org/api/rest_v1/page/summary/",
    MATH: "https://api.mathjs.org/v4/",
  },

  // Debug Settings
  DEBUG_MODE: false,
  VERBOSE_LOGGING: true,
  PERFORMANCE_MONITORING: true,

  // UI Settings
  SHOW_THINKING_PROCESS: true,
  SHOW_CONFIDENCE_SCORES: true,
  SHOW_KNOWLEDGE_SOURCES: true,
  ANIMATE_RESPONSES: true,

  // Seed Data Files
  SEED_FILES: {
    VOCABULARY: "/seed_vocab.json",
    MATHEMATICS: "/seed_maths.json",
    SYSTEM: "/seed_system.json",
    LEARNING: "/seed_learning.json",
    KNOWLEDGE: "/seed_knowledge.json",
  },

  // Engine Settings
  ENGINES: {
    THINKING: {
      MAX_ITERATIONS: 5,
      CONFIDENCE_BOOST: 0.1,
    },
    MATH: {
      PRECISION: 10,
      ENABLE_VORTEX_MATH: true,
      ENABLE_TESLA_PATTERNS: true,
    },
    KNOWLEDGE: {
      CACHE_SIZE: 1000,
      ONLINE_LOOKUP_TIMEOUT: 5000,
    },
    LANGUAGE: {
      TOKENIZER_MAX_LENGTH: 512,
      VOCABULARY_EXPANSION_RATE: 0.1,
    },
    MEMORY: {
      IMPORTANCE_THRESHOLD: 0.5,
      DECAY_RATE: 0.01,
    },
  },
}

export type SystemConfigType = typeof SystemConfig
