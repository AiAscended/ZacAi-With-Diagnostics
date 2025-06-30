"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type PerformanceMetrics = {
  cpuUsage: number
  memoryUsage: number
  responseTime: number
  tokenThroughput: number
}

export function PerformanceMonitorTab() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    responseTime: 0,
    tokenThroughput: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      // Mocking real-time data updates
      setMetrics({
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        responseTime: Math.floor(Math.random() * 500) + 50, // ms
        tokenThroughput: Math.floor(Math.random() * 200) + 50, // tokens/sec
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>CPU Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={metrics.cpuUsage} />
          <p className="text-right text-sm mt-1">{metrics.cpuUsage.toFixed(2)}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={metrics.memoryUsage} />
          <p className="text-right text-sm mt-1">{metrics.memoryUsage.toFixed(2)}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Response Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{metrics.responseTime} ms</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Token Throughput</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{metrics.tokenThroughput} t/s</p>
        </CardContent>
      </Card>
    </div>
  )
}
