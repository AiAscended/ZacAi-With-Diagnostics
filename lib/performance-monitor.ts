export interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: number
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 1000

  constructor() {
    console.log("📊 Performance Monitor initialized")
  }

  public logOperation(operation: string, duration: number): void {
    const metric: PerformanceMetrics = {
      operation,
      duration,
      timestamp: Date.now(),
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    console.log(`📊 ${operation}: ${duration.toFixed(2)}ms`)
  }

  public getStats(): any {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null,
        recentOperations: [],
      }
    }

    const durations = this.metrics.map((m) => m.duration)
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const slowestOperation = this.metrics.reduce((prev, current) => (prev.duration > current.duration ? prev : current))
    const fastestOperation = this.metrics.reduce((prev, current) => (prev.duration < current.duration ? prev : current))

    return {
      totalOperations: this.metrics.length,
      averageDuration: Math.round(averageDuration * 100) / 100,
      slowestOperation: {
        operation: slowestOperation.operation,
        duration: Math.round(slowestOperation.duration * 100) / 100,
      },
      fastestOperation: {
        operation: fastestOperation.operation,
        duration: Math.round(fastestOperation.duration * 100) / 100,
      },
      recentOperations: this.metrics.slice(-10).map((m) => ({
        operation: m.operation,
        duration: Math.round(m.duration * 100) / 100,
        timestamp: m.timestamp,
      })),
    }
  }

  public getOperationStats(operation: string): any {
    const operationMetrics = this.metrics.filter((m) => m.operation === operation)

    if (operationMetrics.length === 0) {
      return null
    }

    const durations = operationMetrics.map((m) => m.duration)
    const average = durations.reduce((a, b) => a + b, 0) / durations.length
    const min = Math.min(...durations)
    const max = Math.max(...durations)

    return {
      operation,
      count: operationMetrics.length,
      averageDuration: Math.round(average * 100) / 100,
      minDuration: Math.round(min * 100) / 100,
      maxDuration: Math.round(max * 100) / 100,
      lastExecution: operationMetrics[operationMetrics.length - 1].timestamp,
    }
  }

  public clearMetrics(): void {
    this.metrics = []
    console.log("📊 Performance metrics cleared")
  }

  public exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }
}
