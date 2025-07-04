"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Clock, Database, Activity } from "lucide-react"

interface StatsPanelProps {
  stats: any
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const getPerformanceColor = (value: number, threshold: { good: number; warning: number }) => {
    if (value >= threshold.good) return "text-green-600"
    if (value >= threshold.warning) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalQueries || 0}</p>
                <p className="text-xs text-gray-500">+12% from last hour</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p
                  className={`text-2xl font-bold ${getPerformanceColor((stats?.successRate || 0) * 100, { good: 90, warning: 75 })}`}
                >
                  {Math.round((stats?.successRate || 0) * 100)}%
                </p>
                <p className="text-xs text-gray-500">Target: 95%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p
                  className={`text-2xl font-bold ${getPerformanceColor(300 - (stats?.averageResponseTime || 0), { good: 200, warning: 100 })}`}
                >
                  {stats?.averageResponseTime || 0}ms
                </p>
                <p className="text-xs text-gray-500">Target: &lt;200ms</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{formatUptime(stats?.uptime || 0)}</p>
                <p className="text-xs text-gray-500">Since last restart</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Module Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats?.modules || {}).map(([name, module]: [string, any]) => (
              <div key={name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{name}</span>
                    <Badge variant={module.status === "active" ? "default" : "secondary"}>{module.status}</Badge>
                  </div>
                  <span className="text-sm text-gray-600">{module.loadTime}ms load time</span>
                </div>
                <Progress value={module.status === "active" ? 100 : 0} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Memory Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Used Memory</span>
              <span className="text-sm text-gray-600">{stats?.memoryStats?.used || "45MB"}</span>
            </div>
            <Progress value={65} className="h-2" />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Available: {stats?.memoryStats?.available || "955MB"}</span>
              <span>65% used</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
