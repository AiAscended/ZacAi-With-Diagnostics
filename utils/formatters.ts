export function formatNumber(num: number, decimals = 2): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0%"
  return `${((value / total) * 100).toFixed(1)}%`
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  return "Just now"
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatConfidence(confidence: number): string {
  const percentage = Math.round(confidence * 100)
  if (percentage >= 90) return `${percentage}% (Very High)`
  if (percentage >= 70) return `${percentage}% (High)`
  if (percentage >= 50) return `${percentage}% (Medium)`
  if (percentage >= 30) return `${percentage}% (Low)`
  return `${percentage}% (Very Low)`
}

export function formatModuleStats(stats: any): string {
  return `Queries: ${stats.totalQueries || 0}, Success: ${formatPercentage(stats.successRate || 0, 1)}, Avg Time: ${stats.averageResponseTime || 0}ms`
}

export function formatLearningProgress(progress: number): string {
  const bars = 20
  const filled = Math.round((progress / 100) * bars)
  const empty = bars - filled
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${progress.toFixed(1)}%`
}

export function formatSystemUptime(uptime: number): string {
  return formatDuration(uptime)
}

export function formatMemoryUsage(bytes: number): string {
  return formatBytes(bytes)
}

export function formatApiResponse(response: any): string {
  if (typeof response === "string") return response
  if (typeof response === "object") {
    return JSON.stringify(response, null, 2)
  }
  return String(response)
}

export function formatErrorMessage(error: any): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "Unknown error occurred"
}

export function formatModuleName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function formatSourceList(sources: string[]): string {
  if (sources.length === 0) return "No sources"
  if (sources.length === 1) return sources[0]
  if (sources.length === 2) return `${sources[0]} and ${sources[1]}`
  return `${sources.slice(0, -1).join(", ")}, and ${sources[sources.length - 1]}`
}

export function formatReasoningSteps(steps: string[]): string {
  return steps.map((step, index) => `${index + 1}. ${step}`).join("\n")
}

export function formatMathResult(result: number): string {
  if (Number.isInteger(result)) return result.toString()
  if (Math.abs(result) < 0.001) return result.toExponential(3)
  return result.toFixed(6).replace(/\.?0+$/, "")
}

export function formatCodeSnippet(code: string, language: string): string {
  return `\`\`\`${language}\n${code}\n\`\`\``
}

export function formatDefinition(word: string, definition: string, partOfSpeech?: string): string {
  const pos = partOfSpeech ? ` (${partOfSpeech})` : ""
  return `**${word}**${pos}: ${definition}`
}

export function formatFactSummary(fact: any): string {
  return `**${fact.title}**\n${fact.content}\n*Source: ${fact.source}*`
}

export function formatPhilosophyConcept(concept: any): string {
  let formatted = `**${concept.name}**\n${concept.description}`
  if (concept.philosopher) formatted += `\n*Philosopher: ${concept.philosopher}*`
  if (concept.school) formatted += `\n*School: ${concept.school}*`
  return formatted
}

export function formatUserProfile(profile: any): string {
  let formatted = `**User Profile**\n`
  if (profile.name) formatted += `Name: ${profile.name}\n`
  if (profile.interests?.length > 0) formatted += `Interests: ${profile.interests.join(", ")}\n`
  if (profile.preferences) {
    formatted += `Preferences: ${Object.entries(profile.preferences)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ")}\n`
  }
  return formatted
}

export function formatSearchResults(results: any[]): string {
  if (results.length === 0) return "No results found"

  return results
    .map(
      (result, index) =>
        `${index + 1}. **${result.title}** (${formatConfidence(result.relevance)})\n   ${result.content.substring(0, 100)}...`,
    )
    .join("\n\n")
}

export function formatSystemStatus(status: any): string {
  return `System Status: ${status.initialized ? "Online" : "Offline"}
Uptime: ${formatSystemUptime(status.uptime)}
Modules: ${status.modules ? Object.keys(status.modules).length : 0} active
Total Queries: ${status.totalQueries || 0}
Avg Response Time: ${status.averageResponseTime || 0}ms`
}
