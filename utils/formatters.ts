export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`
  }
  if (ms < 3600000) {
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  }
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) {
    return "Just now"
  }
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  }
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days} day${days > 1 ? "s" : ""} ago`
  }

  return new Date(timestamp).toLocaleDateString()
}

export function formatConfidence(confidence: number): string {
  if (confidence >= 0.9) return "Very High"
  if (confidence >= 0.7) return "High"
  if (confidence >= 0.5) return "Medium"
  if (confidence >= 0.3) return "Low"
  return "Very Low"
}

export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
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

export function formatDate(date: Date | number, format = "short"): string {
  const d = typeof date === "number" ? new Date(date) : date

  switch (format) {
    case "short":
      return d.toLocaleDateString()
    case "long":
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    case "time":
      return d.toLocaleTimeString()
    case "datetime":
      return d.toLocaleString()
    case "iso":
      return d.toISOString()
    default:
      return d.toLocaleDateString()
  }
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
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
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase()
}

export function formatSnakeCase(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1_$2").toLowerCase()
}

export function formatTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

export function formatPlural(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`
  return `${count} ${plural || singular + "s"}`
}

export function formatOrdinal(num: number): string {
  const suffixes = ["th", "st", "nd", "rd"]
  const v = num % 100
  return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

export function formatScore(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100
  return `${score}/${maxScore} (${percentage.toFixed(1)}%)`
}

export function formatGrade(percentage: number): string {
  if (percentage >= 97) return "A+"
  if (percentage >= 93) return "A"
  if (percentage >= 90) return "A-"
  if (percentage >= 87) return "B+"
  if (percentage >= 83) return "B"
  if (percentage >= 80) return "B-"
  if (percentage >= 77) return "C+"
  if (percentage >= 73) return "C"
  if (percentage >= 70) return "C-"
  if (percentage >= 67) return "D+"
  if (percentage >= 65) return "D"
  return "F"
}

export function formatTemperature(temp: number, unit: "C" | "F" = "C"): string {
  if (unit === "F") {
    return `${temp}°F`
  }
  return `${temp}°C`
}

export function formatDistance(meters: number, unit: "metric" | "imperial" = "metric"): string {
  if (unit === "imperial") {
    const feet = meters * 3.28084
    if (feet < 5280) {
      return `${Math.round(feet)} ft`
    }
    const miles = feet / 5280
    return `${miles.toFixed(1)} mi`
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  const km = meters / 1000
  return `${km.toFixed(1)} km`
}

export function formatWeight(grams: number, unit: "metric" | "imperial" = "metric"): string {
  if (unit === "imperial") {
    const ounces = grams * 0.035274
    if (ounces < 16) {
      return `${ounces.toFixed(1)} oz`
    }
    const pounds = ounces / 16
    return `${pounds.toFixed(1)} lbs`
  }

  if (grams < 1000) {
    return `${Math.round(grams)} g`
  }
  const kg = grams / 1000
  return `${kg.toFixed(1)} kg`
}
