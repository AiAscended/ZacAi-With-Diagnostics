// Global knowledge data store
let knowledgeData: any = {
  vocabulary: [],
  mathematics: [],
  userInfo: [],
  facts: [],
}

export function setKnowledgeData(data: any): void {
  knowledgeData = { ...knowledgeData, ...data }
}

export function getKnowledgeData(): any {
  return knowledgeData
}

export function addKnowledgeEntry(category: string, entry: any): void {
  if (!knowledgeData[category]) {
    knowledgeData[category] = []
  }
  knowledgeData[category].push(entry)
}
