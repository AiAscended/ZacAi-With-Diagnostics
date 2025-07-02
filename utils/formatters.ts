export function formatDate(date: Date | number | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatTime(date: Date | number | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateTime(date: Date | number | string): string {
  const d = new Date(date)
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatRelativeTime(date: Date | number | string): string {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now.getTime() - target.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function formatNumber(num: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat("en-US", options).format(num)
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

export function formatScore(score: number, maxScore: number): string {
  return `${score}/${maxScore} (${Math.round((score / maxScore) * 100)}%)`
}

export function formatList(items: string[], conjunction = "and"): string {
  if (items.length === 0) return ""
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`
  return `${items.slice(0, -1).join(", ")}, ${conjunction} ${items[items.length - 1]}`
}

export function formatPlural(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : plural || `${singular}s`
  return `${count} ${word}`
}

export function formatTruncate(text: string, maxLength: number, suffix = "..."): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

export function formatCamelCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, "")
}

export function formatKebabCase(text: string): string {
  return text
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function formatTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

export function formatSentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, "")
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`
  }
  return ssn
}

export function formatCreditCard(card: string): string {
  const cleaned = card.replace(/\D/g, "")
  return cleaned.replace(/(.{4})/g, "$1 ").trim()
}

export function formatAddress(address: {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}): string {
  const parts = []
  if (address.street) parts.push(address.street)
  if (address.city) parts.push(address.city)
  if (address.state) parts.push(address.state)
  if (address.zip) parts.push(address.zip)
  if (address.country) parts.push(address.country)
  return parts.join(", ")
}
