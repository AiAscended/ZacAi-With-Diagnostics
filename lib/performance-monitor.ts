export class PerformanceMonitor {
  private operations: Array<{ operation: string; duration: number; timestamp: number }> = []
  private maxOperations = 1000

  public logOperation(operation: string, duration: number): void {
    this.operations.push({
      operation,
      duration,
      timestamp: Date.now(),
    })

    // Keep only recent operations
    if (this.operations.length > this.maxOperations) {
      this.operations = this.operations.slice(-this.maxOperations)
    }
  }

  public getStats(): any {
    if (this.operations.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null,
        recentOperations: [],
      }
    }

    const durations = this.operations.map((op) => op.duration)
    const averageDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length

    const slowestOperation = this.operations.reduce((slowest, current) =>
      current.duration > slowest.duration ? current : slowest,
    )

    const fastestOperation = this.operations.reduce((fastest, current) =>
      current.duration < fastest.duration ? current : fastest,
    )

    return {
      totalOperations: this.operations.length,
      averageDuration: Math.round(averageDuration),
      slowestOperation: {
        operation: slowestOperation.operation,
        duration: Math.round(slowestOperation.duration),
      },
      fastestOperation: {
        operation: fastestOperation.operation,
        duration: Math.round(fastestOperation.duration),
      },
      recentOperations: this.operations.slice(-10).map((op) => ({
        operation: op.operation,
        duration: Math.round(op.duration),
        timestamp: new Date(op.timestamp).toLocaleTimeString(),
      })),
    }
  }

  public clearStats(): void {
    this.operations = []
  }

  public getOperationsByType(operationType: string): any[] {
    return this.operations.filter((op) => op.operation === operationType)
  }

  public getAverageDurationForOperation(operationType: string): number {
    const operations = this.getOperationsByType(operationType)
    if (operations.length === 0) return 0

    const totalDuration = operations.reduce((sum, op) => sum + op.duration, 0)
    return totalDuration / operations.length
  }
}
