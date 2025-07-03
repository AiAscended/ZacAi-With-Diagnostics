export const MODULE_CONFIG = {
  vocabulary: {
    seedFile: "vocabulary",
    learntFile: "vocabulary",
    enabled: true,
  },
  mathematics: {
    seedFile: "mathematics",
    learntFile: "mathematics",
    enabled: true,
  },
  facts: {
    seedFile: "facts",
    learntFile: "facts",
    enabled: true,
  },
  coding: {
    seedFile: "coding",
    learntFile: "coding",
    enabled: true,
  },
  philosophy: {
    seedFile: "philosophy",
    learntFile: "philosophy",
    enabled: true,
  },
}

export const SYSTEM_CONFIG = {
  maxChatLogEntries: 1000,
  moduleTimeout: 10000,
  healthCheckInterval: 30000,
  autoSaveInterval: 60000,
}

export const API_CONFIG = {
  dictionaryAPI: "https://api.dictionaryapi.dev/api/v2/entries/en/",
  wikipediaAPI: "https://en.wikipedia.org/api/rest_v1/page/summary/",
  timeout: 10000,
}
