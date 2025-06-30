export class TemporalKnowledgeSystem {
  private timeZone = "UTC"

  constructor() {
    this.detectUserTimeZone()
  }

  private detectUserTimeZone(): void {
    try {
      this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch (error) {
      console.warn("Could not detect timezone, using UTC:", error)
      this.timeZone = "UTC"
    }
  }

  public getCurrentDateTime() {
    const now = new Date()
    return {
      iso: now.toISOString(),
      formatted: {
        full: now.toLocaleString(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
      },
      timezone: this.timeZone,
    }
  }

  public getRelativeTime(timestamp: number): string {
    const now = Date.now()
    const seconds = Math.floor((now - timestamp) / 1000)
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  public isDateTimeQuery(message: string): boolean {
    const patterns = [
      /what.*(?:time|date|day|month|year)/i,
      /(?:current|today|now).*(?:time|date)/i,
      /what.*(?:day.*today|month.*this|year.*this)/i,
      /when.*(?:is|was|will)/i,
      /how.*(?:long|old|recent)/i,
    ]
    return patterns.some((pattern) => pattern.test(message))
  }

  public handleDateTimeQuery(message: string): string {
    const lowerMessage = message.toLowerCase()
    const currentDateTime = this.getCurrentDateTime()

    // What time is it?
    if (lowerMessage.includes("time")) {
      return (
        `🕐 **Current Time**: ${currentDateTime.formatted.time}\n\n` +
        `**Full Date & Time**: ${currentDateTime.formatted.full}`
      )
    }

    // What day is it?
    if (lowerMessage.includes("day")) {
      return `📅 **Today is**: ${currentDateTime.formatted.date}`
    }

    // What date is it?
    if (lowerMessage.includes("date")) {
      return (
        `📅 **Current Date**: ${currentDateTime.formatted.date}\n\n` +
        `**Short Format**: ${currentDateTime.formatted.date}`
      )
    }

    // What month/year is it?
    if (lowerMessage.includes("month")) {
      return `📅 **Current Month**: ${currentDateTime.formatted.date}`
    }

    if (lowerMessage.includes("year")) {
      return `📅 **Current Year**: ${currentDateTime.formatted.date}`
    }

    // Default comprehensive response
    return (
      `🕐 **Current Date & Time Information**\n\n` +
      `**Date**: ${currentDateTime.formatted.date}\n` +
      `**Time**: ${currentDateTime.formatted.time}\n` +
      `**Timezone**: ${currentDateTime.timezone}\n\n` +
      `**Quick Facts**:\n` +
      `• Year: ${currentDateTime.formatted.date}\n` +
      `• Month: ${currentDateTime.formatted.date}\n` +
      `• Day: ${currentDateTime.formatted.date}\n` +
      `• Day of Month: ${currentDateTime.formatted.date}`
    )
  }

  public calculateDateDifference(startDate: number, endDate: number = Date.now()): any {
    const diff = Math.abs(endDate - startDate)
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    return {
      milliseconds: diff,
      seconds,
      minutes,
      hours,
      days,
      formatted: this.getRelativeTime(startDate),
    }
  }

  public getTimeZoneInfo(): any {
    const now = new Date()
    return {
      timezone: this.timeZone,
      offset: now.getTimezoneOffset(),
      offsetHours: Math.floor(now.getTimezoneOffset() / 60),
      offsetMinutes: now.getTimezoneOffset() % 60,
      isDST: this.isDaylightSavingTime(now),
    }
  }

  private isDaylightSavingTime(date: Date): boolean {
    const january = new Date(date.getFullYear(), 0, 1).getTimezoneOffset()
    const july = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
    return Math.max(january, july) !== date.getTimezoneOffset()
  }
}
