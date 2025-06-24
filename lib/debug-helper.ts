// Debug helper to catch and log errors
export class DebugHelper {
  static logError(context: string, error: any) {
    console.error(`❌ [${context}] Error:`, error)
    console.error(`❌ [${context}] Stack:`, error?.stack)
  }

  static logWarning(context: string, message: string, data?: any) {
    console.warn(`⚠️ [${context}] ${message}`, data || "")
  }

  static logInfo(context: string, message: string, data?: any) {
    console.log(`ℹ️ [${context}] ${message}`, data || "")
  }

  static async safeAsyncCall<T>(context: string, asyncFn: () => Promise<T>, fallback?: T): Promise<T | undefined> {
    try {
      return await asyncFn()
    } catch (error) {
      this.logError(context, error)
      return fallback
    }
  }

  static safeSyncCall<T>(context: string, syncFn: () => T, fallback?: T): T | undefined {
    try {
      return syncFn()
    } catch (error) {
      this.logError(context, error)
      return fallback
    }
  }
}
