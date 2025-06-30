export class TemporalKnowledgeSystem {
  private timeZone = "UTC"
  private dateFormats: Map<string, Intl.DateTimeFormatOptions> = new Map()

  constructor() {
    this.initializeDateFormats()
    this.detectUserTimeZone()
  }

  private initializeDateFormats(): void {
    this.dateFormats.set("full", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })

    this.dateFormats.set("date", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    this.dateFormats.set("time", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })

    this.dateFormats.set("short", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  private detectUserTimeZone(): void {
    try {
      this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch (error) {
      console.warn("Could not detect timezone, using UTC:", error)
      this.timeZone = "UTC"
    }
  }

  public getCurrentDateTime(): any {
    const now = new Date()
    return {
      timestamp: now.getTime(),
      iso: now.toISOString(),
      timezone: this.timeZone,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      weekday: now.getDay(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      weekdayName: now.toLocaleDateString("en-US", { weekday: "long" }),
      monthName: now.toLocaleDateString("en-US", { month: "long" }),
      formatted: {
        full: this.formatDate(now, "full"),
        date: this.formatDate(now, "date"),
        time: this.formatDate(now, "time"),
        short: this.formatDate(now, "short"),
      },
    }
  }

  public formatDate(date: Date, format = "full"): string {
    const formatOptions = this.dateFormats.get(format) || this.dateFormats.get("full")!
    return new Intl.DateTimeFormat("en-US", formatOptions).format(date)
  }

  public getRelativeTime(timestamp: number): string {
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
    return "just now"
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
      return `📅 **Today is**: ${currentDateTime.weekdayName}\n\n` + `**Full Date**: ${currentDateTime.formatted.date}`
    }

    // What date is it?
    if (lowerMessage.includes("date")) {
      return (
        `📅 **Current Date**: ${currentDateTime.formatted.date}\n\n` +
        `**Short Format**: ${currentDateTime.formatted.short}`
      )
    }

    // What month/year is it?
    if (lowerMessage.includes("month")) {
      return `📅 **Current Month**: ${currentDateTime.monthName} ${currentDateTime.year}`
    }

    if (lowerMessage.includes("year")) {
      return `📅 **Current Year**: ${currentDateTime.year}`
    }

    // Default comprehensive response
    return (
      `🕐 **Current Date & Time Information**\n\n` +
      `**Date**: ${currentDateTime.formatted.date}\n` +
      `**Time**: ${currentDateTime.formatted.time}\n` +
      `**Timezone**: ${currentDateTime.timezone}\n\n` +
      `**Quick Facts**:\n` +
      `• Year: ${currentDateTime.year}\n` +
      `• Month: ${currentDateTime.monthName}\n` +
      `• Day: ${currentDateTime.weekdayName}\n` +
      `• Day of Month: ${currentDateTime.day}`
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
