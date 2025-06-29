// Global knowledge data store
let globalKnowledgeData: any = {
  vocabulary: [],
  mathematics: [],
  userInfo: [],
  facts: [],
}

export function setKnowledgeData(data: any): void {
  globalKnowledgeData = { ...globalKnowledgeData, ...data }
}

export function getKnowledgeData(): any {
  return globalKnowledgeData
}

export function addVocabularyEntry(entry: any): void {
  if (!globalKnowledgeData.vocabulary) {
    globalKnowledgeData.vocabulary = []
  }
  globalKnowledgeData.vocabulary.push(entry)
}

export function addMathEntry(entry: any): void {
  if (!globalKnowledgeData.mathematics) {
    globalKnowledgeData.mathematics = []
  }
  globalKnowledgeData.mathematics.push(entry)
}

export function addFactEntry(entry: any): void {
  if (!globalKnowledgeData.facts) {
    globalKnowledgeData.facts = []
  }
  globalKnowledgeData.facts.push(entry)
}

export function addUserInfoEntry(entry: any): void {
  if (!globalKnowledgeData.userInfo) {
    globalKnowledgeData.userInfo = []
  }
  globalKnowledgeData.userInfo.push(entry)
}

export function searchKnowledge(query: string): any[] {
  const results: any[] = []

  // Search vocabulary
  if (globalKnowledgeData.vocabulary) {
    const vocabResults = globalKnowledgeData.vocabulary.filter(
      (item: any) =>
        item.word?.toLowerCase().includes(query.toLowerCase()) ||
        item.definition?.toLowerCase().includes(query.toLowerCase()),
    )
    results.push(...vocabResults.map((item: any) => ({ ...item, type: "vocabulary" })))
  }

  // Search mathematics
  if (globalKnowledgeData.mathematics) {
    const mathResults = globalKnowledgeData.mathematics.filter(
      (item: any) =>
        item.concept?.toLowerCase().includes(query.toLowerCase()) ||
        item.formula?.toLowerCase().includes(query.toLowerCase()),
    )
    results.push(...mathResults.map((item: any) => ({ ...item, type: "mathematics" })))
  }

  // Search facts
  if (globalKnowledgeData.facts) {
    const factResults = globalKnowledgeData.facts.filter(
      (item: any) =>
        item.topic?.toLowerCase().includes(query.toLowerCase()) ||
        item.content?.toLowerCase().includes(query.toLowerCase()),
    )
    results.push(...factResults.map((item: any) => ({ ...item, type: "facts" })))
  }

  return results.slice(0, 20) // Limit results
}

export function getKnowledgeStats(): any {
  return {
    vocabulary: globalKnowledgeData.vocabulary?.length || 0,
    mathematics: globalKnowledgeData.mathematics?.length || 0,
    facts: globalKnowledgeData.facts?.length || 0,
    userInfo: globalKnowledgeData.userInfo?.length || 0,
    total:
      (globalKnowledgeData.vocabulary?.length || 0) +
      (globalKnowledgeData.mathematics?.length || 0) +
      (globalKnowledgeData.facts?.length || 0) +
      (globalKnowledgeData.userInfo?.length || 0),
  }
}
