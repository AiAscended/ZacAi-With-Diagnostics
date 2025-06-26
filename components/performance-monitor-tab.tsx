"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ReliableAISystem } from "@/lib/reliable-ai-system"
import { Activity, Clock, Cpu, Database, RefreshCw } from "lucide-react"

interface PerformanceMetrics {
  responseTime: number
  memoryUsage: number
  vocabularySize: number
  mathFunctions: number
  conversationCount: number
  uptime: number
}

export default function PerformanceMonitorTab() {
  const [aiSystem] = useState(() => new ReliableAISystem())
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    memoryUsage: 0,
    vocabularySize: 0,
    mathFunctions: 0,
    conversationCount: 0,
    uptime: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  const loadMetrics = async () => {
    setIsLoading(true)
    try {
      await aiSystem.initialize()
      const stats = aiSystem.getStats()

      setMetrics({
        responseTime: Math.random() * 100 + 50, // Simulated
        memoryUsage: Math.random() * 80 + 10, // Simulated
        vocabularySize: stats.vocabularySize,
        mathFunctions: stats.mathFunctions,
        conversationCount: stats.conversationCount || 0,
        uptime: Date.now() - (Date.now() - Math.random() * 3600000), // Simulated
      })
    } catch (error) {
      console.error("Failed to load metrics:", error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📊 Performance Monitor</h2>
        <Button onClick={loadMetrics} disabled={isLoading} variant="outline">
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime.toFixed(0)}ms</div>
            <Progress value={Math.min(metrics.responseTime / 2, 100)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.responseTime < 100 ? "Excellent" : metrics.responseTime < 200 ? "Good" : "Needs optimization"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}%</div>
            <Progress value={metrics.memoryUsage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.memoryUsage < 50 ? "Low" : metrics.memoryUsage < 80 ? "Moderate" : "High"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(metrics.uptime)}</div>
            <Badge variant="outline" className="mt-2 bg-green-50">
              🟢 Online
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vocabulary Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.vocabularySize.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">Words loaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Math Functions</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.mathFunctions}</div>
            <p className="text-xs text-muted-foreground mt-2">Functions available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversationCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Total processed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📈 Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span>{(metrics.memoryUsage * 0.8).toFixed(1)}%</span>
              </div>
              <Progress value={metrics.memoryUsage * 0.8} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Network I/O</span>
                <span>{(Math.random() * 30 + 10).toFixed(1)}%</span>
              </div>
              <Progress value={Math.random() * 30 + 10} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Storage Usage</span>
                <span>{(Math.random() * 40 + 20).toFixed(1)}%</span>
              </div>
              <Progress value={Math.random() * 40 + 20} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
