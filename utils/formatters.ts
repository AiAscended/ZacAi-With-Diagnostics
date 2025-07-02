export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  if (seconds > 0) return `${seconds} second${seconds > 1 ? "s" : ""} ago`

  return "just now"
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatPercentage(value: number, total: number, decimals = 1): string {
  if (total === 0) return "0%"
  const percentage = (value / total) * 100
  return `${formatNumber(percentage, decimals)}%`
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"]
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${formatNumber(size, unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`
}

export function formatDate(date: Date | number | string, format: "short" | "medium" | "long" = "medium"): string {
  const d = new Date(date)

  const options: Intl.DateTimeFormatOptions = {
    short: { month: "short", day: "numeric", year: "numeric" },
    medium: { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" },
    long: { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" },
  }

  return new Intl.DateTimeFormat("en-US", options[format]).format(d)
}

export function formatTime(date: Date | number | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(d)
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  return phone
}

export function formatCamelCase(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

export function formatKebabCase(str: string): string {
  return str.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export function formatSnakeCase(str: string): string {
  return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export function formatPlural(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`
  return `${count} ${plural || singular + "s"}`
}

export function formatList(items: string[], conjunction: "and" | "or" = "and"): string {
  if (items.length === 0) return ""
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`

  const lastItem = items[items.length - 1]
  const otherItems = items.slice(0, -1)

  return `${otherItems.join(", ")}, ${conjunction} ${lastItem}`
}

export function formatInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 3)
}

export function formatTruncate(text: string, maxLength: number, suffix = "..."): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

export function formatWordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
}

export function formatReadingTime(text: string, wordsPerMinute = 200): string {
  const wordCount = formatWordCount(text)
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} min read`
}

export function formatSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatTitle(text: string): string {
  const articles = ["a", "an", "the"]
  const prepositions = ["at", "by", "for", "in", "of", "on", "to", "up", "and", "as", "but", "or", "nor"]

  return text
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index === 0 || (!articles.includes(word) && !prepositions.includes(word))) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      return word
    })
    .join(" ")
}

export function formatHighlight(text: string, query: string): string {
  if (!query) return text

  const regex = new RegExp(`(${query})`, "gi")
  return text.replace(regex, "<mark>$1</mark>")
}

export function formatMask(text: string, visibleChars = 4, maskChar = "*"): string {
  if (text.length <= visibleChars) return text

  const visible = text.slice(-visibleChars)
  const masked = maskChar.repeat(text.length - visibleChars)

  return masked + visible
}

export function formatVersion(version: string): string {
  const parts = version.split(".")
  return parts.map((part) => Number.parseInt(part, 10)).join(".")
}

export function formatScore(score: number, maxScore = 100): string {
  const percentage = (score / maxScore) * 100
  return `${Math.round(percentage)}%`
}

export function formatRating(rating: number, maxRating = 5): string {
  const stars = "★".repeat(Math.floor(rating)) + "☆".repeat(maxRating - Math.floor(rating))
  return `${stars} (${rating.toFixed(1)})`
}
