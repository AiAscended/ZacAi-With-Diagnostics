// Formatting utility functions
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

export function formatPercentage(value: number): string {
  return (value * 100).toFixed(1) + "%"
}

export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return milliseconds.toFixed(0) + "ms"
  } else if (milliseconds < 60000) {
    return (milliseconds / 1000).toFixed(1) + "s"
  } else if (milliseconds < 3600000) {
    return (milliseconds / 60000).toFixed(1) + "m"
  } else {
    return (milliseconds / 3600000).toFixed(1) + "h"
  }
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) {
    return "Just now"
  } else if (diff < 3600000) {
    return Math.floor(diff / 60000) + "m ago"
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + "h ago"
  } else {
    return Math.floor(diff / 86400000) + "d ago"
  }
}

export function formatConfidence(confidence: number): string {
  if (confidence >= 0.9) return "Very High"
  if (confidence >= 0.7) return "High"
  if (confidence >= 0.5) return "Medium"
  if (confidence >= 0.3) return "Low"
  return "Very Low"
}

export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"]
  if (bytes === 0) return "0 Bytes"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatDate(timestamp: number, format: "short" | "long" | "time" = "short"): string {
  const date = new Date(timestamp)

  switch (format) {
    case "long":
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    case "time":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    default:
      return date.toLocaleDateString("en-US")
  }
}
